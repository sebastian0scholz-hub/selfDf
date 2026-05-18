/*************************************************
 * SRE & Directed Forgetting Online Experiment *
 *************************************************/

// Online-Import der PsychoJS-Kernbibliothek direkt von Pavlovia
import { core, data, sound, util, visual } from 'https://pavlovia.org';
const { PsychoJS } = core;
const { TrialHandler } = data;
const { Scheduler } = util;

// Globale Variablen für das Experiment
let expName = 'SRE_DirectedForgetting';
let expInfo = {'participant': '', 'Alter': '', 'Geschlecht': '', 'Beruf': ''};
let formSubmitted = false; 

// PsychoJS initialisieren
const psychoJS = new PsychoJS({ debug: true });

// Fenster öffnen mit neutralem Grau
psychoJS.openWindow({
  fullscr: true,
  color: new util.Color(), 
  units: 'norm',
  waitBlanking: true
});

const flowScheduler = new Scheduler(psychoJS);

// Haupt-Ablauf definieren
flowScheduler.add(updateInfo);
flowScheduler.add(experimentInit);
flowScheduler.add(formWaitRoutine()); 
flowScheduler.add(welcomeRoutine);
flowScheduler.add(rosenbergRoutine);
flowScheduler.add(learningRoutine);
flowScheduler.add(distractorRoutine);
flowScheduler.add(testRoutine);
flowScheduler.add(postQuestionsRoutine);
flowScheduler.add(quitPsychoJS, '', true);

// Systemstart direkt beim Laden der Seite
psychoJS.start({ expName: expName, expInfo: expInfo });

// --- HTML-FORMULAR EVENT LISTENER ---
document.getElementById('start-btn').addEventListener('click', function() {
  const alter = document.getElementById('input-alter').value;
  const geschlecht = document.getElementById('select-geschlecht').value;
  const beruf = document.getElementById('input-beruf').value;
  const errorMsg = document.getElementById('error-msg');

  if (alter.trim() === "" || geschlecht === "Auswahl" || beruf.trim() === "") {
    errorMsg.style.display = "block";
    return;
  }

  expInfo['Alter'] = alter;
  expInfo['Geschlecht'] = geschlecht;
  expInfo['Beruf'] = beruf;

  document.getElementById('form-overlay').style.display = 'none';
  formSubmitted = true; 
});

// --- STIMULI POOLS (160 Wörter aus der BAWL-R analog zu Python) ---
const posPool = ["pünktlich", "ehrlich", "kreativ", "mutig", "treu", "klug", "höflich", "fair", "aktiv", "warm", "stark", "ruhig", "weise", "froh", "offen", "witzig", "sanft", "heiter", "stolz", "flexibel", "charmant", "fokussiert", "geduldig", "gütig", "heldenhaft", "genial", "herzlich", "tolerant", "vital", "loyal", "achtsam", "fleißig", "reif", "sicher", "optimistisch", "dynamisch", "edel", "geschickt", "logisch", "munter", "aufgeweckt", "bescheiden", "diszipliniert", "eloquent", "empathisch", "fürsorglich", "humorvoll", "innovativ", "kompetent", "lebensfroh", "liebenswürdig", "motiviert", "produktiv", "zuverlässig", "selbstbewusst", "sorgfältig", "spontan", "tapfer", "umsichtig", "zielstrebig", "authentisch", "begeistert", "besonnen", "diplomatisch", "einfühlsam", "engagiert", "friedlich", "großzügig", "hilfbereit", "höflich", "inspirierend", "liebenswert", "mitfühlend", "organisiert", "respektvoll", "souverän", "tatkräftig", "verständnisvoll", "visionär", "warmherzig"];
const negPool = ["faul", "gierig", "feige", "neidisch", "stur", "zornig", "frech", "kalt", "träge", "lax", "grob", "starr", "naiv", "böse", "scheu", "wirr", "hart", "falsch", "sauer", "arrogant", "chaotisch", "egoistisch", "geizig", "hinterlistig", "ignorant", "kleinlich", "launisch", "rachsüchtig", "unhöflich", "ängstlich", "bitter", "dreist", "eitel", "herzlos", "intolerant", "kritisch", "nachlässig", "oberflächlich", "passiv", "reizbar", "schadenfroh", "skeptisch", "taktlos", "überheblich", "ungeduldig", "unzuverlässig", "verbittert", "vorlaut", "zäh", "aggressiv", "bequem", "dominant", "eingebildet", "frustriert", "gleichgültig", "heuchlerisch", "kompliziert", "misstrauisch", "nachgiebig", "neurotisch", "pedantisch", "pessimistisch", "rücksichtslos", "schüchtern", "streitsüchtig", "unentschlossen", "unorganisiert", "unzufrieden", "verlogen", "verschlossen", "vorsichtig", "wankelmütig", "wehleidig", "wortkarg", "zynisch", "wütend", "verbissen"];

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

shuffle(posPool);
shuffle(negPool);

let learnPos = posPool.slice(0, 40);
let testDistributorsPos = posPool.slice(40);
let learnNeg = negPool.slice(0, 40);
let testDistributorsNeg = negPool.slice(40);

let fremdName = Math.random() < 0.5 ? "Leon" : "Leonie";
let beschreibungFremd = `${fremdName} ist 24 Jahre alt, studiert Wirtschaftswissenschaften in einer deutschen Großstadt, treibt in der Freizeit gerne Sport und trifft sich oft mit Freunden.`;

let learningItems = [];
function addItems(wordList, count, reference, promptText) {
  for (let i = 0; i < count; i++) {
    let word = wordList.pop();
    let cue = (i % 2 === 0) ? "MERKEN" : "VERGESSEN";
    learningItems.push({ word: word, ref: reference, prompt: promptText, cue: cue, type: 'old' });
  }
}

addItems(learnPos, 20, "self", "Beschreibt dieses Wort DICH?\n\n[F] = NEIN    [J] = JA");
addItems(learnNeg, 20, "self", "Beschreibt dieses Wort DICH?\n\n[F] = NEIN    [J] = JA");
addItems(learnPos, 20, "other", `Beschreibt dieses Wort ${fremdName}?\n\n[F] = NEIN    [J] = JA`);
addItems(learnNeg, 20, "other", `Beschreibt dieses Wort ${fremdName}?\n\n[F] = NEIN    [J] = JA`);
shuffle(learningItems);

let testItems = [...learningItems];
testDistributorsPos.forEach(w => testItems.push({ word: w, type: 'new', ref: 'none', cue: 'none' }));
testDistributorsNeg.forEach(w => testItems.push({ word: w, type: 'new', ref: 'none', cue: 'none' }));
shuffle(testItems);

async function updateInfo() {
  expInfo['date'] = util.MonotonicClock.getDateStr();
  expInfo['expName'] = expName;
  util.addInfoFromUrl(expInfo);
  return Scheduler.Event.NEXT;
}

let txt = null;
let subTxt = null;
let quadrat = null;

async function experimentInit() {
  txt = new visual.TextStim({ win: psychoJS.window, name: 'txt', text: '', pos: [0, 0.2], height: 0.14, color: new util.Color([-1, -1, -1]) });
  subTxt = new visual.TextStim({ win: psychoJS.window, name: 'subTxt', text: '', pos: [0, -0.4], height: 0.05, color: new util.Color([-1, -1, -1]) });
  quadrat = new visual.Rect({ win: psychoJS.window, name: 'quadrat', width: 0.3, height: 0.3, pos: [0, 0], fillColor: new util.Color(), lineColor: new util.Color([-1,-1,-1]) });
  return Scheduler.Event.NEXT;
}

function formWaitRoutine() {
  return async function() {
    if (!formSubmitted) {
      psychoJS.window.flip();
      return Scheduler.Event.FLIP_REPEAT; 
    }
    return Scheduler.Event.NEXT; 
  }
}

function showMessage(message, keys = ['space'], height = 0.07, pos = [0, 0.0]) {
  return async function() {
    txt.height = height;
    txt.pos = pos;
    txt.text = message;
    txt.draw();
    psychoJS.window.flip();
    await psychoJS.eventManager.waitKeys({ keyList: keys });
    txt.height = 0.14;
    txt.pos = [0, 0.2];
    return Scheduler.Event.NEXT;
  }
}

function welcomeRoutine() {
  return showMessage("Willkommen zu diesem Experiment.\n\nSchön, dass Sie teilnehmen!\n\n[LEERTASTE DRÜCKEN ZUM FORTFAHREN]");
}

async function rosenbergRoutine() {
  await showMessage("Es folgen einige Fragen zu Ihrer Person.\nBitte nutzen Sie die Tasten 1, 2, 3 oder 4 zum Antworten.\n\n[LEERTASTE DRÜCKEN]")();
  
  const rosenbergItems = [
    "Alles in allem bin ich mit mir selbst zufrieden.",
    "Alles in allem neige ich dazu, mich als Versager zu betrachten.",
    "Ich glaube, ich habe einen Haufen guter Eigenschaften.",
    "Ich kann Dinge genauso gut wie die meisten anderen Menschen.",
    "Ich glaube, ich habe nicht viel, worauf ich stolz sein könnte.",
    "Dienlich und nützlich fühl ich mich hin und wieder gewiss nicht.",
    "Ich glaube, ich bin ein wertvoller Mensch, zumindest nicht weniger als andere.",
    "Ich wünschte, ich könnte mehr Respekt vor mir selbst haben.",
    "Alles in allem bin ich eher geneigt, mich als Fehlschlag zu betrachten.",
    "Ich habe eine positive Einstellung zu mir selbst."
  ];

  for (let item of rosenbergItems) {
    txt.text = item;
    txt.height = 0.07;
    txt.pos = [0, 0.4];
    subTxt.text = "1 = Trifft gar nicht zu\n2 = Trifft eher nicht zu\n3 = Trifft eher zu\n4 = Trifft voll zu";
    subTxt.pos = [0, -0.1];
    subTxt.alignText = 'center';
    
    txt.draw();
    subTxt.draw();
    psychoJS.window.flip();
    
    let startTime = psychoJS.window.countdownTimer.getTime();
    let keys = await psychoJS.eventManager.waitKeys({ keyList: ['1', '2', '3', '4'] });
    let rt = startTime - psychoJS.window.countdownTimer.getTime();
    
    psychoJS.experiment.addData('rosenberg_item', item);
    psychoJS.experiment.addData('rosenberg_resp', keys.name);
    psychoJS.experiment.addData('rosenberg_rt', rt);
    psychoJS.experiment.nextEntry();
  }
  subTxt.text = "";
  return Scheduler.Event.NEXT;
}

async function learningRoutine() {
  let anleitung = `Im folgenden Hauptteil werden Ihnen Wörter präsentiert. Sie sollen diese entweder auf sich selbst beziehen oder auf eine Ihnen unbekannte Person namens ${fremdName}.\n\nZur Person: ${beschreibungFremd}\n\nVerlassen Sie sich bei der Beurteilung der fremden Person bitte ganz auf Ihre Intuition.\n\nNach Ihrer Einschätzung zu einem Wort wird Ihnen signalisiert, ob Sie es sich für den späteren Test MERKEN oder VERGESSEN sollen.\n\n[LEERTASTE ZUM STARTEN]`;
  await showMessage(anleitung)();

  for (let item of learningItems) {
    txt.text = "+";
    txt.draw();
    psychoJS.window.flip();
    await core.wait(0.5);

    txt.text = item.word.toUpperCase();
    subTxt.text = item.prompt;
    txt.draw();
    subTxt.draw();
    psychoJS.window.flip();

    let startTime = psychoJS.window.countdownTimer.getTime();
    let keys = await psychoJS.eventManager.waitKeys({ keyList: ['f', 'j'] });
    let rt = startTime - psychoJS.window.countdownTimer.getTime();

    let decision = keys.name === 'f' ? "Nein" : "Ja";
    psychoJS.experiment.addData('learn_word', item.word);
    psychoJS.experiment.addData('learn_ref', item.ref);
    psychoJS.experiment.addData('learn_cue', item.cue);
    psychoJS.experiment.addData('learn_decision', decision);
    psychoJS.experiment.addData('learn_rt', rt);

    txt.text = item.cue;
    txt.color = item.cue === "MERKEN" ? new util.Color([-1, 0.5, -1]) : new util.Color([0.8, -1, -1]);
    txt.draw();
    subTxt.text = "";
    psychoJS.window.flip();
    await core.wait(3.0);
    txt.color = new util.Color([-1, -1, -1]);
    psychoJS.experiment.nextEntry();
  }
  return Scheduler.Event.NEXT;
}

async function distractorRoutine() {
  let anleitung = "Ablenkungsaufgabe (Dauer: 60 Sekunden):\n\nEs erscheint gleich ein Quadrat in der Bildschirmmitte.\n\nWenn das Quadrat GRÜN wird -> Drücken Sie so schnell wie möglich die [LEERTASTE]!\nWenn das Quadrat ROT wird -> Drücken Sie NICHTS!\n\n[LEERTASTE DRÜCKEN ZUM STARTEN]";
  await showMessage(anleitung)();

  let endTime = psychoJS.window.countdownTimer.getTime() - 60.0;

  while (psychoJS.window.countdownTimer.getTime() > endTime) {
    let isGo = Math.random() < 0.7;
    quadrat.fillColor = isGo ? new util.Color([-1, 0.5, -1]) : new util.Color([0.8, -1, -1]);
    quadrat.draw();
    psychoJS.window.flip();

    let startTime = psychoJS.window.countdownTimer.getTime();
    let keys = [];
    while (startTime - psychoJS.window.countdownTimer.getTime() < 1.2) {
      keys = psychoJS.eventManager.getKeys({ keyList: ['space'] });
      if (keys.length > 0) break;
    }

    let hit = keys.length > 0;
    let result = isGo ? (hit ? "Hit" : "Miss") : (hit ? "False Alarm" : "Correct Rejection");
    psychoJS.experiment.addData('distractor_type', isGo ? 'Go' : 'NoGo');
    psychoJS.experiment.addData('distractor_result', result);
    psychoJS.experiment.nextEntry();

    psychoJS.window.flip();
    await core.wait(0.5 + Math.random() * 0.5);
  }
  return Scheduler.Event.NEXT;
}

async function testRoutine() {
  await showMessage("ÜBERRASCHUNGSTEST!\nEntscheiden Sie so schnell und präzise wie möglich, ob das Wort in der Lernphase vorkam oder NEU ist.\n\n[F] = NEU       [J] = ALT (vorgekommen)\n\n[LEERTASTE ZUM STARTEN]")();

  for (let item of testItems) {
    txt.text = "+";
    txt.draw();
    psychoJS.window.flip();
    await core.wait(0.5);

    txt.text = item.word.toUpperCase();
    subTxt.text = "[F] = NEU       [J] = ALT";
    txt.draw();
    subTxt.draw();
    psychoJS.window.flip();

    let startTime = psychoJS.window.countdownTimer.getTime();
    let keys = await psychoJS.eventManager.waitKeys({ keyList: ['f', 'j'] });
    let rt = startTime - psychoJS.window.countdownTimer.getTime();

    let response = keys.name === 'f' ? "new" : "old";
    let isCorrect = response === item.type ? 1 : 0;

    psychoJS.experiment.addData('test_word', item.word);
    psychoJS.experiment.addData('test_true_type', item.type);
    psychoJS.experiment.addData('test_ref', item.ref);
    psychoJS.experiment.addData('test_cue', item.cue);
    psychoJS.experiment.addData('test_response', response);
    psychoJS.experiment.addData('test_correct', isCorrect);
    psychoJS.experiment.addData('test_rt', rt);
    psychoJS.experiment.nextEntry();
  }
  return Scheduler.Event.NEXT;
}

async function postQuestionsRoutine() {
  await showMessage("Zum Abschluss bitten wir Sie noch um die Beantwortung von fünf kurzen Fragen zum Ablauf.\n\n[LEERTASTE DRÜCKEN]")();

  const postQuestions = [
    "Haben Sie von der fremden Person ein konkretes Bild im Kopf gehabt?",
    "Haben Sie versucht, sich die zu merkenden Wörter aktiv zu merken?",
    "Haben Sie versucht, die zu vergessenden Wörter absichtlich zu vergessen?",
    "Haben Sie während der Lernphase Notizen gemacht (z. B. auf Papier oder am PC)?",
    "Haben Sie an diesem Experiment ernsthaft und konzentriert teilgenommen?"
  ];

  for (let q of postQuestions) {
    txt.text = q;
    txt.height = 0.07;
    txt.pos = [0, 0.2];
    subTxt.text = "[F] = NEIN       [J] = JA";
    subTxt.pos = [0, -0.3];

    txt.draw();
    subTxt.draw();
    psychoJS.window.flip();

    let startTime = psychoJS.window.countdownTimer.getTime();
    let keys = await psychoJS.eventManager.waitKeys({ keyList: ['f', 'j'] });
    let rt = startTime - psychoJS.window.countdownTimer.getTime();

    let answer = keys.name === 'f' ? "Nein" : "Ja";
    psychoJS.experiment.addData('post_question', q);
    psychoJS.experiment.addData('post_answer', answer);
    psychoJS.experiment.addData('post_rt', rt);
    psychoJS.experiment.nextEntry();
  }
  return showMessage("Vielen Dank für Ihre Teilnahme!\n\nIhr SurveyCircle-Freischaltcode lautet:\n\nXXXX-XXXX-XXXX\n\nBitte kopieren Sie diesen Code und lösen Sie ihn auf SurveyCircle ein.\n\n[LEERTASTE ZUM BEENDEN]")();
}

async function quitPsychoJS(message, isCompleted) {
  if (psychoJS.experiment.isEntryEmpty()) {
    psychoJS.experiment.nextEntry();
  }

  if (isCompleted) {
    const participantID = expInfo['participant'] || "web_" + Math.floor(Math.random() * 100000);
    const filename = "subject_" + participantID + "_" + expInfo['date'] + ".csv";
    const csvData = psychoJS.experiment.saveCSV();

    try {
      await fetch("https://jspsych.org", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "*/*" },
        body: JSON.stringify({
          experimentID: "DEINE_DATAPIPE_EXPERIMENT_ID_HIER", 
          filename: filename,
          data: csvData
        })
      });
      console.log("Daten erfolgreich via DataPipe an OSF übertragen.");
    } catch (error) {
      console.error("Fehler bei DataPipe:", error);
    }
  }

  psychoJS.window.close();
  psychoJS.quit({message: message, isCompleted: isCompleted});
  return Scheduler.Event.QUIT;
}
