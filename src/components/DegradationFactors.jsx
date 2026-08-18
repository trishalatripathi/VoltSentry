function DegradationFactors() {
  return (
    <div className="degradation-factors">
      <div className="degradation-rate">
        <span>Degradation Rate</span>
        <strong>2.4% / year</strong>
      </div>

      <h3>Primary Degradation Factors</h3>

      <div className="factor">
        <div>
          <span>High Temperature</span>
          <small>36% contribution</small>
        </div>
        <div className="factor-bar">
          <div className="factor-fill" style={{ width: "36%" }}></div>
        </div>
      </div>

      <div className="factor">
        <div>
          <span>Fast Charging</span>
          <small>28% contribution</small>
        </div>
        <div className="factor-bar">
          <div className="factor-fill" style={{ width: "28%" }}></div>
        </div>
      </div>

      <div className="factor">
        <div>
          <span>Charging Cycles</span>
          <small>22% contribution</small>
        </div>
        <div className="factor-bar">
          <div className="factor-fill" style={{ width: "22%" }}></div>
        </div>
      </div>

      <div className="factor">
        <div>
          <span>Battery Age</span>
          <small>14% contribution</small>
        </div>
        <div className="factor-bar">
          <div className="factor-fill" style={{ width: "14%" }}></div>
        </div>
      </div>
    </div>
  )
}

export default DegradationFactors