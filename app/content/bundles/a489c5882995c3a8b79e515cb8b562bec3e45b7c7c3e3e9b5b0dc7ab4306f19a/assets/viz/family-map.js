/* Lesson 14: the family tree, one edge per step. Exponential → (add r) → Gamma; Z → (square) → χ²₁ = Gamma(½, ½);
   χ²₁ → (add n) → χ²ₙ = Gamma(n/2, ½); two gammas, same rate → X/(X + Y) → Beta. The node in play is red, the ones
   already reached green; readouts give the edge, the reason and the mean and variance that come with it. */
Viz.stepped("family-map", (function () {
  var NODES = [["exp", "Exp(λ)", 95, 60], ["gamma", "Gamma(r, λ)", 300, 60], ["z", "Normal Z", 95, 200],
    ["chi1", "χ²₁", 300, 200], ["chin", "χ²ₙ", 505, 200], ["beta", "Beta(a, b)", 505, 60]];
  var EDGES = [["exp", "gamma"], ["z", "chi1"], ["chi1", "chin"], ["gamma", "beta"]];
  var STEPS = [
    { on: ["exp", "gamma"], edge: "add r independent exponential waits", why: "MGF (λ/(λ − t))^r: the Gamma(r, λ) barcode", mv: "mean r/λ, variance r/λ²" },
    { on: ["z", "chi1"], edge: "square a standard normal", why: "E[e^(tZ²)] = (1 − 2t)^(−1/2): Gamma(½, rate ½)", mv: "mean 1, variance 2" },
    { on: ["chi1", "chin"], edge: "add n independent squares", why: "MGFs multiply: (1 − 2t)^(−n/2) = Gamma(n/2, rate ½)", mv: "mean n, variance 2n" },
    { on: ["gamma", "beta"], edge: "X/(X + Y), two independent gammas with one rate", why: "a share of a total: proved by change of variables in L16", mv: "mean a/(a + b)" },
  ];
  var rects = {}, edges = [];
  var pos = function (id) { for (var i = 0; i < NODES.length; i++) if (NODES[i][0] === id) return NODES[i]; };
  function layout(step) {
    var out = {};
    NODES.forEach(function (n) {
      var seen = STEPS.slice(0, step).some(function (s) { return s.on.indexOf(n[0]) >= 0; });
      out["n_" + n[0]] = STEPS[step].on.indexOf(n[0]) >= 0 ? 2 : seen ? 1 : 0;
    });
    EDGES.forEach(function (e, i) { out["e" + i] = i === step ? 2 : i < step ? 1 : 0; });
    return out;
  }
  var CLS = ["v-out", "v-answer", "v-target"];
  return {
    kicker: "Step through it", title: "One family, four edges",
    viewBox: "0 0 600 270", label: "Six boxes for the exponential, gamma, standard normal, chi-square with 1 and n degrees of freedom, and beta, joined by arrows that light up one at a time",
    steps: 4, layout: layout,
    ledger: [{ name: "edge", label: "This edge", wide: true }, { name: "why", label: "Why", wide: true }, { name: "mv", label: "What you get" }],
    readouts: function (step) { return { edge: STEPS[step].edge, why: STEPS[step].why, mv: STEPS[step].mv }; },
    say: [
      "The wait for the r-th Poisson event is r exponential waits laid end to end. Their MGFs multiply into the gamma's.",
      "Square a standard normal. Its MGF is the gamma's with shape ½ and rate ½: χ² with 1 degree of freedom is a gamma.",
      "Add n independent squared normals: shape n/2, rate ½. That gamma is χ²ₙ, mean n, variance 2n.",
      "Two independent gammas sharing a rate: the first's share of the total, X/(X + Y), lies in (0, 1) and is beta.",
    ],
    build: function (svg) {
      EDGES.forEach(function (e) {
        var a = pos(e[0]), b = pos(e[1]);
        edges.push(Viz.svg("line", { x1: a[2] + 75, y1: a[3], x2: b[2] - 75, y2: b[3], "stroke-width": 4 }, svg));
      });
      NODES.forEach(function (n) {
        rects[n[0]] = Viz.svg("rect", { x: n[2] - 75, y: n[3] - 26, width: 150, height: 52, rx: 10 }, svg);
        Viz.svg("text", { class: "v-cell", x: n[2], y: n[3] }, svg, n[1]);
      });
      Viz.svg("text", { class: "v-small", x: 197, y: 108 }, svg, "add r");
      Viz.svg("text", { class: "v-small", x: 197, y: 152 }, svg, "square");
      Viz.svg("text", { class: "v-small", x: 403, y: 152 }, svg, "add n");
      Viz.svg("text", { class: "v-small", x: 403, y: 108 }, svg, "share");
      Viz.svg("text", { class: "v-small", x: 300, y: 252 }, svg, "χ²ₙ is Gamma(n/2, rate ½)");
    },
    draw: function (c) {
      NODES.forEach(function (n) { rects[n[0]].setAttribute("class", CLS[Math.round(c["n_" + n[0]])]); });
      edges.forEach(function (e, i) { var v = Math.round(c["e" + i]); e.setAttribute("stroke", v === 2 ? "var(--accent)" : v === 1 ? "var(--ok)" : "var(--rule)"); });
    },
    predict: {
      prompt: "Predict first: add up n independent squared standard normals. The average of the total is…",
      options: ["n", "0", "2n"], reveal: 2,
      verdict: function (i) {
        return i === 0 ? "You predicted n. Correct: each square averages E[Z²] = Var(Z) = 1."
          : "You predicted " + ["n", "0", "2n"][i] + ". It is n: each square averages E[Z²] = Var(Z) = 1. (2n is the variance.)";
      },
    },
  };
})());
