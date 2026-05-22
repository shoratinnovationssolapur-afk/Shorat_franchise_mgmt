#!/bin/bash
set -e

echo "Starting Gunicorn..."

exec gunicorn backend_project.wsgi:application \
  --bind 0.0.0.0:$PORT \
  --workers 2 \
  --timeout 120
