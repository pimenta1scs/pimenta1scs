import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full p-4 bg-gray-900/50 shadow-lg flex flex-col items-center justify-center text-center border-b border-red-500/20">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl md:text-4xl font-bold text-red-500 tracking-wider drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]">
          Pimenta da Terra SCS
        </h1>
      </div>
      <h2 className="text-lg md:text-xl text-slate-400 mt-1 font-mono">Controle de Horas</h2>
    </header>
  );
};

export default Header;