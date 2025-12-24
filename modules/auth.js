// Authentication Module
const AuthModule = (function() {
    // Demo users database
    const DEMO_USERS = {
        'admin': {
            username: 'admin',
            password: 'pass123',
            role: 'admin',
            name: 'System Administrator',
            email: 'admin@smartoffice.local'
        },
        'staff': {
            username: 'staff',
            password: 'pass123',
            role: 'staff',
            name: 'John Staff',
            email: 'staff@smartoffice.local'
        },
        'manager': {
            username: 'manager',
            password: 'pass123',
            role: 'manager',
            name: 'Sarah Manager',
            email: 'manager@smartoffice.local'
        }
    };
    
    // Initialize auth on page load
    const init = () => {
        if (document.getElementById('loginForm')) {
            setupLoginForm();
        }
        
        // Check if we're on dashboard page
        if (window.location.pathname.includes('dashboard.html') || 
            window.location.pathname.endsWith('dashboard.html')) {
            protectDashboard();
        }
    };
    
    // Setup login form
    const setupLoginForm = () => {
        const form = document.getElementById('loginForm');
        if (!form) return;
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;
            
            const result = authenticate(username, password, role);
            
            if (result.success) {
                // Store user in localStorage using StorageService
                if (typeof StorageService !== 'undefined') {
                    StorageService.setUser(result.user);
                } else {
                    // Fallback to direct localStorage
                    localStorage.setItem('smartoffice_user', JSON.stringify({
                        ...result.user,
                        loginTime: new Date().toISOString(),
                        sessionId: 'session_' + Math.random().toString(36).substr(2, 9)
                    }));
                }
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                showLoginError(result.message);
            }
        });
    };
    
    // Authentication logic
    const authenticate = (username, password, role) => {
        const user = DEMO_USERS[username];
        
        if (!user) {
            return {
                success: false,
                message: 'Invalid username or password'
            };
        }
        
        if (user.password !== password) {
            return {
                success: false,
                message: 'Invalid username or password'
            };
        }
        
        if (user.role !== role) {
            return {
                success: false,
                message: 'Selected role does not match user role'
            };
        }
        
        return {
            success: true,
            user: {
                username: user.username,
                role: user.role,
                name: user.name,
                email: user.email
            }
        };
    };
    
    // Show login error
    const showLoginError = (message) => {
        let errorDiv = document.querySelector('.login-error');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'login-error';
            const form = document.getElementById('loginForm');
            if (form) {
                form.insertBefore(errorDiv, form.firstChild);
            }
        }
        
        errorDiv.textContent = message;
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv && errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    };
    
    // Protect dashboard route
    const protectDashboard = () => {
        // Check if StorageService is available
        let isAuthenticated = false;
        let user = null;
        
        if (typeof StorageService !== 'undefined') {
            isAuthenticated = StorageService.isAuthenticated();
            user = StorageService.getUser();
        } else {
            // Fallback to direct localStorage
            const userData = localStorage.getItem('smartoffice_user');
            isAuthenticated = !!userData;
            user = userData ? JSON.parse(userData) : null;
        }
        
        if (!isAuthenticated || !user) {
            window.location.href = 'login.html';
            return false;
        }
        
        // Update UI with user info if elements exist
        updateUserUI(user);
        
        // Setup logout if button exists
        setupLogout();
        
        return true;
    };
    
    // Update UI with user info
    const updateUserUI = (user) => {
        if (!user) return;
        
        // Update avatar in header
        const avatar = document.querySelector('.avatar');
        if (avatar && user.name) {
            avatar.textContent = user.name.charAt(0).toUpperCase();
        }
        
        // Update username display
        const usernameDisplay = document.querySelector('.user-name');
        if (usernameDisplay) {
            usernameDisplay.textContent = user.name;
        }
        
        // Update role badge
        const roleBadge = document.querySelector('.user-role');
        if (roleBadge) {
            roleBadge.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
            
            // Color code by role
            switch(user.role) {
                case 'admin':
                    roleBadge.style.backgroundColor = '#f72585';
                    break;
                case 'manager':
                    roleBadge.style.backgroundColor = '#f8961e';
                    break;
                case 'staff':
                    roleBadge.style.backgroundColor = '#4cc9f0';
                    break;
            }
        }
    };
    
    // Setup logout functionality
    const setupLogout = () => {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (typeof StorageService !== 'undefined') {
                    StorageService.clearUser();
                } else {
                    localStorage.removeItem('smartoffice_user');
                }
                
                window.location.href = 'login.html';
            });
        }
    };
    
    // Get current user
    const getCurrentUser = () => {
        if (typeof StorageService !== 'undefined') {
            return StorageService.getUser();
        } else {
            const userData = localStorage.getItem('smartoffice_user');
            return userData ? JSON.parse(userData) : null;
        }
    };
    
    // Check if user has role
    const hasRole = (role) => {
        const user = getCurrentUser();
        return user && user.role === role;
    };
    
    // Check if user is admin
    const isAdmin = () => {
        return hasRole('admin');
    };
    
    // Logout
    const logout = () => {
        if (typeof StorageService !== 'undefined') {
            StorageService.clearUser();
        } else {
            localStorage.removeItem('smartoffice_user');
        }
        window.location.href = 'login.html';
    };
    
    // Initialize on load
    document.addEventListener('DOMContentLoaded', init);
    
    // Public API
    return {
        getCurrentUser,
        hasRole,
        isAdmin,
        logout,
        init,
        protectDashboard
    };
})();