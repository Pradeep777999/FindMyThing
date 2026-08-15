/* ==========================================
   ANVESHANA (FindMyThing) NAVIGATION SCRIPT
   ========================================== */

(function () {
  // Elements
  let navbarEl = null;
  let drawerTrigger = null;
  let mobileDrawer = null;
  let drawerOverlay = null;
  let drawerClose = null;
  let translateElement = null;

  // Session State
  let currentUser = null; // { name, role }

  // Initializing Navbar
  function initNavbar() {
    // Find existing navbar container
    navbarEl = document.getElementById('mainNavbar') || document.querySelector('.navbar');
    if (!navbarEl) {
      console.warn("FindMyThing Redesign: Navbar container not found. Expected <nav class='navbar' id='mainNavbar'>.");
      return;
    }

    // Standardize ID
    navbarEl.id = 'mainNavbar';
    navbarEl.className = 'navbar';

    // Build Desktop & Mobile Header inside the container
    navbarEl.innerHTML = `
      <!-- Hamburger Button (Mobile Only) -->
      <button class="hamburger-btn" id="drawerTrigger" aria-label="Open navigation menu" aria-expanded="false" aria-controls="mobileDrawer">
        ☰
      </button>

      <!-- LEFT SIDE (MITS LOGO + BRAND) -->
      <div class="nav-brand">
        <a href="/">
          <img src="/images/findback.png" class="mits-logo" alt="MITS Logo">
          <div class="nav-brand-text-container">
            <div class="nav-brand-text">FindMyThing</div>
            <div class="nav-brand-sub">MITS Portal</div>
          </div>
        </a>
      </div>

      <!-- CENTER BANNER -->
      <div class="nav-center">
        <img src="/images/findnav.png" alt="MITS Banner" class="mits-banner-img">
      </div>

      <!-- RIGHT SIDE LINKS (Desktop Only) -->
      <div class="nav-links" id="desktopNavLinks">
        <span id="welcomeUser"></span>
        <div id="desktopNavLinksContainer" style="display: inline-flex; align-items: center; gap: 8px;">
          <!-- Links injected here -->
        </div>
        <div id="google_translate_element_desktop_target"></div>
      </div>
    `;

    // Ensure side drawer and overlay elements exist in the DOM
    ensureDrawerDOM();

    // Setup elements
    drawerTrigger = document.getElementById('drawerTrigger');
    mobileDrawer = document.getElementById('mobileDrawer');
    drawerOverlay = document.getElementById('drawerOverlay');
    drawerClose = document.getElementById('drawerClose');

    // Get or Create Google Translate element
    translateElement = document.getElementById('google_translate_element');
    if (!translateElement) {
      translateElement = document.createElement('div');
      translateElement.id = 'google_translate_element';
      document.body.appendChild(translateElement);
    }

    // Set active link and fetch session to populate items
    fetchSessionAndUpdate();

    // Hook drawer events
    setupDrawerEvents();

    // Setup Google Translate responsive position
    repositionTranslateWidget();
    window.addEventListener('resize', repositionTranslateWidget);

    // Apply initial dark theme setting
    if (localStorage.getItem('dark-mode') === 'enabled') {
      document.body.classList.add('dark-theme');
    }
  }

  // Ensure drawer elements are appended to body
  function ensureDrawerDOM() {
    if (!document.getElementById('mobileDrawer')) {
      const drawerHTML = `
        <div id="mobileDrawer" role="dialog" aria-modal="true" aria-label="Navigation Menu" tabindex="-1">
          <!-- Redesigned Header -->
          <div class="m-drawer-header">
            <button class="drawer-close-btn" id="drawerClose" aria-label="Close menu">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="white"/>
              </svg>
            </button>
            <img src="/images/findback.png" class="m-header-logo" alt="MITS Logo">
            <h2 class="m-header-title">FindMyThing</h2>
            <p class="m-header-subtitle">Campus Lost & Found Portal</p>
          </div>
          
          <div class="drawer-body">
            <!-- Profile Section -->
            <div id="m-drawer-profile" class="m-profile-section"></div>
            
            <!-- Menu Items Container (White/Glass Card) -->
            <div class="m-menu-card">
              <div id="drawerNavLinksContainer" style="display: flex; flex-direction: column;">
                <!-- Links injected here -->
              </div>
            </div>
            
            <!-- Bottom Section -->
            <div class="m-drawer-bottom">
              <div class="m-bottom-info">
                <span class="m-version">FindMyThing v1.0</span>
                <img src="/images/findback.png" class="m-bottom-logo" alt="MITS Logo">
              </div>
              <div class="m-bottom-links">
                <a href="#">Privacy Policy</a>
                <span class="m-dot">•</span>
                <a href="#">Terms</a>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', drawerHTML);
    }

    if (!document.getElementById('drawerOverlay')) {
      const overlayHTML = `<div id="drawerOverlay"></div>`;
      document.body.insertAdjacentHTML('beforeend', overlayHTML);
    }
  }

  // Fetch session data and update links in Desktop and Mobile
  function fetchSessionAndUpdate() {
    fetch("/api/user")
      .then(res => res.json())
      .then(data => {
        if (data.name) {
          currentUser = data;
        } else {
          currentUser = null;
        }
        renderLinks();
      })
      .catch(err => {
        console.error("Error checking user session:", err);
        currentUser = null;
        renderLinks();
      });
  }

  // Render navigation links dynamically
  function renderLinks() {
    const currentPath = window.location.pathname;
    
    // Check if active page
    const isHome = currentPath === '/' || currentPath === '/index.html' || currentPath.endsWith('/');
    const isItems = currentPath.includes('/items.html');
    const isMyItems = currentPath.includes('/my-items.html');
    const isCollected = currentPath.includes('/collected.html');
    const isReportLost = currentPath.includes('/report-lost.html');
    const isReportFound = currentPath.includes('/report-found.html');
    const isManager = currentPath.includes('/manager.html');
    const isAdmin = currentPath.includes('/admin.html');
    const isAnalytics = currentPath.includes('/analytics.html');

    // Define Link Lists
    // Page links available for navigation
    const pages = [
      { name: 'Home', href: '/', active: isHome, icon: '🏠' },
      { name: 'All Items', href: '/items.html', active: isItems, icon: '📋' },
      { name: 'Collected', href: '/collected.html', active: isCollected, icon: '📦' }
    ];

    if (currentUser) {
      pages.push({ name: 'My Items', href: '/my-items.html', active: isMyItems, icon: '👤' });
      pages.push({ name: 'Report Lost', href: '/report-lost.html', active: isReportLost, icon: '😞' });
      pages.push({ name: 'Report Found', href: '/report-found.html', active: isReportFound, icon: '😀' });
    }

    // Role-based links
    const privilegedLinks = [];
    if (currentUser) {
      if (currentUser.role === 'admin' || currentUser.role === 'manager') {
        privilegedLinks.push({ name: 'Manager Panel', href: '/manager.html', active: isManager, icon: '👨‍💼' });
        privilegedLinks.push({ name: 'Analytics', href: '/analytics.html', active: isAnalytics, icon: '📊' });
      }
      if (currentUser.role === 'admin') {
        privilegedLinks.push({ name: 'Admin Panel', href: '/admin.html', active: isAdmin, icon: '⚙️' });
      }
    }

    // --- RENDER DESKTOP ---
    const desktopContainer = document.getElementById('desktopNavLinksContainer');
    const welcomeUserEl = document.getElementById('welcomeUser');
    desktopContainer.innerHTML = '';

    if (currentUser) {
      // Show welcome text
      welcomeUserEl.innerText = `🧑‍💻 ${currentUser.name}`;
      welcomeUserEl.style.display = 'inline';

      // Always show page links on desktop
      pages.forEach(p => {
        const a = document.createElement('a');
        a.href = p.href;
        a.innerText = p.name;
        if (p.active) a.className = 'active';
        desktopContainer.appendChild(a);
      });

      // Show Privileged Panels
      privilegedLinks.forEach(p => {
        const a = document.createElement('a');
        a.href = p.href;
        a.innerText = p.name;
        a.className = p.active ? 'btn-primary active' : 'btn-primary';
        desktopContainer.appendChild(a);
      });

      // Logout button
      const logoutBtn = document.createElement('a');
      logoutBtn.href = '/logout';
      logoutBtn.innerText = 'Logout';
      desktopContainer.appendChild(logoutBtn);

    } else {
      // Guest Links
      welcomeUserEl.style.display = 'none';

      // General public pages
      pages.forEach(p => {
        const a = document.createElement('a');
        a.href = p.href;
        a.innerText = p.name;
        if (p.active) a.className = 'active';
        desktopContainer.appendChild(a);
      });

      const loginBtn = document.createElement('a');
      loginBtn.href = '/login.html';
      loginBtn.innerText = 'Login';
      desktopContainer.appendChild(loginBtn);

      const registerBtn = document.createElement('a');
      registerBtn.href = '/register.html';
      registerBtn.innerText = 'Register';
      registerBtn.className = 'btn-primary';
      desktopContainer.appendChild(registerBtn);
    }

    // Render Role Badge next to Logo if on my-items page and logged in
    const existingBadge = document.querySelector('.nav-role-badge');
    if (existingBadge) existingBadge.remove();
    
    if (currentUser && (isMyItems || isAdmin || isManager)) {
      const brandContainer = document.querySelector('#mainNavbar .nav-brand');
      if (brandContainer) {
        const badge = document.createElement('div');
        badge.className = 'nav-role-badge';
        const roleText = currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'manager' ? 'Manager' : 'Student/Staff';
        badge.innerHTML = `<span class="rbadge-dot"></span>${roleText}`;
        brandContainer.appendChild(badge);
      }
    }

    // --- RENDER MOBILE DRAWER ---
    const drawerContainer = document.getElementById('drawerNavLinksContainer');
    const profileEl = document.getElementById('m-drawer-profile');
    drawerContainer.innerHTML = '';

    if (currentUser) {
      const initials = currentUser.name
        ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : 'U';
      let email = 'student@mits.ac.in';
      if (currentUser.name) {
        let nameParts = currentUser.name.toLowerCase().split(' ');
        let username = nameParts.filter(p => p.length > 0).join('.');
        email = `${username}@mits.ac.in`;
      }
      profileEl.innerHTML = `
        <div class="m-profile-avatar user">
          <span class="m-avatar-initials">${initials}</span>
          <span class="m-online-indicator"></span>
        </div>
        <div class="m-profile-info">
          <div class="m-profile-welcome">Welcome</div>
          <div class="m-profile-name">${currentUser.name}</div>
          <div class="m-profile-email">${email}</div>
        </div>
      `;

      // Render standard pages links
      pages.forEach(p => {
        const a = document.createElement('a');
        a.href = p.href;
        a.className = p.active ? 'drawer-link active' : 'drawer-link';
        a.innerHTML = `<span class="icon">${p.icon}</span> ${p.name}`;
        drawerContainer.appendChild(a);
      });

      // Render privileged links
      privilegedLinks.forEach(p => {
        const a = document.createElement('a');
        a.href = p.href;
        a.className = p.active ? 'drawer-link active' : 'drawer-link';
        a.innerHTML = `<span class="icon">${p.icon}</span> ${p.name}`;
        drawerContainer.appendChild(a);
      });
    } else {
      profileEl.innerHTML = `
        <div class="m-profile-avatar guest">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#cbd5e1"/>
          </svg>
        </div>
        <div class="m-profile-info">
          <div class="m-profile-welcome">Welcome</div>
          <div class="m-profile-name">Guest User</div>
        </div>
        <div class="m-profile-actions">
          <a href="/login.html" class="m-profile-btn login">Login</a>
          <a href="/register.html" class="m-profile-btn register">Register</a>
        </div>
      `;

      // Render standard public pages
      pages.forEach(p => {
        const a = document.createElement('a');
        a.href = p.href;
        a.className = p.active ? 'drawer-link active' : 'drawer-link';
        a.innerHTML = `<span class="icon">${p.icon}</span> ${p.name}`;
        drawerContainer.appendChild(a);
      });

      // Render Login & Register links in list
      const aLogin = document.createElement('a');
      aLogin.href = '/login.html';
      aLogin.className = currentPath.includes('/login.html') ? 'drawer-link active' : 'drawer-link';
      aLogin.innerHTML = `<span class="icon">🔐</span> Login`;
      drawerContainer.appendChild(aLogin);

      const aRegister = document.createElement('a');
      aRegister.href = '/register.html';
      aRegister.className = currentPath.includes('/register.html') ? 'drawer-link active' : 'drawer-link';
      aRegister.innerHTML = `<span class="icon">📝</span> Register`;
      drawerContainer.appendChild(aRegister);
    }

    // Google Translate / Language link inside drawer links
    const aLang = document.createElement('div');
    aLang.className = 'drawer-link m-lang-item';
    aLang.innerHTML = `
      <span style="display:flex; align-items:center; gap:14px;">
        <span class="icon">🌐</span> Language
      </span>
      <div id="google_translate_element_mobile_target" class="m-translate-target"></div>
    `;
    drawerContainer.appendChild(aLang);

    // Help link
    const aHelp = document.createElement('a');
    aHelp.href = '/#notice';
    aHelp.className = 'drawer-link';
    aHelp.innerHTML = `<span class="icon">❓</span> Help`;
    drawerContainer.appendChild(aHelp);

    // Contact link
    const aContact = document.createElement('a');
    aContact.href = 'tel:9160482396';
    aContact.className = 'drawer-link';
    aContact.innerHTML = `<span class="icon">📞</span> Contact`;
    drawerContainer.appendChild(aContact);

    // Dark Mode link
    const aDarkMode = document.createElement('a');
    aDarkMode.href = '#';
    aDarkMode.className = 'drawer-link m-dark-toggle';
    aDarkMode.id = 'drawerDarkMode';
    aDarkMode.innerHTML = `
      <span style="display:flex; align-items:center; gap:14px;">
        <span class="icon">🌙</span> Dark Mode
      </span>
      <span class="m-toggle-switch"><span class="m-toggle-knob"></span></span>
    `;
    drawerContainer.appendChild(aDarkMode);

    // Dark mode listener hook
    aDarkMode.addEventListener('click', function(e) {
      e.preventDefault();
      const body = document.body;
      const isDark = body.classList.toggle('dark-theme');
      localStorage.setItem('dark-mode', isDark ? 'enabled' : 'disabled');
      updateDarkModeToggleUI();
    });

    updateDarkModeToggleUI();

    // Render Logout at the very bottom of the card if logged in
    if (currentUser) {
      const aLogout = document.createElement('a');
      aLogout.href = '/logout';
      aLogout.className = 'drawer-link';
      aLogout.innerHTML = `<span class="icon">🚪</span> Logout`;
      drawerContainer.appendChild(aLogout);
    }
  }

  // Dark Mode Switch UI Helper
  function updateDarkModeToggleUI() {
    const switchEl = document.querySelector('#drawerDarkMode .m-toggle-switch');
    if (switchEl) {
      if (document.body.classList.contains('dark-theme')) {
        switchEl.classList.add('active');
      } else {
        switchEl.classList.remove('active');
      }
    }
  }

  // Setup Drawer actions and gestures
  function setupDrawerEvents() {
    function openDrawer() {
      mobileDrawer.classList.add('active');
      drawerOverlay.classList.add('active');
      document.body.classList.add('drawer-open');
      drawerTrigger.setAttribute('aria-expanded', 'true');
      mobileDrawer.focus();
    }

    function closeDrawer() {
      mobileDrawer.classList.remove('active');
      drawerOverlay.classList.remove('active');
      document.body.classList.remove('drawer-open');
      drawerTrigger.setAttribute('aria-expanded', 'false');
    }

    // Event listeners
    drawerTrigger.addEventListener('click', openDrawer);
    drawerClose.addEventListener('click', closeDrawer);
    drawerOverlay.addEventListener('click', closeDrawer);

    // ESC key closes drawer
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('active')) {
        closeDrawer();
      }
    });

    // Touch Swipe to Close Drawer (swipe right)
    let touchStartX = 0;
    mobileDrawer.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    mobileDrawer.addEventListener('touchend', function (e) {
      const touchEndX = e.changedTouches[0].screenX;
      // If swiped right by more than 50px
      if (touchEndX - touchStartX > 50) {
        closeDrawer();
      }
    }, { passive: true });

    // Focus Trap inside Drawer
    mobileDrawer.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      
      const focusables = mobileDrawer.querySelectorAll('button, a, select, [tabindex="0"]');
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) { // Shift + Tab
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else { // Tab
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    });
  }

  // Reposition Google Translate Widget depending on viewport
  function repositionTranslateWidget() {
    if (!translateElement) return;

    if (window.innerWidth < 992) {
      const mobileTarget = document.getElementById('google_translate_element_mobile_target');
      if (mobileTarget && translateElement.parentElement !== mobileTarget) {
        mobileTarget.appendChild(translateElement);
      }
    } else {
      const desktopTarget = document.getElementById('google_translate_element_desktop_target');
      if (desktopTarget && translateElement.parentElement !== desktopTarget) {
        desktopTarget.appendChild(translateElement);
      }
    }
  }

  // Self initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
  } else {
    initNavbar();
  }
})();
