/* Lesson 8: Bin(n, p) bars for n in {5, 10, 20, 40} and p in steps of 0.05. The green fulcrum sits at the mean np
   (L6's balance point); the readouts give np, npq and the most likely count, all from exact integer arithmetic. */
Viz.live("binomial-explorer", (function () {
  var MAXN = 40, L = 40, R = 570, BASE = 270, TOP = 40;
  var bars = [], fulcrum, ticks = [];
  function pmf(n, k) { // p = k/20; returns floats for drawing only
    var p = k / 20, out = [], c = 1;
    for (var x = 0; x <= n; x++) { out.push(c * Math.pow(p, x) * Math.pow(1 - p, n - x)); c = (c * (n - x)) / (x + 1); }
    return out;
  }
  function modes(n, k) { // f(x) ≥ f(x−1) ⇔ (n − x + 1)k ≥ x(20 − k): exact, no rounding
    var best = [0];
    for (var x = 1; x <= n; x++) {
      var a = (n - x + 1) * k, b = x * (20 - k);
      if (a > b) best = [x]; else if (a === b) best.push(x); else break;
    }
    return best;
  }
  var trim = function (num, den) { var s = (num / den).toFixed(4); return s.replace(/\.?0+$/, ""); };
  var xpx = function (n, x) { return L + ((x + 0.5) / (n + 1)) * (R - L); };
  return {
    kicker: "Try it", title: "Bin(n, p): move n and p",
    viewBox: "0 0 600 310", label: "Bars of a binomial probability mass function, with a green fulcrum at the mean n times p",
    ledger: [{ name: "law", label: "Distribution" }, { name: "mean", label: "Mean np" }, { name: "var", label: "Variance npq" }, { name: "mode", label: "Most likely x" }],
    initial: function () { return { n: 10, k: 10 }; },
    layout: function (s) {
      var f = pmf(s.n, s.k), top = Math.max.apply(null, f), out = { m: xpx(s.n, (s.n * s.k) / 20) };
      for (var x = 0; x <= MAXN; x++) {
        out["h" + x] = x <= s.n ? (f[x] / Math.max(top, 0.3)) * (BASE - TOP) : 0;
        out["x" + x] = xpx(s.n, Math.min(x, s.n)); out["w" + x] = x <= s.n ? Math.max(2, ((R - L) / (s.n + 1)) * 0.78) : 0;
      }
      return out;
    },
    build: function (svg) {
      Viz.svg("line", { class: "v-axis", x1: 20, y1: BASE, x2: 580, y2: BASE }, svg);
      for (var x = 0; x <= MAXN; x++) bars.push(Viz.svg("rect", { class: "v-kept" }, svg));
      fulcrum = Viz.svg("polygon", { class: "v-answer" }, svg);
      for (var i = 0; i < 5; i++) ticks.push(Viz.svg("text", { class: "v-small", y: 300 }, svg));
    },
    draw: function (c) {
      for (var x = 0; x <= MAXN; x++) {
        var w = c["w" + x], h = Math.max(0, c["h" + x]);
        bars[x].setAttribute("x", c["x" + x] - w / 2); bars[x].setAttribute("width", w);
        bars[x].setAttribute("y", BASE - h); bars[x].setAttribute("height", h);
      }
      fulcrum.setAttribute("points", [c.m, BASE + 2, c.m - 13, BASE + 22, c.m + 13, BASE + 22].join(" "));
    },
    readouts: function (s) {
      var md = modes(s.n, s.k);
      return { law: "Bin(" + s.n + ", " + trim(s.k, 20) + ")", mean: trim(s.n * s.k, 20), var: trim(s.n * s.k * (20 - s.k), 400),
        mode: md.length > 1 ? md.join(" and ") + " (a tie)" : String(md[0]) };
    },
    say: function (s) {
      return "n = " + s.n + ", p = " + trim(s.k, 20) + ". The bars balance at np = " + trim(s.n * s.k, 20) + ". The variance npq = " + trim(s.n * s.k * (20 - s.k), 400) +
        (s.k === 10 ? " is as big as it can be for this n: n/4." : " is below n/4 = " + trim(s.n, 4) + ", its largest possible value at p = 0.5.");
    },
    sync: function (s, box) {
      box.querySelectorAll("[data-viz-pick]").forEach(function (b) { b.setAttribute("aria-pressed", String(Number(b.getAttribute("data-viz-pick")) === s.n)); });
      var input = box.querySelector("[data-viz-input]");
      if (Math.round(Number(input.value) * 20) !== s.k) input.value = String(s.k / 20);
      var lab = box.querySelector(".viz-label.p"); if (lab) lab.textContent = "Success chance p = " + trim(s.k, 20);
      var t = [0, s.n / 4, s.n / 2, (3 * s.n) / 4, s.n].map(Math.round);
      ticks.forEach(function (tick, i) { tick.setAttribute("x", xpx(s.n, t[i])); tick.textContent = String(t[i]); });
    },
    controls: function (box, api, el) {
      el("span", { class: "viz-label" }, box, "Number of trials n");
      var row = el("div", { class: "viz-presets", role: "group", "aria-label": "Number of trials" }, box);
      [5, 10, 20, 40].forEach(function (n) {
        el("button", { type: "button", "data-viz-pick": String(n), "aria-pressed": "false" }, row, "n = " + n)
          .addEventListener("click", function () { api.set({ n: n, k: api.state().k }); });
      });
      el("span", { class: "viz-label p" }, box, "Success chance p");
      var input = el("input", { type: "range", min: "0.05", max: "0.95", step: "0.05", value: "0.5", "data-viz-input": "", "aria-label": "Success chance p" }, box);
      input.addEventListener("input", function () { api.set({ n: api.state().n, k: Math.round(Number(input.value) * 20) }); });
    },
    seconds: 0.5,
    predict: {
      prompt: "Guess first: 10 questions, each guessed right with chance 0.25. Where do the bars balance?",
      options: ["at 2.5", "at 5, the middle", "at 0.25"],
      verdict: function (i) {
        return i === 0 ? "You guessed 2.5. Correct: np = 10 × 0.25 = 2.5. Set p to 0.25 and look."
          : "You guessed " + ["at 2.5", "at 5, the middle", "at 0.25"][i] + ". They balance at np = 10 × 0.25 = 2.5. Set p to 0.25 and look.";
      },
    },
  };
})());
