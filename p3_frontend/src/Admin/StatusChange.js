import { useState, useEffect } from "react";
import './StatusChange.css'
import apiService from './Services';

const STATUS_META = {
  "Pending": { dot: "#888780", bg: "#F1EFE8", color: "#444441" },
  "Payment Verified": { dot: "#1D9E75", bg: "#E1F5EE", color: "#085041" },
  "Processing": { dot: "#EF9F27", bg: "#FAEEDA", color: "#633806" },
  "Printed": { dot: "#378ADD", bg: "#E6F1FB", color: "#0C447C" },
  "Shipped": { dot: "#7F77DD", bg: "#EEEDFE", color: "#3C3489" },
  "Completed": { dot: "#639922", bg: "#EAF3DE", color: "#27500A" },
  "Cancelled": { dot: "#E24B4A", bg: "#FCEBEB", color: "#791F1F" },
};

function StatusBadge({ value }) {
  const m = STATUS_META[value];
  if (!m) return <span>{value}</span>;
  return (
    <span
      className="ms-status-badge"
      style={{ background: m.bg, color: m.color }}
    >
      <span className="ms-status-dot" style={{ background: m.dot }} />
      {value}
    </span>
  );
}

function StatusChange({ col, value, error, id, fetchData }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(value ?? "");

  useEffect(() => {
    if (open) setPending(value ?? "");
  }, [open]);

  const confirm = async () => {
    try {
      await apiService.orders.updateStatus(id, pending);
      await fetchData();
      setOpen(false);
    } catch (err) {
      alert(`Error updating status. Please try again.`);
      console.error('Error saving:', err);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={[
          "form-input",
          "modal-select-trigger",
          open ? "open" : "",
          //   error ? "error" : "",
        ].join(" ")}
      >
        {value
          ? <StatusBadge value={value} />
          : <span style={{ color: "var(--color-text-tertiary)" }}>
            -- Select {col.label} --
          </span>
        }
        <span className="ms-arrow">▾</span>
      </button>

      {open && (
        <div
          className="ms-backdrop"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="ms-modal">
            <div className="ms-modal-header">Order status</div>

            <div className="ms-list">
              {col.options.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => setPending(opt.value)}
                  className={`ms-option ${pending === opt.value ? "selected" : ""}`}
                >
                  <StatusBadge value={opt.value} />
                  {pending === opt.value && (
                    <span className="ms-check"></span>
                  )}
                </div>
              ))}
            </div>

            <div className="ms-footer">
              <button type="button" className="ms-btn" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="button" className="ms-btn primary" onClick={confirm}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default StatusChange;