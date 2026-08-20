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

  const [batteryData, setBatteryData] = useState(null);


  // Load saved battery data
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("batteryData");

      if (savedData) {
        const parsedData = JSON.parse(savedData);

        if (parsedData && !Array.isArray(parsedData)) {
          setBatteryData(parsedData);
        }
      }
    } catch (error) {
      console.error("Error loading battery data:", error);

      localStorage.removeItem("batteryData");
      setBatteryData(null);
    }
  }, []);


  // Safe default values
  const data = {
    vehicleName:
      batteryData?.vehicleName || "Tata Nexon EV",

    batteryId:
      batteryData?.batteryId || "BX-2026-001",

    currentSOH:
      batteryData?.currentSOH ?? 87,

    averageTemperature:
      batteryData?.averageTemperature ?? 32,

    maximumTemperature:
      batteryData?.maximumTemperature ?? 41,

    lifetimeCycles:
      batteryData?.lifetimeCycles ?? 742,

    averageCellVoltageDelta:
      batteryData?.averageCellVoltageDelta ?? 26.4,

    maximumCellVoltageDelta:
      batteryData?.maximumCellVoltageDelta ?? 51.2,

    averageSOC:
      batteryData?.averageSOC ?? 68.2,

    verificationStatus:
      batteryData?.verificationStatus || "Verified",

    thermalRisk:
      batteryData?.thermalRisk || "Low",

    electricalRisk:
      batteryData?.electricalRisk || "Low",

    chargingRisk:
      batteryData?.chargingRisk || "Low",

    cellImbalanceRisk:
      batteryData?.cellImbalanceRisk || "Low",
  };


  // Overall safety risk
  const overallRisk =
    data.thermalRisk === "High" ||
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
    overallRisk === "Low"
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
              window.location.href = "http://127.0.0.1:5500/app2/index.html";
            }}
          >
            Home
          </button>

          <button
            className={`nav-item ${location.pathname === "/" ? "active" : ""
              }`}
            onClick={() => navigate("/")}
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


        {/* Statistics */}
        <section className="stats">

          <StatCard
            title="Battery Health"
            value={data.currentSOH}
            unit="%"
            status="Good"
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

              Battery health is currently{" "}

              <strong>
                {data.currentSOH >= 80
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

        {/* Dashboard */}
        <Route
          path="/"
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