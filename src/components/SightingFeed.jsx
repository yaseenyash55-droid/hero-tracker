import React from 'react';

const SightingFeed = ({ sightings, onSelectSighting }) => {
  if (!sightings || sightings.length === 0) {
    return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No active sightings...</div>;
  }

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="feed-container">
      {sightings.map((sighting) => (
        <div 
          key={sighting.id} 
          className="glass-panel sighting-card"
          style={{ borderLeftColor: sighting.hero.color, cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'translateX(5px)' } }}
          onClick={() => onSelectSighting(sighting)}
        >
          <div className="sighting-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img 
              src={sighting.hero.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(sighting.hero.name)}&background=111&color=${sighting.hero.color.replace('#', '')}&rounded=true&bold=true`} 
              alt={sighting.hero.name}
              style={{ width: '32px', height: '32px', borderRadius: '50%', border: `1px solid ${sighting.hero.color}`, objectFit: 'cover' }}
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <span className="hero-name" style={{ color: sighting.hero.color, margin: 0 }}>
                {sighting.hero.icon} {sighting.hero.name}
              </span>
              <span className="sighting-time" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatTime(sighting.timestamp)}</span>
            </div>
          </div>
          
          <div className="sighting-desc">
            {sighting.activity} near <strong>{sighting.location.name}</strong>.
          </div>
          
          <div style={{ marginTop: '8px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status:</span>
              <span style={{ color: 'var(--text-main)' }}>{sighting.status}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Threat Level:</span>
              <span style={{ 
                color: sighting.threatLevel.color, 
                fontWeight: 'bold',
                textShadow: `0 0 5px ${sighting.threatLevel.color}`
              }}>
                {sighting.threatLevel.label}
              </span>
            </div>
            
            {sighting.villain && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ff4444' }}>
                <span style={{ color: 'var(--text-muted)' }}>Target:</span>
                <strong>{sighting.villain}</strong>
              </div>
            )}
            
            {sighting.involvedCharacters && sighting.involvedCharacters.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Allies:</span>
                <div style={{ display: 'flex', gap: '5px', marginTop: '4px', flexWrap: 'wrap' }}>
                  {sighting.involvedCharacters.map((charName, idx) => (
                    <div key={idx} title={charName}>
                      <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(charName)}&background=222&color=fff&rounded=true&bold=true`} 
                        alt={charName}
                        style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {sighting.reference && (
              <div style={{ 
                marginTop: '6px', 
                paddingTop: '6px', 
                borderTop: '1px dashed rgba(255,255,255,0.1)',
                color: 'var(--accent-blue)',
                fontStyle: 'italic',
                fontSize: '0.75rem'
              }}>
                Database Match: {sighting.reference}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SightingFeed;
