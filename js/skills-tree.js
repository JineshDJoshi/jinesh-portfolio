/* Interactive skills tree.
   Every skill and project below comes from the resume. Edit the DATA block to change the tree. */
   (function () {
    'use strict';
  
    var svg = document.getElementById('tree-svg');
    if (!svg) return;
  
    var NS = 'http://www.w3.org/2000/svg';
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
    /* ------------------------------ DATA ------------------------------ */
    var PROJECTS = {
      hims:    { label: 'HIMS',                 full: 'HIMS, Hospital Information Management System', side: -1, y: 855 },
      emsips:  { label: 'e-MSIPS',              full: 'e-MSIPS, MeitY',                               side: -1, y: 800 },
      nandi:   { label: 'NANDI',                full: 'NANDI Portal, DAHD',                           side: -1, y: 745 },
      dli:     { label: 'DLI',                  full: 'DLI, Design Linked Incentive, MeitY',          side:  1, y: 855 },
      chatbot: { label: 'Chatbot',              full: 'Chatbot, intelligent user support',            side:  1, y: 800 },
      pay:     { label: 'Banking & payments',   full: 'Banking and payment integration, HIMS and DLI', side: 1, y: 745 }
    };
  
    // [skill label, [projects that used it]]
    var GROUPS = [
      { id: 'frontend', label: 'Frontend', color: '#4fc3f7', angle: -84, rxk: 0.9, start: 690, skills: [
        ['HTML5', []], ['CSS3', []], ['JavaScript (ES6+)', ['hims', 'emsips', 'dli', 'chatbot']], ['jQuery', []], ['AJAX', []],
        ['Bootstrap', []], ['Tailwind CSS', []], ['NextJS', []], ['VueJS', []] ] },
      { id: 'other', label: 'Other tech', color: '#4dd0e1', angle: -52, start: 650, skills: [
        ['.NET / C#', []], ['Node.js', []], ['Python', []], ['FastAPI', []], ['C', []], ['C++', []] ] },
      { id: 'data', label: 'Databases, caching and search', color: '#9575cd', angle: -30, start: 690, skills: [
        ['PostgreSQL', ['emsips', 'nandi', 'dli']], ['MySQL', []], ['MongoDB', []], ['Redis', ['hims']],
        ['Elasticsearch', ['hims', 'emsips', 'dli']], ['Apache Kafka', ['emsips', 'nandi', 'dli']] ] },
      { id: 'core', label: 'Core stack', color: '#7c9fff', angle: 0, gap: 10, start: 655, skills: [
        ['Java 8 / 17 / 21', ['hims', 'emsips', 'nandi', 'dli']], ['Spring Boot', ['hims', 'nandi', 'chatbot']],
        ['Spring MVC', ['emsips', 'dli']], ['Spring Security', []], ['ReactJS', ['hims', 'emsips']], ['Redux', ['hims']],
        ['JSP', ['emsips', 'nandi', 'dli']], ['RESTful APIs', ['hims', 'nandi', 'chatbot']] ] },
      { id: 'devops', label: 'DevOps and cloud', color: '#ffb74d', angle: 30, start: 690, skills: [
        ['Docker', []], ['Jenkins', []], ['Rancher', []], ['Harbor', []], ['AWS (EC2, S3)', []], ['Azure', []],
        ['GitLab', []], ['Maven', []], ['PuTTY', ['nandi']], ['WinSCP', ['nandi']] ] },
      { id: 'identity', label: 'Identity, security and payments', color: '#f06292', angle: 58, start: 650, skills: [
        ['Aadhaar/OVSE Verification', ['hims']], ['Mobile & WhatsApp OTP', ['hims', 'dli', 'pay']], ['SSO', ['emsips']],
        ['Payment Gateway (UPI)', ['hims', 'dli', 'pay']], ['Bank Verification API', ['hims', 'dli', 'pay']], ['Burp Suite', ['nandi']] ] },
      { id: 'tools', label: 'Tools and methodologies', color: '#81c784', angle: 84, rxk: 0.9, start: 690, skills: [
        ['Postman', []], ['JUnit', []], ['BugZilla', []], ['JasperReports', ['emsips', 'dli']], ['HLD/LLD', ['hims']],
        ['Application & Software Design', []], ['Agile', []], ['Scrum', []], ['Requirement Analysis', []], ['DSA', []] ] }
    ];
  
    // Languages shown as roots
    var ROOTS = [
      { name: 'Java', projects: ['hims', 'emsips', 'nandi', 'dli'], angle: -86 },
      { name: 'JavaScript', projects: ['hims', 'emsips', 'dli', 'chatbot'], angle: -72 },
      { name: 'SQL', projects: [], angle: -58 },
      { name: 'Python', projects: [], angle: 58 },
      { name: '.NET / C#', projects: [], angle: 72 },
      { name: 'C / C++', projects: [], angle: 86 }
    ];
  
    /* ---------------------------- HELPERS ----------------------------- */
    var CX = 700, BASE_Y = 900, FORK_Y = 640;
    var EY = 700, RX = 410, RY = 370;   // canopy ellipse the branch tips sit on
    var PROJ_COLOR = '#ffd54f';
  
    function el(name, attrs, parent) {
      var n = document.createElementNS(NS, name);
      for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) n.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(n);
      return n;
    }
    function rad(d) { return d * Math.PI / 180; }
    function f(n) { return Math.round(n * 10) / 10; }
    function projectNames(ids) { return ids.map(function (id) { return PROJECTS[id].label; }); }
  
    /* ------------------------------ BUILD ------------------------------ */
    var viewport = el('g', { id: 'tree-viewport' }, svg);
    var gLines = el('g', {}, viewport);
    var gTrunk = el('g', {}, viewport);
    var gProj = el('g', {}, viewport);
    var gNodes = el('g', {}, viewport);
    var gLabel = el('g', {}, viewport);
  
    var leaves = [];            // {g, name, group, groupLabel, projects}
    var branchEls = {};         // group id -> path
    var projEls = {};           // project id -> g
    var drawPaths = [];
    var leafIndex = 0;
  
    // ground line
    el('line', { x1: CX - 340, y1: BASE_Y, x2: CX + 340, y2: BASE_Y, stroke: '#9da2ff', 'stroke-opacity': '.22', 'stroke-width': 1.5 }, gLines);
  
    // roots
    ROOTS.forEach(function (r, i) {
      var a = rad(r.angle), len = [150, 130, 150][i % 3];
      var ex = CX + Math.sin(a) * len, ey = BASE_Y + Math.cos(a) * len;
      var cx = CX + Math.sin(a) * len * 0.35, cy = BASE_Y + Math.cos(a) * len * 0.15 + 10;
      var g = el('g', { 'class': 'leaf', tabindex: '0', role: 'button', 'aria-pressed': 'false' }, gNodes);
      var col = '#8fa0d0';
      var p = el('path', { 'class': 'twig', d: 'M' + CX + ' ' + BASE_Y + ' Q' + f(cx) + ' ' + f(cy) + ' ' + f(ex) + ' ' + f(ey), stroke: col }, g);
      drawPaths.push(p);
      el('circle', { 'class': 'hit', cx: f(ex), cy: f(ey), r: 16 }, g);
      el('circle', { 'class': 'dot', cx: f(ex), cy: f(ey), r: 5, fill: col }, g);
      var left = ex < CX;
      var t = el('text', { 'class': 'lbl', x: f(ex + (left ? -11 : 11)), y: f(ey), 'text-anchor': left ? 'end' : 'start', 'dominant-baseline': 'central' }, g);
      t.textContent = r.name;
      g.style.setProperty('--d', (1.3 + i * 0.05) + 's');
      register(g, r.name, 'roots', 'Languages', r.projects);
    });
  
    // trunk
    var trunk = el('path', { 'class': 'trunk', d: 'M' + CX + ' ' + BASE_Y + ' C' + (CX - 12) + ' 820 ' + (CX + 14) + ' 730 ' + CX + ' ' + FORK_Y }, gTrunk);
    drawPaths.push(trunk);
  
    // branches + leaves
    GROUPS.forEach(function (g, gi) {
      var a = rad(g.angle);
      var S = { x: CX, y: g.start };
      var T = { x: CX + Math.sin(a) * RX * (g.rxk || 1), y: EY - Math.cos(a) * RY };
      var C = { x: S.x + (T.x - S.x) * 0.1, y: S.y + (T.y - S.y) * 0.85 };
      var b = el('path', { 'class': 'branch', d: 'M' + S.x + ' ' + S.y + ' Q' + f(C.x) + ' ' + f(C.y) + ' ' + f(T.x) + ' ' + f(T.y), stroke: g.color }, gLines);
      branchEls[g.id] = b; drawPaths.push(b);
  
      var node = el('circle', { 'class': 'tip', cx: f(T.x), cy: f(T.y), r: 8, fill: g.color }, gLines);
      node.setAttribute('data-group', g.id);
      var theta = Math.atan2(T.y - 660, T.x - CX);   // fan points outward from the trunk
      var n = g.skills.length;
      var gap = n > 1 ? Math.min(g.gap || 14, 100 / (n - 1)) : 0;
      var R = 100;
  
      g.skills.forEach(function (s, j) {
        var phi = theta + rad((j - (n - 1) / 2) * gap);
        var lx = T.x + Math.cos(phi) * R, ly = T.y + Math.sin(phi) * R;
        var leaf = el('g', { 'class': 'leaf', tabindex: '0', role: 'button', 'aria-pressed': 'false' }, gNodes);
        var tw = el('path', { 'class': 'twig', d: 'M' + f(T.x) + ' ' + f(T.y) + ' L' + f(lx) + ' ' + f(ly), stroke: g.color }, leaf);
        drawPaths.push(tw);
        el('circle', { 'class': 'hit', cx: f(lx), cy: f(ly), r: 15 }, leaf);
        el('circle', { 'class': 'dot', cx: f(lx), cy: f(ly), r: 5, fill: g.color }, leaf);
        var lpx = T.x + Math.cos(phi) * (R + 10), lpy = T.y + Math.sin(phi) * (R + 10);
        var deg = phi * 180 / Math.PI, flip = Math.cos(phi) < 0;
        var t = el('text', {
          'class': 'lbl', x: f(lpx), y: f(lpy), 'text-anchor': flip ? 'end' : 'start', 'dominant-baseline': 'central',
          transform: 'rotate(' + f(flip ? deg + 180 : deg) + ' ' + f(lpx) + ' ' + f(lpy) + ')'
        }, leaf);
        t.textContent = s[0];
        leaf.style.setProperty('--d', (0.9 + gi * 0.12 + j * 0.05) + 's');
        register(leaf, s[0], g.id, g.label, s[1]);
      });
      b.style.transitionDelay = (0.2 + gi * 0.12) + 's';
    });
  
    // projects
    Object.keys(PROJECTS).forEach(function (id, i) {
      var p = PROJECTS[id];
      var x = CX + p.side * 100, y = p.y;
      var g = el('g', { 'class': 'proj', tabindex: '0', role: 'button', 'aria-pressed': 'false' }, gProj);
      var link = el('path', { 'class': 'plink', d: 'M' + (CX + p.side * 5) + ' ' + (y + 8) + ' Q' + (CX + p.side * 50) + ' ' + (y + 16) + ' ' + x + ' ' + y }, g);
      drawPaths.push(link);
      el('circle', { 'class': 'hit', cx: x, cy: y, r: 16 }, g);
      el('ellipse', { 'class': 'dot pdot', cx: x, cy: y, rx: 11, ry: 6.5, fill: PROJ_COLOR }, g);
      var t = el('text', { 'class': 'lbl plbl', x: x + p.side * 18, y: y, 'text-anchor': p.side < 0 ? 'end' : 'start', 'dominant-baseline': 'central' }, g);
      t.textContent = p.label;
      g.style.setProperty('--d', (1.4 + i * 0.06) + 's');
      var skillsUsed = [];
      g.setAttribute('aria-label', 'Project ' + p.full);
      g.setAttribute('data-project', id);
      projEls[id] = g;
      g._project = id;
    });
  
    // name
    var nm = el('text', { 'class': 'name', x: CX, y: BASE_Y + 62, 'text-anchor': 'middle' }, gLabel);
    nm.textContent = 'Jinesh Dutt Joshi';
    var sub = el('text', { 'class': 'subname', x: CX, y: BASE_Y + 84, 'text-anchor': 'middle' }, gLabel);
    sub.textContent = 'Full Stack Developer';
  
    function register(g, name, groupId, groupLabel, projects) {
      var used = projectNames(projects);
      g.setAttribute('aria-label', name + (used.length ? ', used in ' + used.join(', ') : ', ' + groupLabel));
      var rec = { g: g, name: name, group: groupId, groupLabel: groupLabel, projects: projects };
      g._leaf = rec;
      leaves.push(rec);
    }
  
    /* ------------------------- CATEGORY CHIPS -------------------------- */
    var chipsBox = document.getElementById('tree-chips');
    var chipEls = {};
    var focusGroup = null;
    GROUPS.forEach(function (g) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'tree-chip'; b.textContent = g.label;
      b.setAttribute('aria-pressed', 'false');
      b.style.setProperty('--c', g.color);
      b.addEventListener('click', function () {
        focusGroup = focusGroup === g.id ? null : g.id;
        Object.keys(chipEls).forEach(function (k) { chipEls[k].setAttribute('aria-pressed', String(k === focusGroup)); });
        update();
      });
      chipsBox.appendChild(b); chipEls[g.id] = b;
    });
  
    /* ---------------------- HIGHLIGHT / SELECTION ---------------------- */
    var search = document.getElementById('tree-search');
    var status = document.getElementById('tree-status');
    var query = '';
    var hover = null, pinned = null;   // {type:'skill', rec} | {type:'project', id}
  
    function selOf(node) {
      if (node._leaf) return { type: 'skill', rec: node._leaf, node: node };
      if (node._project) return { type: 'project', id: node._project, node: node };
      return null;
    }
  
    function update() {
      var sel = pinned || hover;
      var litLeaf = [], litGroup = {}, litProj = {}, active = true;
  
      if (sel && sel.type === 'skill') {
        litLeaf.push(sel.rec); litGroup[sel.rec.group] = 1;
        sel.rec.projects.forEach(function (p) { litProj[p] = 1; });
      } else if (sel && sel.type === 'project') {
        litProj[sel.id] = 1;
        leaves.forEach(function (l) {
          if (l.projects.indexOf(sel.id) > -1) { litLeaf.push(l); litGroup[l.group] = 1; }
        });
      } else if (query || focusGroup) {
        leaves.forEach(function (l) {
          var ok = (!focusGroup || l.group === focusGroup) && (!query || l.name.toLowerCase().indexOf(query) > -1);
          if (ok) {
            litLeaf.push(l); litGroup[l.group] = 1;
            l.projects.forEach(function (p) { litProj[p] = 1; });
          }
        });
      } else { active = false; }
  
      leaves.forEach(function (l) {
        var on = !active || litLeaf.indexOf(l) > -1;
        l.g.classList.toggle('dim', !on);
        l.g.classList.toggle('lit', active && on);
        var isPinned = pinned && pinned.type === 'skill' && pinned.rec === l;
        l.g.setAttribute('aria-pressed', String(!!isPinned));
      });
      Object.keys(projEls).forEach(function (id) {
        var on = !active || litProj[id];
        projEls[id].classList.toggle('dim', !on);
        projEls[id].classList.toggle('lit', active && !!litProj[id]);
        projEls[id].setAttribute('aria-pressed', String(!!(pinned && pinned.type === 'project' && pinned.id === id)));
      });
      Object.keys(branchEls).forEach(function (id) {
        branchEls[id].classList.toggle('dim', active && !litGroup[id]);
      });
      Array.prototype.forEach.call(svg.querySelectorAll('.tip'), function (t) {
        t.classList.toggle('dim', active && !litGroup[t.getAttribute('data-group')]);
      });
  
      if (!sel && (query || focusGroup)) {
        status.textContent = litLeaf.length ? litLeaf.length + (litLeaf.length === 1 ? ' skill' : ' skills') + ' shown' : 'No matching skills';
      } else if (!sel) { status.textContent = ''; }
    }
  
    /* ------------------------------ TOOLTIP ---------------------------- */
    var panel = document.getElementById('tree-panel');
    var tip = document.getElementById('tree-tip');
  
    function showTip(node) {
      var title, body;
      if (node._leaf) {
        var r = node._leaf;
        title = r.name;
        body = r.projects.length ? 'Used in: ' + projectNames(r.projects).join(', ') : r.groupLabel;
      } else {
        var id = node._project;
        title = PROJECTS[id].full;
        var used = leaves.filter(function (l) { return l.projects.indexOf(id) > -1; }).map(function (l) { return l.name; });
        body = used.length ? 'Skills: ' + used.join(', ') : '';
      }
      tip.textContent = '';
      var s = document.createElement('strong'); s.textContent = title; tip.appendChild(s);
      if (body) { var p = document.createElement('span'); p.textContent = body; tip.appendChild(p); }
      tip.hidden = false;
      var pr = panel.getBoundingClientRect(), nr = node.getBoundingClientRect();
      var x = nr.left - pr.left + nr.width / 2, y = nr.top - pr.top;
      var w = tip.offsetWidth, h = tip.offsetHeight;
      var left = Math.max(8, Math.min(pr.width - w - 8, x - w / 2));
      var top = y - h - 10; if (top < 8) top = nr.bottom - pr.top + 10;
      tip.style.left = left + 'px'; tip.style.top = top + 'px';
    }
    function hideTip() { tip.hidden = true; }
  
    function wire(node) {
      node.addEventListener('mouseenter', function () { hover = selOf(node); update(); showTip(node); });
      node.addEventListener('mouseleave', function () { hover = null; update(); hideTip(); });
      node.addEventListener('focus', function () { hover = selOf(node); update(); showTip(node); });
      node.addEventListener('blur', function () { hover = null; update(); hideTip(); });
      node.addEventListener('click', function () {
        var s = selOf(node);
        var same = pinned && pinned.node === node;
        pinned = same ? null : s;
        update();
      });
      node.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); node.dispatchEvent(new MouseEvent('click')); }
      });
    }
    leaves.forEach(function (l) { wire(l.g); });
    Object.keys(projEls).forEach(function (id) { wire(projEls[id]); });
  
    search.addEventListener('input', function () { query = search.value.trim().toLowerCase(); update(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && (pinned || query || focusGroup)) {
        pinned = null; query = ''; search.value = ''; focusGroup = null;
        Object.keys(chipEls).forEach(function (k) { chipEls[k].setAttribute('aria-pressed', 'false'); });
        update();
      }
    });
  
    /* ---------------------------- ZOOM / PAN --------------------------- */
    var vb = svg.viewBox.baseVal;
    var view = { k: 1, x: 0, y: 0 };
    function apply() { viewport.setAttribute('transform', 'translate(' + f(view.x) + ' ' + f(view.y) + ') scale(' + view.k + ')'); }
    function zoomAt(px, py, factor) {
      var k = Math.max(0.7, Math.min(3, view.k * factor));
      var r = k / view.k;
      view.x = px - (px - view.x) * r; view.y = py - (py - view.y) * r; view.k = k; apply();
    }
    function center() { return { x: vb.x + vb.width / 2, y: vb.y + vb.height / 2 }; }
    document.getElementById('zoom-in').addEventListener('click', function () { var c = center(); zoomAt(c.x, c.y, 1.3); });
    document.getElementById('zoom-out').addEventListener('click', function () { var c = center(); zoomAt(c.x, c.y, 1 / 1.3); });
    function reset() { view.k = 1; view.x = 0; view.y = 0; apply(); }
    document.getElementById('zoom-reset').addEventListener('click', reset);
  
    function toSvg(cx, cy) {
      var pt = svg.createSVGPoint(); pt.x = cx; pt.y = cy;
      return pt.matrixTransform(svg.getScreenCTM().inverse());
    }
    svg.addEventListener('wheel', function (e) {
      if (!(e.ctrlKey || e.metaKey)) return;       // plain scroll keeps scrolling the page
      e.preventDefault();
      var p = toSvg(e.clientX, e.clientY);
      zoomAt(p.x, p.y, e.deltaY < 0 ? 1.12 : 1 / 1.12);
    }, { passive: false });
  
    var drag = null;
    svg.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('.leaf, .proj')) return;
      drag = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
      svg.setPointerCapture(e.pointerId); svg.classList.add('panning');
    });
    svg.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var s = svg.getScreenCTM().a;
      view.x = drag.vx + (e.clientX - drag.x) / s; view.y = drag.vy + (e.clientY - drag.y) / s; apply();
    });
    function endDrag() { drag = null; svg.classList.remove('panning'); }
    svg.addEventListener('pointerup', endDrag);
    svg.addEventListener('pointercancel', endDrag);
    svg.addEventListener('dblclick', function (e) { if (!e.target.closest('.leaf, .proj')) reset(); });
  
    /* ------------------------ SHOW BOTH VIEWS --------------------------- */
    // Both the tree and the simple list are shown together now — no toggle.
    var treeWrap = document.getElementById('tree-wrap');
    var simple = document.getElementById('skills-simple');
    var toggle = document.getElementById('view-toggle');
    if (treeWrap) treeWrap.hidden = false;
    if (simple) simple.hidden = false;
    if (toggle) toggle.hidden = true;   // hide the now-unused button rather than deleting it from the DOM
  
    /* ------------------------------ GROW-IN ---------------------------- */
    var grown = false;
    drawPaths.forEach(function (p) {
      p.setAttribute('pathLength', '1');
      p.style.strokeDasharray = '1';
      p.style.strokeDashoffset = reduceMotion ? '0' : '1';
    });
    if (!reduceMotion) svg.classList.add('grow');
  
    function grow() {
      if (grown) return;
      if (reduceMotion || !('IntersectionObserver' in window)) { grown = true; svg.classList.add('in'); return; }
      var io = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        grown = true; io.disconnect();
        drawPaths.forEach(function (p, i) {
          p.style.transition = 'stroke-dashoffset 1.1s ease-out';
          if (!p.style.transitionDelay) p.style.transitionDelay = (0.05 + (i % 12) * 0.04) + 's';
          p.style.strokeDashoffset = '0';
        });
        svg.classList.add('in');
      }, { threshold: 0.25 });
      io.observe(panel);
    }
  
    grow();
  })();