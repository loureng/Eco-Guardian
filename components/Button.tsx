import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = "primary", 
  isLoading, 
  className = "", 
  disabled,
  ...props 
}) => {
  const baseStyles = "w-full py-3 px-4 rounded-xl font-medium transition-all active:scale-95 flex justify-center items-center gap-2";
  
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200",
    secondary: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
    outline: "border-2 border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className} ${disabled || isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
          <span className="sr-only">Carregando...</span>
        </>
      ) : children}
    </button>
  );
};