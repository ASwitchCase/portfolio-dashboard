import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { listResource } from "../api/client";
import { resources } from "../resources/definitions";

export default function DashboardHome() {
  const { token } = useAuth();
  const [counts, setCounts] = useState({});

  useEffect(() => {
    let cancelled = false;
    resources.forEach((resource) => {
      listResource(resource.path, token)
        .then((data) => {
          if (!cancelled) setCounts((prev) => ({ ...prev, [resource.key]: data.length }));
        })
        .catch(() => {
          if (!cancelled) setCounts((prev) => ({ ...prev, [resource.key]: "—" }));
        });
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div>
      <div className="page-header">
        <h1>Overview</h1>
      </div>
      <div className="card-grid">
        {resources.map((resource) => (
          <Link key={resource.key} to={`/${resource.key}`} className="stat-card">
            <span className="stat-value">{counts[resource.key] ?? "…"}</span>
            <span className="stat-label">{resource.labelPlural}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
