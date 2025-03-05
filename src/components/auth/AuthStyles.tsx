
import React from 'react';
import type { SiteConfig } from '@/hooks/useSiteConfig';

interface AuthStylesProps {
  config: SiteConfig | undefined;
}

export const useAuthStyles = (config: SiteConfig | undefined) => {
  const linkColorStyle = { color: config?.login_button_color || '#CB5EEE' };
  const labelColorStyle = { color: config?.login_label_color || '#CB5EEE' };
  const mutedColorStyle = { color: config?.login_label_muted_color || 'rgba(255, 255, 255, 0.5)' };
  const buttonStyle = { 
    backgroundColor: config?.login_button_color || '#CB5EEE', 
    color: config?.login_button_text_color || '#FFFFFF'
  };
  const cardStyle = { backgroundColor: config?.login_card_background_color || '#0F0F10' };

  return {
    linkColorStyle,
    labelColorStyle,
    mutedColorStyle,
    buttonStyle,
    cardStyle
  };
};

export const AuthBackground: React.FC<AuthStylesProps & {children: React.ReactNode}> = ({ 
  config, 
  children 
}) => {
  // Background style based on login_background_image
  const hasBackgroundImage = Boolean(config?.login_background_image);

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left side with image and quote - hidden on mobile */}
      <div className="relative flex-1 hidden md:flex flex-col justify-between bg-gradient-to-r from-purple-800 to-purple-900 overflow-hidden">
        {hasBackgroundImage ? (
          <div className="absolute inset-0 z-0">
            <img
              src={config?.login_background_image}
              alt="Background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-800/40 to-purple-900/40"></div>
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-purple-800 to-purple-900"></div>
        )}
        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          <div></div>
          <div className="bg-black/30 p-6 rounded-2xl backdrop-blur-sm">
            <p className="text-white text-lg font-medium mb-4">{config?.login_quote_text || '"No futuro, a tecnologia nos permitirá criar realidades alternativas tão convincentes que será difícil distinguir o que é real do que é simulado."'}</p>
            <p className="text-white font-bold">{config?.login_quote_author || 'Jaron Lanier'}</p>
            <p className="text-white/70 text-sm">{config?.login_quote_author_title || 'Cientista da computação e especialista em realidade virtual.'}</p>
          </div>
        </div>
      </div>

      {/* Right side with login form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 bg-black text-white">
        {/* Mobile background image */}
        {hasBackgroundImage && (
          <div className="fixed inset-0 z-0 md:hidden">
            <img 
              src={config?.login_background_image} 
              alt="Background" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
        )}
        
        {children}
        
        <p className="mt-8 text-sm relative z-10" style={{ color: config?.login_label_muted_color || 'rgba(255, 255, 255, 0.5)' }}>
          {config?.login_developer_text || '2025 | Desenvolvido por Vinícius Dev'}
        </p>
      </div>
    </div>
  );
};
