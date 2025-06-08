class BassPlayer {
  constructor() {
    this.totalShift = -28; // Tiefe E-Seite ist MIDI 28
  }

  mtRand(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  playNote(noteNr, lengthMs = 700) {
    noteNr += this.totalShift;

    if (typeof SoundInterface !== 'undefined' && SoundInterface.playBass) {
      const velocity = 100; // Standardlautstärke
      SoundInterface.playBass(noteNr, velocity, lengthMs);
    } else {
      console.warn('SoundInterface.playBass ist nicht verfügbar');
    }
  }
}
