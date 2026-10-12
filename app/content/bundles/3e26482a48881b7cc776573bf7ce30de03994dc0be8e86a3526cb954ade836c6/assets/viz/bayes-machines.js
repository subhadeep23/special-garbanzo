/* Lesson 3: prior x likelihood, then normalise. Three machines; defect rates drawn 10x taller to be visible. */
Viz.stepped("bayes-machines", (function () {
  var PRIOR = [0.35, 0.25, 0.40], RATE = [0.02, 0.01, 0.03], W = 540, X = 30, TOP = 50, H = 190, SCALE = 2000;
  var weight = PRIOR.map(function (p, i) { return p * RATE[i]; });
  var total = weight.reduce(function (a, b) { return a + b; }, 0);
  var post = weight.map(function (w) { return w / total; });
  var good = [], bad = [], names = [], note, sumLine;
  function layout(step) {
    var s = { note: step === 1 || step === 2 ? 1 : 0, sum: step === 3 ? 1 : 0 }, x = X, xp = X;
    for (var i = 0; i < 3; i++) {
      var w = PRIOR[i] * W, h = step >= 1 ? RATE[i] * SCALE : 0;
      s["gx" + i] = x; s["gw" + i] = w; s["gh" + i] = H - h; s["go" + i] = step === 0 ? 1 : step === 1 ? 1 : 0.15;
      if (step < 3) { s["bx" + i] = x; s["bw" + i] = w; s["by" + i] = TOP + H - h; s["bh" + i] = h; }
      else { s["bx" + i] = xp; s["bw" + i] = post[i] * W; s["by" + i] = TOP + 70; s["bh" + i] = 60; }
      s["nx" + i] = (step < 3 ? x + w / 2 : xp + (post[i] * W) / 2);
      if (step === 3) s["go" + i] = 0;
      x += w; xp += post[i] * W;
    }
    return s;
  }
  function f(x, d) { return x.toFixed(d); }
  return {
    kicker: "Step through it", title: "Bayes: weigh every route, then take your share",
    viewBox: "0 0 600 300", label: "A bar split by how many pens each machine makes, with each machine's defective share shaded and then re-scaled",
    steps: 4, layout: layout,
    ledger: [{ name: "stage", label: "Showing", wide: true }, { name: "m1", label: "Machine 1" }, { name: "m2", label: "Machine 2" },
      { name: "m3", label: "Machine 3" }, { name: "total", label: "Total" }],
    readouts: function (step) {
      var rows = [PRIOR.map(function (p) { return f(p, 2); }), RATE.map(function (r) { return f(r, 2); }),
        weight.map(function (w) { return f(w, 4); }), post.map(function (p) { return f(p, 3); })][step];
      return {
        stage: ["Prior: P(Ai)", "Likelihood: P(B | Ai)", "Branch weight: P(Ai) × P(B | Ai)", "Posterior: P(Ai | B)"][step],
        m1: rows[0], m2: rows[1], m3: rows[2], total: ["1.00", "—", f(total, 4), f(1, 3)][step],
      };
    },
    say: [
      "Before any evidence: each machine's width is its share of all pens, 35%, 25% and 40%. These are the priors.",
      "Each machine's defective pens are shaded red at the bottom, 2%, 1% and 3% of its pens. They are drawn 10 times taller so you can see them. These are the likelihoods.",
      "We learn the pen is defective, so only the red areas are still possible. Each red area is width × height = prior × likelihood: 0.0070, 0.0025 and 0.0120. Together, 0.0215.",
      "Stretch the red areas side by side to fill the bar. Each machine's share of the red is its posterior. Machine 3 rises from 0.40 to 0.558 because it is the sloppiest.",
    ],
    build: function (svg) {
      for (var i = 0; i < 3; i++) {
        good.push(Viz.svg("rect", { class: "v-kept", y: TOP }, svg));
        bad.push(Viz.svg("rect", { class: "v-target" }, svg));
        names.push(Viz.svg("text", { class: "v-label", y: 28 }, svg, "M" + (i + 1)));
      }
      note = Viz.svg("text", { class: "v-small", x: 300, y: 272 }, svg, "red heights drawn 10× taller");
      sumLine = Viz.svg("text", { class: "v-small", x: 300, y: 232 }, svg, "the red areas, re-scaled to total 1");
    },
    draw: function (c) {
      for (var i = 0; i < 3; i++) {
        good[i].setAttribute("x", c["gx" + i]); good[i].setAttribute("width", c["gw" + i]); good[i].setAttribute("height", Math.max(0, c["gh" + i]));
        good[i].setAttribute("opacity", c["go" + i]);
        bad[i].setAttribute("x", c["bx" + i]); bad[i].setAttribute("width", Math.max(0, c["bw" + i]));
        bad[i].setAttribute("y", c["by" + i]); bad[i].setAttribute("height", Math.max(0, c["bh" + i]));
        names[i].setAttribute("x", c["nx" + i]);
      }
      note.setAttribute("opacity", c.note); sumLine.setAttribute("opacity", c.sum);
    },
  };
})());
