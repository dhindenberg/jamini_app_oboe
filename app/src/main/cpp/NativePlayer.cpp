#include "NativePlayer.h"
#include <android/asset_manager.h>
#include <android/asset_manager_jni.h>
#include <android/log.h>
#include <oboe/Oboe.h>
#include <vector>
#include <unordered_map>
#include <thread>
#include <cmath>
#include <mutex>

#define LOG_TAG "NativePlayer"
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)

namespace {
    AAssetManager *gAssetManager = nullptr;

    std::unordered_map<std::string, std::vector<int16_t>> drumSamples;
    std::unordered_map<int, std::vector<int16_t>> bassSamples;
    std::unordered_map<int, std::vector<int16_t>> pianoSamples;

    std::mutex playbackMutex;
}

std::vector<int16_t> loadWavFromAssets(const char *filename) {
    if (!gAssetManager) {
        LOGE("AssetManager is null!");
        return {};
    }

    AAsset *asset = AAssetManager_open(gAssetManager, filename, AASSET_MODE_STREAMING);
    if (!asset) {
        LOGE("Unable to open asset: %s", filename);
        return {};
    }

    AAsset_seek(asset, 44, SEEK_SET); // Skip WAV header

    std::vector<int16_t> buffer;
    int16_t sample;
    while (AAsset_read(asset, &sample, sizeof(sample)) == sizeof(sample)) {
        buffer.push_back(sample);
    }

    AAsset_close(asset);
    return buffer;
}

void NativePlayer::init(AAssetManager *mgr) {
    gAssetManager = mgr;

    const char *drumInstruments[] = { "kick", "snare", "hihat", "openhihat", "ride", "tom_l", "tom_m", "tom_h" };
    for (const auto &instrument : drumInstruments) {
        std::string path = std::string("drums/") + instrument + "/1.wav";
        drumSamples[instrument] = loadWavFromAssets(path.c_str());
        LOGI("Loaded drum sample: %s (%zu samples)", instrument, drumSamples[instrument].size());
    }

    for (int i = 0; i < 23; ++i) {
        char path[64];
        snprintf(path, sizeof(path), "upright_bass/vel_77/%d.wav", i);
        bassSamples[i] = loadWavFromAssets(path);
        LOGI("Loaded bass sample: %d (%zu samples)", i, bassSamples[i].size());
    }

    for (int i = 46; i <= 80; ++i) {
        char path[64];
        snprintf(path, sizeof(path), "piano/%03d.wav", i);
        pianoSamples[i] = loadWavFromAssets(path);
        LOGI("Loaded piano sample: %d (%zu samples)", i, pianoSamples[i].size());
    }
}

void NativePlayer::playSample(std::vector<int16_t> data, int velocity, int fadeOutMs) {
    std::thread([data = std::move(data), velocity, fadeOutMs]() {
        oboe::AudioStreamBuilder builder;
        builder.setFormat(oboe::AudioFormat::I16)
                ->setSampleRate(44100)
                ->setChannelCount(1)
                ->setPerformanceMode(oboe::PerformanceMode::LowLatency);

        oboe::AudioStream *stream = nullptr;
        oboe::Result result = builder.openStream(&stream);
        if (result != oboe::Result::OK || !stream) {
            LOGE("Failed to open stream: %s", oboe::convertToText(result));
            return;
        }

        stream->requestStart();

        float volume = velocity / 127.0f;
        int fadeSamples = fadeOutMs * 44;

        std::vector<int16_t> buffer(data.size());
        for (size_t i = 0; i < data.size(); ++i) {
            float gain = 1.0f;
            if (fadeOutMs > 0 && i >= data.size() - fadeSamples) {
                gain = float(data.size() - i) / fadeSamples;
            }
            buffer[i] = static_cast<int16_t>(data[i] * volume * gain);
        }

        stream->write(buffer.data(), buffer.size(), 1000000000L);
        stream->stop();
        stream->close();
        delete stream;
    }).detach();
}

void NativePlayer::playDrum(const char *name, int velocity) {
    auto it = drumSamples.find(name);
    if (it != drumSamples.end()) {
        playSample(it->second, velocity, 0);
    } else {
        LOGE("Drum sample not found: %s", name);
    }
}

void NativePlayer::playBass(int note, int velocity, int lengthMs) {
    auto it = bassSamples.find(note);
    if (it != bassSamples.end()) {
        playSample(it->second, velocity, 100);
    } else {
        LOGE("Bass sample not found: %d", note);
    }
}

void NativePlayer::playPiano(int note, int velocity, int lengthMs) {
    auto it = pianoSamples.find(note);
    if (it != pianoSamples.end()) {
        playSample(it->second, velocity, 100);
    } else {
        LOGE("Piano sample not found: %d", note);
    }
}
