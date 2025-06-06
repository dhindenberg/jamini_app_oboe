/**
 * GUI Class
 * Diese Klasse erstellt eine grafische BenutzeroberflÃ¤che, um Akkorde einer Liste anzuzeigen.
 */

class GUI {
  constructor() {
    this.container = document.getElementById("chordWrapper");
    if (!this.container) {
      console.error(`Container mit der ID "${containerId}" nicht gefunden.`);
    }
  }

  /**
   * Zeigt eine Liste von Akkorden auf der HTML-Seite an, wobei jeweils vier Akkorde nebeneinander dargestellt werden.
   * @param {string[]} chordList - Die Liste der Akkordnamen.
   */
  displayChords(song) {
    let displaySong = new DisplaySong(song);

    // Leere den Container, bevor neue Akkorde hinzugefÃ¼gt werden
    this.container.innerHTML = displaySong.render();
  }

  setBorderHighlight(barNr) {
    // 1. Alle Divs mit einer 'h_' Klasse auswählen
    const barDivs = document.querySelectorAll('[class*="h_"]');

    // 2. Hintergrundfarbe für alle ausgewählten Divs auf Weiß setzen
    barDivs.forEach((div) => {
      div.style.backgroundColor = "white";
    });

    // 3. Den spezifischen Div mit der Klasse 'h_barNr' auswählen und hervorheben
    const targetDiv = document.querySelector(`.h_${barNr}`);

    if (targetDiv) {
      targetDiv.style.backgroundColor = "#ccc";
    } else {
      console.warn(`Kein Div mit der Klasse 'h_${barNr}' gefunden.`);
    }
  }

  // Funktion zur Erstellung der Beat-Auswahlbox
  createBeatSelectBox(containerId, timeSignature) {
    const beatConfig = {};
    beatConfig["4/4"] = [
      { name: "Swing 4/4", file: "beats/44/swing.json" },
      { name: "hop 1 4/4", file: "beats/44/hop_1.json" },
    ];
    beatConfig["3/4"] = [
      { name: "Swing_1  3/4", file: "beats/34/swing_1.json" },
      { name: "Swing_2  3/4", file: "beats/34/swing_2.json" },
    ];

    const container = document.getElementById(containerId);

    // Entferne die vorhandene Select-Box, falls vorhanden
    const existingSelectBox = document.getElementById("beatSelect");
    if (existingSelectBox) {
      container.removeChild(existingSelectBox);
    }

    const selectBox = document.createElement("select");
    selectBox.id = "beatSelect";

    beatConfig[timeSignature].forEach((beat, index) => {
      const option = document.createElement("option");
      option.value = beat.file;
      option.textContent = beat.name;
      if (index === 0) {
        option.selected = true;
      }
      selectBox.appendChild(option);
    });

    container.appendChild(selectBox);

    // Event-Listener zur Aktualisierung des ausgewählten Beats
    selectBox.addEventListener("change", (event) => {
      //selectedBeatFile = event.target.value;
      //console.log(`Ausgewählter Beat: ${selectedBeatFile}`);
    });
  }
}
