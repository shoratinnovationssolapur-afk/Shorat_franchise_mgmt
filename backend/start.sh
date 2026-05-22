#!/bin/bash
set -e

echo "Starting Gunicorn..."

python manage.py migrate --noinput
python create_superuser.py

exec gunicorn backend_project.wsgi:application \
  --bind 0.0.0.0:$PORT \
  --workers 2 \
  --timeout 120
