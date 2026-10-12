/* Lesson 6: a p.m.f. on 1, 2, 3, 4 drawn as weights on a beam. Slide the fulcrum: the beam tips toward the heavier
   side until the fulcrum sits at Σ x·p(x), where the net turning Σ (x − t)·p(x) is zero. That point is E[X]. */
Viz.live("balance-beam", (function () {
  // Weights in hundredths, so every readout is exact integer arithmetic.
  var PMF = { equal: [25, 25, 25, 25], "x/10": [10, 20, 30, 40], piled: [70, 10, 10, 10], ends: [50, 0, 0, 50] };
  var NAME = { equal: "¼ on each of 1, 2, 3, 4", "x/10": "0.1, 0.2, 0.3, 0.4 on 1, 2, 3, 4", piled: "0.7 on 1, then 0.1 on 2, 3, 4", ends: "½ on 1 and ½ on 4" };
  var BEAM = 250, px = function (x) { return 120 + (x - 1) * 120; };
  var group, bars = [], tags = [], fulcrum, beam;
  var mean100 = function (k) { return PMF[k].reduce(function (s, p, i) { return s + (i + 1) * p; }, 0); }; // E[X] × 100
  var turn100 = function (s) { return mean100(s.d) - s.t * 10; };                                        // Σ (x − t)p(x) × 100
  function dec(n100) { var a = Math.abs(n100); return (n100 < 0 ? "−" : n100 > 0 ? "+" : "") + Math.floor(a / 100) + "." + String(a % 100).padStart(2, "0"); }
  function plain(n100) { var s = (n100 / 100).toFixed(2); return s.replace(/\.?0+$/, ""); }
  return {
    kicker: "Try it", title: "Slide the fulcrum until the beam is level",
    viewBox: "0 0 600 330", label: "A beam carrying four weights at 1, 2, 3 and 4, resting on a movable fulcrum above a number line; the beam tips toward the heavier side",
    ledger: [{ name: "weights", label: "Weights", wide: true }, { name: "t", label: "Fulcrum at t" },
      { name: "turn", label: "Net turning Σ (x − t)·p(x)" }, { name: "beam", label: "The beam" }, { name: "mean", label: "Σ x·p(x)" }],
    initial: function () { return { d: "equal", t: 20 }; },
    layout: function (s) {
      var out = { f: px(s.t / 10), ang: Math.max(-5.5, Math.min(5.5, turn100(s) * 0.06)) };
      PMF[s.d].forEach(function (p, i) { out["h" + i] = p * 3; });
      return out;
    },
    build: function (svg) {
      Viz.svg("line", { class: "v-axis", x1: 60, y1: 292, x2: 540, y2: 292 }, svg);
      [1, 2, 3, 4].forEach(function (x) {
        Viz.svg("line", { class: "v-axis", x1: px(x), y1: 286, x2: px(x), y2: 298 }, svg);
        Viz.svg("text", { class: "v-small", x: px(x), y: 316 }, svg, String(x));
      });
      fulcrum = Viz.svg("polygon", { class: "v-answer" }, svg);
      group = Viz.svg("g", {}, svg);
      beam = Viz.svg("rect", { class: "v-kept", x: 70, y: BEAM - 6, width: 460, height: 12, rx: 6 }, group);
      for (var i = 0; i < 4; i++) {
        bars.push(Viz.svg("rect", { class: "v-target", x: px(i + 1) - 22, width: 44 }, group));
        tags.push(Viz.svg("text", { class: "v-small" }, group));
      }
    },
    draw: function (c) {
      fulcrum.setAttribute("points", [c.f, BEAM + 6, c.f - 20, 292, c.f + 20, 292].join(" "));
      group.setAttribute("transform", "rotate(" + c.ang + " " + c.f + " " + BEAM + ")");
      for (var i = 0; i < 4; i++) {
        var h = Math.max(0, c["h" + i]);
        bars[i].setAttribute("y", BEAM - 6 - h); bars[i].setAttribute("height", h);
        tags[i].setAttribute("x", px(i + 1)); tags[i].setAttribute("y", BEAM - 24 - h);
        tags[i].textContent = h > 1 ? String(Math.round(h / 3) / 100) : "";
      }
    },
    readouts: function (s) {
      var n = turn100(s);
      return { weights: NAME[s.d], t: (s.t / 10).toFixed(1), turn: dec(n),
        beam: n > 0 ? "tips right" : n < 0 ? "tips left" : "level", mean: plain(mean100(s.d)) };
    },
    say: function (s) {
      var n = turn100(s);
      if (n === 0) return "Level. The fulcrum at " + (s.t / 10).toFixed(1) + " is exactly Σ x·p(x): the pull on each side cancels. That point is the expectation.";
      return "The fulcrum is at " + (s.t / 10).toFixed(1) + ". The weights pull the beam " + (n > 0 ? "right" : "left") +
        " with net turning " + dec(n) + ". Slide the fulcrum " + (n > 0 ? "right" : "left") + " to level it.";
    },
    controls: function (box, api, el) {
      el("span", { class: "viz-label" }, box, "Weights");
      var row = el("div", { class: "viz-presets", role: "group", "aria-label": "Which weights" }, box);
      [["equal", "¼ each"], ["x/10", "p(x) = x/10"], ["piled", "Piled at 1"], ["ends", "Both ends"]].forEach(function (k) {
        el("button", { type: "button", "data-viz-pick": k[0], "aria-pressed": "false" }, row, k[1])
          .addEventListener("click", function () { api.set({ d: k[0], t: api.state().t }); });
      });
      el("span", { class: "viz-label" }, box, "Fulcrum position t");
      var input = el("input", { type: "range", min: "1", max: "4", step: "0.1", value: "2", "data-viz-input": "", "aria-label": "Fulcrum position t" }, box);
      input.addEventListener("input", function () { api.set({ d: api.state().d, t: Math.round(Number(input.value) * 10) }); });
    },
    sync: function (s, box) {
      box.querySelectorAll("[data-viz-pick]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-viz-pick") === s.d)); });
      var input = box.querySelector("[data-viz-input]");
      if (Math.round(Number(input.value) * 10) !== s.t) input.value = (s.t / 10).toFixed(1);
    },
    seconds: 0.5,
    predict: {
      prompt: "Guess first: with p(x) = x/10, where does the beam balance?",
      options: ["at 2.5, the middle", "at 3", "at 4, the heaviest"],
      verdict: function (i) {
        return i === 1 ? "You guessed 3. Correct: 1(0.1) + 2(0.2) + 3(0.3) + 4(0.4) = 3."
          : "You guessed " + ["at 2.5, the middle", "at 3", "at 4, the heaviest"][i] + ". It balances at 3: 1(0.1) + 2(0.2) + 3(0.3) + 4(0.4) = 3.";
      },
    },
  };
})());
