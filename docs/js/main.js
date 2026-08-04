// ===== theme toggle (shared by 58 pages, skips index.html which has its own) =====
(function(){
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  // index.html handles its own toggle (includes bgVideo + p5 ribbon sync) — skip to avoid double listener
  if (document.getElementById('bgVideo')) return;
  const moon = document.getElementById('moonIcon');
  const sun = document.getElementById('sunIcon');
  const apply = (light) => {
    if (light) {
      document.documentElement.setAttribute('data-theme', 'light');
      if (moon) moon.style.display = 'block';
      if (sun) sun.style.display = 'none';
    } else {
      /* Dark = explicit data-theme="dark" (NOT removing the attribute) so embedded
         ds-* web components pick up the design-system dark tokens. The docs chrome
         is unaffected: globals.css keys light on [data-theme="light"] and dark on
         :root, so data-theme="dark" still resolves the dark chrome. */
      document.documentElement.setAttribute('data-theme', 'dark');
      if (moon) moon.style.display = 'none';
      if (sun) sun.style.display = 'block';
    }
  };
  apply(document.documentElement.getAttribute('data-theme') === 'light');
  btn.addEventListener('click', () => {
    const newLight = document.documentElement.getAttribute('data-theme') !== 'light';
    localStorage.setItem('theme', newLight ? 'light' : 'dark');
    apply(newLight);
  });
})();

// ===== nav-scroll (shared by 88 pages) =====
(function(){
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const toggle = () => {
    if (window.scrollY > 10) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  toggle();
  window.addEventListener('scroll', toggle, { passive: true });
})();

// ===== move theme toggle out of .nav-links into .nav directly (so mobile cluster always shows it) =====
(function(){
  const nav = document.querySelector('.nav');
  const toggle = document.getElementById('themeToggle');
  if (nav && toggle && toggle.parentElement && toggle.parentElement.classList.contains('nav-links')) {
    nav.appendChild(toggle);
  }
})();

// ===== mobile-drawer (shared by 87 pages) =====
(function(){
  const nav = document.querySelector('.nav');
  if (!nav) return;
  // Pages with their own .mobile-drawer (e.g. index) wire the hamburger inline.
  if (document.querySelector('.mobile-drawer')) return;

  let hamburger = nav.querySelector('.nav-hamburger');
  if (!hamburger) {
    hamburger = document.createElement('button');
    hamburger.className = 'nav-hamburger';
    hamburger.type = 'button';
    hamburger.setAttribute('aria-label', 'Open sidebar');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>';
    nav.insertBefore(hamburger, nav.firstChild);
  }

  let backdrop = document.querySelector('.sidebar-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    nav.parentNode.insertBefore(backdrop, nav.nextSibling);
  }

  let sidebar = document.querySelector('.sidebar');
  if (!sidebar) {
    sidebar = document.createElement('aside');
    sidebar.className = 'sidebar mobile-nav-drawer';
    sidebar.setAttribute('aria-label', 'Mobile navigation');
    document.body.appendChild(sidebar);
  }

  const navLinks = document.querySelector('.nav-links');

  // Foundation sub-nav fallback (used when the page doesn't already have a foundation-nav in its sidebar)
  const FOUNDATION_FALLBACK = [
    ['foundation-tokens.html', 'Tokens'],
    ['foundation-accessibility.html', 'Accessibility'],
    ['foundation-content.html', 'Content'],
    ['foundation-spacing.html', 'Spacing'],
    ['foundation-grid.html', 'Grid'],
    ['foundation-color.html', 'Color'],
    ['foundation-typography.html', 'Typography'],
    ['foundation-iconography.html', 'Iconography'],
    ['foundation-illustrations.html', 'Illustrations'],
    ['foundation-elevation.html', 'Elevation'],
    ['foundation-border.html', 'Border'],
    ['foundation-radius.html', 'Radius']
  ];

  // Component sub-nav fallback
  const COMPONENT_FALLBACK = [
    ['Accordion.html', 'Accordion'], ['Avatar.html', 'Avatar'], ['Badges.html', 'Badges'],
    ['Breadcrumbs.html', 'Breadcrumbs'], ['Button.html', 'Button'], ['Calendar.html', 'Calendar'],
    ['Checkbox.html', 'Checkbox'], ['Counter.html', 'Counter'], ['Data-table.html', 'Data table'],
    ['Date-picker.html', 'Date picker'], ['Divider.html', 'Divider'], ['Dropdown.html', 'Dropdown'],
    ['Empty-state.html', 'Empty state'], ['Header-navigation.html', 'Header navigation'],
    ['Icon.html', 'Icon'], ['Inline-message.html', 'Inline message'],
    ['Left-sidebar-navigation-level-1.html', 'Sidebar Nav L1'],
    ['Left-sidebar-navigation-level-2.html', 'Sidebar Nav L2'],
    ['Link.html', 'Link'], ['List.html', 'List'], ['OTP-input.html', 'OTP input'], ['Overlay.html', 'Overlay'], ['Page-header.html', 'Page header'],
    ['Progress-bar.html', 'Progress bar'], ['Radio-button.html', 'Radio button'],
    ['Rich-text-editor.html', 'Rich text editor'], ['Right-pane.html', 'Right pane'],
    ['Script-editor.html', 'Script editor'], ['Slider.html', 'Slider'],
    ['Snackbar.html', 'Toast Message'], ['Split-button.html', 'Split button'],
    ['Status-indicator.html', 'Status indicator'], ['Switch.html', 'Toggle'], ['Tag.html', 'Tag'],
    ['Text-area.html', 'Text area'], ['Text-field.html', 'Text field'], ['Tooltip.html', 'Tooltip']
  ];

  // Build a mobile-only nav section at the top of the sidebar by cloning the nav links
  if (navLinks && !sidebar.querySelector('.sidebar-mobile-nav')) {
    const mobileNav = document.createElement('div');
    mobileNav.className = 'sidebar-mobile-nav';
    const heading = document.createElement('h4');
    heading.textContent = 'Navigate';
    mobileNav.appendChild(heading);
    const ul = document.createElement('ul');
    const currentPath = (location.pathname.split('/').pop() || '').toLowerCase();
    const isFoundationPage = currentPath === 'foundation.html' || currentPath.startsWith('foundation-');
    const COMPONENT_HREFS = new Set(COMPONENT_FALLBACK.map(([h]) => h.toLowerCase()));
    const isComponentPage = currentPath === 'components.html' || COMPONENT_HREFS.has(currentPath);

    // Build a dropdown <li> for either Foundation or Components
    const buildDropdown = (label, kind) => {
      const li = document.createElement('li');
      li.className = 'sidebar-mobile-nav-group';

      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'sidebar-mobile-nav-trigger';
      trigger.setAttribute('aria-expanded', 'false');
      trigger.innerHTML = '<span>' + label + '</span>' +
        '<svg class="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';

      const panel = document.createElement('div');
      panel.className = 'sidebar-mobile-nav-panel';

      const pageSidebar = document.querySelector('.sidebar:not(.mobile-nav-drawer)');

      // Clone the page's sidebar-search if present
      let searchInputEl = null;
      const search = pageSidebar && pageSidebar.querySelector('#sidebar-search, .sidebar-search');
      if (search) {
        const searchClone = search.cloneNode(true);
        searchClone.removeAttribute('id');
        // Strip name/id from the input so it doesn't collide with the desktop one
        const inp = searchClone.querySelector('input');
        if (inp) {
          inp.removeAttribute('id');
          inp.removeAttribute('name');
          inp.value = '';
          searchInputEl = inp;
        }
        // Hide the ⌘K shortcut chip — useless on touch devices and inside the dropdown
        const shortcut = searchClone.querySelector('.search-shortcut');
        if (shortcut) shortcut.remove();
        panel.appendChild(searchClone);
      }

      // Clone the matching existing nav (foundation-nav or sidebar-nav), or build from fallback
      let listEl;
      if (kind === 'foundation') {
        const fnav = pageSidebar && pageSidebar.querySelector('ul.foundation-nav');
        if (fnav) {
          listEl = fnav.cloneNode(true);
        } else {
          listEl = document.createElement('ul');
          listEl.className = 'foundation-nav';
          FOUNDATION_FALLBACK.forEach(([href, label]) => {
            const sli = document.createElement('li');
            const sa = document.createElement('a');
            sa.href = href; sa.textContent = label; sa.className = 'foundation-link';
            if (href.toLowerCase() === currentPath) sa.classList.add('active');
            sli.appendChild(sa); listEl.appendChild(sli);
          });
        }
      } else {
        const cnav = pageSidebar && pageSidebar.querySelector('ul.sidebar-nav');
        if (cnav) {
          listEl = cnav.cloneNode(true);
        } else {
          listEl = document.createElement('ul');
          listEl.className = 'sidebar-nav';
          COMPONENT_FALLBACK.forEach(([href, label]) => {
            const sli = document.createElement('li');
            const sa = document.createElement('a');
            sa.href = href; sa.textContent = label; sa.className = 'sidebar-link';
            if (href.toLowerCase() === currentPath) sa.classList.add('active');
            sli.appendChild(sa); listEl.appendChild(sli);
          });
        }
      }
      panel.appendChild(listEl);

      // Wire up the cloned search input to filter the cloned nav list
      if (searchInputEl && listEl) {
        const filter = () => {
          const q = (searchInputEl.value || '').toLowerCase().trim();
          listEl.querySelectorAll(':scope > li').forEach((liEl) => {
            const link = liEl.querySelector('a, .foundation-link, .sidebar-link');
            if (!link) { liEl.style.display = q ? 'none' : ''; return; }
            const text = (link.textContent || '').toLowerCase();
            liEl.style.display = (!q || text.indexOf(q) !== -1) ? '' : 'none';
          });
        };
        searchInputEl.addEventListener('input', filter);
        searchInputEl.addEventListener('keydown', (e) => { if (e.key === 'Escape') { searchInputEl.value = ''; filter(); }});
      }

      // Auto-expand if on a matching page
      if ((kind === 'foundation' && isFoundationPage) || (kind === 'components' && isComponentPage)) {
        trigger.setAttribute('aria-expanded', 'true');
        panel.classList.add('open');
        trigger.classList.add('active');
      }

      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const expanded = trigger.getAttribute('aria-expanded') === 'true';

        // Close all other dropdown groups in the same mobile-nav and clear their active state
        const parentNav = trigger.closest('.sidebar-mobile-nav');
        if (parentNav) {
          parentNav.querySelectorAll('.sidebar-mobile-nav-trigger').forEach((t) => {
            if (t !== trigger) {
              t.setAttribute('aria-expanded', 'false');
              t.classList.remove('active');
            }
          });
          parentNav.querySelectorAll('.sidebar-mobile-nav-panel').forEach((p) => {
            if (p !== panel) p.classList.remove('open');
          });
        }

        trigger.setAttribute('aria-expanded', String(!expanded));
        panel.classList.toggle('open', !expanded);
        // The clicked trigger becomes the only active one
        if (!expanded) trigger.classList.add('active');
        else trigger.classList.remove('active');
      });

      li.appendChild(trigger);
      li.appendChild(panel);
      return li;
    };

    const addItem = (a) => {
      const clone = a.cloneNode(true);
      clone.querySelectorAll('svg').forEach(svg => svg.remove());
      const href = (clone.getAttribute('href') || '').toLowerCase();
      const label = (clone.textContent || '').trim();

      if (href === 'foundation.html') {
        ul.appendChild(buildDropdown(label || 'Foundation', 'foundation'));
      } else if (href === 'components.html') {
        ul.appendChild(buildDropdown(label || 'Components', 'components'));
      } else {
        const li = document.createElement('li');
        li.appendChild(clone);
        ul.appendChild(li);
      }
    };
    navLinks.querySelectorAll(':scope > a').forEach(addItem);
    navLinks.querySelectorAll(':scope > .nav-dropdown > .nav-dropdown-menu > a').forEach(addItem);
    mobileNav.appendChild(ul);
    sidebar.insertBefore(mobileNav, sidebar.firstChild);
  }

  const open = () => {
    sidebar.classList.add('open');
    backdrop.classList.add('open');
    document.body.classList.add('sidebar-locked');
    hamburger.setAttribute('aria-expanded', 'true');
  };
  const close = () => {
    sidebar.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.classList.remove('sidebar-locked');
    hamburger.setAttribute('aria-expanded', 'false');
  };

  if (!sidebar.querySelector('.sidebar-close')) {
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'sidebar-close';
    closeBtn.setAttribute('aria-label', 'Close navigation');
    closeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    closeBtn.addEventListener('click', close);
    sidebar.insertBefore(closeBtn, sidebar.firstChild);
  }

  hamburger.addEventListener('click', () => sidebar.classList.contains('open') ? close() : open());
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sidebar.classList.contains('open')) close(); });
  sidebar.addEventListener('click', (e) => { if (e.target.closest('a')) close(); });
})();

// ===== mobile breadcrumb above .page-title (component + foundation pages) =====
(function(){
  const title = document.querySelector('.page-title');
  if (!title) return;
  if (title.previousElementSibling && title.previousElementSibling.classList.contains('mobile-breadcrumb')) return;

  const path = (location.pathname.split('/').pop() || '').toLowerCase();
  const isFoundationHub = path === 'foundation.html';
  const isFoundationSub = path.startsWith('foundation-');
  const isComponentsHub = path === 'components.html';
  const isComponentSub = /^(accordion|avatar|badges|breadcrumbs|button|calendar|checkbox|counter|data-table|date-picker|divider|dropdown|empty-state|header-navigation|icon|inline-message|left-sidebar-navigation-level-1|left-sidebar-navigation-level-2|link|otp-input|page-header|progress-bar|radio-button|rich-text-editor|right-pane|script-editor|slider|snackbar|split-button|status-indicator|switch|tag|text-area|text-field|tooltip)\.html$/.test(path);

  if (!isFoundationHub && !isFoundationSub && !isComponentsHub && !isComponentSub) return;

  const pageLabel = (title.textContent || '').trim();

  // Hub pages → "Home › <Hub>"   |   sub pages → "<Hub> › <Page>"
  let parentLabel, parentHref;
  if (isFoundationHub || isComponentsHub) {
    parentLabel = 'Home';
    parentHref  = 'index.html';
  } else if (isFoundationSub) {
    parentLabel = 'Foundation';
    parentHref  = 'Foundation.html';
  } else {
    parentLabel = 'Components';
    parentHref  = 'Components.html';
  }

  const crumb = document.createElement('nav');
  crumb.className = 'mobile-breadcrumb';
  crumb.setAttribute('aria-label', 'Breadcrumb');
  crumb.innerHTML =
    '<a href="' + parentHref + '" class="mobile-breadcrumb-link">' + parentLabel + '</a>' +
    '<svg class="mobile-breadcrumb-sep" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>' +
    '<span class="mobile-breadcrumb-current" aria-current="page">' + pageLabel + '</span>';

  title.parentNode.insertBefore(crumb, title);
})();