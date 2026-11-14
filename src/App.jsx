import "./App.css";
import { useState } from "react";

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

  const [batteryData] = useState(() => {
    try {
      const savedData = localStorage.getItem("batteryData");
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData && !Array.isArray(parsedData)) {
          return parsedData;
        }
      }
    } catch (error) {
      console.error("Error loading battery data:", error);
      localStorage.removeItem("batteryData");
    }
    return null;
  });

  const currentSOH =
    batteryData?.sohMethod === "measured-capacity/rated-capacity" &&
    Number.isFinite(batteryData.currentSOH) &&
    batteryData.currentSOH > 0 &&
    batteryData.currentSOH <= 100
      ? batteryData.currentSOH
      : null;

  const data = {
    vehicleName:
      batteryData?.vehicleName || "Uploaded battery",

    batteryId:
      batteryData?.batteryId || "Not available",

    currentSOH,

    averageTemperature:
      batteryData?.averageTemperature ?? null,

    maximumTemperature:
      batteryData?.maximumTemperature ?? null,

    lifetimeCycles:
      batteryData?.lifetimeCycles ?? null,

    averageSOC:
      batteryData?.averageSOC ?? null,

    verificationStatus:
      batteryData?.verificationStatus || "Not analyzed",

    thermalRisk:
      batteryData?.thermalRisk || null,

    electricalRisk:
      batteryData?.electricalRisk || null,

    chargingRisk:
      batteryData?.chargingRisk || null,

    cellImbalanceRisk:
      batteryData?.cellImbalanceRisk || null,
  };


  // Overall safety risk
  const recordedRisks = [
    data.thermalRisk,
    data.electricalRisk,
    data.chargingRisk,
    data.cellImbalanceRisk,
  ].filter(Boolean);
  const overallRisk =
    recordedRisks.length === 0
      ? "Unavailable"
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
            onClick={() => navigate("/analyze")}
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
              {batteryData
                ? `Monitoring ${data.vehicleName}`
                : "Monitor your EV battery health and safety"}
            </p>

          </div>


          <button
            className="analyze-btn"
            onClick={() => navigate("/analyze")}
          >
            🔋 Analyze Battery
          </button>

        </header>

        {batteryData?.dataProvenance === "Synthetic demonstration data" && (
          <p className="synthetic-data-notice">
            Dashboard metrics and charts are derived from synthetic demonstration
            data, not real EV measurements.
          </p>
        )}

        {/* Statistics */}
        <section className="stats">

          <StatCard
            title="Battery Health"
            value={data.currentSOH === null
              ? "Unavailable"
              : `${data.currentSOH.toFixed(1)}%`}
            unit=""
            status={data.currentSOH === null ? "Capacity data required" : "Measured"}
            statusClass={data.currentSOH === null ? "status" : "status good"}
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
                  : "status good"
            }
          />


          <StatCard
            title="Charging Cycles"
            value={data.lifetimeCycles ?? "Unavailable"}
            unit={data.lifetimeCycles === null ? "" : "Cycles"}
          />


          <StatCard
            title="Average SOC"
            value={data.averageSOC ?? "Unavailable"}
            unit={data.averageSOC === null ? "" : "%"}
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
                {data.currentSOH === null
                  ? "Unavailable"
                  : `${data.currentSOH.toFixed(1)}%`}
              </span>
              <small>
                State of Health
              </small>
            </div>


            <p>

              State of health{" "}

              <strong>
                {data.currentSOH === null
                  ? "unavailable — measured capacity data required"
                  : data.currentSOH >= 80
                    ? "Good"
                    : "Needs Attention"}
              </strong>.

            </p>

          </div>


          {/* Quick Actions */}
          <div className="panel glass-panel">
            <h2>
              Quick Actions
            </h2>


            <button
              className="action-btn"
              onClick={() => navigate("/analyze")}
            >
              🔋 Analyze Battery
            </button>


            <button
              className="action-btn"
              onClick={() => navigate("/analyze")}
            >
              📊 View Analysis
            </button>


            <button
              className="action-btn"
              onClick={() => navigate("/passport")}
            >
              🪪 View Passport
            </button>

          </div>

        </section>


        {/* Safety Risk + Degradation Analysis */}
        <div className="analysis-row">

          <SafetyRisk />


          <div>

            <DegradationChart />

            <DegradationFactors />

          </div>

        </div>

        {/* Thermal Analysis */}
        <ThermalAnalysis />

        {/* Second-Life Passport */}
        <PassportPreview />


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