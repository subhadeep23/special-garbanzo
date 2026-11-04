/* Lesson 15: a joint p.m.f. of X (study hours band 1–3) and Y (grade band 1–3) as counts out of 20 students.
   Pick a row X = x: the row is lit, and its cells divided by the row total give the conditional P(Y = y | X = x).
   Two tables: one where the rows differ (dependent) and one where every row is the same shape (independent). */
Viz.live("joint-table", (function () {
  var TABLES = { dep: [[3, 1, 0], [2, 5, 3], [0, 2, 4]], ind: [[1, 2, 2], [2, 4, 4], [1, 2, 2]] };
  var NAME = { dep: "Table A (study and grades linked)", ind: "Table B (no link)" };
  var gcd = function (a, b) { return b ? gcd(b, a % b) : a; };
  var frac = function (n, d) { if (n === 0) return "0"; var g = gcd(n, d); return d / g === 1 ? String(n / g) : n / g + "/" + d / g; };
  var cells = [], nums = [], rowSums = [], colSums = [], bars = [], barTags = [];
  var CX = function (j) { return 82 + j * 68; }, CY = function (i) { return 84 + i * 58; };
  function layout(s) {
    var t = TABLES[s.t], row = t[s.x - 1], tot = row[0] + row[1] + row[2], out = {};
    for (var j = 0; j < 3; j++) out["b" + j] = (row[j] / tot) * 160;
    return out;
  }
  return {
    kicker: "Try it", title: "Slice a row, rescale it",
    viewBox: "0 0 600 295", label: "A three by three table of counts out of 20, with row and column totals; one row is highlighted and its counts, rescaled to sum to 1, are drawn as bars on the right",
    ledger: [{ name: "table", label: "Table", wide: true }, { name: "px", label: "P(X = x), the row total" },
      { name: "cond", label: "P(Y = 1, 2, 3 | X = x)", wide: true }, { name: "ey", label: "E[Y | X = x]" }],
    initial: function () { return { t: "dep", x: 1 }; },
    layout: layout,
    build: function (svg) {
      Viz.svg("text", { class: "v-small", x: 150, y: 16 }, svg, "Y = grade band");
      for (var j = 0; j < 3; j++) Viz.svg("text", { class: "v-small", x: CX(j), y: 44 }, svg, String(j + 1));
      for (var i = 0; i < 3; i++) {
        Viz.svg("text", { class: "v-small", x: 22, y: CY(i) + 2 }, svg, "X=" + (i + 1));
        cells.push([]); nums.push([]);
        for (var j2 = 0; j2 < 3; j2++) {
          cells[i].push(Viz.svg("rect", { x: CX(j2) - 32, y: CY(i) - 26, width: 64, height: 52, rx: 6 }, svg));
          nums[i].push(Viz.svg("text", { class: "v-cell", x: CX(j2), y: CY(i) }, svg));
        }
        rowSums.push(Viz.svg("text", { class: "v-cell", x: 290, y: CY(i) }, svg));
      }
      Viz.svg("text", { class: "v-small", x: 290, y: 44 }, svg, "total");
      for (var j3 = 0; j3 < 3; j3++) colSums.push(Viz.svg("text", { class: "v-cell", x: CX(j3), y: 272 }, svg));
      Viz.svg("text", { class: "v-small", x: 22, y: 272 }, svg, "total");
      Viz.svg("line", { class: "v-axis", x1: 340, y1: 230, x2: 590, y2: 230 }, svg);
      Viz.svg("text", { class: "v-small", x: 465, y: 30 }, svg, "Y given X = x");
      for (var k = 0; k < 3; k++) {
        bars.push(Viz.svg("rect", { class: "v-target", x: 360 + k * 75, width: 50 }, svg));
        barTags.push(Viz.svg("text", { class: "v-small", x: 385 + k * 75, y: 254 }, svg, "Y=" + (k + 1)));
      }
    },
    draw: function (c) { for (var k = 0; k < 3; k++) { var h = Math.max(0, c["b" + k]); bars[k].setAttribute("y", 230 - h); bars[k].setAttribute("height", h); } },
    sync: function (s, box) {
      var t = TABLES[s.t];
      for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) { nums[i][j].textContent = String(t[i][j]); cells[i][j].setAttribute("class", i === s.x - 1 ? "v-target" : "v-kept"); }
        rowSums[i].textContent = String(t[i][0] + t[i][1] + t[i][2]);
      }
      for (var j2 = 0; j2 < 3; j2++) colSums[j2].textContent = String(t[0][j2] + t[1][j2] + t[2][j2]);
      box.querySelectorAll("[data-viz-pick]").forEach(function (b) {
        var k = b.getAttribute("data-viz-pick"); b.setAttribute("aria-pressed", String(k === s.t || k === "x" + s.x));
      });
    },
    readouts: function (s) {
      var row = TABLES[s.t][s.x - 1], tot = row[0] + row[1] + row[2];
      return { table: NAME[s.t] + ", counts out of 20", px: frac(tot, 20), cond: row.map(function (v) { return frac(v, tot); }).join(", "),
        ey: frac(row[0] + 2 * row[1] + 3 * row[2], tot) };
    },
    say: function (s) {
      var row = TABLES[s.t][s.x - 1], tot = row[0] + row[1] + row[2];
      return "Row X = " + s.x + " holds " + tot + " of the 20 students. Divide each cell by " + tot + " and the row becomes the conditional distribution of Y. " +
        (s.t === "ind" ? "In this table every row rescales to the same shape: knowing X tells you nothing about Y." : "In this table the rows rescale to different shapes: X carries news about Y.");
    },
    controls: function (box, api, el) {
      el("span", { class: "viz-label" }, box, "Table");
      var r1 = el("div", { class: "viz-presets", role: "group", "aria-label": "Table" }, box);
      [["dep", "Table A"], ["ind", "Table B"]].forEach(function (k) {
        el("button", { type: "button", "data-viz-pick": k[0], "aria-pressed": "false" }, r1, k[1]).addEventListener("click", function () { api.set({ t: k[0], x: api.state().x }); });
      });
      el("span", { class: "viz-label" }, box, "Condition on the row X = x");
      var r2 = el("div", { class: "viz-presets", role: "group", "aria-label": "Row" }, box);
      [1, 2, 3].forEach(function (x) {
        el("button", { type: "button", "data-viz-pick": "x" + x, "aria-pressed": "false" }, r2, "X = " + x).addEventListener("click", function () { api.set({ t: api.state().t, x: x }); });
      });
    },
    seconds: 0.45,
    predict: {
      prompt: "Guess first: in Table B, how does the grade distribution given X = 3 compare with given X = 1?",
      options: ["exactly the same", "shifted to higher grades", "shifted to lower grades"],
      verdict: function (i) {
        return i === 0 ? "You guessed exactly the same. Correct: every row of Table B rescales to 1/5, 2/5, 2/5."
          : "You guessed " + ["exactly the same", "shifted to higher grades", "shifted to lower grades"][i] + ". It is exactly the same: every row of Table B rescales to 1/5, 2/5, 2/5.";
      },
    },
  };
})());
