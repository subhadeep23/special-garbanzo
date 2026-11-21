/* Lesson 11: X ~ Poisson(2) and Y ~ Poisson(3), independent. Step 0 shows X, step 1 shows Y, step 2 shows X + Y
   worked out the long way (adding P(X = i)P(Y = s − i) over every split of s) as bars, with Poisson(5) dots on top:
   multiplying the MGFs e^(2(e^t − 1)) e^(3(e^t − 1)) = e^(5(e^t − 1)) predicted exactly this. */
Viz.stepped("mgf-multiply", (function () {
  var XMAX = 14, L = 40, R = 570, BASE = 250, SCALE = 600;
  var bars = [], dots = [];
  function pois(lam) { var out = [], t = Math.exp(-lam); for (var x = 0; x <= XMAX; x++) { out.push(t); t = (t * lam) / (x + 1); } return out; }
  function conv(a, b) { var out = []; for (var s = 0; s <= XMAX; s++) { var v = 0; for (var i = 0; i <= s; i++) v += a[i] * b[s - i]; out.push(v); } return out; }
  var X = pois(2), Y = pois(3), S = conv(X, Y), P5 = pois(5);
  var px = function (x) { return L + ((x + 0.5) / (XMAX + 1)) * (R - L); };
  var four = function (v) { return v.toFixed(4); };
  function layout(step) {
    var src = [X, Y, S][step], out = { d: step === 2 ? 1 : 0 };
    for (var x = 0; x <= XMAX; x++) out["h" + x] = src[x] * SCALE;
    return out;
  }
  return {
    kicker: "Step through it", title: "Multiply the MGFs, add the variables",
    viewBox: "0 0 600 290", label: "Bars of a count distribution from 0 to 14; in the last step, red dots for the Poisson distribution with mean 5 sit on the bars",
    steps: 3, layout: layout,
    ledger: [{ name: "law", label: "Bars show", wide: true }, { name: "mgf", label: "Its MGF", wide: true },
      { name: "p5", label: "P(count = 5)" }, { name: "mean", label: "Mean" }],
    readouts: function (step) {
      return [
        { law: "X ~ Poisson(2)", mgf: "e^(2(e^t − 1))", p5: four(X[5]), mean: "2" },
        { law: "Y ~ Poisson(3), independent of X", mgf: "e^(3(e^t − 1))", p5: four(Y[5]), mean: "3" },
        { law: "X + Y, found by adding up every split", mgf: "e^(2(e^t − 1)) × e^(3(e^t − 1)) = e^(5(e^t − 1))", p5: four(S[5]) + " (Poisson(5) formula: " + four(P5[5]) + ")", mean: "5" },
      ][step];
    },
    say: [
      "X is Poisson(2): counts balance at 2. Its MGF is e^(2(e^t − 1)).",
      "Y is Poisson(3), independent of X. Its MGF is e^(3(e^t − 1)).",
      "X + Y the long way: P(X + Y = s) adds P(X = i)P(Y = s − i) over every split. The bars land exactly on the red Poisson(5) dots, which multiplying the MGFs predicted in one line.",
    ],
    build: function (svg) {
      Viz.svg("line", { class: "v-axis", x1: 20, y1: BASE, x2: 580, y2: BASE }, svg);
      for (var x = 0; x <= XMAX; x++) {
        bars.push(Viz.svg("rect", { class: "v-kept", x: px(x) - 13, width: 26 }, svg));
        dots.push(Viz.svg("circle", { class: "v-dot", cx: px(x), cy: BASE - P5[x] * SCALE, r: 7 }, svg));
        if (x % 2 === 0) Viz.svg("text", { class: "v-small", x: px(x), y: 274 }, svg, String(x));
      }
    },
    draw: function (c) {
      for (var x = 0; x <= XMAX; x++) {
        var h = Math.max(0, c["h" + x]);
        bars[x].setAttribute("y", BASE - h); bars[x].setAttribute("height", h);
        dots[x].setAttribute("opacity", c.d);
      }
    },
    predict: {
      prompt: "Predict first: X ~ Poisson(2) and Y ~ Poisson(3) are independent. What is X + Y?",
      options: ["Poisson(5)", "Poisson(6)", "not a Poisson"], reveal: 2,
      verdict: function (i) {
        return i === 0 ? "You predicted Poisson(5). Correct: the MGFs multiply to e^(5(e^t − 1))."
          : "You predicted " + ["Poisson(5)", "Poisson(6)", "not a Poisson"][i] + ". It is Poisson(5): the MGFs multiply to e^(5(e^t − 1)).";
      },
    },
  };
})());
