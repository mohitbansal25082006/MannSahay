'use client';

import { useState, useRef, useEffect } from 'react';
import { Resource, ResourceType } from '@/types';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
  RotateCcw,
  Download,
  ExternalLink,
} from 'lucide-react';

interface ResourcePlayerProps {
  resource: Resource;
}

export default function ResourcePlayer({ resource }: ResourcePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const mediaRef = resource.type === ResourceType.VIDEO ? videoRef : audioRef;

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const setMediaData = () => {
      setDuration(media.duration);
      setCurrentTime(media.currentTime);
    };

    const updateTime = () => setCurrentTime(media.currentTime);

    media.addEventListener('loadedmetadata', setMediaData);
    media.addEventListener('timeupdate', updateTime);

    return () => {
      media.removeEventListener('loadedmetadata', setMediaData);
      media.removeEventListener('timeupdate', updateTime);
    };
  }, [resource.type]);

  const togglePlay = () => {
    const media = mediaRef.current;
    if (!media) return;

    if (isPlaying) {
      media.pause();
    } else {
      media.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeChange = (value: number[]) => {
    const media = mediaRef.current;
    if (!media) return;

    const newTime = value[0];
    media.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const media = mediaRef.current;
    if (!media) return;

    const newVolume = value[0];
    media.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const media = mediaRef.current;
    if (!media) return;

    if (isMuted) {
      media.volume = volume;
      setIsMuted(false);
    } else {
      media.volume = 0;
      setIsMuted(true);
    }
  };

  const skip = (seconds: number) => {
    const media = mediaRef.current;
    if (!media) return;

    media.currentTime = Math.max(0, Math.min(duration, media.currentTime + seconds));
  };

  const restart = () => {
    const media = mediaRef.current;
    if (!media) return;

    media.currentTime = 0;
    setCurrentTime(0);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleDownload = async () => {
    try {
      await fetch(`/api/resources/${resource.id}/download`, {
        method: 'POST',
      });
      
      if (resource.fileUrl) {
        const link = document.createElement('a');
        link.href = resource.fileUrl;
        link.download = resource.title;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error downloading resource:', error);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {resource.type === ResourceType.VIDEO ? (
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            src={resource.fileUrl || ''}
            className="w-full h-auto max-h-[40vh] sm:max-h-[50vh] md:max-h-[60vh] lg:max-h-[70vh] object-contain"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            preload="metadata"
          />
          
          {/* Custom video controls overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 sm:p-4 md:p-6 transition-opacity duration-300">
            {/* Progress Bar */}
            <div className="mb-3 sm:mb-4 px-2">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleTimeChange}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-xs text-white/80 mt-1 px-1">
                <span className="text-xs sm:text-sm">{formatTime(currentTime)}</span>
                <span className="text-xs sm:text-sm">{formatTime(duration)}</span>
              </div>
            </div>
            
            {/* Control Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 md:gap-4 px-2">
              {/* Left Controls Group */}
              <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full p-0 text-white hover:bg-white/20 transition-colors flex-shrink-0"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={restart}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-white/80 hover:bg-white/20 transition-colors hidden xs:flex"
                >
                  <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => skip(-10)}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-white/80 hover:bg-white/20 transition-colors"
                >
                  <SkipBack className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => skip(10)}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-white/80 hover:bg-white/20 transition-colors"
                >
                  <SkipForward className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                
                {/* Volume Control - Hidden on smallest screens */}
                <div className="flex items-center gap-1 sm:gap-2 hidden sm:flex">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-white/80 hover:bg-white/20 transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="h-3 w-3 sm:h-4 sm:w-4" />
                    ) : (
                      <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                  </Button>
                  
                  <div className="w-16 sm:w-20 md:w-24">
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={1}
                      step={0.1}
                      onValueChange={handleVolumeChange}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              
              {/* Right Controls Group */}
              <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                {/* Mobile Volume Button - Only show on small screens */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-white/80 hover:bg-white/20 transition-colors flex sm:hidden"
                >
                  {isMuted ? (
                    <VolumeX className="h-3 w-3" />
                  ) : (
                    <Volume2 className="h-3 w-3" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-white/80 hover:bg-white/20 transition-colors"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-white/80 hover:bg-white/20 transition-colors"
                >
                  <Maximize className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 md:p-6 lg:p-8 shadow-md">
          <audio
            ref={audioRef}
            src={resource.fileUrl || ''}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            preload="metadata"
          />
          <div className="flex flex-col items-center justify-center space-y-4 md:space-y-6 lg:space-y-8">
            <div className="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center shadow-lg">
              <div className="text-blue-600">
                {resource.type === ResourceType.MUSIC ? (
                  <svg
                    className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                ) : (
                  <svg
                    className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                )}
              </div>
            </div>
            
            <div className="text-center max-w-2xl">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2 md:mb-3 px-2">
                {resource.title}
              </h3>
              <p className="text-gray-600 text-base md:text-lg lg:text-xl px-2 leading-relaxed">
                {resource.description}
              </p>
            </div>
            
            <Card className="w-full max-w-full sm:max-w-md lg:max-w-lg xl:max-w-xl bg-white shadow-lg border-0">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 lg:gap-6">
                  {/* Play/Pause Button */}
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={togglePlay}
                    className="h-14 w-14 md:h-16 md:w-16 rounded-full p-0 text-blue-600 hover:bg-blue-100 transition-colors flex-shrink-0 shadow-md"
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6 md:h-7 md:w-7" />
                    ) : (
                      <Play className="h-6 w-6 md:h-7 md:w-7 ml-1" />
                    )}
                  </Button>
                  
                  {/* Progress and Time */}
                  <div className="flex-1 min-w-[120px] space-y-2 md:space-y-3 w-full">
                    <Slider
                      value={[currentTime]}
                      max={duration || 100}
                      step={1}
                      onValueChange={handleTimeChange}
                      className="w-full cursor-pointer"
                    />
                    <div className="flex justify-between text-sm md:text-base text-gray-600 font-medium">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                  
                  {/* Control Buttons */}
                  <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-wrap justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={restart}
                      className="h-8 w-8 md:h-10 md:w-10 p-0 text-gray-600 hover:bg-gray-100 transition-colors hidden xs:flex"
                    >
                      <RotateCcw className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => skip(-10)}
                      className="h-8 w-8 md:h-10 md:w-10 p-0 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <SkipBack className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => skip(10)}
                      className="h-8 w-8 md:h-10 md:w-10 p-0 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <SkipForward className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                    
                    <div className="flex items-center gap-1 md:gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleMute}
                        className="h-8 w-8 md:h-10 md:w-10 p-0 text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        {isMuted ? (
                          <VolumeX className="h-4 w-4 md:h-5 md:w-5" />
                        ) : (
                          <Volume2 className="h-4 w-4 md:h-5 md:w-5" />
                        )}
                      </Button>
                      
                      <div className="w-16 md:w-20 lg:w-24">
                        <Slider
                          value={[isMuted ? 0 : volume]}
                          max={1}
                          step={0.1}
                          onValueChange={handleVolumeChange}
                          className="cursor-pointer"
                        />
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDownload}
                      className="h-8 w-8 md:h-10 md:w-10 p-0 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <Download className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {resource.fileUrl && (
              <Button 
                variant="outline" 
                className="border-blue-200 text-blue-700 hover:bg-blue-50 w-full sm:w-auto py-3 md:py-4 px-6 md:px-8 text-base md:text-lg transition-colors" 
                asChild
                size="lg"
              >
                <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  Open in New Tab
                </a>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}