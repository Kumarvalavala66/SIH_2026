import { useEffect, useState } from "react";
import "./App.css"; 
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Helper component to command the map to pan and zoom smoothly
function MapRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

// Custom marker generator based on risk level
const getMarkerIcon = (riskLevel) => {
  const color = riskLevel === 'HIGH' ? '#ef4444' : riskLevel === 'MEDIUM' ? '#f59e0b' : '#10b981';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.6); transition: transform 0.2s;"></div>`,
  });
};

function App() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState(5);

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [anomalyFilter, setAnomalyFilter] = useState("ALL");
  const [duplicateFilter, setDuplicateFilter] = useState("ALL");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/projects")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch projects");
        return response.json();
      })
      .then((data) => {
        setProjects(data);
        if (data && data.length > 0) {
          const firstValid = data.find(p => p.latitude != null && p.longitude != null);
          if (firstValid) {
            setMapCenter([parseFloat(firstValid.latitude), parseFloat(firstValid.longitude)]);
            setMapZoom(7);
          }
        }
        setTimeout(() => setLoading(false), 600);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const high = projects.filter((p) => p.combined_risk_level === "HIGH").length;
  const medium = projects.filter((p) => p.combined_risk_level === "MEDIUM").length;
  const low = projects.filter((p) => p.combined_risk_level === "LOW").length;
  const mlAnomalies = projects.filter((p) => p.ml_anomaly).length;
  const potentialDuplicates = projects.filter((p) => p.potential_duplicates?.length > 0).length;
  const total = projects.length || 1;

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    const lat = parseFloat(project.latitude);
    const lon = parseFloat(project.longitude);
    if (!isNaN(lat) && !isNaN(lon)) {
      setMapCenter([lat, lon]);
      setMapZoom(11); 
    }
  };

  /* ---------------- FILTER PROJECTS ---------------- */
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = 
      (project.project_id || "").toLowerCase().includes(search.toLowerCase()) ||
      (project.district || "").toLowerCase().includes(search.toLowerCase());

    const matchesRisk = riskFilter === "ALL" || project.combined_risk_level === riskFilter;
    const matchesAnomaly = anomalyFilter === "ALL" || (anomalyFilter === "ANOMALY" && project.ml_anomaly) || (anomalyFilter === "NORMAL" && !project.ml_anomaly);
    const hasDuplicate = project.potential_duplicates?.length > 0;
    const matchesDuplicate = duplicateFilter === "ALL" || (duplicateFilter === "DUPLICATE" && hasDuplicate) || (duplicateFilter === "NONE" && !hasDuplicate);

    return matchesSearch && matchesRisk && matchesAnomaly && matchesDuplicate;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', background: '#f8fafc' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid #e2e8f0', borderTop: '4px solid #0ea5e9', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <h2 style={{ marginTop: '24px', color: '#0f172a', fontWeight: '600' }}>Initializing AI Engine...</h2>
        <p style={{ color: '#64748b' }}>Connecting to the sih database & analyzing projects</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <style>{`
        .dashboard-container { max-width: 1400px; margin: 0 auto; padding: 30px 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; background-color: #f8fafc; min-height: 100vh; }
        header { margin-bottom: 30px; text-align: center; }
        header h1 { font-size: 2.2rem; font-weight: 800; color: #0f172a; margin-bottom: 8px; letter-spacing: -0.5px; }
        header p { font-size: 1.1rem; color: #64748b; }
        
        .alert-feed::-webkit-scrollbar { height: 8px; }
        .alert-feed::-webkit-scrollbar-thumb { background: #fca5a5; border-radius: 4px; }
        
        .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); text-align: center; transition: transform 0.2s, box-shadow 0.2s; border: 1px solid #e2e8f0; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .stat-card span { display: block; font-size: 0.9rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 8px; }
        .stat-card strong { font-size: 2rem; font-weight: 800; color: #0f172a; }
        .stat-card.high strong { color: #ef4444; }
        .stat-card.medium strong { color: #f59e0b; }
        .stat-card.low strong { color: #10b981; }

        .panel { background: white; padding: 24px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; margin-bottom: 30px; }
        .panel h2, .panel h3 { margin-top: 0; color: #0f172a; font-weight: 700; margin-bottom: 8px; }
        .note { color: #64748b; font-size: 0.9rem; margin-bottom: 16px; }

        .distribution-bar { display: flex; height: 12px; border-radius: 6px; overflow: hidden; margin: 20px 0; background: #e2e8f0; }
        .distribution-legend { display: flex; gap: 20px; font-size: 0.9rem; font-weight: 500; color: #475569; }
        .legend-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 6px; }
        .legend-dot.high, .bar-high { background: #ef4444; }
        .legend-dot.medium, .bar-medium { background: #f59e0b; }
        .legend-dot.low, .bar-low { background: #10b981; }

        .filters { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; }
        .filters input, .filters select { padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; outline: none; transition: border-color 0.2s; background: #f8fafc; }
        .filters input:focus, .filters select:focus { border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1); }
        .filters input { flex: 1; min-width: 200px; }

        table { width: 100%; border-collapse: separate; border-spacing: 0; text-align: left; }
        th { background: #f1f5f9; color: #475569; font-weight: 600; padding: 12px 16px; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; }
        td { padding: 14px 16px; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 0.95rem; }
        tr.project-row { cursor: pointer; transition: background-color 0.2s; }
        tr.project-row:hover { background-color: #f8fafc; }
        tr.active-row { background-color: #eff6ff !important; border-left: 4px solid #3b82f6; }

        /* CORRECTED BADGE COLORS */
        .badge { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.5px; }
        
        /* Risk Badges: High=Red, Low=Green */
        .badge-risk.high { background: #fee2e2; color: #b91c1c; } 
        .badge-risk.medium { background: #fef3c7; color: #b45309; }
        .badge-risk.low { background: #d1fae5; color: #047857; } 
        
        /* Efficiency Badges: High=Green, Low=Red */
        .badge-eff.high { background: #d1fae5; color: #047857; }
        .badge-eff.medium { background: #fef3c7; color: #b45309; }
        .badge-eff.low { background: #fee2e2; color: #b91c1c; }

        .ml-yes { color: #b91c1c; font-weight: 600; }
        .ml-no { color: #047857; }

        /* Modern Glassmorphism Modal */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; animation: fadeIn 0.2s ease-out; }
        .modal-content { background: white; width: 100%; max-width: 700px; border-radius: 16px; padding: 30px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow-y: auto; max-height: 90vh; animation: slideUp 0.3s ease-out; }
        .details-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0; }
        .details-header h2 { margin: 0 0 4px 0; color: #0f172a; font-size: 1.5rem; }
        .close-button { background: #f1f5f9; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-weight: 600; color: #475569; transition: background 0.2s; }
        .close-button:hover { background: #e2e8f0; color: #0f172a; }
        
        .details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .detail-item { background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .detail-item span { display: block; font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 4px; }
        .detail-item strong { font-size: 1.1rem; color: #0f172a; }
        
        .evidence-section { background: #fff1f2; border: 1px solid #fecdd3; padding: 16px; border-radius: 8px; margin-bottom: 16px; }
        .evidence-section h3 { margin: 0 0 12px 0; color: #be123c; font-size: 1rem; }
        .evidence-section ul { margin: 0; padding-left: 20px; color: #881337; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <header>
        <h1>MPLADS AI Monitoring Dashboard</h1>
        <p>Proactive anomaly detection, risk analysis, and real-time oversight</p>
      </header>

      {error && <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontWeight: "500", border: "1px solid #f87171" }}>Error: {error}</div>}

      {projects.filter(p => p.combined_risk_score >= 80).length > 0 && (
        <div className="alert-feed" style={{ background: "linear-gradient(to right, #fee2e2, #fef2f2)", borderLeft: "4px solid #ef4444", padding: "20px", margin: "0 auto 30px auto", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <h3 style={{ margin: "0 0 12px 0", color: "#b91c1c", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.2rem" }}>🚨</span> Critical Action Required
          </h3>
          <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px" }}>
            {projects.filter(p => p.combined_risk_score >= 80).map(alert => (
              <div 
                key={alert.project_id} 
                onClick={() => handleSelectProject(alert)}
                style={{ background: "white", padding: "12px 16px", borderRadius: "8px", minWidth: "260px", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #fecdd3", transition: "transform 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <strong style={{ color: "#0f172a" }}>{alert.project_id}</strong>
                  <span style={{ background: "#ef4444", color: "white", padding: "2px 6px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "bold" }}>Score: {alert.combined_risk_score}</span>
                </div>
                <div style={{ fontSize: "0.85rem", color: "#64748b" }}>{alert.district}</div>
                <div style={{ fontSize: "0.85rem", color: "#be123c", marginTop: "4px", fontWeight: "500", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {alert.reasons[0] || "Severe Anomalies Detected"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="cards">
        <div className="stat-card"><span>Total Monitored</span><strong>{projects.length}</strong></div>
        <div className="stat-card high"><span>High Risk Signals</span><strong>{high}</strong></div>
        <div className="stat-card medium"><span>Medium Risk</span><strong>{medium}</strong></div>
        <div className="stat-card low"><span>Low Risk (Safe)</span><strong>{low}</strong></div>
        <div className="stat-card"><span>ML Anomalies</span><strong>{mlAnomalies}</strong></div>
        <div className="stat-card"><span>Duplicate Flags</span><strong>{potentialDuplicates}</strong></div>
      </div>

      <div className="panel">
        <h3>Risk Distribution Breakdown</h3>
        <p className="note">Proportion of high, medium, and low risk signals across all district projects.</p>
        <div className="distribution-bar">
          <div className="bar-high" style={{ width: `${(high / total) * 100}%` }} title={`High Risk: ${high} projects`}></div>
          <div className="bar-medium" style={{ width: `${(medium / total) * 100}%` }} title={`Medium Risk: ${medium} projects`}></div>
          <div className="bar-low" style={{ width: `${(low / total) * 100}%` }} title={`Low Risk: ${low} projects`}></div>
        </div>
        <div className="distribution-legend">
          <span><span className="legend-dot high"></span> High Risk ({((high / total) * 100).toFixed(1)}%)</span>
          <span><span className="legend-dot medium"></span> Medium Risk ({((medium / total) * 100).toFixed(1)}%)</span>
          <span><span className="legend-dot low"></span> Low Risk ({((low / total) * 100).toFixed(1)}%)</span>
        </div>
      </div>

      <div className="panel">
        <h3>Geographic Risk Distribution</h3>
        <p className="note">Displaying {filteredProjects.length} filtered project pins across states. Click markers to inspect project anomalies.</p>
        
        <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: "450px", width: "100%", borderRadius: "12px", marginTop: "10px", zIndex: 1, border: "1px solid #e2e8f0" }}>
          <MapRecenter center={mapCenter} zoom={mapZoom} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {filteredProjects.map((project) => {
            const lat = parseFloat(project.latitude);
            const lon = parseFloat(project.longitude);
            return !isNaN(lat) && !isNaN(lon) ? (
              <Marker key={project.project_id} position={[lat, lon]} icon={getMarkerIcon(project.combined_risk_level)}>
                <Popup className="custom-popup">
                  <div style={{ padding: "4px" }}>
                    <h4 style={{ margin: "0 0 4px 0", fontSize: "1.1rem" }}>{project.project_id}</h4>
                    <div style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "8px" }}>{project.work_type} • {project.district}</div>
                    <div style={{ marginBottom: "12px", fontSize: "0.9rem" }}>
                      Risk Level: <strong className={`badge badge-risk ${project.combined_risk_level.toLowerCase()}`} style={{ padding: "2px 6px" }}>{project.combined_risk_level}</strong> ({project.combined_risk_score})
                    </div>
                    <button style={{ width: "100%", padding: "6px 12px", cursor: "pointer", background: "#0ea5e9", color: "white", border: "none", borderRadius: "6px", fontWeight: "600" }} onClick={() => handleSelectProject(project)}>
                      View Full Analysis
                    </button>
                  </div>
                </Popup>
              </Marker>
            ) : null;
          })}
        </MapContainer>
      </div>

      <section className="panel">
        <h2>Project Database Analysis</h2>
        <p className="note">Live records queried from the backend SQLite database. Use filters to isolate high-risk targets.</p>

        <div className="filters">
          <input type="text" placeholder="Search by Project ID or District..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
            <option value="ALL">All Risk Levels</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>
          <select value={anomalyFilter} onChange={(e) => setAnomalyFilter(e.target.value)}>
            <option value="ALL">All ML Results</option>
            <option value="ANOMALY">ML Anomalies</option>
            <option value="NORMAL">ML Normal</option>
          </select>
          <select value={duplicateFilter} onChange={(e) => setDuplicateFilter(e.target.value)}>
            <option value="ALL">All Duplicate Results</option>
            <option value="DUPLICATE">Potential Duplicates</option>
            <option value="NONE">No Duplicates</option>
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Project ID</th>
                <th>District / State</th>
                <th>Risk Score</th>
                <th>Risk Level</th>
                <th>ML Flag</th>
                <th>Duplicates</th>
                <th>Efficiency</th>
                <th>Primary Detection Reason</th>
              </tr>
            </thead>
            <tbody>
              {[...filteredProjects]
                .sort((a, b) => b.combined_risk_score - a.combined_risk_score)
                .map((project) => (
                  <tr key={project.project_id} onClick={() => handleSelectProject(project)} className={`project-row ${selectedProject?.project_id === project.project_id ? 'active-row' : ''}`}>
                    <td><strong>{project.project_id}</strong></td>
                    <td>{project.district}, {project.state}</td>
                    <td><strong>{project.combined_risk_score}</strong></td>
                    {/* Notice the new badge-risk class */}
                    <td><span className={`badge badge-risk ${project.combined_risk_level.toLowerCase()}`}>{project.combined_risk_level}</span></td>
                    <td>{project.ml_anomaly ? <span className="ml-yes">Anomaly</span> : <span className="ml-no">Normal</span>}</td>
                    <td>{project.potential_duplicates?.length > 0 ? <span className="ml-yes">{project.potential_duplicates.length} Flags</span> : <span className="ml-no">Clean</span>}</td>
                    {/* Notice the new badge-eff class mapping correctly */}
                    <td><span className={`badge badge-eff ${project.efficiency_flag.toLowerCase()}`}>{project.efficiency_flag}</span></td>
                    <td style={{ maxWidth: "250px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {project.reasons.length > 0 ? project.reasons.join(" • ") : "No anomalies detected"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {filteredProjects.length === 0 && <p style={{ textAlign: "center", color: "#64748b", marginTop: "20px" }}>No projects match the selected filters.</p>}
      </section>

      {selectedProject && (
        <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="details-header">
              <div>
                <h2>Project {selectedProject.project_id}</h2>
                <p style={{ margin: 0, color: "#64748b" }}>Location: <strong>{selectedProject.district}, {selectedProject.state}</strong> | Type: <strong>{selectedProject.work_type}</strong></p>
              </div>
              <button className="close-button" onClick={() => setSelectedProject(null)}>✕ Close</button>
            </div>

            <div className="details-grid">
              <div className="detail-item"><span>Combined Risk Score</span><strong>{selectedProject.combined_risk_score}/100</strong></div>
              <div className="detail-item"><span>Risk Level</span><strong style={{ color: selectedProject.combined_risk_level === 'HIGH' ? '#ef4444' : selectedProject.combined_risk_level === 'MEDIUM' ? '#f59e0b' : '#10b981' }}>{selectedProject.combined_risk_level}</strong></div>
              <div className="detail-item"><span>Funds Depleted</span><strong>{(selectedProject.spending_ratio * 100).toFixed(0)}%</strong></div>
              <div className="detail-item"><span>Physical Progress</span><strong>{selectedProject.physical_progress || 0}%</strong></div>
              <div className="detail-item"><span>Timeline Delay</span><strong style={{ color: selectedProject.delay_days > 0 ? '#ef4444' : '#10b981' }}>{selectedProject.delay_days > 0 ? `${selectedProject.delay_days} days` : 'On Schedule'}</strong></div>
              
              {/* Correctly mapped modal efficiency colors: High=Green, Medium=Orange, Low=Red */}
              <div className="detail-item"><span>Efficiency Flag</span><strong style={{ color: selectedProject.efficiency_flag === 'HIGH' ? '#10b981' : selectedProject.efficiency_flag === 'MEDIUM' ? '#f59e0b' : '#ef4444' }}>{selectedProject.efficiency_flag}</strong></div>
              
              <div className="detail-item"><span>ML Detection</span><strong style={{ color: selectedProject.ml_anomaly ? '#ef4444' : '#10b981' }}>{selectedProject.ml_anomaly ? "Anomaly" : "Normal"}</strong></div>
              <div className="detail-item"><span>Fuzzy Duplicates</span><strong>{selectedProject.potential_duplicates?.length || 0} Found</strong></div>
            </div>

            <div className="evidence-section">
              <h3>Primary Detection Evidence</h3>
              {selectedProject.reasons.length > 0 ? (
                <ul>{selectedProject.reasons.map((reason, index) => <li key={index} style={{ marginBottom: "6px" }}>{reason}</li>)}</ul>
              ) : (
                <p style={{ margin: 0, color: "#881337" }}>No rule-based anomaly triggers detected.</p>
              )}
            </div>

            <div className="evidence-section" style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
              <h3 style={{ color: "#d97706" }}>Efficiency & ML Indicators</h3>
              {selectedProject.efficiency_reasons?.length > 0 ? (
                <ul style={{ color: "#b45309" }}>{selectedProject.efficiency_reasons.map((reason, index) => <li key={index} style={{ marginBottom: "6px" }}>{reason}</li>)}</ul>
              ) : (
                <p style={{ margin: 0, color: "#b45309" }}>Project execution metrics are within normal bounds.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;