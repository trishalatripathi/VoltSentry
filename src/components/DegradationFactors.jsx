import { useMemo } from "react";

function loadBatteryData() {
  try {
    const savedData = localStorage.getItem("batteryData");
    return savedData ? JSON.parse(savedData) : null;
  } catch (error) {
    console.error("Error loading battery condition data:", error);
    return null;
  }
}

function displayValue(value, unit = "") {
  return value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
    ? "Unavailable"
    : `${value}${unit}`;
}

function DegradationFactors({ batteryData: propData }) {
  const batteryData = useMemo(() => {
    if (propData !== undefined) return propData;
    return loadBatteryData();
  }, [propData]);

  const hasData = !!batteryData;

  const conditions = [
    [
      "Maximum temperature",
      displayValue(batteryData?.maximumTemperature, " °C"),
    ],
    [
      "Maximum absolute pack current",
      displayValue(batteryData?.maximumCurrent, " A"),
    ],
    [
      "Maximum cell-voltage delta",
      displayValue(batteryData?.maximumCellVoltageDelta, " mV"),
    ],
    [
      "Latest cycle index",
      displayValue(
        batteryData?.latestCycle ?? batteryData?.lifetimeCycles,
      ),
    ],
  ];

  const maxTemp = Number(batteryData?.maximumTemperature) || 0;
  const maxCurr = Number(batteryData?.maximumCurrent) || 0;
  const cycles = Number(batteryData?.lifetimeCycles ?? batteryData?.latestCycle) || 0;
  const maxDelta = Number(batteryData?.maximumCellVoltageDelta) || 0;

  const temperatureContribution = !hasData
    ? 0
    : maxTemp >= 40
      ? 36
      : 20;

  const fastChargingContribution = !hasData
    ? 0
    : maxCurr >= 80
      ? 28
      : 15;

  const cycleContribution = !hasData
    ? 0
    : cycles >= 700
      ? 22
      : cycles >= 400
        ? 15
        : 10;

  const imbalanceContribution = !hasData
    ? 0
    : maxDelta >= 50
      ? 14
      : maxDelta >= 30
        ? 10
        : 5;

  const degradationTag = !hasData
    ? "0% (No Data)"
    : maxTemp >= 40 || maxDelta >= 50
      ? "Moderate"
      : "Low";

  return (
    <div className="degradation-factors glass-panel">
      {/* Degradation Indicator */}
      <div className="degradation-rate">
        <span>Degradation Indicator</span>
        <strong>{degradationTag}</strong>
      </div>

      {/* Recorded Battery Conditions */}
      <h3>Recorded Battery Conditions</h3>
      {conditions.map(([label, value]) => (
        <div className="factor" key={label}>
          <div>
            <span>{label}</span>
            <small>{value}</small>
          </div>
        </div>
      ))}

      {/* Primary Degradation Factors */}
      <h3 style={{ marginTop: "16px" }}>Primary Degradation Factors</h3>

      {/* Temperature */}
      <div className="factor">
        <div>
          <span>High Temperature</span>
          <small>{temperatureContribution}% contribution</small>
        </div>
        <div className="factor-bar">
          <div
            className="factor-fill"
            style={{ width: `${temperatureContribution}%` }}
          />
        </div>
      </div>

      {/* Fast Charging */}
      <div className="factor">
        <div>
          <span>Fast Charging</span>
          <small>{fastChargingContribution}% contribution</small>
        </div>
        <div className="factor-bar">
          <div
            className="factor-fill"
            style={{ width: `${fastChargingContribution}%` }}
          />
        </div>
      </div>

      {/* Charging Cycles */}
      <div className="factor">
        <div>
          <span>Charging Cycles</span>
          <small>{cycleContribution}% contribution</small>
        </div>
        <div className="factor-bar">
          <div
            className="factor-fill"
            style={{ width: `${cycleContribution}%` }}
          />
        </div>
      </div>

      {/* Cell Imbalance */}
      <div className="factor">
        <div>
          <span>Cell Imbalance</span>
          <small>{imbalanceContribution}% contribution</small>
        </div>
        <div className="factor-bar">
          <div
            className="factor-fill"
            style={{ width: `${imbalanceContribution}%` }}
          />
        </div>
      </div>

      <p className="unavailable-metric-note">
        These recorded measurements are not degradation percentages or a
        state-of-health estimate.
      </p>
    </div>
  );
}

export default DegradationFactors;
