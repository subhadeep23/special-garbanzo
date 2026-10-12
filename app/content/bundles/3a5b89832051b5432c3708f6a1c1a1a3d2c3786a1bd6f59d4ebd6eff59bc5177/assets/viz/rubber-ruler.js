/* Lesson 16: X ~ U(0, 1) and Y = −2 ln X. Each strip of X holding probability 0.1 is carried to a strip of Y holding
   the same 0.1. Where the map stretches the axis, the strip is wide and its density low; where it squeezes, the strip
   is narrow and its density high. Height = 0.1 / width, and it matches f_Y(y) = ½e^(−y/2) = f_X · |dx/dy|. */
Viz.live("rubber-ruler", (function () {
  var STRIPS = { s1: [0.1, 0.2], s5: [0.5, 0.6], s9: [0.9, 1.0] };
  var XL = 60, XR = 540, XA = 70, YL = 40, YR = 580, YA = 250, YMAX = 5, H = 300;
  var xpx = function (x) { return XL + x * (XR - XL); }, ypx = function (y) { return YL + (Math.min(y, YMAX) / YMAX) * (YR - YL); };
  var g = function (x) { return -2 * Math.log(x); };
  var top, bottom, link1, link2;
  var four = function (v) { return v.toFixed(4); };
  function info(k) { var s = STRIPS[k], lo = g(s[1]), hi = g(s[0]), w = hi - lo; return { lo: lo, hi: hi, w: w, h: 0.1 / w, mid: (lo + hi) / 2 }; }
  return {
    kicker: "Try it", title: "Same probability, new width",
    viewBox: "0 0 600 300", label: "Top: the interval 0 to 1 for X with one strip of width 0.1 highlighted. Bottom: the y-axis from 0 to 5 with the strip's image under y = −2 ln x and the density curve one half e to the minus y over 2",
    ledger: [{ name: "strip", label: "Strip of X (probability 0.1)" }, { name: "image", label: "Its image on the y-axis" },
      { name: "height", label: "Height = 0.1 ÷ width" }, { name: "formula", label: "½e^(−y/2) at the middle" }],
    initial: function () { return { k: "s5" }; },
    layout: function (s) {
      var st = STRIPS[s.k], i = info(s.k);
      return { x0: xpx(st[0]), x1: xpx(st[1]), y0: ypx(i.lo), y1: ypx(i.hi), h: i.h * H };
    },
    build: function (svg) {
      Viz.svg("rect", { class: "v-kept", x: xpx(0), y: XA - 30, width: xpx(1) - xpx(0), height: 30, opacity: 0.5 }, svg);
      Viz.svg("line", { class: "v-axis", x1: XL, y1: XA, x2: XR, y2: XA }, svg);
      [0, 0.5, 1].forEach(function (x) { Viz.svg("text", { class: "v-small", x: xpx(x), y: XA + 20 }, svg, String(x)); });
      Viz.svg("text", { class: "v-small", x: 575, y: XA }, svg, "x");
      var pts = []; for (var i = 0; i <= 100; i++) { var y = (YMAX * i) / 100; pts.push(ypx(y) + "," + (YA - 0.5 * Math.exp(-y / 2) * H)); }
      Viz.svg("polyline", { class: "v-line", points: pts.join(" ") }, svg);
      Viz.svg("line", { class: "v-axis", x1: YL, y1: YA, x2: YR, y2: YA }, svg);
      [0, 1, 2, 3, 4, 5].forEach(function (y) { Viz.svg("text", { class: "v-small", x: ypx(y), y: YA + 20 }, svg, String(y)); });
      Viz.svg("text", { class: "v-small", x: 470, y: 160 }, svg, "f_Y = ½e^(−y/2)");
      link1 = Viz.svg("line", { class: "v-cursor" }, svg); link2 = Viz.svg("line", { class: "v-cursor" }, svg);
      top = Viz.svg("rect", { class: "v-target", y: XA - 30, height: 30 }, svg);
      bottom = Viz.svg("rect", { class: "v-target" }, svg);
    },
    draw: function (c) {
      top.setAttribute("x", c.x0); top.setAttribute("width", Math.max(1, c.x1 - c.x0));
      bottom.setAttribute("x", c.y0); bottom.setAttribute("width", Math.max(1, c.y1 - c.y0));
      bottom.setAttribute("y", YA - c.h); bottom.setAttribute("height", c.h);
      link1.setAttribute("x1", c.x1); link1.setAttribute("y1", XA); link1.setAttribute("x2", c.y0); link1.setAttribute("y2", YA - c.h);
      link2.setAttribute("x1", c.x0); link2.setAttribute("y1", XA); link2.setAttribute("x2", c.y1); link2.setAttribute("y2", YA - c.h);
    },
    readouts: function (s) {
      var st = STRIPS[s.k], i = info(s.k);
      return { strip: st[0].toFixed(1) + " to " + st[1].toFixed(1), image: four(i.lo) + " to " + four(i.hi) + " (width " + four(i.w) + ")",
        height: four(i.h), formula: four(0.5 * Math.exp(-i.mid / 2)) };
    },
    say: function (s) {
      var i = info(s.k);
      return "The strip lands on a stretch of width " + four(i.w) + ". It still holds 0.1, so its height is 0.1 ÷ " + four(i.w) + " = " + four(i.h) +
        ", close to the curve's " + four(0.5 * Math.exp(-i.mid / 2)) + " at the middle. Thinner strips would match exactly.";
    },
    controls: function (box, api, el) {
      el("span", { class: "viz-label" }, box, "Which strip of X");
      var row = el("div", { class: "viz-presets", role: "group", "aria-label": "Strip" }, box);
      [["s1", "0.1 to 0.2"], ["s5", "0.5 to 0.6"], ["s9", "0.9 to 1.0"]].forEach(function (k) {
        el("button", { type: "button", "data-viz-pick": k[0], "aria-pressed": "false" }, row, k[1]).addEventListener("click", function () { api.set({ k: k[0] }); });
      });
    },
    sync: function (s, box) { box.querySelectorAll("[data-viz-pick]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-viz-pick") === s.k)); }); },
    seconds: 0.6,
    predict: {
      prompt: "Guess first: the strip 0.9 to 1.0 lands near y = 0, the strip 0.1 to 0.2 far out. Which lands taller?",
      options: ["0.9 to 1.0, squeezed narrower", "0.1 to 0.2, stretched wider", "both equal, same probability"],
      verdict: function (i) {
        return i === 0 ? "You guessed 0.9 to 1.0. Correct: it lands on width 0.2107, so its height is 0.4746; the other spreads over 1.3863, height 0.0721."
          : "You guessed " + ["0.9 to 1.0, squeezed narrower", "0.1 to 0.2, stretched wider", "both equal, same probability"][i] + ". The 0.9 to 1.0 strip is taller: same 0.1 on width 0.2107, against width 1.3863.";
      },
    },
  };
})());
