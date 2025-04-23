#ifndef ANDROID_MIDI_SYNTH_SYNTHMANAGER_H
#define ANDROID_MIDI_SYNTH_SYNTHMANAGER_H

#include <fluidsynth.h>

class SynthManager {
public:
    SynthManager();
    ~SynthManager();

    bool loadSF(const char *soundfontPath, int program = 0);
    void noteOn(int note, int velocity);
    void noteOff(int note);
    void sendCC(int controller, int value);
    void reverb(int level);

private:
    void setLatency(int ms);

    fluid_settings_t *settings;
    fluid_synth_t *synth;
    fluid_audio_driver_t *driver;
    int soundfontId;
};

#endif //ANDROID_MIDI_SYNTH_SYNTHMANAGER_H
