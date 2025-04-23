#ifndef ANDROID_MIDI_SYNTH_MIDIMANAGER_H
#define ANDROID_MIDI_SYNTH_MIDIMANAGER_H

#include <jni.h>
#include <pthread.h>
#include <amidi/AMidi.h>

#include <atomic>
#include <set>
#include <sstream>

#include "SynthManager.h"

/** @brief Thread routine to polling MIDI commands. */
static void* readThreadRoutine(void *context);

/**
 * @brief MidiManager class.
 * @details The MidiManager encapsulates a native MIDI listener.
 */
class MidiManager {
public:
    /**
     * @brief Constructor.
     * @param env JNI Env pointer
     * @param midiManagerObj MidiManager (Java) object
     * @param midiDeviceObj MidiDevice (Java) object
     * @param portNumber Port number to open
     */
    MidiManager(JNIEnv* env, jobject midiManagerObj, jobject midiDeviceObj, jint portNumber);

    /** @brief Destructor. */
    ~MidiManager();

    /** @brief Stop reading and cleanup. */
    void stop();

private:
    void parseMidiData(const uint8_t *data, size_t numBytes);
    void parseMidiCmdControl(uint8_t controller, uint8_t value);

    void sendToCallback(uint8_t* data, int size);
    void sendToCallback(const char *str);
    void sendToCallback(const std::ostringstream& oss);

private:
    AMidiDevice* nativeReceiveDevice = nullptr;
    AMidiOutputPort* midiOutputPort = nullptr;
    pthread_t readThread;
    std::atomic<bool> reading{false};
    bool sustain = false;
    std::set<int> playNotes;
    std::set<int> sustainNotes;

    SynthManager* synthManager = nullptr;
    JavaVM* jvm = nullptr;
    jobject callbackObj = nullptr;
    jmethodID callback = nullptr;

    friend void* readThreadRoutine(void *context);
};

#endif //ANDROID_MIDI_SYNTH_MIDIMANAGER_H
