/* Lesson 2 trap: "cannot both happen" vs "independent", seen as areas in a unit square.
   A is the left 0.4 of the square. B has area 0.3: first outside A, then as a band across the top. */
Viz.stepped("exclusive-vs-independent", (function () {
  var S = 230, X = 40, Y = 40, sq, aRect, bRect, abRect, aText, bText, m1, m2, m1t, m2t, title;
  function layout(step) {
    var zoom = step === 1 || step === 3, ind = step >= 2;
    var mapX = function (u) { return zoom ? (u / 0.4) : u; };
    // B in unit coordinates.
    var b = ind ? { x0: 0, x1: 1, y0: 0, y1: 0.3 } : { x0: 0.5, x1: 1, y0: 0.2, y1: 0.8 };
    var shareInA = ind ? 0.3 : 0;
    return {
      ax: X, aw: S * mapX(0.4), bo: zoom && !ind ? 0 : 1,
      bx: X + S * Math.min(1, mapX(b.x0)), bw: S * (Math.min(1, mapX(b.x1)) - Math.min(1, mapX(b.x0))), by: Y + S * b.y0, bh: S * (b.y1 - b.y0),
      abw: ind ? S * mapX(0.4) : 0, abh: S * 0.3, outside: zoom ? 0 : 1,
      m1: 0.3 * 220, m2: (step === 1 || step === 3 ? shareInA : 0) * 220, m2o: zoom ? 1 : 0.25,
    };
  }
  return {
    kicker: "Step through it", title: "Mutually exclusive is not independent",
    viewBox: "0 0 600 310", label: "A unit square with event A on the left and event B either beside it or as a band across it",
    steps: 4, layout: layout,
    ledger: [{ name: "case", label: "Case", wide: true }, { name: "pB", label: "P(B)" }, { name: "pAB", label: "P(A and B)" },
      { name: "pBgivenA", label: "P(B | A)" }, { name: "verdict", label: "So", wide: true }],
    readouts: function (step) {
      var ind = step >= 2, zoom = step === 1 || step === 3;
      return {
        case: ind ? "Independent" : "Cannot both happen", pB: "0.3", pAB: ind ? "0.12" : "0",
        pBgivenA: zoom ? (ind ? "0.12 ÷ 0.4 = 0.3" : "0 ÷ 0.4 = 0") : "?",
        verdict: zoom ? (ind ? "Learning A changed nothing: independent" : "Learning A changed B: not independent") : "Press Next to zoom into A",
      };
    },
    say: [
      "Think of probability as area in a square of area 1. A is the left 0.4. B, area 0.3, sits entirely outside A, so they cannot both happen.",
      "Now learn that A happened: zoom into A. B is nowhere inside it, so P(B | A) = 0. Before the news it was 0.3. The news changed B completely: not independent.",
      "A new B, still area 0.3, now a band across the top. Part of it lies inside A: 0.4 × 0.3 = 0.12.",
      "Zoom into A again. B still fills 0.3 of what you see, the same share as before the news. Learning A changed nothing: that is independence.",
    ],
    build: function (svg) {
      title = Viz.svg("text", { class: "v-small", x: X + S / 2, y: 22 }, svg, "the whole square = 1");
      sq = Viz.svg("rect", { class: "v-out", x: X, y: Y, width: S, height: S }, svg);
      aRect = Viz.svg("rect", { class: "v-kept", y: Y, height: S }, svg);
      bRect = Viz.svg("rect", { class: "v-zone" }, svg);
      abRect = Viz.svg("rect", { class: "v-target", x: X, y: Y }, svg);
      aText = Viz.svg("text", { class: "v-label", y: Y + S - 26 }, svg, "A");
      bText = Viz.svg("text", { class: "v-label" }, svg, "B");
      Viz.svg("text", { class: "v-small", x: 452, y: 70 }, svg, "B's share of everything");
      Viz.svg("rect", { class: "v-out", x: 342, y: 88, width: 220, height: 26, rx: 4 }, svg);
      m1 = Viz.svg("rect", { class: "v-target", x: 342, y: 88, height: 26, rx: 4 }, svg);
      m1t = Viz.svg("text", { class: "v-label", x: 452, y: 138 }, svg, "0.3");
      Viz.svg("text", { class: "v-small", x: 452, y: 186 }, svg, "B's share inside A");
      Viz.svg("rect", { class: "v-out", x: 342, y: 204, width: 220, height: 26, rx: 4 }, svg);
      m2 = Viz.svg("rect", { class: "v-target", x: 342, y: 204, height: 26, rx: 4 }, svg);
      m2t = Viz.svg("text", { class: "v-label", x: 452, y: 254 }, svg, "?");
    },
    draw: function (c) {
      aRect.setAttribute("x", c.ax); aRect.setAttribute("width", c.aw);
      bRect.setAttribute("x", c.bx); bRect.setAttribute("width", Math.max(0, c.bw)); bRect.setAttribute("y", c.by); bRect.setAttribute("height", c.bh);
      bRect.setAttribute("opacity", c.bo);
      abRect.setAttribute("width", Math.max(0, c.abw)); abRect.setAttribute("height", c.abh);
      sq.setAttribute("opacity", c.outside); title.setAttribute("opacity", c.outside);
      aText.setAttribute("x", c.ax + c.aw / 2);
      bText.setAttribute("x", c.bx + c.bw / 2); bText.setAttribute("y", c.by + c.bh / 2); bText.setAttribute("opacity", c.bo);
      m1.setAttribute("width", c.m1); m2.setAttribute("width", c.m2);
      m2t.textContent = c.m2o > 0.6 ? (Math.round((c.m2 / 220) * 10) / 10).toString() : "?";
      m2t.setAttribute("opacity", Math.max(0.4, c.m2o));
    },
  };
})());
