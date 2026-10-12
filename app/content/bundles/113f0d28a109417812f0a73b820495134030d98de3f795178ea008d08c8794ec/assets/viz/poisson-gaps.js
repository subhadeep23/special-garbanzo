/* Lesson 12: calls arrive as a Poisson process at 3 per hour. The wait T for the first call is longer than t exactly
   when the window [0, t] holds no call, so P(T > t) = P(Poisson(3t) = 0) = e^(−3t): the exponential. One fixed example
   record of calls is drawn; the readouts are the probabilities, not that record. */
Viz.live("poisson-gaps", (function () {
  var CALLS = [14, 31, 38, 71, 104, 112, 151], RATE = 3, L = 40, R = 560;  // minutes in a 3-hour record
  var px = function (m) { return L + (m / 180) * (R - L); };
  var win, curve, cursor, dots = [];
  var four = function (v) { return v.toFixed(4); };
  var surv = function (min) { return Math.exp((-RATE * min) / 60); };
  var gy = function (p) { return 270 - p * 90; };
  return {
    kicker: "Try it", title: "No call yet means a long wait",
    viewBox: "0 0 600 300", label: "A three-hour timeline with a fixed example record of calls, a shaded window from 0 to t, and below it the curve of the chance of no call by time t",
    ledger: [{ name: "t", label: "Window length t" }, { name: "lam", label: "Expected calls, λ = 3t" },
      { name: "none", label: "P(no call) = P(T > t)" }, { name: "some", label: "P(T ≤ t)" }],
    initial: function () { return { m: 10 }; },
    layout: function (s) { return { w: px(s.m) - L, c: gy(surv(s.m)) }; },
    build: function (svg) {
      win = Viz.svg("rect", { class: "v-kept", x: L, y: 30, height: 70 }, svg);
      Viz.svg("line", { class: "v-axis", x1: L, y1: 100, x2: R, y2: 100 }, svg);
      CALLS.forEach(function (c) { dots.push(Viz.svg("circle", { class: "v-dot", cx: px(c), cy: 65, r: 8 }, svg)); });
      [0, 60, 120, 180].forEach(function (m) { Viz.svg("text", { class: "v-small", x: px(m), y: 122 }, svg, m + " min"); });
      Viz.svg("line", { class: "v-axis", x1: L, y1: 270, x2: R, y2: 270 }, svg);
      Viz.svg("line", { class: "v-axis", x1: L, y1: 180, x2: L, y2: 270 }, svg);
      Viz.svg("text", { class: "v-note", x: L - 6, y: 180 }, svg, "1");
      Viz.svg("text", { class: "v-note", x: L - 6, y: 270 }, svg, "0");
      var pts = []; for (var m = 0; m <= 180; m += 2) pts.push(px(m) + "," + gy(surv(m)));
      curve = Viz.svg("polyline", { class: "v-line", points: pts.join(" ") }, svg);
      Viz.svg("text", { class: "v-small", x: 420, y: 160 }, svg, "P(T > t) = e^(−3t)");
      cursor = Viz.svg("circle", { class: "v-dot", r: 8 }, svg);
    },
    draw: function (c) {
      win.setAttribute("width", Math.max(0, c.w));
      cursor.setAttribute("cx", L + c.w); cursor.setAttribute("cy", c.c);
      dots.forEach(function (d, i) { d.setAttribute("opacity", px(CALLS[i]) <= L + c.w ? 1 : 0.35); });
    },
    readouts: function (s) {
      var lam = (RATE * s.m) / 60;
      return { t: s.m + " minutes", lam: String(Math.round(lam * 100) / 100), none: four(surv(s.m)), some: four(1 - surv(s.m)) };
    },
    say: function (s) {
      var lam = (RATE * s.m) / 60;
      return "A window of " + s.m + " minutes expects λ = " + (Math.round(lam * 100) / 100) + " calls. The first call comes after t exactly when the window is empty: chance e^(−" +
        (Math.round(lam * 100) / 100) + ") = " + four(surv(s.m)) + ". In this example record the first call came at 14 minutes.";
    },
    controls: function (box, api, el) {
      el("span", { class: "viz-label m" }, box, "Window length t = 10 minutes");
      var input = el("input", { type: "range", min: "0", max: "60", step: "5", value: "10", "data-viz-input": "", "aria-label": "Window length in minutes" }, box);
      input.addEventListener("input", function () { api.set({ m: Number(input.value) }); });
    },
    sync: function (s, box) {
      var input = box.querySelector("[data-viz-input]"); if (Number(input.value) !== s.m) input.value = String(s.m);
      box.querySelector(".viz-label.m").textContent = "Window length t = " + s.m + " minutes";
    },
    seconds: 0.4,
    predict: {
      prompt: "Guess first: calls come at 3 per hour. What is the chance the first call takes more than 20 minutes?",
      options: ["e^(−1), about 0.37", "1/3, about 0.33", "e^(−3), about 0.05"],
      verdict: function (i) {
        return i === 0 ? "You guessed e^(−1). Correct: 20 minutes expects λ = 1 call, and no call has chance e^(−1) = 0.3679."
          : "You guessed " + ["e^(−1), about 0.37", "1/3, about 0.33", "e^(−3), about 0.05"][i] + ". It is e^(−1) = 0.3679: 20 minutes expects 1 call, and no call has chance e^(−1).";
      },
    },
  };
})());
