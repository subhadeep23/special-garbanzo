/* Lesson 5: a dart lands uniformly on [0, 1]. Zoom in on 0.5: each window is ten times narrower and holds a tenth
   of the probability, until the window is the single point 0.5 and holds nothing. */
Viz.stepped("dart-point", (function () {
  var HALF = [0.5, 0.05, 0.005, 0.0005, 0], ZOOM = ["×1", "×10", "×100", "×1,000", "a single point"];
  var L = 60, R = 540, win, big, bigL, bigR, zoom, pt;
  var px = function (x) { return L + x * (R - L); };
  function layout(step) {
    var hw = HALF[step];
    return { lo: px(0.5 - hw), hi: px(0.5 + hw), bw: step === 4 ? 0 : 300, pt: step === 4 ? 1 : 0 };
  }
  var fmt = function (x) { return String(Math.round(x * 10000) / 10000); };
  return {
    kicker: "Step through it", title: "Zoom in on one point",
    viewBox: "0 0 600 280", label: "A number line from 0 to 1 with a red window around 0.5 that shrinks tenfold at each step, and a magnified copy of the window below",
    steps: 5, layout: layout,
    ledger: [{ name: "window", label: "Window around 0.5" }, { name: "p", label: "P(dart lands in it)" }],
    readouts: function (step) {
      var hw = HALF[step];
      return { window: step === 4 ? "exactly 0.5" : fmt(0.5 - hw) + " to " + fmt(0.5 + hw), p: ["1", "0.1", "0.01", "0.001", "0"][step] };
    },
    say: [
      "The dart lands anywhere from 0 to 1, every stretch equally likely. The chance of landing in a stretch is its length. The whole line: probability 1.",
      "A window ten times narrower around 0.5, from 0.45 to 0.55. Length 0.1, so probability 0.1.",
      "Ten times narrower again: 0.495 to 0.505. Probability 0.01. Magnified, the window looks the same; on the real line it is almost gone.",
      "0.4995 to 0.5005. Probability 0.001. Every zoom divides the chance by ten, and you can zoom for ever.",
      "The window is now the single point 0.5. It is inside every window above, so its chance is below 1, 0.1, 0.01, 0.001… The only number below all of them is 0.",
    ],
    build: function (svg) {
      Viz.svg("line", { class: "v-axis", x1: L, y1: 80, x2: R, y2: 80 }, svg);
      [[0, "0"], [0.5, "0.5"], [1, "1"]].forEach(function (t) {
        Viz.svg("line", { class: "v-axis", x1: px(t[0]), y1: 72, x2: px(t[0]), y2: 88 }, svg);
        Viz.svg("text", { class: "v-small", x: px(t[0]), y: 110 }, svg, t[1]);
      });
      win = Viz.svg("rect", { class: "v-target", y: 62, height: 36 }, svg);
      Viz.svg("text", { class: "v-small", x: 300, y: 158 }, svg, "the red window, magnified");
      big = Viz.svg("rect", { class: "v-target", y: 178, height: 48 }, svg);
      bigL = Viz.svg("text", { class: "v-note", y: 250 }, svg);
      bigR = Viz.svg("text", { class: "v-small", y: 250 }, svg);
      zoom = Viz.svg("text", { class: "v-label", x: 300, y: 30 }, svg);
      pt = Viz.svg("circle", { class: "v-red", cx: 300, cy: 202, r: 7 }, svg);
    },
    draw: function (c) {
      win.setAttribute("x", c.lo); win.setAttribute("width", Math.max(1.5, c.hi - c.lo));
      win.setAttribute("opacity", c.pt > 0.5 ? 0 : 1);
      big.setAttribute("x", 300 - c.bw / 2); big.setAttribute("width", c.bw);
      pt.setAttribute("opacity", c.pt);
      var hw = (c.hi - c.lo) / 2 / (R - L);
      var step = HALF.indexOf(HALF.reduce(function (best, h) { return Math.abs(h - hw) < Math.abs(best - hw) ? h : best; }));
      zoom.textContent = "magnified " + ZOOM[step];
      bigL.setAttribute("x", 300 - c.bw / 2 + 40); bigL.textContent = c.bw > 1 ? fmt(0.5 - HALF[step]) : "";
      bigR.setAttribute("x", 300 + c.bw / 2 - 30); bigR.textContent = c.bw > 1 ? fmt(0.5 + HALF[step]) : "";
    },
    predict: {
      prompt: "Predict first: what is the chance the dart lands exactly on 0.5?",
      options: ["1/2", "tiny but above 0", "exactly 0"], reveal: 4,
      verdict: function (i) {
        return i === 2 ? "You predicted exactly 0. Correct." : "You predicted " + ["1/2", "tiny but above 0"][i] + ". A single point is inside every window, so its chance is 0.";
      },
    },
  };
})());
