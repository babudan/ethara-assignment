from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.customer import Customer
from app.models.order import Order
from app.models.product import Product


router = APIRouter(prefix="/stats")


@router.get("")
def get_stats(db: Session = Depends(get_db)) -> dict:
    total_products = db.scalar(select(func.count(Product.id))) or 0
    total_customers = db.scalar(select(func.count(Customer.id))) or 0
    total_orders = db.scalar(select(func.count(Order.id))) or 0

    low_stock_products = list(
        db.scalars(
            select(Product)
            .where(Product.quantity_in_stock <= settings.low_stock_threshold)
            .order_by(Product.quantity_in_stock.asc(), Product.id.asc())
        )
    )

    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "low_stock_threshold": settings.low_stock_threshold,
        "low_stock_products": [
            {
                "id": p.id,
                "name": p.name,
                "sku": p.sku,
                "price": str(p.price),
                "quantity_in_stock": p.quantity_in_stock,
            }
            for p in low_stock_products
        ],
    }

