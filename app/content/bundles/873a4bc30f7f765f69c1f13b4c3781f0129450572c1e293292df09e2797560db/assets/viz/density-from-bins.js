/* Lesson 5: a histogram of the triangle density on [1, 5] (peak 1/2 at x = 3). Narrow the bins and watch the bar
   over (2, 2 + h] keep its height near f(2) = 1/4 while its probability shrinks to 0: density is probability per unit length. */
Viz.live("density-from-bins", (function () {
  var WIDTHS = { "2": [2, 1], "1": [1, 1], "1/2": [1, 2], "1/4": [1, 4], "1/10": [1, 10] }, MAXBARS = 40;
  var px = function (x) { return 40 + x * 90; }, py = function (d) { return 280 - d * 440; };
  // F(t) = (t - 1)^2 / 8 on [1, 3] and 1 - (5 - t)^2 / 8 on [3, 5], as exact fractions [numerator, denominator].
  function F(n, d) {
    if (n <= d) return [0, 1];
    if (n <= 3 * d) return [(n - d) * (n - d), 8 * d * d];
    if (n <= 5 * d) return [8 * d * d - (5 * d - n) * (5 * d - n), 8 * d * d];
    return [1, 1];
  }
  function minus(a, b) { return [a[0] * b[1] - b[0] * a[1], a[1] * b[1]]; }
  function strip(key) { // P(2 < X <= 2 + h) and the height P / h, exactly
    var h = WIDTHS[key], p = minus(F(2 * h[1] + h[0], h[1]), F(2, 1));
    return { p: p, ratio: [p[0] * h[1], p[1] * h[0]] };
  }
  var dec = function (f) { return (Math.round((f[0] * 10000) / f[1]) / 10000).toFixed(4); };
  var bars = [], red, curve, hLabel;
  function heights(key) {
    var h = WIDTHS[key], out = {};
    for (var i = 0; i < MAXBARS; i++) {
      var lo = F(h[1] + i * h[0], h[1]), hi = F(h[1] + (i + 1) * h[0], h[1]);
      var p = minus(hi, lo), inRange = (i + 1) * h[0] <= 4 * h[1];
      out["b" + i] = inRange ? (p[0] * h[1]) / (p[1] * h[0]) : 0;
    }
    out.h = h[0] / h[1]; out.r = (function (s) { return s.ratio[0] / s.ratio[1]; })(strip(key));
    return out;
  }
  return {
    kicker: "Try it", title: "Narrow the bins: probability shrinks, density stays",
    viewBox: "0 0 600 330", label: "A triangle-shaped density curve from 1 to 5 with a histogram under it; one red bar sits over the strip from 2 to 2 plus h",
    ledger: [{ name: "h", label: "Bin width h" }, { name: "p", label: "P(2 < X ≤ 2 + h)" },
      { name: "ratio", label: "Height = probability ÷ h" }, { name: "target", label: "Density at 2" }],
    initial: function () { return { h: "2" }; },
    layout: function (s) { return heights(s.h); },
    build: function (svg) {
      Viz.svg("line", { class: "v-axis", x1: 30, y1: 280, x2: 590, y2: 280 }, svg);
      [1, 2, 3, 4, 5].forEach(function (x) { Viz.svg("text", { class: "v-small", x: px(x), y: 302 }, svg, String(x)); });
      [[0.25, "1/4"], [0.5, "1/2"]].forEach(function (t) {
        Viz.svg("line", { class: "v-axis", x1: 34, y1: py(t[0]), x2: 46, y2: py(t[0]) }, svg);
        Viz.svg("text", { class: "v-note", x: 30, y: py(t[0]) }, svg, t[1]);
      });
      for (var i = 0; i < MAXBARS; i++) bars.push(Viz.svg("rect", { class: "v-kept" }, svg));
      red = Viz.svg("rect", { class: "v-target" }, svg);
      curve = Viz.svg("polyline", { class: "v-line", points: [px(0.6), py(0), px(1), py(0), px(3), py(0.5), px(5), py(0), px(5.6), py(0)].join(" ") }, svg);
      hLabel = Viz.svg("text", { class: "v-label", x: 470, y: 50 }, svg);
    },
    draw: function (c) {
      for (var i = 0; i < MAXBARS; i++) {
        var x0 = 1 + i * c.h, ok = x0 + c.h <= 5.0001;
        bars[i].setAttribute("x", px(x0)); bars[i].setAttribute("width", ok ? Math.max(0, c.h * 90 - 1) : 0);
        bars[i].setAttribute("y", py(c["b" + i])); bars[i].setAttribute("height", ok ? 280 - py(c["b" + i]) : 0);
      }
      red.setAttribute("x", px(2)); red.setAttribute("width", c.h * 90);
      red.setAttribute("y", py(c.r)); red.setAttribute("height", 280 - py(c.r));
      hLabel.textContent = "h = " + (Math.round(c.h * 100) / 100);
      curve.parentNode.appendChild(curve);
    },
    readouts: function (s) {
      var t = strip(s.h);
      return { h: s.h, p: dec(t.p), ratio: dec(t.ratio), target: "f(2) = 0.2500" };
    },
    say: function (s) {
      var t = strip(s.h);
      return "Bins of width " + s.h + ". The red bar covers 2 to 2 + " + s.h + "; it holds probability " + dec(t.p) +
        ", so its height is " + dec(t.p) + " ÷ " + s.h + " = " + dec(t.ratio) + ". " +
        (s.h === "1/10" ? "The probability is nearly gone, but the height has settled near the curve's value, 1/4." : "Narrow the bins and watch both numbers.");
    },
    controls: function (box, api, el) {
      el("span", { class: "viz-label" }, box, "Bin width");
      var row = el("div", { class: "viz-presets", role: "group", "aria-label": "Bin width" }, box);
      ["2", "1", "1/2", "1/4", "1/10"].forEach(function (k) {
        el("button", { type: "button", "data-viz-pick": k, "aria-pressed": "false" }, row, "h = " + k)
          .addEventListener("click", function () { api.set({ h: k }); });
      });
    },
    sync: function (s, box) {
      box.querySelectorAll("[data-viz-pick]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-viz-pick") === s.h)); });
    },
    seconds: 0.7,
    predict: {
      prompt: "Guess first: as the bins get narrower, what happens to the probability in the red strip?",
      options: ["it shrinks toward 0", "it settles at 1/4", "it stays the same"],
      verdict: function (i) {
        return i === 0 ? "You guessed it shrinks toward 0. Correct: the height settles at 1/4, not the probability."
          : "You guessed " + ["it shrinks toward 0", "it settles at 1/4", "it stays the same"][i] + ". The probability shrinks toward 0; the height settles at 1/4.";
      },
    },
  };
})());
