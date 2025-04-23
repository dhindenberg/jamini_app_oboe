package com.robsonmartins.androidmidisynth

import android.content.Context
import kotlinx.coroutines.*

object SoundPlayer {
    private lateinit var synthManagerBass: SynthManager
    private lateinit var synthManagerPiano: SynthManager
    private lateinit var synthManagerDrums: SynthManager
    private var isInitialized = false
    private lateinit var appContext: Context

    /**
     * @brief Initializes the SoundPlayer with the application context.
     * @param context The application context.
     */
    fun initialize(context: Context) {
        if (!isInitialized) {
            appContext = context.applicationContext // Use application context to avoid memory leaks
            synthManagerBass = SynthManager(appContext)
            synthManagerPiano = SynthManager(appContext)
            synthManagerDrums = SynthManager(appContext)
            isInitialized = true
        }
    }

    /**
     * @brief Loads the soundfonts for different instruments.
     * Call this after initializing.
     */
    fun loadInstruments() {
        if (!isInitialized) {
            throw IllegalStateException("SoundPlayer must be initialized first. Call initialize(context).")
        }
        synthManagerBass.loadSF("bass_20231130.sf2")
        synthManagerPiano.loadSF("piano_20240403.sf2")
        synthManagerDrums.loadSF("drums_20231130.sf2")
        synthManagerBass.setVolume(127)
        synthManagerPiano.setVolume(127)
        synthManagerDrums.setVolume(127)
    }

    /**
     * @brief Plays a MIDI note on the bass instrument.
     * @param noteNr The MIDI note number (0-127).
     * @param velocity The velocity of the note (0-127).
     * @param duration The duration of the note in milliseconds.
     */
    fun playBassNote(noteNr: Int, velocity: Int, duration: Long) {
        if (!isInitialized) {
            throw IllegalStateException("SoundPlayer must be initialized first. Call initialize(context).")
        }
        CoroutineScope(Dispatchers.Default).launch {
            synthManagerBass.noteOn(noteNr, velocity)
            delay(duration)
            synthManagerBass.noteOff(noteNr)
        }
    }

    /**
     * @brief Plays a MIDI note on the piano instrument.
     * @param noteNr The MIDI note number (0-127).
     * @param velocity The velocity of the note (0-127).
     * @param duration The duration of the note in milliseconds.
     */
    fun playPianoNote(noteNr: Int, velocity: Int, duration: Long) {
        if (!isInitialized) {
            throw IllegalStateException("SoundPlayer must be initialized first. Call initialize(context).")
        }
        CoroutineScope(Dispatchers.Default).launch {
            synthManagerPiano.noteOn(noteNr, velocity)
            delay(duration)
            synthManagerPiano.noteOff(noteNr)
        }
    }

    /**
     * @brief Plays a MIDI note on the drums instrument.
     * @param noteNr The MIDI note number (0-127).
     * @param velocity The velocity of the note (0-127).
     * @param duration The duration of the note in milliseconds.
     */
    fun playDrumsNote(noteNr: Int, velocity: Int, duration: Long) {
        if (!isInitialized) {
            throw IllegalStateException("SoundPlayer must be initialized first. Call initialize(context).")
        }
        CoroutineScope(Dispatchers.Default).launch {
            synthManagerDrums.noteOn(noteNr, velocity)
            delay(duration)
            synthManagerDrums.noteOff(noteNr)
        }
    }

    /**
     * @brief Releases the resources used by the SynthManagers.
     * Call this when the SoundPlayer is no longer needed, for example in `onDestroy` of an Activity.
     */
    fun release() {
        if (isInitialized) {
            synthManagerBass.finalize()
            synthManagerPiano.finalize()
            synthManagerDrums.finalize()
            isInitialized = false
        }
    }
}