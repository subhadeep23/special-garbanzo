/* Lesson 10: condition on "no six in the first m rolls". The first m bars turn grey (ruled out); the rest are divided
   by P(X > m) = (5/6)^m and redrawn. They are exactly the original bars shifted right by m: the die has forgotten. */
Viz.live("memoryless-shift", (function () {
  var K = 14, L = 40, R = 570, BASE = 250, UNIT = 900;       // pmf heights scaled so 1/6 → 150
  var bars = [], ghost = [];
  var px = function (k) { return L + ((k - 0.5) / K) * (R - L); };
  var pm = function (k) { return Math.pow(5 / 6, k - 1) / 6; };
  var pow = function (b, e) { var r = 1; for (var i = 0; i < e; i++) r *= b; return r; };
  var gcd = function (a, b) { return b ? gcd(b, a % b) : a; };
  function frac(n, d) { var g = gcd(n, d); return d / g === 1 ? String(n / g) : n / g + "/" + d / g; }
  return {
    kicker: "Try it", title: "Given no six yet, the wait starts over",
    viewBox: "0 0 600 300", label: "Bars for when the first six comes, with the first m rolls ruled out in grey and the remaining bars rescaled; dashed outlines show the original bars shifted right by m",
    ledger: [{ name: "given", label: "Told", wide: true }, { name: "tail", label: "P(X > m), the share kept" },
      { name: "next", label: "Next three bars, rescaled", wide: true }, { name: "match", label: "Same as the first three at the start?" }],
    initial: function () { return { m: 0 }; },
    layout: function (s) {
      var out = {};
      for (var k = 1; k <= K; k++) { out["h" + k] = (k > s.m ? pm(k) / Math.pow(5 / 6, s.m) : pm(k)) * UNIT; out["o" + k] = k > s.m ? 1 : 0; out["g" + k] = (k > s.m ? pm(k - s.m) : 0) * UNIT; }
      return out;
    },
    build: function (svg) {
      Viz.svg("line", { class: "v-axis", x1: 20, y1: BASE, x2: 580, y2: BASE }, svg);
      for (var k = 1; k <= K; k++) {
        bars.push([Viz.svg("rect", { class: "v-out", x: px(k) - 14, width: 28 }, svg), Viz.svg("rect", { class: "v-kept", x: px(k) - 14, width: 28 }, svg)]);
        ghost.push(Viz.svg("rect", { class: "v-slot", x: px(k) - 17, width: 34 }, svg));
        if (k === 1 || k % 3 === 0) Viz.svg("text", { class: "v-small", x: px(k), y: 274 }, svg, String(k));
      }
    },
    draw: function (c) {
      for (var k = 1; k <= K; k++) {
        var h = Math.max(0, Math.min(BASE - 10, c["h" + k])), g = Math.max(0, c["g" + k]);
        bars[k - 1].forEach(function (b, j) { b.setAttribute("y", BASE - h); b.setAttribute("height", h); b.setAttribute("opacity", j ? c["o" + k] : 1 - c["o" + k]); });
        ghost[k - 1].setAttribute("y", BASE - g); ghost[k - 1].setAttribute("height", g); ghost[k - 1].setAttribute("opacity", g > 1 ? 1 : 0);
      }
    },
    readouts: function (s) {
      var m = s.m, d = pow(6, m);
      // P(X = m + j | X > m) = P(X = m + j) / P(X > m) = [5^(m+j−1)/6^(m+j)] / [5^m/6^m], as integers, then reduced
      var cond = [1, 2, 3].map(function (j) { return frac(pow(5, m + j - 1) * d, pow(6, m + j) * pow(5, m)); });
      var start = [1, 2, 3].map(function (j) { return frac(pow(5, j - 1), pow(6, j)); });
      return { given: m === 0 ? "nothing yet" : "no six in the first " + m + " roll" + (m > 1 ? "s" : ""),
        tail: frac(pow(5, m), d), next: "rolls " + (m + 1) + "–" + (m + 3) + ": " + cond.join(", "),
        match: cond.join() === start.join() ? "yes: " + start.join(", ") : "no" };
    },
    say: function (s) {
      if (s.m === 0) return "The first six comes on roll 1 with chance 1/6, on roll 2 with 5/36, on roll 3 with 25/216. Slide m to rule out early sixes.";
      return "Told no six in " + s.m + " roll" + (s.m > 1 ? "s" : "") + ", the grey bars are ruled out. Divide the rest by (5/6)^" + s.m +
        " and they land exactly on the dashed outlines: the original shape, shifted " + s.m + " to the right.";
    },
    controls: function (box, api, el) {
      el("span", { class: "viz-label m" }, box, "Rolls already without a six: m = 0");
      var input = el("input", { type: "range", min: "0", max: "6", step: "1", value: "0", "data-viz-input": "", "aria-label": "Rolls already without a six" }, box);
      input.addEventListener("input", function () { api.set({ m: Number(input.value) }); });
    },
    sync: function (s, box) {
      var input = box.querySelector("[data-viz-input]"); if (Number(input.value) !== s.m) input.value = String(s.m);
      box.querySelector(".viz-label.m").textContent = "Rolls already without a six: m = " + s.m;
    },
    seconds: 0.6,
    predict: {
      prompt: "Guess first: no six in the first 3 rolls. What is the chance the 4th roll is a six?",
      options: ["1/6, same as ever", "more, a six is due", "less, the die is cold"],
      verdict: function (i) {
        return i === 0 ? "You guessed 1/6. Correct: set m = 3 and the next bar is 1/6 again."
          : "You guessed " + ["1/6, same as ever", "more, a six is due", "less, the die is cold"][i] + ". It is 1/6: set m = 3 and the next bar is 1/6 again.";
      },
    },
  };
})());
