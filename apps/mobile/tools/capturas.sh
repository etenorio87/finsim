#!/usr/bin/env bash
# Capturas para la App Store (6,9": 1320×2868) con el modo captura de la app
# (src/app/capturas.ts). Compila, instala en el simulador y guarda los PNG en
# apps/mobile/tienda/capturas/ios.
#
#   apps/mobile/tools/capturas.sh ["iPhone 16 Pro Max"]
set -euo pipefail

MOVIL="$(cd "$(dirname "$0")/.." && pwd)"
DISPOSITIVO="${1:-iPhone 16 Pro Max}"
ID_APP="com.etenoriod.finsim"
SALIDA="$MOVIL/tienda/capturas/ios"
PANTALLAS=(formulario simular cuadro amortizacion comparar contado)

SIM=$(xcrun simctl list devices available | grep -F "$DISPOSITIVO (" | head -1 | grep -oE '[0-9A-F-]{36}')
[ -n "$SIM" ] || { echo "No hay simulador \"$DISPOSITIVO\""; exit 1; }

xcrun simctl boot "$SIM" 2>/dev/null || true
xcrun simctl bootstatus "$SIM" -b >/dev/null

(cd "$MOVIL" && npx ns build ios >/dev/null)
xcrun simctl install "$SIM" "$MOVIL/platforms/ios/build/Debug-iphonesimulator/mobile.app"

# Barra de estado de catálogo: 9:41, cobertura y batería completas
xcrun simctl status_bar "$SIM" override --time 9:41 --dataNetwork wifi --wifiBars 3 \
  --cellularMode active --cellularBars 4 --batteryState charged --batteryLevel 100
xcrun simctl ui "$SIM" appearance light

mkdir -p "$SALIDA"
n=1
for pantalla in "${PANTALLAS[@]}"; do
  xcrun simctl terminate "$SIM" "$ID_APP" 2>/dev/null || true
  SIMCTL_CHILD_FINSIM_CAPTURA="$pantalla" xcrun simctl launch "$SIM" "$ID_APP" >/dev/null
  sleep 6
  archivo="$SALIDA/$(printf '%02d' $n)-$pantalla.png"
  xcrun simctl io "$SIM" screenshot "$archivo" >/dev/null 2>&1
  echo "$archivo"
  n=$((n + 1))
done

xcrun simctl terminate "$SIM" "$ID_APP" 2>/dev/null || true
xcrun simctl status_bar "$SIM" clear
