/* Lesson 4, Go deeper (ISI M.Stat 2023 PSB Q3: F(x) = F(x^2023)). The power is swapped for 3 so the hops are
   visible. Pick a start, press "Cube it" again and again: each press adds one more equal height to the chain,
   and where the chain heads decides what F must be at the start. Settled stretches turn green; once all four
   are green, F is flat everywhere except at −1, 0 and 1. Arithmetic is exact (integer pairs). */
Viz.live("power-hops", (function () {
  var STARTS = { "-2": [-2, 1], "-1/2": [-1, 2], "1/2": [1, 2], "1": [1, 1], "2": [2, 1] };
  var ORDER = ["-2", "-1/2", "1/2", "1", "2"];
  var MAX = 3, Y = 150, MID = 300, U = 78, EDGE = 3.5;
  var ZONES = [
    { id: "left", from: -EDGE, to: -1, label: "F = 0" },
    { id: "negmid", from: -1, to: 0, label: "F(0−)" },
    { id: "posmid", from: 0, to: 1, label: "F(0)" },
    { id: "right", from: 1, to: EDGE, label: "F = 1" },
  ];
  var trail = [], dot, off, zoneRects = [], zoneText = [], halos = [], offText = "", offSide = 0;
  var px = function (v) { return MID + Math.max(-EDGE, Math.min(EDGE, v)) * U; };
  var commas = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); };
  function show(v) {
    var s = (v[0] < 0 ? "−" : "") + commas(Math.abs(v[0]));
    return v[1] === 1 ? s : s + "/" + commas(v[1]);
  }
  var cube = function (v) { return [v[0] * v[0] * v[0], v[1] * v[1] * v[1]]; };
  function chain(s) { var out = [STARTS[s.start]]; for (var i = 0; i < s.hops; i++) out.push(cube(out[i])); return out; }
  function zone(v) {
    if (v[0] === 0 || Math.abs(v[0]) === v[1]) return "fixed";            // 0, 1 or −1: cubing leaves it in place
    if (v[0] > v[1]) return "right";
    if (v[0] < -v[1]) return "left";
    return v[0] > 0 ? "posmid" : "negmid";
  }
  var HEAD = {
    right: "far right, where F climbs to 1", left: "far left, where F sinks to 0",
    posmid: "0 from the right: the filled dot F(0)", negmid: "0 from the left: the hollow dot F(0−)",
    fixed: "nowhere: cubing leaves it in place",
  };
  var SO = { right: " = 1", left: " = 0", posmid: " = F(0)", negmid: " = F(0−)" };
  function settledText(n) { return n === 4 ? "4 of 4: F is flat except at −1, 0, 1" : n + " of 4"; }
  return {
    kicker: "Try it", title: "Cube it again and again: where does the chain go?",
    viewBox: "0 0 600 240",
    label: "A number line from −3 to 3. A dot starts at the chosen number and hops each time it is cubed; stretches whose height is settled turn green",
    ledger: [{ name: "now", label: "Number now" }, { name: "settled", label: "Stretches settled" },
      { name: "equal", label: "Heights that must be equal", wide: true },
      { name: "heading", label: "The chain heads to", wide: true }, { name: "so", label: "So", wide: true }],
    initial: function () { return { start: "2", hops: 0, settled: [] }; },
    layout: function (s) {
      var c = chain(s), last = c[c.length - 1], out = {}, lastV = last[0] / last[1];
      for (var i = 0; i <= MAX; i++) {
        var v = c[Math.min(i, c.length - 1)];
        out["x" + i] = px(v[0] / v[1]); out["o" + i] = i < c.length - 1 ? 1 : 0;
      }
      out.cx = px(lastV);
      ZONES.forEach(function (z, k) { out["z" + k] = s.settled.indexOf(z.id) >= 0 ? 1 : 0; });
      out.j = s.settled.length === 4 ? 1 : 0;
      out.off = Math.abs(lastV) > EDGE ? 1 : 0;
      offSide = lastV > 0 ? 1 : -1;
      offText = offSide > 0 ? show(last) + " →" : "← " + show(last);
      return out;
    },
    build: function (svg) {
      ZONES.forEach(function (z) {
        zoneRects.push(Viz.svg("rect", { class: "v-answer", x: px(z.from), y: Y - 78, width: px(z.to) - px(z.from), height: 56, rx: 8 }, svg));
        zoneText.push(Viz.svg("text", { class: "v-small", x: (px(z.from) + px(z.to)) / 2, y: Y - 50 }, svg, z.label));
      });
      Viz.svg("line", { class: "v-axis", x1: 14, y1: Y, x2: 586, y2: Y }, svg);
      for (var t = -3; t <= 3; t++) {
        Viz.svg("line", { class: "v-axis", x1: px(t), y1: Y - 7, x2: px(t), y2: Y + 7 }, svg);
        Viz.svg("text", { class: "v-small", x: px(t), y: Y + 28 }, svg, t < 0 ? "−" + -t : String(t));
      }
      [-1, 0, 1].forEach(function (p) {
        halos.push(Viz.svg("circle", { class: "v-halo", cx: px(p), cy: Y, r: 15 }, svg));
        Viz.svg("circle", { class: "v-face", cx: px(p), cy: Y, r: 5 }, svg);
      });
      for (var i = 0; i <= MAX; i++) trail.push(Viz.svg("circle", { class: "v-blue", cy: Y, r: 7 }, svg));
      dot = Viz.svg("circle", { class: "v-dot", cy: Y, r: 11 }, svg);
      off = Viz.svg("text", { class: "v-label", y: Y + 66 }, svg);
    },
    draw: function (c) {
      for (var i = 0; i <= 3; i++) { trail[i].setAttribute("cx", c["x" + i]); trail[i].setAttribute("opacity", c["o" + i]); }
      dot.setAttribute("cx", c.cx);
      zoneRects.forEach(function (r, k) { r.setAttribute("opacity", c["z" + k]); zoneText[k].setAttribute("opacity", c["z" + k]); });
      halos.forEach(function (h) { h.setAttribute("opacity", c.j); });
      off.textContent = offText;
      off.setAttribute("x", offSide > 0 ? 470 : 130);
      off.setAttribute("opacity", c.off);
    },
    readouts: function (s) {
      var c = chain(s), last = c[c.length - 1], z = zone(c[0]), start = show(c[0]);
      var equal = z === "fixed" ? "F(" + start + "): cubing " + start + " gives " + start + " again"
        : c.map(function (v) { return "F(" + show(v) + ")"; }).join(" = ");
      var ready = s.hops >= 2;
      return {
        now: show(last), equal: equal, settled: settledText(s.settled.length),
        heading: ready ? HEAD[z] : s.hops === 0 ? "press Cube it to start" : "cube again to see",
        so: !ready ? "—" : z === "fixed" ? "no rule: F may jump at " + start : "F(" + start + ")" + SO[z],
      };
    },
    say: function (s) {
      var c = chain(s), z = zone(c[0]), start = show(c[0]);
      if (s.hops === 0) return "Start at " + start + ". The rule says F(" + start + ") = F(" + start + "³). Press Cube it to take that step.";
      if (s.hops === 1) return "One step: F(" + start + ") = F(" + show(c[1]) + "). Now use the same rule on " + show(c[1]) + ".";
      if (z === "fixed") return start + " cubed is " + start + ", so the chain never moves and forces nothing. F is free to jump here.";
      var tail = { right: "The chain runs off to the right, where F climbs to 1.", left: "The chain runs off to the left, where F sinks to 0.",
        posmid: "The chain creeps down to 0 from the right, so the heights settle on the filled dot, F(0).",
        negmid: "The chain creeps up to 0 from the left, so the heights settle on the hollow dot, F(0−)." }[z];
      return tail + " Every height in the chain is equal, so F(" + start + ")" + SO[z] + ".";
    },
    controls: function (box, api, el) {
      el("span", { class: "viz-label" }, box, "Start at:");
      var row = el("div", { class: "viz-faces" }, box);
      ORDER.forEach(function (key) {
        var b = el("button", { type: "button", "data-viz-pick": key, "aria-pressed": "false" }, row, key.replace("-", "−"));
        b.addEventListener("click", function () { api.set({ start: key, hops: 0, settled: api.state().settled }); });
      });
      var go = el("button", { type: "button", "data-viz-pick": "cube", class: "primary" }, box, "Cube it");
      go.addEventListener("click", function () {
        var s = api.state(); if (s.hops >= MAX) return;
        var hops = s.hops + 1, z = zone(STARTS[s.start]), settled = s.settled.slice();
        if (hops >= 2 && z !== "fixed" && settled.indexOf(z) < 0) settled.push(z);
        api.set({ start: s.start, hops: hops, settled: settled });
      });
    },
    sync: function (s, box) {
      box.querySelectorAll(".viz-faces button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-viz-pick") === s.start)); });
      box.querySelector('[data-viz-pick="cube"]').disabled = s.hops >= MAX;
    },
    seconds: 0.7,
    predict: {
      prompt: "Guess first: start at 1/2 and keep cubing. Where does the number go?",
      options: ["toward 0", "toward 1", "off to the right"],
      verdict: function (i) {
        var said = ["toward 0", "toward 1", "off to the right"][i];
        return i === 0 ? "You guessed toward 0. Correct: 1/2, 1/8, 1/512 shrink, because cubing a number between 0 and 1 makes it smaller."
          : "You guessed " + said + ". It goes toward 0: 1/2, 1/8, 1/512 shrink, because cubing a number between 0 and 1 makes it smaller.";
      },
    },
  };
})());
