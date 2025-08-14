import { useEffect, useState } from "react";
import { FaClock, FaInfoCircle, FaPlay, FaYoutube } from "react-icons/fa";

// Video data structure
interface VideoData {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  category: string;
  thumbnail: string;
  features: string[];
  tags: string[];
}

interface YouTubeVideoInfo {
  duration: string;
  title: string;
  thumbnail: string;
}

const VideoShowcase = () => {
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [videoInfo, setVideoInfo] = useState<{ [key: string]: YouTubeVideoInfo }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  // Video data - replace with your actual videos
  const videosData: VideoData[] = [
    {
      id: "1",
      title: "TrinetraGuard: AI-Powered Pilgrimage Management",
      description: "Comprehensive overview of our advanced AI system that transforms crowd management, enhances security, and ensures seamless pilgrimage experiences.",
      youtubeUrl: "https://youtu.be/8D4foXbkdSA?si=Poy5I-lQ4SmKE9de",
      category: "overview",
      thumbnail: "https://img.youtube.com/vi/8D4foXbkdSA/maxresdefault.jpg",
      features: ["Real-time Monitoring", "AI Face Detection", "Emergency Response"],
      tags: ["AI", "Security", "Crowd Management"]
    },
    {
      id: "2",
      title: "Face Detection Technology Demo",
      description: "Deep dive into our cutting-edge face detection algorithms and how they enhance security during large gatherings.",
      youtubeUrl: "https://youtu.be/YOUR_VIDEO_URL_2",
      category: "technology",
      thumbnail: "https://img.youtube.com/vi/YOUR_VIDEO_ID_2/maxresdefault.jpg",
      features: ["Advanced Recognition", "Real-time Processing", "High Accuracy"],
      tags: ["Face Detection", "AI", "Technology"]
    },
    {
      id: "3",
      title: "Emergency Response System Walkthrough",
      description: "See how our emergency response system works in real-time, providing instant alerts and coordinated responses.",
      youtubeUrl: "https://youtu.be/YOUR_VIDEO_URL_3",
      category: "features",
      thumbnail: "https://img.youtube.com/vi/YOUR_VIDEO_ID_3/maxresdefault.jpg",
      features: ["Instant Alerts", "Coordinated Response", "Safety Protocols"],
      tags: ["Emergency", "Safety", "Response"]
    },
    {
      id: "4",
      title: "Crowd Management Analytics",
      description: "Explore our advanced analytics dashboard and how it helps manage large crowds efficiently and safely.",
      youtubeUrl: "https://youtu.be/YOUR_VIDEO_URL_4",
      category: "analytics",
      thumbnail: "https://img.youtube.com/vi/YOUR_VIDEO_ID_4/maxresdefault.jpg",
      features: ["Data Analytics", "Predictive Modeling", "Real-time Insights"],
      tags: ["Analytics", "Data", "Insights"]
    }
  ];

  // Categories for filtering
  const categories = [
    { id: "all", name: "All Videos", count: videosData.length },
    { id: "overview", name: "Overview", count: videosData.filter(v => v.category === "overview").length },
    { id: "technology", name: "Technology", count: videosData.filter(v => v.category === "technology").length },
    { id: "features", name: "Features", count: videosData.filter(v => v.category === "features").length },
    { id: "analytics", name: "Analytics", count: videosData.filter(v => v.category === "analytics").length }
  ];

  // Filter videos based on active category
  const filteredVideos = activeCategory === "all" 
    ? videosData 
    : videosData.filter(video => video.category === activeCategory);

  // Extract YouTube video ID from URL
  const extractYouTubeId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };

  // Get YouTube thumbnail URL
  const getYouTubeThumbnail = (youtubeUrl: string): string => {
    const videoId = extractYouTubeId(youtubeUrl);
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  // Fetch video duration from YouTube (simulated for now)
  const fetchVideoInfo = async (youtubeUrl: string) => {
    const videoId = extractYouTubeId(youtubeUrl);
    if (!videoId || videoInfo[videoId] || loading[videoId]) return;
    
    setLoading(prev => ({ ...prev, [videoId]: true }));
    
    try {
      // Simulated API call - replace with actual backend API
      // For now, we'll use a timeout to simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace with actual API response
      const mockDurations: { [key: string]: string } = {
        "8D4foXbkdSA": "5:32",
        "YOUR_VIDEO_ID_2": "3:45",
        "YOUR_VIDEO_ID_3": "4:12",
        "YOUR_VIDEO_ID_4": "6:18"
      };
      
      setVideoInfo(prev => ({
        ...prev,
        [videoId]: {
          duration: mockDurations[videoId] || "0:00",
          title: "",
          thumbnail: getYouTubeThumbnail(youtubeUrl)
        }
      }));
    } catch (error) {
      console.error("Error fetching video info:", error);
      setVideoInfo(prev => ({
        ...prev,
        [videoId]: {
          duration: "0:00",
          title: "",
          thumbnail: getYouTubeThumbnail(youtubeUrl)
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [videoId]: false }));
    }
  };

  // Set default selected video and fetch info
  useEffect(() => {
    if (!selectedVideo && filteredVideos.length > 0) {
      const firstVideo = filteredVideos[0];
      setSelectedVideo(firstVideo);
      fetchVideoInfo(firstVideo.youtubeUrl);
    }
  }, [filteredVideos, selectedVideo]);

  const playVideo = () => {
    setIsVideoPlaying(true);
  };

  const resetVideo = () => {
    setIsVideoPlaying(false);
  };

  const selectVideo = (video: VideoData) => {
    setSelectedVideo(video);
    setIsVideoPlaying(false);
    fetchVideoInfo(video.youtubeUrl);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "overview": return "from-blue-500 to-blue-600";
      case "technology": return "from-green-500 to-green-600";
      case "features": return "from-purple-500 to-purple-600";
      case "analytics": return "from-orange-500 to-orange-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const formatDuration = (youtubeUrl: string) => {
    const videoId = extractYouTubeId(youtubeUrl);
    const duration = videoInfo[videoId]?.duration;
    if (!duration || duration === "0:00") return "Loading...";
    return duration;
  };

  const getVideoId = (youtubeUrl: string) => {
    return extractYouTubeId(youtubeUrl);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,119,48,0.1),transparent_50%)]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-full px-5 py-2 mb-4">
            <FaYoutube className="w-4 h-4 text-orange-400" />
            <span className="text-orange-300 font-semibold text-sm">Video Library</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Explore TrinetraGuard
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Discover our comprehensive video library showcasing the power of AI-driven pilgrimage management.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 border ${
                activeCategory === category.id
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-500 shadow-lg"
                  : "bg-gray-800/50 text-gray-300 border-gray-600/50 hover:bg-gray-700/50 hover:border-gray-500/50"
              }`}
            >
              {category.name}
              <span className="ml-2 px-2 py-0.5 bg-gray-700/50 rounded-full text-xs">
                {category.count}
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video List */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl border border-gray-600/50 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <FaPlay className="w-4 h-4 text-orange-400" />
                Available Videos
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredVideos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => selectVideo(video)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
                      selectedVideo?.id === video.id
                        ? "bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-orange-500/50 shadow-lg"
                        : "bg-gray-800/30 border-gray-600/30 hover:bg-gray-700/30 hover:border-gray-500/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FaPlay className="w-4 h-4 text-orange-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium text-sm mb-2 line-clamp-2">
                          {video.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                          <div className="flex items-center gap-1">
                            <FaClock className="w-3 h-3" />
                            <span>{formatDuration(video.youtubeUrl)}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {video.tags.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Video Player */}
          <div className="lg:col-span-2">
            {selectedVideo && (
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-xl border border-gray-600/50">
                {/* Video Player */}
                <div className="aspect-video bg-black relative">
                  {isVideoPlaying ? (
                    <>
                      <iframe
                        src={`https://www.youtube.com/embed/${getVideoId(selectedVideo.youtubeUrl)}?autoplay=1&rel=0&modestbranding=1&controls=0&showinfo=0&disablekb=1&fs=0&iv_load_policy=3&cc_load_policy=0&playsinline=1`}
                        title={selectedVideo.title}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                      {/* Reset Button */}
                      <button
                        onClick={resetVideo}
                        className="absolute top-3 right-3 w-8 h-8 bg-gray-800/80 hover:bg-gray-700/80 text-white rounded-lg flex items-center justify-center transition-all duration-300 backdrop-blur-sm border border-gray-600/50"
                        title="Reset Video"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <div className="relative w-full h-full">
                      {/* Video Thumbnail */}
                      <img
                        src={getYouTubeThumbnail(selectedVideo.youtubeUrl)}
                        alt={selectedVideo.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect width='100%25' height='100%25' fill='%23374151'/%3E%3C/svg%3E";
                        }}
                      />
                      
                      
                      {/* Single Play Button */}
                      <button 
                        onClick={playVideo}
                        className="absolute inset-0 w-full h-full flex items-center justify-center group"
                      >
                        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-xl transform transition-all duration-300 group-hover:scale-110">
                          <FaPlay className="w-8 h-8 text-white ml-1" />
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColor(selectedVideo.category)} text-white`}>
                          {selectedVideo.category.charAt(0).toUpperCase() + selectedVideo.category.slice(1)}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <FaClock className="w-3 h-3" />
                          <span>{formatDuration(selectedVideo.youtubeUrl)}</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {selectedVideo.title}
                      </h3>
                      <p className="text-gray-300 leading-relaxed mb-3 text-sm">
                        {selectedVideo.description}
                      </p>
                    </div>
                    <div className="ml-4">
                      {!isVideoPlaying && (
                        <button 
                          onClick={playVideo}
                          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 text-sm"
                        >
                          <FaPlay className="w-4 h-4" />
                          Watch Video
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-gray-600/50">
                    {selectedVideo.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-lg border border-gray-600/30">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span className="text-white font-medium text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 pt-4">
                    {selectedVideo.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-full border border-gray-600/50"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600/50 rounded-xl px-6 py-4">
            <FaInfoCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
            <div className="text-left">
              <p className="text-gray-300 text-sm">
                Want to learn more? Check out our{" "}
                <a href="#documentation" className="text-orange-400 hover:text-orange-300 transition-colors duration-300 font-semibold">
                  documentation
                </a>{" "}
                or{" "}
                <a href="#" className="text-orange-400 hover:text-orange-300 transition-colors duration-300 font-semibold">
                  contact our team
                </a>{" "}
                for detailed information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoShowcase;
