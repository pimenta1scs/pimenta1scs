import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm border border-red-500/20 p-6 rounded-xl shadow-2xl shadow-black/50 ${className}`}>
      {children}
    </div>
  );
};

export default Card;