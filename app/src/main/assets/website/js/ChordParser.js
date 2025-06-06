class ChordParser {

    parseChordsForDisplay(chordList) {
        //laufe durch alle chords und analysiere
        let arr = [];
        chordList.forEach((chords) => {
            let stack = [];
            chords.forEach((chord) => {
                if (chord != '') {
                    let res = this.analyseChord(chord);
                    stack.push(res.full);
                } else {
                    stack.push('');
                }
            });
            arr.push(stack);
        });
        return arr;
    }

    analyseChord(chord) {
        let root = "";       // Grundton-Rohform (z.B. A-, C#)
        let gTon = "";       // Formatierter Grundton (z.B. Ab, F#)
        let extension = "";  // Restlicher Akkord (z.B. m7, Δ7)

        const fullTones = ["C", "D", "E", "F", "G", "A", "B"];

        // Prüfe auf Halbtonzeichen an zweiter Stelle
        if (chord.length >= 2 && (chord[1] === "#" || chord[1] === "-")) {
            root = chord.slice(0, 2);      // Z.B. "A-", "C#"
            extension = chord.slice(2);
        } else {
            root = chord.slice(0, 1);      // Z.B. "G"
            extension = chord.slice(1);
        }

        // Formatierung: "-" → "b" für Bb, Ab etc.
        if (root.includes("-")) {
            gTon = root.replace("-", "b");
        } else {
            gTon = root;
        }

        // Validierung (optional)
        if (!fullTones.some(t => gTon[0] === t)) {
            console.warn("Unbekannter Grundton:", chord, gTon);
        }

        return {
            gTon: gTon,
            extension: extension,
            full: gTon + extension
        };
    }

    getChordPositions(barChords) {
        const positions = [];
        for (let i = 0; i < barChords.length; i++) {
            if (barChords[i] !== "") {
                positions.push(i + 1);
            }
        }
        return positions.join(',');
    }

    transposeChord(chord,halftones){
        let res = this.analyseChord(chord);

        const notes_sharp = ["E", "F", "F#", "G", "G#", "A", "A#", "B","C", "C#", "D", "D#"];
        const notes_flat = ["E", "F", "G-", "G", "A-", "A", "B-", "B","C", "D-", "D", "E-"];
        let index = notes_sharp.findIndex(note => note === res.gTon);
        if (index === -1) {
            index = notes_flat.findIndex(note => note === res.gTon);
        }
        index+=halftones;
        let nGton = notes_flat[index%12];
        return nGton+res.extension;
    }

}
