#!/bin/bash
# entrypoint.sh

# Default command
CMD=("node" "index.js")

# Add arguments from environment variables if they exist
if [ -n "$AGENTS" ]; then
  CMD+=("--agents" "$AGENTS")
fi

if [ -n "$GROUPS" ]; then
  CMD+=("--groups" "$GROUPS")
fi

if [ -n "$MODELS" ]; then
  CMD+=("--models" "$MODELS")
fi

if [ -n "$RESEARCHMODEL" ]; then
  CMD+=("--researchModel" "$RESEARCHMODEL")
fi

if [ -n "$ENABLEREASEARCH" ]; then
  CMD+=("--enableResearch")
fi

if [ -n "$RESEARCHBREADTH" ]; then
  CMD+=("--researchBreadth" "$RESEARCHBREADTH")
fi

if [ -n "$RESEARCHDEPTH" ]; then
  CMD+=("--researchDepth" "$RESEARCHDEPTH")
fi

if [ -n "$ROUNDS" ]; then
  CMD+=("--rounds" "$ROUNDS")
fi

if [ -n "$STEPS" ]; then
  CMD+=("--steps" "$STEPS")
fi

# Properly handle the TEXT variable
if [ -n "$TEXT" ]; then
  CMD+=("-t" "$TEXT")
fi

# Trap SIGINT (Ctrl+C) and SIGTERM (termination signal)
trap "echo 'Received signal, cleaning up...'; kill -INT \"${!}\"; exit 130" SIGINT SIGTERM

# Execute the command in the background
echo "Executing: ${CMD[@]}"
"${CMD[@]}" &

# Wait for the command to finish
wait $!

# Exit with the same status code as the command
exit $?
