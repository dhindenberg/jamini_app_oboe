class Songs {
	constructor(jsonUrl) {
		this.jsonUrl = jsonUrl;
		this.songs = [];
	}

	/**
	 * LÃ¤dt die JSON-Datei mit den Song-Daten und speichert sie in this.songs.
	 * @returns {Promise<void>} - Eine Promise, die aufgelÃ¶st wird, wenn die Songs geladen sind.
	 */
    async loadSongs() {
        try {
            const request = new XMLHttpRequest();
            request.overrideMimeType("application/json");
            request.open("GET", "website/jaminiSongs.json", true);
            request.onload = () => {
                if (request.status === 200 || request.status === 0) {
                    this.songs = JSON.parse(request.responseText);
                    this.songs.forEach((song, index) => {
                        this.songs[index]["id"] = index;
                    });
                    this.createSongCharOverview();
                    this.setupSearchListener();
                } else {
                    console.error("Fehler beim Laden: " + request.status);
                }
            };
            request.send(null);
        } catch (error) {
            console.error("Fehler beim Laden der Songs:", error);
        }
    }


	createSongCharOverview() {
		let songnames = [];
		this.songs.forEach((song, index) => {
			songnames.push(song.title);
		});

		// 1. Alle Anfangsbuchstaben der Songs extrahieren
		let uniqueLetters = [
			...new Set(songnames.map((song) => song.charAt(0).toUpperCase())),
		].sort();

		document.getElementById("songChooserSongs").innerHTML = ""; // Leere den Container für Songlisten
		const songChooser = document.getElementById("songChooser"); // Container für die Buchstaben
		songChooser.innerHTML = ""; // Stelle sicher, dass der Buchstaben-Container leer ist
		songChooser.style.display = 'grid'; // Stelle sicher, dass der Buchstaben-Container sichtbar ist

		uniqueLetters.sort().forEach((letter) => {
			const div = document.createElement("div");
			div.classList.add("letterBox");
			div.textContent = letter;
			// Klick-Ereignis simulieren
			div.addEventListener("click", () => {
				this.createSongCharList(letter);
			});

			songChooser.appendChild(div);
		});

		// Stelle sicher, dass der songSearchResults Container versteckt ist
		document.getElementById("songSearchResults").innerHTML = '';
		document.getElementById("songSearchResults").style.display = 'none';
	}

	createSongCharList(letter) {
		// 1. Alle Songs mit dem gewählten Anfangsbuchstaben filtern
		let filteredSongs = this.songs
			.filter((song) => song.title.charAt(0).toUpperCase() === letter)
			.sort((a, b) => a.title.localeCompare(b.title)); // Alphabetisch sortieren

		document.getElementById("songChooser").innerHTML = ""; // Buchstaben-Ansicht leeren
		document.getElementById("songChooser").style.display = 'none'; // Buchstaben-Ansicht verstecken
		document.getElementById("trackName").innerHTML = "";

		// 2. Container für die Songliste leeren & erstellen
		const songListContainer = document.getElementById("songChooserSongs");
		songListContainer.innerHTML =
			'<div class="songBox" onclick="songs.createSongCharOverview();"><< back</div>'; // Vorherige Inhalte entfernen
		songListContainer.style.display = 'grid'; // Stelle sicher, dass der Songlisten-Container sichtbar ist

		// 3. Jeden gefilterten Song als Box anzeigen
		filteredSongs.forEach((song) => {
			const songDiv = document.createElement("div");
			songDiv.classList.add("songBox");
			songDiv.textContent = song.title;

			// Klick-Ereignis für den Song
			songDiv.addEventListener("click", () => {
				console.error(song);
				this.chooseSongAction(song.id);
			});

			songListContainer.appendChild(songDiv);
		});
	}

	/**
	 * Richtet den Event-Listener für das Suchfeld ein.
	 */
	setupSearchListener() {
		const searchInput = document.getElementById('songSearchTxt');
		searchInput.addEventListener('input', (event) => {
			this.searchSongs(event.target.value);
		});
	}

	/**
	 * Sucht Songs basierend auf dem Suchbegriff und zeigt die Ergebnisse an.
	 * Die ursprüngliche Übersicht wird bei Suche ausgeblendet und bei leerem Feld wieder eingeblendet.
	 * @param {string} searchTerm - Der Suchbegriff.
	 */
	searchSongs(searchTerm) {
		const songChooserContainer = document.getElementById("songChooser"); // Container für Buchstaben
		const songChooserSongsContainer = document.getElementById("songChooserSongs"); // Container für Songlisten
		const songSearchResultsContainer = document.getElementById("songSearchResults"); // Container für Suchergebnisse
		const trackNameContainer = document.getElementById("trackName");

		// Wenn ein Suchbegriff vorhanden ist
		if (searchTerm.trim() !== '') {
			// Verstecke die ursprüngliche Übersicht
			songChooserContainer.style.display = 'none';
			songChooserSongsContainer.style.display = 'none';
			trackNameContainer.innerHTML = ''; // Titel löschen

			// Filtere die Songs
			const filteredSongs = this.songs.filter(song =>
				song.title.toLowerCase().includes(searchTerm.toLowerCase())
			).sort((a, b) => a.title.localeCompare(b.title)); // Sortiere Suchergebnisse alphabetisch

			// Zeige die Suchergebnisse an
			songSearchResultsContainer.innerHTML = ''; // Alte Ergebnisse löschen
			songSearchResultsContainer.style.display = 'grid'; // Zeige als Grid

			if (filteredSongs.length === 0) {
				const noResults = document.createElement('div');
				noResults.classList.add('noResults');
				noResults.textContent = 'Keine Songs gefunden.';
				// Um CSS für grid beizubehalten, kann man einen Wrapper nutzen oder die noResults direkt flex-basiert machen.
				// Für Einfachheit jetzt direkt angehängt, und CSS kümmert sich um die Darstellung
				songSearchResultsContainer.appendChild(noResults);
			} else {
				filteredSongs.forEach(song => {
					const songDiv = document.createElement('div');
					songDiv.classList.add('songBox');
					songDiv.textContent = song.title;
					songDiv.addEventListener('click', () => {
						this.chooseSongAction(song.id);
					});
					songSearchResultsContainer.appendChild(songDiv);
				});
			}
		} else {
			// Wenn der Suchbegriff leer ist, zeige die ursprüngliche Übersicht wieder an
			songChooserContainer.style.display = 'grid'; // Buchstaben-Ansicht wieder einblenden
			// songChooserSongsContainer.style.display wird von createSongCharOverview/createSongCharList gesetzt
			this.createSongCharOverview(); // Stellt die ursprüngliche Übersicht wieder her

			songSearchResultsContainer.innerHTML = ''; // Suchergebnisse leeren
			songSearchResultsContainer.style.display = 'none'; // Suchergebnis-Container verstecken
			trackNameContainer.innerHTML = ''; // Titel löschen
		}
	}


	chooseSongAction(index) {
		const selectedSong = this.songs[index];
		chooseTrackActions(selectedSong);

		// Verstecke die Suchergebnisse und die ursprüngliche Übersicht, sobald ein Song gewählt wurde
		document.getElementById("songChooser").style.display = 'none';
		document.getElementById("songChooserSongs").style.display = 'none';
		document.getElementById("songSearchResults").style.display = 'none';
		document.getElementById("songSearchTxt").value = ''; // Suchfeld leeren
	}

	/**
	 * Erstellt eine Select-Box mit den geladenen Songs und fÃ¼gt sie an das DOM hinzu.
	 * @param {string} containerId - Die ID des Containers, in den die Select-Box eingefÃ¼gt wird.
	 */
	createSongSelectBox(containerId) {
		// Diese Methode wird nicht mehr verwendet, da die Anzeige über createSongCharOverview läuft.
		// Kann entfernt oder auskommentiert werden, wenn nicht mehr benötigt.
		if (!this.songs.length) {
			console.error("Keine Songs zum Erstellen der Select-Box geladen.");
			return;
		}

		const container = document.getElementById(containerId);
		if (!container) {
			console.error(`Container mit der ID "${containerId}" nicht gefunden.`);
			return;
		}

		const select = document.createElement("select");
		select.id = "songSelect";

		const option = document.createElement("option");
		option.value = "-1"; // Der Wert ist jetzt der Index des Songs
		option.textContent = "- choose Track -"; // Der Titel wird als sichtbarer Text angezeigt
		select.appendChild(option);

		// Option fÃ¼r jeden Song erstellen
		this.songs.forEach((song, index) => {
			const option = document.createElement("option");
			option.value = index; // Der Wert ist jetzt der Index des Songs
			option.textContent = song.Title; // Der Titel wird als sichtbarer Text angezeigt
			select.appendChild(option);
		});

		container.appendChild(select);

		// Event-Listener fÃ¼r Ã„nderungen in der Select-Box
		select.addEventListener("change", (event) => {
			const selectedIndex = event.target.value; // Holen des ausgewÃ¤hlten Index
			const selectedSong = this.songs[selectedIndex]; // Den Song mit diesem Index finden
			if (selectedSong) {
				const parser = new SongParser(selectedSong);
				const chordList = parser.extractChords();
				console.log(
					`Akkorde fÃ¼r den Song "${selectedSong.Title}":`,
					chordList
				);
			}
		});
	}

	/**
	 * Holt den Song anhand seines Indexes.
	 * @param {number} index - Der Index des Songs.
	 * @returns {Object} - Das Song-Objekt.
	 */
	getSongByIndex(index) {
		return this.songs[index];
	}
}