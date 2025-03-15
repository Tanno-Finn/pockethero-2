@echo off
echo Starte lokalen Python HTTP-Server fuer Pocket-Hero...
echo.
echo Server wird auf http://localhost:7000 gestartet
echo Zum Beenden dieses Fenster schliessen (Strg+C)
echo.

python -m http.server 7000

echo.
echo Server wurde beendet.
pause
