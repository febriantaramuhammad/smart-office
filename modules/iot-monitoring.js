// IoT Monitoring Module
const IoTMonitoringModule = (function() {
    let sensorUnsubscribe = null;
    let updateInterval = null;
    
    // Sensor configuration
    const SENSOR_CONFIG = {
        temperature: {
            name: 'Temperature',
            icon: 'fa-thermometer-half',
            unit: '°C',
            min: 15,
            max: 35,
            optimalRange: { min: 20, max: 25 },
            color: '#FF6B6B',
            getStatus: (value) => {
                if (value < 18) return { status: 'low', label: 'Too Cold', color: '#4CC9F0' };
                if (value > 28) return { status: 'high', label: 'Too Hot', color: '#F72585' };
                return { status: 'optimal', label: 'Optimal', color: '#4CAF50' };
            }
        },
        humidity: {
            name: 'Humidity',
            icon: 'fa-tint',
            unit: '%',
            min: 20,
            max: 80,
            optimalRange: { min: 40, max: 60 },
            color: '#4ECDC4',
            getStatus: (value) => {
                if (value < 30) return { status: 'low', label: 'Too Dry', color: '#FF9800' };
                if (value > 70) return { status: 'high', label: 'Too Humid', color: '#F72585' };
                return { status: 'optimal', label: 'Optimal', color: '#4CAF50' };
            }
        },
        occupancy: {
            name: 'Occupancy',
            icon: 'fa-users',
            unit: 'People',
            min: 0,
            max: 50,
            optimalRange: { min: 0, max: 40 },
            color: '#45B7D1',
            getStatus: (value) => {
                if (value === 0) return { status: 'empty', label: 'Empty', color: '#9E9E9E' };
                if (value > 40) return { status: 'crowded', label: 'Crowded', color: '#F8961E' };
                return { status: 'optimal', label: 'Optimal', color: '#4CAF50' };
            }
        },
        energy: {
            name: 'Energy Usage',
            icon: 'fa-bolt',
            unit: 'kWh',
            min: 0,
            max: 200,
            optimalRange: { min: 0, max: 100 },
            color: '#F9C74F',
            getStatus: (value) => {
                if (value > 120) return { status: 'high', label: 'High Usage', color: '#F72585' };
                if (value > 80) return { status: 'warning', label: 'Moderate', color: '#F8961E' };
                return { status: 'optimal', label: 'Optimal', color: '#4CAF50' };
            }
        },
        airQuality: {
            name: 'Air Quality',
            icon: 'fa-wind',
            unit: 'AQI',
            min: 0,
            max: 300,
            optimalRange: { min: 0, max: 100 },
            color: '#9D4EDD',
            getStatus: (value) => {
                if (value > 200) return { status: 'hazardous', label: 'Hazardous', color: '#7B1FA2' };
                if (value > 150) return { status: 'unhealthy', label: 'Unhealthy', color: '#F72585' };
                if (value > 100) return { status: 'moderate', label: 'Moderate', color: '#F8961E' };
                return { status: 'good', label: 'Good', color: '#4CAF50' };
            }
        }
    };
    
    // Load IoT Monitoring view
    const load = (container) => {
        const sensors = StorageService.getSensors();
        
        container.innerHTML = `
            <section class="content-section active" id="iot-monitoring">
                <div class="monitoring-header">
                    <h2><i class="fas fa-desktop"></i> IoT Monitoring Dashboard</h2>
                    <p class="subtitle">Real-time sensor data from office environment</p>
                </div>
                
                <div class="monitoring-stats">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-satellite-dish"></i>
                        </div>
                        <div class="stat-content">
                            <h3>Active Sensors</h3>
                            <div class="stat-value" id="activeSensors">5</div>
                            <div class="stat-label">All Online</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-content">
                            <h3>Last Update</h3>
                            <div class="stat-value" id="lastUpdateTime">Now</div>
                            <div class="stat-label" id="lastUpdateAgo">0 seconds ago</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        <div class="stat-content">
                            <h3>System Health</h3>
                            <div class="stat-value" id="systemHealth">100%</div>
                            <div class="stat-label" id="healthStatus">Optimal</div>
                        </div>
                    </div>
                </div>
                
                <div class="sensors-grid" id="sensorsGrid">
                    <!-- Sensor cards will be loaded here -->
                </div>
                
                <div class="sensor-history">
                    <div class="section-header">
                        <h3><i class="fas fa-chart-line"></i> Sensor History (Last 24 Hours)</h3>
                        <div class="history-controls">
                            <button class="btn-history active" data-hours="24">24H</button>
                            <button class="btn-history" data-hours="48">48H</button>
                            <button class="btn-history" data-hours="168">7D</button>
                        </div>
                    </div>
                    <div class="history-charts" id="historyCharts">
                        <!-- History charts will be loaded here -->
                    </div>
                </div>
                
                <div class="sensor-alerts">
                    <div class="section-header">
                        <h3><i class="fas fa-exclamation-triangle"></i> Active Alerts</h3>
                        <span class="alert-count" id="alertCount">0</span>
                    </div>
                    <div class="alerts-list" id="alertsList">
                        <!-- Alerts will be loaded here -->
                    </div>
                </div>
            </section>
        `;
        
        // Load sensor cards
        loadSensorCards(sensors);
        
        // Load history charts
        loadHistoryCharts(24);
        
        // Load alerts
        loadAlerts(sensors);
        
        // Setup event listeners
        setupEventListeners();
        
        // Start periodic updates
        startUpdates();
        
        // Subscribe to sensor updates
        if (typeof SensorSimulator !== 'undefined') {
            sensorUnsubscribe = SensorSimulator.subscribe(onSensorUpdate);
        }
    };
    
    // Load sensor cards
    const loadSensorCards = (sensors) => {
        const sensorsGrid = document.getElementById('sensorsGrid');
        if (!sensorsGrid || !sensors) return;
        
        sensorsGrid.innerHTML = '';
        
        Object.keys(SENSOR_CONFIG).forEach(sensorKey => {
            const config = SENSOR_CONFIG[sensorKey];
            const value = sensors[sensorKey];
            const status = config.getStatus(value);
            
            const card = document.createElement('div');
            card.className = 'sensor-card';
            card.innerHTML = `
                <div class="sensor-card-header">
                    <div class="sensor-icon" style="background: ${config.color}20; color: ${config.color}">
                        <i class="fas ${config.icon}"></i>
                    </div>
                    <div class="sensor-info">
                        <h4 class="sensor-name">${config.name}</h4>
                        <div class="sensor-status ${status.status}">
                            <span class="status-dot" style="background: ${status.color}"></span>
                            ${status.label}
                        </div>
                    </div>
                    <div class="sensor-actions">
                        <button class="btn-sensor-action" title="View details">
                            <i class="fas fa-chart-bar"></i>
                        </button>
                    </div>
                </div>
                
                <div class="sensor-card-body">
                    <div class="sensor-value">
                        <span class="value-number">${typeof value === 'number' ? value.toFixed(config.unit === '°C' || config.unit === 'kWh' ? 1 : 0) : value}</span>
                        <span class="value-unit">${config.unit}</span>
                    </div>
                    
                    <div class="sensor-progress">
                        <div class="progress-labels">
                            <span>${config.min}${config.unit}</span>
                            <span>Optimal Range: ${config.optimalRange.min}-${config.optimalRange.max}${config.unit}</span>
                            <span>${config.max}${config.unit}</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar-background"></div>
                            <div class="progress-bar-fill" style="
                                width: ${Math.min(100, ((value - config.min) / (config.max - config.min)) * 100)}%;
                                background: ${config.color};
                            "></div>
                            <div class="progress-marker" style="
                                left: ${((config.optimalRange.min - config.min) / (config.max - config.min)) * 100}%;
                                width: ${((config.optimalRange.max - config.optimalRange.min) / (config.max - config.min)) * 100}%;
                                background: ${config.color}40;
                            "></div>
                        </div>
                    </div>
                    
                    <div class="sensor-meta">
                        <div class="meta-item">
                            <i class="fas fa-history"></i>
                            <span>Updated: <span class="update-time">Just now</span></span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-tachometer-alt"></i>
                            <span>Rate: 5s</span>
                        </div>
                    </div>
                </div>
                
                <div class="sensor-card-footer">
                    <div class="sensor-trend">
                        <i class="fas fa-arrow-up trend-up"></i>
                        <span class="trend-value">+0.5${config.unit}</span>
                        <span class="trend-label">/hour</span>
                    </div>
                    <div class="sensor-id">
                        ID: ${sensorKey.toUpperCase()}
                    </div>
                </div>
            `;
            
            sensorsGrid.appendChild(card);
        });
    };
    
    // Load history charts
    const loadHistoryCharts = (hours) => {
        const historyCharts = document.getElementById('historyCharts');
        if (!historyCharts) return;
        
        // Generate sample historical data
        const historicalData = generateHistoricalData(hours);
        
        historyCharts.innerHTML = `
            <div class="chart-container">
                <div class="chart-header">
                    <h4>Temperature Trend</h4>
                    <span class="chart-value">${historicalData.temperature.current}°C</span>
                </div>
                <canvas id="tempChart" width="400" height="150"></canvas>
            </div>
            
            <div class="chart-container">
                <div class="chart-header">
                    <h4>Energy Consumption</h4>
                    <span class="chart-value">${historicalData.energy.current}kWh</span>
                </div>
                <canvas id="energyChart" width="400" height="150"></canvas>
            </div>
            
            <div class="chart-container">
                <div class="chart-header">
                    <h4>Occupancy Trend</h4>
                    <span class="chart-value">${historicalData.occupancy.current} people</span>
                </div>
                <canvas id="occupancyChart" width="400" height="150"></canvas>
            </div>
        `;
        
        // Render charts
        renderChart('tempChart', historicalData.temperature, '#FF6B6B', '°C');
        renderChart('energyChart', historicalData.energy, '#F9C74F', 'kWh');
        renderChart('occupancyChart', historicalData.occupancy, '#45B7D1', '');
    };
    
    // Generate historical data
    const generateHistoricalData = (hours) => {
        const now = new Date();
        const dataPoints = Math.min(hours * 12, 100); // Max 100 points
        
        const temperatureData = [];
        const energyData = [];
        const occupancyData = [];
        const labels = [];
        
        const sensors = StorageService.getSensors();
        const currentTemp = sensors?.temperature || 24.5;
        const currentEnergy = sensors?.energy || 85;
        const currentOccupancy = sensors?.occupancy || 12;
        
        // Generate data with realistic patterns
        for (let i = dataPoints - 1; i >= 0; i--) {
            const time = new Date(now);
            time.setMinutes(time.getMinutes() - i * 5); // 5-minute intervals
            
            // Time-based patterns
            const hour = time.getHours();
            const isDayTime = hour >= 8 && hour <= 18;
            
            // Temperature pattern (cooler at night)
            const tempBase = isDayTime ? 24 : 22;
            const tempVariation = Math.sin(i / 10) * 2 + Math.random() * 0.5;
            temperatureData.push(tempBase + tempVariation);
            
            // Energy pattern (higher during day)
            const energyBase = isDayTime ? 80 : 50;
            const energyVariation = Math.sin(i / 8) * 20 + Math.random() * 5;
            energyData.push(Math.max(30, energyBase + energyVariation));
            
            // Occupancy pattern (office hours)
            const occupancyBase = isDayTime ? 15 : 3;
            const occupancyVariation = Math.random() * 10;
            occupancyData.push(Math.max(0, occupancyBase + occupancyVariation));
            
            // Label (time)
            labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
        
        return {
            temperature: {
                data: temperatureData,
                current: currentTemp.toFixed(1),
                min: Math.min(...temperatureData).toFixed(1),
                max: Math.max(...temperatureData).toFixed(1),
                avg: (temperatureData.reduce((a, b) => a + b, 0) / temperatureData.length).toFixed(1)
            },
            energy: {
                data: energyData,
                current: currentEnergy.toFixed(1),
                min: Math.min(...energyData).toFixed(1),
                max: Math.max(...energyData).toFixed(1),
                avg: (energyData.reduce((a, b) => a + b, 0) / energyData.length).toFixed(1)
            },
            occupancy: {
                data: occupancyData,
                current: currentOccupancy,
                min: Math.min(...occupancyData),
                max: Math.max(...occupancyData),
                avg: Math.round(occupancyData.reduce((a, b) => a + b, 0) / occupancyData.length)
            },
            labels: labels
        };
    };
    
    // Render chart on canvas
    const renderChart = (canvasId, data, color, unit) => {
        const canvas = document.getElementById(canvasId);
        if (!canvas || !data.data || data.data.length === 0) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Calculate dimensions
        const padding = 20;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        
        // Find data range
        const values = data.data;
        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);
        const range = maxVal - minVal || 1;
        
        // Draw grid
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        
        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight * (1 - i / 5));
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
            
            // Value labels
            ctx.fillStyle = '#666';
            ctx.font = '10px Arial';
            ctx.textAlign = 'right';
            ctx.fillText((minVal + (range * i / 5)).toFixed(1) + unit, padding - 5, y + 3);
        }
        
        // Draw data line
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        
        values.forEach((value, index) => {
            const x = padding + (chartWidth * (index / (values.length - 1)));
            const y = padding + chartHeight * (1 - ((value - minVal) / range));
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw data points
        ctx.fillStyle = color;
        values.forEach((value, index) => {
            if (index % 5 === 0) { // Draw fewer points for performance
                const x = padding + (chartWidth * (index / (values.length - 1)));
                const y = padding + chartHeight * (1 - ((value - minVal) / range));
                
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        // Draw area under line
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.moveTo(padding, padding + chartHeight);
        
        values.forEach((value, index) => {
            const x = padding + (chartWidth * (index / (values.length - 1)));
            const y = padding + chartHeight * (1 - ((value - minVal) / range));
            ctx.lineTo(x, y);
        });
        
        ctx.lineTo(width - padding, padding + chartHeight);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.globalAlpha = 1;
        
        // Draw min/max markers
        const minIndex = values.indexOf(minVal);
        const maxIndex = values.indexOf(maxVal);
        
        [minIndex, maxIndex].forEach((index, i) => {
            if (index >= 0) {
                const x = padding + (chartWidth * (index / (values.length - 1)));
                const y = padding + chartHeight * (1 - ((values[index] - minVal) / range));
                
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, Math.PI * 2);
                ctx.fillStyle = i === 0 ? '#4CAF50' : '#F72585';
                ctx.fill();
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        });
    };
    
    // Load alerts
    const loadAlerts = (sensors) => {
        const alertsList = document.getElementById('alertsList');
        const alertCount = document.getElementById('alertCount');
        if (!alertsList || !alertCount || !sensors) return;
        
        const alerts = [];
        
        // Check each sensor for alerts
        Object.keys(SENSOR_CONFIG).forEach(sensorKey => {
            const config = SENSOR_CONFIG[sensorKey];
            const value = sensors[sensorKey];
            const status = config.getStatus(value);
            
            if (status.status !== 'optimal' && status.status !== 'good') {
                alerts.push({
                    sensor: config.name,
                    value: value,
                    unit: config.unit,
                    status: status,
                    message: `${config.name} is ${status.label.toLowerCase()} (${value}${config.unit})`,
                    priority: status.status === 'hazardous' || status.status === 'unhealthy' ? 'high' : 'medium',
                    time: new Date().toLocaleTimeString()
                });
            }
        });
        
        // Update alert count
        alertCount.textContent = alerts.length;
        
        if (alerts.length === 0) {
            alertsList.innerHTML = `
                <div class="alert-item no-alerts">
                    <i class="fas fa-check-circle"></i>
                    <div class="alert-content">
                        <div class="alert-title">No Active Alerts</div>
                        <div class="alert-message">All sensors are within optimal ranges</div>
                    </div>
                </div>
            `;
            return;
        }
        
        // Display alerts
        alertsList.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.priority}">
                <div class="alert-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">${alert.sensor} Alert</div>
                    <div class="alert-message">${alert.message}</div>
                    <div class="alert-meta">
                        <span class="alert-time"><i class="fas fa-clock"></i> ${alert.time}</span>
                        <span class="alert-value" style="color: ${alert.status.color}">${alert.value}${alert.unit}</span>
                    </div>
                </div>
                <button class="alert-action" title="Acknowledge">
                    <i class="fas fa-check"></i>
                </button>
            </div>
        `).join('');
    };
    
    // Setup event listeners
    const setupEventListeners = () => {
        // History time period buttons
        const historyButtons = document.querySelectorAll('.btn-history');
        historyButtons.forEach(button => {
            button.addEventListener('click', function() {
                historyButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                const hours = parseInt(this.getAttribute('data-hours'));
                loadHistoryCharts(hours);
            });
        });
        
        // Sensor action buttons
        document.querySelectorAll('.btn-sensor-action').forEach(button => {
            button.addEventListener('click', function() {
                const sensorCard = this.closest('.sensor-card');
                const sensorName = sensorCard.querySelector('.sensor-name').textContent;
                if (window.SmartOfficeApp && typeof window.SmartOfficeApp.showToast === 'function') {
                    window.SmartOfficeApp.showToast(`Viewing details for ${sensorName}`, 'info');
                }
            });
        });
        
        // Alert acknowledge buttons
        document.querySelectorAll('.alert-action').forEach(button => {
            button.addEventListener('click', function() {
                const alertItem = this.closest('.alert-item');
                alertItem.style.opacity = '0.5';
                setTimeout(() => {
                    alertItem.remove();
                    updateAlertCount();
                }, 300);
            });
        });
    };
    
    // Update alert count
    const updateAlertCount = () => {
        const alertCount = document.getElementById('alertCount');
        const alerts = document.querySelectorAll('.alert-item:not(.no-alerts)');
        if (alertCount) {
            alertCount.textContent = alerts.length;
        }
    };
    
    // Start periodic updates
    const startUpdates = () => {
        // Update last update time every second
        updateInterval = setInterval(() => {
            const lastUpdateTime = document.getElementById('lastUpdateTime');
            const lastUpdateAgo = document.getElementById('lastUpdateAgo');
            
            if (lastUpdateTime && lastUpdateAgo) {
                const sensors = StorageService.getSensors();
                if (sensors && sensors.lastUpdate) {
                    const updateTime = new Date(sensors.lastUpdate);
                    const now = new Date();
                    const diffSeconds = Math.floor((now - updateTime) / 1000);
                    
                    lastUpdateTime.textContent = updateTime.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        second: '2-digit'
                    });
                    
                    if (diffSeconds < 60) {
                        lastUpdateAgo.textContent = `${diffSeconds} seconds ago`;
                    } else if (diffSeconds < 3600) {
                        lastUpdateAgo.textContent = `${Math.floor(diffSeconds / 60)} minutes ago`;
                    } else {
                        lastUpdateAgo.textContent = `${Math.floor(diffSeconds / 3600)} hours ago`;
                    }
                }
            }
        }, 1000);
    };
    
    // Handle sensor updates
    const onSensorUpdate = (sensors) => {
        // Update sensor cards
        loadSensorCards(sensors);
        
        // Update alerts
        loadAlerts(sensors);
        
        // Update system health
        updateSystemHealth(sensors);
        
        // Update last update time
        const lastUpdateTime = document.getElementById('lastUpdateTime');
        if (lastUpdateTime) {
            lastUpdateTime.textContent = 'Now';
        }
        const lastUpdateAgo = document.getElementById('lastUpdateAgo');
        if (lastUpdateAgo) {
            lastUpdateAgo.textContent = '0 seconds ago';
        }
    };
    
    // Update system health
    const updateSystemHealth = (sensors) => {
        const systemHealth = document.getElementById('systemHealth');
        const healthStatus = document.getElementById('healthStatus');
        
        if (!systemHealth || !healthStatus || !sensors) return;
        
        // Calculate health score based on sensor status
        let healthScore = 100;
        let issues = 0;
        
        Object.keys(SENSOR_CONFIG).forEach(sensorKey => {
            const config = SENSOR_CONFIG[sensorKey];
            const value = sensors[sensorKey];
            const status = config.getStatus(value);
            
            if (status.status !== 'optimal' && status.status !== 'good') {
                issues++;
                if (status.status === 'hazardous' || status.status === 'unhealthy') {
                    healthScore -= 30;
                } else {
                    healthScore -= 10;
                }
            }
        });
        
        healthScore = Math.max(0, healthScore);
        
        systemHealth.textContent = `${healthScore}%`;
        
        if (healthScore >= 90) {
            healthStatus.textContent = 'Optimal';
            healthStatus.style.color = '#4CAF50';
        } else if (healthScore >= 70) {
            healthStatus.textContent = 'Good';
            healthStatus.style.color = '#8BC34A';
        } else if (healthScore >= 50) {
            healthStatus.textContent = 'Fair';
            healthStatus.style.color = '#FFC107';
        } else if (healthScore >= 30) {
            healthStatus.textContent = 'Poor';
            healthStatus.style.color = '#FF9800';
        } else {
            healthStatus.textContent = 'Critical';
            healthStatus.style.color = '#F44336';
        }
    };
    
    // Clean up
    const cleanup = () => {
        if (sensorUnsubscribe) {
            sensorUnsubscribe();
            sensorUnsubscribe = null;
        }
        
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