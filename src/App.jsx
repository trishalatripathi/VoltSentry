import "./App.css";
import { useState } from "react";
import sampleBatteryCsv from "../test_battery_data.csv?raw";

import StatCard from "./components/StatCard";
import SafetyRisk from "./components/SafetyRisk";
import DegradationChart from "./components/DegradationChart";
import PassportPreview from "./components/PassportPreview";
import DegradationFactors from "./components/DegradationFactors";
import ThermalAnalysis from "./components/ThermalAnalysis";

import logoImg from "./assets/voltsentry-logo.png";

import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";

import DigitalPassport from "./pages/DigitalPassport";
import AnalyzeBattery from "./pages/AnalyzeBattery";
import MyBatteries from "./pages/MyBatteries";
import FAQChatbot from "./components/FAQChatbot";
import { downloadBatteryReportPdf } from "./utils/generateBatteryPdf";
import {
  BATTERY_DATA_UPLOAD_ATTEMPTED_KEY,
  calculateBatteryMetrics,
  parseBatteryCsv,
} from "./utils/batteryCsv";

const demoCsvResult = parseBatteryCsv(sampleBatteryCsv);
const demoBatteryMetrics = demoCsvResult.canAnalyze
  ? calculateBatteryMetrics(demoCsvResult.records)
  : null;

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [batteryData, setBatteryData] = useState(() => {
    try {
      const savedData =
        sessionStorage.getItem("batteryData") ||
        localStorage.getItem("batteryData");
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (
          parsedData &&
          !Array.isArray(parsedData) &&
          (parsedData.recordCount ||
            parsedData.rawData ||
            parsedData.currentSOH !== undefined)
        ) {
          return parsedData;
        }
      }
    } catch (error) {
      console.error("Error loading battery data:", error);
    }
    return null;
  });

  const [uploadWasAttempted] = useState(
    () => localStorage.getItem(BATTERY_DATA_UPLOAD_ATTEMPTED_KEY) === "true",
  );
  const isDemoMode = batteryData === null && !uploadWasAttempted;
  const hasData = !!batteryData;

  const [isUploadingNew, setIsUploadingNew] = useState(false);

  // If user clicked to upload file, show the upload screen
  if (isUploadingNew) {
    return (
      <AnalyzeBattery
        onAnalysisComplete={(analysis) => {
          sessionStorage.setItem("voltsentry_session_uploaded", "true");
          sessionStorage.setItem("batteryData", JSON.stringify(analysis));
          localStorage.setItem("batteryData", JSON.stringify(analysis));
          setBatteryData(analysis);
          setIsUploadingNew(false);
        }}
        showCancel={true}
        onCancel={() => setIsUploadingNew(false)}
      />
    );
  }

  const sohSource = isDemoMode ? demoBatteryMetrics : batteryData;
  const currentSOH =
    sohSource?.sohMethod === "measured-capacity/rated-capacity" &&
    Number.isFinite(sohSource.currentSOH) &&
    sohSource.currentSOH > 0 &&
    sohSource.currentSOH <= 100
      ? sohSource.currentSOH
      : Number.isFinite(sohSource?.currentSOH) &&
        sohSource.currentSOH > 0 &&
        sohSource.currentSOH <= 100
        ? sohSource.currentSOH
        : null;

  const data = {
    vehicleName: hasData
      ? batteryData.vehicleName || "Connected EV"
      : isDemoMode
        ? "Tata Nexon EV (Demo)"
        : "No Vehicle Uploaded",

    batteryId: hasData
      ? batteryData.batteryId || "000"
      : isDemoMode
        ? demoBatteryMetrics?.batteryId || "BX-2026-DEMO"
        : "000",

    vehicleNumber: hasData
      ? batteryData.vehicleNumber || ""
      : isDemoMode
        ? "EV-DEMO-01"
        : "",

    currentSOH,

    averageTemperature: hasData
      ? (batteryData.averageTemperature ?? null)
      : isDemoMode
        ? (demoBatteryMetrics?.averageTemperature ?? null)
        : null,

    maximumTemperature: hasData
      ? (batteryData.maximumTemperature ?? null)
      : isDemoMode
        ? (demoBatteryMetrics?.maximumTemperature ?? null)
        : null,

    lifetimeCycles: hasData
      ? (batteryData.lifetimeCycles ?? batteryData.maximumCycle ?? batteryData.latestCycle ?? null)
      : isDemoMode
        ? (demoBatteryMetrics?.maximumCycle ?? null)
        : null,

    averageCellVoltageDelta: hasData
      ? (batteryData.averageCellVoltageDelta ?? null)
      : isDemoMode
        ? (demoBatteryMetrics?.averageCellVoltageDelta ?? null)
        : null,

    maximumCellVoltageDelta: hasData
      ? (batteryData.maximumCellVoltageDelta ?? null)
      : isDemoMode
        ? (demoBatteryMetrics?.maximumCellVoltageDelta ?? null)
        : null,

    averageSOC: hasData
      ? (batteryData.averageSOC ?? null)
      : isDemoMode
        ? (demoBatteryMetrics?.averageSOC ?? null)
        : null,

    verificationStatus: hasData
      ? batteryData.verificationStatus || "Verified"
      : isDemoMode
        ? "Demo Dataset"
        : "Unverified (0%)",

    thermalRisk: hasData
      ? (batteryData.thermalRisk ?? null)
      : isDemoMode
        ? (demoBatteryMetrics?.thermalRisk ?? null)
        : null,

    electricalRisk: hasData
      ? (batteryData.electricalRisk ?? null)
      : isDemoMode
        ? (demoBatteryMetrics?.electricalRisk ?? null)
        : null,

    chargingRisk: hasData
      ? (batteryData.chargingRisk ?? null)
      : isDemoMode
        ? (demoBatteryMetrics?.chargingRisk ?? null)
        : null,

    cellImbalanceRisk: hasData
      ? (batteryData.cellImbalanceRisk ?? null)
      : isDemoMode
        ? (demoBatteryMetrics?.cellImbalanceRisk ?? null)
        : null,
  };

  const recordedRisks = [
    data.thermalRisk,
    data.electricalRisk,
    data.chargingRisk,
    data.cellImbalanceRisk,
  ].filter((r) => r && r !== "0" && r !== "Unavailable");

  const overallRisk =
    recordedRisks.length === 0
      ? hasData || isDemoMode
        ? "Low"
        : "Unavailable"
      : recordedRisks.includes("High")
        ? "High"
        : recordedRisks.includes("Medium")
          ? "Medium"
          : "Low";

  const riskStatus =
    overallRisk === "Unavailable"
      ? "No validated data"
      : overallRisk === "Low"
        ? "Safe"
        : overallRisk === "Medium"
          ? "Monitor"
          : "Attention";

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="top-navbar">
        <h2
          className="logo"
          onClick={() => navigate("/")}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <img
            src={logoImg}
            alt="VoltSentry Lightning"
            style={{ height: "32px", width: "auto", objectFit: "contain" }}
          />
          VoltSentry
        </h2>

        <div className="nav-links">
          <button
            className="nav-item"
            onClick={() => {
              navigate("/");
            }}
          >
            Home
          </button>

          <button
            className={`nav-item ${
              location.pathname === "/" || location.pathname === "/dashboard"
                ? "active"
                : ""
            }`}
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>

          <button
            className={`nav-item ${
              location.pathname === "/analyze" ? "active" : ""
            }`}
            onClick={() => setIsUploadingNew(true)}
          >
            Analyze Battery
          </button>

          <button
            className={`nav-item ${
              location.pathname === "/batteries" ? "active" : ""
            }`}
            onClick={() => navigate("/batteries")}
          >
            History
          </button>

          <button
            className={`nav-item ${
              location.pathname === "/passport" ? "active" : ""
            }`}
            onClick={() => navigate("/passport")}
          >
            Battery Passport
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <div>
            <h1>Battery Dashboard</h1>

            <p>
              {hasData
                ? `Monitoring ${data.vehicleName} (${
                    data.vehicleNumber || data.batteryId
                  }) • ${data.verificationStatus}`
                : isDemoMode
                  ? "Monitoring Tata Nexon EV (Demo) • Demo Dataset"
                  : "No battery data uploaded • All indicators currently at 0"}
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              className="analyze-btn"
              onClick={() => setIsUploadingNew(true)}
            >
              {hasData ? "⚡ Upload New CSV / Invoice" : "⚡ Upload File"}
            </button>
            <button
              className="analyze-btn pdf-btn"
              onClick={() =>
                downloadBatteryReportPdf(
                  batteryData || (isDemoMode ? demoBatteryMetrics : null),
                )
              }
              title="Download full PDF diagnostic report"
            >
              📥 Download PDF Report
            </button>
          </div>
        </header>

        {(batteryData?.dataProvenance === "Synthetic demonstration data" ||
          isDemoMode) && (
          <p className="synthetic-data-notice">
            Dashboard metrics and charts are derived from synthetic demonstration
            data, not real EV measurements.
          </p>
        )}

        {/* Upload prompt card if zero values / not uploaded and not in demo mode */}
        {!hasData && !isDemoMode && (
          <div
            className="upload-prompt-card glass-panel"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "18px 24px",
              background: "rgba(0, 255, 136, 0.05)",
              border: "1px solid rgba(0, 255, 136, 0.25)",
              borderRadius: "16px",
              marginBottom: "25px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "rgba(0, 255, 136, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                flexShrink: 0,
              }}
            >
              📁
            </div>
            <div>
              <h3
                style={{
                  margin: "0 0 4px",
                  color: "#ffffff",
                  fontSize: "1.05rem",
                }}
              >
                No Battery Telemetry Uploaded
              </h3>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-dim)",
                  fontSize: "0.9rem",
                }}
              >
                All indicators are currently <strong>0</strong>. Click the{" "}
                <strong>Upload File</strong> button above to provide your vehicle
                data and calculate real battery health, safety risk, and charging
                cycles.
              </p>
            </div>
          </div>
        )}

        {/* Statistics */}
        <section className="stats">
          <StatCard
            title="Battery Health"
            value={
              data.currentSOH === null
                ? !hasData && !isDemoMode
                  ? "0%"
                  : "Unavailable"
                : `${data.currentSOH.toFixed(1)}%`
            }
            unit=""
            status={
              data.currentSOH === null
                ? !hasData && !isDemoMode
                  ? "000"
                  : "Valid measured and rated capacity required"
                : isDemoMode
                  ? "DEMO DATA"
                  : hasData
                    ? data.currentSOH >= 80
                      ? "Good"
                      : "Needs Attention"
                    : "000"
            }
            statusClass={
              data.currentSOH === null
                ? "status"
                : isDemoMode
                  ? "status demo-data-label"
                  : "status good"
            }
          />

          <StatCard
            title="Safety Risk"
            value={overallRisk}
            status={overallRisk === "Unavailable" ? null : riskStatus}
            statusClass={
              overallRisk === "High"
                ? "status risk-high"
                : overallRisk === "Medium"
                  ? "status risk-medium"
                  : overallRisk === "Unavailable"
                    ? "status"
                    : "status good"
            }
          />

          <StatCard
            title="Charging Cycles"
            value={data.lifetimeCycles ?? (!hasData && !isDemoMode ? "0" : "Unavailable")}
            unit={
              data.lifetimeCycles === null && (hasData || isDemoMode)
                ? ""
                : "Cycles"
            }
          />

          <StatCard
            title="Average SOC"
            value={data.averageSOC ?? (!hasData && !isDemoMode ? "0" : "Unavailable")}
            unit={
              data.averageSOC === null && (hasData || isDemoMode) ? "" : "%"
            }
          />
        </section>

        {/* Battery Overview */}
        <section className="overview">
          <div className="panel glass-panel">
            <h2>Battery Overview</h2>

            <div className="battery-circle">
              <span>
                {data.currentSOH === null
                  ? !hasData && !isDemoMode
                    ? "0%"
                    : "Unavailable"
                  : `${data.currentSOH.toFixed(1)}%`}
              </span>
              <small>State of Health</small>
              {isDemoMode && data.currentSOH !== null && (
                <small className="demo-data-label">DEMO DATA</small>
              )}
            </div>

            <p>
              {hasData ? (
                <>
                  Battery health is currently{" "}
                  <strong>
                    {data.currentSOH !== null
                      ? data.currentSOH >= 80
                        ? "Good"
                        : "Needs Attention"
                      : "recorded without capacity ratio"}
                  </strong>.
                </>
              ) : isDemoMode ? (
                <>
                  State of health{" "}
                  <strong>
                    {data.currentSOH === null
                      ? "unavailable - valid measured and rated capacity data required"
                      : data.currentSOH >= 80
                        ? "Good"
                        : "Needs Attention"}
                  </strong>.
                </>
              ) : (
                <>
                  No battery data uploaded yet. Indicators are at{" "}
                  <strong>0%</strong>. Upload a CSV file to begin analysis.
                </>
              )}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="panel glass-panel">
            <h2>Quick Actions</h2>

            <button
              className="action-btn"
              onClick={() => setIsUploadingNew(true)}
            >
              ⚡ Upload File / CSV
            </button>

            <button
              className="action-btn"
              onClick={() => navigate("/passport")}
            >
              🪪 View Digital Passport
            </button>

            <button
              className="action-btn"
              style={{
                borderColor: "#00d2ff",
                background: "rgba(0, 210, 255, 0.1)",
                color: "#00e5ff",
              }}
              onClick={() =>
                downloadBatteryReportPdf(
                  batteryData || (isDemoMode ? demoBatteryMetrics : null),
                )
              }
            >
              📄 Export Full PDF Report
            </button>
          </div>
        </section>

        {/* Safety Risk + Degradation Analysis */}
        <div className="analysis-row">
          <SafetyRisk
            batteryData={batteryData || (isDemoMode ? demoBatteryMetrics : null)}
          />

          <div>
            <DegradationChart
              batteryData={batteryData || (isDemoMode ? demoBatteryMetrics : null)}
            />
            <DegradationFactors
              batteryData={batteryData || (isDemoMode ? demoBatteryMetrics : null)}
            />
          </div>
        </div>

        {/* Thermal Analysis */}
        <ThermalAnalysis
          batteryData={batteryData || (isDemoMode ? demoBatteryMetrics : null)}
        />

        {/* Second-Life Passport */}
        <PassportPreview
          batteryData={batteryData || (isDemoMode ? demoBatteryMetrics : null)}
        />

        {/* Disclaimer */}
        <footer>
          <p>
            ⚠️ Battery health and safety results are estimates and do not replace
            certified battery testing.
          </p>
        </footer>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main website */}
        <Route
          path="/"
          element={
            <iframe
              src="/main-website/index.html"
              title="VoltSentry main website"
              style={{
                width: "100%",
                height: "100vh",
                border: "0",
                display: "block",
              }}
            />
          }
        />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Digital Passport */}
        <Route path="/passport" element={<DigitalPassport />} />

        {/* Analyze Battery */}
        <Route path="/analyze" element={<AnalyzeBattery />} />

        {/* My Batteries */}
        <Route path="/batteries" element={<MyBatteries />} />
      </Routes>

      <FAQChatbot />
    </BrowserRouter>
  );
}

export default App;
