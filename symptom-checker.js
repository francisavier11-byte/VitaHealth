/* =========================================================
   VitaHealth – Symptom Checker
   FILE: symptom-checker.js
   ========================================================= */
(function () {
  'use strict';

  /* =======================================================
     PART 1 – SETTINGS (this is the part you edit)
     ======================================================= */

  // Symptoms that ALWAYS show the "Seek urgent medical attention" warning.
  const URGENT_SYMPTOMS = ['chest-pain', 'shortness-of-breath', 'loss-of-consciousness'];

  // If the user says "Severe" AND picked any of these, the warning shows too.
  const CONCERNING_SYMPTOMS = [
    'fever', 'dizziness', 'vomiting', 'stomach-pain', 'headache', 'body-weakness'
  ];

  // The four urgency levels. The number (0–3) is the position in this list.
  const URGENCY_LEVELS = [
    {
      label: 'Low',
      cssClass: 'low',
      nextAction: 'Rest and monitor your symptoms. If they do not improve in a few days, consider booking an appointment.'
    },
    {
      label: 'Moderate',
      cssClass: 'moderate',
      nextAction: 'Consider booking an appointment with a healthcare professional.'
    },
    {
      label: 'High',
      cssClass: 'high',
      nextAction: 'Book an appointment as soon as possible, ideally within the next 24 hours.'
    },
    {
      label: 'Urgent',
      cssClass: 'urgent',
      nextAction: 'Go to the nearest emergency facility now or call your local emergency number. Do not wait for an appointment.'
    }
  ];

  const URGENT_LEVEL_INDEX = 3; // used only by the emergency logic
  const MAX_NORMAL_LEVEL = 2;   // normal rules can never go above "High"

  // Extra points added to the rule's baseUrgency, based on the answers in Step 2.
  const ANSWER_POINTS = {
    duration: { 'less-1-day': 0, '1-3-days': 0, 'more-3-days': 0, 'more-1-week': 1 },
    severity: { mild: 0, moderate: 0, severe: 1 },
    trend:    { better: 0, same: 0, worse: 1 }
  };

  /* ---- THE RULES ----
     concern        = text shown as "Possible health concern"
     symptoms       = the symptoms this rule looks for
     minMatch       = how many of those symptoms must be selected for the rule to apply
     guidance       = text shown as "General guidance"
     department     = text shown as "Recommended department"
     baseUrgency    = 0 Low, 1 Moderate, 2 High (the answers in Step 2 can raise it)
     bookingService = (optional) pre-selects this service in your booking form
     bookingDoctor  = (optional) pre-selects this doctor in your booking form

     If two rules match, the one with MORE matching symptoms wins.
     If it is a tie, the rule higher up in this list wins.
  */
  const RULES = [
    {
      concern: 'Possible respiratory illness',
      symptoms: ['fever', 'cough', 'sore-throat', 'runny-nose'],
      minMatch: 2,
      guidance: 'Rest, drink enough fluids, and monitor your symptoms.',
      department: 'General Medicine',
      baseUrgency: 0,
      bookingService: 'General consultation'
    },
    {
      concern: 'Possible gastrointestinal problem',
      symptoms: ['stomach-pain', 'nausea', 'vomiting', 'diarrhea'],
      minMatch: 2,
      guidance: 'Take small sips of fluids or oral rehydration solution, eat light foods when you can, and watch for signs of dehydration.',
      department: 'General Medicine (Gastroenterology)',
      baseUrgency: 1,
      bookingService: 'General consultation'
    },
    {
      concern: 'Possible headache-related concern',
      symptoms: ['headache', 'dizziness'],
      minMatch: 2,
      guidance: 'Rest in a quiet place, drink water, and avoid skipping meals. Note anything that seems to trigger or worsen the headache.',
      department: 'Neurology',
      baseUrgency: 0,
      bookingService: 'General consultation',
      bookingDoctor: 'alinaitwe-reagan'
    },
    {
      concern: 'Possible infection or inflammatory concern',
      symptoms: ['joint-pain', 'fever'],
      minMatch: 2,
      guidance: 'Rest the affected joints, drink plenty of fluids, and keep track of your temperature.',
      department: 'General Medicine',
      baseUrgency: 1,
      bookingService: 'General consultation'
    },
    {
      concern: 'Possible muscle or joint-related concern',
      symptoms: ['back-pain', 'joint-pain'],
      minMatch: 1,
      guidance: 'Avoid heavy lifting, keep moving gently, and rest when you need to.',
      department: 'Orthopedics',
      baseUrgency: 0,
      bookingService: 'Physiotherapy',
      bookingDoctor: 'david-opa'
    },
    {
      concern: 'Possible general infection or fatigue-related concern',
      symptoms: ['fever', 'body-weakness', 'headache'],
      minMatch: 2,
      guidance: 'Rest, drink enough fluids, eat light nutritious meals, and monitor your temperature.',
      department: 'General Medicine',
      baseUrgency: 1,
      bookingService: 'General consultation'
    }
  ];

  // Shown when no rule matches
  const FALLBACK = {
    concern: 'Your symptoms require further assessment by a healthcare professional.',
    guidance: 'Rest, drink enough fluids, and keep track of how your symptoms change.',
    department: 'General Medicine',
    baseUrgency: 1,
    bookingService: 'General consultation'
  };

  // Shown for emergency situations
  const EMERGENCY = {
    concern: 'Symptoms that may need urgent medical attention',
    guidance: 'Do not wait to see if it passes. If possible, have someone stay with you and get to the nearest emergency facility.',
    department: 'Emergency Care',
    warning: 'Your answers include symptoms that can be serious. This tool cannot tell what is causing them, so please get checked by a medical professional right away.'
  };

  /* =======================================================
     PART 2 – VARIABLES THE CHECKER REMEMBERS
     ======================================================= */

  const state = {
    step: 1,
    symptoms: [],                                              // [{ id, label }]
    answers: { duration: null, severity: null, trend: null }   // each: { value, label }
  };

  let lastResult = null;   // the latest result, used by the booking button
  let root = null;         // the whole #symptom-checker section
  const els = {};          // all the elements we need (filled in cacheElements)

  /* =======================================================
     PART 3 – SMALL HELPERS
     ======================================================= */

  function $(id) {
    return document.getElementById(id);
  }

  // true if at least one item from "list" is inside "ids"
  function hasAny(ids, list) {
    return list.some(function (item) { return ids.indexOf(item) !== -1; });
  }

  // reads the visible text next to a checkbox / radio button
  function getLabelText(input) {
    const textEl = input.parentElement.querySelector('.sc-option-text, .sc-choice-text');
    return textEl ? textEl.textContent.trim() : input.value;
  }

  /* =======================================================
     PART 4 – READING THE USER'S CHOICES
     ======================================================= */

  function getSelectedSymptoms() {
    const list = [];
    els.symptomBoxes.forEach(function (box) {
      if (box.checked) {
        list.push({ id: box.value, label: getLabelText(box) });
      }
    });
    return list;
  }

  function getRadioAnswer(name) {
    const checked = root.querySelector('input[name="' + name + '"]:checked');
    if (!checked) return null;
    return { value: checked.value, label: getLabelText(checked) };
  }

  function saveAnswers() {
    state.symptoms = getSelectedSymptoms();
    state.answers.duration = getRadioAnswer('duration');
    state.answers.severity = getRadioAnswer('severity');
    state.answers.trend = getRadioAnswer('trend');
  }

  /* =======================================================
     PART 5 – MOVING BETWEEN STEPS (progress indicator)
     ======================================================= */

  function updateProgress(stepNumber) {
    els.stepCount.textContent = 'Step ' + stepNumber + ' of 3';

    els.progressItems.forEach(function (item) {
      const num = Number(item.dataset.step);
      const dot = item.querySelector('.sc-dot');

      item.classList.toggle('is-done', num < stepNumber);
      item.classList.toggle('is-active', num === stepNumber);
      dot.textContent = num < stepNumber ? '✓' : String(num);

      if (num === stepNumber) {
        item.setAttribute('aria-current', 'step');
      } else {
        item.removeAttribute('aria-current');
      }
    });
  }

  function showStep(stepNumber, moveFocus) {
    state.step = stepNumber;

    els.panels.forEach(function (panel) {
      panel.hidden = Number(panel.dataset.step) !== stepNumber;
    });

    updateProgress(stepNumber);

    if (moveFocus) {
      const title = $('scPanelTitle' + stepNumber);
      if (title) title.focus({ preventScroll: true });
      els.card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /* =======================================================
     PART 6 – VALIDATION
     ======================================================= */

  function validateStep1() {
    const hasSymptom = getSelectedSymptoms().length > 0;
    els.error1.hidden = hasSymptom;
    return hasSymptom;
  }

  function validateStep2() {
    let allAnswered = true;

    ['duration', 'severity', 'trend'].forEach(function (name) {
      const group = $('scGroup-' + name);
      const answered = getRadioAnswer(name) !== null;
      group.classList.toggle('has-error', !answered);
      if (!answered) allAnswered = false;
    });

    els.error2.hidden = allAnswered;
    return allAnswered;
  }

  /* =======================================================
     PART 7 – ANALYSING THE ANSWERS
     ======================================================= */

  // Finds the rule with the most matching symptoms (or null if none match)
  function findBestRule(ids) {
    let best = null;
    let bestMatches = 0;

    RULES.forEach(function (rule) {
      const matches = rule.symptoms.filter(function (s) {
        return ids.indexOf(s) !== -1;
      }).length;

      if (matches >= rule.minMatch && matches > bestMatches) {
        best = rule;
        bestMatches = matches;
      }
    });

    return best;
  }

  // Starts from the rule's baseUrgency and adds points from the answers
  function calculateUrgency(baseUrgency, answers) {
    let score = baseUrgency;
    score += ANSWER_POINTS.duration[answers.duration.value] || 0;
    score += ANSWER_POINTS.severity[answers.severity.value] || 0;
    score += ANSWER_POINTS.trend[answers.trend.value] || 0;
    return Math.min(score, MAX_NORMAL_LEVEL);
  }

  // Adds a sentence or two depending on the follow-up answers
  function buildGuidance(baseText, answers) {
    let text = baseText;
    if (answers.trend.value === 'worse') {
      text += ' Because your symptoms are getting worse, do not wait too long before getting checked.';
    }
    if (answers.duration.value === 'more-1-week') {
      text += ' Symptoms lasting more than a week should be reviewed by a healthcare professional.';
    }
    return text;
  }

  function analyzeAnswers() {
    const ids = state.symptoms.map(function (s) { return s.id; });
    const answers = state.answers;

    const isEmergency =
      hasAny(ids, URGENT_SYMPTOMS) ||
      (answers.severity.value === 'severe' && hasAny(ids, CONCERNING_SYMPTOMS));

    if (isEmergency) {
      return {
        isEmergency: true,
        concern: EMERGENCY.concern,
        guidance: EMERGENCY.guidance,
        department: EMERGENCY.department,
        urgencyIndex: URGENT_LEVEL_INDEX
      };
    }

    const rule = findBestRule(ids) || FALLBACK;

    return {
      isEmergency: false,
      concern: rule.concern,
      guidance: buildGuidance(rule.guidance, answers),
      department: rule.department,
      urgencyIndex: calculateUrgency(rule.baseUrgency, answers),
      bookingService: rule.bookingService,
      bookingDoctor: rule.bookingDoctor
    };
  }

  /* =======================================================
     PART 8 – SHOWING THE RESULTS
     ======================================================= */

  function renderResults(result) {
    els.resConcern.textContent = result.concern;

    // symptom "chips"
    els.resSymptoms.innerHTML = '';
    state.symptoms.forEach(function (symptom) {
      const chip = document.createElement('span');
      chip.className = 'sc-chip';
      chip.textContent = symptom.label;
      els.resSymptoms.appendChild(chip);
    });

    const a = state.answers;
    els.resAnswers.textContent =
      'Duration: ' + a.duration.label +
      '  •  Severity: ' + a.severity.label +
      '  •  Trend: ' + a.trend.label;

    els.resGuidance.textContent = result.guidance;
    els.resDepartment.textContent = result.department;

    const level = URGENCY_LEVELS[result.urgencyIndex];
    els.resUrgency.textContent = level.label;
    els.resUrgency.className = 'sc-badge sc-badge-' + level.cssClass;
    els.resAction.textContent = level.nextAction;

    // red emergency banner
    els.emergency.hidden = !result.isEmergency;
    els.emergencyText.textContent = EMERGENCY.warning;
    els.card.classList.toggle('is-urgent', result.isEmergency);
  }

  /* =======================================================
     PART 9 – BOOKING BUTTON (uses your existing #bookingModal)
     ======================================================= */

  function setSelectIfExists(select, value) {
    if (!select || !value) return;
    const exists = Array.from(select.options).some(function (opt) {
      return opt.value === value;
    });
    if (exists) select.value = value;
  }

  function openBookingModal() {
    const modal = $('bookingModal');

    // If this page has no booking modal, send the visitor to the contact page
    if (!modal) {
      window.location.href = 'contact.html#contact';
      return;
    }

    // Pre-select the service/doctor in the existing booking form (optional)
    if (lastResult) {
      setSelectIfExists(modal.querySelector('select[name="service"]'), lastResult.bookingService);
      setSelectIfExists(modal.querySelector('select[name="doctor"]'), lastResult.bookingDoctor);
    }

    // Exactly what your "Get Appointment" button does
    modal.classList.add('show');
  }

  /* =======================================================
     PART 10 – BUTTON ACTIONS
     ======================================================= */

  function updateSelectionFeedback() {
    const selected = getSelectedSymptoms();
    const ids = selected.map(function (s) { return s.id; });

    els.count.textContent =
      selected.length === 1 ? '1 symptom selected' : selected.length + ' symptoms selected';

    els.liveAlert.hidden = !hasAny(ids, URGENT_SYMPTOMS);

    if (selected.length > 0) els.error1.hidden = true;
  }

  function onStep2Change(event) {
    const group = event.target.closest('.sc-question');
    if (group) group.classList.remove('has-error');
    if (!root.querySelector('.sc-question.has-error')) els.error2.hidden = true;
  }

  // Handles the Continue / Back buttons AND the clickable 1-2-3 circles.
  // "target" is the step number the user wants to go to.
  function goToStep(target) {
    if (target === state.step) return;

    // Going to step 1 is always allowed
    if (target === 1) {
      showStep(1, true);
      return;
    }

    // To go further, step 1 needs at least one symptom
    if (!validateStep1()) {
      showStep(1, true);
      return;
    }
    saveAnswers();

    if (target === 2) {
      showStep(2, true);
      return;
    }

    // To reach the results, all 3 questions in step 2 must be answered
    if (!validateStep2()) {
      showStep(2, true);
      return;
    }
    saveAnswers();

    lastResult = analyzeAnswers();
    renderResults(lastResult);
    showStep(3, true);
  }

  function resetChecker() {
    els.symptomBoxes.forEach(function (box) { box.checked = false; });
    root.querySelectorAll('.sc-choice input').forEach(function (radio) { radio.checked = false; });
    root.querySelectorAll('.sc-question').forEach(function (g) { g.classList.remove('has-error'); });

    state.symptoms = [];
    state.answers = { duration: null, severity: null, trend: null };
    lastResult = null;

    els.error1.hidden = true;
    els.error2.hidden = true;
    els.card.classList.remove('is-urgent');

    updateSelectionFeedback();
    showStep(1, true);
  }

  /* =======================================================
     PART 11 – START EVERYTHING
     ======================================================= */

  function cacheElements() {
    els.card = $('scCard');
    els.stepCount = $('scStepCount');
    els.panels = root.querySelectorAll('.sc-panel');
    els.progressItems = root.querySelectorAll('.sc-progress-item');
    els.symptomBoxes = root.querySelectorAll('input[name="symptom"]');

    els.count = $('scCount');
    els.liveAlert = $('scLiveAlert');
    els.error1 = $('scError1');
    els.error2 = $('scError2');

    els.emergency = $('scEmergency');
    els.emergencyText = $('scEmergencyText');
    els.resConcern = $('resConcern');
    els.resSymptoms = $('resSymptoms');
    els.resAnswers = $('resAnswers');
    els.resGuidance = $('resGuidance');
    els.resDepartment = $('resDepartment');
    els.resUrgency = $('resUrgency');
    els.resAction = $('resAction');
  }

  function bindEvents() {
    // Checkbox / radio changes
    $('scStep1').addEventListener('change', updateSelectionFeedback);
    $('scStep2').addEventListener('change', onStep2Change);

    // Continue and Back buttons
    $('scContinue1').addEventListener('click', function () { goToStep(2); });
    $('scBack2').addEventListener('click', function () { goToStep(1); });
    $('scContinue2').addEventListener('click', function () { goToStep(3); });

    // The clickable 1 - 2 - 3 circles
    root.querySelectorAll('.sc-step-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        goToStep(Number(btn.dataset.goto));
      });
    });

    // Results buttons
    $('scBook').addEventListener('click', openBookingModal);
    $('scReset').addEventListener('click', resetChecker);
  }

  function init() {
    root = $('symptom-checker');
    if (!root) return;   // this page has no symptom checker, so do nothing

    cacheElements();
    bindEvents();
    updateSelectionFeedback();
    showStep(1, false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();