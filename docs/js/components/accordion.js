// ===== accordion (shared by 30 pages) =====
function toggleAccordion(button) {
      const item = button.parentElement;
      const isOpen = item.classList.contains('open');
      
      document.querySelectorAll('.accordion-item').forEach(acc => {
        acc.classList.remove('open');
      });

      if (!isOpen) {
        item.classList.add('open');
      }
    }
    const themeToggle = document.getElementById('themeToggle');
    const moonIcon = document.getElementById('moonIcon');
    const sunIcon = document.getElementById('sunIcon');
    const currentTheme = localStorage.getItem('theme') || 'light';

    if (currentTheme === 'dark') {
      document.documentElement.removeAttribute('data-theme');
      moonIcon.style.display = 'block';
      sunIcon.style.display = 'none';
    }

    themeToggle.addEventListener('click', () => {
      let theme = document.documentElement.getAttribute('data-theme');
      if (theme === 'light') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
        moonIcon.style.display = 'block';
        sunIcon.style.display = 'none';
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'block';
      }
    });

    // ── Scroll-spy: track TOC active link on scroll ──
    (function() {
      const tocLinks = document.querySelectorAll('.toc-link');
      const sectionIds = Array.from(tocLinks).map(link => link.getAttribute('href').slice(1));
      const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

      if (sections.length === 0) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            tocLinks.forEach(link => {
              link.classList.toggle('active', link.getAttribute('href') === '#' + id);
            });
          }
        });
      }, {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0
      });

      sections.forEach(section => observer.observe(section));
    })();

    // Sidebar search filter
    (function(){
      var searchInput = document.querySelector('.sidebar-search input');
      if (!searchInput) return;
      var items = document.querySelectorAll('.sidebar-nav li');
      searchInput.addEventListener('input', function(){
        var q = this.value.toLowerCase().trim();
        items.forEach(function(li){
          var link = li.querySelector('a');
          if (!link) return;
          var text = link.textContent.toLowerCase();
          li.style.display = (!q || text.indexOf(q) !== -1) ? '' : 'none';
        });
      });
      // Cmd+K / Ctrl+K shortcut to focus search
      document.addEventListener('keydown', function(e){
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          searchInput.focus();
          searchInput.select();
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

