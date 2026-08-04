// ===== toc (shared by 16 pages) =====
let _tocObserver = null;
    function updateTOC(targetId) {
      const tocList = document.querySelector('.toc-nav'); if (!tocList) return; tocList.innerHTML = '';
      const activePanel = document.getElementById(targetId); if (!activePanel) return;
      activePanel.querySelectorAll('h2[id], h3[id]').forEach(h => {
        if (h.style.display === 'none') return;
        const li = document.createElement('li'), a = document.createElement('a');
        a.href = '#' + h.id; a.className = 'toc-link';
        let text = Array.from(h.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
        if (!text) text = h.innerText; a.textContent = text;
        a.addEventListener('click', e => { e.preventDefault(); document.getElementById(h.id).scrollIntoView({behavior:'smooth',block:'start'}); });
        li.appendChild(a); tocList.appendChild(li);
      });
      initScrollSpy();
    }
    function initScrollSpy() {
      if (_tocObserver) _tocObserver.disconnect();
      const tocLinks = document.querySelectorAll('.toc-link');
      const sections = Array.from(tocLinks).map(l => document.getElementById(l.getAttribute('href').slice(1))).filter(Boolean);
      if (!sections.length) return;
      _tocObserver = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) { const id = e.target.getAttribute('id'); tocLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#'+id)); } }); }, {rootMargin:'-80px 0px -60% 0px',threshold:0});
      sections.forEach(s => _tocObserver.observe(s));
    }
    document.querySelectorAll('.tab-item').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active')); tab.classList.add('active');
        const tabMap = {'Overview':'tab-overview','Usage':'tab-usage','Style':'tab-style','Code':'tab-code','Accessibility':'tab-accessibility'};
        document.querySelectorAll('.tab-content').forEach(p => p.style.display = 'none');
        const target = tabMap[tab.textContent.trim()];
        if (target) { document.getElementById(target).style.display = 'block'; updateTOC(target); }
        window.scrollTo({top:0,behavior:'smooth'});
      });
    });
    updateTOC('tab-overview');
    // Sidebar search filter — wire EVERY .sidebar-search input, not just the
    // first. main.js prepends a cloned search for the mobile drawer, so the
    // first match is a hidden clone; the visible desktop input must be wired too.
    (function(){
      var searchInputs = document.querySelectorAll('.sidebar-search input');
      if (!searchInputs.length) return;
      var items = document.querySelectorAll('.sidebar-nav li');
      function applyFilter(q){
        q = (q || '').toLowerCase().trim();
        items.forEach(function(li){
          var link = li.querySelector('a');
          if (!link) return;
          li.style.display = (!q || link.textContent.toLowerCase().indexOf(q) !== -1) ? '' : 'none';
        });
      }
      searchInputs.forEach(function(inp){
        inp.addEventListener('input', function(){ applyFilter(this.value); });
      });
      // Cmd+K / Ctrl+K shortcut to focus the visible search
      document.addEventListener('keydown', function(e){
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          var visible = Array.prototype.find.call(searchInputs, function(i){ return i.offsetParent !== null; }) || searchInputs[0];
          visible.focus(); visible.select();
        }
      });
    })();

    // Scroll sidebar to active link on page load
    (function(){
      var active = document.querySelector('.sidebar-link.active');
      if (active) {
        var sidebar = active.closest('.sidebar');
        if (sidebar) {
          var top = active.offsetTop - sidebar.offsetTop - (sidebar.clientHeight / 3);
          sidebar.scrollTop = Math.max(0, top);
        }
      }
    })();

