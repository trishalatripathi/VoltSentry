import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoImg from "../assets/voltsentry-logo.png";
import sampleCsvUrl from "../../test_battery_data.csv?url";
import {
  BATTERY_DATA_UPLOAD_ATTEMPTED_KEY,
  calculateBatteryMetrics,
  parseBatteryCsv,
} from "../utils/batteryCsv";

function formatMetric(value, unit = "", decimalPlaces = 1) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "Unavailable";
  }
  const formatted = Number.isInteger(value)
    ? value
    : value.toFixed(decimalPlaces);
  return `${formatted}${unit}`;
}

function AnalyzeBattery() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    vehicleNumber: "",
    vehicleName: "",
    batteryId: "",
  });

  const [recordCount, setRecordCount] = useState(0);
  const [showManualForm, setShowManualForm] = useState(false);
  const [batteryMetrics, setBatteryMetrics] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilename, setSelectedFilename] = useState("");
  const fileInputRef = useRef(null);
  const importRequestRef = useRef(0);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function importCsv(selectedFile, filename = selectedFile.name) {
    const requestId = ++importRequestRef.current;
    localStorage.removeItem("batteryData");
    localStorage.setItem(BATTERY_DATA_UPLOAD_ATTEMPTED_KEY, "true");
    setSelectedFilename(filename);
    setImportResult(null);
    setBatteryMetrics(null);
    setRecordCount(0);
    setShowManualForm(false);
    setIsLoading(true);

    if (!filename.toLowerCase().endsWith(".csv")) {
      setImportResult({
        headers: [],
        previewHeaders: [],
        previewRows: [],
        records: [],
        errors: ["Please select a file with a .csv extension."],
        warnings: [],
        canAnalyze: false,
        isSynthetic: false,
      });
      setIsLoading(false);
      return;
    }

    try {
      const text = await selectedFile.text();
      if (requestId !== importRequestRef.current) {
        return;
      }
      const result = parseBatteryCsv(text);
      setImportResult(result);
      setRecordCount(result.previewRows.length);
      if (result.canAnalyze) {
        setBatteryMetrics(calculateBatteryMetrics(result.records));
        setShowManualForm(true);
      }
    } catch (error) {
      if (requestId !== importRequestRef.current) {
        return;
      }
      setImportResult({
        headers: [],
        previewHeaders: [],
        previewRows: [],
        records: [],
        errors: [`Unable to read the selected CSV: ${error.message}`],
        warnings: [],
        canAnalyze: false,
        isSynthetic: false,
      });
    } finally {
      if (requestId === importRequestRef.current) {
        setIsLoading(false);
      }
    }
  }

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];
    event.target.value = "";
    if (selectedFile) {
      importCsv(selectedFile);
    }
  }

  async function loadSampleDataset() {
    const requestId = ++importRequestRef.current;
    localStorage.removeItem("batteryData");
    localStorage.removeItem(BATTERY_DATA_UPLOAD_ATTEMPTED_KEY);
    setIsLoading(true);
    setSelectedFilename("voltsentry_sample_battery_data.csv");
    setImportResult(null);
    setBatteryMetrics(null);
    setRecordCount(0);
    setShowManualForm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    try {
      const response = await fetch(sampleCsvUrl);
      if (!response.ok) {
        throw new Error(`Sample CSV request failed (${response.status}).`);
      }
      const text = await response.text();
      if (requestId !== importRequestRef.current) {
        return;
      }
      const result = parseBatteryCsv(text);
      setImportResult(result);
      setRecordCount(result.previewRows.length);
      if (result.canAnalyze) {
        setBatteryMetrics(calculateBatteryMetrics(result.records));
        setShowManualForm(true);
      }
    } catch (error) {
      if (requestId !== importRequestRef.current) {
        return;
      }
      setImportResult({
        headers: [],
        previewHeaders: [],
        previewRows: [],
        records: [],
        errors: [`Unable to load the sample CSV: ${error.message}`],
        warnings: [],
        canAnalyze: false,
        isSynthetic: false,
      });
    } finally {
      if (requestId === importRequestRef.current) {
        setIsLoading(false);
      }
    }
  }

  function clearDataset() {
    importRequestRef.current += 1;
    localStorage.removeItem("batteryData");
    localStorage.removeItem(BATTERY_DATA_UPLOAD_ATTEMPTED_KEY);
    setSelectedFilename("");
    setImportResult(null);
    setBatteryMetrics(null);
    setRecordCount(0);
    setShowManualForm(false);
    setIsLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!importResult?.canAnalyze || !batteryMetrics) {
      return;
    }

    if (
      !formData.vehicleNumber.trim() ||
      !formData.vehicleName.trim() ||
      !formData.batteryId.trim()
    ) {
      alert("Please enter Vehicle Number, Vehicle Name and Battery ID.");
      return;
    }

    const csvBatteryId = batteryMetrics.rawData[0]?.["Battery ID"];
    if (
      csvBatteryId &&
      csvBatteryId !== formData.batteryId.trim()
    ) {
      alert(
        `The Battery ID in the CSV (${csvBatteryId}) does not match the Battery ID entered in the form.`,
      );
      return;
    }

    const analysis = {
      vehicleNumber: formData.vehicleNumber.trim(),
      vehicleName: formData.vehicleName.trim(),
      batteryId: formData.batteryId.trim(),
      recordCount: batteryMetrics.recordCount,
      latestTemperature: batteryMetrics.latestTemperature,
      latestCurrent: batteryMetrics.latestCurrent,
      latestVoltage: batteryMetrics.latestVoltage,
      minimumTemperature: batteryMetrics.minimumTemperature,
      maximumTemperature:
        batteryMetrics.maximumTemperature,
      averageTemperature:
        batteryMetrics.averageTemperature,
      currentTemperature: batteryMetrics.latestTemperature,
      maximumCurrent:
        batteryMetrics.maximumCurrent,
      maximumCellVoltageDelta:
        batteryMetrics.maximumCellVoltageDelta,
      latestCycle: batteryMetrics.latestCycle,
      minimumCycle: batteryMetrics.minimumCycle,
      maximumCycle: batteryMetrics.maximumCycle,
      lifetimeCycles: batteryMetrics.maximumCycle,
      cycleTrend: batteryMetrics.cycleTrend,
      currentSOC:
        batteryMetrics.currentSOC,
      averageSOC:
        batteryMetrics.averageSOC,
      currentSOH: batteryMetrics.currentSOH,
      sohMethod: batteryMetrics.sohMethod,
      measuredCapacity: batteryMetrics.measuredCapacity,
      referenceCapacity: batteryMetrics.referenceCapacity,
      capacityUnit: batteryMetrics.capacityUnit,
      thermalRisk:
        batteryMetrics.thermalRisk,
      electricalRisk:
        batteryMetrics.electricalRisk,
      chargingRisk:
        batteryMetrics.chargingRisk,
      cellImbalanceRisk:
        batteryMetrics.cellImbalanceRisk,
      verificationStatus: "CSV validated",
      dataFilename: selectedFilename,
      dataProvenance: importResult.isSynthetic
        ? "Synthetic demonstration data"
        : "User-provided data",
      rawData: batteryMetrics.rawData,
    };

    localStorage.setItem(
      "batteryData",
      JSON.stringify(analysis)
    );
    localStorage.removeItem(BATTERY_DATA_UPLOAD_ATTEMPTED_KEY);

    alert(
      `Battery data submitted successfully!\n\n${batteryMetrics.recordCount} records detected.`
    );

    navigate("/dashboard");
  }

  return (
    <div className="analyze-container">
      {/* Navbar */}
      <nav className="top-navbar">
        <h2 className="logo" onClick={() => navigate("/dashboard")} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: '#FFFFFF' }}>
          <img src={logoImg} alt="VoltSentry Lightning" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          VoltSentry
        </h2>

        <div className="nav-links">
          <button className="nav-item" onClick={() => navigate("/")}>Home</button>
          <button className="nav-item active" onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button className="nav-item" onClick={() => navigate("/passport")}>Battery Passport</button>
        </div>
      </nav>

      <div className="analyze-page">
        {/* Back Button */}
        <button
          className="back-btn"
          onClick={() => navigate("/dashboard")}
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

        <section className="battery-import-panel glass-panel" aria-labelledby="battery-import-title">
          <div className="battery-import-header">
            <div>
              <h2 id="battery-import-title">Import battery telemetry CSV</h2>
              <p>
                Required columns: Battery Temperature (C), Pack Current (A),
                Cell Voltage Delta (mV), Cycle Index, and State of Charge (%).
                Optional: Timestamp, Pack Voltage (V), Battery ID, and Data Provenance.
              </p>
            </div>
            <div className="battery-import-actions">
              <a
                className="file-upload-btn"
                href={sampleCsvUrl}
                download="voltsentry_sample_battery_data.csv"
              >
                Download Sample CSV
              </a>
              <button
                type="button"
                className="file-upload-btn"
                onClick={loadSampleDataset}
                disabled={isLoading}
              >
                Load Sample Dataset
              </button>
            </div>
          </div>

          <div className="battery-file-controls">
            <label htmlFor="batteryFile" className="file-upload-btn">
              Choose CSV File
            </label>
            <input
              ref={fileInputRef}
              id="batteryFile"
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              aria-describedby="battery-file-status"
              disabled={isLoading}
            />
            {selectedFilename && (
              <button
                type="button"
                className="clear-dataset-btn"
                onClick={clearDataset}
                disabled={isLoading}
              >
                Clear dataset
              </button>
            )}
          </div>

          <div id="battery-file-status" aria-live="polite">
            {isLoading ? (
              <p className="import-status">Reading and validating CSV…</p>
            ) : selectedFilename ? (
              <p className="import-status">
                Selected: <strong>{selectedFilename}</strong>
                {` — ${recordCount} record${recordCount === 1 ? "" : "s"} found`}
              </p>
            ) : (
              <p className="import-status">
                No dataset selected. Upload a CSV or load the sample dataset
                before analysis.
              </p>
            )}
          </div>

          {importResult?.isSynthetic && (
            <p className="synthetic-data-notice">
              Synthetic demonstration measurements — not real EV measurements.
            </p>
          )}

          {importResult?.errors.length > 0 && (
            <div className="validation-messages validation-errors" role="alert">
              <h3>Validation errors — analysis is unavailable</h3>
              <ul>
                {importResult.errors.map((error, index) => (
                  <li key={`${index}-${error}`}>{error}</li>
                ))}
              </ul>
              {importResult.records.length > 0 && (
                <p>
                  {importResult.records.length} of {recordCount} records have
                  valid required measurements; fix all errors before analysis.
                </p>
              )}
            </div>
          )}

          {importResult?.warnings.length > 0 && (
            <div className="validation-messages validation-warnings">
              <h3>Warnings</h3>
              <ul>
                {importResult.warnings.map((warning, index) => (
                  <li key={`${index}-${warning}`}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {importResult?.canAnalyze && (
            <>
              <p className="import-success">
                Validation passed: {importResult.records.length} valid records
                are ready for analysis.
              </p>
              {batteryMetrics && (
                <>
                  <div className="imported-metrics">
                    <div><span>Latest temperature</span><strong>{formatMetric(batteryMetrics.latestTemperature, " °C")}</strong></div>
                    <div><span>Temperature range</span><strong>{formatMetric(batteryMetrics.minimumTemperature, "–")} to {formatMetric(batteryMetrics.maximumTemperature, " °C")}</strong></div>
                    <div><span>Average temperature</span><strong>{formatMetric(batteryMetrics.averageTemperature, " °C")}</strong></div>
                    <div><span>Latest SOC</span><strong>{formatMetric(batteryMetrics.latestSOC, "%")}</strong></div>
                    <div><span>Latest pack current</span><strong>{formatMetric(batteryMetrics.latestCurrent, " A")}</strong></div>
                    <div><span>Latest pack voltage</span><strong>{formatMetric(batteryMetrics.latestVoltage, " V")}</strong></div>
                    <div><span>Maximum cell-voltage delta</span><strong>{formatMetric(batteryMetrics.maximumCellVoltageDelta, " mV")}</strong></div>
                    <div><span>State of Health (SOH)</span><strong>{formatMetric(batteryMetrics.currentSOH, "%")}</strong></div>
                    <div><span>Cycle range / trend</span><strong>{batteryMetrics.minimumCycle}–{batteryMetrics.maximumCycle} ({batteryMetrics.cycleTrend >= 0 ? "+" : ""}{batteryMetrics.cycleTrend})</strong></div>
                  </div>
                  <p className="unavailable-metric-note">
                    {batteryMetrics.currentSOH === null
                      ? "SOH is unavailable: measured capacity and rated/design capacity in matching units are required."
                      : `SOH is calculated as measured capacity ÷ rated capacity × 100 using the latest available capacity record (${batteryMetrics.measuredCapacity} / ${batteryMetrics.referenceCapacity} ${batteryMetrics.capacityUnit}).`}
                  </p>
                </>
              )}
            </>
          )}

          {importResult?.previewRows.length > 0 && (
            <div className="import-preview">
              <h3>Imported data preview</h3>
              <p>
                Showing up to 8 of {recordCount} records. Cells shown as blank
                are missing in the source file.
              </p>
              <div className="import-preview-scroll">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">CSV row</th>
                      {importResult.previewHeaders.map((header) => (
                        <th key={header} scope="col">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {importResult.previewRows.slice(0, 8).map((row) => {
                      const rowHasError = importResult.errors.some((error) =>
                        error.startsWith(`Row ${row.sourceRow} `),
                      );
                      return (
                        <tr
                          key={row.sourceRow}
                          className={rowHasError ? "invalid-preview-row" : ""}
                        >
                          <th scope="row">{row.sourceRow}</th>
                          {row.values.map((value, index) => (
                            <td key={`${row.sourceRow}-${index}`}>
                              {typeof value === "string" && value.trim() === ""
                                ? "Missing"
                                : value}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

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
                <p>Review and validate the uploaded CSV above before analysis.</p>

                {selectedFilename && (
                  <div className="selected-file">
                    ✓ {selectedFilename}
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
                disabled={isLoading || !importResult?.canAnalyze || !batteryMetrics}
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