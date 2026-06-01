import { useEffect, useMemo, useState } from "react";
import Alert from "../components/Alert.jsx";
import { apiRequest } from "../api/client.js";

function emptyForm() {
  return { name: "", sku: "", price: "", quantity_in_stock: "" };
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm());
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isEditing = useMemo(() => editId !== null, [editId]);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/api/products");
      setProducts(data);
    } catch (e) {
      setError(e.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function onEdit(p) {
    setMessage("");
    setError("");
    setEditId(p.id);
    setForm({
      name: p.name,
      sku: p.sku,
      price: String(p.price),
      quantity_in_stock: String(p.quantity_in_stock)
    });
  }

  function reset() {
    setEditId(null);
    setForm(emptyForm());
  }

  function validate() {
    if (!form.name.trim()) return "Product name is required.";
    if (!form.sku.trim()) return "SKU/code is required.";
    const price = Number(form.price);
    if (!Number.isFinite(price) || price <= 0) return "Price must be greater than 0.";
    const qty = Number(form.quantity_in_stock);
    if (!Number.isInteger(qty) || qty < 0) return "Quantity must be a non-negative integer.";
    return "";
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: form.price,
      quantity_in_stock: Number(form.quantity_in_stock)
    };

    try {
      if (isEditing) {
        await apiRequest(`/api/products/${editId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
        setMessage("Product updated.");
      } else {
        await apiRequest("/api/products", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        setMessage("Product created.");
      }
      reset();
      await refresh();
    } catch (e2) {
      setError(e2.message || "Operation failed.");
    }
  }

  async function onDelete(id) {
    setMessage("");
    setError("");
    try {
      await apiRequest(`/api/products/${id}`, { method: "DELETE" });
      setMessage("Product deleted.");
      await refresh();
    } catch (e) {
      setError(e.message || "Delete failed.");
    }
  }

  return (
    <div className="page">
      <h1>Products</h1>
      <Alert type="success" message={message} />
      <Alert type="error" message={error} />

      <div className="card">
        <div className="card-title">{isEditing ? "Update Product" : "Add Product"}</div>
        <form className="form" onSubmit={onSubmit}>
          <div className="form-row">
            <label>Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Product name"
            />
          </div>
          <div className="form-row">
            <label>SKU/Code</label>
            <input
              value={form.sku}
              onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
              placeholder="SKU"
            />
          </div>
          <div className="form-row">
            <label>Price</label>
            <input
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              placeholder="e.g. 19.99"
              inputMode="decimal"
            />
          </div>
          <div className="form-row">
            <label>Quantity</label>
            <input
              value={form.quantity_in_stock}
              onChange={(e) => setForm((f) => ({ ...f, quantity_in_stock: e.target.value }))}
              placeholder="e.g. 10"
              inputMode="numeric"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn primary">
              {isEditing ? "Update" : "Create"}
            </button>
            {isEditing ? (
              <button type="button" className="btn" onClick={reset}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-title">Product List</div>
        {loading ? (
          <div>Loading...</div>
        ) : products.length === 0 ? (
          <div className="muted">No products yet.</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.name}</td>
                    <td>{p.sku}</td>
                    <td>{p.price}</td>
                    <td>{p.quantity_in_stock}</td>
                    <td className="actions">
                      <button className="btn" onClick={() => onEdit(p)}>
                        Edit
                      </button>
                      <button className="btn danger" onClick={() => onDelete(p.id)}>
                        Delete
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

