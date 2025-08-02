const QRCode = require('qrcode');

async function generateQRCode(text, options = {}) {
  try {
    const defaultOptions = {
      type: 'svg',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M',
      ...options
    };

    const qrCodeSVG = await QRCode.toString(text, defaultOptions);
    return qrCodeSVG;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

module.exports = {
  generateQRCode
};