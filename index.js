// Globale Konfiguration
let expName = 'SRE_DirectedForgetting';
let expInfo = { 'participant': '', 'Alter': '', 'Geschlecht': '', 'Beruf': '', 'date': new Date().toISOString() };
let currentRoutine = null;
let compiledData = [];

// Canvas Setup
const canvas = document.getElementById('experiment-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if(currentRoutine) currentRoutine.draw();
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Hilfsfunktion für automatischen Textumbruch und dynamische Skalierung
function wrapText(text, x, y, maxWidth, lineHeight) {
    let words = text.split(' ');
    let line = '';
    let startY = y;
    let lines = [];

    for (let n = 0; n < words.length; n++) {
        // Expliziten Zeilenumbruch \n abfangen
        if (words[n].includes('\n')) {
            let parts = words[n].split('\n');
            for (let i = 0; i < parts.length; i++) {
                let testLine = line + parts[i] + ' ';
                let metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && n > 0) {
                    lines.push(line);
                    line = parts[i] + ' ';
                } else {
                    line = testLine;
                }
                if (i < parts.length - 1) {
                    lines.push(line);
                    line = '';
                }
            }
        } else {
            let testLine = line + words[n] + ' ';
            let metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                lines.push(line);
                line = words[n] + ' ';
            } else {
                line = testLine;
            }
        }
    }
    lines.push(line);

    // Textblock vertikal perfekt zentrieren
    let totalHeight = lines.length * lineHeight;
    let currentY = startY - (totalHeight / 2) + (lineHeight / 2);

    for (let k = 0; k < lines.length; k++) {
        ctx.fillText(lines[k], x, currentY);
        currentY += lineHeight;
    }
}

// Stimuli-Pools (BAWL-R)
const posPool = ["pünktlich", "ehrlich", "kreativ", "mutig", "treu", "klug", "höflich", "fair", "aktiv", "warm", "stark", "ruhig", "weise", "froh", "offen", "witzig", "sanft", "heiter", "stolz", "flexibel", "charmant", "fokussiert", "geduldig", "gütig", "heldenhaft", "genial", "herzlich", "tolerant", "vital", "loyal", "achtsam", "fleißig", "reif", "sicher", "optimistisch", "dynamisch", "edel", "geschickt", "logisch", "munter", "aufgeweckt", "bescheiden", "diszipliniert", "eloquent", "empathisch", "fürsorglich", "humorvoll", "innovativ", "kompetent", "lebensfroh", "liebenswürdig", "motiviert", "produktiv", "zuverlässig", "selbstbewusst", "sorgfältig", "spontan", "tapfer", "umsichtig", "zielstrebig", "authentisch", "begeistert", "besonnen", "diplomatisch", "einfühlsam", "engagiert", "friedlich", "großzügig", "hilfbereit", "höflich", "inspirierend", "liebenswert", "mitfühlend", "organisiert", "respektvoll", "souverän", "tatkräftig", "verständnisvoll", "visionär", "warmherzig"];
const negPool = ["faul", "gierig", "feige", "neidisch", "stur", "zornig", "frech", "kalt", "träge", "lax", "grob", "starr", "naiv", "böse", "scheu", "wirr", "hart", "falsch", "sauer", "arrogant", "chaotisch", "egoistisch", "geizig", "hinterlistig", "ignorant", "kleinlich", "launisch", "rachsüchtig", "unhöflich", "ängstlich", "bitter", "dreist", "eitel", "herzlos", "intolerant", "kritisch", "nachlässig", "oberflächlich", "passiv", "reizbar", "schadenfroh", "skeptisch", "taktlos", "überheblich", "ungeduldig", "unzuverlässig", "verbittert", "vorlaut", "zäh", "aggressiv", "bequem", "dominant", "eingebildet", "frustriert", "gleichgültig", "heuchlerisch", "kompliziert", "misstrauisch", "nachgiebig", "neurotisch", "pedantisch", "pessimistisch", "rücksichtslos", "schüchtern", "streitsüchtig", "unentschlossen", "unorganisiert", "unzufrieden", "verlogen", "verschlossen", "vorsichtig", "wankelmütig", "wehleidig", "wortkarg", "zynisch", "wütend", "verbissen"];

function shuffle(arr) { arr.sort(() => Math.random() - 0.5); }
shuffle(posPool); shuffle(negPool);

let learnPos = posPool.slice(0, 40); let testDistPos = posPool.slice(40);
let learnNeg = negPool.slice(0, 40); let testDistNeg = negPool.slice(40);
let fremdName = Math.random() < 0.5 ? "Leon" : "Leonie";
let beschreibungFremd = `${fremdName} ist 24 Jahre alt, studiert Wirtschaftswissenschaften in einer deutschen Großstadt, treibt gerne Sport und trifft sich oft mit Freunden.`;

let learningItems = [];
function addItems(list, count, ref, prompt) {
    for (let i = 0; i < count; i++) {
        let w = list.pop();
        learningItems.push({ word: w, ref: ref, prompt: prompt, cue: (i % 2 === 0) ? "MERKEN" : "VERGESSEN", type: 'old' });
    }
}
addItems(learnPos, 20, "self", "Beschreibt dieses Wort DICH?\n\n[F] = NEIN    [J] = JA");
addItems(learnNeg, 20, "self", "Beschreibt dieses Wort DICH?\n\n[F] = NEIN    [J] = JA");
addItems(learnPos, 20, "other", `Beschreibt dieses Wort ${fremdName}?\n\n[F] = NEIN    [J] = JA`);
addItems(learnNeg, 20, "other", `Beschreibt dieses Wort ${fremdName}?\n\n[F] = NEIN    [J] = JA`);
shuffle(learningItems);

let testItems = [...learningItems];
testDistPos.forEach(w => testItems.push({ word: w, type: 'new', ref: 'none', cue: 'none' }));
testDistNeg.forEach(w => testItems.push({ word: w, type: 'new', ref: 'none', cue: 'none' }));
shuffle(testItems);

// Formular-Listener
document.getElementById('start-btn').addEventListener('click', () => {
    const alter = document.getElementById('input-alter').value;
    const geschlecht = document.getElementById('select-geschlecht').value;
    const beruf = document.getElementById('input-beruf').value;
    if (!alter || geschlecht === "Auswahl" || !beruf) {
        document.getElementById('error-msg').style.display = "block";
        return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    expInfo.participant = urlParams.get('participant') || "web_" + Math.floor(Math.random()*100000);
    expInfo.Alter = alter; expInfo.Geschlecht = geschlecht; expInfo.Beruf = beruf;
    document.getElementById('form-overlay').style.display = 'none';
    document.getElementById('canvas-container').style.display = 'flex';
    resizeCanvas();
    startExperiment();
});

// Responsive Screen Engine
class ResponsiveScreen {
    constructor(title, sub, allowedKeys, callback, isLargeTitle = false) {
        this.title = title; this.sub = sub; this.allowedKeys = allowedKeys; this.callback = callback;
        this.isLargeTitle = isLargeTitle;
        this.startTime = performance.now();
        this.active = true;
    }
    draw() {
        ctx.fillStyle = "#7F7F7F"; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#000000"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        
        // Dynamische Skalierung basierend auf der Bildschirm-Fenstergröße (vmax)
        let baseSize = Math.max(canvas.width, canvas.height);
        let titleSize = this.isLargeTitle ? Math.round(baseSize * 0.055) : Math.round(baseSize * 0.026);
        let subSize = Math.round(baseSize * 0.018);
        
        ctx.font = `bold ${titleSize}px Arial`;
        let maxWidth = canvas.width * 0.85;
        let titleY = canvas.height * 0.35;
        let titleLineHeight = titleSize * 1.3;
        
        wrapText(this.title, canvas.width / 2, titleY, maxWidth, titleLineHeight);
        
        if (this.sub) {
            ctx.font = `${subSize}px Arial`;
            let subY = canvas.height * 0.75;
            let subLineHeight = subSize * 1.4;
            wrapText(this.sub, canvas.width / 2, subY, maxWidth, subLineHeight);
        }
    }
    handleKey(key) {
        if (!this.active || !this.allowedKeys.includes(key)) return;
        this.active = false;
        let rt = (performance.now() - this.startTime) / 1000;
        this.callback(key, rt);
    }
}

let routines = [];
function startExperiment() {
    // 1. Willkommen
    routines.push(() => {
        currentRoutine = new ResponsiveScreen("Willkommen zu diesem Experiment.\n\nSchön, dass Sie teilnehmen!", "[LEERTASTE DRÜCKEN ZUM FORTFAHREN]", [' '], nextRoutine);
        currentRoutine.draw();
    });
    // 2. Rosenberg Anleitung
    routines.push(() => {
        currentRoutine = new ResponsiveScreen("Es folgen einige Fragen zu Ihrer Person.\nBitte nutzen Sie die Tasten 1, 2, 3 oder 4 zum Antworten.", "[LEERTASTE DRÜCKEN]", [' '], nextRoutine);
        currentRoutine.draw();
    });
    // Rosenberg Items
    const rosenbergItems = ["Alles in allem bin ich mit mir selbst zufrieden.", "Alles in allem neige ich dazu, mich als Versager zu betrachten.", "Ich glaube, ich habe einen Haufen guter Eigenschaften.", "Ich kann Dinge genauso gut wie die meisten anderen Menschen.", "Ich glaube, ich habe nicht viel, worauf ich stolz sein könnte.", "Dienlich und nützlich fühl ich mich hin und wieder gewiss nicht.", "Ich glaube, ich bin ein wertvoller Mensch, zumindest nicht weniger als andere.", "Ich wünschte, ich könnte mehr Respekt vor mir selbst haben.", "Alles in allem bin ich eher geneigt, mich als Fehlschlag zu betrachten.", "Ich habe eine positive Einstellung zu mir selbst."];
    rosenbergItems.forEach(item => {
        routines.push(() => {
            currentRoutine = new ResponsiveScreen(item, "1 = Trifft gar nicht zu\n2 = Trifft eher nicht zu\n3 = Trifft eher zu\n4 = Trifft voll zu", ['1','2','3','4'], (key, rt) => {
                compiledData.push({ section: 'rosenberg', item: item, response: key, rt: rt });
                nextRoutine();
            });
            currentRoutine.draw();
        });
    });
    // 3. Lernen Anleitung
    routines.push(() => {
        let text = `Im folgenden Hauptteil werden Ihnen Wörter präsentiert. Sie sollen diese entweder auf sich selbst beziehen oder auf eine Ihnen unbekannte Person namens ${fremdName}.\n\nZur Person: ${beschreibungFremd}\n\nVerlassen Sie sich bei der Beurteilung bitte ganz auf Ihre Intuition.`;
        currentRoutine = new ResponsiveScreen(text, "Nach der Einschätzung folgt das Signal MERKEN oder VERGESSEN.\n\n[LEERTASTE ZUM STARTEN]", [' '], nextRoutine);
        currentRoutine.draw();
    });
    // Lernliste Durchgang
    learningItems.forEach(item => {
        routines.push(() => {
            // Fixation
            let baseSize = Math.max(canvas.width, canvas.height);
            currentRoutine = { draw: () => { ctx.fillStyle = "#7F7F7F"; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.fillStyle = "#000000"; ctx.font = `bold ${Math.round(baseSize*0.055)}px Arial`; ctx.textAlign = "center"; ctx.fillText("+", canvas.width/2, canvas.height/2); }, handleKey: () => {} };
            currentRoutine.draw();
            setTimeout(() => {
                currentRoutine = new ResponsiveScreen(item.word.toUpperCase(), item.prompt, ['f', 'j'], (key, rt) => {
                    compiledData.push({ section: 'learning', word: item.word, ref: item.ref, cue: item.cue, response: key === 'f'?'Nein':'Ja', rt: rt });
                    // Cue einblenden
                    currentRoutine = { draw: () => {
                        ctx.fillStyle = "#7F7F7F"; ctx.fillRect(0,0,canvas.width,canvas.height);
                        ctx.fillStyle = item.cue === "MERKEN" ? "#006400" : "#8B0000"; 
                        ctx.font = `bold ${Math.round(Math.max(canvas.width, canvas.height)*0.05)}px Arial`; ctx.textAlign = "center"; ctx.fillText(item.cue, canvas.width/2, canvas.height/2);
                    }, handleKey: () => {} };
                    currentRoutine.draw();
                    setTimeout(nextRoutine, 3000); 
                }, true);
                currentRoutine.draw();
            }, 500);
        });
    });
    // 4. Distraktor Spiel
    routines.push(() => {
        let text = "Ablenkungsaufgabe (Dauer: 60 Sekunden):\n\nEs erscheint gleich ein Quadrat in der Bildschirmmitte.\n\nWenn das Quadrat GRÜN wird -> Drücken Sie [LEERTASTE]!\nWenn das Quadrat ROT wird -> Drücken Sie NICHTS!";
        currentRoutine = new ResponsiveScreen(text, "[LEERTASTE DRÜCKEN ZUM STARTEN]", [' '], runDistractorGame);
        currentRoutine.draw();
    });
    // 5. Test Anleitung
    routines.push(() => {
        currentRoutine = new ResponsiveScreen("ÜBERRASCHUNGSTEST!\nEntscheiden Sie so schnell wie möglich, ob das Wort gelernt wurde oder NEU ist.", "[F] = NEU       [J] = ALT (vorgekommen)\n\n[LEERTASTE ZUM STARTEN]", [' '], nextRoutine);
        currentRoutine.draw();
    });
    // Testliste Durchgang
    testItems.forEach(item => {
        routines.push(() => {
            let baseSize = Math.max(canvas.width, canvas.height);
            currentRoutine = { draw: () => { ctx.fillStyle = "#7F7F7F"; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.fillStyle = "#000000"; ctx.font = `bold ${Math.round(baseSize*0.055)}px Arial`; ctx.textAlign = "center"; ctx.fillText("+", canvas.width/2, canvas.height/2); }, handleKey: () => {} };
            currentRoutine.draw();
            setTimeout(() => {
                currentRoutine = new ResponsiveScreen(item.word.toUpperCase(), "[F] = NEU       [J] = ALT", ['f', 'j'], (key, rt) => {
                    let resp = key === 'f' ? 'new' : 'old';
                    compiledData.push({ section: 'test', word: item.word, true_type: item.type, ref: item.ref, cue: item.cue, response: resp, correct: resp === item.type ? 1:0, rt: rt });
                    nextRoutine();
                }, true);
                currentRoutine.draw();
            }, 500);
        });
    });
    // 6. Post-Fragen Anleitung
    routines.push(() => {
        currentRoutine = new ResponsiveScreen("Zum Abschluss bitten wir Sie noch um die Beantwortung von fünf kurzen Fragen.", "[LEERTASTE DRÜCKEN]", [' '], nextRoutine);
        currentRoutine.draw();
    });
    const postQuestions = ["Haben Sie von der fremden Person ein konkretes Bild im Kopf gehabt?", "Haben Sie versucht, sich die zu merkenden Wörter aktiv zu merken?", "Haben Sie versucht, die zu vergessenden Wörter absichtlich zu vergessen?", "Haben Sie während der Lernphase Notizen gemacht (z. B. auf Papier oder am PC)?", "Haben Sie an diesem Experiment ernsthaft und konzentriert teilgenommen?"];
    postQuestions.forEach(q => {
        routines.push(() => {
            currentRoutine = new ResponsiveScreen(q, "[F] = NEIN       [J] = JA", ['f', 'j'], (key, rt) => {
                compiledData.push({ section: 'post_question', question: q, response: key==='f'?'Nein':'Ja', rt: rt });
                nextRoutine();
            });
            currentRoutine.draw();
        });
    });
    // 7. Ende & Code-Abgabe
    routines.push(() => {
        sendDataToOSF();
        currentRoutine = { draw: () => {
            ctx.fillStyle = "#7F7F7F"; ctx.fillRect(0,0,canvas.width,canvas.height);
            ctx.fillStyle = "#000000"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
            let baseSize = Math.max(canvas.width, canvas.height);
            ctx.font = `${Math.round(baseSize * 0.022)}px Arial`;
            ctx.fillText("Vielen Dank für Ihre Teilnahme!", canvas.width/2, canvas.height/2 - 80);
            ctx.font = `bold ${Math.round(baseSize * 0.026)}px Arial`;
            ctx.fillText("Ihr SurveyCircle-Freischaltcode lautet:", canvas.width/2, canvas.height/2 + 10);
            ctx.fillStyle = "#8B0000"; ctx.font = `bold ${Math.round(baseSize * 0.032)}px Arial`;
            ctx.fillText("XXXX-XXXX-XXXX", canvas.width/2, canvas.height/2 + 90); // <--- HIER DEINEN ECHTEN CODE EINTRAGEN
        }, handleKey: () => {} };
        currentRoutine.draw();
    });

    executeRoutineIndex(0);
}

let currentIdx = 0;
function executeRoutineIndex(idx) { currentIdx = idx; if(idx < routines.length) routines[idx](); }
function nextRoutine() { executeRoutineIndex(currentIdx + 1); }

window.addEventListener('keydown', (e) => { if(currentRoutine && currentRoutine.handleKey) currentRoutine.handleKey(e.key.toLowerCase()); });

// Distraktor-Engine
function runDistractorGame() {
    let gameEndTime = performance.now() + 60000;
    function spawnTrial() {
        if(performance.now() >= gameEndTime) { nextRoutine(); return; }
        let isGo = Math.random() < 0.7;
        let color = isGo ? "#006400" : "#8B0000";
        let responded = false;
        let tStart = performance.now();
        
        let size = Math.min(canvas.width, canvas.height) * 0.35; // Quadratgröße skaliert mit dem Bildschirm
        
        currentRoutine = {
            draw: () => {
                ctx.fillStyle = "#7F7F7F"; ctx.fillRect(0,0,canvas.width,canvas.height);
                ctx.fillStyle = color; ctx.fillRect(canvas.width/2 - size/2, canvas.height/2 - size/2, size, size);
            },
            handleKey: (key) => {
                if(key === ' ' && !responded) {
                    responded = true;
                    let rt = (performance.now() - tStart) / 1000;
                    compiledData.push({ section: 'distractor', type: isGo?'Go':'NoGo', result: isGo?'Hit':'False Alarm', rt: rt });
                }
            }
        };
        currentRoutine.draw();

        setTimeout(() => {
            if(!responded) {
                compiledData.push({ section: 'distractor', type: isGo?'Go':'NoGo', result: isGo?'Miss':'Correct Rejection', rt: -1 });
            }
            ctx.fillStyle = "#7F7F7F"; ctx.fillRect(0,0,canvas.width,canvas.height);
            // KORREKTUR: Der blockierende fehlerhafte Aufruf wurde entfernt
            setTimeout(spawnTrial, 500 + Math.random()*500);
        }, 1200);
    }
    spawnTrial();
}

// Datenkonvertierung und OSF-Schnittstelle (DataPipe)
function convertToCSV() {
    let csv = "participant,alter,geschlecht,beruf,section,word,true_type,ref,cue,question,response,correct,rt\n";
    compiledData.forEach(d => {
        csv += `"${expInfo.participant}","${expInfo.Alter}","${expInfo.Geschlecht}","${expInfo.Beruf}","${d.section || ''}","${d.word || ''}","${d.true_type || ''}","${d.ref || ''}","${d.cue || ''}","${d.question || ''}","${d.response || ''}","${d.correct !== undefined ? d.correct : ''}","${d.rt}"\n`;
    });
    return csv;
}

function sendDataToOSF() {
    const filename = `subject_${expInfo.participant}.csv`;
    const csvContent = convertToCSV();

    fetch("https://jspsych.org", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "*/*" },
        body: JSON.stringify({
            experimentID: "DEINE_DATAPIPE_EXPERIMENT_ID_HIER", // <--- HIER EXPERIMENT-ID EINTRAGEN!
            filename: filename,
            data: csvContent
        })
    }).then(res => console.log("Abgabe an OSF erfolgt. Status: ", res.status));
}
