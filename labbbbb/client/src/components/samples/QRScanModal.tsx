import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X } from "lucide-react";
import jsQR from "jsqr";

interface QRScanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: (boxId: string, hubId: string) => void;
}

export function QRScanModal({ open, onOpenChange, onVerify }: QRScanModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [activeTab, setActiveTab] = useState<"camera" | "upload" | "manual">("camera");
  const [cameraError, setCameraError] = useState<string | null>(null);

  const parseQRData = (text: string) => {
    try {
      const data = JSON.parse(text);
      return { boxId: data.boxId || "", hubId: data.hubId || "" };
    } catch {
      return { boxId: text, hubId: "" };
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    setIsScanning(true);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const scanFrame = () => {
        if (!canvasRef.current || !videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
          if (isScanning) requestAnimationFrame(scanFrame);
          return;
        }
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);

        if (code) {
          const { boxId, hubId } = parseQRData(code.data);
          onVerify(boxId, hubId);
          stopCamera();
          onOpenChange(false);
          return;
        }

        if (isScanning) {
          requestAnimationFrame(scanFrame);
        }
      };

      requestAnimationFrame(scanFrame);
    } catch (err: any) {
      console.error("Camera error:", err);
      let message = "Camera access required for scanning";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        message = "Camera permission denied. Please enable it in browser settings.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        message = "No camera found on this device.";
      } else if (err.message) {
        message = err.message;
      }
      setCameraError(message);
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);

        if (code) {
          const { boxId, hubId } = parseQRData(code.data);
          onVerify(boxId, hubId);
          onOpenChange(false);
        }
      };
      img.src = (event.target?.result as string) || "";
    };
    reader.readAsDataURL(file);
  };

  const handleManualVerify = () => {
    if (manualCode) {
      onVerify(manualCode, "");
      onOpenChange(false);
    }
  };

  useEffect(() => {
    if (open) {
      setActiveTab("camera");
      // Use a small delay to ensure DOM is ready and interaction is preserved
      const timer = setTimeout(() => {
        startCamera();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      stopCamera();
      setManualCode("");
      setCameraError(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl overflow-hidden" aria-describedby="qr-scan-description">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Scan QR Code</DialogTitle>
          <DialogDescription id="qr-scan-description">
            Verify source via camera, upload, or manual entry.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* CAMERA PREVIEW - ALWAYS FIRST */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-black flex items-center justify-center">
            {activeTab === "camera" && (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                {(cameraError || !isScanning) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white p-6 text-center">
                    <div className="space-y-4">
                      <p className="text-sm font-medium">{cameraError || "Initializing camera..."}</p>
                      {cameraError && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={startCamera}
                          className="text-white border-white hover:bg-white/20"
                        >
                          Try Again
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === "upload" && (
              <div className="w-full h-full flex items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg">
                <div className="text-center p-6">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm font-medium mb-2">Upload QR Image</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fileInputRef.current?.click()}
                    data-testid="button-select-file"
                  >
                    Select File
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "manual" && (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 p-6 space-y-4 rounded-lg">
                <div className="w-full max-w-[240px] space-y-3">
                  <p className="text-sm font-medium text-center">Manual Entry</p>
                  <Input
                    placeholder="Enter Box/Hub ID"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="bg-white"
                    data-testid="input-manual-qr"
                  />
                  <Button onClick={handleManualVerify} className="w-full" data-testid="button-verify-manual">
                    Verify Code
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={activeTab === "upload" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                stopCamera();
                setActiveTab("upload");
              }}
              className="text-xs h-9"
              data-testid="tab-upload"
            >
              Upload
            </Button>
            <Button
              type="button"
              variant={activeTab === "manual" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                stopCamera();
                setActiveTab("manual");
              }}
              className="text-xs h-9"
              data-testid="tab-manual"
            >
              Manual
            </Button>
          </div>
          
          {activeTab !== "camera" && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setActiveTab("camera");
                startCamera();
              }}
              className="w-full text-xs h-9"
              data-testid="tab-camera-back"
            >
              Back to Camera
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
