/* Lesson 9: Bin(n, λ/n) bars against Poisson(λ) dots. Keep the mean np = λ and let n grow: many tiny chances.
   The bars settle onto the dots; the readouts give P(X = 0) both ways and the largest gap over x = 0..12. */
Viz.live("binomial-to-poisson", (function () {
  var XMAX = 12, L = 40, R = 570, BASE = 260, TOP = 40, SCALE = 520;
  var bars = [], dots = [];
  function binom(n, lam) { var p = lam / n, out = [], c = 1; for (var x = 0; x <= XMAX; x++) { out.push(x <= n ? c * Math.pow(p, x) * Math.pow(1 - p, n - x) : 0); c = (c * (n - x)) / (x + 1); } return out; }
  function pois(lam) { var out = [], t = Math.exp(-lam); for (var x = 0; x <= XMAX; x++) { out.push(t); t = (t * lam) / (x + 1); } return out; }
  var px = function (x) { return L + ((x + 0.5) / (XMAX + 1)) * (R - L); };
  var four = function (v) { return v.toFixed(4); };
  function gap(s) { var b = binom(s.n, s.lam), q = pois(s.lam), g = 0; for (var x = 0; x <= XMAX; x++) g = Math.max(g, Math.abs(b[x] - q[x])); return g; }
  return {
    kicker: "Try it", title: "Many tiny chances become a Poisson",
    viewBox: "0 0 600 300", label: "Blue bars of a binomial distribution with mean lambda, and red dots of the Poisson distribution with the same mean, for counts 0 to 12",
    ledger: [{ name: "law", label: "Binomial", wide: true }, { name: "b0", label: "Binomial P(X = 0)" }, { name: "p0", label: "Poisson P(X = 0) = e^(−λ)" },
      { name: "gap", label: "Largest gap, any x" }],
    initial: function () { return { n: 4, lam: 2 }; },
    layout: function (s) {
      var b = binom(s.n, s.lam), q = pois(s.lam), out = {};
      for (var x = 0; x <= XMAX; x++) { out["b" + x] = b[x] * SCALE; out["q" + x] = q[x] * SCALE; }
      return out;
    },
    build: function (svg) {
      Viz.svg("line", { class: "v-axis", x1: 20, y1: BASE, x2: 580, y2: BASE }, svg);
      for (var x = 0; x <= XMAX; x++) {
        bars.push(Viz.svg("rect", { class: "v-kept", x: px(x) - 15, width: 30 }, svg));
        dots.push(Viz.svg("circle", { class: "v-dot", cx: px(x), r: 7 }, svg));
        if (x % 2 === 0) Viz.svg("text", { class: "v-small", x: px(x), y: 284 }, svg, String(x));
      }
    },
    draw: function (c) {
      for (var x = 0; x <= XMAX; x++) {
        var h = Math.max(0, c["b" + x]);
        bars[x].setAttribute("y", BASE - h); bars[x].setAttribute("height", h);
        dots[x].setAttribute("cy", BASE - Math.max(0, c["q" + x])); dots[x].setAttribute("opacity", c["q" + x] > 0.5 ? 1 : 0);
      }
    },
    readouts: function (s) {
      return { law: "Bin(" + s.n + ", " + String(Math.round((s.lam / s.n) * 10000) / 10000) + "), mean " + s.lam,
        b0: four(Math.pow(1 - s.lam / s.n, s.n)), p0: four(Math.exp(-s.lam)), gap: four(gap(s)) };
    },
    say: function (s) {
      return "n = " + s.n + " trials, each with chance " + String(Math.round((s.lam / s.n) * 10000) / 10000) + ", so the mean is " + s.lam + ". " +
        (s.n >= 200 ? "The bars sit on the dots: the largest gap is " + four(gap(s)) + "." : "Make n bigger, keeping the mean, and watch the bars close in on the dots.");
    },
    controls: function (box, api, el) {
      el("span", { class: "viz-label" }, box, "Number of trials n (p = λ/n)");
      var row = el("div", { class: "viz-presets", role: "group", "aria-label": "Number of trials" }, box);
      [4, 10, 50, 200].forEach(function (n) {
        el("button", { type: "button", "data-viz-pick": String(n), "aria-pressed": "false" }, row, "n = " + n)
          .addEventListener("click", function () { api.set({ n: n, lam: api.state().lam }); });
      });
      el("span", { class: "viz-label lam" }, box, "Mean λ");
      var input = el("input", { type: "range", min: "1", max: "3", step: "1", value: "2", "data-viz-input": "", "aria-label": "Mean lambda" }, box);
      input.addEventListener("input", function () { api.set({ n: api.state().n, lam: Number(input.value) }); });
    },
    sync: function (s, box) {
      box.querySelectorAll("[data-viz-pick]").forEach(function (b) { b.setAttribute("aria-pressed", String(Number(b.getAttribute("data-viz-pick")) === s.n)); });
      var input = box.querySelector("[data-viz-input]"); if (Number(input.value) !== s.lam) input.value = String(s.lam);
      box.querySelector(".viz-label.lam").textContent = "Mean λ = " + s.lam;
    },
    seconds: 0.55,
    predict: {
      prompt: "Guess first: keep the mean at 2 and raise n from 4 to 200. The blue bars…",
      options: ["settle onto the red dots", "spread out wider", "pile up at 0"],
      verdict: function (i) {
        return i === 0 ? "You guessed they settle onto the dots. Correct: that limit is the Poisson distribution."
          : "You guessed they " + ["settle onto the red dots", "spread out wider", "pile up at 0"][i].replace("settle onto the red dots", "settle") + ". They settle onto the red dots: that limit is the Poisson distribution.";
      },
    },
  };
})());
