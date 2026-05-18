// Status-Elemente aus der HTML-Datei ziehen
const statusDiv = document.getElementById('status');
const instructionP = document.getElementById('instruction');

// Event Listener wartet auf den Tastendruck
window.addEventListener('keydown', function(e) {
    if (e.key === ' ' || e.code === 'Space') {
        // Tastatur sofort blockieren, damit man nur einmal drücken kann
        instructionP.innerHTML = "Sendevorgang läuft...";
        statusDiv.innerHTML = "Verbindung zu OSF wird aufgebaut...";
        statusDiv.style.color = "blue";
        
        sendTestFields();
    }
});

function sendTestFields() {
    // 1. Erstelle künstliche Testdaten im CSV-Format
    const csvContent = "participant,status,test_time\n" + 
                     `"test_user_mac","VERBINDUNG_ERFOLGREICH","${new Date().toISOString()}"\n`;
    
    // 2. Sende die Daten an die neue v1-Schnittstelle von DataPipe
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
        }
    })
    .catch(err => {
        // ROTE MELDUNG: Internet weg oder URL falsch eingetippt
        statusDiv.innerHTML = `❌ NETZWERK-FEHLER!<br>${err.message}`;
        statusDiv.style.color = "red";
    });
}
