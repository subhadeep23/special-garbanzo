/* Lesson 7: three distributions with the same mean 0 and the same standard deviation 1. Slide k: the band μ ± kσ
   is shaded, bars inside stay blue, bars outside turn red, and their total mass sits beside Chebyshev's bound 1/k². The bound is never
   beaten; the "extreme" shape meets it exactly at k = 2. */
Viz.live("chebyshev-band", (function () {
  // Masses as [numerator, denominator] at the points −2, −1, 0, 1, 2. Each has mean 0 and variance 1.
  var LAWS = {
    bell: { name: "1/16, 4/16, 6/16, 4/16, 1/16 on −2 … 2", p: [[1, 16], [4, 16], [6, 16], [4, 16], [1, 16]] },
    twin: { name: "½ on −1 and ½ on 1", p: [[0, 1], [1, 2], [0, 1], [1, 2], [0, 1]] },
    extreme: { name: "1/8 on −2, 3/4 on 0, 1/8 on 2", p: [[1, 8], [0, 1], [3, 4], [0, 1], [1, 8]] },
  };
  var XS = [-2, -1, 0, 1, 2], px = function (x) { return 300 + x * 105; }, BASE = 250, H = 300;
  var band, bars = [], tags = [], lo, hi;
  var gcd = function (a, b) { return b ? gcd(b, a % b) : a; };
  function frac(n, d) { if (n === 0) return "0"; var g = gcd(n, d); return d / g === 1 ? String(n / g) : n / g + "/" + d / g; }
  function outside(s) { // exact P(|X| ≥ k) with k in halves: |x| ≥ k ⇔ 2|x| ≥ k2
    var n = 0, d = 1;
    LAWS[s.law].p.forEach(function (p, i) { if (2 * Math.abs(XS[i]) >= s.k2 && p[0]) { n = n * p[1] + p[0] * d; d = d * p[1]; } });
    return [n, d];
  }
  var dec = function (n, d) { return (n / d).toFixed(4); };
  var kText = function (k2) { return k2 % 2 ? (k2 / 2).toFixed(1) : String(k2 / 2); };
  return {
    kicker: "Try it", title: "No shape can beat 1/k²",
    viewBox: "0 0 600 330", label: "Bars of a distribution on −2 to 2 with mean 0 and standard deviation 1; a shaded band from minus k to k; bars outside the band are red",
    ledger: [{ name: "law", label: "Distribution (mean 0, SD 1)", wide: true }, { name: "band", label: "Band μ ± kσ" },
      { name: "out", label: "Outside: P(|X − μ| ≥ kσ)" }, { name: "bound", label: "Chebyshev bound 1/k²" }, { name: "room", label: "Bound minus truth" }],
    initial: function () { return { law: "bell", k2: 4 }; },
    layout: function (s) {
      var out = { lo: px(-s.k2 / 2), hi: px(s.k2 / 2) };
      LAWS[s.law].p.forEach(function (p, i) { out["h" + i] = (p[0] / p[1]) * H; out["r" + i] = 2 * Math.abs(XS[i]) >= s.k2 ? 1 : 0; });
      return out;
    },
    build: function (svg) {
      band = Viz.svg("rect", { class: "v-slot", y: 30, height: BASE - 30 }, svg);
      Viz.svg("line", { class: "v-axis", x1: 20, y1: BASE, x2: 580, y2: BASE }, svg);
      XS.forEach(function (x) { Viz.svg("text", { class: "v-small", x: px(x), y: 274 }, svg, x < 0 ? "−" + -x : String(x)); });
      XS.forEach(function () {
        var g = Viz.svg("g", {}, svg);
        bars.push([Viz.svg("rect", { class: "v-kept", width: 48 }, g), Viz.svg("rect", { class: "v-target", width: 48 }, g)]);
        tags.push(Viz.svg("text", { class: "v-small" }, svg));
      });
      lo = Viz.svg("text", { class: "v-label", y: 308 }, svg); hi = Viz.svg("text", { class: "v-label", y: 308 }, svg);
    },
    draw: function (c) {
      var l = Math.max(20, c.lo), r = Math.min(580, c.hi);
      band.setAttribute("x", l); band.setAttribute("width", Math.max(0, r - l));
      lo.setAttribute("x", Math.max(40, c.lo)); lo.textContent = "−kσ"; hi.setAttribute("x", Math.min(560, c.hi)); hi.textContent = "+kσ";
      XS.forEach(function (x, i) {
        var h = Math.max(0, c["h" + i]), y = BASE - h;
        bars[i].forEach(function (b, j) {
          b.setAttribute("x", px(x) - 24); b.setAttribute("y", y); b.setAttribute("height", h);
          b.setAttribute("opacity", j ? c["r" + i] : 1 - c["r" + i]);
        });
        tags[i].setAttribute("x", px(x)); tags[i].setAttribute("y", y - 16);
        tags[i].textContent = h > 2 ? String(Math.round((h / H) * 1000) / 1000) : "";
      });
    },
    readouts: function (s) {
      var o = outside(s), b = [4, s.k2 * s.k2], room = [b[0] * o[1] - o[0] * b[1], b[1] * o[1]];
      return { law: LAWS[s.law].name, band: "−" + kText(s.k2) + " to " + kText(s.k2),
        out: frac(o[0], o[1]) + " = " + dec(o[0], o[1]), bound: frac(b[0], b[1]) + " = " + dec(b[0], b[1]),
        room: room[0] === 0 ? "0, the bound is met exactly" : dec(room[0], room[1]) };
    },
    say: function (s) {
      var o = outside(s), b = 4 / (s.k2 * s.k2);
      return "k = " + kText(s.k2) + ". Mass outside the band: " + dec(o[0], o[1]) + ". Chebyshev promises at most " + b.toFixed(4) + ". " +
        (o[0] * s.k2 * s.k2 === 4 * o[1] ? "This shape meets the bound exactly: it is as spread out as the bound allows." : "The bound holds, with room to spare.");
    },
    controls: function (box, api, el) {
      el("span", { class: "viz-label" }, box, "Distribution");
      var row = el("div", { class: "viz-presets", role: "group", "aria-label": "Distribution" }, box);
      [["bell", "Bell"], ["twin", "Twin peaks"], ["extreme", "Extreme"]].forEach(function (k) {
        el("button", { type: "button", "data-viz-pick": k[0], "aria-pressed": "false" }, row, k[1])
          .addEventListener("click", function () { api.set({ law: k[0], k2: api.state().k2 }); });
      });
      el("span", { class: "viz-label" }, box, "k, the band's half-width in SDs");
      var input = el("input", { type: "range", min: "1", max: "3", step: "0.5", value: "2", "data-viz-input": "", "aria-label": "k" }, box);
      input.addEventListener("input", function () { api.set({ law: api.state().law, k2: Math.round(Number(input.value) * 2) }); });
    },
    sync: function (s, box) {
      box.querySelectorAll("[data-viz-pick]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-viz-pick") === s.law)); });
      var input = box.querySelector("[data-viz-input]");
      if (Math.round(Number(input.value) * 2) !== s.k2) input.value = String(s.k2 / 2);
    },
    seconds: 0.5,
    predict: {
      prompt: "Guess first: at k = 2, can any shape with this mean and SD put more than 1/4 outside the band?",
      options: ["yes, a spiky one can", "no, never more than 1/4", "only the bell shape"],
      verdict: function (i) {
        return i === 1 ? "You guessed never more than 1/4. Correct: that is Chebyshev's promise, and Extreme meets it exactly."
          : "You guessed " + ["yes, a spiky one can", "no, never more than 1/4", "only the bell shape"][i] + ". No shape can: at most 1/k² = 1/4 lies outside, and Extreme meets it exactly.";
      },
    },
  };
})());
