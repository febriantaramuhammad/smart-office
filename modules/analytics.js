// Analytics & Reports Module - Data Visualization & Insights
const AnalyticsModule = (function() {
    let currentChart = null;
    let currentTimeframe = 'day';
    let chartData = {};
    
    // Chart configuration
    const CHART_CONFIG = {
        colors: {
            temperature: '#FF6B6B',
            humidity: '#4ECDC4',
            occupancy: '#45B7D1',
            energy: '#F9C74F',
            airQuality: '#9D4EDD',
            lights: '#FFD700',
            ac: '#4CC9F0',
            purifier: '#06D6A0'
        },
        timeframes: {
            day: {
                name: 'Daily',
                interval: 'hour',
                dataPoints: 24,
                xAxisFormat: 'HH:mm'
            },
            week: {
                name: 'Weekly',
                interval: 'day',
                dataPoints: 7,
                xAxisFormat: 'ddd'
            },
            month: {
                name: 'Monthly',
                interval: 'day',
                dataPoints: 30,
                xAxisFormat: 'DD/MM'
            },
            quarter: {
                name: 'Quarterly',
                interval: 'month',
                dataPoints: 3,
                xAxisFormat: 'MMM'
            }
        },
        metrics: {
            temperature: {
                name: 'Temperature',
                unit: '°C',
                min: 15,
                max: 35,
                optimalRange: { min: 20, max: 25 }
            },
            humidity: {
                name: 'Humidity',
                unit: '%',
                min: 20,
                max: 80,
                optimalRange: { min: 40, max: 60 }
            },
            occupancy: {
                name: 'Occupancy',
                unit: 'people',
                min: 0,
                max: 50
            },
            energy: {
                name: 'Energy Usage',
                unit: 'kWh',
                min: 0,
                max: 200
            },
            airQuality: {
                name: 'Air Quality',
                unit: 'AQI',
                min: 0,
                max: 300,
                optimalRange: { min: 0, max: 100 }
            }
        }
    };
    
    // Report templates
    const REPORT_TEMPLATES = {
        daily_summary: {
            name: 'Daily Summary Report',
            icon: 'fa-calendar-day',
            description: 'Overview of office performance for the day',
            sections: ['energy_usage', 'occupancy', 'comfort', 'devices']
        },
        energy_analysis: {
            name: 'Energy Analysis Report',
            icon: 'fa-bolt',
            description: 'Detailed energy consumption analysis',
            sections: ['consumption_trends', 'peak_hours', 'device_breakdown', 'savings_opportunities']
        },
        comfort_report: {
            name: 'Comfort & Environment Report',
            icon: 'fa-thermometer-half',
            description: 'Analysis of office environment conditions',
            sections: ['temperature', 'humidity', 'air_quality', 'comfort_index']
        },
        occupancy_analysis: {
            name: 'Occupancy Analysis Report',
            icon: 'fa-users',
            description: 'Office space utilization analysis',
            sections: ['peak_times', 'room_utilization', 'trends', 'optimization']
        },
        device_performance: {
            name: 'Device Performance Report',
            icon: 'fa-plug',
            description: 'IoT device usage and performance analysis',
            sections: ['usage_patterns', 'energy_consumption', 'efficiency', 'maintenance']
        }
    };
    
    // Load Analytics view
    const load = (container) => {
        // Generate chart data
        chartData = generateChartData(currentTimeframe);
        
        container.innerHTML = `
            <section class="content-section active" id="analytics">
                <div class="analytics-header">
                    <h2><i class="fas fa-chart-bar"></i> Analytics & Reports</h2>
                    <p class="subtitle">Advanced data visualization and comprehensive reporting for your smart office</p>
                </div>
                
                <div class="analytics-controls">
                    <div class="control-group">
                        <div class="control-label">
                            <i class="fas fa-calendar"></i>
                            <span>Time Period</span>
                        </div>
                        <div class="timeframe-selector">
                            <button class="timeframe-btn ${currentTimeframe === 'day' ? 'active' : ''}" data-timeframe="day">
                                Day
                            </button>
                            <button class="timeframe-btn ${currentTimeframe === 'week' ? 'active' : ''}" data-timeframe="week">
                                Week
                            </button>
                            <button class="timeframe-btn ${currentTimeframe === 'month' ? 'active' : ''}" data-timeframe="month">
                                Month
                            </button>
                            <button class="timeframe-btn ${currentTimeframe === 'quarter' ? 'active' : ''}" data-timeframe="quarter">
                                Quarter
                            </button>
                        </div>
                    </div>
                    
                    <div class="control-group">
                        <div class="control-label">
                            <i class="fas fa-filter"></i>
                            <span>Metrics</span>
                        </div>
                        <div class="metrics-selector">
                            <div class="metrics-checkboxes">
                                <label class="metric-checkbox active" data-metric="temperature">
                                    <input type="checkbox" checked>
                                    <span class="checkmark" style="background: ${CHART_CONFIG.colors.temperature}"></span>
                                    Temperature
                                </label>
                                <label class="metric-checkbox active" data-metric="energy">
                                    <input type="checkbox" checked>
                                    <span class="checkmark" style="background: ${CHART_CONFIG.colors.energy}"></span>
                                    Energy
                                </label>
                                <label class="metric-checkbox" data-metric="occupancy">
                                    <input type="checkbox">
                                    <span class="checkmark" style="background: ${CHART_CONFIG.colors.occupancy}"></span>
                                    Occupancy
                                </label>
                                <label class="metric-checkbox" data-metric="airQuality">
                                    <input type="checkbox">
                                    <span class="checkmark" style="background: ${CHART_CONFIG.colors.airQuality}"></span>
                                    Air Quality
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="control-group">
                        <button class="btn-refresh-chart" id="refreshChartBtn">
                            <i class="fas fa-sync-alt"></i>
                            Refresh Data
                        </button>
                        <button class="btn-export-chart" id="exportChartBtn">
                            <i class="fas fa-download"></i>
                            Export Chart
                        </button>
                    </div>
                </div>
                
                <div class="analytics-dashboard">
                    <div class="chart-container main-chart">
                        <div class="chart-header">
                            <h3>Office Performance Analytics</h3>
                            <div class="chart-stats">
                                <div class="stat-mini">
                                    <span class="stat-label">Avg. Temperature</span>
                                    <span class="stat-value">${calculateAverage(chartData.temperature).toFixed(1)}°C</span>
                                </div>
                                <div class="stat-mini">
                                    <span class="stat-label">Total Energy</span>
                                    <span class="stat-value">${calculateTotal(chartData.energy).toFixed(1)} kWh</span>
                                </div>
                                <div class="stat-mini">
                                    <span class="stat-label">Peak Occupancy</span>
                                    <span class="stat-value">${Math.max(...chartData.occupancy)} people</span>
                                </div>
                            </div>
                        </div>
                        <div class="chart-wrapper">
                            <canvas id="mainChart" width="800" height="400"></canvas>
                        </div>
                        <div class="chart-legend" id="chartLegend">
                            <!-- Legend will be generated dynamically -->
                        </div>
                    </div>
                    
                    <div class="secondary-charts">
                        <div class="chart-container gauge-chart">
                            <div class="chart-header">
                                <h4><i class="fas fa-thermometer-half"></i> Comfort Index</h4>
                                <span class="gauge-value" id="comfortValue">78%</span>
                            </div>
                            <div class="gauge-wrapper">
                                <canvas id="comfortGauge" width="200" height="150"></canvas>
                            </div>
                            <div class="gauge-labels">
                                <span>Poor</span>
                                <span>Optimal</span>
                                <span>Excellent</span>
                            </div>
                        </div>
                        
                        <div class="chart-container pie-chart">
                            <div class="chart-header">
                                <h4><i class="fas fa-bolt"></i> Energy Distribution</h4>
                            </div>
                            <div class="pie-wrapper">
                                <canvas id="energyPie" width="200" height="200"></canvas>
                            </div>
                            <div class="pie-legend" id="pieLegend">
                                <!-- Pie chart legend -->
                            </div>
                        </div>
                        
                        <div class="chart-container bar-chart">
                            <div class="chart-header">
                                <h4><i class="fas fa-chart-line"></i> Daily Trends</h4>
                                <select id="trendMetric" class="trend-select">
                                    <option value="temperature">Temperature</option>
                                    <option value="energy">Energy</option>
                                    <option value="occupancy">Occupancy</option>
                                </select>
                            </div>
                            <div class="bar-wrapper">
                                <canvas id="trendChart" width="300" height="150"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="key-metrics">
                    <div class="section-header">
                        <h3><i class="fas fa-tachometer-alt"></i> Key Performance Indicators</h3>
                        <div class="kpi-period">
                            <span class="period-label">Period:</span>
                            <span class="period-value">${CHART_CONFIG.timeframes[currentTimeframe].name}</span>
                        </div>
                    </div>
                    
                    <div class="kpi-grid" id="kpiGrid">
                        <!-- KPIs will be loaded dynamically -->
                    </div>
                </div>
                
                <div class="reports-section">
                    <div class="section-header">
                        <h3><i class="fas fa-file-alt"></i> Automated Reports</h3>
                        <button class="btn-generate-report" id="generateReportBtn">
                            <i class="fas fa-plus"></i>
                            Generate Custom Report
                        </button>
                    </div>
                    
                    <div class="reports-grid">
                        ${Object.entries(REPORT_TEMPLATES).map(([id, template]) => `
                            <div class="report-card" data-report="${id}">
                                <div class="report-icon">
                                    <i class="fas ${template.icon}"></i>
                                </div>
                                <div class="report-content">
                                    <h4>${template.name}</h4>
                                    <p class="report-description">${template.description}</p>
                                    <div class="report-meta">
                                        <span class="meta-item">
                                            <i class="fas fa-clock"></i>
                                            Last run: ${getRandomTimeAgo()}
                                        </span>
                                        <span class="meta-item">
                                            <i class="fas fa-file"></i>
                                            ${getRandomPages()} pages
                                        </span>
                                    </div>
                                </div>
                                <div class="report-actions">
                                    <button class="btn-report-action view" data-report="${id}">
                                        <i class="fas fa-eye"></i>
                                        View
                                    </button>
                                    <button class="btn-report-action download" data-report="${id}">
                                        <i class="fas fa-download"></i>
                                        Download
                                    </button>
                                    <button class="btn-report-action schedule" data-report="${id}">
                                        <i class="fas fa-calendar-plus"></i>
                                        Schedule
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="scheduled-reports">
                        <h4><i class="fas fa-clock"></i> Scheduled Reports</h4>
                        <div class="schedules-list" id="schedulesList">
                            <!-- Scheduled reports will be loaded here -->
                        </div>
                    </div>
                </div>
                
                <div class="data-export">
                    <div class="section-header">
                        <h3><i class="fas fa-database"></i> Data Export</h3>
                        <div class="export-info">
                            <span class="data-size">
                                <i class="fas fa-hdd"></i>
                                ${getDataSize()} MB stored
                            </span>
                        </div>
                    </div>
                    
                    <div class="export-options">
                        <div class="export-card">
                            <div class="export-icon">
                                <i class="fas fa-file-csv"></i>
                            </div>
                            <div class="export-content">
                                <h4>CSV Export</h4>
                                <p>Export raw sensor data in CSV format for external analysis</p>
                                <div class="export-period">
                                    <select id="csvPeriod" class="export-select">
                                        <option value="7">Last 7 days</option>
                                        <option value="30" selected>Last 30 days</option>
                                        <option value="90">Last 90 days</option>
                                        <option value="365">Last year</option>
                                    </select>
                                    <button class="btn-export" data-format="csv">
                                        <i class="fas fa-download"></i>
                                        Export CSV
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="export-card">
                            <div class="export-icon">
                                <i class="fas fa-file-pdf"></i>
                            </div>
                            <div class="export-content">
                                <h4>PDF Report</h4>
                                <p>Generate comprehensive PDF report with charts and analysis</p>
                                <div class="export-period">
                                    <select id="pdfPeriod" class="export-select">
                                        <option value="day">Daily Report</option>
                                        <option value="week" selected>Weekly Report</option>
                                        <option value="month">Monthly Report</option>
                                    </select>
                                    <button class="btn-export" data-format="pdf">
                                        <i class="fas fa-file-pdf"></i>
                                        Generate PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="export-card">
                            <div class="export-icon">
                                <i class="fas fa-file-excel"></i>
                            </div>
                            <div class="export-content">
                                <h4>Excel Dashboard</h4>
                                <p>Export interactive Excel dashboard with pivot tables</p>
                                <div class="export-period">
                                    <select id="excelMetrics" class="export-select">
                                        <option value="all">All Metrics</option>
                                        <option value="energy">Energy Only</option>
                                        <option value="comfort">Comfort Only</option>
                                        <option value="devices">Devices Only</option>
                                    </select>
                                    <button class="btn-export" data-format="excel">
                                        <i class="fas fa-file-excel"></i>
                                        Export Excel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Report Viewer Modal -->
                <div class="modal-overlay" id="reportModal" style="display: none">
                    <div class="modal-content report-modal">
                        <div class="modal-header">
                            <h3 id="reportModalTitle">Report Viewer</h3>
                            <div class="modal-actions">
                                <button class="btn-modal-action print" id="printReportBtn">
                                    <i class="fas fa-print"></i>
                                    Print
                                </button>
                                <button class="btn-modal-action download" id="downloadReportBtn">
                                    <i class="fas fa-download"></i>
                                    Download
                                </button>
                                <button class="modal-close" id="closeReportModalBtn">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                        <div class="modal-body" id="reportModalBody">
                            <!-- Report content will be loaded here -->
                        </div>
                    </div>
                </div>
            </section>
        `;
        
        // Initialize charts
        initializeCharts();
        
        // Load KPIs
        loadKPIs();
        
        // Load scheduled reports
        loadScheduledReports();
        
        // Setup event listeners
        setupEventListeners();
    };
    
    // Generate chart data based on timeframe
    const generateChartData = (timeframe) => {
        const config = CHART_CONFIG.timeframes[timeframe];
        const dataPoints = config.dataPoints;
        const now = new Date();
        
        // Generate labels based on timeframe
        const labels = [];
        const data = {
            temperature: [],
            humidity: [],
            occupancy: [],
            energy: [],
            airQuality: [],
            timestamps: []
        };
        
        // Generate realistic data based on timeframe
        for (let i = dataPoints - 1; i >= 0; i--) {
            let timestamp;
            let label;
            
            switch(timeframe) {
                case 'day':
                    // Hourly data for the day
                    const hour = (now.getHours() - i + 24) % 24;
                    timestamp = new Date(now);
                    timestamp.setHours(hour, 0, 0, 0);
                    label = `${hour.toString().padStart(2, '0')}:00`;
                    break;
                    
                case 'week':
                    // Daily data for the week
                    timestamp = new Date(now);
                    timestamp.setDate(timestamp.getDate() - i);
                    label = timestamp.toLocaleDateString('en-US', { weekday: 'short' });
                    break;
                    
                case 'month':
                    // Daily data for the month
                    timestamp = new Date(now);
                    timestamp.setDate(timestamp.getDate() - i);
                    label = timestamp.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                    break;
                    
                case 'quarter':
                    // Monthly data for the quarter
                    timestamp = new Date(now);
                    timestamp.setMonth(timestamp.getMonth() - i);
                    label = timestamp.toLocaleDateString('en-US', { month: 'short' });
                    break;
            }
            
            labels.push(label);
            data.timestamps.push(timestamp);
            
            // Generate realistic sensor data with patterns
            const hour = timestamp.getHours();
            const day = timestamp.getDay();
            const isWeekday = day >= 1 && day <= 5;
            const isOfficeHours = hour >= 8 && hour <= 18;
            
            // Temperature pattern (cooler at night, warmer during day)
            const baseTemp = isOfficeHours ? 24 : 22;
            const tempVariation = Math.sin(i / 10) * 2 + Math.random() * 0.5;
            data.temperature.push(baseTemp + tempVariation);
            
            // Humidity pattern
            const baseHumidity = 45 + Math.sin(i / 8) * 5 + Math.random() * 3;
            data.humidity.push(Math.max(30, Math.min(70, baseHumidity)));
            
            // Occupancy pattern (office hours vs after hours, weekdays vs weekends)
            let occupancy;
            if (!isWeekday) {
                occupancy = Math.floor(Math.random() * 5); // Weekend
            } else if (isOfficeHours) {
                occupancy = Math.floor(Math.random() * 30) + 10; // Office hours
            } else {
                occupancy = Math.floor(Math.random() * 5); // After hours
            }
            data.occupancy.push(occupancy);
            
            // Energy pattern (correlated with occupancy and time)
            const baseEnergy = 50 + (occupancy * 2) + (isOfficeHours ? 20 : 0);
            const energyVariation = Math.random() * 15;
            data.energy.push(Math.max(30, baseEnergy + energyVariation));
            
            // Air quality pattern (worsens with occupancy, improves over night)
            const baseAQI = 80 + (occupancy * 2) - (!isOfficeHours ? 30 : 0);
            const aqiVariation = Math.random() * 20;
            data.airQuality.push(Math.max(50, Math.min(250, baseAQI + aqiVariation)));
        }
        
        return {
            labels,
            datasets: data
        };
    };
    
    // Calculate average of array
    const calculateAverage = (array) => {
        if (!array || array.length === 0) return 0;
        return array.reduce((a, b) => a + b, 0) / array.length;
    };
    
    // Calculate total of array
    const calculateTotal = (array) => {
        if (!array || array.length === 0) return 0;
        return array.reduce((a, b) => a + b, 0);
    };
    
    // Initialize all charts
    const initializeCharts = () => {
        renderMainChart();
        renderComfortGauge();
        renderEnergyPie();
        renderTrendChart();
    };
    
    // Render main chart
    const renderMainChart = () => {
        const canvas = document.getElementById('mainChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Get selected metrics
        const selectedMetrics = getSelectedMetrics();
        
        // Calculate chart dimensions
        const padding = { top: 40, right: 40, bottom: 60, left: 60 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        
        // Find data ranges for selected metrics
        const dataRanges = {};
        selectedMetrics.forEach(metric => {
            const data = chartData.datasets[metric];
            if (data && data.length > 0) {
                dataRanges[metric] = {
                    min: Math.min(...data),
                    max: Math.max(...data)
                };
            }
        });
        
        // Normalize data to fit on same scale (0-100%)
        const normalizedData = {};
        selectedMetrics.forEach(metric => {
            const data = chartData.datasets[metric];
            const range = dataRanges[metric];
            if (data && range) {
                const rangeSize = range.max - range.min;
                normalizedData[metric] = data.map(value => {
                    return rangeSize > 0 ? ((value - range.min) / rangeSize) * 100 : 50;
                });
            }
        });
        
        // Draw grid
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        
        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (chartHeight * (1 - i / 5));
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
            
            // Y-axis labels
            ctx.fillStyle = '#666';
            ctx.font = '10px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(`${i * 20}%`, padding.left - 5, y + 3);
        }
        
        // Draw each metric line
        selectedMetrics.forEach((metric, index) => {
            const data = normalizedData[metric];
            if (!data || data.length === 0) return;
            
            const color = CHART_CONFIG.colors[metric];
            
            // Draw line
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.lineJoin = 'round';
            
            data.forEach((value, dataIndex) => {
                const x = padding.left + (chartWidth * (dataIndex / (data.length - 1)));
                const y = padding.top + chartHeight * (1 - (value / 100));
                
                if (dataIndex === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
            
            // Draw data points
            ctx.fillStyle = color;
            data.forEach((value, dataIndex) => {
                if (dataIndex % Math.ceil(data.length / 10) === 0) { // Draw fewer points
                    const x = padding.left + (chartWidth * (dataIndex / (data.length - 1)));
                    const y = padding.top + chartHeight * (1 - (value / 100));
                    
                    ctx.beginPath();
                    ctx.arc(x, y, 4, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Draw actual value on hover area
                    if (dataIndex === Math.floor(data.length / 2)) { // Show one value in middle
                        ctx.fillStyle = '#333';
                        ctx.font = '11px Arial';
                        ctx.textAlign = 'center';
                        const actualValue = chartData.datasets[metric][dataIndex];
                        const unit = CHART_CONFIG.metrics[metric]?.unit || '';
                        ctx.fillText(`${actualValue.toFixed(1)}${unit}`, x, y - 10);
                        ctx.fillStyle = color;
                    }
                }
            });
        });
        
        // Draw X-axis labels
        chartData.labels.forEach((label, index) => {
            if (index % Math.ceil(chartData.labels.length / 8) === 0) { // Show fewer labels
                const x = padding.left + (chartWidth * (index / (chartData.labels.length - 1)));
                
                ctx.fillStyle = '#666';
                ctx.font = '11px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(label, x, height - padding.bottom + 20);
                
                // Vertical grid line
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
                ctx.moveTo(x, padding.top);
                ctx.lineTo(x, height - padding.bottom);
                ctx.stroke();
            }
        });
        
        // Draw legend
        updateChartLegend(selectedMetrics);
        
        // Draw title
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Office Performance - ${CHART_CONFIG.timeframes[currentTimeframe].name} View`, width / 2, padding.top - 10);
    };
    
    // Get selected metrics from checkboxes
    const getSelectedMetrics = () => {
        const checkboxes = document.querySelectorAll('.metric-checkbox input:checked');
        return Array.from(checkboxes).map(cb => cb.closest('.metric-checkbox').dataset.metric);
    };
    
    // Update chart legend
    const updateChartLegend = (selectedMetrics) => {
        const legendContainer = document.getElementById('chartLegend');
        if (!legendContainer) return;
        
        legendContainer.innerHTML = selectedMetrics.map(metric => `
            <div class="legend-item">
                <span class="legend-color" style="background: ${CHART_CONFIG.colors[metric]}"></span>
                <span class="legend-label">${CHART_CONFIG.metrics[metric]?.name || metric}</span>
                <span class="legend-value">
                    Avg: ${calculateAverage(chartData.datasets[metric]).toFixed(1)}${CHART_CONFIG.metrics[metric]?.unit || ''}
                </span>
            </div>
        `).join('');
    };
    
    // Render comfort gauge chart
    const renderComfortGauge = () => {
        const canvas = document.getElementById('comfortGauge');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Calculate comfort index based on sensor data
        const comfortIndex = calculateComfortIndex();
        
        // Update comfort value display
        const comfortValueEl = document.getElementById('comfortValue');
        if (comfortValueEl) {
            comfortValueEl.textContent = `${comfortIndex}%`;
        }
        
        // Draw gauge background
        const centerX = width / 2;
        const centerY = height;
        const radius = Math.min(width, height * 1.5) * 0.4;
        const startAngle = Math.PI;
        const endAngle = 2 * Math.PI;
        
        // Draw gauge arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 20;
        ctx.stroke();
        
        // Draw value arc
        const valueAngle = startAngle + (comfortIndex / 100) * Math.PI;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, valueAngle);
        
        // Color based on value
        let color;
        if (comfortIndex < 50) {
            color = '#F44336'; // Red
        } else if (comfortIndex < 75) {
            color = '#FF9800'; // Orange
        } else {
            color = '#4CAF50'; // Green
        }
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 20;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        // Draw needle
        const needleLength = radius * 0.8;
        const needleAngle = startAngle + (comfortIndex / 100) * Math.PI;
        const needleX = centerX + Math.cos(needleAngle) * needleLength;
        const needleY = centerY + Math.sin(needleAngle) * needleLength;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(needleX, needleY);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        // Draw center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#333';
        ctx.fill();
    };
    
    // Calculate comfort index
    const calculateComfortIndex = () => {
        const tempData = chartData.datasets.temperature;
        const humidityData = chartData.datasets.humidity;
        const aqiData = chartData.datasets.airQuality;
        
        if (!tempData || !humidityData || !aqiData) return 75;
        
        // Calculate comfort scores for each metric
        const tempScore = calculateTemperatureComfort(tempData);
        const humidityScore = calculateHumidityComfort(humidityData);
        const airQualityScore = calculateAirQualityComfort(aqiData);
        
        // Weighted average
        return Math.round((tempScore * 0.4 + humidityScore * 0.3 + airQualityScore * 0.3));
    };
    
    // Calculate temperature comfort score
    const calculateTemperatureComfort = (temperatures) => {
        const avgTemp = calculateAverage(temperatures);
        const optimal = CHART_CONFIG.metrics.temperature.optimalRange;
        
        if (avgTemp >= optimal.min && avgTemp <= optimal.max) {
            return 100; // Perfect
        } else if (avgTemp >= optimal.min - 2 && avgTemp <= optimal.max + 2) {
            return 80; // Good
        } else if (avgTemp >= optimal.min - 5 && avgTemp <= optimal.max + 5) {
            return 60; // Acceptable
        } else {
            return 40; // Poor
        }
    };
    
    // Calculate humidity comfort score
    const calculateHumidityComfort = (humidities) => {
        const avgHumidity = calculateAverage(humidities);
        const optimal = CHART_CONFIG.metrics.humidity.optimalRange;
        
        if (avgHumidity >= optimal.min && avgHumidity <= optimal.max) {
            return 100;
        } else if (avgHumidity >= optimal.min - 10 && avgHumidity <= optimal.max + 10) {
            return 70;
        } else {
            return 40;
        }
    };
    
    // Calculate air quality comfort score
    const calculateAirQualityComfort = (aqiData) => {
        const avgAQI = calculateAverage(aqiData);
        const optimal = CHART_CONFIG.metrics.airQuality.optimalRange;
        
        if (avgAQI <= optimal.max) {
            return 100;
        } else if (avgAQI <= 150) {
            return 70;
        } else if (avgAQI <= 200) {
            return 40;
        } else {
            return 20;
        }
    };
    
    // Render energy pie chart
    const renderEnergyPie = () => {
        const canvas = document.getElementById('energyPie');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Generate energy distribution data
        const energyData = {
            'Lighting': 25,
            'HVAC': 40,
            'Computers': 20,
            'Other': 15
        };
        
        const colors = {
            'Lighting': '#FFD700',
            'HVAC': '#4CC9F0',
            'Computers': '#7209B7',
            'Other': '#F8961E'
        };
        
        // Calculate total
        const total = Object.values(energyData).reduce((a, b) => a + b, 0);
        
        // Draw pie chart
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * 0.4;
        
        let startAngle = 0;
        
        Object.entries(energyData).forEach(([category, value]) => {
            const sliceAngle = (value / total) * 2 * Math.PI;
            const color = colors[category];
            
            // Draw slice
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            
            // Draw outline
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw label
            const midAngle = startAngle + sliceAngle / 2;
            const labelRadius = radius * 0.7;
            const labelX = centerX + Math.cos(midAngle) * labelRadius;
            const labelY = centerY + Math.sin(midAngle) * labelRadius;
            
            ctx.fillStyle = 'white';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${Math.round((value / total) * 100)}%`, labelX, labelY);
            
            startAngle += sliceAngle;
        });
        
        // Draw center hole
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        
        // Add total in center
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${total}%`, centerX, centerY);
        
        // Update legend
        updatePieLegend(energyData, colors);
    };
    
    // Update pie chart legend
    const updatePieLegend = (energyData, colors) => {
        const legendContainer = document.getElementById('pieLegend');
        if (!legendContainer) return;
        
        legendContainer.innerHTML = Object.entries(energyData).map(([category, value]) => `
            <div class="pie-legend-item">
                <span class="pie-color" style="background: ${colors[category]}"></span>
                <span class="pie-label">${category}</span>
                <span class="pie-value">${value}%</span>
            </div>
        `).join('');
    };