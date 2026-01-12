"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Video } from '../../../types';
import VideoPlayer from '../../../components/VideoPlayer';
import { ArrowLeft, Play, Clock, Tag, Share2, Heart, Info, Calendar, HardDrive } from 'lucide-react';
import { useTheme } from '../../../components/ThemeProvider';

const VideoDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const [video, setVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPlayer, setShowPlayer] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        async function fetchVideo() {
            try {
                // In a real app, we'd fetch specific video. Here we filter from the list.
                const res = await fetch('/api/videos');
                const videos: Video[] = await res.json();
                const found = videos.find(v => v.id === id);
                if (found) {
                    setVideo(found);
                } else {
                    // Handle not found
                    router.push('/');
                }
            } catch (error) {
                console.error("Error fetching video", error);
            } finally {
                setLoading(false);
            }
        }
        if (id) {
            fetchVideo();
        }
    }, [id, router]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (!video) return null;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans">
            {/* Back Navigation */}
            <div className="fixed top-6 left-6 z-50">
                <button
                    onClick={() => router.back()}
                    className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all shadow-lg group"
                >
                    <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Hero Section with Backdrop */}
            {/* Hero Section with Backdrop */}
            <div className="relative min-h-[70vh] w-full overflow-hidden flex items-center">
                <div className="absolute inset-0">
                    <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover blur-sm scale-105 opacity-50 dark:opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 dark:from-black via-zinc-50/20 dark:via-black/20 to-zinc-900/40" />
                </div>

                <div className="relative w-full max-w-7xl mx-auto px-6 py-24 md:py-32">
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 w-full">
                        {/* Main Thumbnail Card */}
                        <div className="relative shrink-0 w-64 md:w-80 aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/20 rotate-1 hover:rotate-0 transition-transform duration-500">
                            <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>

                        {/* Info Block */}
                        <div className="flex-1 text-center md:text-left z-10">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                                <span className="px-3 py-1 bg-red-600/90 text-white text-xs font-bold uppercase tracking-wider rounded-md backdrop-blur-md shadow-lg shadow-red-500/20">
                                    {video.category}
                                </span>
                                {video.tags.slice(0, 3).map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-white/10 border border-white/10 text-white text-xs font-medium rounded-md backdrop-blur-md">
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6 drop-shadow-xl leading-tight">
                                {video.title}
                            </h1>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-zinc-300 mb-8 font-medium">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-red-400" />
                                    <span>{video.duration}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-red-400" />
                                    <span>{new Date(video.uploadedAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <HardDrive className="w-5 h-5 text-red-400" />
                                    <span>{(video.size / 1024 / 1024).toFixed(1)} MB</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                <button
                                    onClick={() => setShowPlayer(true)}
                                    className="flex items-center gap-3 px-8 py-4 bg-white text-black hover:bg-zinc-200 font-bold rounded-xl transition-all hover:scale-105 shadow-xl shadow-white/10"
                                >
                                    <Play className="w-6 h-6 fill-current" />
                                    Watch Now
                                </button>
                                <button className="p-4 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-md">
                                    <Share2 className="w-6 h-6" />
                                </button>
                                <button className="p-4 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-md">
                                    <Heart className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-6 py-12 -mt-20 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Summary */}
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
                            <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                                <Info className="w-5 h-5 text-red-500" />
                                Plot Summary
                            </h3>
                            <div className="prose dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                {video.plot_summary ? (
                                    <p>{video.plot_summary}</p>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 border-dashed">
                                        <Info className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mb-2" />
                                        <p className="text-zinc-400 dark:text-zinc-500 italic">
                                            Plot summary not available for this video yet.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Details Sidebar */}
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
                            <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-zinc-500">Video Details</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800">
                                    <span className="text-zinc-500">Format</span>
                                    <span className="font-medium">MP4</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800">
                                    <span className="text-zinc-500">Resolution</span>
                                    <span className="font-medium">1080p (Vertical)</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800">
                                    <span className="text-zinc-500">Audio</span>
                                    <span className="font-medium">Stereo AAC</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800">
                                    <span className="text-zinc-500">License</span>
                                    <span className="font-medium">Standard</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Video Player Overlay */}
            {showPlayer && (
                <VideoPlayer
                    video={video}
                    onClose={() => setShowPlayer(false)}
                />
            )}
        </div>
    );
};

export default VideoDetailPage;
