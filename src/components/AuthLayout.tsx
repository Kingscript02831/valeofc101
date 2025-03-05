
import React from "react";
import { Link } from "react-router-dom";
import { useSiteConfig } from "../hooks/useSiteConfig";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  showQuote?: boolean;
}

export function AuthLayout({ children, title, showQuote = true }: AuthLayoutProps) {
  const { data: config, isLoading } = useSiteConfig();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="animate-pulse">Carregando...</div>
    </div>;
  }

  const backgroundStyle = config.login_background_image
    ? {
        backgroundImage: `url(${config.login_background_image})`,
        backgroundColor: 'black',
      }
    : {
        backgroundColor: 'black',
      };

  const labelStyle = {
    color: config.login_label_color || '#CB5EEE'
  };

  const mutedTextStyle = {
    color: config.login_label_muted_color || 'rgba(255, 255, 255, 0.6)'
  };

  return (
    <div className="auth-background" style={backgroundStyle}>
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div 
          className="auth-card"
          style={{ backgroundColor: config.login_card_background_color || '#0F0F10' }}
        >
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
          </div>

          {children}
        </div>

        {showQuote && config.login_background_image && (
          <div className="mt-8 max-w-md text-center px-4">
            <blockquote className="italic text-white/80 mb-2">
              "{config.login_quote_text}"
            </blockquote>
            <cite className="text-sm text-white/60">
              {config.login_quote_author}, <span className="font-light">{config.login_quote_author_title}</span>
            </cite>
          </div>
        )}

        <div className="mt-8 text-white/60 text-sm">
          {config.login_developer_text}
        </div>
      </div>
    </div>
  );
}

export function AuthLabel({ children }: { children: React.ReactNode }) {
  const { data: config } = useSiteConfig();
  return (
    <label className="auth-label" style={{ color: config?.login_label_color || '#CB5EEE' }}>
      {children}
    </label>
  );
}

export function AuthLink({ to, children }: { to: string; children: React.ReactNode }) {
  const { data: config } = useSiteConfig();
  return (
    <Link 
      to={to} 
      className="auth-link"
      style={{ color: config?.login_button_color || '#CB5EEE' }}
    >
      {children}
    </Link>
  );
}

export function AuthText({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) {
  const { data: config } = useSiteConfig();
  
  const style = muted 
    ? { color: config?.login_label_muted_color || 'rgba(255, 255, 255, 0.6)' }
    : { color: 'white' };
    
  return (
    <span className={muted ? "auth-text-muted" : ""} style={style}>
      {children}
    </span>
  );
}

export function AuthButton({ onClick, type = "button", children }: { 
  onClick?: () => void; 
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
}) {
  const { data: config } = useSiteConfig();
  
  return (
    <button
      type={type}
      onClick={onClick}
      className="auth-button"
      style={{ 
        backgroundColor: config?.login_button_color || '#CB5EEE',
        color: config?.login_button_text_color || '#FFFFFF'
      }}
    >
      {children}
    </button>
  );
}

export function AuthInput({ 
  type = "text", 
  placeholder,
  value,
  onChange,
  required = false,
  name
}: { 
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  name?: string;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      name={name}
      className="auth-input"
    />
  );
}
