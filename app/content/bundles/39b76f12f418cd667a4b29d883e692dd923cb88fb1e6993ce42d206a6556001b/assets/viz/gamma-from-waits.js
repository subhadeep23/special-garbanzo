/* Lesson 14: calls arrive Poisson at 2 per hour; T = the wait until the r-th call, a sum of r exponential waits:
   Gamma(shape r, rate 2). Pick r and the time t. The density's tail beyond t is shaded; its area P(T > t) equals the
   chance of fewer than r calls by time t, P(Poisson(2t) ≤ r − 1), computed here from the Poisson side. */
Viz.live("gamma-from-waits", (function () {
  var RATE = 2, L = 40, R = 570, BASE = 240, H = 190, TMAX = 5, FMAX = 2;
  var px = function (t) { return L + (t / TMAX) * (R - L); };
  var fact = function (n) { var f = 1; for (var i = 2; i <= n; i++) f *= i; return f; };
  var dens = function (r, t) { return Math.pow(RATE, r) * Math.pow(t, r - 1) * Math.exp(-RATE * t) / fact(r - 1); };
  var py = function (d) { return BASE - Math.min(d, FMAX) / FMAX * H; };
  function tail(r, t) { var s = 0, term = Math.exp(-RATE * t); for (var k = 0; k < r; k++) { s += term; term *= (RATE * t) / (k + 1); } return s; }
  var curve, shade, cursor;
  function curvePts(r) { var p = []; for (var i = 0; i <= 150; i++) { var t = (TMAX * i) / 150; p.push(px(t) + "," + py(dens(r, t))); } return p.join(" "); }
  function shadePath(r, t0) { var d = ["M" + px(t0) + " " + BASE]; for (var i = 0; i <= 100; i++) { var t = t0 + ((TMAX - t0) * i) / 100; d.push("L" + px(t) + " " + py(dens(r, t))); } d.push("L" + px(TMAX) + " " + BASE, "Z"); return d.join(" "); }
  var trim = function (v) { return String(Math.round(v * 1000) / 1000); };
  return {
    kicker: "Try it", title: "Waiting for the r-th call",
    viewBox: "0 0 600 280", label: "The density of the waiting time until the r-th call, with the area beyond time t shaded red",
    ledger: [{ name: "law", label: "Wait T", wide: true }, { name: "mean", label: "Mean r/λ (hours)" }, { name: "var", label: "Variance r/λ²" },
      { name: "tail", label: "P(T > t) = P(fewer than r calls by t)", wide: true }],
    initial: function () { return { r: 1, t: 1 }; },
    layout: function (s) { return { c: px(s.t) }; },
    build: function (svg) {
      shade = Viz.svg("path", { class: "v-target" }, svg);
      curve = Viz.svg("polyline", { class: "v-line" }, svg);
      Viz.svg("line", { class: "v-axis", x1: L, y1: BASE, x2: R, y2: BASE }, svg);
      [0, 1, 2, 3, 4, 5].forEach(function (t) { Viz.svg("text", { class: "v-small", x: px(t), y: 264 }, svg, t + " h"); });
      cursor = Viz.svg("line", { class: "v-cursor", y1: 30, y2: BASE }, svg);
    },
    draw: function (c) { cursor.setAttribute("x1", c.c); cursor.setAttribute("x2", c.c); },
    readouts: function (s) {
      return { law: "Gamma(shape " + s.r + ", rate 2): the wait for call number " + s.r, mean: trim(s.r / RATE), var: trim(s.r / (RATE * RATE)),
        tail: "t = " + s.t + " h: P(Poisson(" + RATE * s.t + ") ≤ " + (s.r - 1) + ") = " + tail(s.r, s.t).toFixed(4) };
    },
    say: function (s) {
      return "Waiting for call " + s.r + " at 2 calls an hour takes " + trim(s.r / RATE) + " h on average. It takes longer than " + s.t +
        " h exactly when fewer than " + s.r + " calls have come by then: chance " + tail(s.r, s.t).toFixed(4) + ".";
    },
    sync: function (s, box) {
      box.querySelectorAll("[data-viz-pick]").forEach(function (b) { b.setAttribute("aria-pressed", String(Number(b.getAttribute("data-viz-pick")) === s.r)); });
      var input = box.querySelector("[data-viz-input]"); if (Number(input.value) !== s.t) input.value = String(s.t);
      box.querySelector(".viz-label.t").textContent = "Time t = " + s.t + " hours";
      curve.setAttribute("points", curvePts(s.r)); shade.setAttribute("d", shadePath(s.r, s.t));
    },
    controls: function (box, api, el) {
      el("span", { class: "viz-label" }, box, "Wait for call number r");
      var row = el("div", { class: "viz-presets", role: "group", "aria-label": "Which call" }, box);
      [1, 2, 3, 5].forEach(function (r) {
        el("button", { type: "button", "data-viz-pick": String(r), "aria-pressed": "false" }, row, "r = " + r)
          .addEventListener("click", function () { api.set({ r: r, t: api.state().t }); });
      });
      el("span", { class: "viz-label t" }, box, "Time t = 1 hours");
      var input = el("input", { type: "range", min: "0.5", max: "3", step: "0.5", value: "1", "data-viz-input": "", "aria-label": "Time t in hours" }, box);
      input.addEventListener("input", function () { api.set({ r: api.state().r, t: Number(input.value) }); });
    },
    seconds: 0.35,
    predict: {
      prompt: "Guess first: wait for the 1st, then the 2nd, 3rd, 5th call. The peak of the waiting-time density…",
      options: ["moves right and spreads", "stays at time 0", "moves left and narrows"],
      verdict: function (i) {
        return i === 0 ? "You guessed it moves right and spreads. Correct: mean r/2 and variance r/4 both grow with r."
          : "You guessed it " + ["moves right and spreads", "stays at time 0", "moves left and narrows"][i] + ". It moves right and spreads: mean r/2 and variance r/4 both grow with r.";
      },
    },
  };
})());
