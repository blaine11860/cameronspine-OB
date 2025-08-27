import QRCode from 'qrcode';

export async function generateQRCode(text: string, options: any = {}) {
  try {
    console.log('Generating QR code for:', text);
    
    const defaultOptions = {
      type: 'svg',
      width: 300,
      margin: 2,
      color: {
        dark: options.color?.dark || '#BE185D', // Rose-deep color
        light: options.color?.light || '#FFFFFF'
      },
      errorCorrectionLevel: 'M',
      ...options
    };

    const qrCodeSVG = await QRCode.toString(text, defaultOptions);
    console.log('QR code generated successfully');
    return qrCodeSVG;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}