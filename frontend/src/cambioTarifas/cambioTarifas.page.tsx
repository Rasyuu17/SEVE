// CambiosTarifasPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { tasaApi } from '../tasaCambio/tasaCambio.client';
import { planApi } from '../planes/planSala/planSala.client';

const CambiosTarifasPage = () => {
    const navigate = useNavigate();
    const [tasaActual, setTasaActual] = useState<any>(null);
    const [planes, setPlanes] = useState<any[]>([]);
    const [nuevaTasa, setNuevaTasa] = useState('');
    const [cambios, setCambios] = useState<Record<number, { tipo: string; valor: string }>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [tasaRes, planesRes] = await Promise.all([
                tasaApi.obtenerActiva(),
                planApi.listar(),
            ]);
            setTasaActual(tasaRes.data);
            setPlanes(planesRes.data);
        } catch (error) {
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const cambiosPlanes = Object.entries(cambios)
            .filter(([_, v]) => v.valor !== '')
            .map(([planId, v]) => ({
                planId: parseInt(planId),
                tipo: v.tipo,
                nuevaTarifa: Math.round(parseFloat(v.valor) * 100), // Convertir a centavos
            }));

        if (!nuevaTasa && cambiosPlanes.length === 0) {
            toast.error('No hay cambios');
            return;
        }

        try {
            await tasaApi.aplicarCambios(nuevaTasa ? {
                nuevaTasa: Math.round(parseFloat(nuevaTasa) * 100) , // Tasa también en centavos si aplica
                cambios: cambiosPlanes,
            }: {cambios: cambiosPlanes});
            toast.success('Cambios aplicados');
            navigate('/documentos');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error');
        }
    };

    if (loading) return <div className="p-4">Cargando...</div>;

    return (
        <div className="mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6 text-primary-dark">Cambios de Tarifas</h1>

            <form onSubmit={handleSubmit}>
                {/* Tasa */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Tasa de Cambio</h2>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                            Actual: <strong>{tasaActual?.tasa ? (tasaActual.tasa / 100).toFixed(2) : 'N/A'}</strong>
                        </span>
                        <input
                            type="number"
                            step="0.01"
                            value={nuevaTasa}
                            onChange={(e) => setNuevaTasa(e.target.value)}
                            placeholder="Nueva tasa (ej: 325.50)"
                            className="border border-gray-300 rounded-md px-3 py-1 text-sm w-40"
                        />
                    </div>
                </div>

                {/* Planes */}
                <div className="bg-white rounded-lg shadow p-4 mb-4">
                    <h2 className="text-lg font-semibold mb-4">Planes</h2>
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left">Plan</th>
                                <th className="px-4 py-2 text-right">Tarifa Actual (CUP)</th>
                                <th className="px-4 py-2 text-right">Tarifa USD</th>
                                <th className="px-4 py-2 text-right">Nueva Tarifa (CUP)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {planes.map((plan: any) => {
                                const tarifaCUP = plan.PlanBaseModel?.tarifa ? (plan.PlanBaseModel.tarifa / 100).toFixed(2) : '0.00';
                                const tarifaUSD = plan.PlanBaseModel?.tarifa && tasaActual?.tasa
                                    ? (plan.PlanBaseModel.tarifa / tasaActual.tasa).toFixed(2)
                                    : '0.00';
                                
                                return (
                                    <tr key={plan.id}>
                                        <td className="px-4 py-2">{plan.PlanBaseModel?.nombre}</td>
                                        <td className="px-4 py-2 text-right">${tarifaCUP}</td>
                                        <td className="px-4 py-2 text-right">${tarifaUSD}</td>
                                        <td className="px-4 py-2 text-right">
                                            <input
                                                name="cambio"
                                                type="number"
                                                step="0.01"
                                                value={cambios[plan.id]?.valor || ''}
                                                onChange={(e) =>
                                                    setCambios(prev => ({
                                                        ...prev,
                                                        [plan.id]: { tipo: plan.PlanBaseModel?.categoriaAnexable, valor: e.target.value }
                                                    }))
                                                }
                                                placeholder="Sin cambio"
                                                className="border border-gray-300 rounded-md px-3 py-1 text-sm w-32 text-right"
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button type="submit" className="px-6 py-2 text-sm text-white transition-colors bg-primary-dark rounded-md hover:bg-primary-extradark">
                        Aplicar Cambios
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CambiosTarifasPage;