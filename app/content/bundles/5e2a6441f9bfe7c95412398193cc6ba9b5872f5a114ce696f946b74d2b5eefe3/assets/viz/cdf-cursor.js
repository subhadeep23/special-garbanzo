/* Lesson 4: walk a cursor along the staircase F(x) = P(X <= x) for the number of heads in three tosses. */
Viz.live("cdf-cursor", (function () {
  var COUNTS = [1, 3, 3, 1], X0 = 70, U = 100, Y0 = 300, H = 256, cursor, dot, hole, jump, xLabel;
  var px = function (x) { return X0 + (x + 1) * U; }, py = function (f) { return Y0 - f * H; };
  var atMost = function (x) { return COUNTS.reduce(function (s, c, h) { return s + (h <= x ? c : 0); }, 0); };
  var below = function (x) { return COUNTS.reduce(function (s, c, h) { return s + (h < x ? c : 0); }, 0); };
  var eighths = function (n) { return n === 0 ? "0" : n === 8 ? "1" : n + "/8"; };
  return {
    kicker: "Drag the cursor", title: "The staircase F(x) = P(X ≤ x)",
    viewBox: "0 0 600 340", label: "A staircase graph rising from 0 to 1 in jumps at 0, 1, 2 and 3, with a movable vertical cursor",
    ledger: [{ name: "x", label: "x" }, { name: "F", label: "P(X ≤ x) = F(x)" }, { name: "Fminus", label: "P(X < x) = F(x−)" }, { name: "jump", label: "P(X = x), the jump" }],
    initial: function () { return { x: 1 }; },
    layout: function (s) { return { cx: s.x, f: atMost(s.x) / 8, fm: below(s.x) / 8 }; },
    build: function (svg) {
      Viz.svg("line", { class: "v-axis", x1: 40, y1: Y0, x2: 590, y2: Y0 }, svg);
      Viz.svg("line", { class: "v-axis", x1: px(0), y1: Y0 + 6, x2: px(0), y2: 40 }, svg);
      [0, 1, 2, 3].forEach(function (h) { Viz.svg("text", { class: "v-small", x: px(h), y: Y0 + 22 }, svg, String(h)); });
      [[1 / 8, "1/8"], [4 / 8, "4/8"], [7 / 8, "7/8"], [1, "1"]].forEach(function (t) {
        Viz.svg("text", { class: "v-note", x: px(0) - 10, y: py(t[0]) }, svg, t[1]);
      });
      var level = 0;
      for (var h = -1; h <= 3; h++) {
        var f = h < 0 ? 0 : atMost(h) / 8;
        Viz.svg("line", { class: "v-line", x1: h < 0 ? 40 : px(h), y1: py(f), x2: h === 3 ? 590 : px(h + 1), y2: py(f) }, svg);
        if (h >= 0) {
          Viz.svg("circle", { class: "v-face", cx: px(h), cy: py(level), r: 5.5 }, svg);
          Viz.svg("circle", { class: "v-blue", cx: px(h), cy: py(f), r: 6 }, svg);
        }
        level = f;
      }
      jump = Viz.svg("line", { class: "v-jump" }, svg);
      cursor = Viz.svg("line", { class: "v-cursor", y1: 36, y2: Y0 }, svg);
      hole = Viz.svg("circle", { class: "v-hole", r: 9 }, svg);
      dot = Viz.svg("circle", { class: "v-dot", r: 9 }, svg);
      xLabel = Viz.svg("text", { class: "v-label", y: 22 }, svg);
    },
    draw: function (c) {
      var x = px(c.cx);
      cursor.setAttribute("x1", x); cursor.setAttribute("x2", x);
      dot.setAttribute("cx", x); dot.setAttribute("cy", py(c.f));
      hole.setAttribute("cx", x); hole.setAttribute("cy", py(c.fm));
      var gap = Math.abs(c.f - c.fm) > 0.001;
      hole.setAttribute("opacity", gap ? 1 : 0);
      jump.setAttribute("x1", x); jump.setAttribute("x2", x); jump.setAttribute("y1", py(c.fm)); jump.setAttribute("y2", py(c.f));
      jump.setAttribute("opacity", gap ? 1 : 0);
      xLabel.setAttribute("x", Math.min(560, Math.max(40, x)));
      xLabel.textContent = "x = " + (Math.round(c.cx * 100) / 100);
    },
    readouts: function (s) {
      return { x: String(s.x), F: eighths(atMost(s.x)), Fminus: eighths(below(s.x)), jump: eighths(atMost(s.x) - below(s.x)) };
    },
    say: function (s) {
      var a = atMost(s.x), b = below(s.x);
      if (a !== b) return "At x = " + s.x + " there is a jump. “At most " + s.x + "” already includes X = " + s.x + ", so F takes the upper (filled) dot: " + eighths(a) + ". “Less than " + s.x + "” stops just before the jump: " + eighths(b) + ". The jump itself, " + eighths(a - b) + ", is P(X = " + s.x + ").";
      return "At x = " + s.x + " the staircase is flat, so “at most x” and “less than x” agree: " + eighths(a) + ". X never equals a value where there is no jump, so P(X = " + s.x + ") = 0.";
    },
    controls: function (box, api, el) {
      var input = el("input", { type: "range", min: "-1", max: "4", step: "0.25", value: "1", "data-viz-input": "", "aria-label": "Cursor position x" }, box);
      input.addEventListener("input", function () { api.set({ x: Number(input.value) }); });
      var walk = el("button", { type: "button", "data-viz-walk": "" }, box, "Walk it");
      walk.addEventListener("click", function () {
        var stops = [-0.5, 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5], k = 0;
        var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduce) { api.set({ x: 3 }); return; }
        (function next() { if (k < stops.length) { api.set({ x: stops[k++] }); setTimeout(next, 1100); } })();
      });
    },
    sync: function (s, box) { var input = box.querySelector("[data-viz-input]"); if (Number(input.value) !== s.x) input.value = String(s.x); },
    seconds: 0.45,
  };
})());
