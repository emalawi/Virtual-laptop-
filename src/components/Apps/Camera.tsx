import React, { useState, useRef, useEffect } from "react";
import { Camera as CameraIcon, RotateCw, Video, VideoOff, Image as ImageIcon, Trash2, Download, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { playSound } from "@/src/lib/sounds";

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [flash, setFlash] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setIsReady(true);
      setError(null);
    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera access denied. Please check your browser permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setFlash(true);
    playSound("notify");
    setTimeout(() => setFlash(false), 150);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const photoData = canvas.toDataURL("image/png");
      setPhotos(prev => [photoData, ...prev]);
    }
  };

  const downloadPhoto = (dataUrl: string) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `zenith_capture_${Date.now()}.png`;
    link.click();
  };

  const deletePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="h-full flex flex-col bg-black text-white relative overflow-hidden">
      {/* Video Viewport */}
      <div className="flex-1 relative bg-[#050505] flex items-center justify-center">
        {error ? (
          <div className="flex flex-col items-center gap-4 text-white/40 max-w-xs text-center p-8">
            <div className="p-6 bg-white/5 rounded-full ring-1 ring-white/10 mb-2">
               <VideoOff size={32} />
            </div>
            <p className="text-sm font-medium">{error}</p>
            <button 
              onClick={startCamera}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
            >
              Retry Access
            </button>
          </div>
        ) : (
          <video 
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={cn(
              "w-full h-full object-cover transition-opacity duration-1000",
              isReady ? "opacity-100" : "opacity-0"
            )}
          />
        )}

        {/* Flash Overlay */}
        <AnimatePresence>
          {flash && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white z-50 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* HUD Overlay */}
        <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
                 <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                 Live Feed
              </div>
              <div className="flex items-center gap-4 text-white/40">
                 <Zap size={16} className="cursor-pointer hover:text-white transition-colors pointer-events-auto" />
                 <span className="text-[10px] font-mono">1080P // 60FPS</span>
              </div>
           </div>
           
           <div className="flex justify-center">
              <div className="w-12 h-1 bg-white/20 rounded-full" />
           </div>
        </div>

        {/* Gallery Sidebar (Right) */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 max-h-[60%] overflow-y-auto scrollbar-hide p-2 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/5 group">
           {photos.length === 0 ? (
             <div className="w-12 h-12 flex items-center justify-center text-white/10">
                <ImageIcon size={20} />
             </div>
           ) : (
             photos.map((photo, i) => (
               <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10 group/item cursor-pointer">
                  <img src={photo} className="w-full h-full object-cover" alt={`Capture ${i}`} />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center gap-1">
                     <button onClick={() => downloadPhoto(photo)} className="p-1 hover:text-teal-400">
                        <Download size={12} />
                     </button>
                     <button onClick={() => deletePhoto(i)} className="p-1 hover:text-red-400">
                        <Trash2 size={12} />
                     </button>
                  </div>
               </div>
             ))
           )}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="h-32 bg-[#080808] border-t border-white/5 px-12 flex items-center justify-between">
         <div className="flex items-center gap-6">
            <button className="flex flex-col items-center gap-1 text-white/40 hover:text-white transition-colors">
               <div className="p-3 bg-white/5 rounded-2xl">
                  <RotateCw size={20} />
               </div>
               <span className="text-[8px] font-bold uppercase">Switch</span>
            </button>
         </div>

         <div className="flex items-center gap-8">
            <button className="text-white/20 hover:text-white transition-colors">
               <Video size={24} />
            </button>
            <button 
              onClick={takePhoto}
              className="w-20 h-20 rounded-full border-4 border-white/10 flex items-center justify-center group active:scale-95 transition-all"
            >
               <div className="w-16 h-16 rounded-full bg-white group-hover:scale-90 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
            </button>
            <button className="text-white/20 hover:text-white transition-colors">
               <ImageIcon size={24} />
            </button>
         </div>

         <div className="w-24 flex justify-end">
             {photos.length > 0 && (
               <div className="w-12 h-12 rounded-xl border-2 border-teal-500 overflow-hidden shadow-lg shadow-teal-500/20">
                  <img src={photos[0]} className="w-full h-full object-cover" alt="Last Capture" />
               </div>
             )}
         </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
