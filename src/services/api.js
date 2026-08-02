import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.PROD ? undefined : 'http://localhost:3001';

export class TrackerAPI {
  constructor() {
    this.socket = null;
    this.subscribers = [];
  }

  // Subscribe to real-time events
  subscribe(callback) {
    this.subscribers.push(callback);
    
    // Connect to Socket.io server if this is the first subscriber
    if (this.subscribers.length === 1 && !this.socket) {
      this.socket = io(SERVER_URL);
      
      this.socket.on('INITIAL_STATE', (data) => {
        this.subscribers.forEach(cb => cb({ type: 'INITIAL_STATE', data }));
      });
      
      this.socket.on('NEW_SIGHTING', (data) => {
        this.subscribers.forEach(cb => cb({ type: 'NEW_SIGHTING', data }));
      });
    }
    
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
      // If no more subscribers, disconnect to save resources
      if (this.subscribers.length === 0 && this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
    };
  }
}

// Export singleton instance
export const api = new TrackerAPI();
