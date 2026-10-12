/* Lesson 4: a random variable attaches a number to each outcome; grouping gives the distribution. */
Viz.stepped("outcomes-to-numbers", (function () {
  var OUT = ["HHH", "HHT", "HTH", "THH", "HTT", "THT", "TTH", "TTT"], CW = 92, CH = 36, BASE = 250, chips = [], badges = [], bars = [], axis;
  var heads = OUT.map(function (o) { return o.split("H").length - 1; });
  function layout(step) {
    var s = { axis: step >= 2 ? 1 : 0 }, filled = [0, 0, 0, 0];
    OUT.forEach(function (o, i) {
      var h = heads[i];
      if (step < 2) { s["x" + i] = 22 + (i % 4) * 142; s["y" + i] = 40 + Math.floor(i / 4) * 70; }
      else { s["x" + i] = 104 + h * 120 - CW / 2; s["y" + i] = BASE - (filled[h] + 1) * (CH + 4); filled[h]++; }
      s["b" + i] = step >= 1 ? 1 : 0;
      s["o" + i] = step === 3 ? 0.35 : 1;
    });
    for (var h = 0; h < 4; h++) s["bar" + h] = step === 3 ? 1 : 0;
    return s;
  }
  return {
    kicker: "Step through it", title: "From outcomes to numbers",
    viewBox: "0 0 600 300", label: "Eight coin-toss outcomes get their number of heads and stack into four columns",
    steps: 4, layout: layout,
    ledger: [{ name: "stage", label: "Showing", wide: true }, { name: "pmf", label: "P(X = 0, 1, 2, 3)", wide: true }],
    readouts: function (step) {
      return {
        stage: ["8 outcomes, each 1/8", "Each outcome gets a number: its count of heads", "Group the outcomes with the same number",
          "Heights are probabilities; they total 8/8 = 1"][step],
        pmf: ["—", "—", "counts 1, 3, 3, 1", "1/8, 3/8, 3/8, 1/8"][step],
      };
    },
    say: [
      "Toss a fair coin three times. There are eight outcomes, all equally likely, so each has chance 1/8.",
      "The random variable X is a rule: count the heads. Each outcome gets one number. TTT gets 0 and HHH gets 3.",
      "Stack outcomes that got the same number. One way to get 0 heads, three ways to get 1, three ways to get 2 and one way to get 3.",
      "Each stack's height in eighths is P(X = x): 1/8, 3/8, 3/8 and 1/8. Eight outcomes have become four numbers, and the total is still 1.",
    ],
    build: function (svg) {
      axis = Viz.svg("g", {}, svg);
      Viz.svg("line", { class: "v-axis", x1: 30, y1: BASE + 2, x2: 570, y2: BASE + 2 }, axis);
      for (var h = 0; h < 4; h++) {
        Viz.svg("text", { class: "v-small", x: 104 + h * 120, y: BASE + 24 }, axis, "X = " + h);
        var n = heads.filter(function (x) { return x === h; }).length;
        var bar = Viz.svg("g", {}, svg);
        Viz.svg("rect", { class: "v-target", x: 104 + h * 120 - CW / 2, y: BASE - n * (CH + 4), width: CW, height: n * (CH + 4) }, bar);
        Viz.svg("text", { class: "v-label", x: 104 + h * 120, y: BASE - n * (CH + 4) - 18 }, bar, n + "/8");
        bars.push(bar);
      }
      OUT.forEach(function (o, i) {
        var g = Viz.svg("g", {}, svg);
        Viz.svg("rect", { class: "v-kept", width: CW, height: CH, rx: 6 }, g);
        Viz.svg("text", { class: "v-cell", x: 34, y: CH / 2 }, g, o);
        var b = Viz.svg("g", {}, g);
        Viz.svg("circle", { class: "v-red", cx: CW - 14, cy: CH / 2, r: 12 }, b);
        Viz.svg("text", { class: "v-cell v-badge", x: CW - 14, y: CH / 2 + 1 }, b, String(heads[i]));
        chips.push(g); badges.push(b);
      });
    },
    draw: function (c) {
      chips.forEach(function (g, i) {
        g.setAttribute("transform", "translate(" + c["x" + i] + "," + c["y" + i] + ")");
        g.setAttribute("opacity", c["o" + i]); badges[i].setAttribute("opacity", c["b" + i]);
      });
      bars.forEach(function (b, h) { b.setAttribute("opacity", c["bar" + h]); });
      axis.setAttribute("opacity", c.axis);
    },
  };
})());
