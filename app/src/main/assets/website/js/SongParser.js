//erstellt ein songobject mit n nummern, allchords
//setzt die chords im song object dann auf anzeigeversion - nach b
//zerlegt die akkorde mit dem chord parser und speichert diese auch weg


class SongParser {
  constructor(songData, transpose = 0) {
    console.error("songData", songData);
    this.songData = songData;
    this.timeSignature = null;
    this.allChords = [];
    this.allParsed = [];
    this.chordParser = new ChordParser();
    //this.transposeAllChords(2);
    this.parse();
  }

  getTrackObject() {
    return this.songData;
  }

  getAllChords() {
    return this.allChords;
  }

  getAllChordsParsed() {
    return this.allParsed;
  }

  getTonality() {
    return this.songData.tonality;
  }

  getTimeSignature() {
    return this.timeSignature;
  }

  parse() {
    let barCounter = 1; // Der Zähler für die Taktnummern
    let repeatNum = 0; // Der Wiederholungszähler (für repeatVersionStart)
    let bars = this.flattenBars(); // Alle Takte in einem Array    
    let lastRepeatStart = -1;
    //setze timesignature aus dem ersten takt
    this.timeSignature = bars[0]['timeSignature'];
    console.error(this.timeSignature);

    for (var i = 0; i < bars.length; i++) {

      //lege n stack an
      if (!bars[i].hasOwnProperty("n")) {
        bars[i]['n'] = [];
      }
      bars[i]['n'].push(barCounter);
      this.allChords.push(this.getBarChords(bars[i], false));  //alle akkorde zusammenfassen
      this.allParsed.push(this.getBarChords(bars[i], true));

      let currEvents = this.getBarEvents(bars[i]);
      let nextEvents = {};
      if (i < bars.length - 1) {
        nextEvents = this.getBarEvents(bars[i + 1]);
      }

      //wenn repeatStart gefunden wurde, speichere die position ab
      if (currEvents.hasOwnProperty("repeatStart") && currEvents.repeatStart) {
        this.L_addN("lastRepeatStart gesetzt auf: " + i);
        lastRepeatStart = i;
      }
      //wenn repeatEnd gefunden wurde, speichere die position ab
      if (currEvents.hasOwnProperty("repeatEnd") && currEvents.repeatEnd) {
        // repeatEnd gefunden
        let hasRepeatVersion = bars.some(bar =>
          this.getBarEvents(bar).hasOwnProperty("repeatVersionStart")
        );

        if (!hasRepeatVersion) {
          if (repeatNum === 0) {
            i = lastRepeatStart - 1;
            repeatNum++;
            this.L_addN(`Kein repeatVersionStart gefunden. Wiederhole Block ab i=${i + 1}`);
          } else {
            this.L_addN("Zweiter Durchlauf ohne repeatVersionStart – spiele normal weiter");
          }
        } else {
          i = lastRepeatStart - 1;
          repeatNum++;
          this.L_addN("repeatEnd gefunden setze i: " + i + " lastRepeatStart = " + lastRepeatStart + ", erhöhe repeatNum auf:" + repeatNum);
        }
      }


      //überspringen der repeatVersionStart, immer im takt vor der repeatVersionStart:1 wird geprüft und
      //entweder spielen lassen oder die nächsten von dort aus anspringen
      //immer vor der ersten repeatVersionStart~1 wird geprüftob und wo die nächste anzuspielen ist
      //die prüfung braucht erst zu beginnen wenn min die erste einmal gespielt wurde

      //hole die pos der ersten repeatVersionStart~1
      let _FirstRepeatVersionStart = this.getRepeatVersionStart(bars, 1);
      if (repeatNum > 0 && i == _FirstRepeatVersionStart) {
        let _RepeatVersionStart = this.getRepeatVersionStart(bars, repeatNum + 1);
        i = _RepeatVersionStart;
      }

      barCounter++;

      //secure stop by while issues
      if (barCounter > 200) {
        this.L_addN("while loop issue!!!");
        i = 10000;
      }
    }

    console.error("asd", this.songData);

    this.setAllChordsToDisplayStyle();

  }

  getRepeatVersionStart(bars, nextRepeatNum) {
    for (var i = 0; i < bars.length; i++) {
      let currEvents = this.getBarEvents(bars[i]);
      if (currEvents.hasOwnProperty("repeatVersionStart") && currEvents.repeatVersionStart == nextRepeatNum) {
        return i - 1;
      }
    }
  }

  getBarEvents(bar) {
    let obj = {};
    for (const event of bar.events) {
      if (event.repeatStart) {
        obj["repeatStart"] = event.repeatStart;
      }
      if (event.repeatEnd) {
        obj["repeatEnd"] = event.repeatEnd;
      }
      if (event.repeatVersionStart) {
        obj["repeatVersionStart"] = event.repeatVersionStart;
      }
    }
    return obj;
  }

  // Hilfsmethode zum Erstellen eines Arrays mit allen Bars
  flattenBars() {
    let bars = [];
    for (const section of this.songData.data) {
      bars = bars.concat(section.bars);
    }
    return bars;
  }

  transposeAllChords(halftones) {
    let bars = this.flattenBars();
    for (var i = 0; i < bars.length; i++) {
      for (const event of bars[i].events) {
        if (event.chord) {
          event.chord[0] = this.chordParser.transposeChord(event.chord[0], halftones);
        }
      }
    }
  }

  setAllChordsToDisplayStyle() {
    let bars = this.flattenBars();
    for (var i = 0; i < bars.length; i++) {
      for (const event of bars[i].events) {
        if (event.chord) {
          let anChord = this.chordParser.analyseChord(event.chord[0]);
          event.chord[0] = anChord.full;
        }
      }
    }
  }

  getBarChords(bar, parsed = false) {
    let chords = ['', '', '', '']; // 4 Slots für 1.0 bis 4.0
    for (const event of bar.events) {
      if (event.chord) {
        const [chord, posStr] = event.chord;
        const pos = parseFloat(posStr);
        if ([0.0, 1.0, 2.0, 3.0].includes(pos)) {
          const index = pos;
          let anChord = this.chordParser.analyseChord(chord);
          if (!parsed) {
            chords[index] = chord;
          } else {
            chords[index] = anChord;
          }
        }
      }
    }
    return chords;
  }

  L_addN(msg) {
    //console.error(msg);
  }

}
