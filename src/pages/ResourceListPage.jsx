import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Plus, Pencil, Eye, Trash2 } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { deleteResource, listResource } from "../api/client";
import { resourcesByKey } from "../resources/definitions";

export default function ResourceListPage() {
  const { resourceKey } = useParams();
  const resource = resourcesByKey[resourceKey];
  const { token } = useAuth();

  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    if (!resource) return;
    setStatus("loading");
    setError(null);
    try {
      const data = await listResource(resource.path, token);
      setItems(data);
      setStatus("ready");
    } catch (err) {
      setError(err.message || "Failed to load data.");
      setStatus("error");
    }
  }, [resource, token]);

  useEffect(() => {
    load();
  }, [load]);

  if (!resource) return <Navigate to="/" replace />;

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete this ${resource.label.toLowerCase()}? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteResource(`${resource.path}/${id}`, token);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>{resource.labelPlural}</h1>
        {resource.supportsCreate && (
          <Link to={`/${resource.key}/new`} className="button button-primary">
            <Plus size={16} />
            New {resource.label}
          </Link>
        )}
      </div>

      {status === "loading" && <p className="muted">Loading…</p>}
      {status === "error" && <p className="form-error">{error}</p>}

      {status === "ready" && items.length === 0 && <p className="muted">No {resource.labelPlural.toLowerCase()} yet.</p>}

      {status === "ready" && items.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              {resource.columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                {resource.columns.map((col) => (
                  <td key={col.key}>{col.render ? col.render(item) : (item[col.key] ?? "—")}</td>
                ))}
                <td className="actions-col">
                  <Link to={`/${resource.key}/${item.id}`} className="icon-button" title={resource.supportsUpdate ? "Edit" : "View"}>
                    {resource.supportsUpdate ? <Pencil size={16} /> : <Eye size={16} />}
                  </Link>
                  {resource.supportsDelete && (
                    <button
                      type="button"
                      className="icon-button icon-button-danger"
                      title="Delete"
                      disabled={deletingId === item.id}
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
