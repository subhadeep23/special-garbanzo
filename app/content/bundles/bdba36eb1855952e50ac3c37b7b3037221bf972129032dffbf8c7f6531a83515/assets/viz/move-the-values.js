/* Lesson 6: the weights p(x) = x/10 stay put while every value x is sent to g(x). A straight-line g carries the
   balance point along with it (E[2X + 1] = 2·3 + 1 = 7); squaring stretches the right side, so the new balance point
   E[X²] = 10 lands past g(E[X]) = 9. */
Viz.stepped("move-the-values", (function () {
  var P = [1, 2, 3, 4];                                   // weights in tenths
  var G = [function (x) { return x; }, function (x) { return 2 * x + 1; }, function (x) { return x * x; }];
  var NAMES = ["x, unchanged", "2x + 1, a straight line", "x², a curve"];
  var AXIS = 250, px = function (x) { return 40 + x * 31; };
  var eg = function (k) { return P.reduce(function (s, p, i) { return s + p * G[k](i + 1); }, 0) / 10; }; // exact: integer sums of tenths
  var bars = [], tags = [], fulcrum, cursor, cursorTag;
  function layout(step) {
    var out = { e: px(eg(step)), ge: px(G[step](eg(0))) };
    P.forEach(function (p, i) { out["x" + i] = px(G[step](i + 1)); });
    return out;
  }
  return {
    kicker: "Step through it", title: "Move the values, keep the weights",
    viewBox: "0 0 600 360", label: "Four weights of 0.1, 0.2, 0.3 and 0.4 on a number line from 0 to 17; at each step every weight moves from x to g(x), and a green fulcrum marks the new balance point beside a red dashed line at g of the old mean",
    steps: 3, layout: layout,
    ledger: [{ name: "g", label: "Send each x to", wide: true }, { name: "values", label: "New values" },
      { name: "eg", label: "New balance E[g(X)]" }, { name: "ge", label: "g(old balance), g(E[X])" }],
    readouts: function (step) {
      var vals = P.map(function (p, i) { return String(G[step](i + 1)); }).join(", ");
      return { g: NAMES[step], values: vals, eg: String(eg(step)), ge: String(G[step](eg(0))) };
    },
    say: [
      "The weights 0.1, 0.2, 0.3, 0.4 sit on 1, 2, 3, 4. They balance at 3: E[X] = 3. Now keep every weight and move only its position.",
      "Send each x to 2x + 1. Every gap doubles and everything shifts by 1, so the balance point goes along: E[2X + 1] = 7 = 2·3 + 1.",
      "Now send each x to x². The weights land on 1, 4, 9, 16. The right side is stretched far more than the left, so the balance moves to 10, past 3² = 9. E[X²] is not (E[X])².",
    ],
    build: function (svg) {
      Viz.svg("line", { class: "v-axis", x1: 30, y1: AXIS, x2: 580, y2: AXIS }, svg);
      [0, 5, 10, 15].forEach(function (x) {
        Viz.svg("line", { class: "v-axis", x1: px(x), y1: AXIS, x2: px(x), y2: AXIS + 10 }, svg);
        Viz.svg("text", { class: "v-small", x: px(x), y: 300 }, svg, String(x));
      });
      cursor = Viz.svg("line", { class: "v-cursor", y1: AXIS + 4, y2: 328 }, svg);
      cursorTag = Viz.svg("text", { class: "v-small", y: 346 }, svg);
      fulcrum = Viz.svg("polygon", { class: "v-answer" }, svg);
      P.forEach(function (p) {
        bars.push(Viz.svg("rect", { class: "v-target", y: AXIS - p * 45, width: 22, height: p * 45 }, svg));
        tags.push(Viz.svg("text", { class: "v-small", y: AXIS - p * 45 - 16 }, svg, "0." + p));
      });
    },
    draw: function (c) {
      for (var i = 0; i < 4; i++) { bars[i].setAttribute("x", c["x" + i] - 11); tags[i].setAttribute("x", c["x" + i]); }
      fulcrum.setAttribute("points", [c.e, AXIS + 2, c.e - 16, AXIS + 34, c.e + 16, AXIS + 34].join(" "));
      cursor.setAttribute("x1", c.ge); cursor.setAttribute("x2", c.ge);
      cursorTag.setAttribute("x", c.ge); cursorTag.textContent = "g(E[X])";
    },
    predict: {
      prompt: "Predict first: square every value and keep the weights. Where does the new balance point land?",
      options: ["exactly at 3² = 9", "to the right of 9", "to the left of 9"], reveal: 2,
      verdict: function (i) {
        return i === 1 ? "You predicted right of 9. Correct: E[X²] = 10."
          : "You predicted " + ["exactly at 3² = 9", "to the right of 9", "to the left of 9"][i] + ". It lands at 10, right of 9: E[X²] = 10.";
      },
    },
  };
})());
