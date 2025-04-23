package com.robsonmartins.androidmidisynth

import android.content.Context
import android.media.midi.MidiDevice
import android.media.midi.MidiDeviceInfo
import android.media.midi.MidiManager

/**
 * @brief MidiManager class.
 * @details The MidiManager encapsulates a MIDI listener.
 * @param context The context object.
 * @param onMidiMessageReceived Method callback to receive MIDI messages.
 */
class MidiManager(
    context: Context,
    private val onMidiMessageReceived: (String) -> Unit
) {

    /* @brief Android.MIDI.MidiManager instance. */
    private val midiManager = context.getSystemService(Context.MIDI_SERVICE) as MidiManager

    /* @brief Current opened device for this instance. */
    private var currentDevice: MidiDevice? = null

    /** @brief Finalize the instance. */
    fun finalize() {
        stopReadingMidi(currentDevice)
    }

    /** @brief Start the MIDI listener. */
    fun start() {
        // scan MIDI devices
        val deviceInfos = midiManager.devices
        for (deviceInfo in deviceInfos) {
            openMidiDevice(deviceInfo)
        }

        // register addDevice and removeDevice listeners
        midiManager.registerDeviceCallback(
            object : MidiManager.DeviceCallback() {
                override fun onDeviceAdded(device: MidiDeviceInfo) {
                    openMidiDevice(device)
                }

                override fun onDeviceRemoved(device: MidiDeviceInfo) {
                    onMidiMessageReceived("Disconnect: ${device.properties.getString("product")}")
                }
            },
            null
        )
    }

    @Suppress("unused")
            /** @brief Stop the MIDI listener. */
    fun stop() {
        stopReadingMidi(currentDevice)
    }

    /*
     * @brief Open the MIDI device.
     * @param deviceInfo MIDI device info.
     */
    private fun openMidiDevice(deviceInfo: MidiDeviceInfo) {
        // ignore FluidSynth MIDI device
        if (deviceInfo.properties.getString("product")?.lowercase() == "fluidsynth") return

        midiManager.openDevice(deviceInfo, { device ->
            onMidiMessageReceived("Open: ${deviceInfo.properties.getString("product")}")
            // stop previous
            stopReadingMidi(currentDevice)
            currentDevice = device
            // start new reading
            startReadingMidi(device, 0)
        }, null)
    }

    /*
     * @brief Callback from native code.
     * @param message MIDI message string
     */
    private fun onNativeMessageReceive(message: ByteArray) {
        onMidiMessageReceived(String(message).trim())
    }

    /*
     * @brief Start reading MIDI messages from the device.
     */
    private external fun startReadingMidi(receiveDevice: MidiDevice, portNumber: Int)

    /*
     * @brief Stop reading MIDI messages from the device.
     */
    private external fun stopReadingMidi(receiveDevice: MidiDevice?)
}
