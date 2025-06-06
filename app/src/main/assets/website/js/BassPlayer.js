class BassPlayer {
  constructor() {
	//tiefe e seite ist E1, midi Nr 28 mit 41.20hz	  
	this.totalShift = -28;//schiebt den bass mit midiNr 28 auf das tiefe E1
    this.noteNames = ['e', 'f', 'f%23', 'g', 'g%23', 'a', 'a%23', 'b', 'c', 'c%23', 'd', 'd%23'];
    this.octaves = [1];
    this.howlObjects = []; // Array zum Speichern der Howl-Objekte
    this.fadeDuration = 50; // Konstante Ausfade-Dauer in Millisekunden
    this.loadWaveFiles();
  }

  /**
   * Lädt alle Wave-Dateien und erstellt Howl-Instanzen für jede Datei.
   */
  loadWaveFiles() {
    
    let noteNr = 0;
    let folder = 'vel_77_wav';
    for (let i = 0; i < 23; i++) {
      const url = `audio/upright_bass/${folder}/${i}.wav`;
        // Erstelle ein Howl-Objekt für jede Datei
        const howl = new Howl({
          src: [url],
          preload: true, // Vorladen der Datei
          format: ['mp3'], // Sicherstellen, dass das Format korrekt erkannt wird
          volume: 1.0, // Maximale Lautstärke
        });
        this.howlObjects.push(howl);        
    }    
  }

	mtRand(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}
  playNote(noteNr, lengthMs) {    
    noteNr += this.totalShift;
  
    if (noteNr < 0 || noteNr >= this.howlObjects.length) {
      //noteNr+=12;//secure fix
      console.error(`Ungültige Note-Nummer: ${noteNr}`);      
    }
  
    const howl = this.howlObjects[noteNr];
    if (!howl) {
      console.error(`Howl-Objekt nicht geladen für NoteNr: ${noteNr}`);
      return;
    }
  
    const fadeDuration = this.mtRand(30, 50); // Dauer des Ausfadens in ms
    const fadeStart = Math.max(0, lengthMs - fadeDuration); // Zeitpunkt, um mit dem Ausfaden zu beginnen
    const stopTime = Math.max(lengthMs, fadeDuration) + 10; // Zeitpunkt, um den Ton zu stoppen
  
    howl.volume(1);
    const soundId = howl.play();
  
    // Starte das Ausfaden
    setTimeout(() => {
      const currentVolume = howl.volume(soundId); // aktuelle Lautstärke für diesen Sound
      howl.fade(currentVolume, 0.0, Math.floor(fadeDuration), soundId);
    }, fadeStart);
  
    /*
    setTimeout(() => {
      howl.stop(soundId);
    }, stopTime);
    */
  }
  
}
