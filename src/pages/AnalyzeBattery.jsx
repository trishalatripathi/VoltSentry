import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";

function AnalyzeBattery() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    vehicleNumber: "",
    vehicleName: "",
    batteryId: "",
  });

  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState([]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  function handleFileChange(event) {
    const selectedFile = event.target.files[0];

    if (!selectedFile) return;

    setFile(selectedFile);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,

      complete: function (results) {
        console.log("CSV data:", results.data);

        setCsvData(results.data);
      },

      error: function (error) {
        console.error("CSV parsing error:", error);
        alert("Unable to read the CSV file.");
      },
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!file) {
      alert("Please upload a battery data CSV file.");
      return;
    }

    if (csvData.length === 0) {
      alert("The CSV file does not contain readable data.");
      return;
    }

    // Convert CSV values from strings to numbers
    const temperatures = csvData
      .map(row => Number(row["Battery Temperature (C)"]))
      .filter(value => !isNaN(value));

    const cellVoltageDeltas = csvData
      .map(row => Number(row["Cell Voltage Delta (mV)"]))
      .filter(value => !isNaN(value));

    const socValues = csvData
      .map(row => Number(row["State of Charge (%)"]))
      .filter(value => !isNaN(value));

    const currents = csvData
      .map(row => Number(row["Pack Current (A)"]))
      .filter(value => !isNaN(value));

    const cycleIndexes = csvData
      .map(row => Number(row["Cycle Index"]))
      .filter(value => !isNaN(value));

    // Calculate temperature statistics
    const averageTemperature =
      temperatures.reduce((sum, value) => sum + value, 0) /
      temperatures.length;

    const maximumTemperature = Math.max(...temperatures);

    // Calculate cell imbalance statistics
    const averageCellVoltageDelta =
      cellVoltageDeltas.reduce((sum, value) => sum + value, 0) /
      cellVoltageDeltas.length;

    const maximumCellVoltageDelta = Math.max(...cellVoltageDeltas);

    // Calculate SOC
    const averageSOC =
      socValues.reduce((sum, value) => sum + value, 0) /
      socValues.length;

    // Calculate current
    const averageCurrent =
      currents.reduce((sum, value) => sum + value, 0) /
      currents.length;

    const maximumCurrent = Math.max(...currents);
    const minimumCurrent = Math.min(...currents);

    // Latest cycle
    const latestCycle = Math.max(...cycleIndexes);

    // Store everything
    const batteryData = {
      vehicleNumber: formData.vehicleNumber,
      vehicleName: formData.vehicleName,
      batteryId: formData.batteryId,

      manufacturer: "Example Motors",
      manufacturingDate: "March 2023",

      // CSV information
      csvRows: csvData.length,
      uploadedFile: file.name,

      // Real CSV calculations
      averageTemperature: Number(averageTemperature.toFixed(2)),
      maximumTemperature: Number(maximumTemperature.toFixed(2)),

      averageCellVoltageDelta: Number(
        averageCellVoltageDelta.toFixed(2)
      ),

      maximumCellVoltageDelta: Number(
        maximumCellVoltageDelta.toFixed(2)
      ),

      averageSOC: Number(averageSOC.toFixed(2)),

      averageCurrent: Number(
        averageCurrent.toFixed(2)
      ),

      maximumCurrent: Number(
        maximumCurrent.toFixed(2)
      ),

      minimumCurrent: Number(
        minimumCurrent.toFixed(2)
      ),

      lifetimeCycles: latestCycle,

      // Keep SOH separate because CSV doesn't contain SOH
      currentSOH: 87,
      initialSOH: 96,

      verificationStatus: "Verified",
    };

    console.log("Calculated battery data:");
    console.log(batteryData);

    localStorage.setItem(
      "batteryData",
      JSON.stringify(batteryData)
    );

    alert(
      `Battery data analyzed successfully!\n\n` +
      `${csvData.length} records processed.\n` +
      `Latest cycle: ${latestCycle}\n` +
      `Maximum temperature: ${maximumTemperature.toFixed(1)}°C`
    );

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
        className="battery-form"
        onSubmit={handleSubmit}
      >

        {/* Vehicle Information */}
        <div className="form-section-title">
          <h2>Vehicle Information</h2>

          <p>
            Enter the basic information of your EV.
          </p>
        </div>

        {/* Vehicle Number */}
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

        {/* Vehicle Name */}
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

        {/* Battery ID */}
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

        {/* Upload Box */}
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

          {csvData.length > 0 && (
            <div className="selected-file">
              ✓ {csvData.length} records detected
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