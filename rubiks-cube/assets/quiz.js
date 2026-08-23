/* Reusable retrieval-practice quiz widget. Shared across lessons.
   Usage in a lesson:
     <div class="quiz" id="myquiz"></div>
     <script src="../assets/quiz.js"></script>
     <script>
       Quiz("#myquiz", [
         { q: "Question text?",
           options: ["aaaa", "bbbb", "cccc", "dddd"],  // keep options equal-length where possible
           answer: 0,                                    // index of correct option
           feedback: "Why this is the answer." }
       ]);
     </script>

   Design choices:
   - Options are SHUFFLED on load so position carries no clue.
   - Feedback appears only AFTER an answer (effortful retrieval first).
   - One attempt per question, then it locks — recall, not trial-and-error. */

function Quiz(selector, questions) {
  const root = document.querySelector(selector);
  if (!root) return;
  let answered = 0, correct = 0;
  const total = questions.length;

  const shuffle = (arr) => {
    const a = arr.map((v, i) => ({ v, i }));
    for (let k = a.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [a[k], a[j]] = [a[j], a[k]];
    }
    return a;
  };

  const scoreEl = document.createElement("div");
  scoreEl.className = "score";
  const renderScore = () =>
    (scoreEl.textContent = `Recalled ${correct}/${total} — ${answered}/${total} answered`);

  questions.forEach((item, qi) => {
    const block = document.createElement("div");
    const q = document.createElement("div");
    q.className = "q";
    q.textContent = `${qi + 1}. ${item.q}`;
    block.appendChild(q);

    const opts = document.createElement("div");
    opts.className = "opts";
    const fb = document.createElement("div");
    fb.className = "fb";

    shuffle(item.options).forEach(({ v, i }) => {
      const btn = document.createElement("button");
      btn.className = "opt";
      btn.textContent = v;
      btn.addEventListener("click", () => {
        Array.from(opts.children).forEach((b) => (b.disabled = true));
        answered++;
        if (i === item.answer) {
          btn.classList.add("correct");
          correct++;
          fb.textContent = "✓ " + (item.feedback || "Correct.");
        } else {
          btn.classList.add("wrong");
          Array.from(opts.children).forEach((b) => {
            if (b.textContent === item.options[item.answer]) b.classList.add("correct");
          });
          fb.textContent = "✗ " + (item.feedback || "");
        }
        renderScore();
      });
      opts.appendChild(btn);
    });

    block.appendChild(opts);
    block.appendChild(fb);
    root.appendChild(block);
  });

  renderScore();
  root.appendChild(scoreEl);
}
