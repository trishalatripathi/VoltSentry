import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AnalyzeBattery() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    vehicleNumber: "",
    vehicleName: "",
    batteryId: "",
  });

  const [file, setFile] = useState(null);
  const [recordCount, setRecordCount] = useState(0);

  // Store calculated CSV metrics temporarily
  const [batteryMetrics, setBatteryMetrics] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleFileChange(event) {
    const selectedFile = event.target.files[0];

    if (!selectedFile) return;

    setFile(selectedFile);

    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target.result;

      const rows = text
        .trim()
        .split("\n")
        .filter((row) => row.trim() !== "");

      if (rows.length < 2) {
        alert("CSV file does not contain enough data.");
        return;
      }

      // First row = column names
      const headers = rows[0]
        .split(",")
        .map((header) => header.trim());

      // Convert CSV rows into objects
      const data = rows.slice(1).map((row) => {
        const values = row.split(",");
        const obj = {};

        headers.forEach((header, index) => {
          obj[header] = values[index]?.trim();
        });

        return obj;
      });

      console.log("CSV Headers:", headers);
      console.log("CSV Data:", data);

      // --------------------------------
      // Extract battery values
      // --------------------------------

      const temperatures = data
        .map((row) =>
          Number(row["Battery Temperature (C)"])
        )
        .filter((value) => !isNaN(value));

      const currents = data
        .map((row) =>
          Math.abs(Number(row["Pack Current (A)"]))
        )
        .filter((value) => !isNaN(value));

      const cellDeltas = data
        .map((row) =>
          Number(row["Cell Voltage Delta (mV)"])
        )
        .filter((value) => !isNaN(value));

      const cycles = data
        .map((row) =>
          Number(row["Cycle Index"])
        )
        .filter((value) => !isNaN(value));

      const socValues = data
        .map((row) =>
          Number(row["State of Charge (%)"])
        )
        .filter((value) => !isNaN(value));

      // --------------------------------
      // Calculate metrics
      // --------------------------------

      const maximumTemperature =
        temperatures.length > 0
          ? Math.max(...temperatures)
          : 0;

      const averageTemperature =
        temperatures.length > 0
          ? temperatures.reduce((a, b) => a + b, 0) /
          temperatures.length
          : 0;

      const maximumCurrent =
        currents.length > 0
          ? Math.max(...currents)
          : 0;

      const maximumCellVoltageDelta =
        cellDeltas.length > 0
          ? Math.max(...cellDeltas)
          : 0;

      const averageCellVoltageDelta =
        cellDeltas.length > 0
          ? cellDeltas.reduce((a, b) => a + b, 0) /
          cellDeltas.length
          : 0;

      const lifetimeCycles =
        cycles.length > 0
          ? Math.max(...cycles)
          : 0;

      const currentSOC =
        socValues.length > 0
          ? socValues[socValues.length - 1]
          : 0;

      const averageSOC =
        socValues.length > 0
          ? socValues.reduce((a, b) => a + b, 0) /
          socValues.length
          : 0;

      // --------------------------------
      // Safety Risk
      // --------------------------------

      let thermalRisk = "Low";

      if (maximumTemperature >= 45) {
        thermalRisk = "High";
      } else if (maximumTemperature >= 40) {
        thermalRisk = "Medium";
      }

      let electricalRisk = "Low";

      if (maximumCellVoltageDelta >= 80) {
        electricalRisk = "High";
      } else if (maximumCellVoltageDelta >= 50) {
        electricalRisk = "Medium";
      }

      let chargingRisk = "Low";

      if (maximumCurrent >= 120) {
        chargingRisk = "High";
      } else if (maximumCurrent >= 80) {
        chargingRisk = "Medium";
      }

      let cellImbalanceRisk = "Low";

      if (maximumCellVoltageDelta >= 80) {
        cellImbalanceRisk = "High";
      } else if (maximumCellVoltageDelta >= 50) {
        cellImbalanceRisk = "Medium";
      }

      // --------------------------------
      // Calculate SOH
      // --------------------------------

      // Simple estimated SOH based on cell voltage condition.
      // You can replace this later with your actual ML model.

      let currentSOH = 100;

      if (maximumCellVoltageDelta >= 80) {
        currentSOH = 75;
      } else if (maximumCellVoltageDelta >= 50) {
        currentSOH = 82;
      } else if (maximumCellVoltageDelta >= 30) {
        currentSOH = 88;
      } else {
        currentSOH = 92;
      }

      // --------------------------------
      // Store calculated metrics temporarily
      // --------------------------------

      const metrics = {
        recordCount: data.length,

        maximumTemperature,
        averageTemperature,

        maximumCurrent,

        maximumCellVoltageDelta,
        averageCellVoltageDelta,

        lifetimeCycles,

        currentSOC,
        averageSOC,

        currentSOH,

        thermalRisk,
        electricalRisk,
        chargingRisk,
        cellImbalanceRisk,

        rawData: data,
      };

      setBatteryMetrics(metrics);
      setRecordCount(data.length);

      console.log("Calculated Battery Metrics:", metrics);
    };

    reader.readAsText(selectedFile);
  }

  function handleSubmit(event) {
    event.preventDefault();

    // Check vehicle information
    if (
      !formData.vehicleNumber.trim() ||
      !formData.vehicleName.trim() ||
      !formData.batteryId.trim()
    ) {
      alert(
        "Please enter Vehicle Number, Vehicle Name and Battery ID."
      );
      return;
    }

    // Check CSV
    if (!file || !batteryMetrics) {
      alert("Please upload a battery data CSV file.");
      return;
    }

    // --------------------------------
    // FINAL ANALYSIS OBJECT
    // --------------------------------

    const analysis = {
      // User entered information
      vehicleNumber: formData.vehicleNumber.trim(),
      vehicleName: formData.vehicleName.trim(),
      batteryId: formData.batteryId.trim(),

      // Battery metrics
      recordCount: batteryMetrics.recordCount,

      maximumTemperature:
        batteryMetrics.maximumTemperature,

      averageTemperature:
        batteryMetrics.averageTemperature,

      maximumCurrent:
        batteryMetrics.maximumCurrent,

      maximumCellVoltageDelta:
        batteryMetrics.maximumCellVoltageDelta,

      averageCellVoltageDelta:
        batteryMetrics.averageCellVoltageDelta,

      lifetimeCycles:
        batteryMetrics.lifetimeCycles,

      currentSOC:
        batteryMetrics.currentSOC,

      averageSOC:
        batteryMetrics.averageSOC,

      currentSOH:
        batteryMetrics.currentSOH,

      // Risks
      thermalRisk:
        batteryMetrics.thermalRisk,

      electricalRisk:
        batteryMetrics.electricalRisk,

      chargingRisk:
        batteryMetrics.chargingRisk,

      cellImbalanceRisk:
        batteryMetrics.cellImbalanceRisk,

      // Verification
      verificationStatus: "Verified",

      // Keep CSV
      rawData:
        batteryMetrics.rawData,
    };

    // --------------------------------
    // SAVE EVERYTHING
    // --------------------------------

    localStorage.setItem(
      "batteryData",
      JSON.stringify(analysis)
    );

    console.log("FINAL SAVED BATTERY DATA:", analysis);

    alert(
      `Battery data submitted successfully!\n\n${batteryMetrics.recordCount} records detected.`
    );

    // Go to dashboard
    navigate("/");
  }

  return (
    <div className="analyze-page">

      {/* Header */}
      <div className="analyze-header">
        <h1>Analyze Battery</h1>

        <p>
          Upload your battery data to analyze health,
          safety and degradation.
        </p>
      </div>

      <form
        className="battery-form glass-panel"
        onSubmit={handleSubmit}
      >

        {/* Vehicle Information */}
        <div className="form-section-title">
          <h2>Vehicle Information</h2>

          <p>
            Enter the basic information of your EV.
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="vehicleNumber">
            Vehicle Number
          </label>

          <input
            id="vehicleNumber"
            name="vehicleNumber"
            type="text"
            placeholder="e.g. OD-02-AB-1234"
            value={formData.vehicleNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="vehicleName">
            Vehicle Name
          </label>

          <input
            id="vehicleName"
            name="vehicleName"
            type="text"
            placeholder="e.g. Tata Nexon EV"
            value={formData.vehicleName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="batteryId">
            Battery ID
          </label>

          <input
            id="batteryId"
            name="batteryId"
            type="text"
            placeholder="e.g. BX-2026-001"
            value={formData.batteryId}
            onChange={handleChange}
            required
          />
        </div>

        {/* Battery Data */}
        <div className="form-section-title battery-data-title">
          <h2>Battery Data</h2>

          <p>
            Upload historical battery data in CSV format.
          </p>
        </div>

        <div className="upload-box">

          <div className="upload-icon">
            📁
          </div>

          <h3>
            Upload Battery Data
          </h3>

          <p>
            Upload CSV containing temperature,
            charging, usage and diagnostic data.
          </p>

          <label
            htmlFor="batteryFile"
            className="file-upload-btn"
          >
            Choose CSV File
          </label>

          <input
            id="batteryFile"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            hidden
          />

          {file && (
            <div className="selected-file">
              ✓ {file.name}
            </div>
          )}

          {recordCount > 0 && (
            <div className="record-count">
              ✓ {recordCount} records detected
            </div>
          )}

        </div>

        {/* Submit */}
        <button
          type="submit"
          className="analyze-submit-btn"
        >
          Analyze Battery
        </button>

      </form>

    </div>
  );
}

export default AnalyzeBattery;