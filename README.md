# Ethara AI Assignment 1
Inventory & Orders app with a React (Vite) frontend and a FastAPI backend.

## Submission Links
- GitHub repository: https://github.com/babudan/ethara-assignment.git
- Docker Hub backend image: https://hub.docker.com/repository/docker/lucifer12345/ethara-ai-assignment-1-backend

- Live frontend URL: https://ethara-assignment-dfrj.vercel.app
- Live backend API URL: https://ethara-assignment-six.vercel.app

## Project Structure
- `frontend/` — Vite + React UI
- `backend/` — FastAPI + SQLAlchemy API

## Backend
### Environment Variables
Backend config is loaded from environment variables (and `backend/.env` for local).

**Required / Used**
- `DATABASE_URL`
  - Example (Render / hosted Postgres):
    - `postgresql+psycopg://ethara_postgrae_db_user:YOUR_PASSWORD@dpg-xxxx.oregon-postgres.render.com/ethara_postgrae_db`
  - Example (Docker Compose Postgres):
    - `postgresql+psycopg://postgres:postgres@db:5432/inventory`
- `CORS_ORIGINS`
  - Example (local + deployed):
    - `http://localhost:5173,https://ethara-assignment-dfrj.vercel.app`

**Optional**
- `AUTO_CREATE_TABLES` (default: `true`)
  - Example:
    - `true`
- `LOW_STOCK_THRESHOLD` (default: `5`)
  - Example:
    - `5`

**Docker Compose only (used by `docker-compose.yml`)**
- `POSTGRES_USER`
  - Example:
    - `postgres`
- `POSTGRES_PASSWORD`
  - Example:
    - `postgres`
- `POSTGRES_DB`
  - Example:
    - `inventory`

### Run Locally (without Docker)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

Backend will run at:
- `http://localhost:8000`

### Run Locally (Docker Compose)
From the repository root:
```bash
docker compose up --build
```

### API Endpoints
The backend mounts routes under `/api` (preferred). A `/health` endpoint is also available.

- `GET /health` — health check

**Products**
- `GET /api/products` — list products
- `POST /api/products` — create product
- `GET /api/products/{product_id}` — get product
- `PUT /api/products/{product_id}` — update product
- `DELETE /api/products/{product_id}` — delete product

**Customers**
- `GET /api/customers` — list customers
- `POST /api/customers` — create customer
- `GET /api/customers/{customer_id}` — get customer
- `DELETE /api/customers/{customer_id}` — delete customer

**Orders**
- `GET /api/orders` — list orders
- `POST /api/orders` — create order
- `GET /api/orders/{order_id}` — get order
- `DELETE /api/orders/{order_id}` — cancel/delete order

**Stats**
- `GET /api/stats` — dashboard stats + low-stock products

## Frontend
### Environment Variables
Frontend config is loaded from `frontend/.env` (local) and Vercel environment variables (deploy).

- `VITE_API_BASE_URL`
  - Must be the backend origin only (no trailing `/api`)
  - Examples:
    - Local backend: `http://localhost:8000`
    - Vercel backend: `https://<your-backend>.vercel.app`

### Run Locally
```bash
cd frontend
npm install
npm run dev
```

Frontend will run at:
- `http://localhost:5173`

### Build for Production
```bash
cd frontend
npm run build
npm run preview
```