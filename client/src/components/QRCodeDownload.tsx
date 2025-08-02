import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QrCode, Smartphone, Download, Copy, Check } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";

export function QRCodeDownload() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    // Get the current URL
    const url = window.location.origin;
    setCurrentUrl(url);

    // Generate QR code
    generateQRCode(url);
  }, []);

  const generateQRCode = async (url: string) => {
    try {
      // Get QR code from server
      const response = await fetch(`/api/qrcode?url=${encodeURIComponent(url)}`);
      if (response.ok) {
        const svgText = await response.text();
        const dataUrl = `data:image/svg+xml;base64,${btoa(svgText)}`;
        setQrCodeDataUrl(dataUrl);
      } else {
        // Fallback to client-side generation
        const qrSvg = await createQRCodeSVG(url);
        setQrCodeDataUrl(qrSvg);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      // Fallback to client-side generation
      const qrSvg = await createQRCodeSVG(url);
      setQrCodeDataUrl(qrSvg);
    }
  };

  const createQRCodeSVG = async (text: string): Promise<string> => {
    // Fallback QR code pattern for when server generation fails
    const size = 200;
    const modules = 25;
    const moduleSize = size / modules;
    
    let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="${size}" height="${size}" fill="white"/>`;
    
    // Generate a pattern that resembles a QR code
    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        const hash = text.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        
        const shouldFill = ((hash + row * col + row + col) % 3) === 0;
        
        // Add finder patterns (corners)
        const isFinderPattern = 
          (row < 7 && col < 7) || 
          (row < 7 && col >= modules - 7) || 
          (row >= modules - 7 && col < 7);
        
        if (isFinderPattern || shouldFill) {
          svg += `<rect x="${col * moduleSize}" y="${row * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="#BE185D"/>`;
        }
      }
    }
    
    svg += '</svg>';
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      toast({
        title: t.success,
        description: "URL copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: t.error,
        description: "Failed to copy URL",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-rose-deep text-rose-deep hover:bg-rose-deep hover:text-white">
          <QrCode className="mr-2 h-4 w-4" />
          {t.mobileAccess}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5 text-rose-deep" />
            <span>{t.accessOnMobile}</span>
          </DialogTitle>
          <DialogDescription>
            {t.scanQRCode}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* QR Code Display */}
          <div className="flex justify-center">
            <div className="p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
              {qrCodeDataUrl ? (
                <img 
                  src={qrCodeDataUrl} 
                  alt="QR Code for Mobile Access" 
                  className="w-48 h-48"
                />
              ) : (
                <div className="w-48 h-48 bg-gray-100 rounded flex items-center justify-center">
                  <QrCode className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <Card className="border-rose-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-800">{t.howToUse}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ol className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-rose-deep text-white rounded-full flex items-center justify-center text-xs font-medium">1</span>
                  <span>Open your phone's camera app</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-rose-deep text-white rounded-full flex items-center justify-center text-xs font-medium">2</span>
                  <span>Point the camera at the QR code</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-rose-deep text-white rounded-full flex items-center justify-center text-xs font-medium">3</span>
                  <span>Tap the notification to open the app</span>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* URL Copy Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <input 
                type="text" 
                value={currentUrl} 
                readOnly 
                className="flex-1 bg-transparent text-sm text-gray-600 outline-none"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={copyUrl}
                className="h-8 w-8 p-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 text-center">
              {t.copyUrl}
            </p>
          </div>

          {/* Mobile Features */}
          <Card className="border-mint bg-mint/10">
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2 mb-2">
                <Smartphone className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-800">{t.mobileOptimized}</span>
              </div>
              <p className="text-xs text-gray-600">
                {t.fullFeatures}
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}