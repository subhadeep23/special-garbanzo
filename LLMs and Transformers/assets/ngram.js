/* N-gram playground — shared component for the LLMs & Transformers course.
 *
 * Markup contract (one or many per page):
 *   <div class="ngram" data-ngram data-order="2">
 *     <textarea>training text goes here</textarea>
 *   </div>
 *
 * data-order  : n in "n-gram" (2 = bigram: look back 1 word). Default 2.
 *               The learner can change it with the on-page selector.
 *
 * What it renders under the textarea:
 *   - a "Build model" button and an order selector (1, 2, 3)
 *   - a context box: type the previous word(s), see the next-word table
 *     with the raw counts AND the division that turns them into probabilities
 *   - a "Generate" button that samples 25 words from the model
 *
 * Words are lower-cased; punctuation . , ! ? becomes its own token so sentences
 * have edges. No smoothing here on purpose: unseen contexts show an empty table,
 * which is Lesson 2's hook.
 */
(function () {
  function tokenize(text) {
    return text.toLowerCase().replace(/([.,!?;])/g, ' $1 ').split(/\s+/).filter(Boolean);
  }

  function build(tokens, n) {
    var table = {};
    for (var i = 0; i + n - 1 < tokens.length; i++) {
      var ctx = tokens.slice(i, i + n - 1).join(' ');
      var next = tokens[i + n - 1];
      table[ctx] = table[ctx] || {};
      table[ctx][next] = (table[ctx][next] || 0) + 1;
    }
    return table;
  }

  function sample(counts) {
    var total = 0, k;
    for (k in counts) total += counts[k];
    var r = Math.random() * total;
    for (k in counts) { r -= counts[k]; if (r < 0) return k; }
    return k;
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function wire(box) {
    var area = box.querySelector('textarea');
    var n = parseInt(box.dataset.order || '2', 10);
    var model = {}, tokens = [];

    var bar = el('div', 'ng-bar');
    var buildBtn = el('button', null, 'Build model');
    var order = el('select');
    [[1, 'look back 0 words (unigram)'], [2, 'look back 1 word (bigram)'], [3, 'look back 2 words (trigram)']]
      .forEach(function (o) {
        var opt = el('option', null, o[1]); opt.value = o[0];
        if (o[0] === n) opt.selected = true;
        order.appendChild(opt);
      });
    var stats = el('span', 'ng-stats');
    bar.append(buildBtn, order, stats);

    var ctxRow = el('div', 'ng-bar');
    var ctxLabel = el('label', null, 'Previous word(s): ');
    var ctxIn = el('input'); ctxIn.type = 'text'; ctxIn.placeholder = 'e.g. the';
    ctxLabel.appendChild(ctxIn);
    ctxRow.append(ctxLabel);
    var tableOut = el('div', 'ng-table');

    var genRow = el('div', 'ng-bar');
    var genBtn = el('button', null, 'Generate 25 words');
    genRow.append(genBtn);
    var genOut = el('p', 'ng-gen');

    box.append(bar, ctxRow, tableOut, genRow, genOut);

    function rebuild() {
      n = parseInt(order.value, 10);
      tokens = tokenize(area.value);
      model = build(tokens, n);
      stats.textContent = tokens.length + ' tokens · ' + Object.keys(model).length +
        (n === 1 ? ' table' : ' distinct contexts');
      ctxIn.disabled = n === 1;
      ctxIn.placeholder = n === 1 ? '(unigram: no context)' : n === 2 ? 'e.g. the' : 'e.g. of the';
      showTable();
      genOut.textContent = '';
    }

    function showTable() {
      tableOut.innerHTML = '';
      var ctx = n === 1 ? '' : tokenize(ctxIn.value).slice(-(n - 1)).join(' ');
      if (n > 1 && !ctx) { tableOut.appendChild(el('p', 'ng-note', 'Type a context word above.')); return; }
      var counts = model[ctx];
      if (!counts) {
        tableOut.appendChild(el('p', 'ng-note',
          '“' + ctx + '” never appears as a context in this text, so the model has nothing to say. ' +
          'Every probability is 0 — hold that thought for Lesson 2.'));
        return;
      }
      var total = 0, rows = Object.keys(counts);
      rows.forEach(function (w) { total += counts[w]; });
      rows.sort(function (a, b) { return counts[b] - counts[a]; });
      var t = el('table');
      var head = el('tr');
      ['next word', 'count', 'count ÷ total', 'probability'].forEach(function (h) { head.appendChild(el('th', null, h)); });
      t.appendChild(head);
      rows.slice(0, 12).forEach(function (w) {
        var tr = el('tr');
        tr.append(el('td', null, w), el('td', null, counts[w]),
          el('td', null, counts[w] + ' ÷ ' + total), el('td', null, (counts[w] / total).toFixed(3)));
        t.appendChild(tr);
      });
      tableOut.appendChild(t);
      if (rows.length > 12) tableOut.appendChild(el('p', 'ng-note', '…and ' + (rows.length - 12) + ' rarer words.'));
      tableOut.appendChild(el('p', 'ng-note', 'Total = ' + total + ' times “' + (ctx || 'any word') +
        '” was followed by something. The probabilities add up to 1.'));
    }

    function generate() {
      if (!tokens.length) return;
      var out = n === 1 ? [] : tokens.slice(0, n - 1);
      for (var i = 0; i < 25; i++) {
        var ctx = n === 1 ? '' : out.slice(-(n - 1)).join(' ');
        var counts = model[ctx];
        if (!counts) break; // dead end: the text's last words never continue
        out.push(sample(counts));
      }
      genOut.textContent = out.join(' ').replace(/ ([.,!?;])/g, '$1');
    }

    buildBtn.addEventListener('click', rebuild);
    order.addEventListener('change', rebuild);
    ctxIn.addEventListener('input', showTable);
    genBtn.addEventListener('click', generate);
    rebuild();
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-ngram]').forEach(wire);
  });
})();
