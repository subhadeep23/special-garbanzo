/* ============================================================
   check.js — instant-feedback drill component.
   Shared by every lesson. Vanilla JS. No dependencies. Offline.

   HOW TO USE IT IN A LESSON
   -------------------------
   <div class="drill" data-title="Warm-up">
     <table>
       <tr>
         <td class="n">1</td>
         <td class="q">... the question, maths markup allowed ...</td>
         <td><input data-a="6"
                    data-why="Substitute x = 3. The bottom is not zero, so you stop there."></td>
       </tr>
     </table>
   </div>

   data-a   = accepted answers, separated by "|".  Example: data-a="1/2|0.5"
   data-why = the ONE line that names the concept she missed. This is the
              teaching moment. Never write "wrong" here. Write the reason.

   The student presses Enter or clicks away. She gets a tick or a cross at
   once, and on a cross she gets the reason. That is the feedback loop.
   ============================================================ */

(function () {
  "use strict";

  /* --- turn what she typed into something comparable --- */
  function normalise(raw) {
    var s = String(raw).toLowerCase().trim();
    s = s.replace(/−/g, "-")          // real minus sign  -> hyphen
         .replace(/∞/g, "inf")        // infinity glyph
         .replace(/π/g, "pi")         // pi glyph
         .replace(/√/g, "sqrt")       // radical glyph
         .replace(/[\s,]/g, "")            // spaces and thousands commas
         .replace(/\.$/, "")               // trailing full stop
         .replace(/^\+/, "");              // leading plus
    // every way a student writes "there is no limit"
    if (/^(dne|doesnotexist|donotexist|nolimit|notexist|limitdoesnotexist|na)$/.test(s)) return "dne";
    if (/^(inf|infinity|infinite|\+inf)$/.test(s)) return "inf";
    if (/^(-inf|-infinity|-infinite)$/.test(s)) return "-inf";
    return s;
  }

  /* --- a numeric value, if the string is one; else null ---
     Accepts 6, -6, 0.5, .5, 3/7, -3/4. A leading dot is allowed because
     students type ".5" as often as "0.5". */
  var NUM = "-?(?:\\d+(?:\\.\\d*)?|\\.\\d+)";
  function toNumber(s) {
    if (new RegExp("^" + NUM + "$").test(s)) return parseFloat(s);
    var m = s.match(new RegExp("^(" + NUM + ")\\/(" + NUM + ")$"));
    if (m && parseFloat(m[2]) !== 0) return parseFloat(m[1]) / parseFloat(m[2]);
    return null;
  }

  function matches(given, accepted) {
    var g = normalise(given);
    if (g === "") return false;
    var list = String(accepted).split("|");
    for (var i = 0; i < list.length; i++) {
      var a = normalise(list[i]);
      if (g === a) return true;
      var gn = toNumber(g), an = toNumber(a);
      if (gn !== null && an !== null && Math.abs(gn - an) < 1e-9) return true;
    }
    return false;
  }

  /* --- wire one input --- */
  function wire(input) {
    var cell = input.parentNode;

    var mark = document.createElement("span");
    mark.className = "mark";
    cell.appendChild(mark);

    var why = document.createElement("p");
    why.className = "why";
    why.textContent = input.getAttribute("data-why") || "";
    cell.appendChild(why);

    function judge() {
      if (input.value.trim() === "") {
        input.className = ""; mark.textContent = ""; mark.className = "mark";
        why.className = "why"; input.dataset.state = "";
        tally(input); return;
      }
      var right = matches(input.value, input.getAttribute("data-a"));
      input.className = right ? "ok" : "no";
      mark.textContent = right ? "✓" : "✗";
      mark.className = "mark " + (right ? "ok" : "no");
      why.className = right ? "why" : "why show";
      input.dataset.state = right ? "ok" : "no";
      tally(input);
    }

    input.addEventListener("blur", judge);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); judge(); next(input); }
    });
  }

  /* --- jump to the next blank so she keeps her flow --- */
  function next(input) {
    var all = Array.prototype.slice.call(document.querySelectorAll("input[data-a]"));
    var i = all.indexOf(input);
    for (var j = i + 1; j < all.length; j++) {
      if (all[j].dataset.state !== "ok") { all[j].focus(); return; }
    }
  }

  /* --- running score for the block she is working in --- */
  function tally(input) {
    var block = input.closest(".drill");
    if (!block) return;
    var line = block.querySelector(".score");
    var inputs = block.querySelectorAll("input[data-a]");
    var ok = block.querySelectorAll('input[data-a][data-state="ok"]').length;
    var no = block.querySelectorAll('input[data-a][data-state="no"]').length;
    var done = ok + no;
    if (done === 0) { line.textContent = line.dataset.idle; return; }
    var msg = ok + " right out of " + done + " tried · " + inputs.length + " in the set";
    if (done === inputs.length) {
      msg += ok === inputs.length
        ? " · all correct. Move to the exercise set."
        : " · look at each red line. Say the reason aloud before you retry.";
    }
    line.textContent = msg;
  }

  /* --- teacher control: show every answer at once --- */
  function addControls(block) {
    var line = document.createElement("p");
    line.className = "score";
    line.dataset.idle = "Type an answer and press Enter. You get the result at once.";
    line.textContent = line.dataset.idle;
    block.appendChild(line);

    var btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "Show all answers (teacher)";
    btn.style.cssText =
      "font:600 .78rem/1 var(--sans);padding:.45rem .7rem;margin-top:.6rem;cursor:pointer;" +
      "background:var(--paper-2);color:var(--ink-soft);border:1px solid var(--rule);border-radius:4px;";
    btn.addEventListener("click", function () {
      block.querySelectorAll("input[data-a]").forEach(function (inp) {
        inp.value = String(inp.getAttribute("data-a")).split("|")[0];
        inp.dispatchEvent(new Event("blur"));
      });
    });
    block.appendChild(btn);
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".drill").forEach(addControls);
    document.querySelectorAll("input[data-a]").forEach(wire);
  });
})();
