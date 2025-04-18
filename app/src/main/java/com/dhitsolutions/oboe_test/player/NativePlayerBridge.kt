package com.dhitsolutions.oboe_test.player

import android.content.Context
import android.content.res.AssetManager

object NativePlayerBridge {

    init {
        System.loadLibrary("nativeplayer") // <- Name deiner nativen .so
    }

    external fun nativeInit(assetManager: AssetManager)
    external fun nativePlayDrum(instrument: String, velocity: Int)
    external fun nativePlayBass(note: Int, velocity: Int, length: Int)
    external fun nativePlayPiano(note: Int, velocity: Int, length: Int)

    fun init(context: Context) {
        nativeInit(context.assets)
    }

    fun playDrum(instrument: String, velocity: Int) {
        nativePlayDrum(instrument, velocity)
    }

    fun playBass(note: Int, velocity: Int, length: Int) {
        nativePlayBass(note, velocity, length)
    }

    fun playPiano(note: Int, velocity: Int, length: Int) {
        nativePlayPiano(note, velocity, length)
    }
}