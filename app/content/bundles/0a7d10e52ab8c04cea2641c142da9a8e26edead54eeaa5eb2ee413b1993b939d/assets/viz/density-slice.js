/* Lesson 15: the joint density f(x, y) = x + y on the unit square, drawn as a shaded grid (darker = denser). Slide the
   slice x = x₀: the strip's heights, divided by the marginal f_X(x₀) = x₀ + 1/2, give the conditional density
   f(y | x₀) = (x₀ + y)/(x₀ + 1/2), drawn on the right. It changes with x₀, so X and Y are not independent. */
Viz.live("density-slice", (function () {
  var N = 10, S = 220, X0 = 30, Y0 = 30;                        // square from (30, 30) to (250, 250)
  var slice, line, top, bottom;
  var gx = function (x) { return X0 + x * S; }, gy = function (y) { return Y0 + S - y * S; };
  var PX = function (y) { return 330 + y * 240; }, PY = function (d) { return 250 - d * 100; };
  var four = function (v) { return (Math.round(v * 10000) / 10000).toFixed(4); };
  return {
    kicker: "Try it", title: "Slice the density, rescale the slice",
    viewBox: "0 0 600 290", label: "A unit square shaded darker toward its top-right corner for the density x plus y, with a vertical slice at x zero; on the right, the conditional density of y on that slice as a straight line",
    ledger: [{ name: "x0", label: "Slice at x₀" }, { name: "fx", label: "Marginal f_X(x₀) = x₀ + 1/2" },
      { name: "ends", label: "f(y | x₀) at y = 0 and y = 1", wide: true }, { name: "ey", label: "E[Y | X = x₀]" }],
    initial: function () { return { x: 0.2 }; },
    layout: function (s) {
      var m = s.x + 0.5;
      return { sx: gx(s.x), a: PY(s.x / m), b: PY((s.x + 1) / m) };
    },
    build: function (svg) {
      for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) {
        var cx = (i + 0.5) / N, cy = (j + 0.5) / N;
        Viz.svg("rect", { class: "v-kept", x: gx(i / N), y: gy((j + 1) / N), width: S / N, height: S / N, opacity: 0.1 + 0.6 * (cx + cy) / 2 * 2 }, svg);
      }
      Viz.svg("rect", { x: X0, y: Y0, width: S, height: S, fill: "none", class: "v-axis" }, svg);
      Viz.svg("text", { class: "v-small", x: gx(0.5), y: 276 }, svg, "x");
      Viz.svg("text", { class: "v-small", x: 14, y: gy(0.5) }, svg, "y");
      slice = Viz.svg("rect", { class: "v-target", y: Y0, width: 8, height: S }, svg);
      Viz.svg("line", { class: "v-axis", x1: 330, y1: 250, x2: 570, y2: 250 }, svg);
      Viz.svg("line", { class: "v-axis", x1: 330, y1: 250, x2: 330, y2: 50 }, svg);
      [[0, "0"], [1, "1"]].forEach(function (t) { Viz.svg("text", { class: "v-small", x: PX(t[0]), y: 274 }, svg, "y = " + t[1]); });
      [[1, "1"], [2, "2"]].forEach(function (t) { Viz.svg("text", { class: "v-note", x: 324, y: PY(t[0]) }, svg, t[1]); });
      Viz.svg("line", { class: "v-slot", x1: 330, y1: PY(1), x2: 570, y2: PY(1) }, svg);
      line = Viz.svg("line", { class: "v-line" }, svg);
      top = Viz.svg("circle", { class: "v-dot", r: 6 }, svg); bottom = Viz.svg("circle", { class: "v-dot", r: 6 }, svg);
      Viz.svg("text", { class: "v-small", x: 450, y: 32 }, svg, "f(y | x₀)");
    },
    draw: function (c) {
      slice.setAttribute("x", c.sx - 4);
      line.setAttribute("x1", PX(0)); line.setAttribute("y1", c.a); line.setAttribute("x2", PX(1)); line.setAttribute("y2", c.b);
      bottom.setAttribute("cx", PX(0)); bottom.setAttribute("cy", c.a); top.setAttribute("cx", PX(1)); top.setAttribute("cy", c.b);
    },
    readouts: function (s) {
      var m = s.x + 0.5;
      return { x0: s.x.toFixed(1), fx: four(m), ends: four(s.x / m) + " and " + four((s.x + 1) / m), ey: four((s.x / 2 + 1 / 3) / m) };
    },
    say: function (s) {
      var m = s.x + 0.5;
      return "On the slice x₀ = " + s.x.toFixed(1) + ", the density rises from " + four(s.x / m) + " at y = 0 to " + four((s.x + 1) / m) +
        " at y = 1. A different slice gives a different line, so Y's distribution depends on X.";
    },
    controls: function (box, api, el) {
      el("span", { class: "viz-label x" }, box, "Slice at x₀ = 0.2");
      var input = el("input", { type: "range", min: "0.1", max: "0.9", step: "0.1", value: "0.2", "data-viz-input": "", "aria-label": "Slice position x zero" }, box);
      input.addEventListener("input", function () { api.set({ x: Math.round(Number(input.value) * 10) / 10 }); });
    },
    sync: function (s, box) {
      var input = box.querySelector("[data-viz-input]"); if (Math.round(Number(input.value) * 10) !== Math.round(s.x * 10)) input.value = String(s.x);
      box.querySelector(".viz-label.x").textContent = "Slice at x₀ = " + s.x.toFixed(1);
    },
    seconds: 0.45,
    predict: {
      prompt: "Guess first: as the slice moves right (x₀ grows), the conditional density of Y on it…",
      options: ["gets flatter", "gets steeper", "stays the same"],
      verdict: function (i) {
        return i === 0 ? "You guessed flatter. Correct: the ends move from 1/6 and 11/6 at x₀ = 0.1 toward 9/14 and 19/14 at x₀ = 0.9."
          : "You guessed " + ["gets flatter", "gets steeper", "stays the same"][i] + ". It gets flatter: (x₀ + y)/(x₀ + 1/2) depends less on y as x₀ grows.";
      },
    },
  };
})());
