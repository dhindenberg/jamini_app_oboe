@echo off
setlocal enabledelayedexpansion

:: Name der JSON-Ausgabedatei
set output_file=files.json

:: Hole den Ordnerpfad, in dem die Batch-Datei liegt
set "folder=%~dp0"

:: Wechsel in das Verzeichnis der Batch-Datei
cd /d "%folder%"

:: Starte die JSON-Struktur
set json_content={"files":[

:: Schleife durch alle Dateien im Verzeichnis
for %%f in (*) do (
    :: Überspringe die Batch-Datei selbst und die Ausgabedatei
    if /i not "%%~nxf"=="%~nx0" if /i not "%%~nxf"=="%output_file%" (
        set "file_name="%%~nxf""
        set "json_content=!json_content!!file_name!,"
    )
)

:: Entferne das letzte Komma und schließe die JSON-Struktur
set "json_content=!json_content:~0,-1!]}"
   
:: Schreibe die JSON-Daten in die Ausgabedatei
> "%output_file%" echo !json_content!

echo Die Dateien wurden in %output_file% gespeichert.
