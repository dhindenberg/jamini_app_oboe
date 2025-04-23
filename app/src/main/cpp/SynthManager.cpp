#include <jni.h>
#include "SynthManager.h"

static const int kFluidSynthSampleRate = 44100;
static const int kFluidSynthLatency = 10;
#define LATENCY_TO_BUFFER_SIZE(x) (kFluidSynthSampleRate * (x) / 1000.0)

SynthManager::SynthManager(): soundfontId(-1) {
    settings = new_fluid_settings();
    if (!settings) return;
    fluid_settings_setint(settings, "synth.cpu-cores", 4);
    fluid_settings_setnum(settings, "synth.gain", 0.6);
    fluid_settings_setstr(settings, "audio.oboe.performance-mode", "LowLatency");
    fluid_settings_setstr(settings, "audio.oboe.sharing-mode", "Exclusive");
    fluid_settings_setnum(settings, "synth.sample-rate", kFluidSynthSampleRate);
    setLatency(kFluidSynthLatency);

    synth = new_fluid_synth(settings);
    if (!synth) {
        delete_fluid_settings(settings);
        return;
    }

    driver = new_fluid_audio_driver(settings, synth);
    if (!driver) {
        delete_fluid_synth(synth);
        delete_fluid_settings(settings);
        return;
    }
}

SynthManager::~SynthManager() {
    if (synth && soundfontId != -1) fluid_synth_sfunload(synth, soundfontId, 1);
    if (driver) delete_fluid_audio_driver(driver);
    if (synth) delete_fluid_synth(synth);
    if (settings) delete_fluid_settings(settings);
}

bool SynthManager::loadSF(const char *soundfontPath, int program) {
    if (!synth) return false;
    int id = fluid_synth_sfload(synth, soundfontPath, 0);
    if (id == FLUID_FAILED) return false;
    fluid_synth_sfont_select(synth, 0, id);
    fluid_synth_program_change(synth, 0, program);
    soundfontId = id;
    return true;
}

void SynthManager::noteOn(int note, int velocity) {
    if (synth) fluid_synth_noteon(synth, 0, note, velocity);
}

void SynthManager::noteOff(int note) {
    if (synth) fluid_synth_noteoff(synth, 0, note);
}

void SynthManager::reverb(int level) {
    if (synth) {
        fluid_synth_reverb_on(synth, -1, level > 0);
        fluid_synth_set_reverb_group_level(synth, -1, level / 127.0);
    }
}

void SynthManager::sendCC(int controller, int value) {
    if (synth) fluid_synth_cc(synth, 0, controller, value);
}

void SynthManager::setLatency(int ms) {
    double bufferSize = LATENCY_TO_BUFFER_SIZE(ms);
    fluid_settings_setnum(settings, "audio.period-size", bufferSize);
    fluid_settings_setint(settings, "audio.periods", 2);
}

extern "C" {

JNIEXPORT jlong JNICALL
Java_com_robsonmartins_androidmidisynth_SynthManager_fluidsynthInit(JNIEnv *, jobject) {
    return reinterpret_cast<jlong>(new SynthManager());
}

JNIEXPORT void JNICALL
Java_com_robsonmartins_androidmidisynth_SynthManager_fluidsynthFree(JNIEnv *, jobject, jlong handle) {
    delete reinterpret_cast<SynthManager *>(handle);
}

JNIEXPORT jint JNICALL
Java_com_robsonmartins_androidmidisynth_SynthManager_fluidsynthLoadSF(JNIEnv *env, jobject, jlong handle, jstring jPath, jint program) {
    const char *path = env->GetStringUTFChars(jPath, nullptr);
    auto *synth = reinterpret_cast<SynthManager *>(handle);
    bool result = synth->loadSF(path, program);
    env->ReleaseStringUTFChars(jPath, path);
    return result ? 0 : -1;
}

JNIEXPORT void JNICALL
Java_com_robsonmartins_androidmidisynth_SynthManager_fluidsynthNoteOn(JNIEnv *, jobject, jlong handle, jint note, jint velocity) {
    reinterpret_cast<SynthManager *>(handle)->noteOn(note, velocity);
}

JNIEXPORT void JNICALL
Java_com_robsonmartins_androidmidisynth_SynthManager_fluidsynthNoteOff(JNIEnv *, jobject, jlong handle, jint note) {
    reinterpret_cast<SynthManager *>(handle)->noteOff(note);
}

JNIEXPORT void JNICALL
Java_com_robsonmartins_androidmidisynth_SynthManager_fluidsynthCC(JNIEnv *, jobject, jlong handle, jint controller, jint value) {
    reinterpret_cast<SynthManager *>(handle)->sendCC(controller, value);
}

JNIEXPORT void JNICALL
Java_com_robsonmartins_androidmidisynth_SynthManager_fluidsynthReverb(JNIEnv *, jobject, jlong handle, jint level) {
    reinterpret_cast<SynthManager *>(handle)->reverb(level);
}

} // extern "C"
