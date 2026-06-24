import { useState } from 'react';

import { tasaApi } from './tasaCambio.client';

export const TasaCambioForm = () => {
  const [tasa, setTasa] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const nuevaTasa = (parseFloat(tasa) * 100).toString();
    try {
      const response = await tasaApi.crear({ tasa: parseInt(nuevaTasa) });
      if (response.status === 201) {
        setMessage({ type: 'success', text: 'Tasa de cambio creada exitosamente' });
        setTasa('');
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Error al crear la tasa' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Crear Nueva Tasa de Cambio</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tasa
          </label>
          <input
            type="number"
            step="0.01"
            value={tasa}
            onChange={(e) => setTasa(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark"
            placeholder="Ej: 58.50"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-dark transition-all text-white py-2 px-4 rounded-md hover:bg-primary-extradark disabled:bg-blue-300 active:scale-90"
        >
          {loading ? 'Creando...' : 'Crear Tasa'}
        </button>

        {message && (
          <div className={`p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
};