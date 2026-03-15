up-dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

up-prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

down-dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml down

down-prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml down