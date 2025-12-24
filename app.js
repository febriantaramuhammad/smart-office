// Main Application Entry Point
const SmartOfficeApp = (function() {
    let currentView = 'dashboard';
    let sensorUnsubscribe = null;
    
    // Initialize application
    const init = () => {
        console.log('Smart Office AI Dashboard Initializing...');
        
        // Check if we're on login page
        if (window.location.pathname.includes('login.html') || 
            window.location.pathname.endsWith('login.html')) {
            // Just initialize auth module
            if (typeof AuthModule !== 'undefined') {
                AuthModule.init();
            }
            return;
        }
        
        // Check if we're on landing page
        if (window.location.pathname.includes('index.html') || 
            window.location.pathname === '/' ||
            window.location.pathname.endsWith('/')) {
            // Nothing special needed for landing page
            return;
        }
        
        // For dashboard page, check authentication
        if (!StorageService.isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }
        
        // Initialize dashboard
        initDashboard();
    };
    
    // Initialize dashboard
    const initDashboard = () => {
        // Load components
        loadSidebar();
        loadHeader();
        
        // Load initial view
        loadView(currentView);
        
        // Start sensor simulation
        if (typeof SensorSimulator !== 'undefined') {
            SensorSimulator.start(3000);
            
            // Subscribe to sensor updates
            sensorUnsubscribe = SensorSimulator.subscribe(onSensorUpdate);
        }
        
        // Update notification badge
        updateNotificationBadge();
        
        // Setup global event listeners
        setupGlobalListeners();
        
        console.log('Dashboard initialized');
    };
    
    // Load sidebar
    const loadSidebar = () => {
        const sidebarContainer = document.getElementById('sidebar-container');
        if (!sidebarContainer) return;
        
        const user = StorageService.getUser();
        const unreadCount = StorageService.getUnreadNotifications().length;
        
        sidebarContainer.innerHTML = `
            <aside class="sidebar">
                <div class="sidebar-header">
                    <i class="fas fa-brain"></i>
                    <h2>Smart Office</h2>
                    <button class="sidebar-toggle" id="sidebarToggle">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                </div>
                
                <nav class="sidebar-nav">
                    <a href="#dashboard" class="nav-item active" data-view="dashboard">
                        <i class="fas fa-home"></i>
                        <span>Dashboard</span>
                    </a>
                    <a href="#monitoring" class="nav-item" data-view="monitoring">
                        <i class="fas fa-desktop"></i>
                        <span>IoT Monitoring</span>
                    </a>
                    <a href="#control" class="nav-item" data-view="control">
                        <i class="fas fa-sliders-h"></i>
                        <span>Device Control</span>
                    </a>
                    <a href="#automation" class="nav-item" data-view="automation">
                        <i class="fas fa-robot"></i>
                        <span>Automation</span>
                    </a>
                    <a href="#insights" class="nav-item" data-view="insights">
                        <i class="fas fa-lightbulb"></i>
                        <span>AI Insights</span>
                    </a>
                    <a href="#analytics" class="nav-item" data-view="analytics">
                        <i class="fas fa-chart-bar"></i>
                        <span>Analytics</span>
                    </a>
                    <a href="#notifications" class="nav-item" data-view="notifications">
                        <i class="fas fa-bell"></i>
                        <span>Notifications</span>
                        ${unreadCount > 0 ? `<span class="badge">${unreadCount}</span>` : ''}
                    </a>
                    <a href="#activity" class="nav-item" data-view="activity">
                        <i class="fas fa-history"></i>
                        <span>Activity Log</span>
                    </a>
                    <a href="#settings" class="nav-item" data-view="settings">
                        <i class="fas fa-cog"></i>
                        <span>Settings</span>
                    </a>
                </nav>
                
                <div class="sidebar-footer">
                    <div class="system-status">
                        <div class="status-indicator active"></div>
                        <span>System Online</span>
                    </div>
                    ${user ? `
                    <div class="user-info-mini">
                        <div class="avatar-mini">${user.name.charAt(0)}</div>
                        <span>${user.name.split(' ')[0]}</span>
                    </div>
                    ` : ''}
                </div>
            </aside>
        `;
        
        // Setup sidebar toggle
        const toggleBtn = document.getElementById('sidebarToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggleSidebar);
        }
        
        // Setup navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.getAttribute('data-view');
                
                // Update active state
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // Load view
                loadView(view);
                
                // Update URL hash
                window.location.hash = view;
            });
        });
    };
    
    // Load header
    const loadHeader = () => {
        const headerContainer = document.getElementById('header-container');
        if (!headerContainer) return;
        
        const user = StorageService.getUser();
        const sensors = StorageService.getSensors();
        
        headerContainer.innerHTML = `
            <header class="header">
                <div class="header-left">
                    <h1 id="pageTitle">Dashboard Overview</h1>
                </div>
                
                <div class="header-right">
                    <div class="quick-stats">
                        <div class="stat">
                            <i class="fas fa-users"></i>
                            <span id="currentOccupancy">${sensors?.occupancy || 0}</span>
                        </div>
                        <div class="stat">
                            <i class="fas fa-bolt"></i>
                            <span id="currentEnergy">${sensors?.energy || 0} kWh</span>
                        </div>
                        <div class="stat">
                            <i class="fas fa-thermometer-half"></i>
                            <span id="currentTemp">${sensors?.temperature?.toFixed(1) || 0}°C</span>
                        </div>
                    </div>
                    
                    <div class="user-profile">
                        <div class="avatar">
                            ${user?.name?.charAt(0) || 'U'}
                        </div>
                        <div class="user-info">
                            <span class="user-name">${user?.name || 'User'}</span>
                            <span class="user-role">${user?.role?.toUpperCase() || 'STAFF'}</span>
                        </div>
                        <button class="btn-logout" id="logoutBtn" title="Logout">
                            <i class="fas fa-sign-out-alt"></i>
                        </button>
                    </div>
                </div>
            </header>
        `;
        
        // Setup logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (sensorUnsubscribe) {
                    sensorUnsubscribe();
                }
                if (typeof SensorSimulator !== 'undefined') {
                    SensorSimulator.stop();
                }
                if (typeof AuthModule !== 'undefined') {
                    AuthModule.logout();
                }
            });
        }
    };
    
    // Load view
    const loadView = (view) => {
        currentView = view;
        
        // Update page title
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            const titles = {
                dashboard: 'Dashboard Overview',
                monitoring: 'IoT Monitoring',
                control: 'Device Control',
                automation: 'Automation Rules',
                insights: 'AI Insights',
                analytics: 'Analytics & Reports',
                notifications: 'Notifications',
                activity: 'Activity Log',
                settings: 'Settings'
            };
            pageTitle.textContent = titles[view] || 'Dashboard';
        }
        
        // Load view content
        const contentContainer = document.getElementById('content-container');
        if (!contentContainer) return;
        
        // Clear current content
        const currentSection = contentContainer.querySelector('.content-section');
        if (currentSection) {
            currentSection.classList.remove('active');
            setTimeout(() => {
                contentContainer.innerHTML = '';
                loadViewContent(view, contentContainer);
            }, 300);
        } else {
            loadViewContent(view, contentContainer);
        }
    };
    
    // Load view content
    const loadViewContent = (view, container) => {
        switch(view) {
            case 'dashboard':
                if (typeof DashboardModule !== 'undefined') {
                    DashboardModule.load(container);
                } else {
                    container.innerHTML = '<p>Dashboard module not loaded</p>';
                }
                break;
            case 'monitoring':
                if (typeof IoTMonitoringModule !== 'undefined') {
                    IoTMonitoringModule.load(container);
                } else {
                    container.innerHTML = '<p>Monitoring module not loaded</p>';
                }
                break;
            case 'control':
                if (typeof DeviceControlModule !== 'undefined') {
                    DeviceControlModule.load(container);
                } else {
                    container.innerHTML = '<p>Device control module not loaded</p>';
                }
                break;
            case 'automation':
                if (typeof AutomationModule !== 'undefined') {
                    AutomationModule.load(container);
                } else {
                    container.innerHTML = '<p>Automation module not loaded</p>';
                }
                break;
            case 'insights':
                if (typeof AIInsightsModule !== 'undefined') {
                    AIInsightsModule.load(container);
                } else {
                    container.innerHTML = '<p>AI insights module not loaded</p>';
                }
                break;
            case 'analytics':
                if (typeof AnalyticsModule !== 'undefined') {
                    AnalyticsModule.load(container);
                } else {
                    container.innerHTML = '<p>Analytics module not loaded</p>';
                }
                break;
            case 'notifications':
                if (typeof NotificationsModule !== 'undefined') {
                    NotificationsModule.load(container);
                } else {
                    container.innerHTML = '<p>Notifications module not loaded</p>';
                }
                break;
            case 'activity':
                if (typeof ActivityLogModule !== 'undefined') {
                    ActivityLogModule.load(container);
                } else {
                    container.innerHTML = '<p>Activity log module not loaded</p>';
                }
                break;
            case 'settings':
                if (typeof SettingsModule !== 'undefined') {
                    SettingsModule.load(container);
                } else {
                    container.innerHTML = '<p>Settings module not loaded</p>';
                }
                break;
            default:
                container.innerHTML = `<p>View "${view}" not found</p>`;
        }
    };
    
    // Toggle sidebar
    const toggleSidebar = () => {
        const sidebar = document.querySelector('.sidebar');
        const toggleIcon = document.querySelector('#sidebarToggle i');
        
        if (sidebar.classList.contains('collapsed')) {
            sidebar.classList.remove('collapsed');
            toggleIcon.classList.remove('fa-chevron-right');
            toggleIcon.classList.add('fa-chevron-left');
        } else {
            sidebar.classList.add('collapsed');
            toggleIcon.classList.remove('fa-chevron-left');
            toggleIcon.classList.add('fa-chevron-right');
        }
    };
    
    // Handle sensor updates
    const onSensorUpdate = (sensors) => {
        // Update header stats
        const occupancyEl = document.getElementById('currentOccupancy');
        const energyEl = document.getElementById('currentEnergy');
        const tempEl = document.getElementById('currentTemp');
        
        if (occupancyEl && sensors.occupancy !== undefined) {
            occupancyEl.textContent = sensors.occupancy;
        }
        if (energyEl && sensors.energy !== undefined) {
            energyEl.textContent = `${sensors.energy.toFixed(1)} kWh`;
        }
        if (tempEl && sensors.temperature !== undefined) {
            tempEl.textContent = `${sensors.temperature.toFixed(1)}°C`;
        }
        
        // Update current view if needed
        if (currentView === 'dashboard' && typeof DashboardModule !== 'undefined') {
            DashboardModule.onSensorUpdate(sensors);
        } else if (currentView === 'monitoring' && typeof IoTMonitoringModule !== 'undefined') {
            IoTMonitoringModule.onSensorUpdate(sensors);
        }
    };
    
    // Update notification badge
    const updateNotificationBadge = () => {
        const badge = document.querySelector('#notificationBadge');
        if (badge) {
            const unreadCount = StorageService.getUnreadNotifications().length;
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
    };
    
    // Show toast notification
    const showToast = (message, type = 'info', title = '') => {
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `notification ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <div class="notification-content">
                ${title ? `<div class="notification-title">${title}</div>` : ''}
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => {
                if (toast.parentNode === container) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 5000);
        
        // Close button
        toast.querySelector('.notification-close').addEventListener('click', () => {
            toast.classList.add('fade-out');
            setTimeout(() => {
                if (toast.parentNode === container) {
                    container.removeChild(toast);
                }
            }, 300);
        });
        
        // Update notification badge
        updateNotificationBadge();
    };
    
    // Get notification icon based on type
    const getNotificationIcon = (type) => {
        switch(type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            case 'info': return 'info-circle';
            default: return 'info-circle';
        }
    };
    
    // Setup global listeners
    const setupGlobalListeners = () => {
        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.view) {
                loadView(e.state.view);
            }
        });
        
        // Handle hash changes
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.substring(1);
            if (hash) {
                loadView(hash);
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl + S to save
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                showToast('Settings saved', 'success');
            }
            
            // Esc to close modals/notifications
            if (e.key === 'Escape') {
                const notifications = document.querySelectorAll('.notification');
                notifications.forEach(notification => {
                    notification.remove();
                });
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            // Adjust layout if needed
            const sidebar = document.querySelector('.sidebar');
            if (window.innerWidth < 1024 && !sidebar.classList.contains('collapsed')) {
                sidebar.classList.add('collapsed');
            }
        });
    };
    
    // Public API
    return {
        init,
        loadView,
        showToast,
        updateNotificationBadge,
        getCurrentView: () => currentView
    };
})();

// Start application when DOM is loaded
document.addEventListener('DOMContentLoaded', SmartOfficeApp.init);

// Make app globally available
window.SmartOfficeApp = SmartOfficeApp;