/* Lady Patriots Tip-Off Club — shared behavior:
   mobile drawer, cinematic scroll package, schedule renderer. */
(function () {
  'use strict';
  // ?motion=1 / #motion / localStorage 'lp-motion'='1' force the cinematic
  // effects on for previewing/demos even when the OS requests reduced motion;
  // real visitors get the accessible default.
  var forceMotion = /[?&]motion=1/.test(location.search) ||
    /motion/.test(location.hash) ||
    (function () { try { return localStorage.getItem('lp-motion') === '1'; } catch (e) { return false; } })();
  var reduced = !forceMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (forceMotion) document.documentElement.classList.add('force-motion');

  /* ── Mobile drawer ── */
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');
  var scrim = document.getElementById('scrim');
  var close = document.getElementById('drawerClose');
  if (burger && drawer) {
    var setOpen = function (open) {
      drawer.classList.toggle('open', open);
      if (scrim) scrim.classList.toggle('on', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    burger.addEventListener('click', function () { setOpen(!drawer.classList.contains('open')); });
    if (close) close.addEventListener('click', function () { setOpen(false); });
    if (scrim) scrim.addEventListener('click', function () { setOpen(false); });
    drawer.addEventListener('click', function (e) { if (e.target.tagName === 'A') setOpen(false); });
  }

  /* ── Cinematic scroll: reveal observer ── */
  var fxEls = Array.prototype.slice.call(document.querySelectorAll('.fx, .fx-img, .fx-mask'));
  if (!('IntersectionObserver' in window) || reduced) {
    fxEls.forEach(function (el) { el.classList.add('in'); });
  } else if (fxEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    fxEls.forEach(function (el) { io.observe(el); });
  }

  /* ── Cinematic scroll: parallax drift on [data-parallax] media ──
     The media translates a fraction of its scroll progress, giving the
     slow "camera drift" feel. Scroll-linked (user-driven), rAF-throttled. */
  var par = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  if (par.length && !reduced) {
    var ticking = false;
    var update = function () {
      ticking = false;
      var vh = window.innerHeight;
      par.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -80 || r.top > vh + 80) return;
        var speed = parseFloat(el.dataset.parallax) || 0.12;
        var progress = (r.top + r.height / 2 - vh / 2) / vh;  // -1..1 around center
        el.style.transform = 'translateY(' + (-progress * speed * 100).toFixed(2) + 'px) scale(' + (1 + speed * 0.35) + ')';
      });
    };
    var onScroll = function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  /* ── Schedule renderer (pages with #schedList) ── */
  var list = document.getElementById('schedList');
  if (list) {
    var games = [
      ['NOV 4',  'North Cobb', 'Scrimmage', '6:00 PM', 'home'],
      ['NOV 7',  'Battle @ Stephenson', '', '', 'away'],
      ['NOV 10', 'Central Gwinnett', '', '', 'away'],
      ['NOV 13', 'Miller Grove', '', '', 'home'],
      ['NOV 14', 'Seckinger', '', '2:30 PM', 'away'],
      ['NOV 17', 'Monroe Area', '', '', 'home'],
      ['NOV 20', 'Meadowcreek', '', '5:30 PM', 'away'],
      ['NOV 24', 'North Springs', '', '2:00 PM', 'away'],
      ['NOV 30', 'Mountain View', '', '4:30 PM', 'home'],
      ['DEC 1',  'Providence Christian', '', '', 'away'],
      ['DEC 5',  'Alpharetta', '', '2:30 PM', 'away'],
      ['DEC 8',  'Parkview', '', '5:30 PM', 'away'],
      ['DEC 11', 'Peachtree Ridge', '', '5:30 PM', 'away'],
      ['DEC 12', 'Johnson / Flowery Branch', '', '2:00 PM', 'home'],
      ['DEC 15', 'Duluth', '', '5:30 PM', 'home'],
      ['DEC 18', 'Seckinger', '', '4:00 PM', 'home'],
      ['JAN 5',  'Norcross', '', '5:30 PM', 'away'],
      ['JAN 8',  'Brookwood', '', '5:30 PM', 'home'],
      ['JAN 12', 'North Gwinnett', '', '5:30 PM', 'home'],
      ['JAN 15', 'Arabia Mountain', '', '6:00 PM', 'away'],
      ['JAN 19', 'Parkview', '', '5:30 PM', 'home'],
      ['JAN 22', 'Peachtree Ridge', '', '5:30 PM', 'home'],
      ['JAN 26', 'Duluth', '', '5:30 PM', 'away'],
      ['JAN 29', 'Norcross', '', '5:30 PM', 'home'],
      ['FEB 2',  'Brookwood', '', '5:30 PM', 'away'],
      ['FEB 5',  'North Gwinnett', '', '5:30 PM', 'away']
    ];
    list.innerHTML = games.map(function (g) {
      var opp = (g[4] === 'away' && g[1].indexOf('@') === -1 ? '@ ' : '') + g[1];
      var note = g[2] ? ' <i>(' + g[2] + ')</i>' : '';
      return '<div class="game ' + g[4] + '">' +
        '<span class="gd">' + g[0] + '</span>' +
        '<span class="go">' + opp + note + '</span>' +
        '<span class="gt">' + g[3] + '</span>' +
        '<span class="gv">' + (g[4] === 'home' ? 'Home' : 'Away') + '</span>' +
        '</div>';
    }).join('');
    var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        chips.forEach(function (x) { x.classList.toggle('active', x === c); });
        var mode = c.dataset.filter;
        Array.prototype.slice.call(list.children).forEach(function (row) {
          row.classList.toggle('hidden', mode !== 'all' && !row.classList.contains(mode));
        });
      });
    });
  }
})();
