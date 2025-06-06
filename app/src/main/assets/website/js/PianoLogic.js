// Hauptklasse für die Basslogik
class PianoLogic {
	
	timeConf;
	
    constructor() {
        this.basslines = [];		
		this._8;
		this.laidback = 0;
		this.totalShift = 12*4;
    }
	
	setTimeSignatureConf(timeSignature){
		const conf = {};
		conf['4/4'] = {'sig':'4/4','anz4tel':4,'16tel':16,'12tel':12};		
		conf['3/4'] = {'sig':'3/4','anz4tel':3,'16tel':12,'12tel':9};		
		this.timeConf = conf[timeSignature];
	}

    // Methode zur Berechnung der Basslinie für jeden Takt mit pbm
    calc_notes(song_chords, pbm, timeSignature, intensity) {		
		this.setTimeSignatureConf(timeSignature);		
        this.basslines = [];
        const tickLength = 60000 / pbm / this.timeConf['anz4tel']; // Berechnung der Taktlänge pro Viertelnote in ms		
		this.laidback = this.mtRand(tickLength/10,tickLength/5);		
		this._8 = tickLength * 2;

        song_chords.forEach((chordsTakt, index) => {
            const nextChordsTakt = song_chords[index + 1] || song_chords[0];
            const chords_takt = this.analyseChordTakt(chordsTakt);
            const chords_next_takt = this.analyseChordTakt(nextChordsTakt);
            const notesTakt = this.calcChordNotesOneTakt(chords_takt, chords_next_takt, tickLength, intensity);			
            this.basslines.push({
                t: index * tickLength * this.timeConf['16tel'],				
                notes: notesTakt
            });
        });
        return this.basslines;
    }

    calcChordNotesOneTakt(chords, chordsNext, tickLength, intensity) {
        var stack = new Array(16).fill(null); // Leeres Array für die 16 Noten des Taktes
		const achtel = tickLength * 2;
		const viertelLength = tickLength * 4;
		const halbeLength = tickLength * 8;
		const gTonNext = chordsNext[0]['gTon'];
		const pianoVoicings = new PianoVoicings();

		//ein akkord im takt
        if (chords.length == 1) {

            const chordNotes = this.getChordNotes(chords[0]['extension']);
            const chordNotesNext = this.getChordNotes(chordsNext[0]['extension']);
            const gTon = chords[0]['gTon'];
			const chord = pianoVoicings.getVoicing(gTon,chords[0]['extension']);
			
			if(this.timeConf['sig']=='4/4'){								
				
				if(intensity == 1){
					//stack = this.pushIntoGroove("whole",chord,stack,tickLength);
					stack = this.pushIntoGroove("charleston",chord,stack,tickLength);
				}
				if(intensity == 2){
					stack = this.pushIntoGroove("charleston",chord,stack,tickLength);
					
				}
				if(intensity == 3){
					stack = this.pushIntoGroove("charleston",chord,stack,tickLength);
				}
				
			}
			if(this.timeConf['sig']=='3/4'){				
                //stack.push({ ms: 0, length: viertelLength, note: gTon });                
                //stack.push({ ms: tickLength * 4, length: viertelLength, note: res[1] });
                //stack.push({ ms: tickLength * 8, length: viertelLength, note: res[2] });							            
			}
			
			
        }
		
		//zwei akkorde im takt
        if (chords.length == 2) {

			//berechne noten
            const chordNotes_1 = this.getChordNotes(chords[0]['extension']);
            const chordNotes_2 = this.getChordNotes(chords[1]['extension']);
            const gTon_1 = chords[0]['gTon'];
            const gTon_2 = chords[1]['gTon'];

			const chord_1 = pianoVoicings.getVoicing(gTon_1,chords[0]['extension']);
			const chord_2 = pianoVoicings.getVoicing(gTon_2,chords[1]['extension']);

			//var res_1 = this.berechneWalkingBass2Chords(gTon_1, chordNotes_1[2], gTon_2);
			//var res_2 = this.berechneWalkingBass2Chords(gTon_2, chordNotes_2[2], gTonNext);
			
			if(this.timeConf['sig']=='4/4'){				
			
				//setze auf die 1 den ersten akkord
				chord_1.forEach((note, index) => {
					//console.error(gTon + note + 48);
					stack.push({ ms: 0 + this.mtRand(0,10), length: viertelLength * 2, note: (note) });					
				});
				
				//setze auf die 2 den ersten akkord
				chord_2.forEach((note, index) => {
					//console.error(gTon + note + 48);
					stack.push({ ms: viertelLength * 2 + this.mtRand(0,10), length: viertelLength * 2, note: (note) });					
				});
				
			
				/*
				if(intensity == 1){
					stack = this.setNotesOneTakt_halbe([gTon_1,gTon_2],[1,5],stack,gTonNext);
				}
				if(intensity == 2){
					stack = this.setNotesOneTakt_viertel([gTon_1,res_1,gTon_2,res_2],[1,3,5,7],stack,gTonNext);	
					
				}
				if(intensity == 3){
					stack = this.setNotesOneTakt_full([gTon_1,res_1,gTon_2,res_2],[1,3,5,7],stack,gTonNext);
				}
				*/
				
				
			}
			
        }

        return stack.filter(note => note !== null);
    }	

	pushIntoGroove(groove,chord,stack,tickLength){

		const achtel = tickLength * 2;
		const viertelLength = tickLength * 4;
		const halbeLength = tickLength * 8;

		if(groove == 'whole'){
			chord.forEach((note, index) => {
			stack.push({ ms: 0 + this.mtRand(0,10), length: viertelLength * 4, note: note });
			});
		}

		if(groove == 'charleston'){
			chord.forEach((note, index) => {
				//Charlestion 	1 u 2 u 3 u 4 u
				//				x - - x - - - - 
				stack.push({ ms: 0 + this.mtRand(0,10), length: achtel * 4, note: note });
				if(this.chance(90)){
					stack.push({ ms: achtel * 5 + this.mtRand(0,10), length: achtel * 5, note: note });
				}
			});
		}

		return stack;

	}
	
	addNotesToStack(notes,times,stack){
		//berechne notenlängen
		notes.forEach((note, index) => {
			var start = (times[index]-1) * this._8;
			start+=this.laidback;
			if(index < notes.length - 1){								
				var length = times[index+1] - times[index];
			}else{
				var length = 9 - times[index];
			}									
			stack.push({ ms: start, length: length * this._8, note: note});				
		});
		return stack;
	}	

    analyseChordTakt(chordTakt) {        
        const res = [];
        chordTakt.forEach(chord => {
            res.push(this.analyseChord(chord));
        });
        return res;
    }

    analyseChord(chord) {
        let gTon = ""; // Variable zur Speicherung des Tons
        const fullTones = ["C", "D", "E", "F", "G", "A", "B"];
        const halfTones = ["C#", "Db", "D#", "Eb", "F#", "Gb", "G#", "Ab", "A#", "Bb"];

        const firstTwoChars = chord.slice(0, 2);
        if (halfTones.some(tone => tone === firstTwoChars)) {
            gTon = firstTwoChars.charAt(0) + firstTwoChars.charAt(1); // Originalformatierung beibehalten
        } else {
            const firstChar = chord.charAt(0);
            if (fullTones.some(tone => tone === firstChar)) {
                gTon = firstChar; // Großbuchstaben für Ganztöne
            }
        }

        const notes_sharp = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        const notes_flat = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

        let index = notes_sharp.findIndex(note => note === gTon);
        if (index === -1) {
            index = notes_flat.findIndex(note => note === gTon);
        }

        const extension = chord.replace(gTon, "");

		//korrektion to shift into tune
        index -= 4;
        if (index < 0) {
            index += 12;
        }
		//pushe tiefes e und f nach oben, tiefste note des basses ist das f# sonst gammelt das unterrum zu starkt bro
		if(index < 2){
			index+=12;
		}
		index+=this.totalShift;

        return { 'gTon': index, 'extension': extension };
    }

	adjustNumbersToRange(arr, min = 50, max = 58+16) {
		let n = arr.length;
		let step = (max - min) / (n - 1); // Gleichmäßiger Abstand berechnen

		let targetValues = arr.map((_, i) => Math.round(min + i * step)); // Zielwerte berechnen

		let adjustedNumbers = arr.map((num, i) => {
			let target = targetValues[i];

			// Suche die nächstgelegene Zahl im 12er-Schritt-Raster
			let closest = Math.round((target - num) / 12) * 12 + num;

			// Begrenzen auf min/max
			if (closest < min) closest = min;
			if (closest > max) closest = max;

			return closest;
		});

		return adjustedNumbers;
	}

    getChordNotes(extension) {
		extension = extension.trim();
        extension = extension.replace(/\(.*?\)/g, '');
        extension = extension.split('/')[0];

        const transform = {
            '': 'maj7',
            'm': 'm7',
			'13': '6',
			'9': '7',
            '69': '6',            
			'7#5': '7',			
			'maj7#5':'maj7',
			'maj7#11':'maj7',			
            '7#11': '7',			
            '7#9': '7',
            '7b13': '7',
            '7b9': '7',
            '07': 'dim',
            '0': 'dim',	
			'7alt':'7'
        };

        const def = {
			'7sus': [0, 5, 7, 10],
            'm6': [3, 7, 9 , 14],
            'm7': [3, 7, 10, 14],
            'm7b5': [0, 3, 6, 10],
            'dim': [0, 3, 6, 9],
            '7': [4, 7, 10 , 14],
            '6': [ 4, 7, 9, 14],
            'maj7': [4, 7, 11, 14],
        };

        let notes = [];

        if (transform.hasOwnProperty(extension)) {
            extension = transform[extension];
        }

        if (def.hasOwnProperty(extension)) {
            notes = def[extension];
        } else {			
            console.error('Unbekannte Akkordextension Piano:', extension);
        }
        return notes;
    }

    chance(percent) {
        const randomValue = Math.random() * 100;
        return randomValue <= percent;
    }
	
	mtRand(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}
}
