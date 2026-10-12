/* Lesson 13: marks X ~ N(60, 10²). The red area P(X > 75) is shaded. Step 1 relabels the axis as X − 60 (shift),
   step 2 divides by 10 (squeeze) so the axis reads z = (X − 60)/10. The curve and the red area never change: only the
   labels do, and the cut 75 becomes 15 and then 1.5. The area is 1 − Φ(1.5) = 0.0668 throughout. */
Viz.stepped("standardise", (function () {
  var L = 30, R = 570, BASE = 230, H = 180;
  var px = function (z) { return 300 + z * 80; };              // drawn in z-units; labels change
  var phi = function (z) { return Math.exp(-z * z / 2); };
  var Phi = function (z) { // erf series; exact to ~1e-12 for |z| ≤ 4
    var x = z / Math.SQRT2, s = 0, t = x, n = 0;
    while (Math.abs(t) > 1e-17 && n < 200) { s += t / (2 * n + 1); n++; t *= -x * x / n; }
    return 0.5 + s / Math.sqrt(Math.PI);
  };
  var labels = [], cutLabel;
  var MAPS = [function (z) { return 60 + 10 * z; }, function (z) { return 10 * z; }, function (z) { return z; }];
  var NAMES = ["marks X", "X − 60, shifted", "z = (X − 60)/10, squeezed"], CUTS = ["75", "15", "1.5"];
  return {
    kicker: "Step through it", title: "Relabel the axis, keep the area",
    viewBox: "0 0 600 280", label: "A bell curve with the area to the right of a cut point shaded red; the axis labels change from marks to standard units while the curve and shading stay put",
    steps: 3,
    layout: function (step) { return { k: step }; },
    ledger: [{ name: "axis", label: "The axis reads", wide: true }, { name: "cut", label: "The cut point" }, { name: "area", label: "Red area" }],
    readouts: function (step) { return { axis: NAMES[step], cut: CUTS[step], area: (1 - Phi(1.5)).toFixed(4) }; },
    say: [
      "Marks X ~ N(60, 10²). The red area is P(X > 75). There is no table for N(60, 10²).",
      "Subtract 60 from every label. Nothing moves; the cut point is now 15 above the middle.",
      "Divide every label by 10. Nothing moves; the cut point reads 1.5. The red area is P(Z > 1.5) = 1 − Φ(1.5) = 0.0668, read from the one table we need.",
    ],
    build: function (svg) {
      var pts = [], shade = ["M" + px(1.5) + " " + BASE, "L" + px(1.5) + " " + (BASE - phi(1.5) * H)];
      for (var i = 0; i <= 120; i++) { var z = -3.5 + (7 * i) / 120; pts.push(px(z) + "," + (BASE - phi(z) * H)); if (z >= 1.5) shade.push("L" + px(z) + " " + (BASE - phi(z) * H)); }
      shade.push("L" + px(3.5) + " " + BASE, "Z");
      Viz.svg("path", { class: "v-target", d: shade.join(" ") }, svg);
      Viz.svg("polyline", { class: "v-line", points: pts.join(" ") }, svg);
      Viz.svg("line", { class: "v-axis", x1: L, y1: BASE, x2: R, y2: BASE }, svg);
      [-3, -2, -1, 0, 1, 2, 3].forEach(function (z) {
        Viz.svg("line", { class: "v-axis", x1: px(z), y1: BASE, x2: px(z), y2: BASE + 8 }, svg);
        labels.push(Viz.svg("text", { class: "v-small", x: px(z), y: BASE + 26 }, svg));
      });
      Viz.svg("line", { class: "v-cursor", x1: px(1.5), y1: 40, x2: px(1.5), y2: BASE }, svg);
      cutLabel = Viz.svg("text", { class: "v-label", x: px(1.5) + 50, y: 60 }, svg);
    },
    draw: function (c) {
      var step = Math.round(c.k);
      [-3, -2, -1, 0, 1, 2, 3].forEach(function (z, i) { var v = MAPS[step](z); labels[i].textContent = v < 0 ? "−" + -v : String(v); });
      cutLabel.textContent = "cut " + CUTS[step];
    },
    predict: {
      prompt: "Predict first: shift and squeeze the axis labels into z-units. The red area…",
      options: ["stays exactly the same", "shrinks by a factor of 10", "grows by a factor of 10"], reveal: 2,
      verdict: function (i) {
        return i === 0 ? "You predicted it stays the same. Correct: only the labels change, so P(X > 75) = P(Z > 1.5) = 0.0668."
          : "You predicted it " + ["stays exactly the same", "shrinks by a factor of 10", "grows by a factor of 10"][i] + ". It stays the same: only the labels change, so P(X > 75) = P(Z > 1.5) = 0.0668.";
      },
    },
  };
})());
