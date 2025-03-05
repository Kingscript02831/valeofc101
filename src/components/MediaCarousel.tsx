import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { transformDropboxUrl } from "../utils/mediaUtils";

interface MediaCarouselProps {
  images: string[];
  videoUrls: string[];
  title: string;
  autoplay?: boolean;
  cropMode?: 'cover' | 'contain';
  showControls?: boolean;
}

export const MediaCarousel = ({ 
  images, 
  videoUrls, 
  title,
  autoplay = false,
  cropMode = 'cover',
  showControls = true 
}: MediaCarouselProps) => {
  // Transform all URLs first
  const processedImages = images.map(url => transformDropboxUrl(url));
  const processedVideos = videoUrls.map(url => transformDropboxUrl(url));
  
  // Combine all media into one array
  const allMedia = [
    ...processedImages.map(url => ({ type: "image" as const, url })),
    ...processedVideos.map(url => ({ type: "video" as const, url }))
  ];

  const [mediaLoaded, setMediaLoaded] = useState<Record<string, boolean>>({});
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const imageRefs = useRef<Record<string, HTMLImageElement>>({});

  if (!allMedia.length) return null;

  // Melhorado: Pré-carregamento das imagens para melhorar a experiência do usuário
  // e garantir que as imagens sejam armazenadas no cache do navegador
  useEffect(() => {
    let loadedCount = 0;
    const imageList = processedImages.filter(url => url); // Filtrar URLs vazias
    const totalImages = imageList.length;
    
    // Função para pré-carregar imagens
    const preloadImages = () => {
      if (totalImages === 0) {
        setAllImagesLoaded(true);
        return;
      }
      
      imageList.forEach(url => {
        // Verifica se a imagem já está no cache do navegador
        const checkCachedImage = async (url: string) => {
          if ('caches' in window) {
            try {
              const cache = await caches.open('images-cache');
              const match = await cache.match(url);
              if (match) {
                // Imagem já está em cache
                loadedCount++;
                setMediaLoaded(prev => ({ ...prev, [url]: true }));
                if (loadedCount === totalImages) {
                  setAllImagesLoaded(true);
                }
                return true;
              }
            } catch (e) {
              console.warn('Erro ao verificar cache de imagem:', e);
            }
          }
          return false;
        };
        
        // Se não estiver em cache, carrega normalmente
        checkCachedImage(url).then(isCached => {
          if (!isCached) {
            const img = new Image();
            img.src = url;
            imageRefs.current[url] = img;
            
            img.onload = () => {
              loadedCount++;
              setMediaLoaded(prev => ({ ...prev, [url]: true }));
              
              // Adiciona ao cache manualmente se possível
              if ('caches' in window) {
                caches.open('images-cache').then(cache => {
                  fetch(url).then(response => {
                    cache.put(url, response);
                  }).catch(err => console.warn('Erro ao cache manual:', err));
                });
              }
              
              if (loadedCount === totalImages) {
                setAllImagesLoaded(true);
              }
            };
            
            img.onerror = () => {
              loadedCount++;
              console.error(`Failed to load image: ${url}`);
              if (loadedCount === totalImages) {
                setAllImagesLoaded(true);
              }
            };
          }
        });
      });
    };
    
    preloadImages();
    
    // Limpeza de referências na desmontagem
    return () => {
      Object.values(imageRefs.current).forEach(img => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [processedImages]);

  const getVideoUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  return (
    <Carousel
      className="relative w-full bg-background overflow-hidden"
      opts={{
        align: "start",
        loop: true
      }}
    >
      <CarouselContent>
        {allMedia.map((media, index) => (
          <CarouselItem key={index}>
            {media.type === 'video' ? (
              <div className="relative w-full">
                {media.url.includes('youtube.com') || media.url.includes('youtu.be') ? (
                  <div className="aspect-video">
                    <iframe
                      src={getVideoUrl(media.url)}
                      className="absolute inset-0 w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      title={title}
                      loading="lazy" // Adicionado para melhorar performance
                    />
                  </div>
                ) : (
                  <video
                    src={media.url}
                    controls={showControls}
                    loop
                    playsInline
                    className="w-full max-h-[80vh] object-contain"
                    controlsList="nodownload"
                    autoPlay={autoplay}
                    preload="metadata" // Carrega apenas os metadados inicialmente
                  >
                    Seu navegador não suporta a reprodução de vídeos.
                  </video>
                )}
              </div>
            ) : (
              <div className="relative">
                {!mediaLoaded[media.url] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/10">
                    <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                  </div>
                )}
                <img
                  src={media.url}
                  alt={title}
                  className={cn(
                    "w-full max-h-[80vh]",
                    cropMode === 'contain' ? "object-contain" : "object-cover",
                    !mediaLoaded[media.url] && "opacity-0"
                  )}
                  loading="lazy" // Carregamento lento para melhorar performance
                  decoding="async" // Decodificação assíncrona
                  onLoad={() => setMediaLoaded(prev => ({ ...prev, [media.url]: true }))}
                />
              </div>
            )}
          </CarouselItem>
        ))}
      </CarouselContent>

      {showControls && allMedia.length > 1 && (
        <>
          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
          
          {/* Media counter */}
          <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-background/80 text-xs font-medium">
            {allMedia.length} mídias
          </div>
        </>
      )}
    </Carousel>
  );
};

export default MediaCarousel;
