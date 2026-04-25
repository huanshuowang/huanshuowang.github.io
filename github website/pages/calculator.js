(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════
     ALGORITHM
  ═══════════════════════════════════════════════════════════════ */

  function getPairScore(rideA, rideB, mode) {
    if (!rideA.familyId || !rideB.familyId) return 0;
    if (rideA.familyId !== rideB.familyId) return 0;
    var family = FAMILIES.find(function (f) { return f.id === rideA.familyId; });
    if (!family) return 0;
    var key = [rideA.parkId, rideB.parkId].sort().join('-');
    var pair = family.pairScores && family.pairScores[key];
    if (pair) return pair[mode];
    return mode === 'strict' ? family.defaultScoreStrict : family.defaultScoreWeighted;
  }

  function calculateOverlap(visitedParkIds, targetParkId, mode) {
    var visitedRides = RIDES.filter(function (r) { return visitedParkIds.indexOf(r.parkId) >= 0; });
    var targetRides  = RIDES.filter(function (r) { return r.parkId === targetParkId; });
    var freshRides = [], similarRides = [], exactRides = [];

    for (var i = 0; i < targetRides.length; i++) {
      var r = targetRides[i];
      if (!r.familyId) {
        freshRides.push({ ride: r, isUnique: !!r.isOneOfAKind });
        continue;
      }
      var bestScore = 0, bestMatch = null;
      for (var j = 0; j < visitedRides.length; j++) {
        var score = getPairScore(r, visitedRides[j], mode);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = visitedRides[j];
          if (score === 1) break;
        }
      }
      if (bestScore === 0 || !bestMatch) {
        freshRides.push({ ride: r, isUnique: !!r.isOneOfAKind });
      } else {
        var matchedPark = PARKS.find(function (p) { return p.id === bestMatch.parkId; });
        var entry = { ride: r, matchedRide: bestMatch, matchedPark: matchedPark, weight: bestScore };
        if (bestScore === 1) exactRides.push(entry);
        else similarRides.push(entry);
      }
    }

    var overlapWeight;
    if (mode === 'strict') {
      overlapWeight = exactRides.length;
    } else {
      overlapWeight = exactRides.length + similarRides.reduce(function (s, e) { return s + e.weight; }, 0);
    }

    return {
      mode: mode,
      overlapPercent: targetRides.length > 0 ? Math.round((overlapWeight / targetRides.length) * 100) : 0,
      totalRides: targetRides.length,
      overlapWeight: Number(overlapWeight.toFixed(2)),
      freshRides: freshRides,
      similarRides: similarRides,
      exactRides: exactRides
    };
  }

  function rankOtherParks(visitedParkIds, currentTargetId, brand, mode) {
    return PARKS
      .filter(function (p) {
        return p.brand === brand &&
               visitedParkIds.indexOf(p.id) < 0 &&
               p.id !== currentTargetId;
      })
      .map(function (p) {
        var result = calculateOverlap(visitedParkIds, p.id, mode);
        return { park: p, overlapPercent: result.overlapPercent, freshCount: result.freshRides.length, totalRides: result.totalRides };
      })
      .filter(function (r) { return r.totalRides > 0; })
      .sort(function (a, b) { return a.overlapPercent - b.overlapPercent; });
  }

  /* ═══════════════════════════════════════════════════════════════
     STORE
  ═══════════════════════════════════════════════════════════════ */

  var store = {
    state: {
      isOpen: false,
      step: 1,
      brand: null,
      visitedParkIds: [],
      targetParkId: null,
      mode: 'weighted',
      resultView: 'fresh',
      expandedLocations: new Set()
    },
    _subscribers: [],
    getState: function () {
      var s = this.state;
      return {
        isOpen: s.isOpen, step: s.step, brand: s.brand,
        visitedParkIds: s.visitedParkIds.slice(),
        targetParkId: s.targetParkId, mode: s.mode,
        resultView: s.resultView,
        expandedLocations: new Set(s.expandedLocations)
      };
    },
    subscribe: function (fn) {
      this._subscribers.push(fn);
      return function () { this._subscribers = this._subscribers.filter(function (s) { return s !== fn; }); }.bind(this);
    },
    dispatch: function (action) {
      var s = this.state;
      switch (action.type) {
        case 'OPEN':   s.isOpen = true;  break;
        case 'CLOSE':  s.isOpen = false; break;

        case 'SET_BRAND':
          s.brand = action.brand;
          s.visitedParkIds = [];
          s.targetParkId = null;
          s.expandedLocations = new Set();
          break;

        case 'TOGGLE_VISITED': {
          var idx = s.visitedParkIds.indexOf(action.parkId);
          if (idx >= 0) s.visitedParkIds.splice(idx, 1);
          else s.visitedParkIds.push(action.parkId);
          break;
        }

        case 'TOGGLE_SINGLE_LOCATION': {
          // Expand/collapse a single-park location AND sync visited status
          var locId = action.locationId, pid = action.parkId;
          var alreadyExpanded = s.expandedLocations.has(locId) || s.visitedParkIds.indexOf(pid) >= 0;
          if (s.expandedLocations.has(locId)) s.expandedLocations.delete(locId);
          else s.expandedLocations.add(locId);
          if (!alreadyExpanded && s.visitedParkIds.indexOf(pid) < 0) {
            s.visitedParkIds.push(pid);
          } else if (alreadyExpanded && s.visitedParkIds.indexOf(pid) >= 0) {
            s.visitedParkIds.splice(s.visitedParkIds.indexOf(pid), 1);
          }
          break;
        }

        case 'TOGGLE_LOCATION':
          if (s.expandedLocations.has(action.locationId)) s.expandedLocations.delete(action.locationId);
          else s.expandedLocations.add(action.locationId);
          break;

        case 'SET_TARGET':  s.targetParkId = action.parkId; break;
        case 'GO_TO_STEP':  s.step = action.step; break;
        case 'SET_MODE':    s.mode = action.mode; break;
        case 'SET_RESULT_VIEW': s.resultView = action.view; break;

        case 'SWITCH_TARGET':
          s.targetParkId = action.parkId;
          s.step = 4;
          break;

        case 'RESET':
          s.step = 1; s.brand = null; s.visitedParkIds = []; s.targetParkId = null;
          s.mode = 'weighted'; s.resultView = 'fresh'; s.expandedLocations = new Set();
          break;
      }
      var snap = this.getState();
      this._subscribers.forEach(function (fn) { fn(snap); });
    }
  };

  /* ═══════════════════════════════════════════════════════════════
     HELPERS
  ═══════════════════════════════════════════════════════════════ */

  var RIDE_TYPE_LABELS = {
    'coaster-indoor': 'Indoor Coaster', 'coaster-launch': 'Launch Coaster',
    'coaster-family': 'Family Coaster', 'coaster-inversion': 'Inversion Coaster',
    'coaster-hybrid': 'Hybrid Coaster', 'coaster-spinning': 'Spinning Coaster',
    'coaster-inverted': 'Inverted Coaster',
    'dark-ride-trackless': 'Trackless Dark Ride', 'dark-ride-omnimover': 'Omnimover',
    'dark-ride-track': 'Dark Ride', 'dark-ride-shooter': 'Shooter Ride',
    'water-flume': 'Log Flume', 'water-boat': 'Boat Ride', 'water-rapids': 'River Rapids',
    'simulator-flying': 'Flying Simulator', 'simulator-motion': 'Motion Simulator',
    'simulator-360': '360° Film', 'spinning-ride': 'Spinner', 'drop-tower': 'Drop Tower',
    'show-live': 'Live Show', 'show-theater': 'Theater Show', 'show-projection': 'Nighttime Show',
    'show-parade': 'Parade', 'train-ride': 'Train Ride', 'walkthrough': 'Walkthrough',
    'carousel': 'Carousel', 'kids-play': 'Kids Play', 'swing-ride': 'Swing Ride'
  };

  function rideTypeLabel(t) { return RIDE_TYPE_LABELS[t] || t; }

  var STATE_IDS = ['brand', 'visited', 'target', 'result', 'edge-nodata', 'edge-conquered', 'loading'];
  var TILTS = [-2, 1.5, -1, 2.5, -2.8, 1.8, -1.5, 2, -0.8, 1.2, -2.5, 1, -1.8, 2.2];

  function qs(selector) { return document.querySelector(selector); }

  function showState(name) {
    STATE_IDS.forEach(function (s) {
      var el = document.getElementById('state-' + s);
      if (el) el.classList.toggle('active', s === name);
    });
    var modal = document.getElementById('calc-modal');
    if (modal) modal.scrollTop = 0;
  }

  /* ═══════════════════════════════════════════════════════════════
     NUMBER ANIMATION
  ═══════════════════════════════════════════════════════════════ */

  function animateNumber(from, to, duration, element, onComplete) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      element.textContent = to;
      if (onComplete) onComplete();
      return;
    }
    var start = performance.now();
    function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
    function tick(now) {
      var p = Math.min((now - start) / duration, 1);
      element.textContent = Math.round(from + (to - from) * easeOutExpo(p));
      if (p < 1) requestAnimationFrame(tick);
      else { element.textContent = to; if (onComplete) onComplete(); }
    }
    requestAnimationFrame(tick);
  }

  /* ═══════════════════════════════════════════════════════════════
     TOAST
  ═══════════════════════════════════════════════════════════════ */

  var _toastTimer = null;
  function showToast(msg) {
    var el = document.getElementById('calc-toast');
    if (!el) return;
    if (msg) el.textContent = msg;
    el.classList.add('show');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2800);
  }

  /* ═══════════════════════════════════════════════════════════════
     RENDER STATE 2 — VISITED
  ═══════════════════════════════════════════════════════════════ */

  function renderVisited(state) {
    var locList = qs('[data-role="visited-location-list"]');
    if (!locList) return;
    locList.innerHTML = '';

    var brand = state.brand;
    var visitedParkIds = state.visitedParkIds;
    var expandedLocations = state.expandedLocations;
    var locCls  = brand === 'disney' ? 'dloc' : 'uloc';

    // Collect unique locationIds in declaration order from PARKS
    var seen = [], locationIds = [];
    PARKS.filter(function (p) { return p.brand === brand; }).forEach(function (p) {
      if (seen.indexOf(p.locationId) < 0) { seen.push(p.locationId); locationIds.push(p.locationId); }
    });

    locationIds.forEach(function (locId) {
      var location = LOCATIONS.find(function (l) { return l.id === locId; });
      var parks    = PARKS.filter(function (p) { return p.brand === brand && p.locationId === locId; });
      var isSingle = parks.length === 1;
      var isOpen   = expandedLocations.has(locId) || parks.some(function (p) { return visitedParkIds.indexOf(p.id) >= 0; });

      var div = document.createElement('div');
      div.className = 'loc-card ' + locCls + (isOpen ? ' lopen' : '');
      div.setAttribute('data-role', 'location-card-' + locId);

      var parkRowsHtml = parks.map(function (p) {
        var checked = visitedParkIds.indexOf(p.id) >= 0;
        return '<div class="prow" data-role="park-checkbox-' + p.id + '" role="checkbox" aria-checked="' + checked + '" aria-label="' + p.name + '">' +
               '<div class="pchk' + (checked ? ' on' : '') + '" id="pchk-' + p.id + '"></div>' +
               '<div><div class="pname">' + p.name + '</div></div>' +
               '</div>';
      }).join('');

      div.innerHTML =
        '<div class="loc-hdr">' +
          '<div><div class="loc-name">' + (location ? location.name : locId) + '</div>' +
          '<div class="loc-meta">' + parks.length + ' park' + (parks.length > 1 ? 's' : '') + '</div></div>' +
          '<span class="loc-chev">›</span>' +
        '</div>' +
        '<div class="park-list">' + parkRowsHtml + '</div>';

      var hdr = div.querySelector('.loc-hdr');
      if (isSingle) {
        hdr.addEventListener('click', function () {
          store.dispatch({ type: 'TOGGLE_SINGLE_LOCATION', locationId: locId, parkId: parks[0].id });
        });
      } else {
        hdr.addEventListener('click', function () {
          store.dispatch({ type: 'TOGGLE_LOCATION', locationId: locId });
        });
      }

      parks.forEach(function (p) {
        var row = div.querySelector('[data-role="park-checkbox-' + p.id + '"]');
        if (row) {
          row.addEventListener('click', function () {
            store.dispatch({ type: 'TOGGLE_VISITED', parkId: p.id });
          });
        }
      });

      locList.appendChild(div);
    });

    updateChips(state);
    updateVisBot(state);
  }

  function updateChips(state) {
    var wrap  = qs('[data-role="visited-chips-container"]');
    var empty = document.getElementById('chips-empty');
    if (!wrap) return;
    wrap.querySelectorAll('.chip').forEach(function (c) { c.remove(); });

    if (state.visitedParkIds.length === 0) {
      if (empty) empty.style.display = '';
      return;
    }
    if (empty) empty.style.display = 'none';

    var cls = state.brand === 'disney' ? 'dc' : 'uc';
    state.visitedParkIds.forEach(function (pid) {
      var park = PARKS.find(function (p) { return p.id === pid; });
      if (!park) return;
      var label = park.name.length > 22 ? park.name.slice(0, 20) + '…' : park.name;
      var chip = document.createElement('div');
      chip.className = 'chip ' + cls;
      chip.setAttribute('data-role', 'visited-chip-' + pid);

      var txt = document.createTextNode(label + ' ');
      var xBtn = document.createElement('span');
      xBtn.className = 'chip-x';
      xBtn.textContent = '×';
      xBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        store.dispatch({ type: 'TOGGLE_VISITED', parkId: pid });
      });
      chip.appendChild(txt);
      chip.appendChild(xBtn);
      wrap.appendChild(chip);
    });
  }

  function updateVisBot(state) {
    var n = state.visitedParkIds.length;
    var lbl = document.getElementById('visited-lbl');
    if (lbl) lbl.textContent = n + ' park' + (n === 1 ? '' : 's') + ' visited';
    var btn = qs('[data-role="next-to-target"]');
    if (btn) btn.disabled = n === 0;
  }

  /* ═══════════════════════════════════════════════════════════════
     RENDER STATE 3 — TARGET
  ═══════════════════════════════════════════════════════════════ */

  function renderTarget(state) {
    var brand = state.brand, visitedParkIds = state.visitedParkIds, targetParkId = state.targetParkId;
    var grid = qs('[data-role="target-park-grid"]');
    if (!grid) return;
    grid.innerHTML = '';

    var brandParks = PARKS.filter(function (p) { return p.brand === brand; });
    var available  = brandParks.filter(function (p) { return visitedParkIds.indexOf(p.id) < 0; });

    if (available.length === 0) { showState('edge-conquered'); return; }

    var tcls = brand === 'disney' ? 'dtc' : 'utc';
    var calcBtn = qs('[data-role="calculate-btn"]');
    if (calcBtn) calcBtn.disabled = !targetParkId;
    var tLbl = document.getElementById('target-lbl');
    if (tLbl) {
      if (targetParkId) {
        var tp = PARKS.find(function (p) { return p.id === targetParkId; });
        tLbl.textContent = 'Comparing ' + visitedParkIds.length + ' park' + (visitedParkIds.length > 1 ? 's' : '') + ' vs ' + (tp ? tp.name : '');
      } else {
        tLbl.textContent = 'Choose a park above';
      }
    }

    brandParks.forEach(function (park, i) {
      var isV = visitedParkIds.indexOf(park.id) >= 0;
      var isSel = park.id === targetParkId;
      var isDimmed = !isV && !!targetParkId && !isSel;
      var tilt = TILTS[i % TILTS.length];
      var loc = LOCATIONS.find(function (l) { return l.id === park.locationId; });

      var card = document.createElement('div');
      card.className = 'tcard ' + tcls +
        (isV ? ' vstamped' : '') +
        (isSel ? ' stamped-sel' : '') +
        (isDimmed ? ' dimmed' : '');
      card.style.transform = 'rotate(' + tilt + 'deg)';
      card.setAttribute('data-role', 'target-park-' + park.id);
      if (!isV) { card.setAttribute('role', 'button'); card.setAttribute('tabindex', '0'); }

      var stampOpacity = isSel ? '1' : '0';
      var stampTransform = isSel ? 'translateY(0) rotate(0) scale(1)' : 'translateY(-70px) rotate(-15deg) scale(1.3)';

      card.innerHTML =
        '<div class="tcard-img">' +
          '<div class="tcard-ph">' + park.name + '</div>' +
          (isV ? '<div class="tcard-sbadge">✓ visited</div>' : '') +
        '</div>' +
        '<div class="tcard-body">' +
          '<div class="tcard-name">' + park.name + '</div>' +
          '<div class="tcard-loc">' + (loc ? loc.name : '') + '</div>' +
        '</div>' +
        '<div class="stamp-ovl" style="opacity:' + stampOpacity + '">' +
          '<div class="stamp-circle" style="transform:' + stampTransform + '"><span>CHOSEN</span></div>' +
        '</div>';

      if (!isV) {
        (function (p, c) {
          c.addEventListener('click', function () { pickTarget(p.id, c, p.name); });
          c.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') pickTarget(p.id, c, p.name);
          });
        }(park, card));
      }

      grid.appendChild(card);
    });
  }

  function pickTarget(pid, card, pname) {
    if (store.getState().visitedParkIds.indexOf(pid) >= 0) {
      showToast("You've already stamped this one! Pick another park.");
      return;
    }
    var currentTarget = store.getState().targetParkId;
    if (currentTarget === pid) {
      store.dispatch({ type: 'SET_TARGET', parkId: null });
      return;
    }

    store.dispatch({ type: 'SET_TARGET', parkId: pid });

    // Stamp animation — manipulate DOM directly for animation
    var grid = qs('[data-role="target-park-grid"]');
    grid.querySelectorAll('.tcard').forEach(function (c) {
      c.classList.remove('stamping', 'stamped-sel', 'dimmed');
      var sc = c.querySelector('.stamp-circle'), so = c.querySelector('.stamp-ovl');
      if (so) so.style.opacity = '0';
      if (sc) { sc.style.transition = 'none'; sc.style.transform = 'translateY(-70px) rotate(-15deg) scale(1.3)'; }
    });
    var so = card.querySelector('.stamp-ovl'), sc = card.querySelector('.stamp-circle');
    if (so) so.style.opacity = '1';
    if (sc) { sc.style.transition = 'none'; sc.style.transform = 'translateY(-70px) rotate(-15deg) scale(1.3)'; }
    void card.offsetWidth;
    card.classList.add('stamping');
    setTimeout(function () { card.classList.remove('stamping'); card.classList.add('stamped-sel'); }, 450);
    grid.querySelectorAll('.tcard:not(.vstamped)').forEach(function (c) {
      if (c !== card) c.classList.add('dimmed');
    });

    var calcBtn = qs('[data-role="calculate-btn"]');
    if (calcBtn) calcBtn.disabled = false;
    var tLbl = document.getElementById('target-lbl');
    var visited = store.getState().visitedParkIds;
    if (tLbl) tLbl.textContent = 'Comparing ' + visited.length + ' park' + (visited.length > 1 ? 's' : '') + ' vs ' + pname;
  }

  /* ═══════════════════════════════════════════════════════════════
     RENDER STATE 4 — RESULT
  ═══════════════════════════════════════════════════════════════ */

  var _lastResult = null;

  function applyScoreColor(pct) {
    var numEl = qs('[data-role="result-number"]');
    var rBar  = document.getElementById('r-bar');
    if (!numEl) return;
    numEl.className = 'r-num';
    if (rBar) rBar.className = 'r-bar';
    if (pct > 60)      { numEl.classList.add('ch'); if (rBar) rBar.classList.add('ch'); }
    else if (pct > 30) { numEl.classList.add('cm'); if (rBar) rBar.classList.add('cm'); }
  }

  function renderResult(state) {
    var result = calculateOverlap(state.visitedParkIds, state.targetParkId, state.mode);
    _lastResult = result;

    if (result.totalRides === 0) {
      var tp0 = PARKS.find(function (p) { return p.id === state.targetParkId; });
      var msg = document.getElementById('edge-nodata-msg');
      if (msg) msg.textContent = 'We\'re still mapping the rides at ' + (tp0 ? tp0.name : 'this park');
      showState('edge-nodata');
      return;
    }

    showState('result');

    var tp = PARKS.find(function (p) { return p.id === state.targetParkId; });
    var rCompare = document.getElementById('r-compare');
    if (rCompare) rCompare.textContent = tp ? tp.name : '';

    // Animate number
    var numEl = qs('[data-role="result-number"]');
    if (numEl) {
      var from = parseInt(numEl.textContent, 10) || 0;
      animateNumber(from, result.overlapPercent, 2000, numEl);
    }
    applyScoreColor(result.overlapPercent);

    // Commentary
    var commentary = qs('[data-role="result-commentary"]');
    if (commentary) {
      var table = [[0,20,'A whole new adventure awaits ✦'],[20,40,'Mostly fresh territory ahead'],[40,60,'Half old, half new — interesting'],[60,80,'Lots of déjà vu territory...'],[80,101,"You've basically been here already"]];
      var row = table.find(function (r) { return result.overlapPercent >= r[0] && result.overlapPercent < r[1]; });
      commentary.textContent = row ? row[2] : '';
    }

    // Formula
    var formula = qs('[data-role="result-formula"]');
    if (formula) {
      formula.textContent = result.exactRides.length + ' of your rides at ' + (tp ? tp.name : '') + ' are things you\'ve ridden elsewhere';
    }

    // Confetti
    var cf = document.getElementById('confetti-wrap');
    if (cf) {
      cf.innerHTML = '';
      if (result.overlapPercent < 35) {
        var glyphs = ['✦','★','◆','✶','⬡','▲','●'];
        var cols   = ['#F5C500','#b5311a','#2a5c3f','#8b2252','#1a3a6b'];
        for (var ci = 0; ci < 9; ci++) {
          var cel = document.createElement('div');
          cel.className = 'cfel';
          cel.textContent = glyphs[ci % glyphs.length];
          cel.style.cssText = 'left:' + (8 + Math.random() * 84) + '%;top:' + (5 + Math.random() * 75) + '%;animation-delay:' + (Math.random() * 3) + 's;animation-duration:' + (3 + Math.random() * 2) + 's;color:' + cols[ci % cols.length] + ';font-size:' + (13 + Math.random() * 10) + 'px';
          cf.appendChild(cel);
        }
      }
    }

    // Mode toggle indicator
    var modeToggle = qs('[data-role="mode-toggle"]');
    if (modeToggle) modeToggle.classList.toggle('mr', state.mode === 'strict');

    // Ride counts
    var allRepeat = result.exactRides.length + result.similarRides.length;
    var freshN = document.getElementById('fresh-n'), repeatN = document.getElementById('repeat-n');
    if (freshN) freshN.textContent = result.freshRides.length;
    if (repeatN) repeatN.textContent = allRepeat;

    // Rides toggle indicator
    var ridesToggle = qs('[data-role="rides-toggle"]');
    if (ridesToggle) ridesToggle.classList.toggle('sr', state.resultView === 'repeat');

    renderRidesGrid(result, state.resultView);
    renderRecommendations(state, result);
  }

  function renderRidesGrid(result, view) {
    var grid = qs('[data-role="rides-grid"]');
    if (!grid) return;
    grid.innerHTML = '';

    var list;
    if (view === 'fresh') {
      list = result.freshRides.slice().sort(function (a, b) {
        if (a.isUnique !== b.isUnique) return b.isUnique ? 1 : -1;
        if ((a.ride.isSignature || false) !== (b.ride.isSignature || false)) return b.ride.isSignature ? 1 : -1;
        return (b.ride.thrillLevel || 0) - (a.ride.thrillLevel || 0);
      });
    } else {
      list = result.exactRides.concat(result.similarRides);
    }

    list.forEach(function (item, i) {
      var ride = item.ride;
      var card = document.createElement('div');
      card.className = 'rcard' + (view === 'repeat' ? ' rpt' : '');
      card.setAttribute('data-role', 'ride-card-' + ride.id);
      card.style.animationDelay = (i * 55) + 'ms';

      var badge;
      if (view === 'fresh') {
        badge = item.isUnique
          ? '<div class="rbadge rb-excl">ONE OF A KIND</div>'
          : '<div class="rbadge rb-new">NEW</div>';
      } else {
        badge = item.weight === 1
          ? '<div class="rbadge rb-exact">EXACT MATCH</div>'
          : '<div class="rbadge rb-sim">SIMILAR VIBE</div>';
      }

      var pips = [1,2,3,4,5].map(function (n) {
        return '<span class="rpip' + (n <= ride.thrillLevel ? ' on' : '') + '">' + (n <= ride.thrillLevel ? '🎢' : '○') + '</span>';
      }).join('');

      var because = '';
      if (view === 'repeat' && item.matchedRide) {
        var mpName = item.matchedPark ? (item.matchedPark.shortName || item.matchedPark.name) : '';
        because = '<div class="rbecause">Because you rode <em>' + item.matchedRide.name + '</em>' + (mpName ? ' at ' + mpName : '') + '</div>';
      }

      card.innerHTML = badge +
        '<div class="rname">' + ride.name + '</div>' +
        '<div class="rtype">' + rideTypeLabel(ride.rideType) + '</div>' +
        '<div class="rthrill">' + pips + '</div>' + because;

      grid.appendChild(card);
    });
  }

  function renderRecommendations(state, result) {
    var recList = qs('[data-role="recommend-list"]');
    if (!recList) return;
    recList.innerHTML = '';

    var ranked = rankOtherParks(state.visitedParkIds, state.targetParkId, state.brand, state.mode);
    var recSection = document.querySelector('.rec-section');
    var recTtl = document.getElementById('rec-ttl');

    if (ranked.length === 0) {
      if (recSection) recSection.style.display = 'none';
      return;
    }
    if (recSection) recSection.style.display = '';
    if (recTtl) recTtl.textContent = 'Other ' + (state.brand === 'disney' ? 'Disney' : 'Universal') + ' parks, sorted by freshness';

    ranked.slice(0, 6).forEach(function (item, idx) {
      var loc = LOCATIONS.find(function (l) { return l.id === item.park.locationId; });
      var fc  = item.overlapPercent < 30 ? 'gn' : item.overlapPercent < 60 ? 'ye' : 'rd';
      var div = document.createElement('div');
      div.className = 'rec-item';
      div.setAttribute('data-role', 'recommend-park-' + item.park.id);

      div.innerHTML =
        '<div class="rec-pinfo">' +
          '<div class="rec-pname">' + item.park.name + '</div>' +
          '<div class="rec-ploc">' + (loc ? loc.name : '') + '</div>' +
        '</div>' +
        '<div class="rec-bar-area">' +
          '<div class="rec-track"><div class="rec-fill ' + fc + '" style="width:0"></div></div>' +
          '<div class="rec-pct">' + item.overlapPercent + '% overlap</div>' +
        '</div>' +
        '<button class="rec-cmp">→ Compare</button>';

      (function (pid) {
        div.querySelector('.rec-cmp').addEventListener('click', function (e) {
          e.stopPropagation();
          store.dispatch({ type: 'SWITCH_TARGET', parkId: pid });
        });
        div.addEventListener('click', function () {
          store.dispatch({ type: 'SWITCH_TARGET', parkId: pid });
        });
      }(item.park.id));

      recList.appendChild(div);
      setTimeout(function () {
        var fill = div.querySelector('.rec-fill');
        if (fill) fill.style.width = item.overlapPercent + '%';
      }, 250 + idx * 90);
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     URL HASH SYNC
  ═══════════════════════════════════════════════════════════════ */

  function writeHash(state) {
    if (!state.isOpen || state.step !== 4 || !state.targetParkId || !state.brand) {
      if (location.hash.indexOf('#/compare') === 0) {
        history.replaceState(null, '', location.pathname + location.search);
      }
      return;
    }
    var params = new URLSearchParams();
    if (state.visitedParkIds.length) params.set('v', state.visitedParkIds.join(','));
    params.set('t', state.targetParkId);
    params.set('brand', state.brand);
    params.set('mode', state.mode);
    history.replaceState(null, '', '#/compare?' + params.toString());
  }

  function readHash() {
    var hash = location.hash;
    if (hash.indexOf('#/compare?') !== 0) return false;
    try {
      var params = new URLSearchParams(hash.slice('#/compare?'.length));
      var brand = params.get('brand'), t = params.get('t'), v = params.get('v');
      var mode  = params.get('mode') || 'weighted';
      if (!brand || !t) return false;
      var visitedParkIds = v ? v.split(',').filter(Boolean) : [];
      store.dispatch({ type: 'OPEN' });
      store.dispatch({ type: 'SET_BRAND', brand: brand });
      visitedParkIds.forEach(function (pid) { store.dispatch({ type: 'TOGGLE_VISITED', parkId: pid }); });
      store.dispatch({ type: 'SET_TARGET', parkId: t });
      store.dispatch({ type: 'SET_MODE',   mode: mode });
      store.dispatch({ type: 'GO_TO_STEP', step: 4 });
      return true;
    } catch (e) { return false; }
  }

  /* ═══════════════════════════════════════════════════════════════
     MOBILE DRAG-TO-CLOSE
  ═══════════════════════════════════════════════════════════════ */

  function initDragClose() {
    var modal = document.getElementById('calc-modal');
    if (!modal) return;
    var startY = 0, dragging = false;
    modal.addEventListener('touchstart', function (e) {
      if (e.target.closest && e.target.closest('.modal-hdr')) {
        startY = e.touches[0].clientY; dragging = true;
      }
    }, { passive: true });
    modal.addEventListener('touchmove', function (e) {
      if (!dragging) return;
      var dy = e.touches[0].clientY - startY;
      if (dy > 0) modal.style.transform = 'translateY(' + dy + 'px)';
    }, { passive: true });
    modal.addEventListener('touchend', function (e) {
      if (!dragging) return;
      dragging = false;
      var dy = e.changedTouches[0].clientY - startY;
      modal.style.transform = '';
      if (dy > 80) store.dispatch({ type: 'CLOSE' });
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     MAIN RENDER
  ═══════════════════════════════════════════════════════════════ */

  var _prevState = null;

  function render(state) {
    var overlay = document.getElementById('calc-overlay');
    if (!overlay) return;

    overlay.classList.toggle('open', state.isOpen);
    document.body.style.overflow = state.isOpen ? 'hidden' : '';

    if (!state.isOpen) {
      writeHash(state);
      _prevState = state;
      return;
    }

    if (state.step === 1) {
      showState('brand');
    } else if (state.step === 2) {
      showState('visited');
      renderVisited(state);
    } else if (state.step === 3) {
      showState('target');
      renderTarget(state);
    } else if (state.step === 4) {
      var isNewTarget = !_prevState || _prevState.step !== 4 || _prevState.targetParkId !== state.targetParkId;
      if (isNewTarget) {
        showState('loading');
        var snap = state;
        setTimeout(function () { renderResult(snap); writeHash(snap); }, 600);
      } else {
        // Mode or view change — re-render inline without loading flash
        renderResult(state);
        writeHash(state);
      }
    }

    _prevState = state;
  }

  /* ═══════════════════════════════════════════════════════════════
     EVENT BINDING
  ═══════════════════════════════════════════════════════════════ */

  function bindEvents() {
    // Nav: scroll to top
    var navHome = qs('[data-role="nav-home"]');
    if (navHome) navHome.addEventListener('click', function (e) {
      e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Nav: open calculator
    var navCalc = qs('[data-role="nav-calculator"]');
    if (navCalc) navCalc.addEventListener('click', function () { store.dispatch({ type: 'OPEN' }); });

    // Mobile burger
    var burger = qs('[data-role="nav-mobile-toggle"]');
    if (burger) burger.addEventListener('click', function () {
      var menu = qs('[data-role="nav-mobile-menu"]');
      if (menu) {
        var open = menu.classList.toggle('open');
        burger.setAttribute('aria-expanded', String(open));
      }
    });

    // Mobile menu: calc button
    var mobileMenu = qs('[data-role="nav-mobile-menu"]');
    if (mobileMenu) {
      var mobileCalcBtn = mobileMenu.querySelector('.np-calc');
      if (mobileCalcBtn) mobileCalcBtn.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        if (burger) burger.setAttribute('aria-expanded', 'false');
        store.dispatch({ type: 'OPEN' });
      });
    }

    // Entry ticket
    var entry = qs('[data-role="entry-calculator"]');
    if (entry) {
      entry.addEventListener('click', function () { store.dispatch({ type: 'OPEN' }); });
      entry.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') store.dispatch({ type: 'OPEN' });
      });
    }

    // Close button
    var closeBtn = qs('[data-role="close-btn"]');
    if (closeBtn) closeBtn.addEventListener('click', function () { store.dispatch({ type: 'CLOSE' }); });

    // Overlay backdrop click
    var overlay = document.getElementById('calc-overlay');
    if (overlay) overlay.addEventListener('click', function (e) {
      if (e.target === overlay) store.dispatch({ type: 'CLOSE' });
    });

    // Esc key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && store.getState().isOpen) store.dispatch({ type: 'CLOSE' });
    });

    // Brand selection
    function bindBrand(role, brandVal) {
      var el = qs('[data-role="' + role + '"]');
      if (!el) return;
      function go() {
        store.dispatch({ type: 'SET_BRAND', brand: brandVal });
        store.dispatch({ type: 'GO_TO_STEP', step: 2 });
      }
      el.addEventListener('click', go);
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
    }
    bindBrand('brand-disney', 'disney');
    bindBrand('brand-universal', 'universal');

    // Back buttons (static nodes in the modal)
    var stateVisited = document.getElementById('state-visited');
    if (stateVisited) {
      var backToBrand = stateVisited.querySelector('.cback-bot');
      if (backToBrand) backToBrand.addEventListener('click', function () { store.dispatch({ type: 'GO_TO_STEP', step: 1 }); });
    }
    var stateTarget = document.getElementById('state-target');
    if (stateTarget) {
      var backToVisited = stateTarget.querySelector('.cback-bot');
      if (backToVisited) backToVisited.addEventListener('click', function () { store.dispatch({ type: 'GO_TO_STEP', step: 2 }); });
    }

    // Next → Target
    var nextBtn = qs('[data-role="next-to-target"]');
    if (nextBtn) nextBtn.addEventListener('click', function () {
      if (store.getState().visitedParkIds.length > 0) store.dispatch({ type: 'GO_TO_STEP', step: 3 });
    });

    // Calculate
    var calcBtn = qs('[data-role="calculate-btn"]');
    if (calcBtn) calcBtn.addEventListener('click', function () {
      if (store.getState().targetParkId) store.dispatch({ type: 'GO_TO_STEP', step: 4 });
    });

    // Mode toggle
    var modeToggle = qs('[data-role="mode-toggle"]');
    if (modeToggle) {
      function doModeToggle() {
        var state = store.getState();
        if (!state.targetParkId) return;
        var next = state.mode === 'weighted' ? 'strict' : 'weighted';
        store.dispatch({ type: 'SET_MODE', mode: next });
        // Recalculate inline (no loading flash)
        var newState = store.getState();
        var result = calculateOverlap(newState.visitedParkIds, newState.targetParkId, next);
        _lastResult = result;
        modeToggle.classList.toggle('mr', next === 'strict');
        var numEl = qs('[data-role="result-number"]');
        if (numEl) {
          var from = parseInt(numEl.textContent, 10) || 0;
          animateNumber(from, result.overlapPercent, 1200, numEl);
        }
        applyScoreColor(result.overlapPercent);
        var freshN = document.getElementById('fresh-n'), repeatN = document.getElementById('repeat-n');
        if (freshN) freshN.textContent = result.freshRides.length;
        if (repeatN) repeatN.textContent = result.exactRides.length + result.similarRides.length;
        renderRidesGrid(result, newState.resultView);
        renderRecommendations(newState, result);
        writeHash(newState);
      }
      modeToggle.addEventListener('click', doModeToggle);
      modeToggle.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') doModeToggle(); });
    }

    // Rides toggle
    var ridesToggle = qs('[data-role="rides-toggle"]');
    if (ridesToggle) {
      function doRidesToggle() {
        var state = store.getState();
        var next = state.resultView === 'fresh' ? 'repeat' : 'fresh';
        store.dispatch({ type: 'SET_RESULT_VIEW', view: next });
        ridesToggle.classList.toggle('sr', next === 'repeat');
        if (_lastResult) renderRidesGrid(_lastResult, next);
      }
      ridesToggle.addEventListener('click', doRidesToggle);
      ridesToggle.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') doRidesToggle(); });
    }

    // Reset
    var resetBtn = qs('[data-role="reset-btn"]');
    if (resetBtn) resetBtn.addEventListener('click', function () {
      store.dispatch({ type: 'RESET' });
    });

    // Edge states back buttons
    var edgeNodata = document.getElementById('state-edge-nodata');
    if (edgeNodata) {
      var backFromNodata = edgeNodata.querySelector('.cta-reset');
      if (backFromNodata) backFromNodata.addEventListener('click', function () { store.dispatch({ type: 'GO_TO_STEP', step: 3 }); });
    }
    var edgeConquered = document.getElementById('state-edge-conquered');
    if (edgeConquered) {
      var backFromConquered = edgeConquered.querySelector('.cta-reset');
      if (backFromConquered) backFromConquered.addEventListener('click', function () { store.dispatch({ type: 'RESET' }); });
    }

    // Copy link
    var copyBtn = document.querySelector('.cta-copy');
    if (copyBtn) copyBtn.addEventListener('click', function () {
      var url = location.href.split('#')[0] + location.hash;
      if (navigator.clipboard) navigator.clipboard.writeText(url).catch(function () {});
      var orig = copyBtn.textContent;
      copyBtn.textContent = '✓ Copied!';
      setTimeout(function () { copyBtn.textContent = orig; }, 2000);
    });

    // Hash change (deep linking)
    window.addEventListener('hashchange', function () { readHash(); });

    // Focus first element on open
    store.subscribe(function (state) {
      if (state.isOpen && (!_prevState || !_prevState.isOpen)) {
        setTimeout(function () {
          var first = document.querySelector('#calc-modal button:not([disabled])');
          if (first) first.focus();
        }, 50);
      }
    });

    // Mobile drag
    initDragClose();
  }

  /* ═══════════════════════════════════════════════════════════════
     PUBLIC API
  ═══════════════════════════════════════════════════════════════ */

  window.Calculator = {
    init: function () {
      store.subscribe(render);
      bindEvents();
      if (!readHash()) {
        render(store.getState());
      }
    },
    open:  function () { store.dispatch({ type: 'OPEN' }); },
    close: function () { store.dispatch({ type: 'CLOSE' }); },
    reset: function () { store.dispatch({ type: 'RESET' }); }
  };

}());
