var audioContext = new (window.AudioContext || window.webkitAudioContext)();

const songs = new Songs('jaminiSongs.json');
const gui = new GUI(); // GUI-Instanz zum Anzeigen der Akkorde
const bassLogic = new BassLogic();
const pianoLogic = new PianoLogic();
const bassPlayer = new BassPlayer(audioContext);
//const pianoPlayer = new PianoPlayer(audioContext);
const drumLogic = new DrumLogic();
const drumPlayer = new DrumPlayer();
const chordParser = new ChordParser();

var chordList;
var songParserObj = null;

songs.loadSongs().then(() => {
	// songs.createSongSelectBox('songSelectContainer'); // Nicht mehr benötigt
	songs.createSongCharOverview(); // Die ursprüngliche Übersicht beim Start erstellen
	// Der Such-Listener wird jetzt in Songs.js in loadSongs() eingerichtet
	/*
	const selectBox = document.getElementById('songSelectContainer').querySelector('select');
	selectBox.addEventListener('change', (event) => {
		const selectedIndex = event.target.value;
		const selectedSong = songs.getSongByIndex(selectedIndex);
		if (selectedSong) {
			const parser = new SongParser(selectedSong);
			chordList = parser.extractChords();
			//chordList = ['Cm7','Dm7','Gm7'];
			timeSignature = parser.getTimeSignature();
			gui.createBeatSelectBox('beatSelectContainer', timeSignature);
			gui.displayChords(chordList);
		} else {
			console.error('Ausgewählter Song nicht gefunden.');
		}
	});
	*/
});

var takt_nr = 0;
var bpm = 90;
var timeSignature = "4/4";
var taktTimeout;
var currentLoop = 0;
var totalLoops = 1;

function chooseTrackActions(selectedSong) {
	// Beim Auswählen eines Songs die Suchergebnisse und die ursprüngliche Übersicht ausblenden
	document.getElementById("songChooser").innerHTML = ""; // Buchstaben-Übersicht leeren
	document.getElementById("songChooser").style.display = 'none'; // Buchstaben-Übersicht verstecken
	document.getElementById("songChooserSongs").innerHTML = ""; // Song-Liste leeren
	document.getElementById("songChooserSongs").style.display = 'none'; // Song-Liste verstecken
	document.getElementById("songSearchResults").innerHTML = ""; // Suchergebnisse leeren
	document.getElementById("songSearchResults").style.display = 'none'; // Suchergebnisse verstecken

	document.getElementById("trackName").innerHTML = selectedSong.Title;

	songParserObj = new SongParser(selectedSong);
	chordList = songParserObj.getAllChords();
	//chordList = chordParser.parseChordsForDisplay(chordList);
	//console.error(chordList);
	/*
	//laufe durch alle chords und analysiere
	chordList.forEach((chords) => {
		chords.forEach((chord) => {
			if (chord != '') {
				let res = ChordParser.analyseChord(chord);
				console.error(res);
			}
		});
	});
	*/


	//chordList = ['Cm7','Dm7','Gm7'];
	timeSignature = songParserObj.getTimeSignature();
	gui.createBeatSelectBox('beatSelectContainer', timeSignature);
	gui.displayChords(songParserObj.getTrackObject());
}

async function loadBeatFromFile(filePath) {
	const response = await fetch(filePath);
	const data = await response.json();
	await drumPlayer.loadSounds();
	return data;
}

function playTakt(pianolines, bassline, drumline) {
	const mutePiano = document.getElementById("mutePiano").checked;
	const muteBass = document.getElementById("muteBass").checked;
	const muteDrums = document.getElementById("muteDrums").checked;

	/*
	if (!mutePiano) { 	
		pianolines.notes.forEach((note) => {
				setTimeout(() => {
					pianoPlayer.playNote(note.note, note.length); 	 	 	 	 	 	 	
					//pianoPlayer.playNote(28, note.length); 	 	 	 	 	 	 	 	
				}, note.ms);
		});
	}
	*/

	if (!muteBass) {
		bassline.notes.forEach((note) => {
			setTimeout(() => {
				bassPlayer.playNote(note.note, note.length);
				//bassPlayer.playNote(28, note.length); 	//low e1, bass guitar 	 	 	
			}, note.ms);
		});
	}

	if (!muteDrums) {
		Object.keys(drumline).forEach(instrument => {
			if (instrument !== "t") {
				drumline[instrument].forEach(event => {
					setTimeout(() => {
						drumPlayer.playSound(instrument, event.velocity / 100);
					}, event.ms);
				});
			}
		});
	}

	gui.setBorderHighlight(takt_nr + 1);
}

async function play() {
	if (!chordList || chordList.length === 0) {
		console.error('Keine Akkorde geladen. Bitte wähle einen Song aus.');
		return;
	}

	totalLoops = parseInt(document.getElementById("loopSelect").value, 10);
	currentLoop = 0;

	const patternJson = await loadSelectedBeat();

	async function playNextLoop() {
		if (currentLoop >= totalLoops) {
			console.log("Wiedergabe beendet.");
			stop();
			return;
		}

		let intensity = 1;
		if (currentLoop === 0) {
			intensity = 1;
		}
		if (currentLoop === 1) {
			intensity = 2;
		}
		if (currentLoop > 1) {
			intensity = 3;
		}
		if (currentLoop === totalLoops - 1) {
			intensity = 1;
		}

		const pianolines = pianoLogic.calc_notes(chordList, bpm, timeSignature, intensity);
		const basslines = bassLogic.calc_bass(songParserObj.getAllChords(), bpm, timeSignature, intensity); 
		const drumlines = drumLogic.generatePattern(patternJson, bpm, chordList.length, timeSignature, intensity);

		console.log(`Loop ${currentLoop + 1} mit Intensität ${intensity}`);
		//console.log("Pianolines:", pianolines);
		//console.log("Basslines:", basslines);
		//console.log("Drumlines:", drumlines);

		takt_nr = 0;

		function playNextTakt() {
			if (takt_nr >= basslines.length) {
				takt_nr = 0;
				currentLoop++;
				playNextLoop();
				return;
			}

			playTakt(pianolines[takt_nr], basslines[takt_nr], drumlines[takt_nr]);
			taktTimeout = setTimeout(playNextTakt, drumlines[takt_nr].t);
			takt_nr++;
		}

		playNextTakt();
	}

	playNextLoop();
}

function stop() {
	console.error(taktTimeout);
	if (taktTimeout === null) {
		// Lade Übersichtsseite wieder bei Mehrfachklick auf Stop
		document.getElementById("chordWrapper").innerHTML = "";
		document.getElementById("trackName").innerHTML = '';
		
		// Stelle die ursprüngliche Song-Übersicht wieder her
		songs.createSongCharOverview();
		// Stelle sicher, dass Suchfeld und Suchergebnisse geleert und versteckt sind
		document.getElementById("songSearchTxt").value = '';
		document.getElementById("songSearchResults").innerHTML = '';
		document.getElementById("songSearchResults").style.display = 'none';
	}

	clearTimeout(taktTimeout);
	taktTimeout = null;
}

function updateBPM(newBPM) {
	bpm = parseInt(newBPM, 10);
	document.getElementById("bpmValue").textContent = bpm;
	console.log(`Neue Geschwindigkeit: ${bpm} BPM`);
}

async function loadSelectedBeat() {
	try {
		const beatFile = document.getElementById("beatSelect").value;
		return await loadBeatFromFile(beatFile);
	} catch (error) {
		console.error("Fehler beim Laden des Beats", error);
	}
}