/* Lesson 12: a bulb's life T, mean 1000 h, either exponential or uniform on (0, 2000). Slide "already survived s":
   the density left of s turns grey, and the readouts compare P(T > s + 500 | T > s) with a new bulb's P(T > 500).
   The exponential gives e^(−0.5) every time; the uniform bulb gets worse with age. */
Viz.live("bulb-survival", (function () {
  var L = 50, R = 570, BASE = 250, H = 170, TMAX = 2500;
  var LAWS = {
    exp: { name: "Exponential, mean 1000 h", f: function (t) { return Math.exp(-t / 1000) / 1000; }, S: function (t) { return Math.exp(-t / 1000); } },
    uni: { name: "Uniform on 0–2000 h, mean 1000 h", f: function (t) { return t < 2000 ? 1 / 2000 : 0; }, S: function (t) { return t >= 2000 ? 0 : 1 - t / 2000; } },
  };
  var px = function (t) { return L + (t / TMAX) * (R - L); };
  var py = function (d) { return BASE - (d / 0.001) * H; };
  var shades = {}, curves = {}, cut, mark;
  var four = function (v) { return v.toFixed(4); };
  function path(k, from, to) {
    var f = LAWS[k].f, pts = ["M" + px(from) + " " + BASE];
    for (var i = 0; i <= 100; i++) { var t = from + ((to - from) * i) / 100; pts.push("L" + px(t) + " " + py(f(t))); }
    pts.push("L" + px(to) + " " + BASE + " Z"); return pts.join(" ");
  }
  return {
    kicker: "Try it", title: "Does an old bulb remember its age?",
    viewBox: "0 0 600 290", label: "The density of a bulb's lifetime, exponential or uniform, with the stretch before the survived age greyed out and the next 500 hours shaded",
    ledger: [{ name: "law", label: "Lifetime model", wide: true }, { name: "s", label: "Already survived" },
      { name: "cond", label: "P(500 more h | survived)" }, { name: "fresh", label: "New bulb: P(T > 500)" }, { name: "compare", label: "Compared with new" }],
    initial: function () { return { law: "exp", s: 0 }; },
    layout: function (s) { return { s: px(s.s) }; },
    build: function (svg) {
      Viz.svg("line", { class: "v-axis", x1: L, y1: BASE, x2: R, y2: BASE }, svg);
      [0, 500, 1000, 1500, 2000, 2500].forEach(function (t) { Viz.svg("text", { class: "v-small", x: px(t), y: 274 }, svg, String(t)); });
      Object.keys(LAWS).forEach(function (k) {
        shades[k] = Viz.svg("path", { class: "v-target" }, svg);
        curves[k] = Viz.svg("path", { class: "v-line", d: path(k, 0, TMAX).replace(/ Z$/, "") }, svg);
      });
      cut = Viz.svg("rect", { class: "v-out", x: L, y: BASE - H - 20, height: H + 20, opacity: 0.8 }, svg);
      mark = Viz.svg("line", { class: "v-cursor", y1: BASE - H - 20, y2: BASE }, svg);
    },
    draw: function (c) {
      cut.setAttribute("width", Math.max(0, c.s - L));
      mark.setAttribute("x1", c.s); mark.setAttribute("x2", c.s);
    },
    readouts: function (s) {
      var g = LAWS[s.law], cond = g.S(s.s) > 0 ? g.S(s.s + 500) / g.S(s.s) : 0, fresh = g.S(500);
      return { law: g.name, s: s.s + " hours", cond: four(cond), fresh: four(fresh),
        compare: Math.abs(cond - fresh) < 1e-12 ? "the same: it forgets" : cond < fresh ? "worse: it wears out" : "better" };
    },
    say: function (s) {
      var g = LAWS[s.law], cond = g.S(s.s + 500) / g.S(s.s);
      return s.law === "exp" ? "Exponential: having lasted " + s.s + " h, the chance of 500 more is " + four(cond) + ", exactly a new bulb's e^(−0.5)."
        : "Uniform: having lasted " + s.s + " h, the chance of 500 more is " + four(cond) + ", against " + four(g.S(500)) + " for a new bulb. This bulb ages.";
    },
    sync: function (s, box) {
      box.querySelectorAll("[data-viz-pick]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-viz-pick") === s.law)); });
      var input = box.querySelector("[data-viz-input]"); if (Number(input.value) !== s.s) input.value = String(s.s);
      box.querySelector(".viz-label.s").textContent = "Already survived s = " + s.s + " hours";
      Object.keys(LAWS).forEach(function (k) {
        curves[k].setAttribute("opacity", k === s.law ? 1 : 0.25);
        shades[k].setAttribute("d", k === s.law ? path(k, s.s, Math.min(s.s + 500, TMAX)) : "");
      });
    },
    controls: function (box, api, el) {
      el("span", { class: "viz-label" }, box, "Lifetime model");
      var row = el("div", { class: "viz-presets", role: "group", "aria-label": "Lifetime model" }, box);
      [["exp", "Exponential"], ["uni", "Uniform"]].forEach(function (k) {
        el("button", { type: "button", "data-viz-pick": k[0], "aria-pressed": "false" }, row, k[1])
          .addEventListener("click", function () { api.set({ law: k[0], s: api.state().s }); });
      });
      el("span", { class: "viz-label s" }, box, "Already survived s = 0 hours");
      var input = el("input", { type: "range", min: "0", max: "1500", step: "250", value: "0", "data-viz-input": "", "aria-label": "Hours already survived" }, box);
      input.addEventListener("input", function () { api.set({ law: api.state().law, s: Number(input.value) }); });
    },
    seconds: 0.45,
    predict: {
      prompt: "Guess first: an exponential bulb (mean 1000 h) has already lasted 1000 h. Its chance of lasting 500 more is…",
      options: ["the same as a new bulb's", "lower, it is worn", "higher, it has proved itself"],
      verdict: function (i) {
        return i === 0 ? "You guessed the same. Correct: e^(−0.5) = 0.6065 at any age."
          : "You guessed " + ["the same as a new bulb's", "lower, it is worn", "higher, it has proved itself"][i] + ". It is the same: e^(−0.5) = 0.6065 at any age, because the exponential forgets.";
      },
    },
  };
})());
