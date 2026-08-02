import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';

const HeroMap = ({ sightings, manualOverride, selectedSighting, setSelectedSighting }) => {
  const globeRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef();
  
  const [mapStyle, setMapStyle] = useState('night'); // night, day, topology, dark
  const [showAtmosphere, setShowAtmosphere] = useState(true);

  // Helper to play tactical audio log
  const playAudioLog = (sighting) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      let text = `Tactical Log. ${sighting.hero.name} is ${sighting.activity} near ${sighting.location.name}. `;
      if (sighting.villain) text += `Target hostile is ${sighting.villain}. `;
      text += `Threat level is ${sighting.threatLevel.label}. `;
      
      const msg = new SpeechSynthesisUtterance(text);
      msg.rate = 1.1;
      msg.pitch = 0.9;
      // Try to find a good voice
      const voices = window.speechSynthesis.getVoices();
      const techVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'));
      if (techVoice) msg.voice = techVoice;
      
      window.speechSynthesis.speak(msg);
    }
  };

  const handleGlobeInteraction = (d) => {
    setSelectedSighting(d);
    playAudioLog(d);
    if (manualOverride && globeRef.current) {
      globeRef.current.pointOfView({ lat: d.location.lat, lng: d.location.lng, altitude: 1.5 }, 1000);
    }
  };
  const [layersMenuOpen, setLayersMenuOpen] = useState(false);

  const globeImages = {
    night: '//unpkg.com/three-globe/example/img/earth-night.jpg',
    day: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    topology: '//unpkg.com/three-globe/example/img/earth-topology.png',
    dark: '//unpkg.com/three-globe/example/img/earth-dark.jpg'
  };

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input (though there are none right now)
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      if (!globeRef.current || !manualOverride) return; // Only allow when not in auto-track
      
      const currentPov = globeRef.current.pointOfView();
      let { lat, lng, altitude } = currentPov;
      
      const step = 5; 
      const zoomStep = 0.2;
      const jumpStep = 120; // 75% roughly around the globe

      let handled = true;
      switch(e.key) {
        case 'ArrowLeft': lng -= step; break;
        case 'ArrowRight': lng += step; break;
        case 'ArrowUp': lat += step; break;
        case 'ArrowDown': lat -= step; break;
        case '+':
        case '=': altitude = Math.max(0.1, altitude - zoomStep); break;
        case '-':
        case '_': altitude = Math.min(4, altitude + zoomStep); break;
        case 'Home': lng -= jumpStep; break;
        case 'End': lng += jumpStep; break;
        case 'PageUp': lat += jumpStep; break;
        case 'PageDown': lat -= jumpStep; break;
        default: handled = false; break;
      }
      
      if (handled) {
        e.preventDefault(); // prevent default scrolling
        lat = Math.max(-90, Math.min(90, lat)); // clamp latitude
        globeRef.current.pointOfView({ lat, lng, altitude }, 250);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [manualOverride]);

  // Handle auto-tracking and auto-rotate
  useEffect(() => {
    if (globeRef.current) {
      // Enable auto-rotation when not in manual override
      globeRef.current.controls().autoRotate = !manualOverride;
      globeRef.current.controls().autoRotateSpeed = 0.5;
    }

    if (!manualOverride && sightings.length > 0 && globeRef.current) {
      const latest = sightings[0];
      // Move camera to latest sighting
      globeRef.current.pointOfView({ 
        lat: latest.location.lat, 
        lng: latest.location.lng, 
        altitude: 1.5 
      }, 1000);
    }
  }, [sightings, manualOverride, setSelectedSighting]);

  // When a specific sighting is selected from the sidebar feed, fly to it
  useEffect(() => {
    if (selectedSighting && globeRef.current) {
      globeRef.current.pointOfView({ 
        lat: selectedSighting.location.lat, 
        lng: selectedSighting.location.lng, 
        altitude: 1.2 
      }, 1000);
    }
  }, [selectedSighting]);

  return (
    <div ref={containerRef} className="map-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl={globeImages[mapStyle]}
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        showAtmosphere={showAtmosphere}
        atmosphereColor="lightskyblue"
        atmosphereAltitude={0.15}
        
        // Add pulsating radar rings for events
        ringsData={sightings}
        ringLat={d => d.location.lat}
        ringLng={d => d.location.lng}
        ringColor={d => t => d.threatLevel.color.replace(')', `, ${1-t})`).replace('rgb', 'rgba')}
        ringMaxRadius={d => d.threatLevel.level * 1.5}
        ringPropagationSpeed={1}
        ringRepeatPeriod={800}
        onRingClick={handleGlobeInteraction}
        onRingHover={(d) => {
          if (globeRef.current) {
            containerRef.current.style.cursor = d ? 'pointer' : 'default';
          }
        }}
        ringLabel={(d) => `
          <div style="background: rgba(11, 15, 25, 0.95); padding: 15px; border-left: 4px solid ${d.hero.color}; border-radius: 8px; box-shadow: 0 4px 20px ${d.hero.color}4D; width: 250px; font-family: sans-serif;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">
              <img src="${d.hero.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.hero.name)}&background=111&color=${d.hero.color.replace('#', '')}&rounded=true&bold=true`}" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid ${d.hero.color}; object-fit: cover;" />
              <div>
                <h3 style="color: ${d.hero.color}; margin: 0; font-size: 16px;">${d.hero.icon} ${d.hero.name}</h3>
                <div style="font-size: 10px; color: #8b9bb4;">${d.location.name}</div>
              </div>
            </div>
            <div style="font-size: 12px; color: white; margin-bottom: 8px;">${d.activity}</div>
            <div style="display: flex; justify-content: space-between; font-size: 11px;">
              <span style="color: #8b9bb4;">Threat:</span>
              <span style="color: ${d.threatLevel.color}; font-weight: bold;">${d.threatLevel.label}</span>
            </div>
            <div style="margin-top: 10px; font-size: 10px; color: #00d2ff; font-style: italic; text-align: center;">Click to open Tactical Dialogue</div>
          </div>
        `}
        
        // Solid dots at the center to ensure easy hovering and clicking
        pointsData={sightings}
        pointLat={d => d.location.lat}
        pointLng={d => d.location.lng}
        pointColor={d => d.threatLevel.color}
        pointAltitude={0.01}
        pointRadius={0.3}
        onPointClick={handleGlobeInteraction}
        onPointHover={(d) => {
          if (globeRef.current) {
            containerRef.current.style.cursor = d ? 'pointer' : 'default';
          }
        }}
        pointLabel={(d) => `
          <div style="background: rgba(11, 15, 25, 0.95); padding: 15px; border-left: 4px solid ${d.hero.color}; border-radius: 8px; box-shadow: 0 4px 20px ${d.hero.color}4D; width: 250px; font-family: sans-serif;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">
              <img src="${d.hero.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.hero.name)}&background=111&color=${d.hero.color.replace('#', '')}&rounded=true&bold=true`}" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid ${d.hero.color}; object-fit: cover;" />
              <div>
                <h3 style="color: ${d.hero.color}; margin: 0; font-size: 16px;">${d.hero.icon} ${d.hero.name}</h3>
                <div style="font-size: 10px; color: #8b9bb4;">${d.location.name}</div>
              </div>
            </div>
            <div style="font-size: 12px; color: white; margin-bottom: 8px;">${d.activity}</div>
            <div style="display: flex; justify-content: space-between; font-size: 11px;">
              <span style="color: #8b9bb4;">Threat:</span>
              <span style="color: ${d.threatLevel.color}; font-weight: bold;">${d.threatLevel.label}</span>
            </div>
            <div style="margin-top: 10px; font-size: 10px; color: #00d2ff; font-style: italic; text-align: center;">Click to open Tactical Dialogue</div>
          </div>
        `}
        
        // Use labels for reliable native 3D markers with hover state
        labelsData={sightings}
        labelLat={d => d.location.lat}
        labelLng={d => d.location.lng}
        labelText={d => `${d.hero.icon} ${d.hero.name}`}
        labelSize={1.5}
        labelDotRadius={0.5}
        labelColor={d => d.hero.color}
        labelResolution={2}
        labelAltitude={0.01}
        onLabelClick={handleGlobeInteraction}
        onLabelHover={(d) => {
          if (globeRef.current) {
            containerRef.current.style.cursor = d ? 'pointer' : 'default';
          }
        }}
        labelLabel={(d) => `
          <div style="background: rgba(11, 15, 25, 0.95); padding: 15px; border-left: 4px solid ${d.hero.color}; border-radius: 8px; box-shadow: 0 4px 20px ${d.hero.color}4D; width: 250px; font-family: sans-serif;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">
              <img src="${d.hero.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.hero.name)}&background=111&color=${d.hero.color.replace('#', '')}&rounded=true&bold=true`}" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid ${d.hero.color}; object-fit: cover;" />
              <div>
                <h3 style="color: ${d.hero.color}; margin: 0; font-size: 16px;">${d.hero.icon} ${d.hero.name}</h3>
                <div style="font-size: 10px; color: #8b9bb4;">${d.location.name}</div>
              </div>
            </div>
            <div style="font-size: 12px; color: white; margin-bottom: 8px;">${d.activity}</div>
            <div style="display: flex; justify-content: space-between; font-size: 11px;">
              <span style="color: #8b9bb4;">Threat:</span>
              <span style="color: ${d.threatLevel.color}; font-weight: bold;">${d.threatLevel.label}</span>
            </div>
            <div style="margin-top: 10px; font-size: 10px; color: #00d2ff; font-style: italic; text-align: center;">Click to open Tactical Dialogue</div>
          </div>
        `}
      />
      
      {/* Centered Modal Dialogue Box */}
      {selectedSighting && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div className="glass-panel" style={{
            position: 'relative',
            width: '400px',
            padding: '25px',
            borderTop: `5px solid ${selectedSighting.hero.color}`,
            borderRadius: '12px',
            boxShadow: `0 10px 40px ${selectedSighting.hero.color.replace('rgb', 'rgba').replace(')', ', 0.3)')}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            <button 
              onClick={() => setSelectedSighting(null)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '24px', lineHeight: '1', zIndex: 10 }}
            >
              ×
            </button>
            
            <div style={{ position: 'relative', width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', marginBottom: '10px' }}>
              <img 
                src={selectedSighting.hero.team === 'avengers' ? '/img/avengers.jpg' : '/img/mutants.jpg'} 
                alt="Tactical Event"
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8, filter: 'brightness(0.8) contrast(1.2)' }}
              />
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '20px 10px 10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.9))' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img 
                    src={selectedSighting.hero.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedSighting.hero.name)}&background=111&color=${selectedSighting.hero.color.replace('#', '')}&rounded=true&bold=true&size=128`} 
                    alt={selectedSighting.hero.name}
                    style={{ width: '50px', height: '50px', borderRadius: '50%', border: `2px solid ${selectedSighting.hero.color}`, boxShadow: `0 0 10px ${selectedSighting.hero.color}`, objectFit: 'cover' }}
                  />
                  <h2 style={{ color: selectedSighting.hero.color, margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px', filter: `drop-shadow(0 0 5px ${selectedSighting.hero.color})` }}>
                    <span>{selectedSighting.hero.icon}</span> {selectedSighting.hero.name}
                  </h2>
                </div>
              </div>
            </div>
            
            <div style={{ padding: '0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Location</span>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{selectedSighting.location.name}</div>
              </div>
              
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Activity</span>
                <div style={{ fontSize: '15px' }}>{selectedSighting.activity}</div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Status</div>
                  <div style={{ fontSize: '13px' }}>{selectedSighting.status}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Threat Level</div>
                  <div style={{ color: selectedSighting.threatLevel.color, fontWeight: 'bold', fontSize: '13px', textShadow: `0 0 5px ${selectedSighting.threatLevel.color}` }}>
                    {selectedSighting.threatLevel.label}
                  </div>
                </div>
              </div>
              
              {selectedSighting.villain && (
                <div style={{ background: 'rgba(255, 0, 0, 0.1)', border: '1px solid rgba(255, 0, 0, 0.3)', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#ff4444', fontWeight: 'bold' }}>⚠️ Target Hostile:</span>
                  <strong style={{ color: 'white' }}>{selectedSighting.villain}</strong>
                </div>
              )}
              
              {selectedSighting.involvedCharacters && selectedSighting.involvedCharacters.length > 0 && (
                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '10px', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Allied Forces Present:</span>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {selectedSighting.involvedCharacters.map((charName, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(0,0,0,0.4)', padding: '4px 8px', borderRadius: '20px' }}>
                        <img 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(charName)}&background=222&color=fff&rounded=true&bold=true`} 
                          alt={charName}
                          style={{ width: '20px', height: '20px', borderRadius: '50%' }}
                        />
                        <span style={{ fontSize: '11px', color: 'white' }}>{charName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedSighting.reference && (
                <div style={{ color: 'var(--accent-blue)', fontStyle: 'italic', fontSize: '12px', textAlign: 'center', marginTop: '5px' }}>
                  <span style={{opacity: 0.7}}>Database Ref:</span> {selectedSighting.reference}
                </div>
              )}
            </div>

            <button 
              onClick={() => playAudioLog(selectedSighting)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(0, 210, 255, 0.1)',
                border: '1px solid rgba(0, 210, 255, 0.3)',
                color: 'var(--accent-blue)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                letterSpacing: '1px',
                marginTop: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.borderColor = selectedSighting.hero.color; }}
              onMouseOut={(e) => { e.target.style.background = 'rgba(0, 210, 255, 0.1)'; e.target.style.borderColor = 'rgba(0, 210, 255, 0.3)'; }}
            >
              ▶ REPLAY AUDIO LOG
            </button>
          </div>
        </div>
      )}
      {/* Layer Selection Button & Menu */}
      <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 1000, fontFamily: 'Orbitron, sans-serif' }}>
        {layersMenuOpen && (
          <div className="glass-panel" style={{ 
            marginBottom: '10px', 
            padding: '15px', 
            borderRadius: '12px',
            width: '250px',
            background: 'rgba(11, 15, 25, 0.95)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
              <h4 style={{ margin: 0, color: 'white' }}>Map Details</h4>
              <button onClick={() => setLayersMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>×</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div 
                onClick={() => setMapStyle('night')}
                style={{ 
                  padding: '10px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer',
                  background: mapStyle === 'night' ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${mapStyle === 'night' ? 'var(--accent-green)' : 'transparent'}`
                }}
              >
                <div style={{ fontSize: '20px' }}>🌙</div>
                <div style={{ fontSize: '10px', marginTop: '5px' }}>Tactical Night</div>
              </div>
              
              <div 
                onClick={() => setMapStyle('day')}
                style={{ 
                  padding: '10px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer',
                  background: mapStyle === 'day' ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${mapStyle === 'day' ? 'var(--accent-green)' : 'transparent'}`
                }}
              >
                <div style={{ fontSize: '20px' }}>🌍</div>
                <div style={{ fontSize: '10px', marginTop: '5px' }}>Standard Day</div>
              </div>
              
              <div 
                onClick={() => setMapStyle('topology')}
                style={{ 
                  padding: '10px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer',
                  background: mapStyle === 'topology' ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${mapStyle === 'topology' ? 'var(--accent-green)' : 'transparent'}`
                }}
              >
                <div style={{ fontSize: '20px' }}>⛰️</div>
                <div style={{ fontSize: '10px', marginTop: '5px' }}>Topology</div>
              </div>
              
              <div 
                onClick={() => setMapStyle('dark')}
                style={{ 
                  padding: '10px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer',
                  background: mapStyle === 'dark' ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${mapStyle === 'dark' ? 'var(--accent-green)' : 'transparent'}`
                }}
              >
                <div style={{ fontSize: '20px' }}>🌑</div>
                <div style={{ fontSize: '10px', marginTop: '5px' }}>Stealth Dark</div>
              </div>
            </div>
            
            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '12px' }}>
                <input 
                  type="checkbox" 
                  checked={showAtmosphere} 
                  onChange={(e) => setShowAtmosphere(e.target.checked)} 
                />
                Show Atmosphere
              </label>
            </div>
          </div>
        )}
        
        <button 
          onClick={() => setLayersMenuOpen(!layersMenuOpen)}
          style={{
            background: 'rgba(11, 15, 25, 0.8)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
            color: 'white',
            fontSize: '24px'
          }}
          title="Map Details"
        >
          🗺️
        </button>
      </div>

    </div>
  );
};

export default HeroMap;
