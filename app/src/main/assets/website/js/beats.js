class Beats {
    constructor(filePath) {
        this.filePath = filePath;
        this.beats = [];
    }

    async loadBeats() {
        try {
            const response = await fetch(this.filePath);
            if (!response.ok) throw new Error(`Fehler beim Laden der Datei: ${response.statusText}`);
            this.beats = await response.json();
            console.log(`Beats geladen: ${this.beats.length} Patterns.`);
        } catch (error) {
            console.error('Fehler beim Laden der Beats:', error);
        }
    }

    createBeatSelectBox(containerId) {
        if (!this.beats || this.beats.length === 0) {
            console.error('Beats wurden noch nicht geladen oder sind leer.');
            return;
        }

        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container mit ID '${containerId}' nicht gefunden.`);
            return;
        }

        const selectBox = document.createElement('select');
        selectBox.id = 'beatSelect';

        this.beats.forEach((beat, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `Beat ${index + 1}`;
            selectBox.appendChild(option);
        });

        container.appendChild(selectBox);
        console.log('SelectBox mit Beats erstellt.');
    }

    getSelectedBeat(index) {
        if (index < 0 || index >= this.beats.length) {
            console.error(`UngÃ¼ltiger Beat-Index: ${index}`);
            return null;
        }
        return this.beats[index];
    }
}
