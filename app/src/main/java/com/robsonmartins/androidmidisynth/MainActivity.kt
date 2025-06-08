package com.robsonmartins.androidmidisynth

import android.os.Bundle
import android.util.Log
import android.view.View
import android.webkit.ConsoleMessage
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    companion object {
        /** @brief Initialize: Load the Native Library. */
        init { System.loadLibrary("synth-lib") }
    }

    lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Vollbildmodus aktivieren
        window.decorView.systemUiVisibility = (
                View.SYSTEM_UI_FLAG_FULLSCREEN or
                        View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or
                        View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                )

        supportActionBar?.hide()
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webview)

        // ✅ SoundPlayer initialisieren – ganz wichtig
        SoundPlayer.initialize(this)
        SoundPlayer.loadInstruments()

        // WebView konfigurieren
        val settings: WebSettings = webView.settings
        settings.javaScriptEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true

        // JS-Fehler und console.log() in Logcat ausgeben
        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                consoleMessage?.let {
                    Log.d(
                        "WebViewConsole",
                        "${it.message()} -- From line ${it.lineNumber()} of ${it.sourceId()}"
                    )
                }
                return true
            }
        }

        // Interne Navigation innerhalb der WebView verhindern Öffnen im externen Browser
        webView.webViewClient = WebViewClient()

        // ✅ SoundInterface hinzufügen – nach SoundPlayer-Initialisierung
        webView.addJavascriptInterface(SoundInterface(), "SoundInterface")

        // Lokale Datei laden
        webView.loadUrl("file:///android_asset/website/index.html")
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
