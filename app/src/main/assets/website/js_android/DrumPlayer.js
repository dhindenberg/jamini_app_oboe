// DrumPlayer.js

class DrumPlayer {
    constructor() {
        this.sounds = {};
        this.directories = {
            "kick": "drums/kicks/",
            "snare": "drums/snares/",
            "hihat": "drums/hihats/",
            "openhihat": "drums/openhihats/",
            "ooh_pedal": "drums/ohh_pedal/",
            "ride": "drums/ride/",
			"tom_l": "drums/tom_l/",
			"tom_m": "drums/tom_m/",
			"tom_h": "drums/tom_h/"
        };
        this.volumeSettings = {
            "kick": 0.5,
            "snare": 0.55,
            "hihat": 1,
            "openhihat": 1,
            "ooh_pedal": 0.8,
            "ride": 0.5,
			"tom_l": 0.4,
			"tom_m": 0.4,
			"tom_h": 0.4			
        };
    }

    // Methode zum Laden von Sounds
    async loadSounds() {
        const loadedSounds = {};

        const loadFiles = async (dir) => {
            const response = await fetch(`${dir}files.json`);
            let files = await response.json();			
            return files.files.map(file => new Howl({
                src: [`${dir}${file}`],
                html5: true
            }));
        };

        for (const [instrument, dir] of Object.entries(this.directories)) {
            loadedSounds[instrument] = await loadFiles(dir);
        }

        this.sounds = loadedSounds;
    }

    // Methode zum Abspielen eines Sounds für ein gegebenes Instrument
    playSound(instrument, velocity) {
        const instrumentSounds = this.sounds[instrument];
        if (!instrumentSounds || instrumentSounds.length === 0) return;

        // Wählen Sie einen zufälligen Sound aus
        let randomSound = instrumentSounds[Math.floor(Math.random() * instrumentSounds.length)];
		//let randomSound = instrumentSounds[0];
        
        // Berechnen Sie die Lautstärke basierend auf der Velocity
        randomSound.volume(1);
		//this.volumeSettings[instrument] * velocity
        
        // Spielen Sie den Sound ab
        randomSound.play();
    }
}
