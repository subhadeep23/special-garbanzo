/* Lesson 16: X ~ U(−1, 1) and Y = X². Step 0: the uniform X. Step 1: only the right half (x = √y) is carried over:
   density 1/(4√y) on (0, 1), holding half the probability. Step 2: the left half folds onto the same y-values, doubling
   it to f_Y(y) = 1/(2√y). The readouts track the density at y = 1/4 and P(Y ≤ 1/4). */
Viz.stepped("fold-square", (function () {
  var XL = 70, XR = 530, XA = 80, YL = 70, YR = 530, YA = 265, H = 58, CAP = 2.2;
  var xpx = function (x) { return XL + ((x + 1) / 2) * (XR - XL); }, ypx = function (y) { return YL + y * (YR - YL); };
  var right, both, leftBlock, rightBlock;
  function curve(scale) { var d = []; for (var i = 1; i <= 120; i++) { var y = i / 120; d.push((i === 1 ? "M" : "L") + ypx(y) + " " + (YA - Math.min(scale / Math.sqrt(y), CAP) * H)); } return d.join(" "); }
  return {
    kicker: "Step through it", title: "Fold the line, add the halves",
    viewBox: "0 0 600 305", label: "Top: X uniform on minus 1 to 1, left half blue and right half red. Bottom: the density of Y = X squared on 0 to 1, first from the right half alone, then from both halves",
    steps: 3,
    layout: function (step) { return { r: step >= 1 ? 1 : 0, b: step >= 2 ? 1 : 0 }; },
    ledger: [{ name: "what", label: "Carried over", wide: true }, { name: "dens", label: "Density of Y at 1/4" }, { name: "prob", label: "P(Y ≤ 1/4)" }],
    readouts: function (step) {
      return [
        { what: "nothing yet: X is uniform, density 1/2 on (−1, 1)", dens: "—", prob: "P(|X| ≤ 1/2) = 1/2" },
        { what: "the right half only, x = √y", dens: "1/(4√y) = 1/2", prob: "1/4 from the right half" },
        { what: "both halves: x = √y and x = −√y", dens: "1/(2√y) = 1", prob: "1/4 + 1/4 = 1/2" },
      ][step];
    },
    say: [
      "X is uniform on (−1, 1). Squaring sends x and −x to the same y, so two points of X land on every y in (0, 1).",
      "Carry over only the right half, x = √y: f_X(√y) × |dx/dy| = (1/2) × 1/(2√y) = 1/(4√y). It holds just half the probability.",
      "The left half folds onto the same y-values and adds an equal share: f_Y(y) = 1/(2√y). Forgetting the fold gives exactly half the right answer.",
    ],
    build: function (svg) {
      leftBlock = Viz.svg("rect", { class: "v-kept", x: xpx(-1), y: XA - 40, width: xpx(0) - xpx(-1), height: 40 }, svg);
      rightBlock = Viz.svg("rect", { class: "v-target", x: xpx(0), y: XA - 40, width: xpx(1) - xpx(0), height: 40 }, svg);
      Viz.svg("line", { class: "v-axis", x1: XL - 20, y1: XA, x2: XR + 20, y2: XA }, svg);
      [[-1, "−1"], [0, "0"], [1, "1"]].forEach(function (t) { Viz.svg("text", { class: "v-small", x: xpx(t[0]), y: XA + 20 }, svg, t[1]); });
      Viz.svg("text", { class: "v-small", x: 565, y: XA - 10 }, svg, "x");
      Viz.svg("line", { class: "v-axis", x1: YL, y1: YA, x2: YR + 20, y2: YA }, svg);
      [[0, "0"], [0.25, "1/4"], [1, "1"]].forEach(function (t) { Viz.svg("text", { class: "v-small", x: ypx(t[0]), y: YA + 20 }, svg, t[1]); });
      Viz.svg("text", { class: "v-small", x: 565, y: YA - 10 }, svg, "y");
      Viz.svg("line", { class: "v-slot", x1: ypx(0.25), y1: YA, x2: ypx(0.25), y2: YA - CAP * H }, svg);
      right = Viz.svg("path", { class: "v-line", d: curve(0.25), stroke: "var(--accent)" }, svg);
      both = Viz.svg("path", { class: "v-line", d: curve(0.5) }, svg);
    },
    draw: function (c) { right.setAttribute("opacity", c.r * (1 - 0.6 * c.b)); both.setAttribute("opacity", c.b); leftBlock.setAttribute("opacity", 0.35 + 0.65 * c.b); },
    predict: {
      prompt: "Predict first: carrying over only x = √y gives density 1/2 at y = 1/4. The true density there is…",
      options: ["1, twice that", "1/2, as computed", "1/4, half that"], reveal: 2,
      verdict: function (i) {
        return i === 0 ? "You predicted 1. Correct: the left half x = −√y adds an equal share, so f_Y(1/4) = 1/(2√(1/4)) = 1."
          : "You predicted " + ["1, twice that", "1/2, as computed", "1/4, half that"][i] + ". It is 1: the left half x = −√y folds onto the same y and doubles it.";
      },
    },
  };
})());
