import { ref } from "vue";
import { BarcodeFormat, BarcodeScanner } from "@capacitor-mlkit/barcode-scanning";

// Define a reactive boolean indicating support status
const isSupported = ref(false);

// Initiate scanning process and return decoded value
export const startScanning = async () => {
  // Query device for scanner support
  const support = await BarcodeScanner.isSupported();
  isSupported.value = support.supported;

  // Alert and exit if scanning is not supported
  if (!isSupported.value) {
    alert('Sorry, the barcode scanner is not supported on your device.');
    return;
  }

  // Request camera permissions before proceeding
  const granted = await requestPermissions();

  // Alert and exit if permission is denied
  if (!granted) {
    alert('Permission denied. Please grant camera permission to use the barcode scanner.');
    return;
  }

  // Perform scan for QR codes
  const { barcodes } = await BarcodeScanner.scan({
    formats: [BarcodeFormat.QrCode],
  });

  // Return display value of first scanned barcode
  return barcodes[0]?.displayValue;
};

// Encapsulate permission request for camera
const requestPermissions = async () => {
  const { camera } = await BarcodeScanner.requestPermissions();

  // Consider 'limited' as acceptable permission
  return camera === 'granted' || camera === 'limited';
};