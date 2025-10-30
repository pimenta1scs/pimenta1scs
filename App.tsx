import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import TimeClock from './components/TimeClock';
import Dashboard from './components/Dashboard';

type View = 'timeclock' | 'dashboard';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('timeclock');

  const getButtonClass = (view: View) => {
    const baseClass = "px-6 py-2 rounded-md font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50";
    if (currentView === view) {
      return `${baseClass} bg-red-600 text-white shadow-lg shadow-red-500/20`;
    }
    return `${baseClass} bg-slate-700 text-slate-300 hover:bg-slate-600`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-black text-slate-200 font-sans">
      <Header />
      <main className="flex-grow w-full p-4 md:p-8 flex flex-col items-center">
        <div className="mb-8 p-1 bg-gray-900/80 rounded-lg shadow-md flex items-center space-x-2 border border-slate-700">
          <button onClick={() => setCurrentView('timeclock')} className={getButtonClass('timeclock')}>
            Registro de Ponto
          </button>
          <button onClick={() => setCurrentView('dashboard')} className={getButtonClass('dashboard')}>
            Dashboard
          </button>
        </div>
        
        {currentView === 'timeclock' ? <TimeClock /> : <Dashboard />}
      </main>
      <Footer />
    </div>
  );
};

export default App;