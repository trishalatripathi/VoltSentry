import { useState } from "react";

function AnalyzeBattery() {
  const [formData, setFormData] = useState({
    vehicleNumber: "",
    vehicleName: "",
    batteryId: "",
  });

  const [file, setFile] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  function handleFileChange(event) {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    console.log("Vehicle data:", formData);
    console.log("Battery data file:", file);

    if (!file) {
      alert("Please upload a battery data CSV file.");
      return;
    }

    alert("Battery data submitted successfully!");
  }

  return (
    <div className="analyze-page">

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
          <p>Enter the basic information of your EV.</p>
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

        </div>

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