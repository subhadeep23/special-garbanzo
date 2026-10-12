/* Reusable retrieval-practice quiz. Used by every lesson.
   Markup:
   <div class="quiz" data-quiz>
     <div class="q" data-answer="1"><p class="stem">...</p>
       <button>opt0</button><button>opt1</button>...
       <p class="fb" data-good="...correct explanation..." data-bad="...nudge..."></p>
     </div>
   </div>
   Answers should be equal length (no length tell). */
(function(){
  const css = `
  .quiz{margin:2.2rem -.35rem;padding:1.1rem 1.1rem .9rem;border-radius:14px;background:var(--card)}
  .quiz h3{margin-top:0}
  .quiz .q{margin:1.4rem 0 0;padding-top:1.2rem;border-top:1px solid var(--rule)}
  .quiz h3 + .q{border-top:0;padding-top:0}
  .quiz .stem{font-weight:600;margin:.2rem 0 .7rem}
  .quiz button{display:block;width:100%;min-height:48px;text-align:left;margin:.45rem 0;
    padding:.65rem .9rem;border:1px solid var(--rule);border-radius:10px;
    background:var(--bg);color:var(--ink);font:inherit;font-family:var(--sans);font-size:.95rem;line-height:1.45;
    cursor:pointer;touch-action:manipulation;transition:border-color .15s,background-color .15s}
  .quiz button:hover{border-color:var(--accent2)}
  .quiz button:focus-visible{outline:2px solid var(--accent2);outline-offset:2px}
  .quiz button.ok{border-color:var(--ok);background:color-mix(in srgb,var(--ok) 12%,var(--bg));font-weight:600}
  .quiz button.no{border-color:var(--no);background:color-mix(in srgb,var(--no) 10%,var(--bg))}
  .quiz .fb{display:none;margin:.6rem 0 0;font-family:var(--sans);font-size:.92rem;line-height:1.55;
    padding:.6rem .8rem;border-radius:0 8px 8px 0;background:var(--bg)}
  .quiz .fb.show{display:block}
  .quiz .fb.good{border-left:3px solid var(--ok)}
  .quiz .fb.bad{border-left:3px solid var(--no)}
  .quiz .score{font-family:var(--sans);font-size:.875rem;margin:1.1rem 0 0;color:var(--muted)}`;
  const s=document.createElement('style');s.textContent=css;document.head.appendChild(s);
  document.querySelectorAll('[data-quiz]').forEach(quiz=>{
    let done=0, right=0, total=quiz.querySelectorAll('.q').length;
    const score=document.createElement('p');score.className='score';
    score.textContent=`Answered 0 / ${total}`;quiz.appendChild(score);
    quiz.querySelectorAll('.q').forEach(q=>{
      const ans=+q.dataset.answer, fb=q.querySelector('.fb');
      q.querySelectorAll('button').forEach((b,i)=>{
        b.onclick=()=>{
          if(q.dataset.locked)return; q.dataset.locked=1; done++;
          if(i===ans){b.classList.add('ok');right++;fb.classList.add('good');
            fb.textContent='✓ '+fb.dataset.good;}
          else{b.classList.add('no');q.querySelectorAll('button')[ans].classList.add('ok');
            fb.classList.add('bad');fb.textContent='✗ '+fb.dataset.bad;}
          fb.classList.add('show');
          score.textContent=`Answered ${done} / ${total} · correct ${right}`;
          if(done===total)score.textContent+=right===total?' — perfect, lesson complete ✓':' — review the misses, then tell your teacher you’re done';
        };
      });
    });
  });
})();
