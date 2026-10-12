/* Lesson 13: shade μ ± kσ on the standard bell. The readouts give the normal's share inside and outside the band,
   beside Chebyshev's guarantee from L7 (outside ≤ 1/k²), which must hold for every shape and so is far looser. */
Viz.live("normal-bands", (function () {
  var L = 30, R = 570, BASE = 230, H = 180;
  var px = function (z) { return 300 + z * 75; };
  var phi = function (z) { return Math.exp(-z * z / 2); };
  var Phi = function (z) { var x = z / Math.SQRT2, s = 0, t = x, n = 0; while (Math.abs(t) > 1e-17 && n < 200) { s += t / (2 * n + 1); n++; t *= -x * x / n; } return 0.5 + s / Math.sqrt(Math.PI); };
  var band, left, right;
  function area(a, b) { var d = ["M" + px(a) + " " + BASE]; for (var i = 0; i <= 80; i++) { var z = a + ((b - a) * i) / 80; d.push("L" + px(z) + " " + (BASE - phi(z) * H)); } d.push("L" + px(b) + " " + BASE, "Z"); return d.join(" "); }
  var kText = function (k) { return k % 1 ? k.toFixed(1) : String(k); };
  return {
    kicker: "Try it", title: "How much of a normal lies within k SDs?",
    viewBox: "0 0 600 270", label: "The standard bell curve with the band from minus k to k shaded blue and the two tails shaded red",
    ledger: [{ name: "band", label: "Band" }, { name: "inside", label: "Normal: inside" }, { name: "outside", label: "Normal: outside" },
      { name: "cheb", label: "Chebyshev: outside at most" }],
    initial: function () { return { k: 1 }; },
    layout: function (s) { return { k: s.k }; },
    build: function (svg) {
      left = Viz.svg("path", { class: "v-target" }, svg);
      right = Viz.svg("path", { class: "v-target" }, svg);
      band = Viz.svg("path", { class: "v-kept" }, svg);
      var pts = []; for (var i = 0; i <= 120; i++) { var z = -3.6 + (7.2 * i) / 120; pts.push(px(z) + "," + (BASE - phi(z) * H)); }
      Viz.svg("polyline", { class: "v-line", points: pts.join(" ") }, svg);
      Viz.svg("line", { class: "v-axis", x1: L, y1: BASE, x2: R, y2: BASE }, svg);
      [-3, -2, -1, 0, 1, 2, 3].forEach(function (z) {
        Viz.svg("line", { class: "v-axis", x1: px(z), y1: BASE, x2: px(z), y2: BASE + 8 }, svg);
        Viz.svg("text", { class: "v-small", x: px(z), y: BASE + 26 }, svg, z === 0 ? "μ" : (z < 0 ? "μ−" + -z + "σ" : "μ+" + z + "σ"));
      });
    },
    draw: function (c) { band.setAttribute("d", area(-c.k, c.k)); left.setAttribute("d", area(-3.6, -c.k)); right.setAttribute("d", area(c.k, 3.6)); },
    readouts: function (s) {
      var inside = Phi(s.k) - Phi(-s.k);
      return { band: "μ ± " + kText(s.k) + "σ", inside: inside.toFixed(4), outside: (1 - inside).toFixed(4), cheb: Math.min(1, 1 / (s.k * s.k)).toFixed(4) };
    },
    say: function (s) {
      var out = 1 - (Phi(s.k) - Phi(-s.k));
      return "Within " + kText(s.k) + " SD of the mean a normal holds " + (1 - out).toFixed(4) + ", leaving " + out.toFixed(4) + " in the tails. Chebyshev only promises at most " +
        Math.min(1, 1 / (s.k * s.k)).toFixed(4) + " outside, because it must cover every shape.";
    },
    controls: function (box, api, el) {
      el("span", { class: "viz-label k" }, box, "k = 1");
      var input = el("input", { type: "range", min: "0.5", max: "3", step: "0.5", value: "1", "data-viz-input": "", "aria-label": "k, the half-width in SDs" }, box);
      input.addEventListener("input", function () { api.set({ k: Number(input.value) }); });
    },
    sync: function (s, box) {
      var input = box.querySelector("[data-viz-input]"); if (Number(input.value) !== s.k) input.value = String(s.k);
      box.querySelector(".viz-label.k").textContent = "Half-width k = " + kText(s.k) + " SDs";
    },
    seconds: 0.45,
    predict: {
      prompt: "Guess first: for a normal, what share lies more than 2 SDs from the mean?",
      options: ["about 5%", "about 25%", "about 0.3%"],
      verdict: function (i) {
        return i === 0 ? "You guessed about 5%. Correct: 0.0455, far below Chebyshev's 0.25."
          : "You guessed " + ["about 5%", "about 25%", "about 0.3%"][i] + ". It is about 5%, 0.0455; 25% is only Chebyshev's ceiling, and 0.3% is the share beyond 3 SDs.";
      },
    },
  };
})());
