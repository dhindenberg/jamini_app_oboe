class DrumLogic {
    
	timeConf;
	
	constructor() {	
		this.pattern;
		this.bpm;
		this.numBars;	
	}

	setTimeSignatureConf(timeSignature){
		const conf = {};
		conf['4/4'] = {'anz4tel':4,'16tel':16,'12tel':12};		
		conf['3/4'] = {'anz4tel':3,'16tel':12,'12tel':9};		
		this.timeConf = conf[timeSignature];
	}

    calculatePlayTime(bpm, steps, index) {
        const msPerBeat = 60000 / bpm * 4;
        const msPerStep = msPerBeat / steps;
        return msPerStep * index + this.mtRand(0,7);
    }

	mtRand(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}
	
	calculateSwingOffset() {

		// Minimum und Maximum für den Swing-Offset in Millisekunden
		const minOffset = 80; // 10 ms
		const maxOffset = 10; // 80 ms

		// Minimum und Maximum für den BPM-Bereich
		const minBPM = 50;
		const maxBPM = 220;

		// Interpolation des Offsets basierend auf dem BPM
		const swingOffset = minOffset + ((this.bpm - minBPM) / (maxBPM - minBPM)) * (maxOffset - minOffset);
		return swingOffset;
		
	}

    // Erzeugt das Pattern basierend auf den 16tel und 12tel Noten
    generatePattern(patternJson, bpm, numBars, timeSignature, intensity) {	
		this.setTimeSignatureConf(timeSignature);	
		let pattern = {...patternJson};
        this.bpm = parseInt(bpm);
        this.numBars = numBars;			
		
        const bars = [];

		//pattern['tom_m']['12tel'][this.mtRand(0,11)] = 1;

        // Berechnung für jeden Takt
        for (let barIndex = 0; barIndex < this.numBars; barIndex++) {
            let bar = {};						
            bar["t"] = this.calculatePlayTime(this.bpm, 16, 16); // Länge des Taktes in Millisekunden (16 Schläge à 16tel)

			//pattern = {...patternJson};
			//pattern['snare']['12tel'][this.mtRand(0,11)] = 1;			

			//fill
			if(barIndex % 8 == 7){
				
				var swing_fills = {
					'44':[
						{"kick":{"16tel":[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[0,0,0,0,0,0,0,0,0,0,0,0]},"snare":{"16tel":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[0,0,1,0,0,0,0,0,0,0,0,0]},"ooh_pedal":{"16tel":[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],"12tel":[0,0,0,0,0,0,0,0,0,0,0,0]},"ride":{"16tel":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[1,0,0,1,0,1,1,0,0,1,0,1]},"tom_h":{"16tel":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[0,0,0,1,0,1,0,0,0,0,0,0]},"tom_m":{"16tel":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[0,0,0,0,0,0,1,0,1,0,0,0]},"tom_l":{"16tel":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[0,0,0,0,0,0,0,0,0,1,1,1]}},
						{"kick":{"16tel":[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[0,0,0,0,0,0,0,0,0,0,0,0]},"snare":{"16tel":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[0,1,1,1,0,1,0,0,1,0,0,0]},"ooh_pedal":{"16tel":[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],"12tel":[0,0,0,0,0,0,0,0,0,0,0,0]},"ride":{"16tel":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[1,0,0,1,0,1,1,0,0,1,0,1]},"tom_h":{"16tel":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[0,0,0,0,0,0,1,0,0,0,0,0]},"tom_l":{"16tel":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[0,0,0,0,0,0,0,0,0,1,1,1]}},
						{"kick":{"16tel":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[1,0,0,1,0,0,0,0,0,0,0,0]},"snare":{"16tel":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[0,0,1,0,0,1,0,0,0,0,0,0]},"ride":{"16tel":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[1,0,0,1,0,0,1,0,0,1,0,1]},"tom_h":{"16tel":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[0,0,0,0,0,0,1,1,0,0,0,0]},"tom_m":{"16tel":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[0,0,0,0,0,0,0,0,1,1,0,0]},"tom_l":{"16tel":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[0,0,0,0,0,0,0,0,0,0,1,1]}},
						{"kick":{"16tel":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[1,0,0,0,0,0,0,0,0,0,0,0]},"snare":{"16tel":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[0,0,0,0,0,0,0,0,0,1,1,1]},"ooh_pedal":{"16tel":[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],"12tel":[0,0,0,0,0,0,0,0,0,0,0,0]},"ride":{"16tel":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[1,0,0,1,0,1,1,0,0,1,0,1]},"tom_h":{"16tel":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[0,1,1,0,0,0,0,0,0,0,0,0]},"tom_m":{"16tel":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[0,0,0,0,1,1,0,0,0,0,0,0]},"tom_l":{"16tel":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[0,0,0,0,0,0,0,1,1,0,0,0]}},
						{"kick":{"16tel":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[1,0,0,1,0,1,0,0,0,0,0,0]},"snare":{"16tel":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[0,1,1,0,0,0,1,0,0,0,0,0]},"ride":{"16tel":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[1,0,0,1,0,0,1,0,0,1,0,0]},"tom_h":{"16tel":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[0,0,0,0,0,0,0,1,1,0,0,0]},"tom_m":{"16tel":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[0,0,0,0,0,0,0,0,0,0,1,1]}},
						{"kick":{"16tel":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[1,0,0,0,1,1,0,0,0,0,0,0]},"snare":{"16tel":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[0,0,1,0,0,0,1,0,0,0,1,0]},"ooh_pedal":{"16tel":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[0,0,0,1,0,0,0,0,0,1,0,0]},"ride":{"16tel":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[1,0,0,1,0,1,1,0,0,1,0,1]},"tom_m":{"16tel":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[0,0,0,0,0,0,0,1,1,0,0,0]},"tom_l":{"16tel":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"12tel":[0,0,0,0,0,0,0,0,0,1,0,1]}}						
					]
				}
				
				pattern = this.getRandomValueFromArray(swing_fills['44']);
				
			}else{
				pattern = patternJson;
			}

            // Durchlaufe jedes Instrument im Pattern
            Object.keys(pattern).forEach(instrument => {
                const instrumentPattern16th = pattern[instrument]["16tel"];
                const instrumentPattern12th = pattern[instrument]["12tel"];

                let instrumentData = [];

                // Berechnung der Abspielzeitpunkte für 16tel-Noten
                instrumentPattern16th.forEach((value, index) => {										
                    if (value === 1) {
                        let playTime = this.calculatePlayTime(this.bpm, this.timeConf['16tel'], index);						
                        instrumentData.push({ ms: playTime, velocity: this.mtRand(70,80) }); // Beispiel: Velocity von 75
                    }
                });

                // Berechnung der Abspielzeitpunkte für 12tel-Noten
                instrumentPattern12th.forEach((value, index) => {
                    if (value === 1) {
                        let playTime = this.calculatePlayTime(this.bpm, this.timeConf['12tel'], index);												
						//nur bei ride becken, den extra swing ms offset :)
						if (instrument == "ride" && index % 3 === 2) {							
							playTime += this.calculateSwingOffset();
						}	
                        instrumentData.push({ ms: playTime, velocity: this.mtRand(70,80) }); // Beispiel: Velocity von 75
                    }
                });

                if (instrumentData.length > 0) {
                    bar[instrument] = instrumentData;
                }
            });

            bars.push(bar);
        }
		
        return bars;
    }
	
	pushExtraHits(){
		
		
	}
	
	getRandomValueFromArray(arr) {
		if (!Array.isArray(arr) || arr.length === 0) {
			throw new Error("Array ist leer oder ungültig.");
		}
		return arr[Math.floor(Math.random() * arr.length)];
	}	
}
