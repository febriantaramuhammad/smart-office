// Sensor Simulator (Simplified)
const SensorSimulator = (function() {
    let intervalId = null;
    const subscribers = [];
    
    // Current sensor values
    let currentSensors = StorageService.getSensors() || {
        temperature: 24.5,
        humidity: 45,
        occupancy: 12,
        energy: 85,
        airQuality: 120,
        lastUpdate: new Date().toISOString()
    };
    
    // Generate random sensor update
    const updateSensors = () => {
        // Simulate realistic changes
        const now = new Date();
        const hour = now.getHours();
        
        // Base values with time-based patterns
        const updates = {
            temperature: currentSensors.temperature + (Math.random() - 0.5) * 0.3,
            humidity: Math.max(30, Math.min(70, currentSensors.humidity + (Math.random() - 0.5) * 1)),
            occupancy: hour >= 8 && hour <= 18 ? 
                Math.max(0, Math.floor(Math.random() * 40) + 5) : 
                Math.floor(Math.random() * 5),
            energy: Math.max(50, Math.min(150, currentSensors.energy + (Math.random() - 0.5) * 5)),
            airQuality: Math.max(50, Math.min(300, currentSensors.airQuality + (Math.random() - 0.5) * 10)),
            lastUpdate: new Date().toISOString()
        };
        
        // Apply updates
        currentSensors = StorageService.updateSensors(updates);
        
        // Notify subscribers
        subscribers.forEach(callback => {
            if (typeof callback === 'function') {
                callback(currentSensors);
            }
        });
        
        return currentSensors;
    };
    
    // Start simulation
    const start = (interval = 5000) => {
        if (intervalId) {
            clearInterval(intervalId);
        }
        
        intervalId = setInterval(updateSensors, interval);
        updateSensors(); // Initial update
        
        console.log(`Sensor simulation started (${interval}ms interval)`);
    };
    
    // Stop simulation
    const stop = () => {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    };
    
    // Subscribe to updates
    const subscribe = (callback) => {
        if (typeof callback === 'function') {
            subscribers.push(callback);
        }
        
        // Return unsubscribe function
        return () => {
            const index = subscribers.indexOf(callback);
            if (index > -1) {
                subscribers.splice(index, 1);
            }
        };
    };
    
    // Get current sensors
    const getCurrentSensors = () => {
        return { ...currentSensors };
    };
    
    // Manual update
    const updateSensor = (sensor, value) => {
        const updates = { [sensor]: value };
        currentSensors = StorageService.updateSensors(updates);
        
        subscribers.forEach(callback => {
            if (typeof callback === 'function') {
                callback(currentSensors);
            }
        });
        
        return currentSensors;
    };
    
    // Public API
    return {
        start,
        stop,
        subscribe,
        getCurrentSensors,
        updateSensors,
        updateSensor
    };
})();