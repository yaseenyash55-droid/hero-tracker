import React, { useState, useEffect, useMemo } from 'react';
import HeroMap from './components/HeroMap';
import SightingFeed from './components/SightingFeed';
import ReportModal from './components/ReportModal';
import { api } from './services/api';
import { Shield, Target, Volume2, VolumeX } from 'lucide-react';
import './index.css';
import 'leaflet/dist/leaflet.css';

function App() {
  const [sightings, setSightings] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isMuted, setIsMuted] = useState(true);
  const [manualOverride, setManualOverride] = useState(false);
  const [selectedSighting, setSelectedSighting] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  const isMutedRef = React.useRef(isMuted);
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    // Subscribe to mock API
    const unsubscribe = api.subscribe((event) => {
      if (event.type === 'INITIAL_STATE') {
        setSightings(event.data);
      } else if (event.type === 'NEW_SIGHTING') {
        setSightings(prev => [event.data, ...prev].slice(0, 50));
        
        // Voice announcement
        if (!isMutedRef.current && window.speechSynthesis) {
          const s = event.data;
          let text = `Alert! ${s.hero.name} is ${s.activity} near ${s.location.name}. `;
          if (s.threatLevel.level >= 4) {
            text = `Warning! ${s.threatLevel.label} level threat detected! ` + text;
          }
          if (s.villain) {
            text += ` Suspect identified as ${s.villain}.`;
          }
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.95;
          utterance.pitch = 0.8;
          window.speechSynthesis.speak(utterance);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const filteredSightings = useMemo(() => {
    if (activeFilter === 'all') return sightings;
    return sightings.filter(s => s.hero.team === activeFilter);
  }, [sightings, activeFilter]);

  return (
    <div className="app-container">
      <aside className="sidebar glass-panel">
        <div className="app-header">
          <h1 className="app-title">
            <Target size={28} color="var(--accent-blue)" />
            Hero Tracker
          </h1>
          <div className="status-indicator" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="pulse"></div>
              <span>LIVE UPLINK ACTIVE</span>
            </div>
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              style={{ 
                background: 'none', border: 'none', color: isMuted ? 'var(--text-muted)' : 'var(--accent-green)', 
                cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px'
              }}
              title={isMuted ? "Enable Voice Alerts" : "Disable Voice Alerts"}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <button 
              onClick={() => setManualOverride(!manualOverride)} 
              style={{ 
                background: manualOverride ? 'var(--accent-red)' : 'rgba(255,255,255,0.1)',
                border: '1px solid',
                borderColor: manualOverride ? 'var(--accent-red)' : 'rgba(255,255,255,0.2)',
                color: 'white', 
                cursor: 'pointer', 
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                fontFamily: 'Orbitron, sans-serif'
              }}
              title={manualOverride ? "Auto-tracking Disabled" : "Auto-tracking Enabled"}
            >
              {manualOverride ? 'MANUAL OVERRIDE: ON' : 'AUTO-TRACK: ON'}
            </button>
          </div>
        </div>

        <div className="filter-section">
          <h3 className="filter-title">Tracking Filters</h3>
          <div className="team-filters">
            <button 
              className={`team-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              <Shield size={18} /> Global Grid
            </button>
            <button 
              className={`team-btn avengers ${activeFilter === 'avengers' ? 'active avengers' : ''}`}
              onClick={() => setActiveFilter('avengers')}
            >
              <span>🅰️ Avengers</span>
            </button>
            <button 
              className={`team-btn xmen ${activeFilter === 'xmen' ? 'active xmen' : ''}`}
              onClick={() => setActiveFilter('xmen')}
            >
              <span>✖️ X-Men</span>
            </button>
            <button 
              className={`team-btn ff ${activeFilter === 'ff' ? 'active ff' : ''}`}
              onClick={() => setActiveFilter('ff')}
            >
              <span>4️⃣ Fantastic Four</span>
            </button>
            <button 
              className={`team-btn spidey ${activeFilter === 'spidey' ? 'active spidey' : ''}`}
              onClick={() => setActiveFilter('spidey')}
            >
              <span>🕸️ Spider-Man</span>
            </button>
          </div>
        </div>

        <button 
          onClick={() => setIsReportModalOpen(true)}
          style={{
            margin: '20px 0',
            padding: '12px',
            width: '100%',
            background: 'linear-gradient(45deg, #ff4444, #cc0000)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            boxShadow: '0 4px 15px rgba(255, 68, 68, 0.3)',
            fontFamily: 'Orbitron, sans-serif'
          }}
        >
          <Target size={18} /> REPORT INCIDENT
        </button>

        <div className="filter-title" style={{ marginTop: 'auto', paddingTop: '20px' }}>
          Recent Sightings ({filteredSightings.length})
        </div>
        <SightingFeed sightings={filteredSightings} onSelectSighting={setSelectedSighting} />
      </aside>

      <main className="map-container">
        <HeroMap 
          sightings={filteredSightings} 
          manualOverride={manualOverride} 
          selectedSighting={selectedSighting}
          setSelectedSighting={setSelectedSighting}
        />
      </main>

      {isReportModalOpen && (
        <ReportModal onClose={() => setIsReportModalOpen(false)} />
      )}
    </div>
  );
}

export default App;
