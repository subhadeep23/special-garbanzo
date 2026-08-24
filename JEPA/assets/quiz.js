/* Shared retrieval-quiz component for the JEPA course.
 *
 * Markup contract (one or many per page):
 *   <div class="quiz" data-quiz>
 *     <p class="q">Question text</p>
 *     <button data-ok="0" data-fb="Why this is wrong.">Option</button>
 *     <button data-ok="1" data-fb="Why this is right.">Option</button>
 *     <p class="feedback"></p>
 *   </div>
 *
 * Behaviour: one click locks the question, marks the choice, reveals the correct
 * option when the choice is wrong, and prints the per-option feedback.
 * Feedback falls back to the correct option's data-fb if the wrong option has none.
 */
(function () {
  function wire(quiz) {
    var buttons = Array.prototype.slice.call(quiz.querySelectorAll('button'));
    var feedback = quiz.querySelector('.feedback');
    var right = quiz.querySelector('button[data-ok="1"]');

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (b) { b.disabled = true; });
        var correct = button.dataset.ok === '1';
        button.classList.add(correct ? 'correct' : 'wrong');
        if (!correct && right) { right.classList.add('correct'); }
        if (feedback) {
          feedback.textContent = button.dataset.fb || (right && right.dataset.fb) || '';
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-quiz]').forEach(wire);
  });
})();
