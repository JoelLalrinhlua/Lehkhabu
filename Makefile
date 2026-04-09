.PHONY: install dev

install:
	cd frontend-user && npm install
	cd frontend-admin && npm install
	cd shared && npm install
	cd backend-api && pip install -r requirements.txt
	cd backend-ai && pip install -r requirements.txt

dev-user:
	cd frontend-user && npm run dev

dev-admin:
	cd frontend-admin && npm run dev

dev-api:
	cd backend-api && uvicorn main:app --reload --port 8000

dev-worker:
	cd backend-api && celery -A app.worker.celery_app worker --loglevel=info

dev-ai:
	cd backend-ai && uvicorn main:app --reload --port 8001

dev:
	make dev-user & make dev-admin & make dev-api & make dev-worker