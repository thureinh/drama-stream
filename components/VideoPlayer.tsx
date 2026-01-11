import React, { useState, useRef, useEffect } from 'react';
import { Video } from '../types';
import { 
  X, Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Maximize2, 
  Settings, Info, Sparkles, Tag
} from 'lucide-react';
import { getSmartSuggestions } from '../services/geminiService';

interface VideoPlayerProps {
  video: Video;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const handleTimeUpdate = () => {
      setProgress((v.currentTime / v.duration) * 100);
    };

    v.addEventListener('timeupdate', handleTimeUpdate);
    return () => v.removeEventListener('timeupdate', handleTimeUpdate);
  }, []);

  const togglePlay = () => {
    if (videoRef.current?.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) videoRef.current.muted = !isMuted;
  };

  const handleFullscreen = () => {
    if (playerContainerRef.current?.requestFullscreen) {
      playerContainerRef.current.requestFullscreen();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = window.setTimeout(() => setShowControls(false), 3000);
  };

  const handleAiDeepDive = async () => {
    setIsAnalyzing(true);
    const result = await getSmartSuggestions(video);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div 
      ref={playerContainerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden"
    >
      {/* Video Content - Optimized for 9:16 portrait */}
      <video
        ref={videoRef}
        src={video.url}
        autoPlay
        playsInline
        className="h-full w-auto max-w-full aspect-[9/16] object-contain shadow-2xl"
        onClick={togglePlay}
      />

      {/* Overlay UI */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Top Bar */}
        <div className="absolute top-0 inset-x-0 p-6 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-white drop-shadow-md">{video.title}</h2>
            <p className="text-zinc-400 text-sm flex items-center gap-2">
              <Tag className="w-3 h-3" /> {video.category} • {video.tags.join(', ')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleAiDeepDive}
              disabled={isAnalyzing}
              className="p-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-50 flex items-center gap-2"
              title="AI Analysis"
            >
              <Sparkles className={`w-5 h-5 ${isAnalyzing ? 'animate-pulse' : ''}`} />
              <span className="text-xs font-semibold pr-1">Analyze</span>
            </button>
            <button onClick={onClose} className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Center Controls (Mobile focus) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-12 pointer-events-auto">
            <button onClick={() => skip(-10)} className="p-4 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all">
              <RotateCcw className="w-8 h-8" />
            </button>
            <button onClick={togglePlay} className="p-8 rounded-full bg-white text-black hover:scale-110 transition-transform">
              {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-1" />}
            </button>
            <button onClick={() => skip(10)} className="p-4 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all">
              <RotateCw className="w-8 h-8" />
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-white/20 rounded-full mb-6 cursor-pointer group relative">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all relative" 
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full scale-0 group-hover:scale-100 transition-transform border-4 border-blue-500" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button onClick={toggleMute} className="text-white hover:text-blue-400 transition-colors">
                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>
              <div className="text-zinc-300 text-sm font-mono tracking-tighter">
                {videoRef.current ? 
                  `${Math.floor(videoRef.current.currentTime / 60)}:${String(Math.floor(videoRef.current.currentTime % 60)).padStart(2, '0')}` : '0:00'}
                <span className="mx-2 text-zinc-600">/</span>
                {video.duration}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-white hover:text-blue-400 transition-colors">
                <Settings className="w-6 h-6" />
              </button>
              <button onClick={handleFullscreen} className="text-white hover:text-blue-400 transition-colors">
                <Maximize2 className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* AI Analysis Panel */}
        {aiAnalysis && (
          <div className="absolute right-6 top-24 bottom-24 w-80 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold flex items-center gap-2 text-blue-400">
                <Sparkles className="w-4 h-4" /> AI Insight
              </h3>
              <button onClick={() => setAiAnalysis(null)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest block mb-2">Refined Category</label>
                <div className="text-zinc-100 bg-zinc-800/50 px-3 py-2 rounded-lg border border-zinc-700">
                  {aiAnalysis.refinedCategory}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest block mb-2">Smart Tags</label>
                <div className="flex flex-wrap gap-2">
                  {aiAnalysis.suggestedTags.map((tag: string) => (
                    <span key={tag} className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full border border-blue-500/20">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest block mb-2">AI Summary</label>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  {aiAnalysis.aiDescription}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;