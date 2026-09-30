(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Footer year ---- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---- Theme toggle (persists choice; otherwise follows the OS) ---- */
  var themeBtn = document.querySelector('.theme-toggle');
  function currentTheme() {
    var set = root.getAttribute('data-theme');
    if (set) return set;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
    });
  }

  /* ---- Mobile navigation ---- */
  var navToggle = document.querySelector('.nav-toggle');
  var navList = document.getElementById('nav-list');
  function closeNav() {
    if (!navToggle) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navList.classList.remove('open');
  }
  if (navToggle && navList) {
    navToggle.addEventListener('click', function () {
      var open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!open));
      navList.classList.toggle('open', !open);
    });
    navList.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeNav(); navToggle.focus(); }
    });
  }

  /* ---- Highlight current section in the nav ---- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-list a'));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          var active = a.getAttribute('href') === '#' + entry.target.id;
          a.classList.toggle('is-active', active);
          if (active) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---- Project card reveal ---- */
  var reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (i % 2) * 80 + 'ms';
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Hero request-flow sequence ---- */
  var steps = Array.prototype.slice.call(document.querySelectorAll('.trace-steps li'));
  var replay = document.querySelector('.trace-replay');
  var timers = [];

  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function play() {
    clearTimers();
    steps.forEach(function (li) { li.classList.remove('on'); });
    if (reduceMotion) {
      steps.forEach(function (li) { li.classList.add('on'); });
      return;
    }
    steps.forEach(function (li, i) {
      timers.push(setTimeout(function () { li.classList.add('on'); }, 500 + i * 420));
    });
  }

  if (steps.length) {
    play();
    if (replay) replay.addEventListener('click', play);
  }
})();
