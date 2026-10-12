/* Lesson 2 worked example: two dice, told the total is divisible by 5 (5 or 10). 36 pairs -> 7. */
Viz.stepped("two-dice-given-total", (function () {
  var C = 34, G = 4, X0 = 46, Y0 = 46, cells = [], marks = [], tag, row, kept = [];
  for (var a = 1; a <= 6; a++) for (var b = 1; b <= 6; b++) if ((a + b) % 5 === 0) kept.push(a * 10 + b);
  function layout(step) {
    var s = { row: step >= 2 ? 1 : 0, tag: step >= 2 ? 1 : 0 };
    for (var a = 1; a <= 6; a++) for (var b = 1; b <= 6; b++) {
      var key = a * 10 + b, k = kept.indexOf(key), id = "c" + key;
      var home = { x: X0 + (b - 1) * (C + G), y: Y0 + (a - 1) * (C + G) };
      var slot = { x: 316 + k * (C + 4), y: 120 };
      s[id + "x"] = step >= 2 && k >= 0 ? slot.x : home.x;
      s[id + "y"] = step >= 2 && k >= 0 ? slot.y : home.y;
      s[id + "o"] = k >= 0 || step === 0 ? 1 : 0.18;
      s[id + "m"] = k >= 0 && step >= 1 ? 1 : 0;
    }
    return s;
  }
  return {
    kicker: "Step through it", title: "Two dice: count inside the smaller bag",
    viewBox: "0 0 600 300", label: "A 6 by 6 grid of dice pairs; the pairs whose total is 5 or 10 move into a row of seven",
    steps: 4, layout: layout,
    ledger: [{ name: "bag", label: "Pairs in the bag" }, { name: "answer", label: "Chance both dice show 5", wide: true }],
    readouts: function (step) {
      return {
        bag: ["36 pairs", "7 pairs", "7 pairs", "7 pairs"][step],
        answer: ["P(both 5) = 1/36", "P(both 5 | total 5 or 10) = ?", "P(both 5 | total 5 or 10) = 1/7", "(1/36) ÷ (7/36) = 1/7"][step],
      };
    },
    say: [
      "Two fair dice give 36 equally likely pairs: first die down the side, second along the top. The pair 5-5 is one cell in 36.",
      "News: the total is divisible by 5. Only totals 5 and 10 qualify. Seven cells survive: four make 5, three make 10. The rest are ruled out.",
      "Move the survivors into their own small bag. 5-5 is one of the seven, so the chance is 1/7.",
      "Same answer by the formula: P(both 5 and total divisible by 5) = 1/36, divided by P(total divisible by 5) = 7/36. The 36s cancel: 1/7.",
    ],
    build: function (svg) {
      for (var i = 1; i <= 6; i++) {
        Viz.svg("text", { class: "v-small", x: X0 + (i - 1) * (C + G) + C / 2, y: 24 }, svg, String(i));
        Viz.svg("text", { class: "v-small", x: 24, y: Y0 + (i - 1) * (C + G) + C / 2 }, svg, String(i));
      }
      row = Viz.svg("g", {}, svg);
      Viz.svg("rect", { class: "v-out", x: 306, y: 106, width: 284, height: 62, rx: 8 }, row);
      Viz.svg("text", { class: "v-small", x: 448, y: 88 }, row, "the new, smaller bag");
      tag = Viz.svg("text", { class: "v-big", x: 448, y: 214 }, svg, "1 of 7");
      for (var a = 1; a <= 6; a++) for (var b = 1; b <= 6; b++) {
        var key = a * 10 + b, g = Viz.svg("g", {}, svg);
        Viz.svg("rect", { class: key === 55 ? "v-target" : "v-kept", width: C, height: C, rx: 5 }, g);
        var m = Viz.svg("text", { class: "v-cell", x: C / 2, y: C / 2 + 1 }, g, String(a + b));
        cells.push([key, g]); marks.push([key, m]);
      }
    },
    draw: function (c) {
      cells.forEach(function (p) {
        p[1].setAttribute("transform", "translate(" + c["c" + p[0] + "x"] + "," + c["c" + p[0] + "y"] + ")");
        p[1].setAttribute("opacity", c["c" + p[0] + "o"]);
      });
      marks.forEach(function (p) { p[1].setAttribute("opacity", c["c" + p[0] + "m"]); });
      row.setAttribute("opacity", c.row); tag.setAttribute("opacity", c.tag);
    },
  };
})());
