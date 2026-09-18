import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { createResource, getResource, listResource, updateResource } from "../api/client";
import { resourcesByKey } from "../resources/definitions";
import { formatDateTime } from "../lib/dates";

export default function ResourceFormPage() {
  const { resourceKey, id } = useParams();
  const resource = resourcesByKey[resourceKey];
  const { token } = useAuth();
  const navigate = useNavigate();

  const isNew = id === "new";
  const editable = isNew || resource?.supportsUpdate;

  const [values, setValues] = useState(() => resource?.toFormValues(null) ?? {});
  const [item, setItem] = useState(null);
  const [status, setStatus] = useState(isNew ? "ready" : "loading");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [availableSkills, setAvailableSkills] = useState([]);

  const needsSkillOptions = useMemo(() => resource?.fields.some((f) => f.type === "skills"), [resource]);

  useEffect(() => {
    if (!resource) return;
    if (!isNew) {
      setStatus("loading");
      getResource(`${resource.path}/${id}`, token)
        .then((data) => {
          setItem(data);
          setValues(resource.toFormValues(data));
          setStatus("ready");
        })
        .catch((err) => {
          setError(err.message || "Failed to load record.");
          setStatus("error");
        });
    }
  }, [resource, id, isNew, token]);

  useEffect(() => {
    if (!needsSkillOptions) return;
    listResource("/api/skills", token).then(setAvailableSkills).catch(() => setAvailableSkills([]));
  }, [needsSkillOptions, token]);

  if (!resource) return <Navigate to="/" replace />;

  const updateField = (name, value) => setValues((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body = resource.toRequestBody(values);
      if (isNew) {
        const created = await createResource(resource.path, body, token);
        navigate(`/${resource.key}`);
        return created;
      }
      await updateResource(`${resource.path}/${id}`, body, token);
      navigate(`/${resource.key}`);
    } catch (err) {
      setError(err.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") return <p className="muted">Loading…</p>;
  if (status === "error") return <p className="form-error">{error}</p>;

  return (
    <div>
      <div className="page-header">
        <h1>
          {isNew ? `New ${resource.label}` : editable ? `Edit ${resource.label}` : resource.label}
        </h1>
      </div>

      {!editable && item && (
        <p className="muted">
          {resource.label} records can't be edited via the API — this is a read-only view. Received{" "}
          {formatDateTime(item.createdAt)}.
        </p>
      )}

      <form className="record-form" onSubmit={editable ? handleSubmit : (e) => e.preventDefault()}>
        {resource.fields.map((field) => (
          <FormField
            key={field.name}
            field={field}
            value={values[field.name]}
            onChange={(v) => updateField(field.name, v)}
            disabled={!editable || saving}
            availableSkills={availableSkills}
          />
        ))}

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="button" onClick={() => navigate(`/${resource.key}`)}>
            Back
          </button>
          {editable && (
            <button type="submit" className="button button-primary" disabled={saving}>
              {saving ? "Saving…" : isNew ? "Create" : "Save changes"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function FormField({ field, value, onChange, disabled, availableSkills }) {
  const { name, label, type, required, maxLength } = field;

  if (type === "textarea") {
    return (
      <div className="form-field">
        <label htmlFor={name}>{label}</label>
        <textarea
          id={name}
          required={required}
          maxLength={maxLength}
          value={value ?? ""}
          disabled={disabled}
          rows={4}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  if (type === "date") {
    const hasToggle = Boolean(field.currentToggleLabel);
    const isCurrent = hasToggle && !value;
    return (
      <div className="form-field">
        <label htmlFor={name}>{label}</label>
        <input
          id={name}
          type="date"
          required={required}
          value={value ?? ""}
          disabled={disabled || (hasToggle && isCurrent)}
          onChange={(e) => onChange(e.target.value)}
        />
        {hasToggle && (
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isCurrent}
              disabled={disabled}
              onChange={(e) => onChange(e.target.checked ? "" : value || "")}
            />
            {field.currentToggleLabel}
          </label>
        )}
      </div>
    );
  }

  if (type === "skills") {
    const selected = new Set(value ?? []);
    const toggle = (skillId) => {
      const next = new Set(selected);
      if (next.has(skillId)) next.delete(skillId);
      else next.add(skillId);
      onChange(Array.from(next));
    };
    return (
      <div className="form-field">
        <label>{label}</label>
        {availableSkills.length === 0 && <p className="muted">No skills yet — create some first to link them here.</p>}
        <div className="skill-chips">
          {availableSkills.map((skill) => (
            <label key={skill.id} className={`skill-chip ${selected.has(skill.id) ? "selected" : ""}`}>
              <input
                type="checkbox"
                checked={selected.has(skill.id)}
                disabled={disabled}
                onChange={() => toggle(skill.id)}
              />
              {skill.name}
            </label>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        type={type}
        required={required}
        maxLength={maxLength}
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
