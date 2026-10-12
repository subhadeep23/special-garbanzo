/* Lesson 2: news shrinks the bag. Six faces -> told "odd" -> three faces share the whole bar. */
Viz.stepped("die-given-odd", (function () {
  var T = 70, tiles = [], strikes = [], slices = [], l6 = [], l3 = [], frac;
  function layout(step) {
    var s = {}, kept = step >= 2;
    for (var i = 0; i < 6; i++) {
      var odd = i % 2 === 0, k = i / 2;
      s["tx" + i] = kept && odd ? 160 + k * 100 : 35 + i * 92;
      s["to" + i] = odd ? 1 : step === 0 ? 1 : step === 1 ? 0.3 : 0;
      s["tk" + i] = !odd && step === 1 ? 1 : 0;
      s["bx" + i] = kept ? (odd ? 30 + k * 180 : 30 + ((i + 1) / 2) * 180) : 30 + i * 90;
      s["bw" + i] = kept ? (odd ? 180 : 0) : 90;
      s["bo" + i] = odd ? 1 : step === 0 ? 1 : step === 1 ? 0.35 : 0;
    }
    s.l6 = kept ? 0 : 1; s.l3 = kept ? 1 : 0; s.frac = step === 3 ? 1 : 0;
    return s;
  }
  return {
    kicker: "Step through it", title: "News shrinks the bag",
    viewBox: "0 0 600 300", label: "Six die faces above a bar shared among the faces that are still possible",
    steps: 4, layout: layout,
    ledger: [{ name: "bag", label: "Outcomes in the bag" }, { name: "answer", label: "Chance of a 3", wide: true }],
    readouts: function (step) {
      return {
        bag: ["6 faces", "3 faces still possible", "3 faces", "3 faces"][step],
        answer: ["P(3) = 1/6", "P(3 | odd) = ?", "P(3 | odd) = 1/3", "P(3 | odd) = (1/6) ÷ (3/6) = 1/3"][step],
      };
    },
    say: [
      "A fair die. Six faces share the bar equally, so a 3 has one slice in six: 1/6.",
      "News: “the roll was odd.” The die did not change; what you know did. 2, 4 and 6 are now impossible, so they are crossed out.",
      "Throw the impossible faces out of the bag. Three faces are left and they share the whole bar, so each slice grows to 1/3.",
      "The formula does exactly this. Take the slice you want inside the news (1/6). Divide by everything that survived the news (3/6). Result: 1/3.",
    ],
    build: function (svg) {
      for (var i = 0; i < 6; i++) {
        slices.push(Viz.svg("rect", { class: i === 2 ? "v-target" : "v-kept", y: 118, height: 50 }, svg));
        l6.push(Viz.svg("text", { class: "v-label", y: 143 }, svg, "1/6"));
      }
      for (var j = 0; j < 6; j += 2) l3.push([j, Viz.svg("text", { class: "v-label", y: 143 }, svg, "1/3")]);
      for (var t = 0; t < 6; t++) {
        var g = Viz.svg("g", {}, svg); Viz.die(g, t + 1, T, t === 2);
        strikes.push(Viz.svg("line", { class: "v-strike", x1: 6, y1: T - 6, x2: T - 6, y2: 6 }, g));
        tiles.push(g);
      }
      frac = Viz.svg("g", {}, svg);
      Viz.svg("rect", { class: "v-target", x: 305, y: 198, width: 60, height: 28 }, frac);
      Viz.svg("line", { class: "v-axis", x1: 260, y1: 236, x2: 410, y2: 236 }, frac);
      [0, 1, 2].forEach(function (k) { Viz.svg("rect", { class: k === 1 ? "v-target" : "v-kept", x: 245 + k * 60, y: 246, width: 60, height: 28 }, frac); });
      Viz.svg("text", { class: "v-note", x: 240, y: 212 }, frac, "want 1/6");
      Viz.svg("text", { class: "v-note", x: 232, y: 260 }, frac, "survived 3/6");
      Viz.svg("text", { class: "v-big", x: 490, y: 236 }, frac, "= 1/3");
    },
    draw: function (c) {
      for (var i = 0; i < 6; i++) {
        tiles[i].setAttribute("transform", "translate(" + c["tx" + i] + ",22)");
        tiles[i].setAttribute("opacity", c["to" + i]);
        strikes[i].setAttribute("opacity", c["tk" + i]);
        slices[i].setAttribute("x", c["bx" + i]); slices[i].setAttribute("width", Math.max(0, c["bw" + i]));
        slices[i].setAttribute("opacity", c["bo" + i]);
        l6[i].setAttribute("x", c["bx" + i] + c["bw" + i] / 2); l6[i].setAttribute("opacity", c.l6 * c["bo" + i]);
      }
      l3.forEach(function (p) { p[1].setAttribute("x", c["bx" + p[0]] + c["bw" + p[0]] / 2); p[1].setAttribute("opacity", c.l3); });
      frac.setAttribute("opacity", c.frac);
    },
    predict: {
      prompt: "Predict first: if you are told the roll was odd, what is the chance it is a 3?",
      options: ["1/6", "1/3", "1/2"], reveal: 2,
      verdict: function (i) {
        return i === 1 ? "You predicted 1/3. Correct." : "You predicted " + ["1/6", "1/3", "1/2"][i] + ". The bag shrank to 3 faces, so it is 1/3.";
      },
    },
  };
})());
