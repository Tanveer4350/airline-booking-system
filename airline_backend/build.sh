#!/usr/bin/env bash
# Exit on error
set -o errexit

# Build frontend if node is present
if command -v npm &> /dev/null; then
  echo "Building frontend from airline-frontend..."
  cd ../airline-frontend
  npm install
  npm run build
  cd ../airline_backend
fi

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
python manage.py create_initial_superuser
python manage.py seed_data --days 30 --clear
