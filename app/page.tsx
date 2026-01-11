"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
    Cloud, Search, LayoutGrid, Filter, SortAsc,
    Settings, FolderOpen, Star, Clock, Info, Github,
    Menu, X as CloseIcon, Tag, Flame, PlayCircle, Compass, Users,
    ArrowUp, ArrowDown
} from 'lucide-react';
import { Video, SortOption } from '../types';
import VideoCard from '../components/VideoCard';
import VideoPlayer from '../components/VideoPlayer';

const Page: React.FC = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [sortBy, setSortBy] = useState<SortOption>(SortOption.NEWEST);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Fetch videos from API
    useEffect(() => {
        async function fetchVideos() {
            try {
                const res = await fetch('/api/videos');
                const data = await res.json();
                setVideos(data);
            } catch (error) {
                console.error('Failed to fetch videos:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchVideos();
    }, []);

    // Extract unique categories and tags from fetched videos
    const categories = useMemo(() => ['All', ...Array.from(new Set(videos.map(v => v.category)))], [videos]);
    const allTags = useMemo(() => Array.from(new Set(videos.flatMap(v => v.tags))), [videos]);

    const filteredVideos = useMemo(() => {
        let result = videos.filter(video => {
            const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCategory = selectedCategory === 'All' || video.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });

        return result.sort((a, b) => {
            switch (sortBy) {
                case SortOption.NEWEST:
                    return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
                case SortOption.OLDEST:
                    return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
                case SortOption.NAME_ASC:
                    return a.title.localeCompare(b.title);
                case SortOption.NAME_DESC:
                    return b.title.localeCompare(a.title);
                case SortOption.SIZE:
                    return b.size - a.size;
                default:
                    return 0;
            }
        });
    }, [videos, searchQuery, selectedCategory, sortBy]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black text-zinc-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-black text-zinc-100">
            {/* Sidebar - Discovery Focus */}
            <aside className={`fixed lg:relative inset-y-0 left-0 z-40 w-64 bg-zinc-950 border-r border-zinc-900 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="flex flex-col h-full">
                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
                                <PlayCircle className="text-white w-6 h-6" />
                            </div>
                            <h1 className="text-lg font-bold tracking-tight">WasabiStream</h1>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                        <div className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase px-4 py-3">Explore</div>
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 bg-red-500/10 rounded-lg font-medium">
                            <Compass className="w-4 h-4" /> Discover
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-lg transition-all group">
                            <Flame className="w-4 h-4 group-hover:text-red-500" /> Trending
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-lg transition-all">
                            <Users className="w-4 h-4" /> Following
                        </button>

                        <div className="pt-6">
                            <div className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase px-4 py-3">Library</div>
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-lg transition-all">
                                <Star className="w-4 h-4" /> Favorites
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-lg transition-all">
                                <Clock className="w-4 h-4" /> History
                            </button>
                        </div>

                        <div className="pt-6">
                            <div className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase px-4 py-3">Genres</div>
                            <div className="space-y-1">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-all ${selectedCategory === cat ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 pb-6">
                            <div className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase px-4 py-3">Popular Tags</div>
                            <div className="flex flex-wrap gap-2 px-4 py-2">
                                {allTags.slice(0, 15).map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => setSearchQuery(tag)}
                                        className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-[10px] rounded-md text-zinc-400 hover:border-zinc-700 transition-colors"
                                    >
                                        #{tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </nav>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-black/40 backdrop-blur-md border-b border-zinc-900 flex items-center justify-between px-6 shrink-0 z-30">
                    <div className="flex items-center gap-4 flex-1 max-w-2xl">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-zinc-400 hover:text-white">
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search for videos, creators, or genres..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 ml-6">
                        <div className="flex items-center bg-zinc-900 rounded-xl border border-zinc-800 p-1">
                            {Object.values(SortOption).map(option => {
                                let label: React.ReactNode = option.split(' ')[0];
                                if (option === SortOption.NAME_ASC) {
                                    label = <span className="flex items-center gap-1">Name <ArrowDown className="w-3 h-3" /></span>;
                                } else if (option === SortOption.NAME_DESC) {
                                    label = <span className="flex items-center gap-1">Name <ArrowUp className="w-3 h-3" /></span>;
                                } else if (option === SortOption.SIZE) {
                                    label = "Size";
                                }

                                return (
                                    <button
                                        key={option}
                                        onClick={() => setSortBy(option)}
                                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${sortBy === option ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-400'}`}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                        <button className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors">
                            <Settings className="w-5 h-5" />
                        </button>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center text-sm font-bold border-2 border-black">
                            US
                        </div>
                    </div>
                </header>

                {/* Streaming Grid */}
                <section className="flex-1 overflow-y-auto p-6 md:p-8 bg-zinc-950/50">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">
                                    {selectedCategory === 'All' ? 'Discover New Clips' : `${selectedCategory} Videos`}
                                </h2>
                                <p className="text-zinc-500 text-sm">Curated selection of mobile-first vertical content</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-zinc-500">View:</span>
                                <button className="p-2 bg-zinc-800 text-red-500 rounded-lg"><LayoutGrid className="w-4 h-4" /></button>
                                <button className="p-2 text-zinc-500"><Filter className="w-4 h-4" /></button>
                            </div>
                        </div>

                        {filteredVideos.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {filteredVideos.map(video => (
                                    <VideoCard
                                        key={video.id}
                                        video={video}
                                        onSelect={setSelectedVideo}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 text-center">
                                <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-zinc-800">
                                    <Search className="w-8 h-8 text-zinc-700" />
                                </div>
                                <h3 className="text-xl font-bold text-zinc-300 mb-2">No videos found</h3>
                                <p className="text-zinc-500 max-w-xs">We couldn't find any clips matching your request. Try exploring another genre.</p>
                                <button
                                    onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                                    className="mt-6 text-red-500 hover:text-red-400 font-medium"
                                >
                                    Reset Discovery
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-30 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Fullscreen Video Player */}
            {selectedVideo && (
                <VideoPlayer
                    video={selectedVideo}
                    onClose={() => setSelectedVideo(null)}
                />
            )}
        </div>
    );
};

export default Page;
