import "./App.css";
import { useState, useEffect } from "react";

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


function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [batteryData, setBatteryData] = useState(() => {
    try {
      // Automatic reset to 0 when opening the dashboard for the first time:
      // If the user has not uploaded in this session, always start at 0
      const hasUploadedInSession = sessionStorage.getItem("voltsentry_session_uploaded") === "true";
      if (!hasUploadedInSession) {
        localStorage.removeItem("batteryData");
        sessionStorage.removeItem("batteryData");
        return null;
      }

      const savedData = sessionStorage.getItem("batteryData") || localStorage.getItem("batteryData");
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData && !Array.isArray(parsedData) && (parsedData.recordCount || parsedData.rawData || parsedData.currentSOH !== undefined)) {
          return parsedData;
        }
      }
    } catch (e) {}
    return null;
  });

  const [isUploadingNew, setIsUploadingNew] = useState(false);

  // If user clicked to upload file, show the upload screen (the given photo)
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

  const hasData = !!batteryData;

  // Zero / Real values (NO DUMMY VALUES)
  const data = {
    vehicleName: hasData ? (batteryData.vehicleName || "Connected EV") : "No Vehicle Uploaded",
    batteryId: hasData ? (batteryData.batteryId || "000") : "000",
    currentSOH: hasData ? (batteryData.currentSOH ?? 0) : 0,
    averageTemperature: hasData ? (batteryData.averageTemperature ?? 0) : 0,
    maximumTemperature: hasData ? (batteryData.maximumTemperature ?? 0) : 0,
    lifetimeCycles: hasData ? (batteryData.lifetimeCycles ?? 0) : 0,
    averageCellVoltageDelta: hasData ? (batteryData.averageCellVoltageDelta ?? 0) : 0,
    maximumCellVoltageDelta: hasData ? (batteryData.maximumCellVoltageDelta ?? 0) : 0,
    averageSOC: hasData ? (batteryData.averageSOC ?? 0) : 0,
    verificationStatus: hasData ? (batteryData.verificationStatus || "Verified") : "Unverified (0%)",
    thermalRisk: hasData ? (batteryData.thermalRisk || "0") : "0",
    electricalRisk: hasData ? (batteryData.electricalRisk || "0") : "0",
    chargingRisk: hasData ? (batteryData.chargingRisk || "0") : "0",
    cellImbalanceRisk: hasData ? (batteryData.cellImbalanceRisk || "0") : "0",
  };

  // Overall safety risk
  const overallRisk = !hasData 
    ? "0" 
    : data.thermalRisk === "High" ||
      data.electricalRisk === "High" ||
      data.chargingRisk === "High" ||
      data.cellImbalanceRisk === "High"
      ? "High"
      : data.thermalRisk === "Medium" ||
        data.electricalRisk === "Medium" ||
        data.chargingRisk === "Medium" ||
        data.cellImbalanceRisk === "Medium"
        ? "Medium"
        : "Low";

  const riskStatus = !hasData 
    ? "000" 
    : overallRisk === "Low" 
      ? "Safe" 
      : overallRisk === "Medium" 
        ? "Monitor" 
        : "Attention";

  return (
    <div className="app">

      {/* Navbar */}
      <nav className="top-navbar">
        <h2 className="logo" onClick={() => navigate("/")} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={logoImg} alt="VoltSentry Lightning" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
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
            className={`nav-item ${location.pathname === "/" ? "active" : ""
              }`}
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>

          <button
            className={`nav-item ${location.pathname === "/analyze"
              ? "active"
              : ""
              }`}
            onClick={() => setIsUploadingNew(true)}
          >
            Analyze Battery
          </button>

          <button
            className={`nav-item ${location.pathname === "/batteries"
              ? "active"
              : ""
              }`}
            onClick={() => navigate("/batteries")}
          >
            History
          </button>

          <button
            className={`nav-item ${location.pathname === "/passport"
              ? "active"
              : ""
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
            <h1>
              Battery Dashboard
            </h1>

            <p>
              {hasData
                ? `Monitoring ${data.vehicleName} (${data.vehicleNumber || data.batteryId}) • ${data.verificationStatus}`
                : "No battery data uploaded • All indicators currently at 0"}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="analyze-btn"
              onClick={() => setIsUploadingNew(true)}
            >
              {hasData ? "⚡ Upload New CSV / Invoice" : "⚡ Upload File"}
            </button>
          </div>
        </header>

        {/* Upload prompt card if zero values */}
        {!hasData && (
          <div className="upload-prompt-card glass-panel" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '18px 24px',
            background: 'rgba(0, 255, 136, 0.05)',
            border: '1px solid rgba(0, 255, 136, 0.25)',
            borderRadius: '16px',
            marginBottom: '25px',
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(0, 255, 136, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              flexShrink: 0
            }}>📁</div>
            <div>
              <h3 style={{ margin: '0 0 4px', color: '#ffffff', fontSize: '1.05rem' }}>No Battery Telemetry Uploaded</h3>
              <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                All indicators are currently <strong>0</strong>. Click the <strong>Upload File</strong> button above to provide your vehicle data and calculate real battery health, safety risk, and charging cycles.
              </p>
            </div>
          </div>
        )}

        {/* Statistics */}
        <section className="stats">
          <StatCard
            title="Battery Health"
            value={data.currentSOH}
            unit="%"
            status={hasData ? (data.currentSOH >= 80 ? "Good" : "Needs Attention") : "000"}
          />

          <StatCard
            title="Safety Risk"
            value={overallRisk}
            status={riskStatus}
          />

          <StatCard
            title="Charging Cycles"
            value={data.lifetimeCycles}
            unit="Cycles"
          />

          <StatCard
            title="Average SOC"
            value={data.averageSOC}
            unit="%"
          />
        </section>

        {/* Battery Overview */}
        <section className="overview">
          <div className="panel glass-panel">
            <h2>
              Battery Overview
            </h2>

            <div className="battery-circle">
              <span>
                {data.currentSOH}%
              </span>
              <small>
                Health
              </small>
            </div>

            <p>
              {hasData ? (
                <>
                  Battery health is currently{" "}
                  <strong>
                    {data.currentSOH >= 80 ? "Good" : "Needs Attention"}
                  </strong>.
                </>
              ) : (
                <>
                  No battery data uploaded yet. Indicators are at <strong>0%</strong>. Upload a CSV file to begin analysis.
                </>
              )}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="panel glass-panel">
            <h2>
              Quick Actions
            </h2>

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
          </div>
        </section>

        {/* Safety Risk + Degradation Analysis */}
        <div className="analysis-row">
          <SafetyRisk batteryData={batteryData} />

          <div>
            <DegradationChart batteryData={batteryData} />
            <DegradationFactors batteryData={batteryData} />
          </div>
        </div>

        {/* Thermal Analysis */}
        <ThermalAnalysis batteryData={batteryData} />

        {/* Second-Life Passport */}
        <PassportPreview batteryData={batteryData} />


        {/* Disclaimer */}
        <footer>

          <p>
            ⚠️ Battery health and safety results are estimates
            and do not replace certified battery testing.
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
              style={{ width: "100%", height: "100vh", border: "0", display: "block" }}
            />
          }
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* Digital Passport */}
        <Route
          path="/passport"
          element={<DigitalPassport />}
        />


        {/* Analyze Battery */}
        <Route
          path="/analyze"
          element={<AnalyzeBattery />}
        />


        {/* My Batteries */}
        <Route
          path="/batteries"
          element={<MyBatteries />}
        />

      </Routes>

    </BrowserRouter>

  );
}


export default App;