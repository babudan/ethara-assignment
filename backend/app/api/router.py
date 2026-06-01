from fastapi import APIRouter

from app.api.routes.customers import router as customers_router
from app.api.routes.orders import router as orders_router
from app.api.routes.products import router as products_router
from app.api.routes.stats import router as stats_router


api_router = APIRouter()
api_router.include_router(products_router, tags=["products"])
api_router.include_router(customers_router, tags=["customers"])
api_router.include_router(orders_router, tags=["orders"])
api_router.include_router(stats_router, tags=["stats"])

