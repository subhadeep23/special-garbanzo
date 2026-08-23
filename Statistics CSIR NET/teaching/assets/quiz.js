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
  .quiz{margin:1.6rem 0;padding:1.1rem 1.2rem;border:1px solid var(--rule);
    border-radius:8px;background:var(--bg)}
  .quiz h3{margin-top:0}
  .quiz .q{margin:1.1rem 0}
  .quiz .stem{font-weight:600;margin:.2rem 0 .6rem}
  .quiz button{display:block;width:100%;text-align:left;margin:.35rem 0;
    padding:.55rem .8rem;border:1px solid var(--rule);border-radius:6px;
    background:var(--card);color:var(--ink);font:inherit;font-size:.95rem;cursor:pointer;
    transition:.15s}
  .quiz button:hover{border-color:var(--accent2)}
  .quiz button.ok{border-color:var(--ok);background:color-mix(in srgb,var(--ok) 15%,transparent)}
  .quiz button.no{border-color:var(--no);background:color-mix(in srgb,var(--no) 15%,transparent)}
  .quiz .fb{display:none;margin:.5rem 0 0;font-size:.9rem;padding:.5rem .7rem;border-radius:6px;
    background:var(--card)}
  .quiz .fb.show{display:block}
  .quiz .fb.good{border-left:3px solid var(--ok)}
  .quiz .fb.bad{border-left:3px solid var(--no)}
  .quiz .score{font-family:var(--sans);font-size:.9rem;margin-top:1rem;color:var(--muted)}`;
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
