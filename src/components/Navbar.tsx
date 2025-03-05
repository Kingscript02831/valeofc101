
import { Link, useNavigate } from "react-router-dom";
import { useSiteConfig } from "../hooks/useSiteConfig";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

const Navbar = () => {
  const { data: config, isLoading, isError } = useSiteConfig();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determina a direção do scroll
      if (currentScrollY > lastScrollY) {
        // Rolando para baixo
        setVisible(false);
      } else {
        // Rolando para cima
        setVisible(true);
      }
      
      // Atualiza a posição do último scroll
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  if (isLoading) {
    return (
      <nav className="w-full fixed top-0 z-50 h-16 animate-pulse bg-gray-200" />
    );
  }

  if (isError || !config) {
    return (
      <nav className="w-full fixed top-0 z-50 h-16 bg-gray-800">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <span className="text-white">Error loading navbar</span>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav 
      className={`w-full fixed top-0 z-50 shadow-md transition-transform duration-300 ${!visible ? '-translate-y-full' : 'translate-y-0'}`}
      style={{ 
        background: `linear-gradient(to right, ${config.navbar_color}, ${config.primary_color})`,
        borderColor: `${config.primary_color}20`
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link 
            to="/" 
            className="flex items-center space-x-2"
          >
            {config.navbar_logo_type === 'image' && config.navbar_logo_image ? (
              <img 
                src={config.navbar_logo_image} 
                alt="Logo" 
                className="h-12 w-12 rounded-full object-cover"
                style={{ borderColor: config.text_color }}
              />
            ) : (
              <span 
                className="text-3xl font-bold tracking-tighter"
                style={{ color: config.text_color }}
              >
                {config.navbar_logo_text || 'Vale Notícias'}
              </span>
            )}
          </Link>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/menu")}
              className="flex items-center p-2 rounded-xl transition-all duration-300 hover:scale-105"
              style={{ color: config.text_color }}
            >
              <Menu className="h-6 w-6" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
