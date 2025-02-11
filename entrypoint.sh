#!/bin/bash
# entrypoint.sh

CMD=("node" "server.js")

# Trap SIGINT (Ctrl+C) and SIGTERM (termination signal)
trap "echo 'Received signal, cleaning up...'; kill -INT \"${!}\"; exit 130" SIGINT SIGTERM

# Execute the command in the background
echo "Executing: ${CMD[@]}"
"${CMD[@]}" &

# Wait for the command to finish
wait $!

# Exit with the same status code as the command
exit $?
