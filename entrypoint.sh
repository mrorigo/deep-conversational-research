#!/bin/sh
# entrypoint.sh

# Default command
CMD="node index.js"

# Add arguments from environment variables if they exist
if [ -n "$AGENTS" ]; then
  CMD="$CMD --agents $AGENTS"
fi

if [ -n "$GROUPS" ]; then
  CMD="$CMD --groups $GROUPS"
fi

if [ -n "$MODELS" ]; then
  CMD="$CMD --models $MODELS"
fi

if [ -n "$RESEARCHMODEL" ]; then
  CMD="$CMD --researchModel $RESEARCHMODEL"
fi

if [ -n "$ENABLEREASEARCH" ]; then
  CMD="$CMD --enableResearch"
fi

if [ -n "$RESEARCHBREADTH" ]; then
  CMD="$CMD --researchBreadth $RESEARCHBREADTH"
fi

if [ -n "$RESEARCHDEPTH" ]; then
  CMD="$CMD --researchDepth $RESEARCHDEPTH"
fi

if [ -n "$ROUNDS" ]; then
  CMD="$CMD --rounds $ROUNDS"
fi

if [ -n "$STEPS" ]; then
  CMD="$CMD --steps $STEPS"
fi

if [ -n "$TEXT" ]; then
  CMD="$CMD -t \"$TEXT\""
fi

# Trap SIGINT (Ctrl+C) and SIGTERM (termination signal)
trap "echo 'Received signal, cleaning up...'; kill -INT \"\${!}\"; exit 130" SIGINT SIGTERM

# Execute the command in the background
echo "Executing: $CMD"
$CMD &

# Wait for the command to finish
wait $!

# Exit with the same status code as the command
exit $?
