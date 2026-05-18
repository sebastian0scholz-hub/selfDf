// Status-Elemente aus der HTML-Datei ziehen
const statusDiv = document.getElementById('status');
const instructionP = document.getElementById('instruction');

// ID hier eintragen (Achten Sie darauf, dass die Anführungszeichen absolut gerade sind!)
let myToken = 'DEINE_DATAPIPE_ID_HIER'; 

// Sicherstellen, dass das Skript geladen ist
console.log("Test-Skript aktiv. Warte auf Leertaste...");

// Event Listener wartet auf den Tastendruck
window.addEventListener('keydown', function(e) {
    // Akzeptiert Leertaste (Code 'Space' oder Zeichen ' ')
    if (e.key === ' ' || e.code === 'Space') {
        
        // Tastatur sofort blockieren, damit man nur einmal drücken kann
        instructionP.innerHTML = "Sendevorgang läuft...";
        statusDiv.innerHTML = "Verbindung zu OSF wird aufgebaut...";
        statusDiv.style.color = "blue";
        
        sendTestFields();
    }
});

function sendTestFields() {
    // 1. Künstliche Testdaten im CSV-Format erstellen
    const csvContent = "participant,status,test_time\n" + 
                     `"test_user_mac","VERBINDUNG_ERFOLGREICH","${new Date().toISOString()}"\n`;
    
    // 2. Paket für DataPipe schnüren
    const payload = {
        token: myToken.trim(), // Entfernt versehentliche Leerzeichen beim Kopieren
        filename: "connection_test_mac.csv",
        data: csvContent
    };

    // 3. Sende die Daten an die gesicherte v1-Schnittstelle von DataPipe
    fetch("https://pipe.jspsych.org/api/data/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "*/*",
  },
  body: JSON.stringify({
    experimentID: "WimrwOGIeFL8",
    filename: "UNIQUE_FILENAME.csv",
    data: dataAsString,
  }),
});

    .then(res => {
        if (res.ok) {
            // GRÜNE MELDUNG: Daten sind durchgegangen!
            statusDiv.innerHTML = "🎉 ERFOLG!<br>Daten wurden an DataPipe/OSF übertragen.";
            statusDiv.style.color = "green";
            instructionP.innerHTML = "Prüfen Sie jetzt Ihr DataPipe-Dashboard (Zähler sollte bei 1 stehen).";
        } else {
            // ROTE MELDUNG: Server lehnt ID ab oder OSF-Link fehlt
            statusDiv.innerHTML = `❌ SERVER-FEHLER!<br>Statuscode: ${res.status}<br>(Prüfen Sie, ob Data Collection aktiv ist)`;
            statusDiv.style.color = "red";
            instructionP.innerHTML = "Fehler 400 bedeutet: DataPipe kennt diese ID nicht oder OSF ist nicht verknüpft.";
        }
    })
    .catch(err => {
        // ROTE MELDUNG: Internet weg oder URL blockiert
        statusDiv.innerHTML = `❌ NETZWERK-FEHLER!<br>${err.message}`;
        statusDiv.style.color = "red";
    });
}
