// Storage Service Module
const StorageService = (function() {
    const PREFIX = 'smartoffice_';
    
    const KEYS = {
        USER: `${PREFIX}user`,
        SENSORS: `${PREFIX}sensors`,
        DEVICES: `${PREFIX}devices`,
        SETTINGS: `${PREFIX}settings`,
        ACTIVITY_LOGS: `${PREFIX}activity_logs`,
        NOTIFICATIONS: `${PREFIX}notifications`,
        AI_INSIGHTS: `${PREFIX}ai_insights`,
        AUTOMATION_RULES: `${PREFIX}automation_rules`
    };
    
    // Initialize default data
    const initDefaultData = () => {
        if (!localStorage.getItem(KEYS.SENSORS)) {
            const defaultSensors = {
                temperature: 24.5,
                humidity: 45,
                occupancy: 12,
                energy: 85,
                airQuality: 120,
                lastUpdate: new Date().toISOString()
            };
            localStorage.setItem(KEYS.SENSORS, JSON.stringify(defaultSensors));
        }
        
        if (!localStorage.getItem(KEYS.DEVICES)) {
            const defaultDevices = {
                lights: { 
                    id: 'lights',
                    name: 'Office Lights',
                    status: 'on', 
                    power: 60,
                    type: 'lighting'
                },
                ac: { 
                    id: 'ac',
                    name: 'Air Conditioner',
                    status: 'on', 
                    temperature: 22,
                    type: 'climate'
                },
                cctv: { 
                    id: 'cctv',
                    name: 'Security Camera',
                    status: 'on', 
                    recording: true,
                    type: 'security'
                },
                door: { 
                    id: 'door',
                    name: 'Smart Door',
                    status: 'locked', 
                    lastAccess: new Date().toISOString(),
                    type: 'security'
                },
                purifier: { 
                    id: 'purifier',
                    name: 'Air Purifier',
                    status: 'off', 
                    mode: 'auto',
                    type: 'air_quality'
                }
            };
            localStorage.setItem(KEYS.DEVICES, JSON.stringify(defaultDevices));
        }
        
        if (!localStorage.getItem(KEYS.SETTINGS)) {
            const defaultSettings = {
                temperatureThreshold: 27,
                humidityThreshold: { min: 30, max: 60 },
                officeHours: { start: '08:00', end: '18:00' },
                energyAlert: 100,
                autoMode: true,
                theme: 'light'
            };
            localStorage.setItem(KEYS.SETTINGS, JSON.stringify(defaultSettings));
        }
        
        if (!localStorage.getItem(KEYS.AUTOMATION_RULES)) {
            const defaultRules = [
                {
                    id: 'rule1',
                    name: 'Auto AC Control',
                    condition: 'temperature > 27',
                    action: 'ac.on',
                    enabled: true
                },
                {
                    id: 'rule2',
                    name: 'Lights Off When Empty',
                    condition: 'occupancy === 0',
                    action: 'lights.off',
                    enabled: true
                },
                {
                    id: 'rule3',
                    name: 'Air Purifier on Poor AQI',
                    condition: 'airQuality > 150',
                    action: 'purifier.on',
                    enabled: true
                }
            ];
            localStorage.setItem(KEYS.AUTOMATION_RULES, JSON.stringify(defaultRules));
        }
        
        if (!localStorage.getItem(KEYS.ACTIVITY_LOGS)) {
            const defaultLogs = [
                {
                    id: generateId(),
                    type: 'system',
                    action: 'System initialized',
                    timestamp: new Date().toISOString(),
                    user: 'system'
                }
            ];
            localStorage.setItem(KEYS.ACTIVITY_LOGS, JSON.stringify(defaultLogs));
        }
    };
    
    // Helper function to generate ID
    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };
    
    // User Management
    const setUser = (userData) => {
        const user = {
            ...userData,
            loginTime: new Date().toISOString(),
            sessionId: 'session_' + Math.random().toString(36).substr(2, 9)
        };
        localStorage.setItem(KEYS.USER, JSON.stringify(user));
        logActivity({
            type: 'auth',
            action: `User ${userData.username} logged in`,
            user: userData.username
        });
        return user;
    };
    
    const getUser = () => {
        const user = localStorage.getItem(KEYS.USER);
        return user ? JSON.parse(user) : null;
    };
    
    const clearUser = () => {
        const user = getUser();
        if (user) {
            logActivity({
                type: 'auth',
                action: `User ${user.username} logged out`,
                user: user.username
            });
        }
        localStorage.removeItem(KEYS.USER);
    };
    
    const isAuthenticated = () => {
        return !!getUser();
    };
    
    // Sensor Data
    const getSensors = () => {
        const sensors = localStorage.getItem(KEYS.SENSORS);
        return sensors ? JSON.parse(sensors) : null;
    };
    
    const updateSensors = (updates) => {
        const current = getSensors() || {};
        const updated = { 
            ...current, 
            ...updates,
            lastUpdate: new Date().toISOString()
        };
        localStorage.setItem(KEYS.SENSORS, JSON.stringify(updated));
        return updated;
    };
    
    // Device Control
    const getDevices = () => {
        const devices = localStorage.getItem(KEYS.DEVICES);
        return devices ? JSON.parse(devices) : null;
    };
    
    const updateDevice = (deviceId, updates) => {
        const devices = getDevices() || {};
        if (devices[deviceId]) {
            const oldStatus = devices[deviceId].status;
            devices[deviceId] = { ...devices[deviceId], ...updates };
            localStorage.setItem(KEYS.DEVICES, JSON.stringify(devices));
            
            // Log activity if status changed
            if (updates.status && updates.status !== oldStatus) {
                logActivity({
                    type: 'device_control',
                    action: `Device ${deviceId} turned ${updates.status}`,
                    details: updates,
                    user: getUser()?.username
                });
            }
            
            return devices[deviceId];
        }
        return null;
    };
    
    // Activity Logs
    const logActivity = (activity) => {
        const logs = getActivityLogs();
        logs.unshift({
            id: generateId(),
            timestamp: new Date().toISOString(),
            ...activity
        });
        
        // Keep only last 100 logs
        if (logs.length > 100) {
            logs.length = 100;
        }
        
        localStorage.setItem(KEYS.ACTIVITY_LOGS, JSON.stringify(logs));
    };
    
    const getActivityLogs = () => {
        const logs = localStorage.getItem(KEYS.ACTIVITY_LOGS);
        return logs ? JSON.parse(logs) : [];
    };
    
    // AI Insights
    const addInsight = (insight) => {
        const insights = getInsights();
        insights.unshift({
            id: generateId(),
            timestamp: new Date().toISOString(),
            ...insight
        });
        
        if (insights.length > 20) {
            insights.length = 20;
        }
        
        localStorage.setItem(KEYS.AI_INSIGHTS, JSON.stringify(insights));
    };
    
    const getInsights = () => {
        const insights = localStorage.getItem(KEYS.AI_INSIGHTS);
        return insights ? JSON.parse(insights) : [];
    };
    
    // Notifications
    const addNotification = (notification) => {
        const notifications = getNotifications();
        notifications.unshift({
            id: generateId(),
            read: false,
            timestamp: new Date().toISOString(),
            ...notification
        });
        
        if (notifications.length > 50) {
            notifications.length = 50;
        }
        
        localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    };
    
    const getNotifications = () => {
        const notifications = localStorage.getItem(KEYS.NOTIFICATIONS);
        return notifications ? JSON.parse(notifications) : [];
    };
    
    const getUnreadNotifications = () => {
        const notifications = getNotifications();
        return notifications.filter(n => !n.read);
    };
    
    const markNotificationRead = (id) => {
        const notifications = getNotifications();
        const index = notifications.findIndex(n => n.id === id);
        if (index !== -1) {
            notifications[index].read = true;
            localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
        }
    };
    
    const markAllNotificationsRead = () => {
        const notifications = getNotifications();
        notifications.forEach(n => n.read = true);
        localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    };
    
    // Settings
    const getSettings = () => {
        const settings = localStorage.getItem(KEYS.SETTINGS);
        return settings ? JSON.parse(settings) : null;
    };
    
    const updateSettings = (updates) => {
        const current = getSettings() || {};
        const updated = { ...current, ...updates };
        localStorage.setItem(KEYS.SETTINGS, JSON.stringify(updated));
        return updated;
    };
    
    // Automation Rules
    const getAutomationRules = () => {
        const rules = localStorage.getItem(KEYS.AUTOMATION_RULES);
        return rules ? JSON.parse(rules) : [];
    };
    
    const updateAutomationRule = (ruleId, updates) => {
        const rules = getAutomationRules();
        const index = rules.findIndex(r => r.id === ruleId);
        if (index !== -1) {
            rules[index] = { ...rules[index], ...updates };
            localStorage.setItem(KEYS.AUTOMATION_RULES, JSON.stringify(rules));
            return rules[index];
        }
        return null;
    };
    
    // Export/Import
    const exportData = () => {
        const data = {};
        Object.values(KEYS).forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
                data[key.replace(PREFIX, '')] = JSON.parse(value);
            }
        });
        return JSON.stringify(data, null, 2);
    };
    
    const importData = (jsonString) => {
        try {
            const data = JSON.parse(jsonString);
            Object.keys(data).forEach(key => {
                localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(data[key]));
            });
            return true;
        } catch (error) {
            console.error('Import failed:', error);
            return false;
        }
    };
    
    const resetData = () => {
        Object.values(KEYS).forEach(key => {
            if (key !== KEYS.USER) {
                localStorage.removeItem(key);
            }
        });
        initDefaultData();
    };
    
    // Initialize on load
    initDefaultData();
    
    // Public API
    return {
        setUser,
        getUser,
        clearUser,
        isAuthenticated,
        
        getSensors,
        updateSensors,
        
        getDevices,
        updateDevice,
        
        logActivity,
        getActivityLogs,
        
        addInsight,
        getInsights,
        
        addNotification,
        getNotifications,
        getUnreadNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        
        getSettings,
        updateSettings,
        
        getAutomationRules,
        updateAutomationRule,
        
        exportData,
        importData,
        resetData
    };
})();