package com.robsonmartins.androidmidisynth

import android.content.Context
import androidx.appcompat.app.AppCompatActivity.MODE_PRIVATE
import java.io.IOException

class SynthManager(private val context: Context) {

    private var soundFontPath: String? = null
    private var nativeHandle: Long = 0

    init {
        nativeHandle = fluidsynthInit()
    }

    fun finalize() {
        fluidsynthFree(nativeHandle)
    }

    fun loadSF(filename: String, program: Int = 0) {
        try {
            soundFontPath = copyAssetToTmpFile(filename)
            if (fluidsynthLoadSF(nativeHandle, soundFontPath, program) < 0) {
                throw IOException("Error loading $filename")
            }
        } catch (e: IOException) {
            throw RuntimeException(e)
        }
    }

    fun setVolume(volume: Int) {
        fluidsynthCC(nativeHandle, 7, volume)
    }

    // Wrapper-Methode für NoteOn
    fun noteOn(note: Int, velocity: Int) {
        fluidsynthNoteOn(nativeHandle, note, velocity)
    }

    // Wrapper-Methode für NoteOff
    fun noteOff(note: Int) {
        fluidsynthNoteOff(nativeHandle, note)
    }

    private fun copyAssetToTmpFile(filename: String): String {
        context.assets.open(filename).use { input ->
            val tempFilename = "tmp_$filename"
            context.openFileOutput(tempFilename, MODE_PRIVATE).use { output ->
                val buffer = ByteArray(4096)
                var bytesRead: Int
                while (input.read(buffer).also { bytesRead = it } != -1) {
                    output.write(buffer, 0, bytesRead)
                }
            }
            return "${context.filesDir}/$tempFilename"
        }
    }

    external fun fluidsynthNoteOn(nativeHandle: Long, note: Int, velocity: Int)
    external fun fluidsynthNoteOff(nativeHandle: Long, note: Int)
    external fun fluidsynthCC(nativeHandle: Long, controller: Int, value: Int)
    external fun fluidsynthReverb(nativeHandle: Long, level: Int)

    private external fun fluidsynthInit(): Long
    private external fun fluidsynthLoadSF(nativeHandle: Long, soundfontPath: String?, program: Int): Int
    private external fun fluidsynthFree(nativeHandle: Long)
}
