import React from 'react';

interface AvatarProps {
  url?: string;
  playerId: string;
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
  onAvatarUpdate?: () => void;
}

export function Avatar({ url, playerId, size = 'md', editable = false, onAvatarUpdate }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const handleClick = () => {
    if (editable && onAvatarUpdate) {
      // In a real implementation, this would open a file picker or avatar selection modal
      onAvatarUpdate();
    }
  };

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full bg-gray-700 flex items-center justify-center overflow-hidden ${editable ? 'cursor-pointer hover:bg-gray-600' : ''}`}
      onClick={handleClick}
    >
      {url ? (
        <img 
          src={url} 
          alt="Avatar" 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="text-gray-400 text-lg">
          👤
        </div>
      )}
    </div>
  );
}