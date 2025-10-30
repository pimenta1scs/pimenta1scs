import React, { useState, useEffect, useMemo } from 'react';
import { getEmployees, getWorkedHours } from '../services/googleSheetsService';
import { WorkedHours } from '../types';
import Card from './shared/Card';
import Loader from './shared/Loader';

const Dashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [employees, setEmployees] = useState<string[]>([]);
  const [workedHours, setWorkedHours] = useState<WorkedHours[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check session storage for existing authentication
    if (sessionStorage.getItem('dashboard_auth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [fetchedEmployees, fetchedHours] = await Promise.all([
          getEmployees(),
          getWorkedHours(),
        ]);

        setEmployees(fetchedEmployees);
        setWorkedHours(fetchedHours);

        if (fetchedEmployees.length > 0) {
          setSelectedEmployee(fetchedEmployees[0]);
        }
      } catch (err) {
        setError('Falha ao carregar dados do dashboard. Verifique a URL do Apps Script e a sua planilha.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [isAuthenticated]);

  const availableMonths = useMemo(() => {
    const months = new Set(workedHours.map(wh => wh.monthYear));
    return Array.from(months);
  }, [workedHours]);

  useEffect(() => {
    if (availableMonths.length > 0 && !selectedMonth) {
        setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths, selectedMonth]);
  
  const displayedHours = useMemo(() => {
    if (!selectedEmployee || !selectedMonth) return null;
    return workedHours.find(
      (wh) => wh.employee === selectedEmployee && wh.monthYear === selectedMonth
    );
  }, [selectedEmployee, selectedMonth, workedHours]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Pimenta1') {
        setIsAuthenticated(true);
        sessionStorage.setItem('dashboard_auth', 'true');
        setAuthError('');
    } else {
        setAuthError('Senha incorreta.');
    }
  };
  
  if (!isAuthenticated) {
    return (
        <Card className="w-full max-w-sm mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-center text-red-500">Acesso Restrito</h3>
            <form onSubmit={handleLogin}>
                <div className="mb-4">
                    <label htmlFor="password-input" className="block mb-2 text-sm font-medium text-slate-300">
                        Senha
                    </label>
                    <input
                        type="password"
                        id="password-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                        required
                    />
                </div>
                {authError && <p className="text-red-400 text-sm text-center mb-4">{authError}</p>}
                <button
                    type="submit"
                    className="w-full p-2.5 text-white bg-red-600 hover:bg-red-500 focus:ring-2 focus:ring-red-400 font-medium rounded-lg text-sm transition-colors"
                >
                    Entrar
                </button>
            </form>
        </Card>
    );
  }

  if (loading) {
    return (
      <Card className="flex flex-col items-center gap-4">
        <Loader />
        <p>Carregando dados do dashboard...</p>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold mb-6 text-center text-red-500">Dashboard de Horas</h3>
      
      {error && <p className="bg-red-500/20 text-red-300 border border-red-500/30 p-3 rounded-md mb-4 text-center">{error}</p>}
      
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <label htmlFor="employee-select-dash" className="block mb-2 text-sm font-medium text-slate-300">
            Colaborador
          </label>
          <select
            id="employee-select-dash"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
          >
            {employees.map((emp) => (
              <option key={emp} value={emp}>
                {emp}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="month-select-dash" className="block mb-2 text-sm font-medium text-slate-300">
            Mês
          </label>
          <select
            id="month-select-dash"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
            disabled={availableMonths.length === 0}
          >
            {availableMonths.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="bg-black/50 p-6 rounded-lg text-center">
        <h4 className="text-lg text-slate-400 mb-2">Total de Horas Acumuladas</h4>
        {displayedHours ? (
          <p className="text-5xl font-bold text-red-500 tracking-tighter drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]">
            {displayedHours.totalHours}
          </p>
        ) : (
          <p className="text-2xl text-slate-500 mt-4">
            Nenhum dado encontrado para a seleção.
          </p>
        )}
      </div>
    </Card>
  );
};

export default Dashboard;