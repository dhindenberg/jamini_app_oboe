/*
 * Copyright (c) 2024 Robson Martins
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
*/
// -----------------------------------------------------------------------------------------------
/**
 * @file MainActivity.kt
 * @brief Kotlin Implementation of MainActivity.
 *
 * @author Robson Martins (https://www.robsonmartins.com)
 */
// -----------------------------------------------------------------------------------------------

package com.robsonmartins.androidmidisynth
import kotlinx.coroutines.*
import kotlin.random.Random
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    companion object {
        /** @brief Initialize: Load the Native Library. */
        init { System.loadLibrary("synth-lib") }
    }

    private var playNotesJob: Job? = null

    /* @brief SynthManager instance. */
    private lateinit var synthManager: SynthManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        SoundPlayer.initialize(this)
        SoundPlayer.loadInstruments()

        startPlayingRandomNotes()
    }

    /** @brief On destroy event. */
    override fun onDestroy() {
        SoundPlayer.release()
        super.onDestroy()
    }

    /** Startet das periodische Abspielen zufälliger MIDI-Noten */
    private fun startPlayingRandomNotes() {
        playNotesJob = CoroutineScope(Dispatchers.Default).launch {
            while (isActive) {
                var note = Random.nextInt(30, 61)
                SoundPlayer.playPianoNote(note,127,200);
                delay(1000) // spiele Note 250ms
                note = Random.nextInt(30, 61)
                SoundPlayer.playBassNote(note,127,750);
                //delay(200) // spiele Note 250ms
                note = Random.nextInt(30, 61)
                SoundPlayer.playDrumsNote(note,127,100);

            }
        }
    }

}