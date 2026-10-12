/* Lesson 1: build an event from die faces and watch its probability on the 0-to-1 scale. */
Viz.live("event-builder", (function () {
  var NAMES = { even: [2, 4, 6], "two-or-five": [2, 5], everything: [1, 2, 3, 4, 5, 6], nothing: [] };
  var tiles = [], slices = [], meter, meterLabel, tickNow;
  var list = function (on) { return [1, 2, 3, 4, 5, 6].filter(function (f) { return on[f]; }); };
  return {
    kicker: "Try it", title: "An event is a chosen bunch of outcomes",
    viewBox: "0 0 600 300", label: "Six die faces above a bar split into six equal slices, and a 0-to-1 probability scale below",
    ledger: [
      { name: "event", label: "Event (your chosen faces)", wide: true },
      { name: "p", label: "Probability of the event" },
      { name: "not", label: "Probability of NOT the event" },
      { name: "sum", label: "Rule 3: separate faces add", wide: true },
    ],
    initial: function () { return { 1: 0, 2: 1, 3: 0, 4: 1, 5: 0, 6: 1 }; },
    layout: function (on) {
      var t = { k: 0 };
      for (var f = 1; f <= 6; f++) { t["s" + f] = on[f] ? 1 : 0; t.k += on[f] ? 1 : 0; }
      return t;
    },
    build: function (svg) {
      for (var f = 1; f <= 6; f++) {
        var g = Viz.svg("g", {}, svg); Viz.die(g, f, 66, false); tiles.push(g);
        var x = 30 + (f - 1) * 90;
        Viz.svg("rect", { class: "v-kept", x: x, y: 112, width: 90, height: 48 }, svg);
        slices.push(Viz.svg("rect", { class: "v-target", x: x, y: 112, width: 90, height: 48 }, svg));
        Viz.svg("text", { class: "v-label", x: x + 45, y: 136 }, svg, "1/6");
      }
      Viz.svg("line", { class: "v-axis", x1: 30, y1: 236, x2: 570, y2: 236 }, svg);
      Viz.svg("rect", { class: "v-out", x: 30, y: 216, width: 540, height: 20, rx: 4 }, svg);
      meter = Viz.svg("rect", { class: "v-target", x: 30, y: 216, width: 0, height: 20, rx: 4 }, svg);
      [[0, "0 · never"], [0.5, "0.5 · coin toss"], [1, "1 · certain"]].forEach(function (m) {
        var x = 30 + m[0] * 540;
        Viz.svg("line", { class: "v-axis", x1: x, y1: 210, x2: x, y2: 244 }, svg);
        Viz.svg("text", { class: "v-small", x: Math.min(520, Math.max(70, x)), y: 268 }, svg, m[1]);
      });
      tickNow = Viz.svg("path", { class: "v-red", d: "M-9,-14 L9,-14 L0,0 Z" }, svg);
      meterLabel = Viz.svg("text", { class: "v-label", y: 190 }, svg);
    },
    draw: function (c) {
      for (var f = 1; f <= 6; f++) {
        var lift = c["s" + f] * 10;
        tiles[f - 1].setAttribute("transform", "translate(" + (42 + (f - 1) * 90) + "," + (18 - lift) + ")");
        tiles[f - 1].firstChild.setAttribute("class", "v-face" + (c["s" + f] > 0.5 ? " target" : ""));
        slices[f - 1].setAttribute("opacity", c["s" + f]);
      }
      var x = 30 + (c.k / 6) * 540;
      meter.setAttribute("width", Math.max(0, x - 30));
      tickNow.setAttribute("transform", "translate(" + x + ",214)");
      meterLabel.setAttribute("x", Math.min(540, Math.max(60, x)));
      meterLabel.textContent = "P = " + Math.round(c.k) + "/6";
    },
    readouts: function (on) {
      var faces = list(on), k = faces.length;
      return {
        event: k ? "{" + faces.join(", ") + "}" : "{ }",
        p: k + "/6", not: (6 - k) + "/6",
        sum: k ? faces.map(function () { return "1/6"; }).join(" + ") + " = " + k + "/6" : "no faces chosen = 0/6",
      };
    },
    say: function (on) {
      var k = list(on).length;
      if (k === 0) return "No faces chosen: this event never happens, so its probability is 0. Rule 1: nothing goes below 0.";
      if (k === 6) return "Every face chosen: something must happen, so the probability is 1. Rule 2: the whole bag totals 1.";
      return "Each face is a separate sixth, so they add: " + k + "/6. The faces you did not choose make up the rest, " + (6 - k) + "/6. Together they total 1.";
    },
    controls: function (box, api, el) {
      var row = el("div", { class: "viz-faces", role: "group", "aria-label": "Choose faces" }, box);
      for (var f = 1; f <= 6; f++) (function (f) {
        var b = el("button", { type: "button", "data-viz-face": String(f), "aria-pressed": "false" }, row, String(f));
        b.addEventListener("click", function () { var s = Object.assign({}, api.state()); s[f] = s[f] ? 0 : 1; api.set(s); });
      })(f);
      var presets = el("div", { class: "viz-presets", role: "group", "aria-label": "Quick events" }, box);
      [["even", "Even"], ["two-or-five", "2 or 5"], ["everything", "Every face"], ["nothing", "No face"]].forEach(function (p) {
        el("button", { type: "button", "data-viz-pick": p[0] }, presets, p[1]).addEventListener("click", function () {
          var s = {}; for (var f = 1; f <= 6; f++) s[f] = NAMES[p[0]].indexOf(f) >= 0 ? 1 : 0; api.set(s);
        });
      });
    },
    sync: function (on, box) {
      box.querySelectorAll("[data-viz-face]").forEach(function (b) { b.setAttribute("aria-pressed", String(!!on[b.getAttribute("data-viz-face")])); });
    },
    seconds: 0.45,
  };
})());
