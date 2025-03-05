
import React from "react";

interface AvatarLoginProps {
  author: string;
  title: string;
  image?: string;
}

const AvatarLogin = ({ author, title, image }: AvatarLoginProps) => {
  // Generate a gradient based on the author name for fallback
  const generateColorFromName = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color1 = `hsl(${hash % 360}, 70%, 75%)`;
    const color2 = `hsl(${(hash + 120) % 360}, 70%, 65%)`;
    return `linear-gradient(135deg, ${color1}, ${color2})`;
  };

  const authorInitial = author ? author.charAt(0).toUpperCase() : "A";
  const avatarStyle = image
    ? { backgroundImage: `url(${image})` }
    : { background: generateColorFromName(author) };

  return (
    <div className="flex items-center gap-3 mt-2">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center bg-cover bg-center"
        style={avatarStyle}
      >
        {!image && <span className="text-white font-bold">{authorInitial}</span>}
      </div>
      <div>
        <p className="text-white/90 text-sm font-bold">{author}</p>
        <p className="text-white/70 text-xs">{title}</p>
      </div>
    </div>
  );
};

export default AvatarLogin;
