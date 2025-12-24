// Dashboard Module (Simplified Version)
const DashboardModule = (function() {
    let updateInterval = null;
    
    // Load dashboard view
    const load = (container) => {
        const sensors = StorageService.getSensors();
        const devices = StorageService.getDevices();
        
        // Count active devices
        let activeDevices = 0;
        if (devices) {
            Object.values(devices).forEach(device => {
                if (device.status === 'on') {
                    activeDevices++;
                }
            });
        }
        
        container.innerHTML = `
            <section class="content-section active" id="dashboard">
                <div class="dashboard-overview">
                    <div class="status-banner">
                        <div class="office-status">
                            <div class="status-indicator active"></div>
                            <div>
                                <h3>Office Status: <span id="officeStatusText">Active</span></h3>
                                <p id="officeStatusDetail">All systems operational</p>
                            </div>
                        </div>
                        <div class="office-time">
                            <i class="fas fa-clock"></i>
                            <span id="currentTime">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                    </div>
                    
                    <div class="stats-grid">
                        <div class="stat-card">
                            <h3>Active Devices</h3>
                            <div class="value" id="activeDevices">${activeDevices}</div>
                            <div class="unit">Devices</div>
                        </div>
                        <div class="stat-card">
                            <h3>Average Temperature</h3>
                            <div class="value" id="avgTemperature">${sensors ? sensors.temperature.toFixed(1) : '0'}</div>
                            <div class="unit">°C</div>
                        </div>
                        <div class="stat-card">
                            <h3>Energy Today</h3>
                            <div class="value" id="todayEnergy">${sensors ? sensors.energy.toFixed(1) : '0'}</div>
                            <div class="unit">kWh</div>
                        </div>
                        <div class="stat-card">
                            <h3>Office Occupancy</h3>
                            <div class="value" id="currentOccupancy">${sensors ? sensors.occupancy : '0'}</div>
                            <div class="unit">People</div>
                        </div>
                    </div>
                </div>
                
                <div class="widgets-grid">
                    <div class="widget" id="widget-temperature">
                        <div class="widget-header">
                            <div class="widget-title">
                                <i class="fas fa-thermometer-half" style="color: #FF6B6B"></i>
                                <span>Temperature</span>
                            </div>
                            <div class="widget-status normal">
                                <i class="fas fa-circle"></i>
                            </div>
                        </div>
                        <div class="widget-value">
                            ${sensors ? sensors.temperature.toFixed(1) : '0'} <span class="widget-unit">°C</span>
                        </div>
                        <div class="widget-trend positive">
                            <i class="fas fa-arrow-up"></i>
                            <span>+0.5</span>
                        </div>
                        <div class="widget-progress">
                            <div class="progress-bar" style="width: ${sensors ? Math.min(100, (sensors.temperature / 40) * 100) : 0}%; background: #FF6B6B"></div>
                        </div>
                    </div>
                    
                    <div class="widget" id="widget-humidity">
                        <div class="widget-header">
                            <div class="widget-title">
                                <i class="fas fa-tint" style="color: #4ECDC4"></i>
                                <span>Humidity</span>
                            </div>
                            <div class="widget-status normal">
                                <i class="fas fa-circle"></i>
                            </div>
                        </div>
                        <div class="widget-value">
                            ${sensors ? sensors.humidity : '0'} <span class="widget-unit">%</span>
                        </div>
                        <div class="widget-trend negative">
                            <i class="fas fa-arrow-down"></i>
                            <span>-2</span>
                        </div>
                        <div class="widget-progress">
                            <div class="progress-bar" style="width: ${sensors ? sensors.humidity : 0}%; background: #4ECDC4"></div>
                        </div>
                    </div>
                    
                    <div class="widget" id="widget-energy">
                        <div class="widget-header">
                            <div class="widget-title">
                                <i class="fas fa-bolt" style="color: #F9C74F"></i>
                                <span>Energy Usage</span>
                            </div>
                            <div class="widget-status warning">
                                <i class="fas fa-circle"></i>
                            </div>
                        </div>
                        <div class="widget-value">
                            ${sensors ? sensors.energy.toFixed(1) : '0'} <span class="widget-unit">kWh</span>
                        </div>
                        <div class="widget-trend positive">
                            <i class="fas fa-arrow-up"></i>
                            <span>+5%</span>
                        </div>
                        <div class="widget-progress">
                            <div class="progress-bar" style="width: ${sensors ? Math.min(100, (sensors.energy / 200) * 100) : 0}%; background: #F9C74F"></div>
                        </div>
                    </div>
                </div>
                
                <div class="quick-actions">
                    <h2><i class="fas fa-bolt"></i> Quick Actions</h2>
                    <div class="actions-grid">
                        <button class="action-btn" id="allLightsOff">
                            <i class="fas fa-lightbulb"></i>
                            <span>All Lights Off</span>
                        </button>
                        <button class="action-btn" id="ecoMode">
                            <i class="fas fa-leaf"></i>
                            <span>Eco Mode</span>
                        </button>
                        <button class="action-btn" id="refreshData">
                            <i class="fas fa-sync"></i>
                            <span>Refresh Data</span>
                        </button>
                    </div>
                </div>
            </section>
        `;
        
        // Setup quick actions
        setupQuickActions();
        
        // Update time
        updateCurrentTime();
        if (updateInterval) {
            clearInterval(updateInterval);
        }
        updateInterval = setInterval(updateCurrentTime, 60000);
    };
    
    // Setup quick actions
    const setupQuickActions = () => {
        // All Lights Off
        const allLightsOffBtn = document.getElementById('allLightsOff');
        if (allLightsOffBtn) {
            allLightsOffBtn.addEventListener('click', function() {
                StorageService.updateDevice('lights', { status: 'off' });
                if (window.SmartOfficeApp && typeof window.SmartOfficeApp.showToast === 'function') {
                    window.SmartOfficeApp.showToast('All lights turned off', 'success');
                }
                updateDeviceStatus();
            });
        }
        
        // Eco Mode
        const ecoModeBtn = document.getElementById('ecoMode');
        if (ecoModeBtn) {
            ecoModeBtn.addEventListener('click', function() {
                StorageService.updateDevice('lights', { status: 'on', power: 70 });
                StorageService.updateDevice('ac', { status: 'on', temperature: 24 });
                if (window.SmartOfficeApp && typeof window.SmartOfficeApp.showToast === 'function') {
                    window.SmartOfficeApp.showToast('Eco mode activated', 'success');
                }
                updateDeviceStatus();
            });
        }
        
        // Refresh Data
        const refreshDataBtn = document.getElementById('refreshData');
        if (refreshDataBtn) {
            refreshDataBtn.addEventListener('click', function() {
                if (typeof SensorSimulator !== 'undefined' && typeof SensorSimulator.updateSensors === 'function') {
                    SensorSimulator.updateSensors();
                    if (window.SmartOfficeApp && typeof window.SmartOfficeApp.showToast === 'function') {
                        window.SmartOfficeApp.showToast('Data refreshed', 'info');
                    }
                }
            });
        }
    };
    
    // Update device status display
    const updateDeviceStatus = () => {
        const devices = StorageService.getDevices();
        let activeDevices = 0;
        
        if (devices) {
            Object.values(devices).forEach(device => {
                if (device.status === 'on') {
                    activeDevices++;
                }
            });
        }
        
        const activeDevicesEl = document.getElementById('activeDevices');
        if (activeDevicesEl) {
            activeDevicesEl.textContent = activeDevices;
        }
    };
    
    // Handle sensor updates
    const onSensorUpdate = (sensors) => {
        if (!sensors) return;
        
        // Update stats
        const avgTempEl = document.getElementById('avgTemperature');
        const todayEnergyEl = document.getElementById('todayEnergy');
        const currentOccupancyEl = document.getElementById('currentOccupancy');
        
        if (avgTempEl && sensors.temperature !== undefined) {
            avgTempEl.textContent = sensors.temperature.toFixed(1);
        }
        
        if (todayEnergyEl && sensors.energy !== undefined) {
            todayEnergyEl.textContent = sensors.energy.toFixed(1);
        }
        
        if (currentOccupancyEl && sensors.occupancy !== undefined) {
            currentOccupancyEl.textContent = sensors.occupancy;
        }
        
        // Update temperature widget
        const tempWidget = document.getElementById('widget-temperature');
        if (tempWidget && sensors.temperature !== undefined) {
            const valueEl = tempWidget.querySelector('.widget-value');
            const progressBar = tempWidget.querySelector('.progress-bar');
            
            if (valueEl) {
                valueEl.innerHTML = `${sensors.temperature.toFixed(1)} <span class="widget-unit">°C</span>`;
            }
            
            if (progressBar) {
                const percentage = Math.min(100, (sensors.temperature / 40) * 100);
                progressBar.style.width = `${percentage}%`;
            }
        }
        
        // Update humidity widget
        const humidityWidget = document.getElementById('widget-humidity');
        if (humidityWidget && sensors.humidity !== undefined) {
            const valueEl = humidityWidget.querySelector('.widget-value');
            const progressBar = humidityWidget.querySelector('.progress-bar');
            
            if (valueEl) {
                valueEl.innerHTML = `${sensors.humidity} <span class="widget-unit">%</span>`;
            }
            
            if (progressBar) {
                progressBar.style.width = `${sensors.humidity}%`;
            }
        }
        
        // Update energy widget
        const energyWidget = document.getElementById('widget-energy');
        if (energyWidget && sensors.energy !== undefined) {
            const valueEl = energyWidget.querySelector('.widget-value');
            const progressBar = energyWidget.querySelector('.progress-bar');
            
            if (valueEl) {
                valueEl.innerHTML = `${sensors.energy.toFixed(1)} <span class="widget-unit">kWh</span>`;
            }
            
            if (progressBar) {
                const percentage = Math.min(100, (sensors.energy / 200) * 100);
                progressBar.style.width = `${percentage}%`;
            }
        }
        
        // Update active devices count
        updateDeviceStatus();
        
        // Update office status
        updateOfficeStatus(sensors);
    };
    
    // Update office status based on sensors
    const updateOfficeStatus = (sensors) => {
        if (!sensors) return;
        
        const statusTextEl = document.getElementById('officeStatusText');
        const statusDetailEl = document.getElementById('officeStatusDetail');
        const statusIndicator = document.querySelector('.status-indicator');
        
        if (!statusTextEl || !statusDetailEl || !statusIndicator) return;
        
        let status = 'Active';
        let detail = 'All systems operational';
        let statusClass = 'active';
        
        // Check temperature
        if (sensors.temperature > 28) {
            status = 'Warning';
            detail = 'High temperature detected';
            statusClass = 'warning';
        }
        
        // Check air quality
        if (sensors.airQuality > 180) {
            status = 'Alert';
            detail = 'Poor air quality';
            statusClass = 'critical';
        }
        
        // Check occupancy during office hours
        const now = new Date();
        const hour = now.getHours();
        if (sensors.occupancy === 0 && hour >= 8 && hour <= 18) {
            status = 'Idle';
            detail = 'Office is empty during work hours';
            statusClass = 'warning';
        }
        
        // Check energy consumption
        if (sensors.energy > 120) {
            status = 'Warning';
            detail = 'High energy consumption';
            statusClass = 'warning';
        }
        
        // Update UI
        statusTextEl.textContent = status;
        statusDetailEl.textContent = detail;
        
        // Update status indicator class
        statusIndicator.className = 'status-indicator';
        if (statusClass === 'warning') {
            statusIndicator.classList.add('warning');
        } else if (statusClass === 'critical') {
            statusIndicator.classList.add('critical');
        } else {
            statusIndicator.classList.add('active');
        }
    };
    
    // Update current time
    const updateCurrentTime = () => {
        const timeEl = document.getElementById('currentTime');
        if (timeEl) {
            const now = new Date();
            timeEl.textContent = now.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
    };
    
    // Clean up resources
    const cleanup = () => {
        if (updateInterval) {
            clearInterval(updateInterval);
            updateInterval = null;
        }
    };
    
    // Public API
    return {
        load,
        onSensorUpdate,
        cleanup
    };
})();