import { useCallback, useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, getDay, parse, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { VideoCameraIcon } from '@heroicons/react/24/outline';

import ModalComponent from '../../../components/Modal';
import { solicitudApi } from './../solicitud/solicitudSala.client';

interface EventoOperativo {
    id: number;
    title: string;
    entidad: string;
    fecha_inicio: Date;
    fecha_fin: Date;
    estado: 'pendiente' | 'aceptado';
    confirmado: boolean;
    grabar: boolean;
    link_vc: string;
}

const locales = { 'es': es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const CalendarioOperativo = () => {
    const [eventos, setEventos] = useState<EventoOperativo[]>([]);
    const [eventoSeleccionado, setEventoSeleccionado] = useState<EventoOperativo | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(true);

    const cargarEventos = useCallback(async (month: number, year: number) => {
        setLoading(true);
        try {
            const response = await solicitudApi.obtenerCalendarioOperativo(month, year);
            if (response.data?.success) {
                const eventosParseados = response.data.data.map((e: any) => ({
                    ...e,
                    fecha_inicio: new Date(e.fecha_inicio),
                    fecha_fin: new Date(e.fecha_fin),
                }));
                setEventos(eventosParseados);
            } else {
                setEventos([]);
            }
        } catch (error) {
            setEventos([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarEventos(currentDate.getMonth() + 1, currentDate.getFullYear());
    }, [currentDate, cargarEventos]);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-primary-dark mb-4">Calendario Operativo</h1>
            
            {loading ? (
                <div className="text-center py-8">Cargando calendario...</div>
            ) : (
                <div className="h-136">
                    <Calendar
                        localizer={localizer}
                        events={eventos}
                        startAccessor="fecha_inicio"
                        endAccessor="fecha_fin"
                        style={{ height: '100%', backgroundColor: 'white', borderRadius: '8px', padding: '3px' }}
                        defaultView="month"
                        views={['month','week','day']}
                        popup={true}
                        date={currentDate}
                        onNavigate={(date) => setCurrentDate(date)}
                        onSelectEvent={(event) => setEventoSeleccionado(event)}
                        eventPropGetter={(event) => {
                            let backgroundColor = '#F59E0B'; // warning - pendiente
                            if (event.estado === 'aceptado') {
                                backgroundColor = '#162456'; // primary-dark
                            }
                            return { style: { backgroundColor, color: 'white' } };
                        }}
                        step={60}
                        timeslots={1}
                        messages={{
                            next: 'Siguiente',
                            previous: 'Anterior',
                            today: 'Hoy',
                            month: 'Mes',
                            week: 'Semana',
                            day: 'Día',
                            showMore: (total) => `+ ${total} más`,
                        }}
                        formats={{
                            monthHeaderFormat: 'MMMM yyyy',
                            eventTimeRangeFormat: ({ start, end }) =>
                                `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`,
                        }}
                        culture="es"
                    />
                </div>
            )}

            <ModalComponent
                isOpen={!!eventoSeleccionado}
                onClose={() => setEventoSeleccionado(null)}
                title={eventoSeleccionado?.title || 'Detalles'}
            >
                {eventoSeleccionado && (
                    <div className="space-y-3 w-96">
                        <div>
                            <span className="font-semibold">Entidad:</span> {eventoSeleccionado.entidad}
                        </div>
                        <div>
                            <span className="font-semibold">Fecha:</span>{' '}
                            {format(eventoSeleccionado.fecha_inicio, 'dd/MM/yyyy HH:mm')} -{' '}
                            {format(eventoSeleccionado.fecha_fin, 'dd/MM/yyyy HH:mm')}
                        </div>
                        <div>
                            <span className="font-semibold">Estado:</span>{' '}
                            <span className={`px-2 py-0.5 rounded-full text-xs text-white ${
                                eventoSeleccionado.estado === 'aceptado' ? 'bg-primary-dark' : 'bg-warning'
                            }`}>
                                {eventoSeleccionado.estado}
                            </span>
                        </div>
                        <div>
                            <span className="font-semibold">Link VC:</span>{' '}
                            <a href={eventoSeleccionado.link_vc} target="_blank" className="text-blue-600 underline">
                                {eventoSeleccionado.link_vc}
                            </a>
                        </div>
                        {eventoSeleccionado.grabar && (
                            <div className="flex items-center gap-1 text-success">
                                <VideoCameraIcon className="h-4 w-4" />
                                <span className="text-sm">Grabación activada</span>
                            </div>
                        )}
                    </div>
                )}
            </ModalComponent>
        </div>
    );
};

export default CalendarioOperativo;