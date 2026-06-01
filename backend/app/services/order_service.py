from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.customer import Customer
from app.models.order import Order, OrderItem
from app.models.product import Product


def create_order(db: Session, *, customer_id: int, items: list[dict]) -> Order:
    product_ids = [int(i["product_id"]) for i in items]
    if len(set(product_ids)) != len(product_ids):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Duplicate product in order items.")

    with db.begin():
        customer = db.get(Customer, customer_id)
        if not customer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found.")

        products = list(
            db.scalars(select(Product).where(Product.id.in_(product_ids)).with_for_update())
        )
        product_by_id = {p.id: p for p in products}
        if len(product_by_id) != len(product_ids):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="One or more products not found.")

        order = Order(customer_id=customer_id, total_amount=Decimal("0.00"))
        db.add(order)
        db.flush()
        order_id = order.id

        total = Decimal("0.00")
        order_items: list[OrderItem] = []

        for item in items:
            product_id = int(item["product_id"])
            quantity = int(item["quantity"])
            if quantity <= 0:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quantity must be greater than 0.")

            product = product_by_id[product_id]
            if product.quantity_in_stock < quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient inventory for product_id={product_id}.",
                )

            product.quantity_in_stock -= quantity

            unit_price = product.price
            line_total = (unit_price * quantity).quantize(Decimal("0.01"))
            total += line_total

            order_item = OrderItem(
                order_id=order.id,
                product_id=product_id,
                quantity=quantity,
                unit_price=unit_price,
                line_total=line_total,
            )
            order_items.append(order_item)

        order.total_amount = total.quantize(Decimal("0.01"))
        db.add_all(order_items)

    return db.scalar(
        select(Order)
        .where(Order.id == order_id)
        .options(selectinload(Order.items))
    )


def delete_order(db: Session, *, order_id: int) -> None:
    with db.begin():
        order = db.scalar(
            select(Order)
            .where(Order.id == order_id)
            .options(selectinload(Order.items))
        )
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")

        product_ids = [item.product_id for item in order.items]

        products = list(
            db.scalars(select(Product).where(Product.id.in_(product_ids)).with_for_update())
        )
        product_by_id = {p.id: p for p in products}

        for item in order.items:
            product = product_by_id.get(item.product_id)
            if product:
                product.quantity_in_stock += item.quantity

        db.delete(order)
