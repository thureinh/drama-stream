
import React from 'react';
import { Video } from '../types';
import { Play, Clock, Tag } from 'lucide-react';

interface VideoCardProps {
  video: Video;
  onSelect: (video: Video) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect(video)}
      className="group relative flex flex-col cursor-pointer bg-zinc-900/50 rounded-xl overflow-hidden border border-zinc-800 hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Thumbnail Container (Portrait 9:16) */}
      <div className="relative aspect-[9/16] overflow-hidden">
        <img 
          src={video.thumbnail} 
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-blue-600 p-4 rounded-full shadow-lg shadow-blue-500/20">
            <Play className="w-8 h-8 fill-white text-white" />
          </div>
        </div>
        <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap pointer-events-none">
          {video.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] font-semibold bg-white/10 backdrop-blur-md px-2 py-0.5 rounded text-zinc-100 uppercase tracking-wider">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-zinc-100 truncate mb-2 group-hover:text-blue-400 transition-colors">
          {video.title}
        </h3>
        <div className="flex items-center justify-between text-[11px] text-zinc-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{new Date(video.uploadedAt).toLocaleDateString()}</span>
          </div>
          <div className="font-mono bg-zinc-800 px-1.5 rounded uppercase">
            {video.duration}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
