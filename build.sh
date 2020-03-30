#!/bin/bash -e
cd "$(dirname "$0")"

BUILD_DIR=.build
OPT_HELP=false
OPT_OPT=false
OPT_WATCH=false

# parse args
while [[ $# -gt 0 ]]; do
  case "$1" in
  -h*|--h*)
    OPT_HELP=true
    shift
    ;;
  -w*|--w*)
    OPT_WATCH=true
    shift
    ;;
  -O)
    OPT_OPT=true
    shift
    ;;
  *)
    echo "$0: Unknown option $1" >&2
    OPT_HELP=true
    shift
    ;;
  esac
done
if $OPT_HELP; then
  echo "Usage: $0 [options]"
  echo "Options:"
  echo "  -h   Show help."
  echo "  -O   Build optimized product."
  echo "  -w   Watch source files for changes and rebuild incrementally."
  exit 1
fi

# check esbuild
if ! (which esbuild); then
  esbuild_suffix=wasm
  if [[ "$OSTYPE" == "darwin"* ]]; then
    esbuild_suffix=darwin-64
  elif [[ "$OSTYPE" == "linux"* ]]; then
    esbuild_suffix=linux-64
  elif [[ "$OSTYPE" == "cygwin" ]] || \
       [[ "$OSTYPE" == "msys" ]] || \
       [[ "$OSTYPE" == "win32" ]] || \
       [[ "$OSTYPE" == "win64" ]]
  then
    esbuild_suffix=windows-64
  fi
  echo "esbuild not found in PATH. Please install with:" >&2
  echo "npm install -g esbuild-${esbuild_suffix}" >&2
  exit 1
fi


mkdir -p "$BUILD_DIR"
pushd "$BUILD_DIR" >/dev/null
BUILD_DIR=$PWD
popd >/dev/null


WATCHFILE=$BUILD_DIR/.build.sh.watch


function fn_build_appjs {
  if $OPT_OPT; then
    esbuild --define:DEBUG=false --bundle --sourcemap --minify \
      "--outfile=docs/app.js" src/main.js
  else
    esbuild --define:DEBUG=true --bundle --sourcemap \
      "--outfile=docs/app.js" src/main.js
  fi
}

fn_build_appjs &

if $OPT_WATCH; then
  echo y > "$WATCHFILE"

  # make sure we can ctrl-c in the while loop
  function fn_stop {
    echo n > "$WATCHFILE"
    exit
  }
  trap fn_stop SIGINT

  # make sure background processes are killed when this script is stopped
  pids=()
  function fn_cleanup {
    set +e
    for pid in "${pids[@]}"; do
      kill $pid 2>/dev/null
      wait $pid
      kill -9 $pid 2>/dev/null
      echo n > "$WATCHFILE"
    done
    set -e
  }
  trap fn_cleanup EXIT

  # wait for initial build
  wait

  # fn_watch_other &
  # pids+=( $! )

  while true; do
    fswatch -1 -l 0.2 -r -E --exclude='.+' --include='\.js$' src >/dev/null
    if ! [ -f "$WATCHFILE" ] || [ "$(cat "$WATCHFILE")" != "y" ]; then break; fi
    set +e ; fn_build_appjs ; set -e
  done
else
  wait
fi
