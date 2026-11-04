/* Lesson 2 multiplication rule: two draws without replacement from 6 red and 4 black. */
Viz.stepped("urn-without-replacement", (function () {
  var R = 19, balls = [], q, prod, n1, n2;
  // Ball 0 is the first red drawn, ball 1 the second red drawn.
  var colour = ["r", "r", "r", "r", "r", "r", "b", "b", "b", "b"];
  var order = [0, 6, 2, 7, 4, 1, 8, 3, 9, 5]; // mixed positions in the urn
  function home(i) { var k = order.indexOf(i); return { x: 70 + (k % 5) * 46, y: 140 + Math.floor(k / 5) * 46 }; }
  function layout(step) {
    var s = { q: step === 2 ? 1 : 0, prod: step === 3 ? 1 : 0, n1: step >= 1 ? 1 : 0, n2: step >= 2 ? 1 : 0 };
    for (var i = 0; i < 10; i++) {
      var h = home(i), out1 = i === 0 && step >= 1, out2 = i === 1 && step >= 3;
      s["x" + i] = out1 ? 410 : out2 ? 510 : h.x;
      s["y" + i] = out1 || out2 ? 92 : h.y;
      s["h" + i] = (step === 1 && colour[i] === "r") || (step === 2 && colour[i] === "r" && i !== 0) ? 1 : 0;
    }
    return s;
  }
  return {
    kicker: "Step through it", title: "Each draw changes what is left",
    viewBox: "0 0 600 300", label: "An urn with six red and four black balls; two red balls are drawn one after the other",
    steps: 4, layout: layout,
    ledger: [{ name: "left", label: "In the urn now" }, { name: "calc", label: "Working", wide: true }],
    readouts: function (step) {
      return {
        left: ["6 red, 4 black", "6 red, 4 black", "5 red, 4 black", "5 red, 4 black"][step],
        calc: ["P(both red) = ?", "First red: 6/10", "Second red, given first red: 5/9", "(6/10) × (5/9) = 30/90 = 1/3"][step],
      };
    },
    say: [
      "An urn holds 6 red and 4 black balls. We will draw two without putting the first back. What is the chance both are red?",
      "First draw: 6 of the 10 balls are red, so the chance of red is 6/10.",
      "The red ball stays out. Now 9 balls are left and only 5 are red. Given the first was red, the second is red with chance 5/9.",
      "Chance both happen = chance of the first × chance of the second given the first: (6/10) × (5/9) = 1/3.",
    ],
    build: function (svg) {
      Viz.svg("path", { class: "v-urn", d: "M44,98 L44,232 Q44,256 68,256 L284,256 Q308,256 308,232 L308,98" }, svg);
      Viz.svg("text", { class: "v-small", x: 176, y: 282 }, svg, "the urn");
      [["draw 1", 410], ["draw 2", 510]].forEach(function (d) {
        Viz.svg("circle", { cx: d[1], cy: 92, r: R + 6, class: "v-slot" }, svg);
        Viz.svg("text", { class: "v-small", x: d[1], y: 44 }, svg, d[0]);
      });
      n1 = Viz.svg("text", { class: "v-label", x: 410, y: 150 }, svg, "6/10");
      n2 = Viz.svg("text", { class: "v-label", x: 510, y: 150 }, svg, "5/9");
      q = Viz.svg("text", { class: "v-big", x: 510, y: 92 }, svg, "?");
      prod = Viz.svg("text", { class: "v-big", x: 460, y: 214 }, svg, "6/10 × 5/9 = 1/3");
      for (var i = 0; i < 10; i++) {
        var g = Viz.svg("g", {}, svg);
        var halo = Viz.svg("circle", { r: R + 6, class: "v-halo" }, g);
        Viz.svg("circle", { r: R, class: colour[i] === "r" ? "v-red" : "v-ink" }, g);
        balls.push([g, halo]);
      }
    },
    draw: function (c) {
      balls.forEach(function (b, i) {
        b[0].setAttribute("transform", "translate(" + c["x" + i] + "," + c["y" + i] + ")");
        b[1].setAttribute("opacity", c["h" + i]);
      });
      q.setAttribute("opacity", c.q); prod.setAttribute("opacity", c.prod);
      n1.setAttribute("opacity", c.n1); n2.setAttribute("opacity", c.n2);
    },
  };
})());
