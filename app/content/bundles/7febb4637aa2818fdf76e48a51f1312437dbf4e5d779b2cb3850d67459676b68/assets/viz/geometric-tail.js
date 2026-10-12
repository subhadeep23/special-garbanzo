/* Lesson 10: rolling until the first six. Step 0: the mass function P(X = k) = (5/6)^(k−1)(1/6), each bar 5/6 of the
   one before. Step 1: the tail P(X ≥ k) = (5/6)^(k−1), the staircase. Step 2: L6's tail-sum formula adds the tail
   bars: 1 + 5/6 + (5/6)² + … = 6 = E[X]. */
Viz.stepped("geometric-tail", (function () {
  var K = 14, L = 40, R = 570, BASE = 250, UNIT = 190;      // UNIT = height of probability 1
  var bars = [];
  var px = function (k) { return L + ((k - 0.5) / K) * (R - L); };
  function layout(step) {
    var out = {};
    for (var k = 1; k <= K; k++) { var tail = Math.pow(5 / 6, k - 1); out["h" + k] = (step === 0 ? tail / 6 : tail) * UNIT; }
    out.g = step === 2 ? 1 : 0;
    return out;
  }
  return {
    kicker: "Step through it", title: "From the mass function to the mean",
    viewBox: "0 0 600 300", label: "Bars for the first 14 rolls of a roll-until-six experiment: first the chance the first six comes on roll k, then the chance it takes at least k rolls",
    steps: 3, layout: layout,
    ledger: [{ name: "show", label: "Bars show", wide: true }, { name: "first", label: "First three bars" }, { name: "total", label: "Sum of all the bars" }],
    readouts: function (step) {
      return [
        { show: "P(X = k): first six on roll k", first: "1/6, 5/36, 25/216", total: "1" },
        { show: "P(X ≥ k): no six in the first k − 1 rolls", first: "1, 5/6, 25/36", total: "1 + 5/6 + 25/36 + … = 6" },
        { show: "P(X ≥ k), added up: the tail-sum formula", first: "1, 5/6, 25/36", total: "E[X] = 6 rolls" },
      ][step];
    },
    say: [
      "The first six comes on roll k when the first k − 1 rolls miss and roll k hits: (5/6)^(k−1) × 1/6. Each bar is 5/6 of the one before, and together they hold all the probability, 1.",
      "Now the tail: needing at least k rolls means the first k − 1 all missed, chance (5/6)^(k−1). A staircase that starts at 1 and shrinks by 5/6 a step.",
      "L6's tail-sum formula: E[X] is the sum of P(X ≥ k). A geometric series: 1 + 5/6 + (5/6)² + … = 1/(1 − 5/6) = 6. On average, six rolls.",
    ],
    build: function (svg) {
      Viz.svg("line", { class: "v-axis", x1: 20, y1: BASE, x2: 580, y2: BASE }, svg);
      for (var k = 1; k <= K; k++) {
        bars.push(Viz.svg("rect", { x: px(k) - 14, width: 28 }, svg));
        if (k === 1 || k % 3 === 0) Viz.svg("text", { class: "v-small", x: px(k), y: 274 }, svg, String(k));
      }
      Viz.svg("line", { class: "v-axis", x1: 26, y1: BASE - UNIT, x2: 38, y2: BASE - UNIT }, svg);
      Viz.svg("text", { class: "v-note", x: 24, y: BASE - UNIT }, svg, "1");
    },
    draw: function (c) {
      for (var k = 1; k <= K; k++) {
        var h = Math.max(0, c["h" + k]);
        bars[k - 1].setAttribute("y", BASE - h); bars[k - 1].setAttribute("height", h);
        bars[k - 1].setAttribute("class", c.g > 0.5 ? "v-answer" : "v-kept");
      }
    },
    predict: {
      prompt: "Predict first: rolling a fair die until the first six, how many rolls does it take on average?",
      options: ["3.5", "6", "36"], reveal: 2,
      verdict: function (i) {
        return i === 1 ? "You predicted 6. Correct: E[X] = 1/p = 6."
          : "You predicted " + ["3.5", "6", "36"][i] + ". It is 6: the tail bars add to 1/(1 − 5/6) = 6, which is 1/p.";
      },
    },
  };
})());
