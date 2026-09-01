// @ts-nocheck -- migrated browser module; typed conversion is intentionally deferred.
/* =============================================================================
 * intro.js — configurable launch screen and live DPDPA readiness countdown.
 * ========================================================================== */
(function (root) {
  'use strict';

  var config = root.DPDPA_INTRO_CONFIG || {};
  var intro = document.getElementById('app-intro');
  var banner = document.getElementById('countdown-banner');
  if (!intro || !banner) return;

  if (!config.enabled || !document.body.classList.contains('intro-active')) {
    intro.setAttribute('aria-hidden', 'true');
    return;
  }

  var reduceMotion = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var configuredDuration = Number(config.durationMs);
  var duration = Number.isFinite(configuredDuration) ? Math.max(800, configuredDuration) : 4800;
  if (reduceMotion) duration = Math.min(duration, 1800);

  var deadline = new Date(config.deadline || '2027-05-13T23:59:59+05:30');
  if (isNaN(deadline.getTime())) deadline = new Date('2027-05-13T23:59:59+05:30');

  var weeks = intro.querySelector('[data-intro-weeks]');
  var days = intro.querySelector('[data-intro-days]');
  var hours = intro.querySelector('[data-intro-hours]');
  var deadlineLabel = intro.querySelector('[data-intro-deadline]');
  var summary = intro.querySelector('[data-intro-summary]');
  var skip = intro.querySelector('[data-intro-skip]');
  var countCard = intro.querySelector('.intro-count-card');
  var bannerTimer = banner.querySelector('.cb-timer');
  var bannerWeeks = banner.querySelector('[data-banner-weeks]');
  var bannerDays = banner.querySelector('[data-banner-days]');
  var bannerHours = banner.querySelector('[data-banner-hours]');
  var bannerDeadline = banner.querySelector('[data-banner-deadline]');
  var bannerSummary = banner.querySelector('[data-banner-summary]');
  var inertNodes = document.querySelectorAll('#app-shell > header, #app-shell > .view, #app-shell > footer');
  var countdownTimer;
  var exitTimer;
  var closing = false;
  var morphComplete = false;

  intro.style.setProperty('--intro-duration', duration + 'ms');
  deadlineLabel.textContent = config.deadlineLabel || '13 May 2027';
  bannerDeadline.textContent = deadlineLabel.textContent;
  skip.setAttribute('data-hidden', config.allowSkip === false ? 'true' : 'false');

  for (var i = 0; i < inertNodes.length; i++) inertNodes[i].inert = true;

  function twoDigits(value) { return value < 10 ? '0' + value : String(value); }

  function updateCountdown() {
    var remaining = Math.max(0, deadline.getTime() - Date.now());
    var totalHours = Math.floor(remaining / 3600000);
    var weekValue = Math.floor(totalHours / (24 * 7));
    var dayValue = Math.floor(totalHours / 24) % 7;
    var hourValue = totalHours % 24;

    weeks.textContent = twoDigits(weekValue);
    days.textContent = twoDigits(dayValue);
    hours.textContent = twoDigits(hourValue);
    bannerWeeks.textContent = weeks.textContent;
    bannerDays.textContent = days.textContent;
    bannerHours.textContent = hours.textContent;
    var summaryText = weekValue + ' weeks, ' + dayValue + ' days and ' + hourValue +
      ' hours remain until the configured DPDPA readiness target on ' + deadlineLabel.textContent + '.';
    summary.textContent = summaryText;
    bannerSummary.textContent = summaryText;
  }

  function completeMorph(ghost) {
    if (morphComplete) return;
    morphComplete = true;
    root.clearTimeout(exitTimer);
    if (ghost && ghost.parentNode) ghost.parentNode.removeChild(ghost);

    document.body.classList.remove('intro-active');
    intro.setAttribute('aria-hidden', 'true');
    banner.inert = false;
    banner.setAttribute('aria-hidden', 'false');
    banner.removeAttribute('data-arriving');
    for (var i = 0; i < inertNodes.length; i++) inertNodes[i].inert = false;
    document.removeEventListener('keydown', onKeydown);
    document.dispatchEvent(new CustomEvent('dpdpa:intro-complete'));

    var firstAction = document.querySelector('#view-landing .hero .btn-primary');
    if (firstAction && config.allowSkip !== false) firstAction.focus({ preventScroll: true });
  }

  function finishIntro() {
    if (closing) return;
    closing = true;
    root.clearTimeout(exitTimer);
    banner.hidden = false;
    banner.inert = true;
    banner.setAttribute('data-arriving', 'true');
    updateCountdown();

    if (reduceMotion) {
      intro.setAttribute('data-state', 'morphing');
      completeMorph(null);
      return;
    }

    root.requestAnimationFrame(function () {
      var source = countCard.getBoundingClientRect();
      var target = bannerTimer.getBoundingClientRect();
      var ghost = countCard.cloneNode(true);
      ghost.classList.add('intro-morph-card');
      ghost.style.left = source.left + 'px';
      ghost.style.top = source.top + 'px';
      ghost.style.width = source.width + 'px';
      ghost.style.height = source.height + 'px';
      document.body.appendChild(ghost);

      intro.setAttribute('data-state', 'morphing');

      if (ghost.animate) {
        var animation = ghost.animate([
          { transform: 'translate(0, 0) scale(1, 1)', borderRadius: '20px' },
          { transform: 'translate(' + (target.left - source.left) + 'px, ' +
              (target.top - source.top) + 'px) scale(' + (target.width / source.width) + ', ' +
              (target.height / source.height) + ')', borderRadius: '10px' }
        ], { duration: 820, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
        animation.onfinish = function () { completeMorph(ghost); };
        exitTimer = root.setTimeout(function () { completeMorph(ghost); }, 930);
      } else {
        completeMorph(ghost);
      }
    });
  }

  function onKeydown(event) {
    if (event.key === 'Escape' && config.allowSkip !== false) finishIntro();
  }

  updateCountdown();
  countdownTimer = root.setInterval(updateCountdown, 1000);
  skip.addEventListener('click', finishIntro);
  document.addEventListener('keydown', onKeydown);

  root.requestAnimationFrame(function () {
    intro.setAttribute('data-ready', 'true');
    if (config.allowSkip !== false) skip.focus({ preventScroll: true });
  });
  exitTimer = root.setTimeout(finishIntro, duration);

})(window);

export {};
