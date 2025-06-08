package com.robsonmartins.androidmidisynth

import android.util.Log
import android.webkit.JavascriptInterface

class SoundInterface {

    companion object {
        private const val TAG = "SoundInterface"
    }

    @JavascriptInterface
    fun playBass(note: Int, velocity: Int, duration: Long) {
        Log.d(TAG, "playBass called with note=$note, velocity=$velocity, duration=$duration")
        SoundPlayer.playBassNote(note, velocity, duration)
    }

    @JavascriptInterface
    fun playPiano(note: Int, velocity: Int, duration: Long) {
        Log.d(TAG, "playPiano called with note=$note, velocity=$velocity, duration=$duration")
        SoundPlayer.playPianoNote(note, velocity, duration)
    }

    @JavascriptInterface
    fun playDrum(note: Int, velocity: Int, duration: Long) {
        Log.d(TAG, "playDrum called with note=$note, velocity=$velocity, duration=$duration")
        SoundPlayer.playDrumsNote(note, velocity, duration)
    }
}
