import React from 'react';
// @ts-expect-error image import
import skillauraLogoImg from '../assets/images/skillaura_charcoal_logo_1785321752193.jpg';

interface SkillAuraLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const SkillAuraLogo: React.FC<SkillAuraLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`relative ${sizeClasses[size]} rounded-2xl bg-gradient-to-tr from-orange-500 via-red-500 to-amber-400 p-[1.5px] shadow-lg shadow-orange-500/25 shrink-0 overflow-hidden`}>
        <img
          src={skillauraLogoImg}
          alt="SkillAura Logo"
          className="w-full h-full object-cover rounded-[14px]"
        />
      </div>
      {showText && (
        <div className="leading-tight">
          <div className="flex items-center space-x-1.5">
            <span className={`font-black tracking-tight ${textSizeClasses[size]} bg-gradient-to-r from-orange-500 via-red-500 to-amber-400 bg-clip-text text-transparent`}>
              SkillAura
            </span>
            <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-stone-950 px-1.5 py-0.5 rounded-full shadow-sm font-bold">
              AI
            </span>
          </div>
          <p className="text-[10px] text-stone-500 font-medium tracking-wide">
            Career & Interview Intelligence
          </p>
        </div>
      )}
    </div>
  );
};
