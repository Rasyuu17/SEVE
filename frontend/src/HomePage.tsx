// HomePage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    DocumentTextIcon, 
    Squares2X2Icon, 
    BanknotesIcon 
} from '@heroicons/react/24/outline';
import { TasaActiva } from './tasaCambio/tasaCambioActiva';
import { planApi } from './planes/planSala/planSala.client';

const HomePage = () => {
    const [totalPlanes, setTotalPlanes] = useState(0);

    useEffect(() => {
        planApi.listar().then(res => setTotalPlanes(res.data?.length || 0)).catch(() => {});
    }, []);

    return (
        <div className="mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6 text-primary-dark">Sistema de Gestión de Servicios de Videoconferencia</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <TasaActiva />
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Planes de Sala de Videoconferencia Activos</h2>
                    <p className="text-3xl font-bold text-primary-dark">{totalPlanes}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/catalogo" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow flex items-center gap-4">
                    <Squares2X2Icon className="h-10 w-10 text-primary-dark" />
                    <div>
                        <h3 className="font-semibold text-lg">Catálogo de Planes</h3>
                        <p className="text-sm text-gray-500">Explorar y seleccionar planes</p>
                    </div>
                </Link>
                <Link to="/documentos" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow flex items-center gap-4">
                    <DocumentTextIcon className="h-10 w-10 text-primary-dark" />
                    <div>
                        <h3 className="font-semibold text-lg">Documentos</h3>
                        <p className="text-sm text-gray-500">Gestionar anexos y firmados</p>
                    </div>
                </Link>
                <Link to="/tarifas" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow flex items-center gap-4">
                    <BanknotesIcon className="h-10 w-10 text-primary-dark" />
                    <div>
                        <h3 className="font-semibold text-lg">Cambios de Tarifas</h3>
                        <p className="text-sm text-gray-500">Actualizar tasas y tarifas</p>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default HomePage;