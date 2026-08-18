import "./App.css";

import StatCard from "./components/StatCard";
import SafetyRisk from "./components/SafetyRisk";
import DegradationChart from "./components/DegradationChart";
import PassportPreview from "./components/PassportPreview";
import DegradationFactors from "./components/DegradationFactors";

import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import DigitalPassport from "./pages/DigitalPassport";
import AnalyzeBattery from "./pages/AnalyzeBattery";
import MyBatteries from "./pages/MyBatteries";
function Dashboard() {
  const navigate = useNavigate();
  return (
    <div className="app">

      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">⚡ BatteryX</h2>

        <nav>
        <button
          className="nav-item active"
          onClick={() => navigate("/")}
        >
          Dashboard
        </button>

        <button
          className="nav-item"
          onClick={() => navigate("/batteries")}
        >
          My Batteries
        </button>

        

        <button
          className="nav-item"
          onClick={() => navigate("/analyze")}
        >
          Analysis
        </button>

        <button
          className="nav-item"
          onClick={() => navigate("/passport")}
        >
          Digital Passport
        </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="main-content">

        <header className="header">
          <div>
            <h1>Battery Dashboard</h1>
            <p>Monitor your EV battery health and safety</p>
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
            value="87"
            unit="%"
            status="Good"
          />

          <StatCard
            title="Safety Risk"
            value="Low"
            status="Safe"
          />

          <StatCard
            title="Charging Cycles"
            value="742"
            unit="Cycles"
          />

          <StatCard
            title="Current Capacity"
            value="52.2"
            unit="kWh"
          />

        </section>

        {/* Battery overview */}
        <section className="overview">

          <div className="panel">
            <h2>Battery Overview</h2>

            <div className="battery-circle">
              <span>87%</span>
              <small>Health</small>
            </div>

            <p>
              Your battery is currently in good condition.
            </p>
          </div>

          <div className="panel">
            <h2>Quick Actions</h2>

            <button className="action-btn">
              🔋 Analyze Battery
            </button>

            <button className="action-btn">
              📊 View Analysis
            </button>

            <button className="action-btn">
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
        <Route path="/" element={<Dashboard />} />

        {/* Digital Passport */}
        <Route
          path="/passport"
          element={<DigitalPassport />}
        />
        <Route
          path="/analyze"
          element={<AnalyzeBattery />}
        />
        <Route
          path="/batteries"
          element={<MyBatteries />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;