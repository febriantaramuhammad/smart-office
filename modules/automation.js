// Automation Module - Smart Rules Engine
const AutomationModule = (function() {
    let rules = [];
    let sensorUnsubscribe = null;
    let ruleCheckInterval = null;
    
    // Rule types and configurations
    const RULE_TYPES = {
        threshold: {
            name: 'Threshold Rule',
            icon: 'fa-sliders-h',
            description: 'Trigger when sensor value crosses threshold',
            color: '#4CC9F0',
            conditions: [
                { id: 'temperature', name: 'Temperature', unit: '°C', min: 15, max: 35 },
                { id: 'humidity', name: 'Humidity', unit: '%', min: 20, max: 80 },
                { id: 'occupancy', name: 'Occupancy', unit: 'people', min: 0, max: 50 },
                { id: 'energy', name: 'Energy Usage', unit: 'kWh', min: 0, max: 200 },
                { id: 'airQuality', name: 'Air Quality', unit: 'AQI', min: 0, max: 300 }
            ],
            operators: ['>', '<', '>=', '<=', '==', '!=']
        },
        time: {
            name: 'Time-based Rule',
            icon: 'fa-clock',
            description: 'Trigger at specific times or intervals',
            color: '#F8961E',
            conditions: [
                { id: 'time', name: 'Time of Day', type: 'time' },
                { id: 'day', name: 'Day of Week', type: 'select', options: [
                    { value: 'monday', label: 'Monday' },
                    { value: 'tuesday', label: 'Tuesday' },
                    { value: 'wednesday', label: 'Wednesday' },
                    { value: 'thursday', label: 'Thursday' },
                    { value: 'friday', label: 'Friday' },
                    { value: 'saturday', label: 'Saturday' },
                    { value: 'sunday', label: 'Sunday' },
                    { value: 'weekday', label: 'Weekday' },
                    { value: 'weekend', label: 'Weekend' },
                    { value: 'everyday', label: 'Every Day' }
                ]},
                { id: 'interval', name: 'Time Interval', type: 'interval', unit: 'minutes' }
            ]
        },
        device: {
            name: 'Device State Rule',
            icon: 'fa-plug',
            description: 'Trigger based on device status changes',
            color: '#06D6A0',
            conditions: [
                { id: 'device', name: 'Device', type: 'device' },
                { id: 'state', name: 'State', type: 'state' }
            ]
        },
        combination: {
            name: 'Combination Rule',
            icon: 'fa-code-branch',
            description: 'Multiple conditions combined with AND/OR logic',
            color: '#9D4EDD'
        }
    };
    
    // Available actions
    const AVAILABLE_ACTIONS = {
        lights: [
            { id: 'lights.on', label: 'Turn Lights ON', icon: 'fa-lightbulb', color: '#FFD700' },
            { id: 'lights.off', label: 'Turn Lights OFF', icon: 'fa-lightbulb', color: '#666' },
            { id: 'lights.brightness', label: 'Set Brightness', icon: 'fa-sliders-h', color: '#FFD700', hasValue: true, unit: '%', min: 0, max: 100 },
            { id: 'lights.toggle', label: 'Toggle Lights', icon: 'fa-exchange-alt', color: '#FFD700' }
        ],
        ac: [
            { id: 'ac.on', label: 'Turn AC ON', icon: 'fa-snowflake', color: '#4CC9F0' },
            { id: 'ac.off', label: 'Turn AC OFF', icon: 'fa-snowflake', color: '#666' },
            { id: 'ac.temperature', label: 'Set Temperature', icon: 'fa-thermometer-half', color: '#4CC9F0', hasValue: true, unit: '°C', min: 16, max: 30 },
            { id: 'ac.mode', label: 'Set Mode', icon: 'fa-cog', color: '#4CC9F0', hasValue: true, options: [
                { value: 'cool', label: 'Cool' },
                { value: 'dry', label: 'Dry' },
                { value: 'fan', label: 'Fan' },
                { value: 'auto', label: 'Auto' }
            ]}
        ],
        purifier: [
            { id: 'purifier.on', label: 'Turn Purifier ON', icon: 'fa-wind', color: '#06D6A0' },
            { id: 'purifier.off', label: 'Turn Purifier OFF', icon: 'fa-wind', color: '#666' },
            { id: 'purifier.mode', label: 'Set Mode', icon: 'fa-cog', color: '#06D6A0', hasValue: true, options: [
                { value: 'auto', label: 'Auto' },
                { value: 'silent', label: 'Silent' },
                { value: 'turbo', label: 'Turbo' },
                { value: 'sleep', label: 'Sleep' }
            ]},
            { id: 'purifier.speed', label: 'Set Fan Speed', icon: 'fa-tachometer-alt', color: '#06D6A0', hasValue: true, unit: 'level', min: 1, max: 5 }
        ],
        door: [
            { id: 'door.lock', label: 'Lock Door', icon: 'fa-lock', color: '#F8961E' },
            { id: 'door.unlock', label: 'Unlock Door', icon: 'fa-unlock', color: '#F8961E' },
            { id: 'door.open', label: 'Open Door', icon: 'fa-door-open', color: '#F8961E' }
        ],
        notification: [
            { id: 'notification.send', label: 'Send Notification', icon: 'fa-bell', color: '#7209B7', hasValue: true },
            { id: 'notification.email', label: 'Send Email Alert', icon: 'fa-envelope', color: '#7209B7', hasValue: true }
        ]
    };
    
    // Load Automation view
    const load = (container) => {
        // Load rules from storage
        rules = StorageService.getAutomationRules();
        
        container.innerHTML = `
            <section class="content-section active" id="automation">
                <div class="automation-header">
                    <h2><i class="fas fa-robot"></i> Smart Automation Rules</h2>
                    <p class="subtitle">Create intelligent rules to automate your office environment</p>
                </div>
                
                <div class="automation-stats">
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #4CC9F0">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="stat-content">
                            <h3>Active Rules</h3>
                            <div class="stat-value" id="activeRules">${getActiveRulesCount()}</div>
                            <div class="stat-label">Currently Running</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #06D6A0">
                            <i class="fas fa-history"></i>
                        </div>
                        <div class="stat-content">
                            <h3>Executed Today</h3>
                            <div class="stat-value" id="executedToday">0</div>
                            <div class="stat-label">Rule Executions</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #F8961E">
                            <i class="fas fa-bolt"></i>
                        </div>
                        <div class="stat-content">
                            <h3>Energy Saved</h3>
                            <div class="stat-value" id="energySaved">0 kWh</div>
                            <div class="stat-label">This Month</div>
                        </div>
                    </div>
                </div>
                
                <div class="automation-actions">
                    <button class="btn-create-rule" id="createRuleBtn">
                        <i class="fas fa-plus-circle"></i>
                        <span>Create New Rule</span>
                    </button>
                    <div class="quick-actions">
                        <button class="btn-quick-action" id="importRulesBtn">
                            <i class="fas fa-file-import"></i>
                            Import Rules
                        </button>
                        <button class="btn-quick-action" id="exportRulesBtn">
                            <i class="fas fa-file-export"></i>
                            Export Rules
                        </button>
                        <button class="btn-quick-action" id="enableAllBtn">
                            <i class="fas fa-toggle-on"></i>
                            Enable All
                        </button>
                        <button class="btn-quick-action" id="disableAllBtn">
                            <i class="fas fa-toggle-off"></i>
                            Disable All
                        </button>
                    </div>
                </div>
                
                <div class="rules-container">
                    <div class="section-header">
                        <h3><i class="fas fa-list"></i> Automation Rules</h3>
                        <div class="rules-filter">
                            <select id="rulesFilter" class="filter-select">
                                <option value="all">All Rules</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                                <option value="threshold">Threshold Rules</option>
                                <option value="time">Time-based</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="rules-grid" id="rulesGrid">
                        <!-- Rules will be loaded here -->
                    </div>
                    
                    <div class="no-rules" id="noRulesMessage" style="display: ${rules.length > 0 ? 'none' : 'block'}">
                        <i class="fas fa-robot"></i>
                        <h4>No Automation Rules Yet</h4>
                        <p>Create your first rule to start automating your office</p>
                        <button class="btn-create-first" id="createFirstRuleBtn">
                            <i class="fas fa-plus"></i>
                            Create First Rule
                        </button>
                    </div>
                </div>
                
                <div class="rule-templates">
                    <div class="section-header">
                        <h3><i class="fas fa-magic"></i> Quick Templates</h3>
                        <p class="subtitle">Common automation templates to get started</p>
                    </div>
                    
                    <div class="templates-grid">
                        <div class="template-card" data-template="energy-saver">
                            <div class="template-icon" style="background: #06D6A020; color: #06D6A0">
                                <i class="fas fa-leaf"></i>
                            </div>
                            <div class="template-content">
                                <h4>Energy Saver</h4>
                                <p>Turn off lights and AC when office is empty</p>
                                <button class="btn-use-template" data-template="energy-saver">
                                    <i class="fas fa-bolt"></i>
                                    Use Template
                                </button>
                            </div>
                        </div>
                        
                        <div class="template-card" data-template="comfort-mode">
                            <div class="template-icon" style="background: #4CC9F020; color: #4CC9F0">
                                <i class="fas fa-thermometer-half"></i>
                            </div>
                            <div class="template-content">
                                <h4>Comfort Mode</h4>
                                <p>Maintain optimal temperature and air quality</p>
                                <button class="btn-use-template" data-template="comfort-mode">
                                    <i class="fas fa-snowflake"></i>
                                    Use Template
                                </button>
                            </div>
                        </div>
                        
                        <div class="template-card" data-template="security">
                            <div class="template-icon" style="background: #7209B720; color: #7209B7">
                                <i class="fas fa-shield-alt"></i>
                            </div>
                            <div class="template-content">
                                <h4>Security Protocol</h4>
                                <p>Automated security measures after hours</p>
                                <button class="btn-use-template" data-template="security">
                                    <i class="fas fa-lock"></i>
                                    Use Template
                                </button>
                            </div>
                        </div>
                        
                        <div class="template-card" data-template="schedule">
                            <div class="template-icon" style="background: #F8961E20; color: #F8961E">
                                <i class="fas fa-clock"></i>
                            </div>
                            <div class="template-content">
                                <h4>Daily Schedule</h4>
                                <p>Automated office setup for work hours</p>
                                <button class="btn-use-template" data-template="schedule">
                                    <i class="fas fa-calendar-alt"></i>
                                    Use Template
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="automation-history">
                    <div class="section-header">
                        <h3><i class="fas fa-history"></i> Rule Execution History</h3>
                        <button class="btn-clear-history" id="clearHistoryBtn">
                            <i class="fas fa-trash"></i>
                            Clear History
                        </button>
                    </div>
                    <div class="history-table-container">
                        <table class="history-table">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Rule</th>
                                    <th>Condition</th>
                                    <th>Action</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody id="executionHistory">
                                <!-- History rows will be loaded here -->
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Rule Creation Modal (hidden by default) -->
                <div class="modal-overlay" id="ruleModal" style="display: none">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3><i class="fas fa-plus-circle"></i> Create New Rule</h3>
                            <button class="modal-close" id="closeModalBtn">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body" id="ruleFormContainer">
                            <!-- Rule form will be loaded here -->
                        </div>
                    </div>
                </div>
            </section>
        `;
        
        // Load rules
        loadRulesGrid();
        
        // Load execution history
        loadExecutionHistory();
        
        // Setup event listeners
        setupEventListeners();
        
        // Start rule checking
        startRuleChecking();
        
        // Subscribe to sensor updates
        if (typeof SensorSimulator !== 'undefined') {
            sensorUnsubscribe = SensorSimulator.subscribe(checkRules);
        }
    };
    
    // Get active rules count
    const getActiveRulesCount = () => {
        return rules.filter(rule => rule.enabled).length;
    };
    
    // Load rules grid
    const loadRulesGrid = () => {
        const rulesGrid = document.getElementById('rulesGrid');
        const filter = document.getElementById('rulesFilter')?.value || 'all';
        
        if (!rulesGrid) return;
        
        // Filter rules
        let filteredRules = [...rules];
        if (filter === 'active') {
            filteredRules = rules.filter(rule => rule.enabled);
        } else if (filter === 'inactive') {
            filteredRules = rules.filter(rule => !rule.enabled);
        } else if (filter === 'threshold') {
            filteredRules = rules.filter(rule => rule.type === 'threshold');
        } else if (filter === 'time') {
            filteredRules = rules.filter(rule => rule.type === 'time');
        }
        
        if (filteredRules.length === 0) {
            rulesGrid.innerHTML = '';
            document.getElementById('noRulesMessage').style.display = 'block';
            return;
        }
        
        document.getElementById('noRulesMessage').style.display = 'none';
        
        rulesGrid.innerHTML = filteredRules.map(rule => `
            <div class="rule-card ${rule.enabled ? 'active' : 'inactive'}" data-rule-id="${rule.id}">
                <div class="rule-card-header">
                    <div class="rule-type-icon" style="background: ${RULE_TYPES[rule.type]?.color || '#666'}20; color: ${RULE_TYPES[rule.type]?.color || '#666'}">
                        <i class="fas ${RULE_TYPES[rule.type]?.icon || 'fa-cog'}"></i>
                    </div>
                    <div class="rule-info">
                        <h4 class="rule-name">${rule.name}</h4>
                        <div class="rule-description">${rule.description || 'No description'}</div>
                    </div>
                    <div class="rule-actions">
                        <div class="rule-toggle">
                            <label class="switch">
                                <input type="checkbox" ${rule.enabled ? 'checked' : ''} data-rule-id="${rule.id}">
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div class="rule-buttons">
                            <button class="btn-rule-action edit" data-rule-id="${rule.id}" title="Edit Rule">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-rule-action delete" data-rule-id="${rule.id}" title="Delete Rule">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="rule-card-body">
                    <div class="rule-condition">
                        <div class="condition-label">Condition:</div>
                        <div class="condition-value">${formatCondition(rule)}</div>
                    </div>
                    
                    <div class="rule-action">
                        <div class="action-label">Action:</div>
                        <div class="action-value">${formatAction(rule)}</div>
                    </div>
                    
                    <div class="rule-meta">
                        <div class="meta-item">
                            <i class="fas fa-history"></i>
                            <span>Last triggered: ${rule.lastTriggered ? formatTimeAgo(rule.lastTriggered) : 'Never'}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-play-circle"></i>
                            <span>Executions: ${rule.executionCount || 0}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-calendar"></i>
                            <span>Created: ${rule.createdAt ? new Date(rule.createdAt).toLocaleDateString() : 'Unknown'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="rule-card-footer">
                    <div class="rule-tags">
                        <span class="rule-tag ${rule.type}">${RULE_TYPES[rule.type]?.name || rule.type}</span>
                        ${rule.priority ? `<span class="rule-tag priority-${rule.priority}">Priority: ${rule.priority}</span>` : ''}
                    </div>
                    <div class="rule-status ${rule.enabled ? 'enabled' : 'disabled'}">
                        <i class="fas fa-circle"></i>
                        ${rule.enabled ? 'Active' : 'Inactive'}
                    </div>
                </div>
            </div>
        `).join('');
    };
    
    // Format condition for display
    const formatCondition = (rule) => {
        if (!rule.condition) return 'No condition';
        
        if (rule.type === 'threshold') {
            return `If ${rule.condition.sensor} ${rule.condition.operator} ${rule.condition.value}${rule.condition.unit || ''}`;
        } else if (rule.type === 'time') {
            if (rule.condition.time) {
                return `At ${rule.condition.time}`;
            } else if (rule.condition.day) {
                return `On ${rule.condition.day}`;
            } else if (rule.condition.interval) {
                return `Every ${rule.condition.interval} minutes`;
            }
        } else if (rule.type === 'device') {
            return `When ${rule.condition.device} is ${rule.condition.state}`;
        }
        
        return JSON.stringify(rule.condition);
    };
    
    // Format action for display
    const formatAction = (rule) => {
        if (!rule.action) return 'No action';
        
        const [device, action] = rule.action.split('.');
        const actionConfig = AVAILABLE_ACTIONS[device]?.find(a => a.id === rule.action);
        
        if (actionConfig) {
            let actionText = actionConfig.label;
            if (rule.actionValue !== undefined) {
                actionText += `: ${rule.actionValue}${actionConfig.unit || ''}`;
            }
            return actionText;
        }
        
        return rule.action;
    };
    
    // Load execution history
    const loadExecutionHistory = () => {
        const historyTable = document.getElementById('executionHistory');
        if (!historyTable) return;
        
        // Get execution logs from activity logs
        const logs = StorageService.getActivityLogs();
        const executionLogs = logs.filter(log => 
            log.type === 'automation' || 
            (log.details && log.details.rule)
        ).slice(0, 20); // Show last 20 executions
        
        if (executionLogs.length === 0) {
            historyTable.innerHTML = `
                <tr class="no-history">
                    <td colspan="5">
                        <i class="fas fa-history"></i>
                        No execution history yet
                    </td>
                </tr>
            `;
            return;
        }
        
        historyTable.innerHTML = executionLogs.map(log => `
            <tr>
                <td class="time-cell">
                    ${formatTimeAgo(log.timestamp)}
                </td>
                <td class="rule-cell">
                    <i class="fas fa-robot"></i>
                    ${log.details?.rule || 'Unknown Rule'}
                </td>
                <td class="condition-cell">
                    ${log.details?.condition || 'N/A'}
                </td>
                <td class="action-cell">
                    ${log.details?.action || 'N/A'}
                </td>
                <td class="status-cell">
                    <span class="status-badge success">
                        <i class="fas fa-check"></i>
                        Executed
                    </span>
                </td>
            </tr>
        `).join('');
    };
    
    // Setup event listeners
    const setupEventListeners = () => {
        // Create rule button
        document.getElementById('createRuleBtn')?.addEventListener('click', showRuleCreationModal);
        document.getElementById('createFirstRuleBtn')?.addEventListener('click', showRuleCreationModal);
        
        // Filter change
        document.getElementById('rulesFilter')?.addEventListener('change', loadRulesGrid);
        
        // Quick action buttons
        document.getElementById('importRulesBtn')?.addEventListener('click', importRules);
        document.getElementById('exportRulesBtn')?.addEventListener('click', exportRules);
        document.getElementById('enableAllBtn')?.addEventListener('click', () => toggleAllRules(true));
        document.getElementById('disableAllBtn')?.addEventListener('click', () => toggleAllRules(false));
        
        // Template buttons
        document.querySelectorAll('.btn-use-template').forEach(button => {
            button.addEventListener('click', (e) => {
                const template = e.target.closest('.btn-use-template').dataset.template;
                useTemplate(template);
            });
        });
        
        // Clear history button
        document.getElementById('clearHistoryBtn')?.addEventListener('click', clearHistory);
        
        // Modal close button
        document.getElementById('closeModalBtn')?.addEventListener('click', closeRuleModal);
        
        // Event delegation for rule actions
        document.addEventListener('click', handleRuleActions);
        
        // Close modal on overlay click
        document.querySelector('.modal-overlay')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                closeRuleModal();
            }
        });
    };
    
    // Handle rule actions via event delegation
    const handleRuleActions = (e) => {
        const target = e.target;
        
        // Rule toggle switch
        if (target.matches('input[type="checkbox"]') && target.dataset.ruleId) {
            toggleRule(target.dataset.ruleId, target.checked);
        }
        
        // Edit rule button
        if (target.closest('.btn-rule-action.edit')) {
            const button = target.closest('.btn-rule-action.edit');
            const ruleId = button.dataset.ruleId;
            editRule(ruleId);
        }
        
        // Delete rule button
        if (target.closest('.btn-rule-action.delete')) {
            const button = target.closest('.btn-rule-action.delete');
            const ruleId = button.dataset.ruleId;
            deleteRule(ruleId);
        }
    };
    
    // Show rule creation modal
    const showRuleCreationModal = (ruleToEdit = null) => {
        const modal = document.getElementById('ruleModal');
        const formContainer = document.getElementById('ruleFormContainer');
        
        if (!modal || !formContainer) return;
        
        const isEditMode = !!ruleToEdit;
        
        formContainer.innerHTML = `
            <form id="ruleForm" class="rule-form">
                <div class="form-section">
                    <h4><i class="fas fa-info-circle"></i> Basic Information</h4>
                    
                    <div class="form-group">
                        <label for="ruleName">
                            <i class="fas fa-tag"></i> Rule Name *
                        </label>
                        <input type="text" 
                               id="ruleName" 
                               placeholder="e.g., Auto AC Control" 
                               value="${isEditMode ? ruleToEdit.name : ''}"
                               required>
                    </div>
                    
                    <div class="form-group">
                        <label for="ruleDescription">
                            <i class="fas fa-align-left"></i> Description
                        </label>
                        <textarea id="ruleDescription" 
                                  placeholder="Describe what this rule does..."
                                  rows="2">${isEditMode ? ruleToEdit.description || '' : ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="ruleType">
                            <i class="fas fa-cogs"></i> Rule Type *
                        </label>
                        <select id="ruleType" required>
                            <option value="">Select rule type</option>
                            ${Object.keys(RULE_TYPES).map(type => `
                                <option value="${type}" ${isEditMode && ruleToEdit.type === type ? 'selected' : ''}>
                                    ${RULE_TYPES[type].name}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>
                
                <div class="form-section" id="conditionSection">
                    <!-- Condition fields will be dynamically loaded based on rule type -->
                </div>
                
                <div class="form-section">
                    <h4><i class="fas fa-play-circle"></i> Action</h4>
                    
                    <div class="form-group">
                        <label for="ruleAction">
                            <i class="fas fa-bolt"></i> Action *
                        </label>
                        <select id="ruleAction" required>
                            <option value="">Select action</option>
                            ${Object.keys(AVAILABLE_ACTIONS).map(device => `
                                <optgroup label="${device.charAt(0).toUpperCase() + device.slice(1)}">
                                    ${AVAILABLE_ACTIONS[device].map(action => `
                                        <option value="${action.id}" 
                                                data-has-value="${action.hasValue}"
                                                data-unit="${action.unit || ''}"
                                                ${isEditMode && ruleToEdit.action === action.id ? 'selected' : ''}>
                                            ${action.label}
                                        </option>
                                    `).join('')}
                                </optgroup>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group" id="actionValueContainer" style="display: none">
                        <label for="actionValue">
                            <i class="fas fa-sliders-h"></i> Action Value
                        </label>
                        <div id="actionValueInput">
                            <!-- Value input will be dynamically loaded -->
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h4><i class="fas fa-cog"></i> Advanced Settings</h4>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="rulePriority">
                                <i class="fas fa-flag"></i> Priority
                            </label>
                            <select id="rulePriority">
                                <option value="low" ${isEditMode && ruleToEdit.priority === 'low' ? 'selected' : ''}>Low</option>
                                <option value="medium" ${isEditMode && (!ruleToEdit.priority || ruleToEdit.priority === 'medium') ? 'selected' : ''}>Medium</option>
                                <option value="high" ${isEditMode && ruleToEdit.priority === 'high' ? 'selected' : ''}>High</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="ruleEnabled">
                                <i class="fas fa-toggle-on"></i> Status
                            </label>
                            <div class="toggle-switch">
                                <input type="checkbox" 
                                       id="ruleEnabled" 
                                       ${isEditMode ? (ruleToEdit.enabled ? 'checked' : '') : 'checked'}>
                                <span class="toggle-slider"></span>
                            </div>
                            <span class="toggle-label">${isEditMode ? (ruleToEdit.enabled ? 'Enabled' : 'Disabled') : 'Enabled'}</span>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" 
                                   id="sendNotification" 
                                   ${isEditMode && ruleToEdit.sendNotification ? 'checked' : ''}>
                            <span>Send notification when rule executes</span>
                        </label>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-cancel" id="cancelRuleBtn">
                        Cancel
                    </button>
                    <button type="submit" class="btn-save">
                        <i class="fas fa-save"></i>
                        ${isEditMode ? 'Update Rule' : 'Create Rule'}
                    </button>
                </div>
            </form>
        `;
        
        // Show modal
        modal.style.display = 'flex';
        
        // Setup dynamic form handlers
        setupDynamicFormHandlers(isEditMode ? ruleToEdit : null);
        
        // Setup form submission
        setupRuleFormSubmission(isEditMode ? ruleToEdit.id : null);
        
        // Cancel button
        document.getElementById('cancelRuleBtn')?.addEventListener('click', closeRuleModal);
    };
    
    // Setup dynamic form handlers
    const setupDynamicFormHandlers = (ruleToEdit) => {
        const ruleTypeSelect = document.getElementById('ruleType');
        const ruleActionSelect = document.getElementById('ruleAction');
        const conditionSection = document.getElementById('conditionSection');
        
        // Load condition fields based on rule type
        const loadConditionFields = (type) => {
            const ruleType = RULE_TYPES[type];
            if (!ruleType || !conditionSection) return;
            
            let html = `<h4><i class="fas fa-filter"></i> Condition</h4>`;
            
            if (type === 'threshold') {
                html += `
                    <div class="form-row">
                        <div class="form-group">
                            <label for="conditionSensor">
                                <i class="fas fa-thermometer-half"></i> Sensor
                            </label>
                            <select id="conditionSensor" required>
                                <option value="">Select sensor</option>
                                ${ruleType.conditions.map(condition => `
                                    <option value="${condition.id}" 
                                            data-unit="${condition.unit}"
                                            ${ruleToEdit?.condition?.sensor === condition.id ? 'selected' : ''}>
                                        ${condition.name} (${condition.unit})
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="conditionOperator">
                                <i class="fas fa-code"></i> Operator
                            </label>
                            <select id="conditionOperator" required>
                                <option value="">Select operator</option>
                                ${ruleType.operators.map(op => `
                                    <option value="${op}" ${ruleToEdit?.condition?.operator === op ? 'selected' : ''}>
                                        ${op}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="conditionValue">
                                <i class="fas fa-sliders-h"></i> Value
                            </label>
                            <input type="number" 
                                   id="conditionValue" 
                                   step="0.1"
                                   value="${ruleToEdit?.condition?.value || ''}"
                                   required>
                            <span id="conditionUnit">${ruleToEdit?.condition?.unit || ''}</span>
                        </div>
                    </div>
                `;
            } else if (type === 'time') {
                html += `
                    <div class="form-group">
                        <label for="conditionTimeType">
                            <i class="fas fa-clock"></i> Time Condition Type
                        </label>
                        <select id="conditionTimeType">
                            <option value="time" ${ruleToEdit?.condition?.time ? 'selected' : ''}>Specific Time</option>
                            <option value="day" ${ruleToEdit?.condition?.day ? 'selected' : ''}>Day of Week</option>
                            <option value="interval" ${ruleToEdit?.condition?.interval ? 'selected' : ''}>Time Interval</option>
                        </select>
                    </div>
                    
                    <div class="form-group" id="timeSpecific" style="display: ${ruleToEdit?.condition?.time ? 'block' : 'none'}">
                        <label for="conditionTime">
                            <i class="fas fa-clock"></i> Time
                        </label>
                        <input type="time" 
                               id="conditionTime" 
                               value="${ruleToEdit?.condition?.time || '09:00'}">
                    </div>
                    
                    <div class="form-group" id="timeDay" style="display: ${ruleToEdit?.condition?.day ? 'block' : 'none'}">
                        <label for="conditionDay">
                            <i class="fas fa-calendar"></i> Day
                        </label>
                        <select id="conditionDay">
                            ${ruleType.conditions.find(c => c.id === 'day')?.options.map(opt => `
                                <option value="${opt.value}" ${ruleToEdit?.condition?.day === opt.value ? 'selected' : ''}>
                                    ${opt.label}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group" id="timeInterval" style="display: ${ruleToEdit?.condition?.interval ? 'block' : 'none'}">
                        <label for="conditionInterval">
                            <i class="fas fa-hourglass-half"></i> Interval (minutes)
                        </label>
                        <input type="number" 
                               id="conditionInterval" 
                               min="1" 
                               max="1440"
                               value="${ruleToEdit?.condition?.interval || 60}">
                    </div>
                `;
            } else if (type === 'device') {
                html += `
                    <div class="form-row">
                        <div class="form-group">
                            <label for="conditionDevice">
                                <i class="fas fa-plug"></i> Device
                            </label>
                            <select id="conditionDevice">
                                <option value="">Select device</option>
                                <option value="lights" ${ruleToEdit?.condition?.device === 'lights' ? 'selected' : ''}>Lights</option>
                                <option value="ac" ${ruleToEdit?.condition?.device === 'ac' ? 'selected' : ''}>AC</option>
                                <option value="door" ${ruleToEdit?.condition?.device === 'door' ? 'selected' : ''}>Door</option>
                                <option value="purifier" ${ruleToEdit?.condition?.device === 'purifier' ? 'selected' : ''}>Purifier</option>
                                <option value="cctv" ${ruleToEdit?.condition?.device === 'cctv' ? 'selected' : ''}>CCTV</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="conditionState">
                                <i class="fas fa-power-off"></i> State
                            </label>
                            <select id="conditionState">
                                <option value="">Select state</option>
                                <option value="on" ${ruleToEdit?.condition?.state === 'on' ? 'selected' : ''}>On</option>
                                <option value="off" ${ruleToEdit?.condition?.state === 'off' ? 'selected' : ''}>Off</option>
                                <option value="locked" ${ruleToEdit?.condition?.state === 'locked' ? 'selected' : ''}>Locked</option>
                                <option value="unlocked" ${ruleToEdit?.condition?.state === 'unlocked' ? 'selected' : ''}>Unlocked</option>
                            </select>
                        </div>
                    </div>
                `;
            }
            
            conditionSection.innerHTML = html;
            
            // Setup time type change handler
            if (type === 'time') {
                const timeTypeSelect = document.getElementById('conditionTimeType');
                if (timeTypeSelect) {
                    timeTypeSelect.addEventListener('change', (e) => {
                        document.getElementById('timeSpecific').style.display = 'none';
                        document.getElementById('timeDay').style.display = 'none';
                        document.getElementById('timeInterval').style.display = 'none';
                        
                        if (e.target.value === 'time') {
                            document.getElementById('timeSpecific').style.display = 'block';
                        } else if (e.target.value === 'day') {
                            document.getElementById('timeDay').style.display = 'block';
                        } else if (e.target.value === 'interval') {
                            document.getElementById('timeInterval').style.display = 'block';
                        }
                    });
                }
            }
            
            // Setup sensor change handler for threshold rules
            if (type === 'threshold') {
                const sensorSelect = document.getElementById('conditionSensor');
                if (sensorSelect) {
                    sensorSelect.addEventListener('change', (e) => {
                        const selectedOption = sensorSelect.options[sensorSelect.selectedIndex];
                        const unit = selectedOption.dataset.unit;
                        document.getElementById('conditionUnit').textContent = unit;
                    });
                    
                    // Trigger change to set initial unit
                    sensorSelect.dispatchEvent(new Event('change'));
                }
            }
        };
        
        // Load action value input based on selected action
        const loadActionValueInput = (actionId) => {
            const actionValueContainer = document.getElementById('actionValueContainer');
            const actionValueInput = document.getElementById('actionValueInput');
            
            if (!actionValueContainer || !actionValueInput) return;
            
            // Find action configuration
            let actionConfig = null;
            for (const device in AVAILABLE_ACTIONS) {
                actionConfig = AVAILABLE_ACTIONS[device].find(a => a.id === actionId);
                if (actionConfig) break;
            }
            
            if (actionConfig?.hasValue) {
                actionValueContainer.style.display = 'block';
                
                if (actionConfig.options) {
                    // Select input for options
                    actionValueInput.innerHTML = `
                        <select id="actionValue" class="action-value-select">
                            ${actionConfig.options.map(opt => `
                                <option value="${opt.value}" ${ruleToEdit?.actionValue === opt.value ? 'selected' : ''}>
                                    ${opt.label}
                                </option>
                            `).join('')}
                        </select>
                    `;
                } else {
                    // Number input for slider values
                    const min = actionConfig.min || 0;
                    const max = actionConfig.max || 100;
                    const unit = actionConfig.unit || '';
                    
                    actionValueInput.innerHTML = `
                        <div class="action-value-slider">
                            <input type="range" 
                                   id="actionValue" 
                                   min="${min}" 
                                   max="${max}" 
                                   value="${ruleToEdit?.actionValue || Math.round((max - min) / 2)}"
                                   class="slider-control">
                            <div class="slider-value">
                                <span id="actionValueDisplay">${ruleToEdit?.actionValue || Math.round((max - min) / 2)}</span>
                                <span>${unit}</span>
                            </div>
                        </div>
                    `;
                    
                    // Setup slider value display
                    const slider = actionValueInput.querySelector('.slider-control');
                    const display = actionValueInput.querySelector('#actionValueDisplay');
                    if (slider && display) {
                        slider.addEventListener('input', () => {
                            display.textContent = slider.value;
                        });
                    }
                }
            } else {
                actionValueContainer.style.display = 'none';
            }
        };
        
        // Initial load
        if (ruleTypeSelect.value) {
            loadConditionFields(ruleTypeSelect.value);
        }
        
        if (ruleActionSelect.value) {
            loadActionValueInput(ruleActionSelect.value);
        }
        
        // Event listeners
        ruleTypeSelect?.addEventListener('change', (e) => {
            loadConditionFields(e.target.value);
        });
        
        ruleActionSelect?.addEventListener('change', (e) => {
            loadActionValueInput(e.target.value);
        });
    };
    
    // Setup rule form submission
    const setupRuleFormSubmission = (ruleId = null) => {
        const form = document.getElementById('ruleForm');
        if (!form) return;
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            saveRule(ruleId);
        });
    };
    
    // Save rule
    const saveRule = (ruleId = null) => {
        const form = document.getElementById('ruleForm');
        if (!form) return;
        
        // Get form values
        const name = document.getElementById('ruleName').value;
        const description = document.getElementById('ruleDescription').value;
        const type = document.getElementById('ruleType').value;
        const action = document.getElementById('ruleAction').value;
        const actionValue = document.getElementById('actionValue')?.value;
        const priority = document.getElementById('rulePriority').value;
        const enabled = document.getElementById('ruleEnabled').checked;
        const sendNotification = document.getElementById('sendNotification').checked;
        
        // Build condition object based on rule type
        let condition = {};
        
        if (type === 'threshold') {
            const sensor = document.getElementById('conditionSensor').value;
            const operator = document.getElementById('conditionOperator').value;
            const value = parseFloat(document.getElementById('conditionValue').value);
            const unit = document.getElementById('conditionUnit').textContent;
            
            condition = { sensor, operator, value, unit };
        } else if (type === 'time') {
            const timeType = document.getElementById('conditionTimeType').value;
            
            if (timeType === 'time') {
                condition.time = document.getElementById('conditionTime').value;
            } else if (timeType === 'day') {
                condition.day = document.getElementById('conditionDay').value;
            } else if (timeType === 'interval') {
                condition.interval = parseInt(document.getElementById('conditionInterval').value);
            }
        } else if (type === 'device') {
            condition.device = document.getElementById('conditionDevice').value;
            condition.state = document.getElementById('conditionState').value;
        }
        
        // Create rule object
        const rule = {
            id: ruleId || generateRuleId(),
            name,
            description,
            type,
            condition,
            action,
            actionValue: actionValue !== undefined ? actionValue : null,
            priority,
            enabled,
            sendNotification,
            executionCount: 0,
            lastTriggered: null,
            createdAt: ruleId ? undefined : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Save rule
        if (ruleId) {
            // Update existing rule
            const updatedRule = StorageService.updateAutomationRule(ruleId, rule);
            if (updatedRule) {
                // Update local rules array
                const index = rules.findIndex(r => r.id === ruleId);
                if (index !== -1) {
                    rules[index] = updatedRule;
                }
                
                if (window.SmartOfficeApp && typeof window.SmartOfficeApp.showToast === 'function') {
                    window.SmartOfficeApp.showToast('Rule updated successfully', 'success');
                }
            }
        } else {
            // Add new rule
            rules.push(rule);
            StorageService.addNotification({
                type: 'info',
                title: 'New Automation Rule',
                message: `Rule "${name}" has been created`,
                priority: 'low'
            });
            
            if (window.SmartOfficeApp && typeof window.SmartOfficeApp.showToast === 'function') {
                window.SmartOfficeApp.showToast('Rule created successfully', 'success');
            }
        }
        
        // Save rules to storage
        localStorage.setItem('smartoffice_automation_rules', JSON.stringify(rules));
        
        // Close modal and reload
        closeRuleModal();
        loadRulesGrid();
        updateStats();
    };
    
    // Generate rule ID
    const generateRuleId = () => {
        return 'rule_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    };
    
    // Close rule modal
    const closeRuleModal = () => {
        const modal = document.getElementById('ruleModal');
        if (modal) {
            modal.style.display = 'none';
        }
    };
    
    // Edit rule
    const editRule = (ruleId) => {
        const rule = rules.find(r => r.id === ruleId);
        if (rule) {
            showRuleCreationModal(rule);
        }
    };
    
    // Delete rule
    const deleteRule = (ruleId) => {
        if (confirm('Are you sure you want to delete this rule?')) {
            const index = rules.findIndex(r => r.id === ruleId);
            if (index !== -1) {
                rules.splice(index, 1);
                localStorage.setItem('smartoffice_automation_rules', JSON.stringify(rules));
                
                if (window.SmartOfficeApp && typeof window.SmartOfficeApp.showToast === 'function') {
                    window.SmartOfficeApp.showToast('Rule deleted', 'info');
                }
                
                loadRulesGrid();
                updateStats();
            }
        }
    };
    
    // Toggle rule
    const toggleRule = (ruleId, enabled) => {
        const rule = rules.find(r => r.id === ruleId);
        if (rule) {
            rule.enabled = enabled;
            rule.updatedAt = new Date().toISOString();
            
            localStorage.setItem('smartoffice_automation_rules', JSON.stringify(rules));
            
            // Update UI
            const ruleCard = document.querySelector(`.rule-card[data-rule-id="${ruleId}"]`);
            if (ruleCard) {
                ruleCard.className = `rule-card ${enabled ? 'active' : 'inactive'}`;
                const statusEl = ruleCard.querySelector('.rule-status');
                if (statusEl) {
                    statusEl.className = `rule-status ${enabled ? 'enabled' : 'disabled'}`;
                    statusEl.innerHTML = `<i class="fas fa-circle"></i> ${enabled ? 'Active' : 'Inactive'}`;
                }
            }
            
            updateStats();
        }
    };
    
    // Toggle all rules
    const toggleAllRules = (enable) => {
        rules.forEach(rule => {
            rule.enabled = enable;
        });
        
        localStorage.setItem('smartoffice_automation_rules', JSON.stringify(rules));
        
        if (window.SmartOfficeApp && typeof window.SmartOfficeApp.showToast === 'function') {
            window.SmartOfficeApp.showToast(`All rules ${enable ? 'enabled' : 'disabled'}`, 'info');
        }
        
        loadRulesGrid();
        updateStats();
    };
    
    // Use template
    const useTemplate = (templateId) => {
        let rule = null;
        
        switch(templateId) {
            case 'energy-saver':
                rule = {
                    name: 'Energy Saver Mode',
                    description: 'Turn off lights and AC when office is empty to save energy',
                    type: 'threshold',
                    condition: { sensor: 'occupancy', operator: '==', value: 0, unit: 'people' },
                    action: 'lights.off',
                    actionValue: null,
                    priority: 'high',
                    enabled: true,
                    sendNotification: true
                };
                break;
                
            case 'comfort-mode':
                rule = {
                    name: 'Comfort Mode',
                    description: 'Maintain optimal temperature and air quality',
                    type: 'combination',
                    condition: [
                        { sensor: 'temperature', operator: '>', value: 27, unit: '°C' },
                        { sensor: 'airQuality', operator: '>', value: 150, unit: 'AQI' }
                    ],
                    actions: [
                        { action: 'ac.on', value: 24 },
                        { action: 'purifier.on', value: 'auto' }
                    ],
                    priority: 'medium',
                    enabled: true,
                    sendNotification: false
                };
                break;
                
            case 'security':
                rule = {
                    name: 'Security Protocol',
                    description: 'Automated security measures after office hours',
                    type: 'time',
                    condition: { time: '18:00' },
                    action: 'door.lock',
                    actionValue: null,
                    priority: 'high',
                    enabled: true,
                    sendNotification: true
                };
                break;
                
            case 'schedule':
                rule = {
                    name: 'Daily Schedule',
                    description: 'Automated office setup for work hours',
                    type: 'time',
                    condition: { time: '08:00', day: 'weekday' },
                    actions: [
                        { action: 'lights.on', value: 80 },
                        { action: 'ac.on', value: 23 },
                        { action: 'purifier.on', value: 'auto' }
                    ],
                    priority: 'medium',
                    enabled: true,
                    sendNotification: false
                };
                break;
        }
        
        if (rule) {
            rule.id = generateRuleId();
            rule.createdAt = new Date().toISOString();
            rule.updatedAt = new Date().toISOString();
            rule.executionCount = 0;
            rule.lastTriggered = null;
            
            rules.push(rule);
            localStorage.setItem('smartoffice_automation_rules', JSON.stringify(rules));
            
            if (window.SmartOfficeApp && typeof window.SmartOfficeApp.showToast === 'function') {
                window.SmartOfficeApp.showToast(`Template "${rule.name}" applied`, 'success');
            }
            
            loadRulesGrid();
            updateStats();
        }
    };
    
    // Import rules
    const importRules = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedRules = JSON.parse(e.target.result);
                    if (Array.isArray(importedRules)) {
                        // Add imported rules
                        importedRules.forEach(rule => {
                            rule.id = generateRuleId(); // Generate new IDs
                            rule.createdAt = new Date().toISOString();
                            rule.updatedAt = new Date().toISOString();
                            rule.executionCount = 0;
                            rule.lastTriggered = null;
                            
                            rules.push(rule);
                        });
                        
                        localStorage.setItem('smartoffice_automation_rules', JSON.stringify(rules));
                        
                        if (window.SmartOfficeApp && typeof window.SmartOfficeApp.showToast === 'function') {
                            window.SmartOfficeApp.showToast(`${importedRules.length} rules imported`, 'success');
                        }
                        
                        loadRulesGrid();
                        updateStats();
                    }
                } catch (error) {
                    if (window.SmartOfficeApp && typeof window.SmartOfficeApp.showToast === 'function') {
                        window.SmartOfficeApp.showToast('Failed to import rules', 'error');
                    }
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    };
    
    // Export rules
    const exportRules = () => {
        const dataStr = JSON.stringify(rules, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `smart-office-rules-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        if (window.SmartOfficeApp && typeof window.SmartOfficeApp.showToast === 'function') {
            window.SmartOfficeApp.showToast(`${rules.length} rules exported`, 'success');
        }
    };
    
    // Clear history
    const clearHistory = () => {
        if (confirm('Clear all execution history?')) {
            // Get all logs except automation logs
            const logs = StorageService.getActivityLogs();
            const filteredLogs = logs.filter(log => log.type !== 'automation');
            
            // Save filtered logs
            localStorage.setItem('smartoffice_activity_logs', JSON.stringify(filteredLogs));
            
            // Reload history
            loadExecutionHistory();
            
            if (window.SmartOfficeApp && typeof window.SmartOfficeApp.showToast === 'function') {
                window.SmartOfficeApp.showToast('Execution history cleared', 'info');
            }
        }
    };
    
    // Start rule checking
    const startRuleChecking = () => {
        // Check rules every 10 seconds
        ruleCheckInterval = setInterval(() => {
            checkRules();
        }, 10000);
    };
    
    // Check rules against current state
    const checkRules = (sensors = null) => {
        if (!sensors) {
            sensors = StorageService.getSensors();
        }
        
        const devices = StorageService.getDevices();
        const now = new Date();
        
        // Check each enabled rule
        rules.forEach(rule => {
            if (!rule.enabled) return;
            
            let conditionMet = false;
            
            // Check condition based on rule type
            if (rule.type === 'threshold' && sensors) {
                conditionMet = checkThresholdCondition(rule.condition, sensors);
            } else if (rule.type === 'time') {
                conditionMet = checkTimeCondition(rule.condition, now);
            } else if (rule.type === 'device' && devices) {
                conditionMet = checkDeviceCondition(rule.condition, devices);
            }
            
            // Execute action if condition is met
            if (conditionMet) {
                executeRule(rule, sensors, devices);
            }
        });
    };
    
    // Check threshold condition
    const checkThresholdCondition = (condition, sensors) => {
        if (!condition || !sensors || !condition.sensor) return false;
        
        const sensorValue = sensors[condition.sensor];
        const threshold = condition.value;
        
        if (sensorValue === undefined || threshold === undefined) return false;
        
        switch(condition.operator) {
            case '>': return sensorValue > threshold;
            case '<': return sensorValue < threshold;
            case '>=': return sensorValue >= threshold;
            case '<=': return sensorValue <= threshold;
            case '==': return Math.abs(sensorValue - threshold) < 0.1; // Allow small floating point errors
            case '!=': return Math.abs(sensorValue - threshold) >= 0.1;
            default: return false;
        }
    };
    
    // Check time condition
    const checkTimeCondition = (condition, now) => {
        if (!condition) return false;
        
        if (condition.time) {
            const [hours, minutes] = condition.time.split(':').map(Number);
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            
            // Check if current time matches within a 5-minute window
            return Math.abs((currentHour * 60 + currentMinute) - (hours * 60 + minutes)) <= 5;
        }
        
        if (condition.day) {
            const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const currentDayName = dayNames[currentDay];
            
            switch(condition.day) {
                case 'weekday': return currentDay >= 1 && currentDay <= 5;
                case 'weekend': return currentDay === 0 || currentDay === 6;
                case 'everyday': return true;
                default: return condition.day === currentDayName;
            }
        }
        
        if (condition.interval) {
            // Check if current minute is divisible by interval
            return (now.getMinutes() % condition.interval) === 0;
        }
        
        return false;
    };
    
    // Check device condition
    const checkDeviceCondition = (condition, devices) => {
        if (!condition || !devices || !condition.device) return false;
        
        const device = devices[condition.device];
        if (!device) return false;
        
        return device.status === condition.state;
    };
    
    // Execute rule action
    const executeRule = (rule, sensors, devices) => {
        // Check cooldown (prevent rapid re-execution)
        if (rule.lastTriggered) {
            const lastTrigger = new Date(rule.lastTriggered);
            const now = new Date();
            const minutesSinceLast = (now - lastTrigger) / (1000 * 60);
            
            if (minutesSinceLast < 1) { // 1 minute cooldown
                return;
            }
        }
        
        // Update rule stats
        rule.executionCount = (rule.executionCount || 0) + 1;
        rule.lastTriggered = new Date().toISOString();
        
        // Save updated rules
        localStorage.setItem('smartoffice_automation_rules', JSON.stringify(rules));
        
        // Execute action
        const [device, action] = rule.action.split('.');
        
        if (device && action) {
            let updates = {};
            
            switch(action) {
                case 'on':
                    updates.status = 'on';
                    break;
                case 'off':
                    updates.status = 'off';
                    break;
                case 'lock':
                    updates.status = 'locked';
                    break;
                case 'unlock':
                    updates.status = 'unlocked';
                    break;
                case 'brightness':
                    updates.brightness = parseInt(rule.actionValue);
                    break;
                case 'temperature':
                    updates.temperature = parseInt(rule.actionValue);
                    break;
                case 'mode':
                    updates.mode = rule.actionValue;
                    break;
                case 'speed':
                    updates.speed = parseInt(rule.actionValue);
                    break;
                case 'toggle':
                    const currentStatus = devices[device]?.status;
                    updates.status = currentStatus === 'on' ? 'off' : 'on';
                    break;
            }
            
            // Apply updates
            if (Object.keys(updates).length > 0) {
                StorageService.updateDevice(device, updates);
            }
        }
        
        // Log execution
        StorageService.logActivity({
            type: 'automation',
            action: `Rule executed: ${rule.name}`,
            details: {
                rule: rule.name,
                condition: formatCondition(rule),
                action: formatAction(rule),
                triggeredBy: 'automation_engine'
            }
        });
        
        // Send notification if configured
        if (rule.sendNotification) {
            StorageService.addNotification({
                type: 'info',
                title: 'Automation Triggered',
                message: `${rule.name}: ${formatCondition(rule)} → ${formatAction(rule)}`,
                priority: 'low'
            });
            
            if (window.SmartOfficeApp && typeof window.SmartOfficeApp.showToast === 'function') {
                window.SmartOfficeApp.showToast(`Rule "${rule.name}" executed`, 'info');
            }
        }
        
        // Update UI
        updateStats();
        loadRulesGrid();
        
        // Reload execution history
        setTimeout(() => {
            loadExecutionHistory();
        }, 100);
    };
    
    // Update stats
    const updateStats = () => {
        const activeRulesEl = document.getElementById('activeRules');
        if (activeRulesEl) {
            activeRulesEl.textContent = getActiveRulesCount();
        }
        
        // Calculate executed today
        const logs = StorageService.getActivityLogs();
        const today = new Date().toDateString();
        const executedToday = logs.filter(log => 
            log.type === 'automation' && 
            new Date(log.timestamp).toDateString() === today
        ).length;
        
        const executedTodayEl = document.getElementById('executedToday');
        if (executedTodayEl) {
            executedTodayEl.textContent = executedToday;
        }
        
        // Calculate energy saved (simplified)
        const energySavedEl = document.getElementById('energySaved');
        if (energySavedEl) {
            const totalExecutions = rules.reduce((sum, rule) => sum + (rule.executionCount || 0), 0);
            const estimatedSavings = totalExecutions * 0.5; // 0.5 kWh per execution
            energySavedEl.textContent = `${estimatedSavings.toFixed(1)} kWh`;
        }
    };
    
    // Format time ago
    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const past = new Date(timestamp);
        const diff = Math.floor((now - past) / 1000);
        
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };
    
    // Clean up
    const cleanup = () => {
        if (sensorUnsubscribe) {
            sensorUnsubscribe();
            sensorUnsubscribe = null;
        }
        
        if (ruleCheckInterval) {
            clearInterval(ruleCheckInterval);
            ruleCheckInterval = null;
        }
    };
    
    // Public API
    return {
        load,
        cleanup,
        checkRules // Expose for manual testing
    };
})();