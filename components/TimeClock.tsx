import React, { useState, useEffect, useCallback } from 'react';
import { getEmployees, getPunchesForDay, recordTime } from '../services/googleSheetsService';
import { TimePunch, PunchType } from '../types';
import Card from './shared/Card';
import Loader from './shared/Loader';

const punchTypeToLabel: Record<PunchType, string> = {
  [PunchType.Entrada]: 'Entrada',
  [PunchType.SaidaAlmoco]: 'Saída Almoço',
  [PunchType.EntradaAlmoco]: 'Entrada Almoço',
  [PunchType.Saida]: 'Saída',
};

const punchTypeToColor: Record<PunchType, string> = {
    [PunchType.Entrada]: 'bg-green-600 hover:bg-green-500 focus:ring-green-400',
    [PunchType.SaidaAlmoco]: 'bg-yellow-500 hover:bg-yellow-400 focus:ring-yellow-300 text-black',
    [PunchType.EntradaAlmoco]: 'bg-blue-600 hover:bg-blue-500 focus:ring-blue-400',
    [PunchType.Saida]: 'bg-red-600 hover:bg-red-500 focus:ring-red-400',
};

const TimeClock: React.FC = () => {
  const [employees, setEmployees] = useState<string[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [punchesToday, setPunchesToday] = useState<TimePunch[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<PunchType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedEmployees = await getEmployees();
        setEmployees(fetchedEmployees);
        if (fetchedEmployees.length > 0) {
          setSelectedEmployee(fetchedEmployees[0]);
        }
      } catch (err) {
        setError('Falha ao carregar colaboradores. Verifique a URL do Apps Script e a sua planilha.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const fetchPunches = useCallback(async () => {
    if (!selectedEmployee) return;
    try {
        setError(null);
        const fetchedPunches = await getPunchesForDay(selectedEmployee);
        setPunchesToday(fetchedPunches);
    } catch (err) {
        setError('Falha ao carregar as batidas do dia.');
        console.error(err);
    }
  }, [selectedEmployee]);

  useEffect(() => {
    fetchPunches();
  }, [fetchPunches]);

  const handlePunch = async (punchType: PunchType) => {
    if (!selectedEmployee) {
      setError('Por favor, selecione um colaborador.');
      return;
    }
    setSubmitting(punchType);
    setError(null);
    try {
      await recordTime(selectedEmployee, punchType);
      await fetchPunches(); // Refetch punches to show the new one
    } catch (err) {
      setError('Falha ao registrar o ponto. Tente novamente.');
      console.error(err);
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <Card className="flex flex-col items-center gap-4">
        <Loader />
        <p>Carregando dados...</p>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
      <Card className="flex-1">
        <h3 className="text-2xl font-bold mb-6 text-center text-red-500">Registrar Ponto</h3>
        
        {error && <p className="bg-red-500/20 text-red-300 border border-red-500/30 p-3 rounded-md mb-4 text-center">{error}</p>}
        
        <div className="mb-6">
          <label htmlFor="employee-select" className="block mb-2 text-sm font-medium text-slate-300">
            Colaborador
          </label>
          <select
            id="employee-select"
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

        <div className="grid grid-cols-2 gap-4">
          {(Object.keys(punchTypeToLabel) as PunchType[]).map((punchType) => (
            <button
              key={punchType}
              onClick={() => handlePunch(punchType)}
              disabled={!selectedEmployee || !!submitting}
              className={`flex items-center justify-center p-4 text-white font-bold rounded-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 ${punchTypeToColor[punchType]}`}
            >
              {submitting === punchType ? <Loader /> : punchTypeToLabel[punchType]}
            </button>
          ))}
        </div>
      </Card>

      <Card className="flex-1">
        <h3 className="text-2xl font-bold mb-6 text-center text-red-500">Hoje</h3>
        <div className="bg-black/50 p-4 rounded-lg h-64 overflow-y-auto">
            {punchesToday.length > 0 ? (
                <ul className="space-y-3">
                    {punchesToday.sort((a, b) => a.time.localeCompare(b.time)).map((punch, index) => (
                        <li key={index} className="flex justify-between items-center bg-gray-800/50 p-3 rounded-md shadow">
                            <span className="font-semibold text-slate-200">{punch.type}</span>
                            <span className="text-lg font-mono bg-gray-900 px-2 py-1 rounded">{punch.time}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="flex items-center justify-center h-full">
                    <p className="text-slate-500">Nenhuma batida registrada hoje para {selectedEmployee}.</p>
                </div>
            )}
        </div>
      </Card>
    </div>
  );
};

export default TimeClock;