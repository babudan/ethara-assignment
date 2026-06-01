import { useEffect, useState } from "react";
import Alert from "../components/Alert.jsx";
import { apiRequest } from "../api/client.js";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest("/api/stats")
      .then((data) => {
        if (active) setStats(data);
      })
      .catch((e) => {
        if (active) setError(e.message || "Failed to load stats.");
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <Alert type="error" message={error} />

      {!stats ? (
        <div className="card">Loading...</div>
      ) : (
        <>
          <div className="grid">
            <div className="card">
              <div className="card-title">Total Products</div>
              <div className="card-value">{stats.total_products}</div>
            </div>
            <div className="card">
              <div className="card-title">Total Customers</div>
              <div className="card-value">{stats.total_customers}</div>
            </div>
            <div className="card">
              <div className="card-title">Total Orders</div>
              <div className="card-value">{stats.total_orders}</div>
            </div>
            <div className="card">
              <div className="card-title">Low Stock Threshold</div>
              <div className="card-value">{stats.low_stock_threshold}</div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Low Stock Products</div>
            {stats.low_stock_products.length === 0 ? (
              <div className="muted">No low stock products.</div>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>SKU</th>
                      <th>Qty</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.low_stock_products.map((p) => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.name}</td>
                        <td>{p.sku}</td>
                        <td>{p.quantity_in_stock}</td>
                        <td>{p.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

