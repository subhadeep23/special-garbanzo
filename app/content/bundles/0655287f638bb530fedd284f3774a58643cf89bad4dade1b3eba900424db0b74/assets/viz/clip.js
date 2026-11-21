/* Manim clips in lessons (2026-11-04). The owner picked the Manim look (animation-lab/looktest, C) and chose
   "clip + live scene": a watch-only clip before the live scene, which stays for pressing buttons.

   <figure class="viz clip" data-clip="id" data-ends="t1,…,tn"> holds video.clip-light and video.clip-dark
   (clip.css shows the one for the theme) and <ol class="clip-say"> with one caption per step. Step k plays from
   ends[k-1] to ends[k] (step 0 from 0) and stops on its last frame. Back jumps without playing. Under reduced
   motion every step jumps straight to its last frame. data-busy="1" while a step plays. */
(function () {
  "use strict";
  var reduce = function () { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; };
  var darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  function el(tag, attrs, parent, text) {
    var node = document.createElement(tag);
    for (var key in attrs || {}) node.setAttribute(key, attrs[key]);
    if (text !== undefined) node.textContent = text;
    if (parent) parent.appendChild(node);
    return node;
  }

  document.querySelectorAll("figure.clip[data-clip]").forEach(function (figure) {
    var ends = figure.getAttribute("data-ends").split(",").map(Number);
    var videos = [].slice.call(figure.querySelectorAll("video"));
    var says = [].slice.call(figure.querySelectorAll(".clip-say li"));
    var stage = figure.querySelector(".clip-stage");
    var step = 0, raf = 0, guard = 0;
    var current = function () { return figure.querySelector(darkQuery.matches ? "video.clip-dark" : "video.clip-light"); };
    var endOf = function (k) { return Math.max(0, ends[k] - 0.02); };
    var seek = function (v, t) { try { v.currentTime = t; } catch (e) { /* not loaded yet: loadeddata parks it */ } };

    function park(k) {                      // the last frame of step k, in both videos, so a theme switch is instant
      cancelAnimationFrame(raf); clearTimeout(guard);
      videos.forEach(function (v) { v.pause(); seek(v, endOf(k)); });
      figure.removeAttribute("data-busy");
    }
    function play(k) {
      if (reduce()) { park(k); return; }
      var v = current(), from = k === 0 ? 0 : ends[k - 1];
      cancelAnimationFrame(raf); clearTimeout(guard);
      figure.setAttribute("data-busy", "1");
      seek(v, from);
      var started = v.play();
      if (started && started.catch) started.catch(function () { park(k); });
      (function stop() {
        if (v.ended || v.currentTime >= endOf(k) - 0.03) park(k); else raf = requestAnimationFrame(stop);
      })();
      guard = setTimeout(function () { park(k); }, (ends[k] - from) * 1000 + 1500);   // never stuck if playback stalls
    }

    var controls = el("div", { class: "viz-controls" });
    var prev = el("button", { type: "button", "data-clip-prev": "" }, controls, "Back");
    var next = el("button", { type: "button", "data-clip-next": "", class: "primary" }, controls, "Next");
    var replay = el("button", { type: "button", "data-clip-replay": "" }, controls, "Replay");
    var count = el("span", { class: "viz-count", "aria-hidden": "true" }, controls);
    stage.parentNode.insertBefore(controls, stage.nextSibling);

    function words() {
      figure.setAttribute("data-step", String(step));
      says.forEach(function (li, i) { li.hidden = i !== step; });
      count.textContent = "Step " + (step + 1) + " of " + ends.length;
      prev.disabled = step === 0;
      next.disabled = step === ends.length - 1;
    }
    prev.addEventListener("click", function () { if (step > 0) { step--; words(); park(step); } });
    next.addEventListener("click", function () { if (step < ends.length - 1) { step++; words(); play(step); } });
    replay.addEventListener("click", function () { play(step); });

    videos.forEach(function (v) {
      // A data: URL video can finish loading before this script runs, and then "loadeddata" never comes (M09).
      if (v.readyState >= 2) seek(v, endOf(step));
      else v.addEventListener("loadeddata", function () { if (!figure.hasAttribute("data-busy")) seek(v, endOf(step)); }, { once: true });
    });
    darkQuery.addEventListener("change", function () { park(step); });
    words();
  });
})();
