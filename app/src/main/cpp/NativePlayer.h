// NativePlayer.h
#ifndef NATIVEPLAYER_H
#define NATIVEPLAYER_H

#include <android/asset_manager.h>
#include <android/asset_manager_jni.h>
#include <oboe/Oboe.h>
#include <unordered_map>
#include <string>
#include <vector>
#include <memory>

struct CachedSample {
    std::vector<int16_t> pcmData;
    int sampleRate;
    int channels;
};

class NativePlayer : public oboe::AudioStreamCallback {
public:
    NativePlayer();
    ~NativePlayer();

    void loadSamples(AAssetManager *mgr);
    void playDrum(const std::string &instrument, int velocity);
    void playBass(int midiNote, int velocity, int lengthMs);
    void playPiano(int midiNote, int velocity, int lengthMs);

    oboe::DataCallbackResult onAudioReady(oboe::AudioStream *stream, void *audioData, int32_t numFrames) override;

private:
    std::unordered_map<std::string, CachedSample> drumSamples;
    std::unordered_map<int, CachedSample> bassSamples;
    std::unordered_map<int, CachedSample> pianoSamples;

    struct PlayingSound {
        const int16_t *data;
        size_t length;
        size_t position;
        float volume;
        bool fadeOut;
        int fadeCounter;
    };

    std::vector<PlayingSound> activeSounds;
    std::mutex soundMutex;
    oboe::AudioStream *stream = nullptr;

    void startStream();
    CachedSample loadWavFromAsset(AAssetManager *mgr, const std::string &path);
};

#endif // NATIVEPLAYER_H
