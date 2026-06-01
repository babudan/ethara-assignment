import { useEffect, useState } from "react";
import Alert from "../components/Alert.jsx";
import { apiRequest } from "../api/client.js";

function emptyForm() {
  return { full_name: "", email: "", phone_number: "" };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm());
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/api/customers");
      setCustomers(data);
    } catch (e) {
      setError(e.message || "Failed to load customers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function validate() {
    if (!form.full_name.trim()) return "Full name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!form.phone_number.trim()) return "Phone number is required.";
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

    try {
      await apiRequest("/api/customers", {
        method: "POST",
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          phone_number: form.phone_number.trim()
        })
      });
      setForm(emptyForm());
      setMessage("Customer created.");
      await refresh();
    } catch (e2) {
      setError(e2.message || "Create failed.");
    }
  }

  async function onDelete(id) {
    setMessage("");
    setError("");
    try {
      await apiRequest(`/api/customers/${id}`, { method: "DELETE" });
      setMessage("Customer deleted.");
      await refresh();
    } catch (e) {
      setError(e.message || "Delete failed.");
    }
  }

  return (
    <div className="page">
      <h1>Customers</h1>
      <Alert type="success" message={message} />
      <Alert type="error" message={error} />

      <div className="card">
        <div className="card-title">Add Customer</div>
        <form className="form" onSubmit={onSubmit}>
          <div className="form-row">
            <label>Full Name</label>
            <input
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              placeholder="Customer name"
            />
          </div>
          <div className="form-row">
            <label>Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="email@example.com"
              inputMode="email"
            />
          </div>
          <div className="form-row">
            <label>Phone Number</label>
            <input
              value={form.phone_number}
              onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
              placeholder="Phone"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn primary">
              Create
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-title">Customer List</div>
        {loading ? (
          <div>Loading...</div>
        ) : customers.length === 0 ? (
          <div className="muted">No customers yet.</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.full_name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone_number}</td>
                    <td className="actions">
                      <button className="btn danger" onClick={() => onDelete(c.id)}>
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

