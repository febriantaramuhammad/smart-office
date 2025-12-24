// AI Insights Module - Intelligent Analysis & Recommendations
const AIInsightsModule = (function() {
    let insightsInterval = null;
    let currentInsights = [];
    
    // AI Configuration
    const AI_CONFIG = {
        analysisInterval: 300000, // 5 minutes
        maxInsights: 20,
        patterns: {
            energy: {
                name: 'Energy Consumption',
                thresholds: {
                    low: 50,
                    medium: 100,
                    high: 150
                },
                patterns: [
                    'peak_hours',
                    'weekend_vs_weekday',
                    'device_contribution',
                    'trend_analysis'
                ]
            },
            occupancy: {
                name: 'Occupancy Patterns',
                thresholds: {
                    low: 10,
                    medium: 25,
                    high: 40
                },
                patterns: [
                    'peak_times',
                    'room_utilization',
                    'meeting_patterns',
                    'absenteeism'
                ]
            },
            comfort: {
                name: 'Comfort Level',
                thresholds: {
                    optimal_temp: { min: 20, max: 25 },
                    optimal_humidity: { min: 40, max: 60 },
                    optimal_aqi: { min: 0, max: 100 }
                },
                patterns: [
                    'temperature_stability',
                    'air_quality_trends',
                    'comfort_violations'
                ]
            },
            efficiency: {
                name: 'Operational Efficiency',
                patterns: [
                    'device_usage',
                    'automation_effectiveness',
                    'energy_waste',
                    'maintenance_needs'
                ]
            }
        }
    };
    
    // Insight types
    const INSIGHT_TYPES = {
        energy_saving: {
            name: 'Energy Saving',
            icon: 'fa-leaf',
            color: '#06D6A0',
            priority: 'high'
        },
        comfort_improvement: {
            name: 'Comfort Improvement',
            icon: 'fa-thermometer-half',
            color: '#4CC9F0',
            priority: 'medium'
        },
        efficiency_boost: {
            name: 'Efficiency Boost',
            icon: 'fa-bolt',
            color: '#FFD700',
            priority: 'high'
        },
        security_alert: {
            name: 'Security Alert',
            icon: 'fa-shield-alt',
            color: '#7209B7',
            priority: 'critical'
        },
        maintenance: {
            name: 'Maintenance',
            icon: 'fa-tools',
            color: '#F8961E',
            priority: 'medium'
        },
        optimization: {
            name: 'Optimization',
            icon: 'fa-chart-line',
            color: '#9D4EDD',
            priority: 'low'
        }
    };
    
    // Load AI Insights view
    const load = (container) => {
        // Load existing insights
        currentInsights = StorageService.getInsights();
        
        container.innerHTML = `
            <section class="content-section active" id="ai-insights">
                <div class="ai-insights-header">
                    <h2><i class="fas fa-brain"></i> AI Insights & Recommendations</h2>
                    <p class="subtitle">Intelligent analysis and predictive recommendations for your office optimization</p>
                </div>
                
                <div class="ai-stats">
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #06D6A0">
                            <i class="fas fa-lightbulb"></i>
                        </div>
                        <div class="stat-content">
                            <h3>Active Insights</h3>
                            <div class="stat-value" id="activeInsights">${currentInsights.length}</div>
                            <div class="stat-label">Current Recommendations</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #4CC9F0">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="stat-content">
                            <h3>Accuracy Rate</h3>
                            <div class="stat-value" id="accuracyRate">92%</div>
                            <div class="stat-label">Prediction Accuracy</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #F8961E">
                            <i class="fas fa-bolt"></i>
                        </div>
                        <div class="stat-content">
                            <h3>Energy Saved</h3>
                            <div class="stat-value" id="predictedSavings">15%</div>
                            <div class="stat-label">Predicted Monthly</div>
                        </div>
                    </div>
                </div>
                
                <div class="ai-controls">
                    <div class="ai-actions">
                        <button class="btn-ai-action" id="generateInsightsBtn">
                            <i class="fas fa-magic"></i>
                            <span>Generate New Insights</span>
                        </button>
                        <button class="btn-ai-action" id="analyzePatternsBtn">
                            <i class="fas fa-chart-bar"></i>
                            <span>Analyze Patterns</span>
                        </button>
                        <button class="btn-ai-action" id="clearInsightsBtn">
                            <i class="fas fa-trash"></i>
                            <span>Clear All</span>
                        </button>
                    </div>
                    
                    <div class="ai-filters">
                        <select id="insightFilter" class="filter-select">
                            <option value="all">All Insights</option>
                            <option value="high">High Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="low">Low Priority</option>
                            <option value="energy">Energy Saving</option>
                            <option value="comfort">Comfort</option>
                            <option value="efficiency">Efficiency</option>
                        </select>
                        <select id="timeFilter" class="filter-select">
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>
                </div>
                
                <div class="insights-container">
                    <div class="section-header">
                        <h3><i class="fas fa-lightbulb"></i> Latest Insights</h3>
                        <div class="insights-summary">
                            <span class="summary-item">
                                <i class="fas fa-exclamation-circle" style="color: #F72585"></i>
                                <span id="criticalCount">0</span> Critical
                            </span>
                            <span class="summary-item">
                                <i class="fas fa-exclamation-triangle" style="color: #F8961E"></i>
                                <span id="highCount">0</span> High
                            </span>
                            <span class="summary-item">
                                <i class="fas fa-info-circle" style="color: #4CC9F0"></i>
                                <span id="mediumCount">0</span> Medium
                            </span>
                        </div>
                    </div>
                    
                    <div class="insights-grid" id="insightsGrid">
                        <!-- Insights will be loaded here -->
                    </div>
                    
                    <div class="no-insights" id="noInsightsMessage" style="display: ${currentInsights.length > 0 ? 'none' : 'block'}">
                        <i class="fas fa-robot"></i>
                        <h4>No AI Insights Yet</h4>
                        <p>Click "Generate New Insights" to start AI analysis</p>
                    </div>
                </div>
                
                <div class="predictive-analytics">
                    <div class="section-header">
                        <h3><i class="fas fa-crystal-ball"></i> Predictive Analytics</h3>
                        <div class="timeframe-selector">
                            <button class="timeframe-btn active" data-timeframe="today">Today</button>
                            <button class="timeframe-btn" data-timeframe="tomorrow">Tomorrow</button>
                            <button class="timeframe-btn" data-timeframe="week">Next Week</button>
                        </div>
                    </div>
                    
                    <div class="predictive-cards">
                        <div class="predictive-card">
                            <div class="predictive-icon" style="background: #FF6B6B20; color: #FF6B6B">
                                <i class="fas fa-thermometer-half"></i>
                            </div>
                            <div class="predictive-content">
                                <h4>Temperature Forecast</h4>
                                <div class="predictive-value" id="tempPrediction">24°C ±1°C</div>
                                <div class="predictive-trend">
                                    <i class="fas fa-arrow-up trend-up"></i>
                                    <span>Expected to rise by 2°C</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="predictive-card">
                            <div class="predictive-icon" style="background: #45B7D120; color: #45B7D1">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="predictive-content">
                                <h4>Occupancy Prediction</h4>
                                <div class="predictive-value" id="occupancyPrediction">15-20 people</div>
                                <div class="predictive-trend">
                                    <i class="fas fa-arrow-down trend-down"></i>
                                    <span>15% lower than average</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="predictive-card">
                            <div class="predictive-icon" style="background: #F9C74F20; color: #F9C74F">
                                <i class="fas fa-bolt"></i>
                            </div>
                            <div class="predictive-content">
                                <h4>Energy Forecast</h4>
                                <div class="predictive-value" id="energyPrediction">85-95 kWh</div>
                                <div class="predictive-trend">
                                    <i class="fas fa-arrow-up trend-up"></i>
                                    <span>Peak at 14:00-16:00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="prediction-chart">
                        <canvas id="predictionChart" width="800" height="200"></canvas>
                    </div>
                </div>
                
                <div class="recommendations-engine">
                    <div class="section-header">
                        <h3><i class="fas fa-robot"></i> Smart Recommendations</h3>
                        <button class="btn-apply-all" id="applyAllBtn" disabled>
                            <i class="fas fa-check-double"></i>
                            Apply All Recommendations
                        </button>
                    </div>
                    
                    <div class="recommendations-list" id="recommendationsList">
                        <!-- Recommendations will be loaded here -->
                    </div>
                </div>
                
                <div class="ai-settings">
                    <div class="section-header">
                        <h3><i class="fas fa-cog"></i> AI Settings</h3>
                    </div>
                    
                    <div class="settings-grid">
                        <div class="setting-card">
                            <div class="setting-header">
                                <h4><i class="fas fa-brain"></i> AI Intelligence Level</h4>
                                <div class="setting-toggle">
                                    <label class="switch">
                                        <input type="checkbox" id="aiEnabled" checked>
                                        <span class="slider"></span>
                                    </label>
                                </div>
                            </div>
                            <p class="setting-description">
                                Enable AI-powered analysis and recommendations
                            </p>
                            <div class="setting-options">
                                <select id="aiLevel" class="setting-select">
                                    <option value="basic">Basic Analysis</option>
                                    <option value="standard" selected>Standard Intelligence</option>
                                    <option value="advanced">Advanced AI</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="setting-card">
                            <div class="setting-header">
                                <h4><i class="fas fa-bell"></i> Notification Preferences</h4>
                                <div class="setting-toggle">
                                    <label class="switch">
                                        <input type="checkbox" id="notificationsEnabled" checked>
                                        <span class="slider"></span>
                                    </label>
                                </div>
                            </div>
                            <p class="setting-description">
                                Receive alerts for important insights
                            </p>
                            <div class="setting-options">
                                <div class="checkbox-group">
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="notifyCritical" checked>
                                        <span>Critical Insights</span>
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="notifyHigh" checked>
                                        <span>High Priority</span>
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="notifyMedium">
                                        <span>Medium Priority</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="setting-card">
                            <div class="setting-header">
                                <h4><i class="fas fa-history"></i> Analysis Frequency</h4>
                            </div>
                            <p class="setting-description">
                                How often AI should analyze data
                            </p>
                            <div class="setting-options">
                                <select id="analysisFrequency" class="setting-select">
                                    <option value="5">Every 5 minutes</option>
                                    <option value="15" selected>Every 15 minutes</option>
                                    <option value="30">Every 30 minutes</option>
                                    <option value="60">Every hour</option>
                                    <option value="240">Every 4 hours</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="setting-card">
                            <div class="setting-header">
                                <h4><i class="fas fa-database"></i> Data Collection</h4>
                                <div class="setting-toggle">
                                    <label class="switch">
                                        <input type="checkbox" id="dataCollection" checked>
                                        <span class="slider"></span>
                                    </label>
                                </div>
                            </div>
                            <p class="setting-description">
                                Allow AI to learn from historical data
                            </p>
                            <div class="setting-options">
                                <div class="data-retention">
                                    <span>Data retention:</span>
                                    <select id="dataRetention" class="setting-select small">
                                        <option value="7">7 days</option>
                                        <option value="30" selected>30 days</option>
                                        <option value="90">90 days</option>
                                        <option value="365">1 year</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Insight Detail Modal -->
                <div class="modal-overlay" id="insightModal" style="display: none">
                    <div class="modal-content insight-modal">
                        <div class="modal-header">
                            <h3 id="insightModalTitle"></h3>
                            <button class="modal-close" id="closeInsightModalBtn">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body" id="insightModalBody">
                            <!-- Insight details will be loaded here -->
                        </div>
                    </div>
                </div>
            </section>
        `;
        
        // Load insights
        loadInsightsGrid();
        
        // Load recommendations
        loadRecommendations();
        
        // Setup predictive analytics
        setupPredictiveAnalytics();
        
        // Setup event listeners
        setupEventListeners();
        
        // Start periodic insights generation
        startInsightsGeneration();
        
        // Update counts
        updateInsightCounts();
    };
    
    // Load insights grid
    const loadInsightsGrid = () => {
        const insightsGrid = document.getElementById('insightsGrid');
        const filter = document.getElementById('insightFilter')?.value || 'all';
        const timeFilter = document.getElementById('timeFilter')?.value || 'all';
        
        if (!insightsGrid) return;
        
        // Filter insights
        let filteredInsights = [...currentInsights];
        
        // Apply type filter
        if (filter !== 'all') {
            if (['high', 'medium', 'low'].includes(filter)) {
                filteredInsights = currentInsights.filter(insight => 
                    insight.priority === filter
                );
            } else {
                filteredInsights = currentInsights.filter(insight => 
                    insight.type === filter
                );
            }
        }
        
        // Apply time filter
        if (timeFilter !== 'all') {
            const now = new Date();
            filteredInsights = filteredInsights.filter(insight => {
                const insightDate = new Date(insight.timestamp);
                
                switch(timeFilter) {
                    case 'today':
                        return insightDate.toDateString() === now.toDateString();
                    case 'week':
                        const weekAgo = new Date(now);
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return insightDate >= weekAgo;
                    case 'month':
                        const monthAgo = new Date(now);
                        monthAgo.setMonth(monthAgo.getMonth() - 1);
                        return insightDate >= monthAgo;
                    default:
                        return true;
                }
            });
        }
        
        // Sort by priority and timestamp (newest first)
        filteredInsights.sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            
            if (priorityDiff !== 0) return priorityDiff;
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        if (filteredInsights.length === 0) {
            insightsGrid.innerHTML = '';
            document.getElementById('noInsightsMessage').style.display = 'block';
            return;
        }
        
        document.getElementById('noInsightsMessage').style.display = 'none';
        
        insightsGrid.innerHTML = filteredInsights.map(insight => `
            <div class="insight-card ${insight.priority}" data-insight-id="${insight.id}">
                <div class="insight-card-header">
                    <div class="insight-type-icon" style="background: ${INSIGHT_TYPES[insight.type]?.color || '#666'}20; color: ${INSIGHT_TYPES[insight.type]?.color || '#666'}">
                        <i class="fas ${INSIGHT_TYPES[insight.type]?.icon || 'fa-lightbulb'}"></i>
                    </div>
                    <div class="insight-info">
                        <h4 class="insight-title">${insight.title}</h4>
                        <div class="insight-category">
                            <span class="category-tag" style="background: ${INSIGHT_TYPES[insight.type]?.color || '#666'}20; color: ${INSIGHT_TYPES[insight.type]?.color || '#666'}">
                                ${INSIGHT_TYPES[insight.type]?.name || insight.type}
                            </span>
                            <span class="priority-badge ${insight.priority}">
                                ${insight.priority.toUpperCase()}
                            </span>
                        </div>
                    </div>
                    <div class="insight-actions">
                        <button class="btn-insight-action view" data-insight-id="${insight.id}" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-insight-action dismiss" data-insight-id="${insight.id}" title="Dismiss">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <div class="insight-card-body">
                    <p class="insight-description">${insight.description}</p>
                    
                    <div class="insight-metrics">
                        ${insight.metrics ? `
                        <div class="metrics-grid">
                            ${Object.entries(insight.metrics).map(([key, value]) => `
                                <div class="metric-item">
                                    <div class="metric-label">${formatMetricLabel(key)}</div>
                                    <div class="metric-value">${formatMetricValue(key, value)}</div>
                                </div>
                            `).join('')}
                        </div>
                        ` : ''}
                    </div>
                    
                    ${insight.recommendation ? `
                    <div class="insight-recommendation">
                        <div class="recommendation-label">
                            <i class="fas fa-robot"></i>
                            Recommendation:
                        </div>
                        <div class="recommendation-text">${insight.recommendation}</div>
                    </div>
                    ` : ''}
                </div>
                
                <div class="insight-card-footer">
                    <div class="insight-timestamp">
                        <i class="fas fa-clock"></i>
                        ${formatTimeAgo(insight.timestamp)}
                    </div>
                    <div class="insight-confidence">
                        <div class="confidence-bar">
                            <div class="confidence-level" style="width: ${insight.confidence || 75}%"></div>
                        </div>
                        <span class="confidence-value">${insight.confidence || 75}% confidence</span>
                    </div>
                </div>
            </div>
        `).join('');
    };
    
    // Format metric label
    const formatMetricLabel = (key) => {
        const labels = {
            'current_value': 'Current Value',
            'threshold': 'Threshold',
            'deviation': 'Deviation',
            'savings_potential': 'Savings Potential',
            'impact': 'Impact Level',
            'frequency': 'Frequency'
        };
        return labels[key] || key.replace('_', ' ');
    };
    
    // Format metric value
    const formatMetricValue = (key, value) => {
        if (typeof value === 'number') {
            if (key.includes('temperature')) {
                return `${value.toFixed(1)}°C`;
            } else if (key.includes('energy') || key.includes('power')) {
                return `${value.toFixed(1)} kWh`;
            } else if (key.includes('percentage') || key.includes('confidence') || key.includes('savings')) {
                return `${value.toFixed(1)}%`;
            } else if (key.includes('humidity')) {
                return `${value.toFixed(1)}%`;
            } else if (key.includes('aqi')) {
                return `${Math.round(value)} AQI`;
            }
            return value.toFixed(1);
        }
        return value;
    };
    
    // Load recommendations
    const loadRecommendations = () => {
        const recommendationsList = document.getElementById('recommendationsList');
        if (!recommendationsList) return;
        
        // Filter insights that have actionable recommendations
        const actionableInsights = currentInsights.filter(insight => 
            insight.recommendation && 
            !insight.applied && 
            insight.priority !== 'low'
        );
        
        if (actionableInsights.length === 0) {
            recommendationsList.innerHTML = `
                <div class="no-recommendations">
                    <i class="fas fa-check-circle"></i>
                    <h4>No Active Recommendations</h4>
                    <p>All insights have been addressed or no actionable recommendations available</p>
                </div>
            `;
            document.getElementById('applyAllBtn').disabled = true;
            return;
        }
        
        document.getElementById('applyAllBtn').disabled = false;
        
        recommendationsList.innerHTML = actionableInsights.map(insight => `
            <div class="recommendation-item ${insight.priority}" data-insight-id="${insight.id}">
                <div class="recommendation-header">
                    <div class="recommendation-icon" style="color: ${INSIGHT_TYPES[insight.type]?.color || '#666'}">
                        <i class="fas ${INSIGHT_TYPES[insight.type]?.icon || 'fa-lightbulb'}"></i>
                    </div>
                    <div class="recommendation-content">
                        <h4>${insight.title}</h4>
                        <p class="recommendation-text">${insight.recommendation}</p>
                        <div class="recommendation-benefits">
                            <span class="benefit-item">
                                <i class="fas fa-bolt"></i>
                                <span>Savings: ${insight.metrics?.savings_potential || '15'}%</span>
                            </span>
                            <span class="benefit-item">
                                <i class="fas fa-clock"></i>
                                <span>Impact: ${insight.metrics?.impact || 'Medium'}</span>
                            </span>
                        </div>
                    </div>
                    <div class="recommendation-actions">
                        <button class="btn-recommendation apply" data-insight-id="${insight.id}">
                            <i class="fas fa-check"></i>
                            Apply
                        </button>
                        <button class="btn-recommendation postpone" data-insight-id="${insight.id}">
                            <i class="fas fa-clock"></i>
                            Later
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    };
    
    // Setup predictive analytics
    const setupPredictiveAnalytics = () => {
        // Generate predictions
        generatePredictions('today');
        
        // Setup timeframe buttons
        document.querySelectorAll('.timeframe-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('.timeframe-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
                
                const timeframe = e.target.dataset.timeframe;
                generatePredictions(timeframe);
            });
        });
        
        // Setup prediction chart
        renderPredictionChart();
    };
    
    // Generate predictions
    const generatePredictions = (timeframe) => {
        // Get historical data for prediction
        const sensors = StorageService.getSensors();
        const historicalData = generateHistoricalData(7); // Last 7 days
        
        // Generate predictions based on timeframe
        let tempPrediction = '24°C ±1°C';
        let occupancyPrediction = '15-20 people';
        let energyPrediction = '85-95 kWh';
        let tempTrend = 'rise by 2°C';
        let occupancyTrend = '15% lower than average';
        let energyTrend = 'Peak at 14:00-16:00';
        
        // Adjust based on timeframe
        if (timeframe === 'tomorrow') {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dayOfWeek = tomorrow.getDay();
            
            // Weekend vs weekday prediction
            if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
                occupancyPrediction = '5-10 people';
                occupancyTrend = '70% lower than weekdays';
                energyPrediction = '40-50 kWh';
                energyTrend = 'Low consumption expected';
            } else {
                // Check for patterns
                const avgOccupancy = historicalData.occupancy.avg;
                const avgEnergy = historicalData.energy.avg;
                
                occupancyPrediction = `${Math.round(avgOccupancy * 0.9)}-${Math.round(avgOccupancy * 1.1)} people`;
                energyPrediction = `${Math.round(avgEnergy * 0.95)}-${Math.round(avgEnergy * 1.05)} kWh`;
            }
        } else if (timeframe === 'week') {
            tempPrediction = '23-26°C';
            occupancyPrediction = 'Varies by day';
            energyPrediction = '80-110 kWh';
            energyTrend = 'Higher mid-week';
        }
        
        // Update UI
        const tempPredictionEl = document.getElementById('tempPrediction');
        const occupancyPredictionEl = document.getElementById('occupancyPrediction');
        const energyPredictionEl = document.getElementById('energyPrediction');
        
        if (tempPredictionEl) tempPredictionEl.textContent = tempPrediction;
        if (occupancyPredictionEl) occupancyPredictionEl.textContent = occupancyPrediction;
        if (energyPredictionEl) energyPredictionEl.textContent = energyPrediction;
        
        // Update trend indicators
        const tempTrendEl = document.querySelector('#tempPrediction + .predictive-trend span');
        const occupancyTrendEl = document.querySelector('#occupancyPrediction + .predictive-trend span');
        const energyTrendEl = document.querySelector('#energyPrediction + .predictive-trend span');
        
        if (tempTrendEl) tempTrendEl.textContent = `Expected to ${tempTrend}`;
        if (occupancyTrendEl) occupancyTrendEl.textContent = occupancyTrend;
        if (energyTrendEl) energyTrendEl.textContent = energyTrend;
        
        // Update trend icons
        const tempTrendIcon = document.querySelector('#tempPrediction + .predictive-trend i');
        const occupancyTrendIcon = document.querySelector('#occupancyPrediction + .predictive-trend i');
        
        if (tempTrendIcon) {
            tempTrendIcon.className = tempTrend.includes('rise') ? 
                'fas fa-arrow-up trend-up' : 'fas fa-arrow-down trend-down';
        }
        
        if (occupancyTrendIcon) {
            occupancyTrendIcon.className = occupancyTrend.includes('lower') ? 
                'fas fa-arrow-down trend-down' : 'fas fa-arrow-up trend-up';
        }
    };
    
    // Render prediction chart
    const renderPredictionChart = () => {
        const canvas = document.getElementById('predictionChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Generate prediction data
        const hours = Array.from({ length: 24 }, (_, i) => i);
        const predictedEnergy = hours.map(hour => {
            // Base pattern: lower at night, peaks during day
            const base = 40;
            const peak = 120;
            const isPeakHour = hour >= 9 && hour <= 17;
            const isMidPeak = hour >= 14 && hour <= 16;
            
            let value = base;
            if (isPeakHour) {
                value = base + (peak - base) * 0.7;
                if (isMidPeak) {
                    value = peak;
                }
            }
            
            // Add some randomness
            return value + Math.random() * 20 - 10;
        });
        
        const predictedOccupancy = hours.map(hour => {
            // Office hours pattern
            if (hour < 8 || hour > 18) return Math.random() * 5;
            if (hour >= 9 && hour <= 16) return 20 + Math.random() * 15;
            return 10 + Math.random() * 10;
        });
        
        // Calculate dimensions
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        
        // Find data ranges
        const energyMax = Math.max(...predictedEnergy);
        const occupancyMax = Math.max(...predictedOccupancy);
        
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
            
            // Y-axis labels
            ctx.fillStyle = '#666';
            ctx.font = '10px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(`${Math.round((energyMax * i) / 5)} kWh`, padding - 5, y + 3);
        }
        
        // Draw energy prediction line
        ctx.beginPath();
        ctx.strokeStyle = '#F9C74F';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        
        predictedEnergy.forEach((value, index) => {
            const x = padding + (chartWidth * (index / (hours.length - 1)));
            const y = padding + chartHeight * (1 - (value / energyMax));
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw occupancy prediction line
        ctx.beginPath();
        ctx.strokeStyle = '#45B7D1';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        
        predictedOccupancy.forEach((value, index) => {
            const x = padding + (chartWidth * (index / (hours.length - 1)));
            const y = padding + chartHeight * (1 - (value / occupancyMax));
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw X-axis labels (hours)
        hours.forEach((hour, index) => {
            if (index % 3 === 0) { // Show every 3 hours
                const x = padding + (chartWidth * (index / (hours.length - 1)));
                
                ctx.fillStyle = '#666';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`${hour}:00`, x, height - padding + 15);
                
                // Vertical grid line
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
                ctx.moveTo(x, padding);
                ctx.lineTo(x, height - padding);
                ctx.stroke();
            }
        });
        
        // Draw legend
        ctx.fillStyle = '#F9C74F';
        ctx.fillRect(width - 150, padding, 10, 10);
        ctx.fillStyle = '#666';
        ctx.font = '11px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Energy Usage (kWh)', width - 135, padding + 9);
        
        ctx.fillStyle = '#45B7D1';
        ctx.fillRect(width - 150, padding + 20, 10, 10);
        ctx.fillStyle = '#666';
        ctx.fillText('Occupancy (people)', width - 135, padding + 29);
        
        // Draw peak hours highlight
        const startPeakX = padding + (chartWidth * (9 / 23));
        const endPeakX = padding + (chartWidth * (17 / 23));
        
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = '#F8961E';
        ctx.fillRect(startPeakX, padding, endPeakX - startPeakX, chartHeight);
        ctx.globalAlpha = 1;
        
        ctx.fillStyle = '#F8961E';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Peak Hours', (startPeakX + endPeakX) / 2, padding - 5);
    };
    
    // Generate historical data for analysis
    const generateHistoricalData = (days = 7) => {
        const now = new Date();
        const historical = {
            temperature: [],
            energy: [],
            occupancy: [],
            timestamps: []
        };
        
        for (let i = days; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            // Generate realistic daily pattern
            for (let h = 0; h < 24; h += 3) {
                const timestamp = new Date(date);
                timestamp.setHours(h);
                
                // Base values with daily pattern
                const baseTemp = 22 + Math.sin(h / 24 * Math.PI) * 4 + (Math.random() * 2 - 1);
                const baseEnergy = 60 + Math.sin(h / 24 * Math.PI) * 30 + (Math.random() * 10 - 5);
                const baseOccupancy = h >= 8 && h <= 18 ? 
                    Math.floor(Math.random() * 30) + 10 : 
                    Math.floor(Math.random() * 5);
                
                historical.temperature.push(baseTemp);
                historical.energy.push(baseEnergy);
                historical.occupancy.push(baseOccupancy);
                historical.timestamps.push(timestamp);
            }
        }
        
        // Calculate statistics
        const calculateStats = (array) => ({
            avg: array.reduce((a, b) => a + b, 0) / array.length,
            min: Math.min(...array),
            max: Math.max(...array),
            std: calculateStdDev(array)
        });
        
        return {
            temperature: calculateStats(historical.temperature),
            energy: calculateStats(historical.energy),
            occupancy: calculateStats(historical.occupancy),
            timestamps: historical.timestamps
        };
    };
    
    // Calculate standard deviation
    const calculateStdDev = (array) => {
        const avg = array.reduce((a, b) => a + b, 0) / array.length;
        const squareDiffs = array.map(value => Math.pow(value - avg, 2));
        const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
        return Math.sqrt(avgSquareDiff);
    };
    
    // Setup event listeners
    const setupEventListeners = () => {
        // Generate insights button
        document.getElementById('generateInsightsBtn')?.addEventListener('click', generateInsights);
        
        // Analyze patterns button
        document.getElementById('analyzePatternsBtn')?.addEventListener('click', analyzePatterns);
        
        // Clear insights button
        document.getElementById('clearInsightsBtn')?.addEventListener('click', clearInsights);
        
        // Apply all recommendations button
        document.getElementById('applyAllBtn')?.addEventListener('click', applyAllRecommendations);
        
        // Filter changes
        document.getElementById('insightFilter')?.addEventListener('change', loadInsightsGrid);
        document.getElementById('timeFilter')?.addEventListener('change', loadInsightsGrid);
        
        // Event delegation for insight actions
        document.addEventListener('click', handleInsightActions);
        
        // Settings changes
        document.getElementById('aiEnabled')?.addEventListener('change', updateAISettings);
        document.getElementById('notificationsEnabled')?.addEventListener('change', updateNotificationSettings);
        document.getElementById('analysisFrequency')?.addEventListener('change', updateAnalysisFrequency);
        document.getElementById('dataCollection')?.addEventListener('change', updateDataCollection);
        
        // Modal close button
        document.getElementById('closeInsightModalBtn')?.addEventListener('click', closeInsightModal);
        
        // Close modal on overlay click
        document.querySelector('#insightModal .modal-overlay')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                closeInsightModal();
            }
        });
    };
    
    // Handle insight actions via event delegation
    const handleInsightActions = (e) => {
        const target = e.target;
        
        // View insight details
        if (target.closest('.btn-insight-action.view') || target.closest('.insight-card')) {
            const button = target.closest('.btn-insight-action.view') || target.closest('.insight-card');
            const insightId = button.dataset.insightId;
            if (insightId) {
                viewInsightDetails(insightId);
            }
        }
        
        // Dismiss insight
        if (target.closest('.btn-insight-action.dismiss')) {
            const button = target.closest('.btn-insight-action.dismiss');
            const insightId = button.dataset.insightId;
            if (insightId) {
                dismissInsight(insightId);
            }
        }
        
        // Apply recommendation
        if (target.closest('.btn-recommendation.apply')) {
            const button = target.closest('.btn-recommendation.apply');
            const insightId = button.dataset.insightId;
            if (insightId) {
                applyRecommendation(insightId);
            }
        }
        
        // Postpone recommendation
        if (target.closest('.btn-recommendation.postpone')) {
            const button = target.closest('.btn-recommendation.postpone');
            const insightId = button.dataset.insightId;
            if (insightId) {
                postponeRecommendation(insightId);
            }
        }
    };
    
    // Generate insights
    const generateInsights = () => {
        const insights = analyzeCurrentState();
        
        // Add new insights to storage
        insights.forEach(insight => {
            StorageService.addInsight(insight);
        });
        
        // Reload insights
        currentInsights = StorageService.getInsights();
        loadInsightsGrid();
        loadRecommendations();
        updateInsightCounts();
        
        // Show notification
        if (window.SmartOfficeApp && typeof window.SmartOfficeApp.showToast === 'function') {
            window.SmartOfficeApp.showToast(`${insights.length} new insights generated`, 'success');
        }
        
        // Update prediction chart
        renderPredictionChart();
    };
    
    // Analyze current state and generate insights
    const analyzeCurrentState = () => {
        const insights = [];
        const sensors = StorageService.getSensors();
        const devices = StorageService.getDevices();
        const now = new Date();
        const hour = now.getHours();
        
        // 1. Energy Consumption Analysis
        if (sensors?.energy > AI_CONFIG.patterns.energy.thresholds.high) {
            insights.push({
                id: `insight_${Date.now()}_energy`,
                title: 'High Energy Consumption Detected',
                description: `Current energy usage (${sensors.energy}kWh) is above the optimal range. This could indicate inefficient device usage or equipment issues.`,
                type: 'energy_saving',
                priority: 'high',
                confidence: 85,
                metrics: {
                    current_value: sensors.energy,
                    threshold: AI_CONFIG.patterns.energy.thresholds.high,
                    deviation: ((sensors.energy - AI_CONFIG.patterns.energy.thresholds.high) / AI_CONFIG.patterns.energy.thresholds.high * 100).toFixed(1),
                    savings_potential: 25
                },
                recommendation: 'Consider turning off non-essential devices and check AC settings. Enable Eco Mode during peak hours.',
                timestamp: new Date().toISOString()
            });
        }
        
        // 2. Occupancy-based Insights
        if (sensors?.occupancy === 0 && hour >= 8 && hour <= 18) {
            insights.push({
                id: `insight_${Date.now()}_occupancy`,
                title: 'Office Empty During Work Hours',
                description: 'The office appears to be empty during typical work hours. This may indicate scheduling issues or remote work days.',
                type: 'efficiency_boost',
                priority: 'medium',
                confidence: 90,
                metrics: {
                    current_occupancy: sensors.occupancy,
                    expected_occupancy: '15-25 people',
                    time_of_day: `${hour}:00`,
                    day_type: now.getDay() >= 1 && now.getDay() <= 5 ? 'Weekday' : 'Weekend'
                },
                recommendation: 'Consider implementing flexible work schedules or optimize office space usage. Turn off lights and AC to save energy.',
                timestamp: new Date().toISOString()
            });
        }
        
        // 3. Temperature Optimization
        if (sensors?.temperature > AI_CONFIG.patterns.comfort.thresholds.optimal_temp.max) {
            insights.push({
                id: `insight_${Date.now()}_temp`,
                title: 'Suboptimal Office Temperature',
                description: `Current temperature (${sensors.temperature.toFixed(1)}°C) is above the optimal comfort range (20-25°C).`,
                type: 'comfort_improvement',
                priority: 'medium',
                confidence: 92,
                metrics: {
                    current_temperature: sensors.temperature,
                    optimal_min: AI_CONFIG.patterns.comfort.thresholds.optimal_temp.min,
                    optimal_max: AI_CONFIG.patterns.comfort.thresholds.optimal_temp.max,
                    deviation: (sensors.temperature - AI_CONFIG.patterns.comfort.thresholds.optimal_temp.max).toFixed(1)
                },
                recommendation: 'Adjust AC temperature to 24°C for optimal comfort and energy efficiency.',
                timestamp: new Date().toISOString()
            });
        }
        
        // 4. Air Quality Analysis
        if (sensors?.airQuality > AI_CONFIG.patterns.comfort.thresholds.optimal_aqi.max) {
            insights.push({
                id: `insight_${Date.now()}_air`,
                title: 'Poor Air Quality Detected',
                description: `Air Quality Index (${sensors.airQuality} AQI) indicates suboptimal air conditions. This may affect employee comfort and productivity.`,
                type: 'comfort_improvement',
                priority: 'high',
                confidence: 88,
                metrics: {
                    current_aqi: sensors.airQuality,
                    optimal_max: AI_CONFIG.patterns.comfort.thresholds.optimal_aqi.max,
                    condition: sensors.airQuality > 150 ? 'Unhealthy' : 'Moderate'
                },
                recommendation: 'Turn on air purifier and increase ventilation. Consider scheduling breaks for fresh air.',
                timestamp: new Date().toISOString()
            });
        }
        
        // 5. Device Usage Patterns
        const activeDevices = devices ? Object.values(devices).filter(d => d.status === 'on').length : 0;
        if (activeDevices > 3 && sensors?.occupancy < 5) {
            insights.push({
                id: `insight_${Date.now()}_devices`,
                title: 'Excessive Device Usage with Low Occupancy',
                description: `${activeDevices} devices are active with only ${sensors?.occupancy || 0} people in the office.`,
                type: 'energy_saving',
                priority: 'medium',
                confidence: 78,
                metrics: {
                    active_devices: activeDevices,
                    occupancy: sensors?.occupancy || 0,
                    device_ratio: (activeDevices / Math.max(1, sensors?.occupancy || 1)).toFixed(1),
                    potential_savings: 30
                },
                recommendation: 'Consider turning off unused devices or implementing automatic power management.',
                timestamp: new Date().toISOString()
            });
        }
        
        // 6. Predictive Maintenance
        if (devices?.ac?.status === 'on' && hour > 18) {
            insights.push({
                id: `insight_${Date.now()}_maintenance`,
                title: 'AC Running After Hours',
                description: 'Air conditioner is running outside of typical office hours. This may indicate scheduling issues or forgotten shutdown.',
                type: 'maintenance',
                priority: 'low',
                confidence: 95,
                metrics: {
                    device: 'Air Conditioner',
                    status: 'On',
                    current_time: `${hour}:00`,
                    recommended_off_time: '18:00',
                    extra_runtime: (hour - 18) + ' hours'
                },
                recommendation: 'Schedule automatic AC shutdown at 18:00 or implement occupancy-based control.',
                timestamp: new Date().toISOString()
            });
        }
        
        // Limit number of insights
        return insights.slice(0, AI_CONFIG.maxInsights);
    };
    
    // Analyze patterns
    const analyzePatterns = () => {
        const historicalData = generateHistoricalData(30); // Last 30 days
        
        // Generate pattern-based insights
        const patternInsights = [];
        
        // Energy pattern analysis
        if (historicalData.energy.avg > AI_CONFIG.patterns.energy.thresholds.medium) {
            patternInsights.push({
                id: `pattern_${Date.now()}_energy_trend`,
                title: 'Consistently High Energy Usage',
                description: `Average energy consumption (${historicalData.energy.avg.toFixed(1)}kWh) is above optimal levels over the past month.`,
                type: 'energy_saving',
                priority: 'high',
                confidence: 82,
                metrics: {
                    average_consumption: historicalData.energy.avg,
                    optimal_level: AI_CONFIG.patterns.energy.thresholds.medium,
                    trend: historicalData.energy.std > 10 ? 'Variable' : 'Stable',
                    monthly_increase: '5%'
                },
                recommendation: 'Implement energy monitoring system and schedule energy audit. Consider upgrading to energy-efficient devices.',
                timestamp: new Date().toISOString(),
                isPattern: true
            });
        }
        
        // Occupancy pattern analysis
        if (historicalData.occupancy.avg < AI_CONFIG.patterns.occupancy.thresholds.low) {
            patternInsights.push({
                id: `pattern_${Date.now()}_occupancy_trend`,
                title: 'Low Office Utilization',
                description: `Average office occupancy (${historicalData.occupancy.avg.toFixed(1)} people) suggests underutilization of office space.`,
                type: 'efficiency_boost',
                priority: 'medium',
                confidence: 88,
                metrics: {
                    average_occupancy: historicalData.occupancy.avg,
                    capacity_utilization: ((historicalData.occupancy.avg / 50) * 100).toFixed(1) + '%',
                    peak_occupancy: historicalData.occupancy.max,
                    low_occupancy_days: Math.round(historicalData.occupancy.avg < 10 ? 8 : 4)
                },
                recommendation: 'Consider flexible seating arrangements or shared workspace optimization. Review remote work policies.',
                timestamp: new Date().toISOString(),
                isPattern: true
            });
        }
        
        // Add pattern insights
        patternInsights.forEach(insight => {
            StorageService.addInsight(insight);
        });
        
        // Reload insights
        currentInsights = StorageService.getInsights();
        loadInsightsGrid();
        updateInsightCounts();
        
        // Show notification
        if (window.SmartOfficeApp && typeof window.SmartOfficeApp.showToast === 'function') {
            window.SmartOfficeApp.showToast(`Pattern analysis complete: ${patternInsights.length} insights found`, 'success');
        }
    };
    
    // Clear insights
    const clearInsights = () => {
        if (confirm('Clear all AI insights? This action cannot be undone.')) {
            // Clear insights from storage
            localStorage.setItem('smartoffice_ai_insights', JSON.stringify([]));
            
            // Update local state
            currentInsights = [];
            
            // Reload UI
            loadInsightsGrid();
            loadRecommendations();
            updateInsightCounts();
            
            // Show notification
            if (window.SmartOfficeApp && typeof window.SmartOfficeApp.showToast === 'function') {
                window.SmartOfficeApp.showToast('All insights cleared', 'info');
            }
        }
    };
    
    // Apply all recommendations
    const applyAllRecommendations = () => {
        const actionableInsights = currentInsights.filter(insight => 
            insight.recommendation && !insight.applied
        );
        
        if (actionableInsights.length === 0) return;
        
        if (confirm(`Apply all ${actionableInsights.length} recommendations?`)) {
            actionableInsights.forEach(insight => {
                applyRecommendation(insight.id, true);
            });
            
            // Show notification
            if (window.SmartOfficeApp && typeof window.SmartOfficeApp.showToast === 'function') {
                window.SmartOfficeApp.showToast(`${actionableInsights.length} recommendations applied`, 'success');
            }
            
            // Reload recommendations
            loadRecommendations();
        }
    };
    
    // View insight details
    const viewInsightDetails = (insightId) => {
        const insight = currentInsights.find(i => i.id === insightId);
        if (!insight) return;
        
        const modal = document.getElementById('insightModal');
        const modalTitle = document.getElementById('insightModalTitle');
        const modalBody = document.getElementById('insightModalBody');
        
        if (!modal || !modalTitle || !modalBody) return;
        
        modalTitle.textContent = insight.title;
        
        modalBody.innerHTML = `
            <div class="insight-detail">
                <div class="detail-header ${insight.priority}">
                    <div class="detail-type">
                        <div class="type-icon" style="background: ${INSIGHT_TYPES[insight.type]?.color || '#666'}20; color: ${INSIGHT_TYPES[insight.type]?.color || '#666'}">
                            <i class="fas ${INSIGHT_TYPES[insight.type]?.icon || 'fa-lightbulb'}"></i>
                        </div>
                        <div class="type-info">
                            <h4>${INSIGHT_TYPES[insight.type]?.name || insight.type}</h4>
                            <div class="priority-badge ${insight.priority}">
                                ${insight.priority.toUpperCase()} PRIORITY
                            </div>
                        </div>
                    </div>
                    <div class="detail-confidence">
                        <div class="confidence-score">
                            <i class="fas fa-brain"></i>
                            <span>AI Confidence: ${insight.confidence || 75}%</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-content">
                    <div class="detail-section">
                        <h5><i class="fas fa-align-left"></i> Description</h5>
                        <p>${insight.description}</p>
                    </div>
                    
                    ${insight.metrics ? `
                    <div class="detail-section">
                        <h5><i class="fas fa-chart-bar"></i> Metrics & Analysis</h5>
                        <div class="metrics-detail">
                            ${Object.entries(insight.metrics).map(([key, value]) => `
                                <div class="metric-detail-item">
                                    <div class="metric-detail-label">${formatMetricLabel(key)}</div>
                                    <div class="metric-detail-value">${formatMetricValue(key, value)}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                    
                    ${insight.recommendation ? `
                    <div class="detail-section">
                        <h5><i class="fas fa-robot"></i> AI Recommendation</h5>
                        <div class="recommendation-detail">
                            <p>${insight.recommendation}</p>
                            ${insight.applied ? `
                            <div class="applied-status success">
                                <i class="fas fa-check-circle"></i>
                                <span>This recommendation has been applied</span>
                            </div>
                            ` : `
                            <button class="btn-apply-recommendation" data-insight-id="${insight.id}">
                                <i class="fas fa-check"></i>
                                Apply This Recommendation
                            </button>
                            `}
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="detail-section">
                        <h5><i class="fas fa-info-circle"></i> Additional Information</h5>
                        <div class="additional-info">
                            <div class="info-item">
                                <i class="fas fa-clock"></i>
                                <div>
                                    <div class="info-label">Generated</div>
                                    <div class="info-value">${new Date(insight.timestamp).toLocaleString()}</div>
                                </div>
                            </div>
                            ${insight.source ? `
                            <div class="info-item">
                                <i class="fas fa-database"></i>
                                <div>
                                    <div class="info-label">Data Source</div>
                                    <div class="info-value">${insight.source}</div>
                                </div>
                            </div>
                            ` : ''}
                            ${insight.pattern ? `
                            <div class="info-item">
                                <i class="fas fa-chart-line"></i>
                                <div>
                                    <div class="info-label">Pattern Detected</div>
                                    <div class="info-value">${insight.pattern}</div>
                                </div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Show modal
        modal.style.display = 'flex';
        
        // Setup apply button in modal
        const applyBtn = modalBody.querySelector('.btn-apply-recommendation');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                applyRecommendation(insight.id);
                closeInsightModal();
            });
        }
    };
    
    // Close insight modal
    const closeInsightModal = () => {
        const modal = document.getElementById('insightModal');
        if (modal) {
            modal.style.display = 'none';
        }
    };
    
    // Dismiss insight
    const dismissInsight = (insightId) => {
        const insight = currentInsights.find(i => i.id === insightId);
        if (!insight) return;
        
        // Mark as dismissed
        insight.dismissed = true;
        insight.dismissedAt = new Date().toISOString();
        
        // Update storage
        const insights = StorageService.getInsights();
        const index = insights.findIndex(i => i.id === insightId);
        if (index !== -1) {
            insights[index] = insight;
            localStorage.setItem('smartoffice_ai_insights', JSON.stringify(insights));
        }
        
        // Reload insights
        currentInsights = insights;
        loadInsightsGrid();
        loadRecommendations();
        updateInsightCounts();
        
        // Show notification
        if (window.SmartOfficeApp && typeof window.SmartOfficeApp.showToast === 'function') {
            window.SmartOfficeApp.showToast('Insight dismissed', 'info');
        }
    };
    
    // Apply recommendation
    const applyRecommendation = (insightId, silent = false) => {
        const insight = currentInsights.find(i => i.id === insightId);
        if (!insight) return;
        
        // Mark as applied
        insight.applied = true;
        insight.appliedAt = new Date().toISOString();
        
        // Update storage
        const insights = StorageService.getInsights();
        const index = insights.findIndex(i => i.id === insightId);
        if (index !== -1) {
            insights[index] = insight;
            localStorage.setItem('smartoffice_ai_insights', JSON.stringify(insights));
        }
        
        // Execute recommendation based on type
        executeRecommendationAction(insight);
        
        // Reload insights and recommendations
        currentInsights = insights;
        loadInsightsGrid();
        loadRecommendations();
        updateInsightCounts();
        
        // Show notification if not silent
        if (!silent && window.SmartOfficeApp && typeof window.SmartOfficeApp.showToast === 'function') {
            window.SmartOfficeApp.showToast('Recommendation applied successfully', 'success');
        }
        
        // Log activity
        StorageService.logActivity({
            type: 'ai_recommendation',
            action: `Applied AI recommendation: ${insight.title}`,
            details: {
                insight: insight.title,
                recommendation: insight.recommendation,
                type: insight.type,
                priority: insight.priority
            }
        });
    };
    
    // Execute recommendation action
    const executeRecommendationAction = (insight) => {
        const sensors = StorageService.getSensors();
        
        // Based on insight type, take appropriate action
        switch(insight.type) {
            case 'energy_saving':
                // Turn off non-essential devices
                StorageService.updateDevice('lights', { status: 'off' });
                StorageService.updateDevice('ac', { status: 'off' });
                break;
                
            case 'comfort_improvement':
                if (insight.title.includes('temperature')) {
                    // Adjust AC temperature
                    StorageService.updateDevice('ac', { status: 'on', temperature: 24 });
                } else if (insight.title.includes('air quality')) {
                    // Turn on air purifier
                    StorageService.updateDevice('purifier', { status: 'on', mode: 'auto' });
                }
                break;
                
            case 'efficiency_boost':
                // Implement efficiency measures
                if (insight.title.includes('occupancy')) {
                    // Adjust settings for low occupancy
                    StorageService.updateDevice('lights', { brightness: 70 });
                    StorageService.updateDevice('ac', { temperature: 25 });
                }
                break;
        }
        
        // Create automation rule based on insight if applicable
        if (insight.priority === 'high' && insight.metrics?.frequency === 'recurring') {
            createAutomationRuleFromInsight(insight);
        }
    };
    
    // Create automation rule from insight
    const createAutomationRuleFromInsight = (insight) => {
        const ruleId = `rule_auto_${Date.now()}`;
        
        let condition = {};
        let action = '';
        let actionValue = null;
        
        // Map insight to rule based on type
        if (insight.type === 'energy_saving' && insight.metrics?.current_value) {
            condition = {
                sensor: 'energy',
                operator: '>',
                value: insight.metrics.current_value * 0.9, // 10% below current
                unit: 'kWh'
            };
            action = 'lights.off';
        } else if (insight.type === 'comfort_improvement') {
            if (insight.title.includes('temperature')) {
                condition = {
                    sensor: 'temperature',
                    operator: '>',
                    value: insight.metrics?.optimal_max || 25,
                    unit: '°C'
                };
                action = 'ac.on';
                actionValue = 24;
            }
        }
        
        // Create rule object
        const rule = {
            id: ruleId,
            name: `Auto: ${insight.title.substring(0, 30)}`,
            description: `Automatically created from AI insight: ${insight.description.substring(0, 100)}`,
            type: 'threshold',
            condition: condition,
            action: action,
            actionValue: actionValue,
            priority: 'medium',
            enabled: true,
            sendNotification: true,
            executionCount: 0,
            lastTriggered: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            source: 'ai_insight'
        };
        
        // Add to automation rules
        const rules = JSON.parse(localStorage.getItem('smartoffice_automation_rules') || '[]');
        rules.push(rule);
        localStorage.setItem('smartoffice_automation_rules', JSON.stringify(rules));
        
        // Log creation
        StorageService.logActivity({
            type: 'ai_automation',
            action: `Created automation rule from AI insight: ${insight.title}`,
            details: {
                insight: insight.title,
                rule: rule.name,
                condition: condition,
                action: action
            }
        });
    };
    
    // Postpone recommendation
    const postponeRecommendation = (insightId) => {
        const insight = currentInsights.find(i => i.id === insightId);
        if (!insight) return;
        
        // Mark as postponed (snooze for 24 hours)
        insight.postponed = true;
        insight.postponedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        
        // Update storage
        const insights = StorageService.getInsights();
        const index = insights.findIndex(i => i.id === insightId);
        if (index !== -1) {
            insights[index] = insight;
            localStorage.setItem('smartoffice_ai_insights', JSON.stringify(insights));
        }
        
        // Reload recommendations
        currentInsights = insights;
        loadRecommendations();
        
        // Show notification
        if (window.SmartOfficeApp && typeof window.SmartOfficeApp.showToast === 'function') {
            window.SmartOfficeApp.showToast('Recommendation postponed for 24 hours', 'info');
        }
    };
    
    // Update insight counts
    const updateInsightCounts = () => {
        const criticalCount = currentInsights.filter(i => i.priority === 'critical').length;
        const highCount = currentInsights.filter(i => i.priority === 'high').length;
        const mediumCount = currentInsights.filter(i => i.priority === 'medium').length;
        
        const criticalEl = document.getElementById('criticalCount');
        const highEl = document.getElementById('highCount');
        const mediumEl = document.getElementById('mediumCount');
        
        if (criticalEl) criticalEl.textContent = criticalCount;
        if (highEl) highEl.textContent = highCount;
        if (mediumEl) mediumEl.textContent = mediumCount;
        
        // Update active insights count
        const activeInsightsEl = document.getElementById('activeInsights');
        if (activeInsightsEl) {
            activeInsightsEl.textContent = currentInsights.length;
        }
    };
    
    // Update AI settings
    const updateAISettings = () => {
        const enabled = document.getElementById('aiEnabled').checked;
        const level = document.getElementById('aiLevel').value;
        
        // Save settings to localStorage
        localStorage.setItem('ai_settings', JSON.stringify({
            enabled,
            level,
            updatedAt: new Date().toISOString()
        }));
        
        if (window.SmartOfficeApp && typeof window.SmartOfficeApp.showToast === 'function') {
            window.SmartOfficeApp.showToast('AI settings updated', 'success');
        }
    };
    
    // Update notification settings
    const updateNotificationSettings = () => {
        const enabled = document.getElementById('notificationsEnabled').checked;
        const critical = document.getElementById('notifyCritical').checked;
        const high = document.getElementById('notifyHigh').checked;
        const medium = document.getElementById('notifyMedium').checked;
        
        // Save settings to localStorage
        localStorage.setItem('ai_notification_settings', JSON.stringify({
            enabled,
            critical,
            high,
            medium,
            updatedAt: new Date().toISOString()
        }));
    };
    
    // Update analysis frequency
    const updateAnalysisFrequency = () => {
        const frequency = parseInt(document.getElementById('analysisFrequency').value);
        
        // Update interval
        if (insightsInterval) {
            clearInterval(insightsInterval);
        }
        
        insightsInterval = setInterval(generateInsights, frequency * 60000); // Convert minutes to milliseconds
        
        // Save settings
        localStorage.setItem('ai_analysis_frequency', frequency.toString());
        
        if (window.SmartOfficeApp && typeof window.SmartOfficeApp.showToast === 'function') {
            window.SmartOfficeApp.showToast(`Analysis frequency set to every ${frequency} minutes`, 'success');
        }
    };
    
    // Update data collection
    const updateDataCollection = () => {
        const enabled = document.getElementById('dataCollection').checked;
        const retention = parseInt(document.getElementById('dataRetention').value);
        
        // Save settings
        localStorage.setItem('ai_data_settings', JSON.stringify({
            enabled,
            retention,
            updatedAt: new Date().toISOString()
        }));
        
        if (!enabled) {
            // Clear old insights if data collection disabled
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - retention);
            
            const insights = StorageService.getInsights();
            const filteredInsights = insights.filter(insight => 
                new Date(insight.timestamp) >= cutoffDate
            );
            
            localStorage.setItem('smartoffice_ai_insights', JSON.stringify(filteredInsights));
            currentInsights = filteredInsights;
            loadInsightsGrid();
            updateInsightCounts();
        }
    };
    
    // Start insights generation
    const startInsightsGeneration = () => {
        // Load saved frequency or use default (15 minutes)
        const savedFrequency = localStorage.getItem('ai_analysis_frequency');
        const frequency = savedFrequency ? parseInt(savedFrequency) : 15;
        
        // Set initial analysis frequency
        document.getElementById('analysisFrequency').value = frequency;
        
        // Start interval
        insightsInterval = setInterval(generateInsights, frequency * 60000);
        
        // Generate initial insights
        setTimeout(generateInsights, 2000);
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
        if (insightsInterval) {
            clearInterval(insightsInterval);
            insightsInterval = null;
        }
    };
    
    // Public API
    return {
        load,
        cleanup,
        generateInsights
    };
})();