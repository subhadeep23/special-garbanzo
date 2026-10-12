/* Lesson 11: M(t) = E[e^(tX)] for three distributions that all have mean 2: Bin(4, 1/2), Poisson(2) and the
   geometric wait with p = 1/2 (trials). Move the point t₀: the tangent's slope is M′(t₀). At t₀ = 0 every curve passes
   through 1 with slope 2 = E[X]; away from 0 the curves part, because the distributions differ. */
Viz.live("mgf-tangent", (function () {
  var T0 = -1, T1 = 0.6, L = 50, R = 570, BASE = 270, TOP = 20, YMAX = 3.5;
  var LAWS = {
    bin: { name: "Bin(4, 1/2)", M: function (t) { return Math.pow((1 + Math.exp(t)) / 2, 4); }, D: function (t) { return 2 * Math.exp(t) * Math.pow((1 + Math.exp(t)) / 2, 3); }, formula: "((1 + e^t)/2)^4" },
    poi: { name: "Poisson(2)", M: function (t) { return Math.exp(2 * (Math.exp(t) - 1)); }, D: function (t) { return 2 * Math.exp(t) * Math.exp(2 * (Math.exp(t) - 1)); }, formula: "e^(2(e^t − 1))" },
    geo: { name: "Geometric, p = 1/2", M: function (t) { return Math.exp(t) / (2 - Math.exp(t)); }, D: function (t) { return 2 * Math.exp(t) / Math.pow(2 - Math.exp(t), 2); }, formula: "e^t/(2 − e^t)" },
  };
  var KEYS = ["bin", "poi", "geo"];
  var px = function (t) { return L + ((t - T0) / (T1 - T0)) * (R - L); };
  var py = function (m) { return BASE - (Math.min(m, YMAX) / YMAX) * (BASE - TOP); };
  var curves = {}, tangent, dot;
  var four = function (v) { return (Math.round(v * 10000) / 10000).toFixed(4); };
  return {
    kicker: "Try it", title: "Three barcodes, one slope at zero",
    viewBox: "0 0 600 300", label: "Three moment generating function curves plotted for t from minus 1 to 0.6, all passing through height 1 at t = 0; a tangent line touches the chosen curve at t zero",
    ledger: [{ name: "law", label: "Distribution (mean 2)" }, { name: "formula", label: "M(t)" }, { name: "t0", label: "t₀" },
      { name: "m", label: "M(t₀)" }, { name: "slope", label: "Slope M′(t₀)" }],
    initial: function () { return { law: "poi", t: 0 }; },
    layout: function (s) {
      var f = LAWS[s.law], m = f.M(s.t), d = f.D(s.t);
      return { x: px(s.t), y: py(m), ax: px(s.t - 0.3), ay: py(m - 0.3 * d), bx: px(s.t + 0.3), by: py(m + 0.3 * d) };
    },
    build: function (svg) {
      Viz.svg("line", { class: "v-axis", x1: L, y1: BASE, x2: R, y2: BASE }, svg);
      Viz.svg("line", { class: "v-axis", x1: px(0), y1: TOP, x2: px(0), y2: BASE }, svg);
      [-1, -0.5, 0, 0.5].forEach(function (t) { Viz.svg("text", { class: "v-small", x: px(t), y: 292 }, svg, t < 0 ? "−" + -t : String(t)); });
      [1, 2, 3].forEach(function (m) { Viz.svg("text", { class: "v-note", x: L - 8, y: py(m) }, svg, String(m)); Viz.svg("line", { class: "v-axis", x1: L - 4, y1: py(m), x2: L + 4, y2: py(m) }, svg); });
      KEYS.forEach(function (k) {
        var pts = [];
        for (var i = 0; i <= 120; i++) { var t = T0 + ((T1 - T0) * i) / 120; if (k !== "geo" || t < 0.68) pts.push(px(t) + "," + py(LAWS[k].M(t))); }
        curves[k] = Viz.svg("polyline", { class: "v-line", points: pts.join(" ") }, svg);
      });
      tangent = Viz.svg("line", { class: "v-cursor" }, svg);
      dot = Viz.svg("circle", { class: "v-dot", r: 8 }, svg);
    },
    draw: function (c) {
      tangent.setAttribute("x1", c.ax); tangent.setAttribute("y1", c.ay); tangent.setAttribute("x2", c.bx); tangent.setAttribute("y2", c.by);
      dot.setAttribute("cx", c.x); dot.setAttribute("cy", c.y);
    },
    readouts: function (s) {
      var f = LAWS[s.law];
      return { law: f.name, formula: f.formula, t0: s.t === 0 ? "0" : (s.t < 0 ? "−" + (-s.t).toFixed(2) : s.t.toFixed(2)), m: four(f.M(s.t)), slope: four(f.D(s.t)) };
    },
    say: function (s) {
      if (s.t === 0) return LAWS[s.law].name + ": at t = 0 the curve passes through M(0) = 1 with slope M′(0) = 2, the mean. All three curves share this point and this slope.";
      return "At t₀ = " + (s.t < 0 ? "−" + (-s.t).toFixed(2) : s.t.toFixed(2)) + " the three curves have parted: same mean, different distributions, different barcodes.";
    },
    controls: function (box, api, el) {
      el("span", { class: "viz-label" }, box, "Distribution");
      var row = el("div", { class: "viz-presets", role: "group", "aria-label": "Distribution" }, box);
      [["bin", "Bin(4, ½)"], ["poi", "Poisson(2)"], ["geo", "Geometric ½"]].forEach(function (k) {
        el("button", { type: "button", "data-viz-pick": k[0], "aria-pressed": "false" }, row, k[1])
          .addEventListener("click", function () { api.set({ law: k[0], t: api.state().t }); });
      });
      el("span", { class: "viz-label" }, box, "Tangent point t₀");
      var input = el("input", { type: "range", min: "-1", max: "0.5", step: "0.25", value: "0", "data-viz-input": "", "aria-label": "Tangent point t zero" }, box);
      input.addEventListener("input", function () { api.set({ law: api.state().law, t: Number(input.value) }); });
    },
    sync: function (s, box) {
      box.querySelectorAll("[data-viz-pick]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-viz-pick") === s.law)); });
      var input = box.querySelector("[data-viz-input]"); if (Number(input.value) !== s.t) input.value = String(s.t);
      KEYS.forEach(function (k) { curves[k].setAttribute("opacity", k === s.law ? 1 : 0.28); });
    },
    seconds: 0.5,
    predict: {
      prompt: "Guess first: all three distributions have mean 2. At t = 0, their curves…",
      options: ["share one point and slope", "have three different slopes", "never touch each other"],
      verdict: function (i) {
        return i === 0 ? "You guessed they share one point and slope. Correct: M(0) = 1 always, and M′(0) = E[X] = 2 for all three."
          : "You guessed they " + ["share one point and slope", "have three different slopes", "never touch each other"][i] + ". They share M(0) = 1 and slope M′(0) = E[X] = 2.";
      },
    },
  };
})());
