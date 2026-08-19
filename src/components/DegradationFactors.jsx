import { useEffect, useState } from "react";

function DegradationFactors() {
  const [batteryData, setBatteryData] = useState(null);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem("batteryData");

      if (savedData) {
        setBatteryData(JSON.parse(savedData));
      }
    } catch (error) {
      console.error("Error loading degradation data:", error);
    }
  }, []);

  const data = batteryData || {
    maximumTemperature: 41,
    maximumCurrent: 0,
    lifetimeCycles: 742,
    maximumCellVoltageDelta: 51.2,
  };

  /*
   * These are frontend indicators based on the available CSV data.
   * They are NOT the official backend degradation percentages.
   */

  const temperatureContribution =
    data.maximumTemperature >= 40 ? 36 : 20;

  const fastChargingContribution =
    data.maximumCurrent >= 80 ? 28 : 15;

  const cycleContribution =
    data.lifetimeCycles >= 700
      ? 22
      : data.lifetimeCycles >= 400
      ? 15
      : 10;

  const imbalanceContribution =
    data.maximumCellVoltageDelta >= 50
      ? 14
      : data.maximumCellVoltageDelta >= 30
      ? 10
      : 5;

  return (
    <div className="degradation-factors">

      {/* Degradation Indicator */}
      <div className="degradation-rate">

        <span>
          Degradation Indicator
        </span>

        <strong>
          {data.maximumTemperature >= 40 ||
          data.maximumCellVoltageDelta >= 50
            ? "Moderate"
            : "Low"}
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