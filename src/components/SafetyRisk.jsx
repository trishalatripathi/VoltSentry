function SafetyRisk() {
  return (
    <div className="safety-risk">
      <h2>Safety Risk</h2>

      <div className="risk-item">
        <span>🔥 Thermal Risk</span>
        <span className="risk-low">Low</span>
      </div>

      <div className="risk-item">
        <span>⚡ Electrical Risk</span>
        <span className="risk-low">Low</span>
      </div>

      <div className="risk-item">
        <span>🔌 Charging Risk</span>
        <span className="risk-medium">Medium</span>
      </div>

      <div className="risk-item">
        <span>⚖️ Cell Imbalance</span>
        <span className="risk-low">Low</span>
      </div>
    </div>
  )
}

export default SafetyRisk