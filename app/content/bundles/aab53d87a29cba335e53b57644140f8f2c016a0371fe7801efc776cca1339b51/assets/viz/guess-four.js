/* Lesson 8: guess 4 questions, each right with chance 1/4. All 16 right/wrong patterns, grouped by how many are right.
   Each step lights one group: count its patterns (C(4, x)), price one pattern ((1/4)^x (3/4)^(4−x)), multiply.
   The bars underneath are the binomial p.m.f. Bin(4, 1/4). */
Viz.stepped("guess-four", (function () {
  var C = [1, 4, 6, 4, 1], ONE = [81, 27, 9, 3, 1];           // one pattern's chance, in 256ths: 3^(4−x)
  var groups = [[], [], [], [], []];
  for (var m = 0; m < 16; m++) {                                // every pattern, bit i = question i right
    var bits = [0, 1, 2, 3].map(function (i) { return (m >> (3 - i)) & 1; });
    groups[bits.reduce(function (s, b) { return s + b; }, 0)].push(bits);
  }
  var cx = function (x) { return 64 + x * 118; }, CELL = 13, GAP = 3, BASE = 300;
  var cols = [], bars = [], labels = [];
  function layout(step) { var out = {}; for (var x = 0; x < 5; x++) out["o" + x] = x === step ? 1 : 0; return out; }
  return {
    kicker: "Step through it", title: "Count the patterns, price one, multiply",
    viewBox: "0 0 600 330", label: "Sixteen rows of four squares, one per right-or-wrong pattern for four guessed questions, grouped into five columns by how many are right, with a bar under each column for its probability",
    steps: 5, layout: layout,
    ledger: [{ name: "x", label: "Number right, x" }, { name: "orders", label: "Patterns, C(4, x)" },
      { name: "each", label: "Chance of one pattern" }, { name: "p", label: "P(X = x)" }],
    readouts: function (x) {
      return { x: String(x), orders: String(C[x]), each: ONE[x] + "/256", p: C[x] + " × " + ONE[x] + "/256 = " + C[x] * ONE[x] + "/256" };
    },
    say: [
      "x = 0: only one pattern, all four wrong. Its chance is (3/4)⁴ = 81/256, by multiplying independent guesses.",
      "x = 1: four patterns, one for each question that could be the right one. Each has chance (1/4)(3/4)³ = 27/256, so P(X = 1) = 4 × 27/256 = 108/256.",
      "x = 2: six patterns. Each is rarer, (1/4)²(3/4)² = 9/256, so P(X = 2) = 54/256.",
      "x = 3: four patterns at 3/256 each: 12/256.",
      "x = 4: one pattern, all right: (1/4)⁴ = 1/256. The five bars add to 256/256 = 1. The most likely count is 1.",
    ],
    build: function (svg) {
      groups.forEach(function (g, x) {
        var col = Viz.svg("g", {}, svg);
        g.forEach(function (bits, r) {
          bits.forEach(function (b, i) {
            Viz.svg("rect", { class: b ? "v-target" : "v-kept", x: cx(x) - 2 * CELL - 1.5 * GAP + i * (CELL + GAP), y: 22 + r * (CELL + 6), width: CELL, height: CELL, rx: 2 }, col);
          });
        });
        cols.push(col);
        bars.push(Viz.svg("rect", { width: 56, x: cx(x) - 28, y: BASE - C[x] * ONE[x] * 1.05, height: C[x] * ONE[x] * 1.05 }, svg));
        labels.push(Viz.svg("text", { class: "v-small", x: cx(x), y: 318 }, svg, "x = " + x));
      });
      Viz.svg("line", { class: "v-axis", x1: 20, y1: BASE, x2: 580, y2: BASE }, svg);
    },
    draw: function (c) {
      for (var x = 0; x < 5; x++) {
        cols[x].setAttribute("opacity", 0.3 + 0.7 * c["o" + x]);
        bars[x].setAttribute("class", c["o" + x] > 0.5 ? "v-target" : "v-kept");
      }
    },
    predict: {
      prompt: "Predict first: guessing 4 questions with chance 1/4 each, which number right is most likely?",
      options: ["0 right", "1 right", "2 right"], reveal: 4,
      verdict: function (i) {
        return i === 1 ? "You predicted 1 right. Correct: 108/256 beats 81/256 for 0 right."
          : "You predicted " + ["0 right", "1 right", "2 right"][i] + ". The most likely is 1 right: 108/256, against 81/256 for 0 and 54/256 for 2.";
      },
    },
  };
})());
