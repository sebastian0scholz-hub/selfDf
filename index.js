let expName = 'SRE_DirectedForgetting';
let expInfo = { 'participant': '', 'Alter': '', 'Geschlecht': '', 'Beruf': '', 'date': new Date().toISOString() };
let currentRoutine = null; let compiledData = [];
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const canvas = document.getElementById('experiment-canvas'); const ctx = canvas.getContext('2d');
function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; if(currentRoutine) currentRoutine.draw(); }
window.addEventListener('resize', resizeCanvas); window.addEventListener('orientationchange', () => { setTimeout(resizeCanvas, 200); }); resizeCanvas();

function wrapText(text, x, y, maxWidth, lineHeight, align = "center") {
    let words = text.split(' '); let line = ''; let lines = [];
    for (let n = 0; n < words.length; n++) {
        if (words[n].includes('\n')) {
            let parts = words[n].split('\n');
            for (let i = 0; i < parts.length; i++) {
                let testLine = line + parts[i] + ' '; let metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && n > 0) { lines.push(line); line = parts[i] + ' '; } else { line = testLine; }
                if (i < parts.length - 1) { lines.push(line); line = ''; }
            }
        } else {
            let testLine = line + words[n] + ' '; let metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) { lines.push(line); line = words[n] + ' '; } else { line = testLine; }
        }
    }
    lines.push(line);
    let totalHeight = lines.length * lineHeight; let currentY = y - (totalHeight / 2) + (lineHeight / 2);
    ctx.textAlign = align;
    for (let k = 0; k < lines.length; k++) { ctx.fillText(lines[k], x, currentY); currentY += lineHeight; }
}

const posPool = ["pünktlich", "ehrlich", "kreativ", "mutig", "treu", "klug", "höflich", "fair", "aktiv", "warm", "stark", "ruhig", "weise", "froh", "offen", "witzig", "sanft", "heiter", "stolz", "flexibel", "charmant", "fokussiert", "geduldig", "gütig", "heldenhaft", "genial", "herzlich", "tolerant", "vital", "loyal", "achtsam", "fleißig", "reif", "sicher", "optimistisch", "dynamisch", "edel", "geschickt", "logisch", "munter", "aufgeweckt", "bescheiden", "diszipliniert", "eloquent", "empathisch", "fürsorglich", "humorvoll", "innovativ", "kompetent", "lebensfroh", "liebenswürdig", "motiviert", "produktiv", "zuverlässig", "selbstbewusst", "sorgfältig", "spontan", "tapfer", "umsichtig", "zielstrebig", "authentisch", "begeistert", "besonnen", "diplomatisch", "einfühlsam", "engagiert", "friedlich", "großzügig", "hilfbereit", "höflich", "inspirierend", "liebenswert", "mitfühlend", "organisiert", "respektvoll", "souverän", "tatkräftig", "verständnisvoll", "visionär", "warmherzig"];
const negPool = ["faul", "gierig", "feige", "neidisch", "stur", "zornig", "frech", "kalt", "träge", "lax", "grob", "starr", "naiv", "böse", "scheu", "wirr", "hart", "falsch", "sauer", "arrogant", "chaotisch", "egoistisch", "geizig", "hinterlistig", "ignorant", "kleinlich", "launisch", "rachsüchtig", "unhöflich", "ängstlich", "bitter", "dreist", "eitel", "herzlos", "intolerant", "kritisch", "nachlässig", "oberflächlich", "passiv", "reizbar", "schadenfroh", "skeptisch", "taktlos", "überheblich", "ungeduldig", "unzuverlässig", "verbittert", "vorlaut", "zäh", "aggressiv", "bequem", "dominant", "eingebildet", "frustriert", "gleichgültig", "heuchlerisch", "kompliziert", "misstrauisch", "nachgiebig", "neurotisch", "pedantisch", "pessimistisch", "rücksichtslos", "schüchtern", "streitsüchtig", "unentschlossen", "unorganisiert", "unzufrieden", "verlogen", "verschlossen", "vorsichtig", "wankelmütig", "wehleidig", "wortkarg", "zynisch", "wütend", "verbissen"];
posPool.sort(() => Math.random() - 0.5); negPool.sort(() => Math.random() - 0.5);

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
addItems(learnPos, 20, "self", "Beschreibt dieses Wort DICH?");
addItems(learnNeg, 20, "self", "Beschreibt dieses Wort DICH?");
addItems(learnPos, 20, "other", `Beschreibt dieses Wort ${fremdName}?`);
addItems(learnNeg, 20, "other", `Beschreibt dieses Wort ${fremdName}?`);
learningItems.sort(() => Math.random() - 0.5);

let testItems = [...learningItems];
testDistPos.forEach(w => testItems.push({ word: w, type: 'new', ref: 'none', cue: 'none' }));
testDistNeg.forEach(w => testItems.push({ word: w, type: 'new', ref: 'none', cue: 'none' }));
testItems.sort(() => Math.random() - 0.5);

document.getElementById('start-btn').addEventListener('click', () => {
    const alter = document.getElementById('input-alter').value; const geschlecht = document.getElementById('select-geschlecht').value; const beruf = document.getElementById('input-beruf').value;
    if (!alter || geschlecht === "Auswahl" || !beruf) { document.getElementById('error-msg').style.display = "block"; return; }
    const urlParams = new URLSearchParams(window.location.search);
    expInfo.participant = urlParams.get('participant') || "web_" + Math.floor(Math.random()*100000);
    expInfo.Alter = alter; expInfo.Geschlecht = geschlecht; expInfo.Beruf = beruf;
    document.getElementById('form-overlay').style.display = 'none'; document.getElementById('canvas-container').style.display = 'flex';
    resizeCanvas(); startExperiment();
});

class ResponsiveScreen {
    constructor(title, sub, allowedKeys, callback, isStimulus = false, alignSub = "center", buttonType = "none") {
        this.title = title; this.sub = sub; this.allowedKeys = allowedKeys; this.callback = callback;
        this.isStimulus = isStimulus; this.alignSub = alignSub; this.buttonType = buttonType;
        this.startTime = performance.now(); this.active = true;
        this.setupMobileControls();
    }
    setupMobileControls() {
        const binButtons = document.getElementById('mobile-binary-buttons'); const numButtons = document.getElementById('mobile-number-buttons');
        const bLeft = document.getElementById('btn-left'); const bRight = document.getElementById('btn-right');
        
        if (isMobile && this.buttonType === "binary-learn") {
            binButtons.style.display = 'flex'; numButtons.style.display = 'none';
            bLeft.innerHTML = "NEIN"; bRight.innerHTML = "JA";
            bLeft.onclick = () => this.handleKey('f'); bRight.onclick = () => this.handleKey('j');
        } else if (isMobile && this.buttonType === "binary-test") {
            binButtons.style.display = 'flex'; numButtons.style.display = 'none';
            bLeft.innerHTML = "NEU"; bRight.innerHTML = "ALT";
            bLeft.onclick = () => this.handleKey('f'); bRight.onclick = () => this.handleKey('j');
        } else if (isMobile && this.buttonType === "binary-post") {
            binButtons.style.display = 'flex'; numButtons.style.display = 'none';
            bLeft.innerHTML = "NEIN"; bRight.innerHTML = "JA";
            bLeft.onclick = () => this.handleKey('f'); bRight.onclick = () => this.handleKey('j');
        } else if (isMobile && this.allowedKeys.includes('1')) {
            binButtons.style.display = 'none'; numButtons.style.display = 'flex';
            document.getElementById('btn-1').onclick = () => this.handleKey('1'); document.getElementById('btn-2').onclick = () => this.handleKey('2');
            document.getElementById('btn-3').onclick = () => this.handleKey('3'); document.getElementById('btn-4').onclick = () => this.handleKey('4');
        } else {
            binButtons.style.display = 'none'; numButtons.style.display = 'none';
            if (isMobile && this.allowedKeys.includes(' ')) { canvas.onclick = () => this.handleKey(' '); }
        }
    }
    draw() {
        ctx.fillStyle = "#7F7F7F"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = "#000000"; ctx.textBaseline = "middle";
        let baseSize = Math.max(canvas.width, canvas.height); let scaleFactor = isMobile ? 1.8 : 1.0;
        let titleSize = this.isStimulus ? Math.round(baseSize * 0.0275 * scaleFactor) : Math.round(baseSize * 0.013 * scaleFactor);
        ctx.font = "bold " + titleSize + "px Arial"; let maxWidth = canvas.width * 0.90;
        let titleY = this.sub ? canvas.height * 0.28 : canvas.height * 0.50;
        wrapText(this.title, canvas.width / 2, titleY, maxWidth, titleSize * 1.3, "center");
        if (this.sub) {
            let subY = canvas.height * 0.70; let subX = this.alignSub === "left" && !isMobile ? canvas.width / 2 - 80 : canvas.width / 2;
            wrapText(this.sub, subX, subY, maxWidth, titleSize * 1.3, isMobile ? "center" : this.alignSub);
        }
    }
    handleKey(key) {
        if (!this.active || !this.allowedKeys.includes(key)) return;
        this.active = false; canvas.onclick = null;
        document.getElementById('mobile-binary-buttons').style.display = 'none'; document.getElementById('mobile-number-buttons').style.display = 'none';
        let rt = (performance.now() - this.startTime) / 1000; this.callback(key, rt);
    }
}

let routines = [];
function startExperiment() {
    routines.push(() => { currentRoutine = new ResponsiveScreen("Willkommen zu diesem Experiment.\n\nSchön, dass Sie teilnehmen!", isMobile ? "[AUF DEN BILDSCHIRM TIPPEN]" : "[LEERTASTE DRÜCKEN]", [' '], nextRoutine); currentRoutine.draw(); });
    routines.push(() => { currentRoutine = new ResponsiveScreen("Es folgen einige Fragen zu Ihrer Person.\nBitte nutzen Sie die angezeigten Buttons zum Antworten.", isMobile ? "[AUF DEN BILDSCHIRM TIPPEN]" : "[LEERTASTE DRÜCKEN]", [' '], nextRoutine); currentRoutine.draw(); });
    
    const rosenbergItems = ["Alles in allem bin ich mit mir selbst zufrieden.", "Alles in allem neige ich dazu, mich als Versager zu betrachten.", "Ich glaube, ich habe einen Haufen guter Eigenschaften.", "Ich kann Dinge genauso gut wie die meisten anderen Menschen.", "Ich glaube, ich nachlässig bin ich hin und wieder gewiss nicht.", "Dienlich und nützlich fühl ich mich hin und wieder gewiss nicht.", "Ich glaube, ich bin ein wertvoller Mensch, zumindest nicht weniger als andere.", "Ich wünschte, ich könnte mehr Respekt vor mir selbst haben.", "Alles in allem bin ich eher geneigt, mich als Fehlschlag zu betrachten.", "Ich habe eine positive Einstellung zu mir selbst."];
    rosenbergItems.forEach(item => {
        routines.push(() => { currentRoutine = new ResponsiveScreen(item, isMobile ? "" : "1 = Trifft gar nicht zu\n2 = Trifft eher nicht zu\n3 = Trifft eher zu\n4 = Trifft voll zu", ['1','2','3','4'], (key, rt) => { compiledData.push({ section: 'rosenberg', item: item, response: key, rt: rt }); nextRoutine(); }, false, "left"); currentRoutine.draw(); });
    });
    
    routines.push(() => {
        let text = `Im folgenden Hauptteil werden Ihnen Wörter präsentiert. Sie sollen diese entweder auf sich selbst beziehen oder auf eine Ihnen unbekannte Person namens ${fremdName}.\n\nZur Person: ${beschreibungFremd}\n\nVerlassen Sie sich bei der Beurteilung bitte ganz auf Ihre Intuition.\n\nNach der Einschätzung folgt die Anweisung das Wort zu merken oder zu vergessen. Nur Wörter, die gemerkt werden sollen, werden später in einem Test abgefragt.`;
        currentRoutine = new ResponsiveScreen(text, null, [' '], nextRoutine); currentRoutine.draw();
    });
    
    learningItems.forEach(item => {
        routines.push(() => {
            let baseSize = Math.max(canvas.width, canvas.height); let fixSize = isMobile ? Math.round(baseSize*0.0275*1.8) : Math.round(baseSize*0.0275);
            currentRoutine = { draw: () => { ctx.fillStyle = "#7F7F7F"; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.fillStyle = "#000000"; ctx.font = "bold " + fixSize + "px Arial"; ctx.textAlign = "center"; ctx.fillText("+", canvas.width/2, canvas.height/2); }, handleKey: () => {} }; currentRoutine.draw();
            setTimeout(() => {
                let pcPrompt = "\n\n[F] = NEIN    [J] = JA";
                // KORREKTUR: item.prompt (die Frage zur Person) wird nun sauber als Haupttitel übergeben, das Adjektiv steht darunter im Subtext
                currentRoutine = new ResponsiveScreen(item.prompt, isMobile ? item.word.toUpperCase() : item.word.toUpperCase() + pcPrompt, ['f', 'j'], (key, rt) => {
                    compiledData.push({ section: 'learning', word: item.word, ref: item.ref, cue: item.cue, response: key === 'f'?'Nein':'Ja', rt: rt });
                    currentRoutine = { draw: () => {
                        ctx.fillStyle = "#7F7F7F"; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.fillStyle = item.cue === "MERKEN" ? "#006400" : "#8B0000"; 
                        let cueSize = isMobile ? Math.round(Math.max(canvas.width, canvas.height)*0.025*1.8) : Math.round(Math.max(canvas.width, canvas.height)*0.025);
                        ctx.font = "bold " + cueSize + "px Arial"; ctx.textAlign = "center"; ctx.fillText(item.cue, canvas.width/2, canvas.height/2);
                    }, handleKey: () => {} }; currentRoutine.draw();
                    setTimeout(nextRoutine, 3000); 
                }, true, "center", "binary-learn"); currentRoutine.draw();
            }, 500);
        });
    });
    
    routines.push(() => { 
        let text = "Ablenkungsaufgabe (Dauer: 60 Sekunden):\n\nEs erscheint gleich ein Quadrat in der Bildschirmmitte.\n\nWenn das Quadrat GRÜN wird -> " + (isMobile ? "Auf den Bildschirm tippen!" : "LEERTASTE drücken!") + "\nWenn das Quadrat ROT wird -> Machen Sie NICHTS!";
        currentRoutine = new ResponsiveScreen(text, isMobile ? "[AUF DEN BILDSCHIRM TIPPEN ZUM STARTEN]" : "[LEERTASTE ZUM STARTEN]", [' '], runDistractorGame); currentRoutine.draw(); 
    });
    routines.push(() => { 
        let text = "ÜBERRASCHUNGSTEST!\n\nEntscheiden sie so schnell wie möglich, ob ein Wort am Anfang präsentiert wurde oder aber neu ist. Dabei ist egal, ob sie das wort merken oder vergessen sollten.";
        currentRoutine = new ResponsiveScreen(text, isMobile ? "[AUF DEN BILDSCHIRM TIPPEN ZUM STARTEN]" : "[LEERTASTE ZUM STARTEN]", [' '], nextRoutine); currentRoutine.draw(); 
    });
    
    testItems.forEach(item => {
        routines.push(() => {
            let baseSize = Math.max(canvas.width, canvas.height); let fixSize = isMobile ? Math.round(baseSize*0.0275*1.8) : Math.round(baseSize*0.0275);
            currentRoutine = { draw: () => { ctx.fillStyle = "#7F7F7F"; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.fillStyle = "#000000"; ctx.font = "bold " + fixSize + "px Arial"; ctx.textAlign = "center"; ctx.fillText("+", canvas.width/2, canvas.height/2); }, handleKey: () => {} }; currentRoutine.draw();
            setTimeout(() => {
                currentRoutine = new ResponsiveScreen(item.word.toUpperCase(), isMobile ? "" : "[F] = NEU       [J] = ALT", ['f', 'j'], (key, rt) => {
                    let resp = key === 'f' ? 'new' : 'old';
                    compiledData.push({ section: 'test', word: item.word, true_type: item.type, ref: item.ref, cue: item.cue, response: resp, correct: resp === item.type ? 1:0, rt: rt });
                    nextRoutine();
                }, true, "center", "binary-test"); currentRoutine.draw();
            }, 500);
        });
    });
    
    routines.push(() => { currentRoutine = new ResponsiveScreen("Zum Abschluss bitten wir Sie noch um die Beantwortung von fünf kurzen Fragen.", isMobile ? "[AUF DEN BILDSCHIRM TIPPEN]" : "[LEERTASTE DRÜCKEN]", [' '], nextRoutine); currentRoutine.draw(); });
    const postQuestions = ["Haben Sie von der fremden Person ein konkretes Bild im Kopf gehabt?", "Haben Sie versucht, sich die zu merkenden Wörter aktiv zu merken?", "Haben Sie versucht, die zu vergessenden Wörter absichtlich zu vergessen?", "Haben Sie während der Lernphase Notizen gemacht (z. B. auf Papier oder am PC)?", "Haben Sie an diesem Experiment ernsthaft und konzentriert teilgenommen?"];
    postQuestions.forEach(q => {
        routines.push(() => { currentRoutine = new ResponsiveScreen(q, isMobile ? "" : "[F] = NEIN       [J] = JA", ['f', 'j'], (key, rt) => { compiledData.push({ section: 'post_question', question: q, response: key==='f'?'Nein':'Ja', rt: rt }); nextRoutine(); }, false, "center", "binary-post"); currentRoutine.draw(); });
    });
    
    routines.push(() => {
        sendDataToOSF();
        currentRoutine = { draw: () => {
            ctx.fillStyle = "#7F7F7F"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = "#000000"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
            let baseSize = Math.max(canvas.width, canvas.height); let endSize = isMobile ? Math.round(baseSize * 0.011 * 1.8) : Math.round(baseSize * 0.011);
            ctx.font = "bold " + endSize + "px Arial"; ctx.fillText("Vielen Dank für Ihre Teilnahme!", canvas.width/2, canvas.height/2 - 40);
            ctx.fillText("Ihr SurveyCircle-Freischaltcode lautet:", canvas.width/2, canvas.height/2 + 5);
            ctx.fillStyle = "#8B0000"; ctx.fillText("XXXX-XXXX-XXXX", canvas.width/2, canvas.height/2 + 45); 
        }, handleKey: () => {} }; currentRoutine.draw();
    });
    executeRoutineIndex(0);
}

let currentIdx = 0; function executeRoutineIndex(idx) { currentIdx = idx; if(idx < routines.length) routines[idx](); } function nextRoutine() { executeRoutineIndex(currentIdx + 1); }
window.addEventListener('keydown', (e) => { if(currentRoutine && currentRoutine.handleKey) currentRoutine.handleKey(e.key.toLowerCase()); });

function runDistractorGame() {
    let gameEndTime = performance.now() + 60000;
    function spawnTrial() {
        if(performance.now() >= gameEndTime) { nextRoutine(); return; }
        let isGo = Math.random() < 0.7; let color = isGo ? "#006400" : "#8B0000"; let responded = false; let tStart = performance.now(); let size = Math.min(canvas.width, canvas.height) * 0.20; 
        if (isMobile) { canvas.onclick = () => { if(!responded) { responded = true; let rt = (performance.now() - tStart) / 1000; compiledData.push({ section: 'distractor', type: isGo?'Go':'NoGo', result: isGo?'Hit':'False Alarm', rt: rt }); } }; }
        currentRoutine = {
            draw: () => { ctx.fillStyle = "#7F7F7F"; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.fillStyle = color; ctx.fillRect(canvas.width/2 - size/2, canvas.height/2 - size/2, size, size); },
            handleKey: (key) => { if(key === ' ' && !responded) { responded = true; let rt = (performance.now() - tStart) / 1000; compiledData.push({ section: 'distractor', type: isGo?'Go':'NoGo', result: isGo?'Hit':'False Alarm', rt: rt }); } }
        }; currentRoutine.draw();
        setTimeout(() => { canvas.onclick = null; if(!responded) { compiledData.push({ section: 'distractor', type: isGo?'Go':'NoGo', result: isGo?'Miss':'Correct Rejection', rt: -1 }); } ctx.fillStyle = "#7F7F7F"; ctx.fillRect(0,0,canvas.width,canvas.height); setTimeout(spawnTrial, 500 + Math.random()*500); }, 1200);
    }
    spawnTrial();
}

function convertToCSV() {
    let csv = "participant,alter,geschlecht,beruf,section,word,true_type,ref,cue,question,response,correct,rt\n";
    compiledData.forEach(d => { csv += `"${expInfo.participant}","${expInfo.Alter}","${expInfo.Geschlecht}","${expInfo.Beruf}","${d.section || ''}","${d.word || ''}","${d.true_type || ''}","${d.ref || ''}","${d.cue || ''}","${d.question || ''}","${d.response || ''}","${d.correct !== undefined ? d.correct : ''}","${d.rt}"\n`; });
    return csv;
}

function sendDataToOSF() {
    const filename = `subject_${expInfo.participant}.csv`; const csvContent = convertToCSV();
    fetch("https://jspsych.org", {
        method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ token: "WimrwOGIeFL8", filename: filename, data: csvContent })
    }).then(res => console.log("Abgabe an OSF erfolgt. Status: ", res.status));
}
