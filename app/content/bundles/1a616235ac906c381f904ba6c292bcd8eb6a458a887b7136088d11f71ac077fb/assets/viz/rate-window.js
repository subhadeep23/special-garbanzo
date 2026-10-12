/* Lesson 9: calls arrive at 3 per hour. The window changes (60, 30, 120, 10 minutes) and λ changes with it, in
   proportion to the window's length. One illustrative two-hour record of calls is drawn as ticks; the readouts
   give λ, P(no call) = e^(−λ) and P(at least one) for the window. */
Viz.stepped("rate-window", (function () {
  var WINDOWS = [60, 30, 120, 10], CALLS = [8, 23, 51, 70, 88, 112], RATE = 3;
  var L = 40, R = 560, px = function (m) { return L + (m / 120) * (R - L); };
  var box, ticks = [];
  var lam = function (step) { return (RATE * WINDOWS[step]) / 60; };
  var four = function (v) { return v.toFixed(4); };
  return {
    kicker: "Step through it", title: "Same rate, different window",
    viewBox: "0 0 600 250", label: "A two-hour timeline with six call times marked, and a shaded window starting at 0 whose length changes",
    steps: 4,
    layout: function (step) { return { w: px(WINDOWS[step]) - L }; },
    ledger: [{ name: "window", label: "Window" }, { name: "lam", label: "λ = rate × length" }, { name: "seen", label: "Calls in this record's window" },
      { name: "p0", label: "P(no call) = e^(−λ)" }, { name: "p1", label: "P(at least one)" }],
    readouts: function (step) {
      var l = lam(step), w = WINDOWS[step];
      return { window: w + " minutes", lam: String(l), seen: String(CALLS.filter(function (t) { return t <= w; }).length),
        p0: four(Math.exp(-l)), p1: four(1 - Math.exp(-l)) };
    },
    say: [
      "Calls arrive at 3 per hour. In a one-hour window the count is Poisson with λ = 3. This particular hour had 3 calls; another hour might have 1 or 6.",
      "Halve the window to 30 minutes and λ halves too: 1.5. A quiet half-hour is now quite likely: e^(−1.5) = 0.2231.",
      "Two hours: λ = 6. Going two hours without a call has chance e^(−6) = 0.0025.",
      "Ten minutes: λ = 0.5. Now 'no call' is the most likely outcome, with chance 0.6065.",
    ],
    build: function (svg) {
      box = Viz.svg("rect", { class: "v-kept", x: L, y: 50, height: 110 }, svg);
      Viz.svg("line", { class: "v-axis", x1: L, y1: 160, x2: R, y2: 160 }, svg);
      [0, 30, 60, 90, 120].forEach(function (m) {
        Viz.svg("line", { class: "v-axis", x1: px(m), y1: 160, x2: px(m), y2: 170 }, svg);
        Viz.svg("text", { class: "v-small", x: px(m), y: 192 }, svg, m + " min");
      });
      CALLS.forEach(function (t) { ticks.push(Viz.svg("circle", { class: "v-dot", cx: px(t), cy: 105, r: 9 }, svg)); });
      Viz.svg("text", { class: "v-small", x: 300, y: 228 }, svg, "● = a call in one example record");
    },
    draw: function (c) { box.setAttribute("width", Math.max(0, c.w)); },
    predict: {
      prompt: "Predict first: calls come at 3 per hour. For a 30-minute window, λ is…",
      options: ["3, the rate", "1.5, half the rate", "6, double the rate"], reveal: 1,
      verdict: function (i) {
        return i === 1 ? "You predicted 1.5. Correct: λ is the rate times the window's length."
          : "You predicted " + ["3, the rate", "1.5, half the rate", "6, double the rate"][i] + ". It is 1.5: λ is the rate times the window's length, 3 × 1/2.";
      },
    },
  };
})());
