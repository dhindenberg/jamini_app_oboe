package com.dhitsolutions.oboe_test

import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity
import java.io.File
import java.io.FileOutputStream

class MainActivity : AppCompatActivity() {

    private lateinit var wavPlayer: WavPlayer
    private lateinit var copiedFile: File

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        wavPlayer = WavPlayer()

        val playButton = findViewById<Button>(R.id.btnPlay)
        val stopButton = findViewById<Button>(R.id.btnStop)

        // WAV-Datei aus assets in den internen Speicher kopieren
        copiedFile = copyWavFromAssets("2.wav")

        playButton.setOnClickListener {
            wavPlayer.startPlaying(copiedFile.absolutePath)
        }

        stopButton.setOnClickListener {
            wavPlayer.stopPlaying()
        }
    }

    private fun copyWavFromAssets(assetName: String): File {
        val outFile = File(filesDir, assetName)
        if (!outFile.exists()) {
            assets.open(assetName).use { inputStream ->
                FileOutputStream(outFile).use { outputStream ->
                    inputStream.copyTo(outputStream)
                }
            }
        }
        return outFile
    }
}
