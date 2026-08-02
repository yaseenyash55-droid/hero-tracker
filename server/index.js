const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const path = require('path');

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../dist')));

// SPA fallback
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Data sets for generating events
const heroes = [
  { id: 'h1', name: 'Spider-Man', team: 'spidey', icon: '🕷️', color: '#ff4444', image: 'https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/sm/620-spider-man.jpg' },
  { id: 'h2', name: 'Iron Man', team: 'avengers', icon: '🦾', color: '#ffd700', image: 'https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/sm/346-iron-man.jpg' },
  { id: 'h3', name: 'Captain America', team: 'avengers', icon: '🛡️', color: '#00d2ff', image: 'https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/sm/149-captain-america.jpg' },
  { id: 'h4', name: 'Wolverine', team: 'xmen', icon: '🐺', color: '#ffd700', image: 'https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/sm/717-wolverine.jpg' },
  { id: 'h5', name: 'Cyclops', team: 'xmen', icon: '👁️', color: '#ff4444', image: 'https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/sm/196-cyclops.jpg' },
  { id: 'h6', name: 'Mr. Fantastic', team: 'ff', icon: '🧬', color: '#00d2ff', image: '' },
  { id: 'h7', name: 'Invisible Woman', team: 'ff', icon: '🛡️', color: '#00d2ff', image: '' },
  { id: 'h8', name: 'Thor', team: 'avengers', icon: '⚡', color: '#00d2ff', image: 'https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/sm/659-thor.jpg' },
];

const locations = [
  // North America
  { name: 'New York (Midtown)', lat: 40.758, lng: -73.985 },
  { name: 'San Francisco', lat: 37.774, lng: -122.419 },
  { name: 'Los Angeles', lat: 34.052, lng: -118.243 },
  { name: 'Chicago', lat: 41.878, lng: -87.629 },
  { name: 'Toronto', lat: 43.653, lng: -79.383 },
  { name: 'Mexico City', lat: 19.432, lng: -99.133 },
  
  // South America
  { name: 'São Paulo', lat: -23.550, lng: -46.633 },
  { name: 'Rio de Janeiro', lat: -22.906, lng: -43.172 },
  { name: 'Buenos Aires', lat: -34.603, lng: -58.381 },
  { name: 'Bogotá', lat: 4.711, lng: -74.072 },
  { name: 'Lima', lat: -12.046, lng: -77.042 },

  // Europe
  { name: 'London', lat: 51.507, lng: -0.127 },
  { name: 'Paris', lat: 48.856, lng: 2.352 },
  { name: 'Berlin', lat: 52.520, lng: 13.405 },
  { name: 'Rome', lat: 41.902, lng: 12.496 },
  { name: 'Moscow', lat: 55.755, lng: 37.617 },
  { name: 'Madrid', lat: 40.416, lng: -3.703 },
  
  // Fictional / Marvel specific
  { name: 'Sokovia (Ruins)', lat: 45.267, lng: 19.833 },
  { name: 'Latveria (Border)', lat: 46.227, lng: 21.312 },
  { name: 'Genosha (Simulated)', lat: -13.983, lng: 48.183 },
  { name: 'Wakanda (Simulated)', lat: 1.292, lng: 36.821 },
  { name: 'Madripoor', lat: 1.352, lng: 103.819 },
  { name: 'Symkaria', lat: 45.5, lng: 20.0 },

  // Africa
  { name: 'Cairo', lat: 30.044, lng: 31.235 },
  { name: 'Lagos', lat: 6.524, lng: 3.379 },
  { name: 'Nairobi', lat: -1.292, lng: 36.821 },
  { name: 'Johannesburg', lat: -26.204, lng: 28.047 },
  { name: 'Casablanca', lat: 33.573, lng: -7.589 },

  // Asia
  { name: 'Tokyo', lat: 35.676, lng: 139.650 },
  { name: 'Seoul', lat: 37.566, lng: 126.978 },
  { name: 'Beijing', lat: 39.904, lng: 116.407 },
  { name: 'Shanghai', lat: 31.230, lng: 121.473 },
  { name: 'Mumbai', lat: 19.076, lng: 72.877 },
  { name: 'Delhi', lat: 28.704, lng: 77.102 },
  { name: 'Dubai', lat: 25.204, lng: 55.270 },
  { name: 'Singapore', lat: 1.352, lng: 103.819 },
  { name: 'Bangkok', lat: 13.756, lng: 100.501 },

  // Oceania
  { name: 'Sydney', lat: -33.868, lng: 151.209 },
  { name: 'Melbourne', lat: -37.813, lng: 144.963 },
  { name: 'Auckland', lat: -36.848, lng: 174.763 }
];

const activities = [
  "Engaged in combat with hostiles",
  "Patrolling sector",
  "Investigating anomalous energy signature",
  "Assisting civilians",
  "Pursuing high-speed target",
  "Holding position",
  "Containing biological threat",
  "Defusing explosive device"
];

const villains = [
  "Doctor Doom", "Magneto", "Thanos", "Green Goblin", 
  "Loki", "Ultron", "Red Skull", "Sabretooth", "Kingpin"
];

const threatLevels = [
  { level: 1, label: 'Low', color: 'rgb(0, 255, 136)' },
  { level: 2, label: 'Elevated', color: 'rgb(255, 255, 0)' },
  { level: 3, label: 'High', color: 'rgb(255, 165, 0)' },
  { level: 4, label: 'Severe', color: 'rgb(255, 69, 0)' },
  { level: 5, label: 'Omega', color: 'rgb(255, 0, 0)' }
];

const statuses = ["Situation Contained", "Reinforcements Needed", "In Progress", "Suspect Apprehended", "Area Secured"];

const references = [
  "Matches profile of Secret Wars #8",
  "Similar to events in Infinity War",
  "See Uncanny X-Men #141 (Days of Future Past)",
  "Correlates with The Avengers (2012) Battle of New York",
  "Matches signature of Age of Ultron",
  "See Amazing Spider-Man #300",
  "Similar to Civil War incident",
  "Correlates with X-Men: Apocalypse",
  "Matches profile of Fantastic Four #48 (Galactus Trilogy)",
  "See Spider-Man: No Way Home multiverse rift"
];

const generateId = () => Math.random().toString(36).substr(2, 9);

let activeSightings = [];

// Helper to generate a sighting with enhanced details
const generateSighting = () => {
  const hero = heroes[Math.floor(Math.random() * heroes.length)];
  const baseLoc = locations[Math.floor(Math.random() * locations.length)];
  
  const lat = baseLoc.lat + (Math.random() - 0.5) * 0.5;
  const lng = baseLoc.lng + (Math.random() - 0.5) * 0.5;
  const activity = activities[Math.floor(Math.random() * activities.length)];
  
  // 40% chance of a villain being involved
  const villain = Math.random() > 0.6 ? villains[Math.floor(Math.random() * villains.length)] : null;
  const threatLevel = threatLevels[Math.floor(Math.random() * threatLevels.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const reference = references[Math.floor(Math.random() * references.length)];
  
  // Get 0 to 2 other heroes from the same team as involved characters
  const involvedCharacters = heroes
    .filter(h => h.team === hero.team && h.id !== hero.id)
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * 3))
    .map(h => h.name);
  
  const sighting = {
    id: generateId(),
    hero,
    location: { lat, lng, name: baseLoc.name },
    activity,
    timestamp: new Date().toISOString(),
    threatLevel,
    villain,
    status,
    reference,
    involvedCharacters
  };

  activeSightings = [sighting, ...activeSightings].slice(0, 50);
  return sighting;
};

// Generate some initial data
for (let i = 0; i < 5; i++) {
  generateSighting();
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send current state to new client
  socket.emit('INITIAL_STATE', activeSightings);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Broadcast new sightings periodically
setInterval(() => {
  const newSighting = generateSighting();
  io.emit('NEW_SIGHTING', newSighting);
  console.log(`Broadcasted new sighting: ${newSighting.hero.name} at ${newSighting.location.name}`);
}, Math.random() * 5000 + 4000); // Every 4-9 seconds

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Marvel Tracker Backend running on port ${PORT}`);
});
