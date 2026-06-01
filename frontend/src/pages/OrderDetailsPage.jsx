import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Alert from "../components/Alert.jsx";
import { apiRequest } from "../api/client.js";

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setError("");
    apiRequest(`/api/orders/${orderId}`)
      .then((data) => {
        if (active) setOrder(data);
      })
      .catch((e) => {
        if (active) setError(e.message || "Failed to load order.");
      });
    return () => {
      active = false;
    };
  }, [orderId]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Order #{orderId}</h1>
        <Link className="btn" to="/orders">
          Back
        </Link>
      </div>

      <Alert type="error" message={error} />

      {!order ? (
        <div className="card">Loading...</div>
      ) : (
        <div className="card">
          <div className="kv">
            <div className="k">Customer ID</div>
            <div className="v">{order.customer_id}</div>
            <div className="k">Total</div>
            <div className="v">{order.total_amount}</div>
          </div>

          <div className="card-subtitle">Items</div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it) => (
                  <tr key={it.id}>
                    <td>{it.id}</td>
                    <td>{it.product_id}</td>
                    <td>{it.quantity}</td>
                    <td>{it.unit_price}</td>
                    <td>{it.line_total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

