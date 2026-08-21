function StatCard({ title, value, unit, status }) {
  return (
    <div className="stat-card glass-panel">
      <p>{title}</p>

      <h2>
        {value}
        {unit && <span className="stat-unit"> {unit}</span>}
      </h2>

      {status && <span className="status good">{status}</span>}
    </div>
  )
}

export default StatCard