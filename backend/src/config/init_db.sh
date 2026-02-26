#!/bin/bash


docker exec -i ai_postgres psql -U admin -d ai_assistant < ./create_tables.sql

echo "Tables created successfully."