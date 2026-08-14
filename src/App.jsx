import './App.css'

function App() {
  return (
    <div className="app">

      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">⚡ BatteryX</h2>

        <nav>
          <button className="nav-item active">Dashboard</button>
          <button className="nav-item">My Batteries</button>
          <button className="nav-item">Analysis</button>
          <button className="nav-item">Digital Passport</button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="main-content">

        <header className="header">
          <div>
            <h1>Battery Dashboard</h1>
            <p>Monitor your EV battery health and safety</p>
          </div>

          <button className="analyze-btn">
            + Analyze Battery
          </button>
        </header>

        {/* Statistics */}
        <section className="stats">

          <div className="stat-card">
            <p>Battery Health</p>
            <h2>87%</h2>
            <span className="status good">Good</span>
          </div>

          <div className="stat-card">
            <p>Safety Risk</p>
            <h2>Low</h2>
            <span className="status good">Safe</span>
          </div>

          <div className="stat-card">
            <p>Charging Cycles</p>
            <h2>742</h2>
            <span>Cycles</span>
          </div>

          <div className="stat-card">
            <p>Current Capacity</p>
            <h2>52.2</h2>
            <span>kWh</span>
          </div>

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

        {/* Disclaimer */}
        <footer>
          <p>
            ⚠️ Battery health and safety results are estimates
            and do not replace certified battery testing.
          </p>
        </footer>

      </main>

    </div>
  )
}

export default App