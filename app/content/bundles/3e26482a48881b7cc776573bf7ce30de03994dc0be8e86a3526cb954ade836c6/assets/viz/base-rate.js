/* Lesson 3 base rates: a 99%-sensitive test with 5% false alarms, at a prevalence the learner chooses. */
Viz.live("base-rate", (function () {
  var N = 100000, SENS = 0.99, FALSE = 0.05, W = 540, X = 30, P = { "1/1000": 0.001, "1/100": 0.01, "1/10": 0.1, "1/2": 0.5 };
  var ill, well, tp, fp, tpT, fpT, illT;
  function counts(p) {
    var sick = Math.round(N * p), t = Math.round(sick * SENS), f = Math.round((N - sick) * FALSE);
    return { sick: sick, tp: t, fp: f, post: t / (t + f) };
  }
  var g = function (n) { return n.toLocaleString("en-US"); };
  return {
    kicker: "Try it", title: "Why a good test can still mislead",
    viewBox: "0 0 600 300", label: "Two bars: 100,000 people split into ill and healthy, and everyone who tests positive split into ill and healthy",
    ledger: [{ name: "sick", label: "Ill, of 100,000" }, { name: "tp", label: "Ill and positive" },
      { name: "fp", label: "Healthy but positive" }, { name: "post", label: "P(ill | positive)" }],
    initial: function () { return { p: "1/1000" }; },
    layout: function (s) {
      var c = counts(P[s.p]);
      // Bars keep a 2-unit minimum so a tiny share stays visible; labels use the true shares.
      return { ill: Math.max(2, (c.sick / N) * W), tp: Math.max(2, c.post * W), illPct: (c.sick / N) * 100, tpPct: c.post * 100 };
    },
    build: function (svg) {
      Viz.svg("text", { class: "v-small", x: 300, y: 26 }, svg, "everyone: 100,000 people");
      well = Viz.svg("rect", { class: "v-kept", x: X, y: 42, width: W, height: 54 }, svg);
      ill = Viz.svg("rect", { class: "v-target", x: X, y: 42, height: 54 }, svg);
      illT = Viz.svg("text", { class: "v-label", x: 300, y: 122 }, svg);
      Viz.svg("text", { class: "v-small", x: 300, y: 172 }, svg, "only the people who test positive");
      fp = Viz.svg("rect", { class: "v-kept", x: X, y: 188, width: W, height: 54 }, svg);
      tp = Viz.svg("rect", { class: "v-target", x: X, y: 188, height: 54 }, svg);
      tpT = Viz.svg("text", { class: "v-label", x: 300, y: 270 }, svg);
    },
    draw: function (c) {
      ill.setAttribute("width", c.ill); tp.setAttribute("width", c.tp);
      illT.textContent = "red = ill: " + Math.round(c.illPct * 10) / 10 + "% of people";
      tpT.textContent = "red = ill: " + Math.round(c.tpPct * 10) / 10 + "% of positives";
    },
    readouts: function (s) {
      var c = counts(P[s.p]);
      return { sick: g(c.sick), tp: g(c.tp), fp: g(c.fp), post: c.post.toFixed(3) };
    },
    say: function (s) {
      var c = counts(P[s.p]);
      return "If " + s.p + " of people are ill: " + g(c.tp) + " ill people test positive, and so do " + g(c.fp) +
        " healthy people (5% false alarms). A positive person is ill with chance " + g(c.tp) + " ÷ " + g(c.tp + c.fp) + " ≈ " + c.post.toFixed(3) + ".";
    },
    controls: function (box, api, el) {
      el("span", { class: "viz-label" }, box, "How common is the illness?");
      var row = el("div", { class: "viz-presets", role: "group", "aria-label": "Base rate" }, box);
      ["1/1000", "1/100", "1/10", "1/2"].forEach(function (p) {
        el("button", { type: "button", "data-viz-pick": p, "aria-pressed": "false" }, row, "1 in " + p.split("/")[1])
          .addEventListener("click", function () { api.set({ p: p }); });
      });
    },
    sync: function (s, box) {
      box.querySelectorAll("[data-viz-pick]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-viz-pick") === s.p)); });
    },
    seconds: 0.7,
    predict: {
      prompt: "Guess first: 1 person in 1,000 is ill. You test positive. What is the chance you are ill?",
      options: ["about 95%", "about 50%", "about 2%"],
      verdict: function (i) {
        return i === 2 ? "You guessed about 2%. Correct: 99 of 5,094 positives are ill."
          : "You guessed " + ["about 95%", "about 50%"][i] + ". Only 99 of 5,094 positives are ill: about 2%.";
      },
    },
  };
})());
