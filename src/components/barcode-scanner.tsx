"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { lookupBarcode } from "@/lib/barcode-lookup";

interface BarcodeScannerProps {
  onResult: (name: string) => void;
  onClose: () => void;
}

type ScanStatus = "scanning" | "looking-up" | "not-found" | "error";

export function BarcodeScanner({ onResult, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<import("@zxing/browser").BrowserMultiFormatReader | null>(null);
  const [status, setStatus] = useState<ScanStatus>("scanning");
  const scanningRef = useRef(true);

  useEffect(() => {
    let controls: { stop: () => void } | null = null;

    async function startScanner() {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      try {
        controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current!,
          async (result, err) => {
            if (!result || !scanningRef.current) return;
            if (err) return;

            scanningRef.current = false;
            setStatus("looking-up");

            const barcode = result.getText();
            const name = await lookupBarcode(barcode);

            if (name) {
              controls?.stop();
              onResult(name);
            } else {
              setStatus("not-found");
              // Resume scanning after 2s
              setTimeout(() => {
                if (scanningRef.current === false) {
                  scanningRef.current = true;
                  setStatus("scanning");
                }
              }, 2000);
            }
          }
        );
      } catch {
        setStatus("error");
      }
    }

    startScanner();

    return () => {
      scanningRef.current = false;
      controls?.stop();
      // Stop all camera tracks
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [onResult]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 text-white"
      >
        <X size={20} />
      </button>

      {/* Camera feed */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        playsInline
      />

      {/* Viewfinder overlay */}
      <div className="relative flex-1 flex flex-col items-center justify-center">
        <div className="relative w-64 h-40">
          {/* Corner brackets */}
          <span className="absolute top-0 left-0 w-7 h-7 border-t-[3px] border-l-[3px] border-white rounded-tl-sm" />
          <span className="absolute top-0 right-0 w-7 h-7 border-t-[3px] border-r-[3px] border-white rounded-tr-sm" />
          <span className="absolute bottom-0 left-0 w-7 h-7 border-b-[3px] border-l-[3px] border-white rounded-bl-sm" />
          <span className="absolute bottom-0 right-0 w-7 h-7 border-b-[3px] border-r-[3px] border-white rounded-br-sm" />

          {/* Scan line (animates only while scanning) */}
          {status === "scanning" && (
            <div className="absolute inset-x-0 top-0 h-0.5 bg-white/80 animate-scan" />
          )}
        </div>

        {/* Status message */}
        <div className="mt-6 px-4 py-2 rounded-full bg-black/60 text-white text-sm font-medium">
          {status === "scanning" && "Point at a barcode"}
          {status === "looking-up" && "Looking up…"}
          {status === "not-found" && "Product not found — try again"}
          {status === "error" && "Camera unavailable"}
        </div>
      </div>
    </div>
  );
}
