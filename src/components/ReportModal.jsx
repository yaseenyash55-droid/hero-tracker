import React, { useState } from 'react';
import { Target, AlertTriangle, Shield, MapPin, Send, X } from 'lucide-react';
import { api } from '../services/api';

const HEROES = [
  { id: 'h1', name: 'Spider-Man', team: 'spidey', icon: '🕷️', color: '#ff4444', image: 'https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/sm/620-spider-man.jpg' },
  { id: 'h2', name: 'Iron Man', team: 'avengers', icon: '🦾', color: '#ffd700', image: 'https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/sm/346-iron-man.jpg' },
  { id: 'h3', name: 'Captain America', team: 'avengers', icon: '🛡️', color: '#00d2ff', image: 'https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/sm/149-captain-america.jpg' },
  { id: 'h4', name: 'Wolverine', team: 'xmen', icon: '🐺', color: '#ffd700', image: 'https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/sm/717-wolverine.jpg' },
  { id: 'h5', name: 'Cyclops', team: 'xmen', icon: '👁️', color: '#ff4444', image: 'https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/sm/196-cyclops.jpg' },
  { id: 'h6', name: 'Mr. Fantastic', team: 'ff', icon: '🧬', color: '#00d2ff', image: '' },
  { id: 'h7', name: 'Invisible Woman', team: 'ff', icon: '🛡️', color: '#00d2ff', image: '' },
  { id: 'h8', name: 'Thor', team: 'avengers', icon: '⚡', color: '#00d2ff', image: 'https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/sm/659-thor.jpg' },
];

const LOCATIONS = [
  { name: 'New York (Midtown)', lat: 40.758, lng: -73.985 },
  { name: 'San Francisco', lat: 37.774, lng: -122.419 },
  { name: 'London', lat: 51.507, lng: -0.127 },
  { name: 'Tokyo', lat: 35.676, lng: 139.650 },
  { name: 'Wakanda (Simulated)', lat: 0.313, lng: 29.980 },
  { name: 'Latveria (Border)', lat: 46.227, lng: 21.011 },
  { name: 'Sokovia (Ruins)', lat: 43.856, lng: 18.413 },
  { name: 'Genosha (Simulated)', lat: -15.423, lng: 49.332 },
  { name: 'Madripoor', lat: 1.352, lng: 103.819 }
];

const THREAT_LEVELS = [
  { id: 1, label: 'LOW', color: '#00d2ff' },
  { id: 3, label: 'ELEVATED', color: '#ffd700' },
  { id: 4, label: 'HIGH', color: '#ff8800' },
  { id: 5, label: 'OMEGA', color: '#ff4444' },
];

const ReportModal = ({ onClose }) => {
  const [heroId, setHeroId] = useState(HEROES[0].id);
  const [locationIdx, setLocationIdx] = useState(0);
  const [threatLevelId, setThreatLevelId] = useState(3);
  const [activity, setActivity] = useState('');
  const [villain, setVillain] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const hero = HEROES.find(h => h.id === heroId);
    const location = LOCATIONS[locationIdx];
    const threatLevel = THREAT_LEVELS.find(t => t.id === Number(threatLevelId));

    const sightingData = {
      hero,
      location,
      threatLevel,
      activity: activity || 'Engaging unknown hostile forces',
      villain: villain || undefined
    };

    api.reportSighting(sightingData);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, backdropFilter: 'blur(8px)'
    }}>
      <div className="glass-panel" style={{
        width: '450px', padding: '30px', borderLeft: '4px solid #ff4444',
        boxShadow: '0 10px 40px rgba(255, 68, 68, 0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#ff4444' }}>
            <AlertTriangle size={24} />
            INCIDENT COMMAND
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}><Shield size={14}/> Dispatch Hero</label>
            <select value={heroId} onChange={e => setHeroId(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px' }}>
              {HEROES.map(h => <option key={h.id} value={h.id} style={{color: 'black'}}>{h.icon} {h.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}><MapPin size={14}/> Location Zone</label>
            <select value={locationIdx} onChange={e => setLocationIdx(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px' }}>
              {LOCATIONS.map((l, i) => <option key={i} value={i} style={{color: 'black'}}>{l.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}><AlertTriangle size={14}/> Threat Level</label>
            <select value={threatLevelId} onChange={e => setThreatLevelId(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px' }}>
              {THREAT_LEVELS.map(t => <option key={t.id} value={t.id} style={{color: 'black'}}>{t.label}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Target / Villain (Optional)</label>
            <input type="text" placeholder="e.g. Magneto, Doctor Doom..." value={villain} onChange={e => setVillain(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Situation Report</label>
            <textarea placeholder="Describe the activity..." value={activity} onChange={e => setActivity(e.target.value)} rows={3} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px', resize: 'none', boxSizing: 'border-box' }} />
          </div>

          <button type="submit" style={{ marginTop: '10px', padding: '15px', background: 'linear-gradient(45deg, #ff4444, #cc0000)', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', textShadow: '0 1px 2px rgba(0,0,0,0.5)', fontFamily: 'Orbitron, sans-serif' }}>
            <Send size={18} /> BROADCAST ALERT
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
