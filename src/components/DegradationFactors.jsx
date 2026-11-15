import { useEffect, useState } from "react";

function DegradationFactors({ batteryData: propData }) {
  const [batteryData, setBatteryData] = useState(propData || null);

  useEffect(() => {
    if (propData !== undefined) {
      setBatteryData(propData);
      return;
    }
    try {
      const savedData = localStorage.getItem("batteryData");
      if (savedData) {
        setBatteryData(JSON.parse(savedData));
      } else {
        setBatteryData(null);
      }
    } catch (error) {
      console.error("Error loading degradation data:", error);
    }
  }, [propData]);

  const hasData = !!batteryData;

  const data = hasData ? batteryData : {
    maximumTemperature: 0,
    maximumCurrent: 0,
    lifetimeCycles: 0,
    maximumCellVoltageDelta: 0,
  };

  /*
   * These are frontend indicators based on the available CSV data.
   * If no CSV is uploaded, contributions remain at 0%.
   */

  const temperatureContribution = !hasData
    ? 0
    : data.maximumTemperature >= 40 ? 36 : 20;

  const fastChargingContribution = !hasData
    ? 0
    : data.maximumCurrent >= 80 ? 28 : 15;

  const cycleContribution = !hasData
    ? 0
    : data.lifetimeCycles >= 700
      ? 22
      : data.lifetimeCycles >= 400
        ? 15
        : 10;

  const imbalanceContribution = !hasData
    ? 0
    : data.maximumCellVoltageDelta >= 50
      ? 14
      : data.maximumCellVoltageDelta >= 30
        ? 10
        : 5;

  const degradationTag = !hasData
    ? "0% (No Data)"
    : (data.maximumTemperature >= 40 || data.maximumCellVoltageDelta >= 50
        ? "Moderate"
        : "Low");

  return (
    <div className="degradation-factors glass-panel">

      {/* Degradation Indicator */}
      <div className="degradation-rate">

        <span>
          Degradation Indicator
        </span>

        <strong>
          {degradationTag}
        </strong>

      </div>


      <h3>
        Primary Degradation Factors
      </h3>


      {/* Temperature */}
      <div className="factor">

        <div>
          <span>
            High Temperature
          </span>

          <small>
            {temperatureContribution}% contribution
          </small>
        </div>

        <div className="factor-bar">

          <div
            className="factor-fill"
            style={{
              width: `${temperatureContribution}%`,
            }}
          />

        </div>

      </div>


      {/* Fast Charging */}
      <div className="factor">

        <div>
          <span>
            Fast Charging
          </span>

          <small>
            {fastChargingContribution}% contribution
          </small>
        </div>

        <div className="factor-bar">

          <div
            className="factor-fill"
            style={{
              width: `${fastChargingContribution}%`,
            }}
          />

        </div>

      </div>


      {/* Charging Cycles */}
      <div className="factor">

        <div>
          <span>
            Charging Cycles
          </span>

          <small>
            {cycleContribution}% contribution
          </small>
        </div>

        <div className="factor-bar">

          <div
            className="factor-fill"
            style={{
              width: `${cycleContribution}%`,
            }}
          />

        </div>

      </div>


      {/* Cell Imbalance */}
      <div className="factor">

        <div>
          <span>
            Cell Imbalance
          </span>

          <small>
            {imbalanceContribution}% contribution
          </small>
        </div>

        <div className="factor-bar">

          <div
            className="factor-fill"
            style={{
              width: `${imbalanceContribution}%`,
            }}
          />

        </div>

      </div>

    </div>
  );
}

export default DegradationFactors;