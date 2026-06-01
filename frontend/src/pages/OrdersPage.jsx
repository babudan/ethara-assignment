import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../components/Alert.jsx";
import { apiRequest } from "../api/client.js";

function newItem() {
  return { product_id: "", quantity: "1" };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState([newItem()]);

  async function refreshAll() {
    setLoading(true);
    setError("");
    try {
      const [o, c, p] = await Promise.all([
        apiRequest("/api/orders"),
        apiRequest("/api/customers"),
        apiRequest("/api/products")
      ]);
      setOrders(o);
      setCustomers(c);
      setProducts(p);
    } catch (e) {
      setError(e.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshAll();
  }, []);

  function validate() {
    if (!customerId) return "Customer is required.";
    if (items.length === 0) return "At least one order item is required.";
    const seen = new Set();
    for (const it of items) {
      const pid = Number(it.product_id);
      if (!Number.isInteger(pid) || pid <= 0) return "Each item must have a valid product.";
      if (seen.has(pid)) return "Duplicate product in order items.";
      seen.add(pid);
      const qty = Number(it.quantity);
      if (!Number.isInteger(qty) || qty <= 0) return "Quantity must be a positive integer.";
    }
    return "";
  }

  async function onCreateOrder(e) {
    e.preventDefault();
    setMessage("");
    setError("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await apiRequest("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          customer_id: Number(customerId),
          items: items.map((it) => ({
            product_id: Number(it.product_id),
            quantity: Number(it.quantity)
          }))
        })
      });
      setMessage("Order created.");
      setCustomerId("");
      setItems([newItem()]);
      await refreshAll();
    } catch (e2) {
      setError(e2.message || "Create order failed.");
    }
  }

  async function onDeleteOrder(orderId) {
    setMessage("");
    setError("");
    try {
      await apiRequest(`/api/orders/${orderId}`, { method: "DELETE" });
      setMessage("Order cancelled and inventory restored.");
      await refreshAll();
    } catch (e) {
      setError(e.message || "Delete failed.");
    }
  }

  function updateItem(index, patch) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, newItem()]);
  }

  function removeItem(index) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="page">
      <h1>Orders</h1>
      <Alert type="success" message={message} />
      <Alert type="error" message={error} />

      <div className="card">
        <div className="card-title">Create Order</div>
        {customers.length === 0 || products.length === 0 ? (
          <div className="muted">Create at least one customer and one product to place an order.</div>
        ) : (
          <form className="form" onSubmit={onCreateOrder}>
            <div className="form-row">
              <label>Customer</label>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="card-subtitle">Items</div>
            {items.map((it, idx) => (
              <div key={idx} className="inline-row">
                <select
                  value={it.product_id}
                  onChange={(e) => updateItem(idx, { product_id: e.target.value })}
                >
                  <option value="">Select product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (SKU {p.sku}, stock {p.quantity_in_stock})
                    </option>
                  ))}
                </select>
                <input
                  value={it.quantity}
                  onChange={(e) => updateItem(idx, { quantity: e.target.value })}
                  inputMode="numeric"
                  placeholder="Qty"
                />
                <button type="button" className="btn" onClick={() => removeItem(idx)} disabled={items.length === 1}>
                  Remove
                </button>
              </div>
            ))}

            <div className="form-actions">
              <button type="button" className="btn" onClick={addItem}>
                Add Item
              </button>
              <button type="submit" className="btn primary">
                Create Order
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="card">
        <div className="card-title">Order List</div>
        {loading ? (
          <div>Loading...</div>
        ) : orders.length === 0 ? (
          <div className="muted">No orders yet.</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link to={`/orders/${o.id}`}>{o.id}</Link>
                    </td>
                    <td>{o.customer_id}</td>
                    <td>{o.items.length}</td>
                    <td>{o.total_amount}</td>
                    <td className="actions">
                      <button className="btn danger" onClick={() => onDeleteOrder(o.id)}>
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

