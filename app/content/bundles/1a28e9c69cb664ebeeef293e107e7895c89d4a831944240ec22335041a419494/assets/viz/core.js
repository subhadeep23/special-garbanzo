/* Shared engine for the animated diagrams in every lesson. Requires gsap.min.js first; each scene file
   (assets/viz/<scene>.js) calls Viz.stepped(...) or Viz.live(...) for its <figure data-viz="id">.

   A scene describes pictures, not motion: layout(state) returns flat numeric targets, and draw(cur) paints
   them. The engine tweens between the targets with GSAP, marks data-busy="1" while it moves, and jumps
   straight to the end under prefers-reduced-motion. Readouts are HTML ([data-readout]) so they stay
   readable at any text size. Colour meaning is the same everywhere (see viz.css). */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var reduce = function () { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; };

  function el(tag, attrs, parent, text) {
    var node = document.createElement(tag);
    for (var key in attrs || {}) node.setAttribute(key, attrs[key]);
    if (text !== undefined) node.textContent = text;
    if (parent) parent.appendChild(node);
    return node;
  }
  function svg(tag, attrs, parent, text) {
    var node = document.createElementNS(NS, tag);
    for (var key in attrs || {}) node.setAttribute(key, attrs[key]);
    if (text !== undefined) node.textContent = text;
    if (parent) parent.appendChild(node);
    return node;
  }

  /* Builds the common frame: stage (svg), readout ledger, caption, then controls. Returns handles. */
  function frame(figure, opts) {
    figure.classList.add("viz");
    var text = figure.querySelector(".viz-text");
    var head = el("div", { class: "viz-head" });
    el("span", { class: "viz-kicker" }, head, opts.kicker || "Animation");
    if (opts.title) el("span", { class: "viz-title" }, head, opts.title);
    figure.insertBefore(head, figure.firstChild);
    var stage = el("div", { class: "viz-stage" });
    figure.insertBefore(stage, text);
    var picture = svg("svg", { viewBox: opts.viewBox, role: "img", "aria-label": opts.label, preserveAspectRatio: "xMidYMid meet" }, stage);
    var ledger = el("dl", { class: "viz-ledger" });
    var readouts = {};
    (opts.ledger || []).forEach(function (row) {
      var item = el("div", { class: "viz-row" + (row.wide ? " wide" : "") }, ledger);
      el("dt", {}, item, row.label);
      readouts[row.name] = el("dd", { "data-readout": row.name }, item);
    });
    figure.insertBefore(ledger, text);
    var say = el("p", { class: "viz-say", "aria-live": "polite" });
    figure.insertBefore(say, text);
    return { stage: stage, svg: picture, readouts: readouts, say: say, text: text };
  }

  function setReadouts(handles, values) {
    for (var name in values) if (handles.readouts[name]) handles.readouts[name].textContent = values[name];
  }

  /* One tween per figure; a new request replaces the one in flight. */
  function mover(figure, cur, draw) {
    var tween = null;
    return function (target, seconds) {
      if (tween) tween.kill();
      if (reduce() || !window.gsap) {
        Object.assign(cur, target); draw(cur);
        figure.removeAttribute("data-busy");
        return;
      }
      figure.setAttribute("data-busy", "1");
      var vars = Object.assign({}, target, {
        duration: seconds === undefined ? 0.85 : seconds, ease: "power2.inOut",
        onUpdate: function () { draw(cur); },
        onComplete: function () { tween = null; Object.assign(cur, target); draw(cur); figure.removeAttribute("data-busy"); },
      });
      tween = window.gsap.to(cur, vars);
    };
  }

  function predictor(figure, spec, onChoose) {
    var row = el("div", { class: "viz-predict", role: "group", "aria-label": "Your prediction" });
    el("span", { class: "viz-predict-q" }, row, spec.prompt);
    var buttons = spec.options.map(function (option, index) {
      var b = el("button", { type: "button", "data-viz-predict": String(index), "aria-pressed": "false" }, row, option);
      b.addEventListener("click", function () {
        buttons.forEach(function (other, j) { other.setAttribute("aria-pressed", String(j === index)); });
        onChoose(index);
      });
      return b;
    });
    return row;
  }

  /* Stepped scene: Back / Next / Replay over a fixed list of pictures. */
  function stepped(id, scene) {
    var figure = document.querySelector('figure[data-viz="' + id + '"]');
    if (!figure) return;
    var h = frame(figure, scene);
    var cur = Object.assign({}, scene.layout(0));
    scene.build(h.svg, h);
    scene.draw(cur);
    var move = mover(figure, cur, scene.draw);
    var step = 0, choice = null, n = scene.steps;
    var verdict = null;
    if (scene.predict) {
      figure.insertBefore(predictor(figure, scene.predict, function (index) { choice = index; show(false); }), h.stage);
      var item = el("div", { class: "viz-row wide verdict" }, figure.querySelector(".viz-ledger"));
      el("dt", {}, item, "Your prediction");
      verdict = el("dd", { "data-readout": "verdict" }, item);
    }
    var controls = el("div", { class: "viz-controls" });
    var prev = el("button", { type: "button", "data-viz-prev": "" }, controls, "Back");
    var next = el("button", { type: "button", "data-viz-next": "", class: "primary" }, controls, "Next");
    var replay = el("button", { type: "button", "data-viz-replay": "" }, controls, "Replay");
    var count = el("span", { class: "viz-count", "aria-hidden": "true" }, controls);
    figure.insertBefore(controls, h.text);

    function show(animate) {
      figure.setAttribute("data-step", String(step));
      setReadouts(h, scene.readouts(step));
      h.say.textContent = scene.say[step];
      count.textContent = "Step " + (step + 1) + " of " + n;
      prev.disabled = step === 0; next.disabled = step === n - 1;
      if (verdict) verdict.textContent = choice !== null && step >= scene.predict.reveal ? scene.predict.verdict(choice) : "";
      if (animate) move(scene.layout(step));
    }
    function go(to) { to = Math.max(0, Math.min(n - 1, to)); if (to === step) return; step = to; show(true); }
    prev.addEventListener("click", function () { go(step - 1); });
    next.addEventListener("click", function () { go(step + 1); });
    var timers = [];
    replay.addEventListener("click", function () {
      timers.forEach(clearTimeout); timers = [];
      step = 0; Object.assign(cur, scene.layout(0)); scene.draw(cur); show(false);
      if (reduce()) return;
      for (var s = 1; s < n; s++) timers.push(setTimeout(go.bind(null, s), s * 1600));
    });
    show(false);
  }

  /* Live scene: the learner changes a value (buttons or a slider) and the picture follows. */
  function live(id, scene) {
    var figure = document.querySelector('figure[data-viz="' + id + '"]');
    if (!figure) return;
    var h = frame(figure, scene);
    var state = scene.initial();
    var cur = Object.assign({}, scene.layout(state));
    scene.build(h.svg, h);
    scene.draw(cur);
    var move = mover(figure, cur, scene.draw);
    var api = {
      state: function () { return state; },
      set: function (next) { state = next; render(true); },
    };
    var controls = el("div", { class: "viz-controls live" });
    figure.insertBefore(controls, h.text);
    if (scene.controls) scene.controls(controls, api, el);
    var verdict = null, choice = null;
    if (scene.predict) {
      figure.insertBefore(predictor(figure, scene.predict, function (index) { choice = index; render(false); }), h.stage);
      var item = el("div", { class: "viz-row wide verdict" }, figure.querySelector(".viz-ledger"));
      el("dt", {}, item, "Your guess");
      verdict = el("dd", { "data-readout": "verdict" }, item);
    }
    function render(animate) {
      setReadouts(h, scene.readouts(state));
      h.say.textContent = scene.say(state);
      if (verdict) verdict.textContent = choice !== null ? scene.predict.verdict(choice) : "";
      if (scene.sync) scene.sync(state, controls);
      if (animate) move(scene.layout(state), scene.seconds);
    }
    render(false);
  }

  /* A die face: rounded square with pips, drawn at (0,0) inside group g. */
  var PIPS = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
    5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
  function die(g, value, size, target) {
    svg("rect", { class: "v-face" + (target ? " target" : ""), x: 0, y: 0, width: size, height: size, rx: size * 0.16 }, g);
    PIPS[value].forEach(function (p) {
      svg("circle", { class: "v-pip", cx: size / 2 + p[0] * size * 0.27, cy: size / 2 + p[1] * size * 0.27, r: size * 0.088 }, g);
    });
    return g;
  }

  window.Viz = { stepped: stepped, live: live, svg: svg, el: el, die: die };
})();
