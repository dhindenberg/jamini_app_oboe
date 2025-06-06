class DisplaySong {    
    constructor(song) {        
        this.song = song;
        this.html = '';
        this.barCount = 0;
        this.sectionIndex = 0;
    }

    render() {
        let s = '<div class="song-container">';
        s += `<h3 class="song-title">${this.song.title}</h3>`;

        for (let sectionData of this.song.data) {
            this.barCount = 0;
            this.sectionIndex++;

            const section = sectionData.section;
            const bars = sectionData.bars;

            s += `<div class="section-title">${section}${section === "A" && this.sectionIndex === 1 ? " (" + this.song.style + ")" : ""}</div>`;
            s += '<div class="bar-row">';

            for (let i = 0; i < bars.length; i++) {
                const bar = bars[i];
                const showSignature = (i === 0 && this.sectionIndex === 1);
                const signatureDisplay = showSignature ? `${this.song.tempo} bpm<br>${bar.timeSignature.replace("/", "<br>")}` : "";
                const barHTML = this.buildBar(bar, signatureDisplay);
                s += barHTML;
                this.barCount++;

                if (this.barCount % 4 === 0) {
                    s += '</div><div class="bar-row">';
                }
            }

            s += '</div>';
        }

        s += '</div>';
        return s;
    }

    buildBar(bar, signatureDisplay = "") {
        let chords = ['', '', '', ''];
        let repeatStart = false;
        let repeatEnd = false;
        let repeatVersion = null;
        let isCoda = false;

        bar.events.forEach(event => {
            if (event.chord) {
                const [chord, pos] = event.chord;
                const index = Math.floor(parseFloat(pos));                
                chords[index] = chord;
            }
            if (event.repeatStart) repeatStart = true;
            if (event.repeatEnd) repeatEnd = true;
            if (event.repeatVersionStart) repeatVersion = event.repeatVersionStart;
            if (event.toCoda) isCoda = true;
        });

        
        const highLightIDS = bar.n.map(element => `h_${element}`);
        let s = '<div class="bar '+highLightIDS.join(' ')+'">';

        // Taktart
        if (signatureDisplay) {
            s += `<div class="signature">${signatureDisplay}</div>`;
        }

        // Coda-Markierung
        if (isCoda) {
            s += `<div class="coda-label">(coda)</div>`;
        }

        // Linke Wiederholungsmarkierung oder Linie
        s += repeatStart ? '<div class="repeat-start">|:</div>' : '<div class="bar-line"></div>';

        // Anzeige der Taktnummern (n)
        if (bar.n && Array.isArray(bar.n)) {            
            const taktLabel = bar.n.join(', ');
            //s += `<div class="takt-numbers">${taktLabel}</div>`;
        }

        // Chord-Zellen
        s += '<div class="bar-body">';
        for (let i = 0; i < 4; i++) {
            s += `<div class="chord-cell">${chords[i]}</div>`;
        }
        s += '</div>';

        // Rechte Wiederholungsmarkierung oder Linie
        s += repeatEnd ? '<div class="repeat-end">:|</div>' : '<div class="bar-line"></div>';

        // Wiederholungsnummer
        if (repeatVersion) {
            s += `<div class="repeat-version"><div class="repeat-line"></div><div class="repeat-number">${repeatVersion}</div></div>`;
        }

        s += '</div>';
        return s;
    }

}
