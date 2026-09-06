#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "=== Building React Frontend ==="
cd airline-frontend
npm install
npm run build
cd ..

echo "=== Building Django Backend ==="
cd airline_backend
pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
python manage.py create_initial_superuser
python manage.py seed_data --days 7
cd ..
