#include <jni.h>
#include "NativePlayer.h"

extern "C" {

JNIEXPORT void JNICALL
Java_com_dhitsolutions_jamini_core_player_NativePlayerBridge_nativeInit(
        JNIEnv *env,
        jobject /*this*/,
        jobject assetManager
) {
    AAssetManager *mgr = AAssetManager_fromJava(env, assetManager);
    NativePlayer::init(mgr);
}

JNIEXPORT void JNICALL
Java_com_dhitsolutions_jamini_core_player_NativePlayerBridge_nativePlayDrum(
        JNIEnv *env,
        jobject /*this*/,
        jstring instrumentName,
        jint velocity
) {
    const char *name = env->GetStringUTFChars(instrumentName, nullptr);
    NativePlayer::playDrum(name, velocity);
    env->ReleaseStringUTFChars(instrumentName, name);
}

JNIEXPORT void JNICALL
Java_com_dhitsolutions_jamini_core_player_NativePlayerBridge_nativePlayBass(
        JNIEnv *env,
        jobject /*this*/,
        jint note,
        jint velocity,
        jint length
) {
    NativePlayer::playBass(note, velocity, length);
}

JNIEXPORT void JNICALL
Java_com_dhitsolutions_jamini_core_player_NativePlayerBridge_nativePlayPiano(
        JNIEnv *env,
        jobject /*this*/,
        jint note,
        jint velocity,
        jint length
) {
    NativePlayer::playPiano(note, velocity, length);
}

}
