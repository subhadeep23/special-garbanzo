/* Lesson 7: the weights 0.1, 0.2, 0.3, 0.4 on 1, 2, 3, 4 (mean 3, variance 1). Shifting by 5 moves the mean and leaves
   the spread alone; doubling stretches every distance by 2, so the variance grows by 2² = 4; flipping the sign changes
   nothing about the spread. Var(aX + b) = a²Var(X). */
Viz.stepped("shift-and-stretch", (function () {
  var P = [1, 2, 3, 4];                                   // weights in tenths
  var MAPS = [[1, 0], [1, 5], [2, 0], [-2, 5]];           // x → a·x + b
  var NAMES = ["X itself", "X + 5, a shift", "2X, a stretch", "−2X + 5, flip, stretch, shift"];
  var AXIS = 230, px = function (x) { return 52 + (x + 4) * 36; };
  var bars = [], tags = [], fulcrum, bracket, sigma;
  function stats(k) { // exact: sums of integers over 10
    var a = MAPS[k][0], b = MAPS[k][1], s1 = 0, s2 = 0;
    P.forEach(function (p, i) { var v = a * (i + 1) + b; s1 += p * v; s2 += p * v * v; });
    return { mean: s1 / 10, ex2: s2 / 10, v: (10 * s2 - s1 * s1) / 100 };
  }
  function layout(step) {
    var st = stats(step), sd = Math.sqrt(st.v), out = { m: px(st.mean), l: px(st.mean - sd), r: px(st.mean + sd) };
    P.forEach(function (p, i) { out["x" + i] = px(MAPS[step][0] * (i + 1) + MAPS[step][1]); });
    return out;
  }
  var neg = function (v) { return v < 0 ? "−" + -v : String(v); };
  return {
    kicker: "Step through it", title: "Shift it, stretch it: what happens to the spread",
    viewBox: "0 0 600 320", label: "Four weights on a number line from −4 to 10; a green fulcrum marks the mean and a blue bracket spans one standard deviation each side",
    steps: 4, layout: layout,
    ledger: [{ name: "map", label: "The variable", wide: true }, { name: "values", label: "Values" },
      { name: "mean", label: "Mean" }, { name: "var", label: "Variance" }, { name: "sd", label: "SD" }],
    readouts: function (step) {
      var st = stats(step);
      return { map: NAMES[step], values: P.map(function (p, i) { return neg(MAPS[step][0] * (i + 1) + MAPS[step][1]); }).join(", "),
        mean: neg(st.mean), var: String(st.v), sd: String(Math.sqrt(st.v)) };
    },
    say: [
      "X: weights 0.1, 0.2, 0.3, 0.4 on 1, 2, 3, 4. Mean 3, variance E[X²] − 3² = 10 − 9 = 1, so the SD bracket reaches 1 each side.",
      "Add 5 to every value. The whole picture slides; every distance from the mean is unchanged, so the variance stays 1.",
      "Double every value. Every distance from the mean doubles, every squared distance grows four times: variance 4, SD 2.",
      "Now −2X + 5: the picture flips and slides too. Flipping doesn't change any distance, so the variance is still (−2)² × 1 = 4.",
    ],
    build: function (svg) {
      Viz.svg("line", { class: "v-axis", x1: 20, y1: AXIS, x2: 580, y2: AXIS }, svg);
      [-4, -2, 0, 2, 4, 6, 8, 10].forEach(function (x) {
        Viz.svg("line", { class: "v-axis", x1: px(x), y1: AXIS, x2: px(x), y2: AXIS + 8 }, svg);
        Viz.svg("text", { class: "v-small", x: px(x), y: 258 }, svg, neg(x));
      });
      bracket = Viz.svg("path", { class: "v-line" }, svg);
      sigma = Viz.svg("text", { class: "v-small", y: 308 }, svg, "mean ± SD");
      fulcrum = Viz.svg("polygon", { class: "v-answer" }, svg);
      P.forEach(function (p) {
        bars.push(Viz.svg("rect", { class: "v-target", y: AXIS - p * 42, width: 24, height: p * 42 }, svg));
        tags.push(Viz.svg("text", { class: "v-small", y: AXIS - p * 42 - 16 }, svg, "0." + p));
      });
    },
    draw: function (c) {
      for (var i = 0; i < 4; i++) { bars[i].setAttribute("x", c["x" + i] - 12); tags[i].setAttribute("x", c["x" + i]); }
      fulcrum.setAttribute("points", [c.m, AXIS + 2, c.m - 14, AXIS + 26, c.m + 14, AXIS + 26].join(" "));
      bracket.setAttribute("d", "M" + c.l + " 274 V286 H" + c.r + " V274");
      sigma.setAttribute("x", c.m);
    },
    predict: {
      prompt: "Predict first: double every value. The variance, now 1, becomes…",
      options: ["2, doubled", "4, quadrupled", "1, unchanged"], reveal: 2,
      verdict: function (i) {
        return i === 1 ? "You predicted 4. Correct: distances double, squared distances quadruple."
          : "You predicted " + ["2, doubled", "4, quadrupled", "1, unchanged"][i] + ". It becomes 4: distances double, so squared distances quadruple.";
      },
    },
  };
})());
