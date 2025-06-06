// Hauptklasse für die Basslogik
class BassLogic {

	timeConf;

	constructor() {
		this.chordParser = new ChordParser();
		this.lowE1Shift = 28;//mit diesem wert werden die noten in die richtige oktave geschoben
		this.lowestNote = 30;//tiefes F# wird nicht unterschritten bei der grundtonsuche und allen calcs
		this.basslines = [];
		this._8;
		this.laidback = 0;
	}

	setTimeSignatureConf(timeSignature) {
		const conf = {};
		conf['4/4'] = { 'sig': '4/4', 'anz4tel': 4, '16tel': 16, '12tel': 12 };
		conf['3/4'] = { 'sig': '3/4', 'anz4tel': 3, '16tel': 12, '12tel': 9 };
		this.timeConf = conf[timeSignature];
	}

	// Methode zur Berechnung der Basslinie für jeden Takt mit pbm
	calc_bass(song_chords, pbm, timeSignature, intensity) {

		console.error(song_chords);
		//erzeuge hier ein array mit allen takten und auf den vierteln alle akkorde, 
		// absolut mit den akkordtönen... 1,3,5,7 root, third, fifth, seven 
		//dann wird als letztes di verbindung der akkorde und das anspielen berechnet

		let notes = this.calcAllNotes(song_chords);
		console.error(song_chords);

		intensity = 2;

		this.setTimeSignatureConf(timeSignature);
		this.basslines = [];
		const tickLength = 60000 / pbm / this.timeConf['anz4tel']; // Berechnung der Taktlänge pro Viertelnote in ms		
		this.laidback = this.mtRand(tickLength / 10, tickLength / 5);
		this._8 = tickLength * 2;

		song_chords.forEach((chordsTakt, index) => {
			let chordPositions = this.chordParser.getChordPositions(chordsTakt);
			const nextChordsTakt = song_chords[index + 1] || song_chords[0];
			const chords_takt = this.analyseChordTakt(chordsTakt);
			const chords_next_takt = this.analyseChordTakt(nextChordsTakt);
			const notesTakt = this.calcChordNotesOneTakt(chordPositions, chords_takt, chords_next_takt, tickLength, intensity);
			this.basslines.push({
				t: index * tickLength * this.timeConf['16tel'],
				notes: notesTakt
			});

		});
		return this.basslines;
	}

	calcChordNotesOneTakt(chordPositions, chords, chordsNext, tickLength, intensity) {

		var stack = new Array(16).fill(null); // Leeres Array für die 16 Noten des Taktes
		const viertelLength = tickLength * 4;
		const halbeLength = tickLength * 8;
		const gTonNext = chordsNext[0]['gTon'];

		//berechne einmal für alle chords die Notes, wenn vorhanden		
		//die chord notes werden auf den vierteln 1,2,3,4 wenn dort chords gespielt werden berechnet
		const _chordNotes = {};
		chords.forEach((data, index) => {
			if (data !== "") {
				_chordNotes[(index + 1).toString()] = this.getChordNotes(data.extension);
			} else {
				_chordNotes[(index + 1).toString()] = null;
			}
		});


		//ein akkord im takt
		if (chordPositions == '1') {

			const chordNotes = this.getChordNotes(chords[0]['extension']);
			const chordNotesNext = this.getChordNotes(chordsNext[0]['extension']);
			const gTon = chords[0]['gTon'];

			//berechung der zu spielenden noten
			var res = this.berechneWalkingBass(gTon, new Array(_chordNotes['1'][1], _chordNotes['1'][2], _chordNotes['1'][3]), gTonNext);

			if (this.timeConf['sig'] == '4/4') {
				if (intensity == 1) {
					stack = this.setNotesOneTakt_halbe([gTon, res[2]], [1, 5], stack, gTonNext);
				}
				if (intensity == 2) {
					stack = this.setNotesOneTakt_viertel([gTon, res[0], res[1], res[2]], [1, 3, 5, 7], stack, gTonNext);

				}
				if (intensity == 3) {
					stack = this.setNotesOneTakt_full([gTon, res[0], res[1], res[2]], [1, 3, 5, 7], stack, gTonNext);
				}
			}
			if (this.timeConf['sig'] == '3/4') {
				stack.push({ ms: 0, length: viertelLength, note: gTon });
				stack.push({ ms: tickLength * 4, length: viertelLength, note: res[1] });
				stack.push({ ms: tickLength * 8, length: viertelLength, note: res[2] });
			}

		}

		//zwei akkorde im takt
		if (chordPositions == '1,3') {

			//berechne noten
			const chordNotes_1 = this.getChordNotes(chords[0]['extension']);
			const chordNotes_2 = this.getChordNotes(chords[2]['extension']);
			const gTon_1 = chords[0]['gTon'];
			const gTon_3 = chords[2]['gTon'];

			var res_1 = this.berechneWalkingBass2Chords(gTon_1, _chordNotes['1'][2], gTon_3);
			var res_2 = this.berechneWalkingBass2Chords(gTon_3, _chordNotes['3'][2], gTonNext);

			if (this.timeConf['sig'] == '4/4') {
				if (intensity == 1) {
					stack = this.setNotesOneTakt_halbe([gTon_1, gTon_3], [1, 5], stack, gTonNext);
				}
				if (intensity == 2) {
					stack = this.setNotesOneTakt_viertel([gTon_1, res_1, gTon_3, res_2], [1, 3, 5, 7], stack, gTonNext);

				}
				if (intensity == 3) {
					stack = this.setNotesOneTakt_full([gTon_1, res_1, gTon_3, res_2], [1, 3, 5, 7], stack, gTonNext);
				}
			}
		}

		//vier chords in einem takt
		if (chordPositions == '1,2,3,4') {
			//nur grundtöne
			if (this.timeConf['sig'] == '4/4') {
				stack = this.setNotesOneTakt_viertel([chords[0]['gTon'], chords[1]['gTon'], chords[2]['gTon'], chords[3]['gTon']], [1, 3, 5, 7], stack, gTonNext);
			}
		}


		//drei chords im takt
		if (chordPositions == '1,2,4') {
			//gruntöne und chromatic

		}
		if (chordPositions == '1,3,4') {
			//gruntöne und chromatic
		}

		//vier chords im takt

		stack = this.fixLowNotes(stack);
		return stack.filter(note => note !== null);
	}

	addNotesToStack(notes, times, stack) {
		//berechne notenlängen
		notes.forEach((note, index) => {
			var start = (times[index] - 1) * this._8;
			start += this.laidback;
			if (index < notes.length - 1) {
				var length = times[index + 1] - times[index];
			} else {
				var length = 9 - times[index];
			}
			stack.push({ ms: start, length: length * this._8, note: note });
		});
		return stack;
	}

	setNotesOneTakt_full(notes, times, stack, gTonNext) {

		//schiebe ab und zu zwischen die 2und und die 4und eine chromatische Note
		if (this.chance(15)) {//2und
			var halfStep = (this.chance(80) ? -1 : 1);
			notes = this.notesPush(notes, notes[2] + halfStep);
			//notes.push(notes[2]+halfStep);
			times.push(4);
		}

		if (this.chance(30)) {//4und
			var halfStep = (this.chance(80) ? -1 : 1);
			notes = this.notesPush(notes, gTonNext + halfStep);
			//notes.push(gTonNext+halfStep);
			times.push(8);
		}


		// Kombiniere die Arrays als Paare
		let combined = times.map((value, index) => [value, notes[index]]);

		// Sortiere nach den Werten des ersten Arrays
		combined.sort((a, b) => a[0] - b[0]);

		// Teile die Paare wieder in zwei Arrays auf
		times = combined.map(pair => pair[0]);
		notes = combined.map(pair => pair[1]);

		return this.addNotesToStack(notes, times, stack);

	}

	notesPush(arr, note) {
		if (note < 0) {
			note += 12;
		}
		arr.push(note);
		return arr;
	}

	setNotesOneTakt_viertel(notes, times, stack, gTonNext) {
		if (this.chance(10)) {//4und
			var halfStep = (this.chance(80) ? -1 : 1);
			notes = this.notesPush(notes, gTonNext + halfStep);
			//notes.push(gTonNext+halfStep);
			times.push(8);
		}

		return this.addNotesToStack(notes, times, stack);
	}

	setNotesOneTakt_halbe(notes, times, stack, gTonNext) {
		if (this.chance(10)) {//4und
			var halfStep = (this.chance(80) ? -1 : 1);
			notes = this.notesPush(notes, gTonNext + halfStep);
			//notes.push(gTonNext+halfStep);
			times.push(8);
		}

		return this.addNotesToStack(notes, times, stack);
	}

	berechneWalkingBass2Chords(grundton, extension, zielton) {
		// Berechne die drei Varianten der Quinte
		const absolut_1 = grundton + extension;     // Grundton + Quinte
		const absolut_2 = grundton + extension + 12; // Grundton + Quinte + eine Oktave
		const absolut_3 = grundton + extension - 12; // Grundton + Quinte - eine Oktave

		// Berechne die Abstände zu jedem Ton relativ zum Zielton
		const abstaende_1 = Math.abs(absolut_1 - zielton);
		const abstaende_2 = Math.abs(absolut_2 - zielton);
		const abstaende_3 = Math.abs(absolut_3 - zielton);

		// Alle Noten und Abstände in einer strukturierten Form speichern
		const kandidaten = [
			{ note: absolut_1, abstand: abstaende_1, source: "absolut_1" },
			{ note: absolut_2, abstand: abstaende_2, source: "absolut_2" },
			{ note: absolut_3, abstand: abstaende_3, source: "absolut_3" }
		];

		// Sortiere Kandidaten nach Abstand aufsteigend
		kandidaten.sort((a, b) => a.abstand - b.abstand);

		// Der beste Kandidat ist der mit dem geringsten Abstand zum Zielton
		let gewaehlteNote = kandidaten[0].note;

		if (gewaehlteNote == zielton) {
			gewaehlteNote = zielton - 1;
		}

		// Wenn der gewählte Ton kleiner als 0 ist, auf eine gültige Tonhöhe korrigieren
		if (gewaehlteNote < 0) {
			gewaehlteNote += 12;
		}

		return gewaehlteNote;
	}

	berechneWalkingBass(grundton, extensions, zielton) {
		// Berechne absolute Tonhöhen
		const absolut_1 = [];
		const absolut_2 = [];
		const absolut_3 = [];

		for (const extension of extensions) {
			absolut_1.push(grundton + extension);
			absolut_2.push(grundton + extension + 12);
			absolut_3.push(grundton + extension - 12);
		}

		// Berechne Abstände zu jedem Ton relativ zum Zielton
		const abstaende_1 = absolut_1.map(note => Math.abs(note - zielton));
		const abstaende_2 = absolut_2.map(note => Math.abs(note - zielton));
		const abstaende_3 = absolut_3.map(note => Math.abs(note - zielton));

		// Alle Noten und Abstände in einer strukturierten Form speichern
		const kandidaten = [];

		absolut_1.forEach((note, index) => {
			kandidaten.push({ note, abstand: abstaende_1[index], source: "absolut_1", index });
		});

		absolut_2.forEach((note, index) => {
			kandidaten.push({ note, abstand: abstaende_2[index], source: "absolut_2", index });
		});

		absolut_3.forEach((note, index) => {
			kandidaten.push({ note, abstand: abstaende_3[index], source: "absolut_3", index });
		});

		// Sortiere Kandidaten nach Abstand aufsteigend
		kandidaten.sort((a, b) => a.abstand - b.abstand);

		// Finde die drei besten Noten, ohne doppelte Indizes
		let gewaehlteNoten = [];
		const verwendeteIndizes = new Set();

		for (const kandidat of kandidaten) {
			if (gewaehlteNoten.length >= 3) break;

			if (!verwendeteIndizes.has(kandidat.index)) {
				gewaehlteNoten.push(kandidat.note);
				verwendeteIndizes.add(kandidat.index);
			}
		}

		gewaehlteNoten.reverse();


		//ab und zu mal chromatisch anspielen von unten
		if (this.chance(5) && (zielton - 1) > 0) {
			gewaehlteNoten[2] = zielton - 1;
		}
		if (this.chance(8)) {
			gewaehlteNoten = [zielton - 3, zielton - 2, zielton - 1];
		}

		//wenn der letzte ton gleich wie der zielton ist, spiele von einem halbton drunter an
		if (gewaehlteNoten[2] == zielton) {
			gewaehlteNoten[2] = zielton - 1;
		}

		for (var i = 0; i < gewaehlteNoten.length; i++) {
			if (gewaehlteNoten[i] < 0) {
				gewaehlteNoten[i] += 12;
			}
		}

		return gewaehlteNoten;
	}

	analyseChordTakt(chordTakt) {
		const res = [];
		chordTakt.forEach(chord => {
			if (chord != '') {
				res.push(this.analyseChord(chord));
			} else {
				res.push("");
			}
		});
		return res;
	}

	analyseChord(chord) {
		let res = this.chordParser.analyseChord(chord);
		const notes_sharp = ["E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#"];
		const notes_flat = ["E", "F", "Gb", "G", "Ab", "A", "Bb", "B", "C", "Db", "D", "Eb"];
		let index = notes_sharp.findIndex(note => note === res.gTon);
		if (index === -1) {
			index = notes_flat.findIndex(note => note === res.gTon);
		}
		index += this.lowE1Shift;
		return { 'gTon': index, 'extension': res.extension };
	}

	getChordNotes(extension) {
		//extension = extension.replace(/\(.*?\)/g, '');
		extension = extension.split('/')[0];

		const transform = {
			'': 'maj7',//default
			'Δ7': 'maj7',
			'm': 'm7',
			'13': '6',
			'9': '7',
			'69': '6',
			'7#5': '7',
			'maj7#5': 'maj7',
			'maj7#11': 'maj7',
			'Δ7#11': 'maj7',
			'7#11': '7',
			'7#9': '7',
			'7b13': '7',
			'7b9': '7',
			'07': 'dim',
			'0': 'dim',
			'o7': 'dim',
			'o': 'dim',
			'ø7': 'm7b5',
			'7alt': '7',
			'9sus': '7sus'
		};

		const def = {
			'7sus': [0, 5, 7, 10],
			'm6': [0, 3, 7, 9],
			'm7': [0, 3, 7, 10],
			'm7b5': [0, 3, 6, 10],
			'dim': [0, 3, 6, 9],
			'7': [0, 4, 7, 10],
			'6': [0, 4, 7, 9],
			'maj7': [0, 4, 7, 11],
		};

		let notes = [];

		if (transform.hasOwnProperty(extension)) {
			extension = transform[extension];
		}

		if (def.hasOwnProperty(extension)) {
			notes = def[extension];
		} else {
			console.error('Unbekannte Akkordextension:', extension);
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

	fixLowNotes(stack) {
		const newStack = [];
		for (const element of stack) {
			if (element && typeof element === 'object' && element.hasOwnProperty('note')) {
				if (element.note < this.lowestNote) {
					const newElement = { ...element, note: element.note + 12 };
					newStack.push(newElement);
				} else {
					newStack.push(element);
				}
			} else {
				newStack.push(element);
			}
		}
		return newStack;
	}

	calcAllNotes(song_chords) {
		const allNotes = [];
		for (const taktChords of song_chords) {
			const taktNoten = [];
			for (const chord of taktChords) {
				if (chord !== "") {
					const analysedChord = this.analyseChord(chord);
					const chordNotesIntervals = this.getChordNotes(analysedChord.extension);
					const absoluteChordNotes = chordNotesIntervals.map(interval => analysedChord.gTon + interval);
					taktNoten.push(absoluteChordNotes);
				} else {
					taktNoten.push("");
				}
			}
			allNotes.push(taktNoten);
		}
		console.error("==>> Alle berechneten Noten:", allNotes);
		return allNotes;
	}

}
