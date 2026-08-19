import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoImg from "../assets/voltsentry-logo.png";

function AnalyzeBattery() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    vehicleNumber: "",
    vehicleName: "",
    batteryId: "",
  });

  const [file, setFile] = useState(null);
  const [recordCount, setRecordCount] = useState(0);
  const [showManualForm, setShowManualForm] = useState(false);

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
    <div className="analyze-container">
      {/* Navbar */}
      <nav className="top-navbar">
        <h2 className="logo" onClick={() => navigate("/")} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: '#FFFFFF' }}>
          <img src={logoImg} alt="VoltSentry Lightning" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          VoltSentry
        </h2>

        <div className="nav-links">
          <button className="nav-item" onClick={() => navigate("/")}>Home</button>
          <button className="nav-item active" onClick={() => navigate("/")}>Dashboard</button>
          <button className="nav-item" onClick={() => navigate("/passport")}>Battery Passport</button>
        </div>
      </nav>

      <div className="analyze-page">
        {/* Back Button */}
        <button
          className="back-btn"
          onClick={() => navigate("/")}
        >
          &larr; Back to Dashboard
        </button>

        {/* Hero Card */}
        <div className="hero-card glass-panel">
          <div className="hero-left">
            <div className="hero-icon-container">
              <svg className="hero-battery-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="16" height="12" rx="2" ry="2"></rect>
                <line x1="22" y1="11" x2="22" y2="13"></line>
                <path d="M6 11h8" strokeLinecap="round"></path>
                <path d="M10 7v8" strokeLinecap="round"></path>
              </svg>
            </div>
            <div className="hero-text-content">
              <h1 className="hero-title">
                Upload. Verify. Understand.<br />
                Then unlock the next life.
              </h1>
              <p className="hero-subtitle">
                Once the data is uploaded and verified, you'll get a <span className="highlight-green">Second Life Passport</span> of your EV battery.
              </p>
            </div>
          </div>
          <div className="hero-right">
            <div className="benefit-item">
              <span className="benefit-dot">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
              <span className="benefit-text">See the true condition of the battery</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-dot">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
              <span className="benefit-text">Reuse, repurpose or recycle with confidence</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-dot">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
              <span className="benefit-text">Make smart, data-backed decisions</span>
            </div>
          </div>
        </div>

        {/* Section Title */}
        <div className="section-header">
          <h2>Upload your report or data</h2>
        </div>

        {/* Upload options grid - 5 cards */}
        <div className="upload-options-grid">
          {/* Card 1: TAKE PHOTOS */}
          <div
            className="upload-option-card glass-panel"
            onClick={() => {
              document.getElementById("batteryFile").click();
              setShowManualForm(true);
            }}
          >
            <div className="option-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
            </div>
            <h3 className="option-title">TAKE PHOTOS</h3>
            <p className="option-desc">Upload clear photos of BMS screen / meter reading / dashboard.</p>
            <span className="option-action">Click to upload &rarr;</span>
          </div>

          {/* Card 2: SERVICE REPORT */}
          <div
            className="upload-option-card glass-panel"
            onClick={() => {
              document.getElementById("batteryFile").click();
              setShowManualForm(true);
            }}
          >
            <div className="option-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3 className="option-title">SERVICE REPORT</h3>
            <p className="option-desc">Upload report from authorized service center or workshop.</p>
            <span className="option-action">Click to upload &rarr;</span>
          </div>

          {/* Card 3: BILL / INVOICE */}
          <div
            className="upload-option-card glass-panel"
            onClick={() => {
              document.getElementById("batteryFile").click();
              setShowManualForm(true);
            }}
          >
            <div className="option-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="8" y1="15" x2="16" y2="15"></line>
                <line x1="8" y1="9" x2="16" y2="9"></line>
              </svg>
            </div>
            <h3 className="option-title">BILL / INVOICE</h3>
            <p className="option-desc">Upload bill or invoice that shows battery service details.</p>
            <span className="option-action">Click to upload &rarr;</span>
          </div>

          {/* Card 4: WHATSAPP / EMAIL */}
          <div
            className="upload-option-card glass-panel"
            onClick={() => window.location.href = 'mailto:verify@voltsentry.com?subject=EV Battery Telemetry Report'}
          >
            <div className="option-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </div>
            <h3 className="option-title">WHATSAPP / EMAIL</h3>
            <p className="option-desc">Forward service report or BMS readings via WhatsApp or email.</p>
            <span className="option-action">Forward now &rarr;</span>
          </div>

          {/* Card 5: MANUAL ENTRY */}
          <div
            className={`upload-option-card glass-panel ${showManualForm ? 'active-card' : ''}`}
            onClick={() => {
              setShowManualForm(true);
              setTimeout(() => {
                document.getElementById("battery-form-section")?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          >
            <div className="option-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </div>
            <h3 className="option-title">MANUAL ENTRY</h3>
            <p className="option-desc">Enter key values manually if report is not available.</p>
            <span className="option-action">Fill form &rarr;</span>
          </div>
        </div>

        {/* Second Life Passport Explanation Section */}
        <div className="passport-explanation-card glass-panel">
          <div className="explanation-left">
            <h2 className="explanation-title">Get the Second Life Passport</h2>
            <p className="explanation-desc">
              After verification, you'll receive a <span className="highlight-green">Second Life Passport</span> — showing your battery's health, usable capacity, cycle life and more — to help you decide its next best use.
            </p>
          </div>
          <div className="explanation-right">
            <div className="step-item">
              <div className="step-num-icon">1</div>
              <div className="step-text">Assess health</div>
            </div>
            <div className="step-connector"></div>
            <div className="step-item">
              <div className="step-num-icon">2</div>
              <div className="step-text">Decide next use</div>
            </div>
            <div className="step-connector"></div>
            <div className="step-item">
              <div className="step-num-icon">3</div>
              <div className="step-text">Reuse or recycle</div>
            </div>
          </div>
        </div>

        {/* Conditionally rendered upload/edit form */}
        {showManualForm && (
          <div id="battery-form-section" className="form-wrapper-block">
            <form
              className="battery-form glass-panel"
              onSubmit={handleSubmit}
            >
              {/* Vehicle Information */}
              <div className="form-section-title">
                <h2>Vehicle Information</h2>
                <p>Enter the basic information of your EV.</p>
              </div>

              <div className="form-group">
                <label htmlFor="vehicleNumber">Vehicle Number</label>
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
                <label htmlFor="vehicleName">Vehicle Name</label>
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
                <label htmlFor="batteryId">Battery ID</label>
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
                <p>Upload historical battery data in CSV format.</p>
              </div>

              <div className="upload-box">
                <div className="upload-icon">📁</div>
                <h3>Upload Battery Data</h3>
                <p>Upload CSV containing temperature, charging, usage and diagnostic data.</p>

                <label htmlFor="batteryFile" className="file-upload-btn">
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
        )}
      </div>
    </div>
  );
}

export default AnalyzeBattery;