"use client";

import { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import { X, Check, Image as ImageIcon, Zap, UploadCloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

interface ImageEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageSrc: string | null;
    onSave: (file: File, useCloudinaryAI: boolean) => void;
}

export default function ImageEditorModal({ isOpen, onClose, imageSrc, onSave }: ImageEditorModalProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    // Background Removal State
    const [useCloudinaryAI, setUseCloudinaryAI] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        setIsProcessing(true);
        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, brightness, contrast);
            const file = new File([croppedBlob], `edited_portrait_${Date.now()}.png`, { type: 'image/png' });
            onSave(file, useCloudinaryAI);
        } catch (e) {
            console.error(e);
            toast.error("Failed to generate edited image.");
        } finally {
            setIsProcessing(false);
        }
    };


    if (!isOpen || !imageSrc) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-[#050505]/95 backdrop-blur-md"
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className="w-full max-w-4xl bg-[#0a0a0a] border border-zinc-900 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl"
                >
                    {/* Crop Area */}
                    <div className="relative w-full h-[300px] md:h-[500px] md:w-2/3 bg-black flex-shrink-0" style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }}>
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={4 / 5}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                            showGrid={false}
                            style={{
                                containerStyle: { background: 'transparent' },
                                mediaStyle: { transition: 'none' }
                            }}
                        />
                    </div>

                    {/* Controls sidebar */}
                    <div className="w-full md:w-1/3 p-6 sm:p-8 flex flex-col gap-8 bg-[#0b0b0b] border-t md:border-t-0 md:border-l border-zinc-900 overflow-y-auto">

                        <div className="flex justify-between items-center">
                            <h3 className="text-white font-black tracking-tight flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-cyan-500" /> Image Studio
                            </h3>
                            <button onClick={onClose} disabled={isProcessing} className="p-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-zinc-900">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6 flex-1">
                            {/* Zoom Control */}
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                    <span>Zoom</span>
                                    <span className="text-zinc-500">{zoom.toFixed(1)}x</span>
                                </div>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                />
                            </div>

                            {/* Brightness Control */}
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                    <span>Brightness</span>
                                    <span className="text-zinc-500">{brightness}%</span>
                                </div>
                                <input
                                    type="range"
                                    value={brightness}
                                    min={50}
                                    max={200}
                                    onChange={(e) => setBrightness(Number(e.target.value))}
                                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                />
                            </div>

                            {/* Contrast Control */}
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                    <span>Contrast</span>
                                    <span className="text-zinc-500">{contrast}%</span>
                                </div>
                                <input
                                    type="range"
                                    value={contrast}
                                    min={50}
                                    max={200}
                                    onChange={(e) => setContrast(Number(e.target.value))}
                                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                />
                            </div>
                        </div>

                        {/* Cloudinary AI Checkbox */}
                        <div className="pt-4 border-t border-zinc-900">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${useCloudinaryAI ? "bg-cyan-500 border-cyan-500 text-black" : "bg-zinc-900 border-zinc-700 text-transparent"}`}>
                                    <Check className="w-3 h-3" />
                                </div>
                                <input
                                    type="checkbox"
                                    checked={useCloudinaryAI}
                                    onChange={(e) => setUseCloudinaryAI(e.target.checked)}
                                    className="hidden"
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">Cloudinary AI Removal</span>
                                    <span className="text-[10px] text-zinc-500 font-mono">Remove background on apply</span>
                                </div>
                            </label>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3 pt-6 border-t border-zinc-900">
                            <button
                                onClick={handleSave}
                                disabled={isProcessing}
                                className="w-full py-4 rounded-xl bg-white text-black font-black flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50"
                            >
                                <Check className="w-5 h-5" /> Save & Apply
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}


// --- Helper to extract the cropped canvas ---
async function getCroppedImg(
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number },
    brightness: number,
    contrast: number
): Promise<Blob> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('No 2d context');
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Apply filters to context before drawing
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Canvas is empty'));
                return;
            }
            resolve(blob);
        }, 'image/png');
    });
}

function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid CORS issues on export
        image.src = url;
    });
}
