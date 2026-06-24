import { useEffect, useState } from 'react';

import { tasaApi } from './tasaCambio.client';

export const TasaActiva = () => {
  const [tasa, setTasa] = useState<{ tasa: number; createdAt: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const cargarTasaActiva = async () => {
    try {
      const response = await tasaApi.obtenerActiva();
      setTasa(response.data);
    } catch (error) {
      setTasa(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTasaActiva();
  }, []);

  if (loading) {
    return <div className="bg-white rounded-lg shadow p-6">Cargando...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Tasa de Cambio Activa</h2>
      {tasa ? (
        <div>
          <p className="text-3xl font-bold text-green-600">{(tasa.tasa / 100).toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-2">
            Creada: {new Date(tasa.createdAt).toLocaleString()}
          </p>
        </div>
      ) : (
        <p className="text-gray-500">No hay una tasa de cambio activa</p>
      )}
    </div>
  );
};