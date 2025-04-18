package com.dhitsolutions.oboe_test

class WavPlayer {

    init {
        System.loadLibrary("wavplayer") // Name der nativen Bibliothek
    }

    external fun startPlaying(filePath: String)
    external fun stopPlaying()
}
