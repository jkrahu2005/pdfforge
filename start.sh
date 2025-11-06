#!/bin/bash
# Start your application - adjust based on your tech stack

# If you have a Node.js backend
cd Backend && npm start &

# If you have a frontend that needs serving
cd Frontend && npm run build && npx serve -s build &

# Wait for any process to exit
wait