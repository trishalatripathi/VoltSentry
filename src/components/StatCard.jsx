function StatCard({ title, value, unit, status, statusClass = "status good" }) {
  const displayValue = typeof value === "number" && !Number.isInteger(value)
    ? value.toFixed(1)
    : value ?? "Unavailable";

  return (
    <div className="stat-card glass-panel">
      <p>{title}</p>

      <h2>
        {displayValue}
        {unit && value !== null && value !== undefined && (
          <span className="stat-unit"> {unit}</span>
        )}
      </h2>

      {status && <span className={statusClass}>{status}</span>}
    </div>
  )
}

export default StatCard