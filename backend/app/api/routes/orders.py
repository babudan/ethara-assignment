from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.models.order import Order
from app.schemas.order import OrderCreate, OrderOut
from app.services.order_service import create_order, delete_order


router = APIRouter(prefix="/orders")


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order_endpoint(payload: OrderCreate, db: Session = Depends(get_db)) -> Order:
    order = create_order(
        db,
        customer_id=payload.customer_id,
        items=[item.model_dump() for item in payload.items],
    )
    return order


@router.get("", response_model=list[OrderOut])
def list_orders(db: Session = Depends(get_db)) -> list[Order]:
    return list(
        db.scalars(select(Order).options(selectinload(Order.items)).order_by(Order.id))
    )


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)) -> Order:
    order = db.scalar(
        select(Order).where(Order.id == order_id).options(selectinload(Order.items))
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
    return order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order_endpoint(order_id: int, db: Session = Depends(get_db)) -> Response:
    delete_order(db, order_id=order_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

