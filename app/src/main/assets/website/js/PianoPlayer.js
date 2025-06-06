class PianoPlayer {
  constructor() {
	this.totalShift = -21;//schiebt die 60 auf das c4 middle c
    this.howlObjects = []; // Array zum Speichern der Howl-Objekte
    this.fadeDuration = 50; // Konstante Ausfade-Dauer in Millisekunden
    this.loadWaveFiles();
  }

  /**
   * Lädt alle Wave-Dateien und erstellt Howl-Instanzen für jede Datei.
   */
	loadWaveFiles() {
	  this.howlObjects = []; // Array zurücksetzen
	  
	  for (let i = 21; i <= 108; i++) {
		let fileName = i.toString() + ".mp3"; 
		let encodedFileName = encodeURIComponent(fileName); // URL-Encoding für Sicherheit
		
		const url = `audio/piano/${encodedFileName}`;

		// Erstelle ein Howl-Objekt für jede Datei
		const howl = new Howl({
		  src: [url],
		  preload: true,
		  format: ['mp3'], // Sicherstellen, dass das Format erkannt wird
		  volume: 0.2,
		});

		this.howlObjects.push(howl);
	  }
	  
	}


	mtRand(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	playNote(noteNr, lengthMs, volume = 0.2) {
		noteNr+=this.totalShift;
		
		if (noteNr < 0 || noteNr >= this.howlObjects.length) {
			console.error(`Ungültige Note-Nummer: ${noteNr}`);
			return;
		}

		const howl = this.howlObjects[noteNr];
		if (!howl) {
			console.error(`Howl-Objekt nicht geladen für NoteNr: ${noteNr}`);
			return;
		}

		const fadeDuration = this.mtRand(30, 50); // Dauer des Ausfadens in ms
		const fadeStart = Math.max(0, lengthMs - fadeDuration); // Zeitpunkt, um mit dem Ausfaden zu beginnen
		const stopTime = Math.max(lengthMs, fadeDuration)+10; // Zeitpunkt, um den Ton zu stoppen

		// Setze die Lautstärke und spiele die Note ab
		howl.volume(0.07);
		const soundId = howl.play();

		// Starte das Ausfaden
		
		setTimeout(() => {
			howl.fade(volume, 0.0, Math.floor(fadeDuration), soundId); // Passe die Startlautstärke für das Fade an
		}, fadeStart);		

		// Stoppe die Note erst nach Abschluss des Ausfadens
		/*
		setTimeout(() => {
			howl.stop(soundId);
		}, stopTime);
		*/
	}
	
}
