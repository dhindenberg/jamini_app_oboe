#include <jni.h>
#include <string>
#include <oboe/Oboe.h>
#include <fstream>
#include <vector>
#include <android/log.h>
#include <cstring> // Für strncmp
#include <cstdint> // Für uint32_t, uint16_t

#define LOG_TAG "WavPlayerJNI"
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

class SimpleWavPlayer : public oboe::AudioStreamCallback {
public:
    std::vector<int16_t> audioData;
    size_t readIndex = 0;
    int32_t sampleRate = 0;
    int16_t numChannels = 0;

    oboe::AudioStream *stream = nullptr;

    bool loadWavFile(const std::string &filePath) {
        std::ifstream file(filePath, std::ios::binary);
        if (!file) {
            LOGE("Failed to open file: %s", filePath.c_str());
            return false;
        }

        // WAV Header Chunk
        char chunkID[4];
        file.read(chunkID, 4);
        if (strncmp(chunkID, "RIFF", 4) != 0) {
            LOGE("Not a valid RIFF file");
            return false;
        }

        uint32_t chunkSize;
        file.read(reinterpret_cast<char*>(&chunkSize), 4); // File size - 8 bytes

        char format[4];
        file.read(format, 4);
        if (strncmp(format, "WAVE", 4) != 0) {
            LOGE("Not a valid WAVE file");
            return false;
        }

        // Format Sub-Chunk
        char subChunk1ID[4];
        file.read(subChunk1ID, 4);
        if (strncmp(subChunk1ID, "fmt ", 4) != 0) {
            LOGE("Missing 'fmt ' sub-chunk");
            return false;
        }

        uint32_t subChunk1Size;
        file.read(reinterpret_cast<char*>(&subChunk1Size), 4);
        if (subChunk1Size < 16) {
            LOGE("Invalid 'fmt ' sub-chunk size");
            return false;
        }

        uint16_t audioFormat;
        file.read(reinterpret_cast<char*>(&audioFormat), 2);
        if (audioFormat != 1) { // PCM
            LOGE("Unsupported audio format: %d", audioFormat);
            return false;
        }

        file.read(reinterpret_cast<char*>(&numChannels), 2);
        file.read(reinterpret_cast<char*>(&sampleRate), 4);

        uint32_t byteRate;
        file.read(reinterpret_cast<char*>(&byteRate), 4);

        uint16_t blockAlign;
        file.read(reinterpret_cast<char*>(&blockAlign), 2);

        uint16_t bitsPerSample;
        file.read(reinterpret_cast<char*>(&bitsPerSample), 2);
        if (bitsPerSample != 16) {
            LOGE("Only 16-bit WAV files are supported");
            return false;
        }

        // Data Sub-Chunk
        char subChunk2ID[4];
        file.read(subChunk2ID, 4);
        while (strncmp(subChunk2ID, "data", 4) != 0 && file.peek() != EOF) {
            uint32_t subChunk2Size;
            file.read(reinterpret_cast<char*>(&subChunk2Size), 4);
            file.seekg(subChunk2Size, std::ios::cur); // Skip unknown chunks
            file.read(subChunk2ID, 4);
        }

        if (strncmp(subChunk2ID, "data", 4) != 0) {
            LOGE("Missing 'data' sub-chunk");
            return false;
        }

        uint32_t dataSize;
        file.read(reinterpret_cast<char*>(&dataSize), 4);
        audioData.resize(dataSize / 2); // Assuming 16-bit (2 bytes per sample)
        file.read(reinterpret_cast<char*>(audioData.data()), dataSize);

        return true;
    }

    void start() {
        if (sampleRate == 0 || numChannels == 0) {
            LOGE("Sample rate or number of channels not loaded.");
            return;
        }
        oboe::AudioStreamBuilder builder;
        builder.setFormat(oboe::AudioFormat::I16)
                ->setChannelCount(static_cast<oboe::ChannelCount>(numChannels))
                ->setSampleRate(sampleRate)
                ->setPerformanceMode(oboe::PerformanceMode::LowLatency)
                ->setCallback(this);

        oboe::Result result = builder.openStream(&stream);
        if (result != oboe::Result::OK) {
            LOGE("Error opening stream: %s", oboe::convertToText(result));
            return;
        }
        if (stream) stream->requestStart();
    }

    void stop() {
        if (stream) {
            stream->requestStop();
            stream->close();
            stream = nullptr;
        }
    }

    oboe::DataCallbackResult onAudioReady(oboe::AudioStream *audioStream,
                                          void *audioDataBuffer,
                                          int32_t numFrames) override {
        auto *outputBuffer = static_cast<int16_t *>(audioDataBuffer);
        int channelCount = audioStream->getChannelCount();

        for (int i = 0; i < numFrames * channelCount; ++i) {
            outputBuffer[i] = (readIndex < audioData.size()) ? audioData[readIndex++] : 0;
        }

        if (readIndex >= audioData.size()) {
            return oboe::DataCallbackResult::Stop;
        }

        return oboe::DataCallbackResult::Continue;
    }
};

SimpleWavPlayer gPlayer;

extern "C"
JNIEXPORT void JNICALL
Java_com_dhitsolutions_oboe_1test_WavPlayer_startPlaying(JNIEnv *env, jobject /* this */, jstring filePath) {
    const char *path = env->GetStringUTFChars(filePath, nullptr);
    if (gPlayer.loadWavFile(path)) {
        gPlayer.start();
    } else {
        LOGE("Failed to load WAV file: %s", path);
    }
    env->ReleaseStringUTFChars(filePath, path);
}

extern "C"
JNIEXPORT void JNICALL
Java_com_dhitsolutions_oboe_1test_WavPlayer_stopPlaying(JNIEnv *env, jobject /* this */) {
    gPlayer.stop();
}