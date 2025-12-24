// Device Control Module
const DeviceControlModule = (function() {
    let deviceUpdateInterval = null;
    
    // Device configuration
    const DEVICE_CONFIG = {
        lights: {
            name: 'Office Lights',
            icon: 'fa-lightbulb',
            type: 'lighting',
            color: '#FFD700',
            states: {
                on: { label: 'ON', color: '#4CAF50', value: true },
                off: { label: 'OFF', color: '#F44336', value: false }
            },
            controls: [
                {
                    type: 'toggle',
                    id: 'lights-toggle',
                    label: 'Power'
                },
                {
                    type: 'slider',
                    id: 'lights-brightness',
                    label: 'Brightness',
                    min: 0,
                    max: 100,
                    unit: '%',
                    value: 60
                }
            ],
            room: 'Main Office',
            power: 200, // watts
            description: 'Main office lighting system'
        },
        ac: {
            name: 'Air Conditioner',
            icon: 'fa-snowflake',
            type: 'climate',
            color: '#4CC9F0',
            states: {
                on: { label: 'COOLING', color: '#4CAF50', value: true },
                off: { label: 'OFF', color: '#F44336', value: false },
                auto: { label: 'AUTO', color: '#2196F3', value: 'auto' }
            },
            controls: [
                {
                    type: 'toggle',
                    id: 'ac-toggle',
                    label: 'Power'
                },
                {
                    type: 'slider',
                    id: 'ac-temperature',
                    label: 'Temperature',
                    min: 16,
                    max: 30,
                    unit: '°C',
                    value: 22
                },
                {
                    type: 'select',
                    id: 'ac-mode',
                    label: 'Mode',
                    options: [
                        { value: 'cool', label: 'Cool' },
                        { value: 'dry', label: 'Dry' },
                        { value: 'fan', label: 'Fan' },
                        { value: 'auto', label: 'Auto' }
                    ]
                }
            ],
            room: 'Main Office',
            power: 1500, // watts
            description: 'Central air conditioning system'
        },
        cctv: {
            name: 'Security Camera',
            icon: 'fa-video',
            type: 'security',
            color: '#7209B7',
            states: {
                on: { label: 'RECORDING', color: '#4CAF50', value: true },
                off: { label: 'OFF', color: '#F44336', value: false },
                standby: { label: 'STANDBY', color: '#FF9800', value: 'standby' }
            },
            controls: [
                {
                    type: 'toggle',
                    id: 'cctv-toggle',
                    label: 'Power'
                },
                {
                    type: 'button',
                    id: 'cctv-snapshot',
                    label: 'Take Snapshot',
                    icon: 'fa-camera'
                },
                {
                    type: 'select',
                    id: 'cctv-quality',
                    label: 'Quality',
                    options: [
                        { value: 'low', label: 'Low (480p)' },
                        { value: 'medium', label: 'Medium (720p)' },
                        { value: 'high', label: 'High (1080p)' },
                        { value: 'ultra', label: 'Ultra (4K)' }
                    ]
                }
            ],
            room: 'Entrance',
            power: 50, // watts
            description: 'Security surveillance camera'
        },
        door: {
            name: 'Smart Door',
            icon: 'fa-door-closed',
            type: 'security',
            color: '#F8961E',
            states: {
                locked: { label: 'LOCKED', color: '#4CAF50', value: 'locked' },
                unlocked: { label: 'UNLOCKED', color: '#2196F3', value: 'unlocked' },
                open: { label: 'OPEN', color: '#FF9800', value: 'open' }
            },
            controls: [
                {
                    type: 'toggle',
                    id: 'door-lock',
                    label: 'Lock',
                    onLabel: 'Locked',
                    offLabel: 'Unlocked'
                },
                {
                    type: 'button',
                    id: 'door-open',
                    label: 'Open Door',
                    icon: 'fa-door-open'
                },
                {
                    type: 'button',
                    id: 'door-close',
                    label: 'Close Door',
                    icon: 'fa-door-closed'
                }
            ],
            room: 'Main Entrance',
            power: 20, // watts
            description: 'Smart door lock system'
        },
        purifier: {
            name: 'Air Purifier',
            icon: 'fa-wind',
            type: 'air_quality',
            color: '#06D6A0',
            states: {
                on: { label: 'PURIFYING', color: '#4CAF50', value: true },
                off: { label: 'OFF', color: '#F44336', value: false },
                auto: { label: 'AUTO', color: '#2196F3', value: 'auto' }
            },
            controls: [
                {
                    type: 'toggle',
                    id: 'purifier-toggle',
                    label: 'Power'
                },
                {
                    type: 'select',
                    id: 'purifier-mode',
                    label: 'Mode',
                    options: [
                        { value: 'auto', label: 'Auto' },
                        { value: 'silent', label: 'Silent' },
                        { value: 'turbo', label: 'Turbo' },
                        { value: 'sleep', label: 'Sleep' }
                    ]
                },
                {
                    type: 'slider',
                    id: 'purifier-speed',
                    label: 'Fan Speed',
                    min: 1,
                    max: 5,
                    unit: 'level',
                    value: 3
                }
            ],
            room: 'Meeting Room',
            power: 100, // watts
            description: 'Air purification system'
        }
    };
    
    // Load Device Control view
    const load = (container) => {
        const devices = StorageService.getDevices();
        
        container.innerHTML = `
            <section class="content-section active" id="device-control">
                <div class="device-control-header">
                    <h2><i class="fas fa-sliders-h"></i> Device Control Panel</h2>
                    <p class="subtitle">Control and monitor all IoT devices in your office</p>
                </div>
                
                <div class="device-summary">
                    <div class="summary-card">
                        <div class="summary-icon">
                            <i class="fas fa-plug"></i>
                        </div>
                        <div class="summary-content">
                            <h3>Total Devices</h3>
                            <div class="summary-value" id="totalDevices">5</div>
                            <div class="summary-label">Connected</div>
                        </div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-icon">
                            <i class="fas fa-bolt"></i>
                        </div>
                        <div class="summary-content">
                            <h3>Power Usage</h3>
                            <div class="summary-value" id="totalPower">0 W</div>
                            <div class="summary-label">Total Consumption</div>
                        </div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="summary-content">
                            <h3>Online Devices</h3>
                            <div class="summary-value" id="onlineDevices">0</div>
                            <div class="summary-label">Currently Active</div>
                        </div>
                    </div>
                </div>
                
                <div class="device-controls-grid" id="deviceControlsGrid">
                    <!-- Device control cards will be loaded here -->
                </div>
                
                <div class="bulk-actions">
                    <h3><i class="fas fa-layer-group"></i> Bulk Actions</h3>
                    <div class="bulk-buttons">
                        <button class="bulk-btn" id="allOnBtn">
                            <i class="fas fa-power-off"></i>
                            <span>Turn All On</span>
                        </button>
                        <button class="bulk-btn" id="allOffBtn">
                            <i class="fas fa-power-off"></i>
                            <span>Turn All Off</span>
                        </button>
                        <button class="bulk-btn" id="ecoModeBtn">
                            <i class="fas fa-leaf"></i>
                            <span>Eco Mode</span>
                        </button>
                        <button class="bulk-btn" id="nightModeBtn">
                            <i class="fas fa-moon"></i>
                            <span>Night Mode</span>
                        </button>
                    </div>
                </div>
                
                <div class="device-history">
                    <div class="section-header">
                        <h3><i class="fas fa-history"></i> Recent Device Activity</h3>
                        <button class="btn-refresh" id="refreshActivity">
                            <i class="fas fa-sync-alt"></i> Refresh
                        </button>
                    </div>
                    <div class="activity-table-container">
                        <table class="activity-table">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Device</th>
                                    <th>Action</th>
                                    <th>Status</th>
                                    <th>User</th>
                                </tr>
                            </thead>
                            <tbody id="deviceActivityTable">
                                <!-- Activity rows will be loaded here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        `;
        
        // Load device controls
        loadDeviceControls(devices);
        
        // Load device activity
        loadDeviceActivity();
        
        // Setup event listeners
        setupEventListeners();
        
        // Start periodic updates
        startDeviceUpdates();
        
        // Update summary
        updateDeviceSummary(devices);
    };
    
    // Load device controls
    const loadDeviceControls = (devices) => {
        const deviceGrid = document.getElementById('deviceControlsGrid');
        if (!deviceGrid || !devices) return;
        
        deviceGrid.innerHTML = '';
        
        Object.keys(DEVICE_CONFIG).forEach(deviceId => {
            const config = DEVICE_CONFIG[deviceId];
            const device = devices[deviceId];
            const deviceStatus = device?.status || 'off';
            const stateConfig = config.states[deviceStatus] || config.states.off;
            
            const card = document.createElement('div');
            card.className = 'device-card';
            card.dataset.deviceId = deviceId;
            card.innerHTML = `
                <div class="device-card-header">
                    <div class="device-icon" style="background: ${config.color}20; color: ${config.color}">
                        <i class="fas ${config.icon}"></i>
                    </div>
                    <div class="device-info">
                        <h4 class="device-name">${config.name}</h4>
                        <div class="device-room">
                            <i class="fas fa-map-marker-alt"></i>
                            ${config.room}
                        </div>
                    </div>
                    <div class="device-status ${deviceStatus}">
                        <span class="status-dot" style="background: ${stateConfig.color}"></span>
                        ${stateConfig.label}
                    </div>
                </div>
                
                <div class="device-card-body">
                    <p class="device-description">${config.description}</p>
                    
                    <div class="device-power">
                        <div class="power-info">
                            <i class="fas fa-bolt"></i>
                            <span>Power: ${config.power}W</span>
                        </div>
                        <div class="power-status ${deviceStatus === 'on' ? 'active' : 'inactive'}">
                            <div class="power-bar">
                                <div class="power-level" style="width: ${deviceStatus === 'on' ? '100%' : '0%'}; background: ${config.color}"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="device-controls" id="controls-${deviceId}">
                        <!-- Controls will be loaded dynamically -->
                    </div>
                </div>
                
                <div class="device-card-footer">
                    <div class="device-id">
                        ID: ${deviceId.toUpperCase()}
                    </div>
                    <div class="device-last-update">
                        <i class="fas fa-clock"></i>
                        <span class="update-time">Just now</span>
                    </div>
                </div>
            `;
            
            deviceGrid.appendChild(card);
            
            // Load controls for this device
            loadDeviceControlsForDevice(deviceId, device);
        });
    };
    
    // Load controls for specific device
    const loadDeviceControlsForDevice = (deviceId, device) => {
        const controlsContainer = document.getElementById(`controls-${deviceId}`);
        if (!controlsContainer) return;
        
        const config = DEVICE_CONFIG[deviceId];
        if (!config || !config.controls) return;
        
        controlsContainer.innerHTML = '';
        
        config.controls.forEach(control => {
            const controlElement = createControlElement(deviceId, control, device);
            if (controlElement) {
                controlsContainer.appendChild(controlElement);
            }
        });
    };
    
    // Create control element based on type
    const createControlElement = (deviceId, control, device) => {
        const div = document.createElement('div');
        div.className = 'control-group';
        
        switch(control.type) {
            case 'toggle':
                const isChecked = device?.status === 'on' || 
                                 device?.status === 'locked' || 
                                 device?.status === 'true';
                
                div.innerHTML = `
                    <label class="control-label">
                        ${control.label}
                        <div class="toggle-switch">
                            <input type="checkbox" 
                                   id="${control.id}" 
                                   ${isChecked ? 'checked' : ''}
                                   data-device="${deviceId}"
                                   data-control="toggle">
                            <span class="toggle-slider"></span>
                        </div>
                    </label>
                `;
                break;
                
            case 'slider':
                const value = device?.[control.id.split('-')[1]] || control.value || control.min;
                div.innerHTML = `
                    <label class="control-label">
                        ${control.label}
                        <span class="control-value">${value}${control.unit || ''}</span>
                    </label>
                    <input type="range" 
                           id="${control.id}"
                           class="control-slider"
                           min="${control.min}"
                           max="${control.max}"
                           value="${value}"
                           data-device="${deviceId}"
                           data-control="slider">
                    <div class="slider-labels">
                        <span>${control.min}${control.unit || ''}</span>
                        <span>${control.max}${control.unit || ''}</span>
                    </div>
                `;
                break;
                
            case 'select':
                const currentValue = device?.[control.id.split('-')[1]] || control.options?.[0]?.value || '';
                let optionsHTML = '';
                if (control.options) {
                    optionsHTML = control.options.map(opt => 
                        `<option value="${opt.value}" ${opt.value === currentValue ? 'selected' : ''}>${opt.label}</option>`
                    ).join('');
                }
                
                div.innerHTML = `
                    <label class="control-label">${control.label}</label>
                    <select id="${control.id}" 
                            class="control-select"
                            data-device="${deviceId}"
                            data-control="select">
                        ${optionsHTML}
                    </select>
                `;
                break;
                
            case 'button':
                div.innerHTML = `
                    <button id="${control.id}" 
                            class="control-button"
                            data-device="${deviceId}"
                            data-control="button">
                        <i class="fas ${control.icon || 'fa-cog'}"></i>
                        ${control.label}
                    </button>
                `;
                break;
                
            default:
                return null;
        }
        
        return div;
    };
    
    // Setup event listeners
    const setupEventListeners = () => {
        // Bulk action buttons
        document.getElementById('allOnBtn')?.addEventListener('click', () => {
            turnAllDevices('on');
        });
        
        document.getElementById('allOffBtn')?.addEventListener('click', () => {
            turnAllDevices('off');
        });
        
        document.getElementById('ecoModeBtn')?.addEventListener('click', () => {
            activateEcoMode();
        });
        
        document.getElementById('nightModeBtn')?.addEventListener('click', () => {
            activateNightMode();
        });
        
        // Refresh activity button
        document.getElementById('refreshActivity')?.addEventListener('click', () => {
            loadDeviceActivity();
        });
        
        // Device control events will be handled by event delegation
        setupDeviceControlEvents();
    };
    
    // Setup device control events using event delegation
    const setupDeviceControlEvents = () => {
        document.addEventListener('change', handleControlChange);
        document.addEventListener('click', handleControlClick);
        document.addEventListener('input', handleSliderInput);
    };
    
    // Handle control change events
    const handleControlChange = (e) => {
        const target = e.target;
        
        if (target.matches('input[type="checkbox"]')) {
            handleToggleChange(target);
        } else if (target.matches('select')) {
            handleSelectChange(target);
        }
    };
    
    // Handle control click events
    const handleControlClick = (e) => {
        const target = e.target;
        
        if (target.matches('.control-button')) {
            handleButtonClick(target);
        }
    };
    
    // Handle slider input events
    const handleSliderInput = (e) => {
        const target = e.target;
        
        if (target.matches('.control-slider')) {
            handleSliderChange(target);
        }
    };
    
    // Handle toggle switch change
    const handleToggleChange = (toggle) => {
        const deviceId = toggle.dataset.device;
        const isChecked = toggle.checked;
        
        let newStatus;
        if (deviceId === 'door') {
            newStatus = isChecked ? 'locked' : 'unlocked';
        } else {
            newStatus = isChecked ? 'on' : 'off';
        }
        
        updateDeviceStatus(deviceId, { status: newStatus });
        
        // Update toggle label if it has custom labels
        const controlLabel = toggle.closest('.control-label');
        if (controlLabel) {
            const onLabel = toggle.dataset.onLabel || 'ON';
            const offLabel = toggle.dataset.offLabel || 'OFF';
            const labelText = controlLabel.querySelector('.toggle-label');
            if (labelText) {
                labelText.textContent = isChecked ? onLabel : offLabel;
            }
        }
    };
    
    // Handle select change
    const handleSelectChange = (select) => {
        const deviceId = select.dataset.device;
        const controlId = select.id;
        const value = select.value;
        
        // Extract property name from control ID (e.g., 'ac-mode' -> 'mode')
        const property = controlId.split('-')[1];
        
        updateDeviceStatus(deviceId, { [property]: value });
    };
    
    // Handle button click
    const handleButtonClick = (button) => {
        const deviceId = button.dataset.device;
        const controlId = button.id;
        
        switch(controlId) {
            case 'cctv-snapshot':
                takeCameraSnapshot(deviceId);
                break;
            case 'door-open':
                openDoor(deviceId);
                break;
            case 'door-close':
                closeDoor(deviceId);
                break;
            default:
                console.log(`Button ${controlId} clicked for device ${deviceId}`);
        }
    };
    
    // Handle slider change
    const handleSliderChange = (slider) => {
        const deviceId = slider.dataset.device;
        const controlId = slider.id;
        const value = slider.value;
        
        // Update displayed value
        const controlLabel = slider.closest('.control-group')?.querySelector('.control-label');
        if (controlLabel) {
            const valueSpan = controlLabel.querySelector('.control-value');
            if (valueSpan) {
                const unit = slider.dataset.unit || '';
                valueSpan.textContent = `${value}${unit}`;
            }
        }
        
        // Update device property on mouseup
        slider.addEventListener('mouseup', () => {
            const property = controlId.split('-')[1]; // e.g., 'lights-brightness' -> 'brightness'
            updateDeviceStatus(deviceId, { [property]: parseInt(value) });
        }, { once: true });
    };
    
    // Update device status
    const updateDeviceStatus = (deviceId, updates) => {
        const updatedDevice = StorageService.updateDevice(deviceId, updates);
        
        if (updatedDevice) {
            // Update device card UI
            updateDeviceCard(deviceId, updatedDevice);
            
            // Update device summary
            const devices = StorageService.getDevices();
            updateDeviceSummary(devices);
            
            // Show notification
            const deviceName = DEVICE_CONFIG[deviceId]?.name || deviceId;
            if (window.SmartOfficeApp && typeof window.SmartOfficeApp.showToast === 'function') {
                let message = '';
                if (updates.status) {
                    message = `${deviceName} turned ${updates.status}`;
                } else if (updates.temperature !== undefined) {
                    message = `${deviceName} temperature set to ${updates.temperature}°C`;
                } else if (updates.brightness !== undefined) {
                    message = `${deviceName} brightness set to ${updates.brightness}%`;
                } else {
                    message = `${deviceName} settings updated`;
                }
                
                window.SmartOfficeApp.showToast(message, 'success');
            }
            
            // Update last update time
            updateDeviceLastUpdate(deviceId);
        }
    };
    
    // Update device card UI
    const updateDeviceCard = (deviceId, device) => {
        const card = document.querySelector(`.device-card[data-device-id="${deviceId}"]`);
        if (!card) return;
        
        const config = DEVICE_CONFIG[deviceId];
        const deviceStatus = device?.status || 'off';
        const stateConfig = config.states[deviceStatus] || config.states.off;
        
        // Update status
        const statusElement = card.querySelector('.device-status');
        if (statusElement) {
            statusElement.className = `device-status ${deviceStatus}`;
            statusElement.innerHTML = `
                <span class="status-dot" style="background: ${stateConfig.color}"></span>
                ${stateConfig.label}
            `;
        }
        
        // Update power indicator
        const powerLevel = card.querySelector('.power-level');
        if (powerLevel) {
            powerLevel.style.width = deviceStatus === 'on' ? '100%' : '0%';
            
            const powerStatus = card.querySelector('.power-status');
            if (powerStatus) {
                powerStatus.className = `power-status ${deviceStatus === 'on' ? 'active' : 'inactive'}`;
            }
        }
        
        // Update toggle switches
        const toggle = card.querySelector('input[type="checkbox"]');
        if (toggle) {
            const isChecked = deviceStatus === 'on' || deviceStatus === 'locked' || deviceStatus === 'true';
            toggle.checked = isChecked;
        }
        
        // Update sliders
        if (device.brightness !== undefined) {
            const brightnessSlider = card.querySelector('#lights-brightness');
            if (brightnessSlider) {
                brightnessSlider.value = device.brightness;
                const valueSpan = brightnessSlider.closest('.control-group')?.querySelector('.control-value');
                if (valueSpan) {
                    valueSpan.textContent = `${device.brightness}%`;
                }
            }
        }
        
        if (device.temperature !== undefined) {
            const tempSlider = card.querySelector('#ac-temperature');
            if (tempSlider) {
                tempSlider.value = device.temperature;
                const valueSpan = tempSlider.closest('.control-group')?.querySelector('.control-value');
                if (valueSpan) {
                    valueSpan.textContent = `${device.temperature}°C`;
                }
            }
        }
        
        if (device.speed !== undefined) {
            const speedSlider = card.querySelector('#purifier-speed');
            if (speedSlider) {
                speedSlider.value = device.speed;
                const valueSpan = speedSlider.closest('.control-group')?.querySelector('.control-value');
                if (valueSpan) {
                    valueSpan.textContent = `${device.speed} level`;
                }
            }
        }
        
        // Update selects
        if (device.mode !== undefined) {
            const modeSelect = card.querySelector('#ac-mode, #purifier-mode');
            if (modeSelect) {
                modeSelect.value = device.mode;
            }
        }
        
        if (device.quality !== undefined) {
            const qualitySelect = card.querySelector('#cctv-quality');
            if (qualitySelect) {
                qualitySelect.value = device.quality;
            }
        }
    };
    
    // Update device last update time
    const updateDeviceLastUpdate = (deviceId) => {
        const card = document.querySelector(`.device-card[data-device-id="${deviceId}"]`);
        if (!card) return;
        
        const updateTimeElement = card.querySelector('.update-time');
        if (updateTimeElement) {
            updateTimeElement.textContent = 'Just now';
            
            // Reset after 5 seconds
            setTimeout(() => {
                if (updateTimeElement.textContent === 'Just now') {
                    const now = new Date();
                    updateTimeElement.textContent = now.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    });
                }
            }, 5000);
        }
    };
    
    // Turn all devices on/off
    const turnAllDevices = (status) => {
        Object.keys(DEVICE_CONFIG).forEach(deviceId => {
            let newStatus = status;
            
            // Special handling for door
            if (deviceId === 'door') {
                newStatus = status === 'on' ? 'locked' : 'unlocked';
            }
            
            StorageService.updateDevice(deviceId, { status: newStatus });
        });
        
        // Reload all device controls
        const devices = StorageService.getDevices();
        loadDeviceControls(devices);
        updateDeviceSummary(devices);
        
        // Show notification
        const action = status === 'on' ? 'turned on' : 'turned off';
        if (window.SmartOfficeApp && typeof window.SmartOfficeApp.showToast === 'function') {
            window.SmartOfficeApp.showToast(`All devices ${action}`, 'success');
        }
    };
    
    // Activate eco mode
    const activateEcoMode = () => {
        const updates = {
            lights: { status: 'on', brightness: 70 },
            ac: { status: 'on', temperature: 24, mode: 'auto' },
            purifier: { status: 'auto', mode: 'auto', speed: 2 }
        };
        
        Object.keys(updates).forEach(deviceId => {
            StorageService.updateDevice(deviceId, updates[deviceId]);
        });
        
        // Reload all device controls
        const devices = StorageService.getDevices();
        loadDeviceControls(devices);
        updateDeviceSummary(devices);
        
        if (window.SmartOfficeApp && typeof window.SmartOfficeApp.showToast === 'function') {
            window.SmartOfficeApp.showToast('Eco mode activated', 'success');
        }
    };
    
    // Activate night mode
    const activateNightMode = () => {
        const updates = {
            lights: { status: 'off' },
            ac: { status: 'off' },
            purifier: { status: 'off' },
            door: { status: 'locked' },
            cctv: { status: 'on', quality: 'high' }
        };
        
        Object.keys(updates).forEach(deviceId => {
            StorageService.updateDevice(deviceId, updates[deviceId]);
        });
        
        // Reload all device controls
        const devices = StorageService.getDevices();
        loadDeviceControls(devices);
        updateDeviceSummary(devices);
        
        if (window.SmartOfficeApp && typeof window.SmartOfficeApp.showToast === 'function') {
            window.SmartOfficeApp.showToast('Night mode activated', 'success');
        }
    };
    
    // Take camera snapshot
    const takeCameraSnapshot = (deviceId) => {
        if (window.SmartOfficeApp && typeof window.SmartOfficeApp.showToast === 'function') {
            window.SmartOfficeApp.showToast('Camera snapshot captured', 'info');
        }
        
        // Simulate API call
        setTimeout(() => {
            if (window.SmartOfficeApp && typeof window.SmartOfficeApp.showToast === 'function') {
                window.SmartOfficeApp.showToast('Snapshot saved to gallery', 'success');
            }
        }, 1000);
    };
    
    // Open door
    const openDoor = (deviceId) => {
        StorageService.updateDevice(deviceId, { status: 'open' });
        
        // Auto close after 10 seconds
        setTimeout(() => {
            StorageService.updateDevice(deviceId, { status: 'locked' });
            
            const devices = StorageService.getDevices();
            loadDeviceControls(devices);
            
            if (window.SmartOfficeApp && typeof window.SmartOfficeApp.showToast === 'function') {
                window.SmartOfficeApp.showToast('Door auto-locked after 10 seconds', 'info');
            }
        }, 10000);
        
        if (window.SmartOfficeApp && typeof window.SmartOfficeApp.showToast === 'function') {
            window.SmartOfficeApp.showToast('Door opened', 'success');
        }
    };
    
    // Close door
    const closeDoor = (deviceId) => {
        StorageService.updateDevice(deviceId, { status: 'locked' });
        
        if (window.SmartOfficeApp && typeof window.SmartOfficeApp.showToast === 'function') {
            window.SmartOfficeApp.showToast('Door locked', 'success');
        }
    };
    
    // Load device activity
    const loadDeviceActivity = () => {
        const activityTable = document.getElementById('deviceActivityTable');
        if (!activityTable) return;
        
        // Get activity logs from storage
        const logs = StorageService.getActivityLogs();
        
        // Filter device-related logs
        const deviceLogs = logs.filter(log => 
            log.type === 'device_control' || 
            log.action?.includes('Device')
        ).slice(0, 10); // Show last 10 logs
        
        if (deviceLogs.length === 0) {
            activityTable.innerHTML = `
                <tr class="no-activity">
                    <td colspan="5">
                        <i class="fas fa-history"></i>
                        No device activity yet
                    </td>
                </tr>
            `;
            return;
        }
        
        activityTable.innerHTML = deviceLogs.map(log => `
            <tr>
                <td class="time-cell">
                    ${formatTimeAgo(log.timestamp)}
                </td>
                <td class="device-cell">
                    <i class="fas fa-${getDeviceIcon(log.action)}"></i>
                    ${extractDeviceName(log.action)}
                </td>
                <td class="action-cell">
                    ${log.action}
                </td>
                <td class="status-cell">
                    <span class="status-badge ${getStatusClass(log.details?.status)}">
                        ${log.details?.status || 'updated'}
                    </span>
                </td>
                <td class="user-cell">
                    <i class="fas fa-user"></i>
                    ${log.user || 'System'}
                </td>
            </tr>
        `).join('');
    };
    
    // Helper function to extract device name from action
    const extractDeviceName = (action) => {
        if (!action) return 'Unknown Device';
        
        // Try to match with known devices
        const devices = Object.keys(DEVICE_CONFIG);
        for (const deviceId of devices) {
            const config = DEVICE_CONFIG[deviceId];
            if (action.toLowerCase().includes(deviceId.toLowerCase()) || 
                action.toLowerCase().includes(config.name.toLowerCase())) {
                return config.name;
            }
        }
        
        return action.split(' ')[1] || 'Device';
    };
    
    // Helper function to get device icon
    const getDeviceIcon = (action) => {
        if (!action) return 'cog';
        
        const devices = Object.keys(DEVICE_CONFIG);
        for (const deviceId of devices) {
            const config = DEVICE_CONFIG[deviceId];
            if (action.toLowerCase().includes(deviceId.toLowerCase()) || 
                action.toLowerCase().includes(config.name.toLowerCase())) {
                return config.icon.replace('fa-', '');
            }
        }
        
        return 'cog';
    };
    
    // Helper function to get status class
    const getStatusClass = (status) => {
        if (!status) return 'info';
        
        switch(status.toLowerCase()) {
            case 'on':
            case 'locked':
            case 'true':
                return 'success';
            case 'off':
            case 'unlocked':
            case 'false':
                return 'danger';
            case 'auto':
            case 'standby':
                return 'warning';
            default:
                return 'info';
        }
    };
    
    // Helper function to format time ago
    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const past = new Date(timestamp);
        const diff = Math.floor((now - past) / 1000);
        
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };
    
    // Update device summary
    const updateDeviceSummary = (devices) => {
        if (!devices) return;
        
        let totalPower = 0;
        let onlineDevices = 0;
        
        Object.keys(devices).forEach(deviceId => {
            const config = DEVICE_CONFIG[deviceId];
            const device = devices[deviceId];
            
            if (config && device) {
                // Calculate power usage (only if device is on)
                if (device.status === 'on' || device.status === 'locked') {
                    totalPower += config.power || 0;
                    onlineDevices++;
                }
            }
        });
        
        // Update UI
        const totalDevicesEl = document.getElementById('totalDevices');
        const totalPowerEl = document.getElementById('totalPower');
        const onlineDevicesEl = document.getElementById('onlineDevices');
        
        if (totalDevicesEl) totalDevicesEl.textContent = Object.keys(devices).length;
        if (totalPowerEl) totalPowerEl.textContent = `${totalPower} W`;
        if (onlineDevicesEl) onlineDevicesEl.textContent = onlineDevices;
    };
    
    // Start device updates
    const startDeviceUpdates = () => {
        // Update device summary every 30 seconds
        deviceUpdateInterval = setInterval(() => {
            const devices = StorageService.getDevices();
            updateDeviceSummary(devices);
        }, 30000);
    };
    
    // Clean up
    const cleanup = () => {
        if (deviceUpdateInterval) {
            clearInterval(deviceUpdateInterval);
            deviceUpdateInterval = null;
        }
        
        // Remove event listeners
        document.removeEventListener('change', handleControlChange);
        document.removeEventListener('click', handleControlClick);
        document.removeEventListener('input', handleSliderInput);
    };
    
    // Public API
    return {
        load,
        cleanup
    };
})();