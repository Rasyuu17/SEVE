import { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer, type View } from 'react-big-calendar';
import { format, getDay, parse, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { ArrowLeftCircleIcon } from '@heroicons/react/16/solid';
import toast from 'react-hot-toast';
import { useBlocker, useNavigate } from 'react-router-dom';

import ModalComponent from '../../../components/Modal';
import Pagination from '../../../utils/pagination';
import type { PlanSala } from '../planSala.interface';
import type { CalendarItem } from './calendar.interface';
import { linkApi } from './link.client';
import { type ClientDataType, ClientInfoForm } from './solicitudClientInfoForm';
import { SolicitudForm } from './solicitudForm';
import { type Solicitud, SolicitudList } from './solicitudList';
import { solicitudApi } from './solicitudSala.client';
import { ContratoInfoForm, type ContratoDataType } from './solicitudContractInfoForm';
import { CheckBadgeIcon } from '@heroicons/react/24/outline';

export interface CreateSolicitudType {
    nombre: string[];
    fecha_inicio: Date[];
    fecha_fin: Date[];
    numero: number;
    link_vc: string;
    contrato_generalId: number;
    contrato_especificoId: number;
    nombre_solicitante: string;
    entidad: string;
    correo: string;
    cargo: string;
    planesSalaIds: number[][];
    info_contrato?: ContratoDataType | null;
    grabar: boolean[]
}

interface CalendarProps {
  selected: PlanSala[];
  back: () => void;
  validateLink: () => void;
}

interface Reqs {
  nombre: string;
  mes: number;
  año: number;
}

const locales = { 'es': es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CalendarSala: React.FC<CalendarProps> = ({ selected, back }) => {
  const [allItems, setAllItems] = useState<CalendarItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<View>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [reqsHistory, setReqsHistory] = useState<Reqs[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [paginationPage, setPaginationPage] = useState<number>(1);
  const [isListOpen, setIsListOpen] = useState<boolean>(false);
  const [isBackModalOpen, setIsBackModalOpen] = useState<boolean>(false);
  const [isBlockerModalOpen, setIsBlockerModalOpen] = useState<boolean>(false);
  const [isClientInfoModalOpen, setIsClientInfoModalOpen] = useState<boolean>(false);
  const [isSending,setIsSending] = useState<boolean>(false);
  const [clientData, setClientData] = useState<ClientDataType>({
    numero: 0,
    entidad: '',
    link_vc: '',
    id_contratoGeneral: 0,
    id_contratoEspecifico: 0,
    solicitante: '',
    correo: '',
    cargo: ''
  });
  const [isContratoModalOpen, setIsContratoModalOpen] = useState(false);
  const [contratoData, setContratoData] = useState<ContratoDataType | null>(null);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => {
      return solicitudes.length > 0 &&
        currentLocation.pathname !== nextLocation.pathname;
    }
  );
  const navigate = useNavigate();

  const isValidClientData = useMemo(() => {
    return clientData.entidad !== ''
      && clientData.correo !== ''
      && !!clientData.id_contratoGeneral
      && !!clientData.id_contratoEspecifico
      && clientData.link_vc !== ''
      && clientData.solicitante !== '';
  }, [clientData]);

  const isValidContractData = useMemo(() => {
    if (!contratoData) return false;
    const { agente, especialista, ubicacion } = contratoData;
    return agente.nombre !== ''
        && agente.apellido !== ''
        && agente.correo !== ''
        && especialista.nombre !== ''
        && ubicacion.municipio !== ''
        && ubicacion.provincia !== '';
  }, [contratoData]);

  const isRequestCached = (req: Reqs) => {
    return reqsHistory.some(cached =>
      cached.nombre === req.nombre &&
      cached.mes === req.mes &&
      cached.año === req.año
    );
  };

  useEffect(() => {
    if (blocker.state === 'blocked') {
      setIsBlockerModalOpen(true);
    }
  }, [blocker.state]);

  const handleBlockerProceed = useCallback(() => {
    setIsBlockerModalOpen(false);
    if (blocker.proceed) {
      blocker.proceed();
    }
  }, [blocker]);

  const handleBlockerCancel = useCallback(() => {
    setIsBlockerModalOpen(false);
    if (blocker.reset) {
      blocker.reset();
    }
  }, [blocker]);

  const handleToggleGrabar = (index: number) => {
    setSolicitudes(prev => prev.map((s, i) => 
        i === index ? { ...s, grabar: !s.grabar } : s
    ));
  };

  const validarLink = async (link: string) => {
    const valido = await linkApi.validarLink(link);
    valido.data.response ? toast.success(valido.data.message) : toast.error(valido.data.message);
  };

  const handleCreateSolicitud = async (nuevasSolicitudes: Omit<Solicitud, 'estado'>[]) => {
    setFormLoading(true);
    try {
      const solicitudesConEstado: Solicitud[] = nuevasSolicitudes.map(s => ({
        ...s,
        estado: 'nueva',
      }));
      setSolicitudes(prev => [...solicitudesConEstado, ...prev].sort((a, b) => a.fecha_inicio.getTime() - b.fecha_inicio.getTime()));
      setIsFormModalOpen(false);
    } finally {
      setFormLoading(false);
    }
  };

  const construirPayload = (): CreateSolicitudType => {
    const nombre: string[] = [];
    const fecha_inicio: Date[] = [];
    const fecha_fin: Date[] = [];
    const planesSalaIds: number[][] = [];

    solicitudes.forEach(solicitud => {
        nombre.push(solicitud.nombre);
        fecha_inicio.push(solicitud.fecha_inicio);
        fecha_fin.push(solicitud.fecha_fin);
        planesSalaIds.push(solicitud.planIds);
    });

    return {
      nombre,
      fecha_inicio,
      fecha_fin,
      planesSalaIds,
      numero: clientData.numero,
      link_vc: clientData.link_vc,
      contrato_generalId: clientData.id_contratoGeneral,
      contrato_especificoId: clientData.id_contratoEspecifico,
      nombre_solicitante: clientData.solicitante,
      entidad: clientData.entidad,
      cargo: clientData.cargo,
      correo: clientData.correo,
      grabar: solicitudes.map(s => s.grabar),
      info_contrato: contratoData,
  };
};

  const handleEnviarSolicitudes = async () => {
    setIsSending(true);
    const payload = construirPayload();

    try {
      const response = await solicitudApi.solicitar(payload);
      const { entidad, contrato_generalId, contrato_especificoId } = response.data.data;

      toast.success('Anexos creados exitosamente');
      setSolicitudes([]);

      if (blocker.state === 'blocked') {
        blocker.reset();
      }

      const hoy = new Date().toISOString().slice(0, 10);

      const filtros = new URLSearchParams({
        entidad,
        id_contratoGeneral: String(contrato_generalId),
        id_contratoEspecifico: String(contrato_especificoId),
        fechaDesde: hoy,
      }).toString();

      toast.success(response.data.message);

      setTimeout(() => {
        navigate(`/documentos?${filtros}`);
      }, 1000);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al crear anexos');
      setIsSending(false)
    }
  };

  const onPageChange = (page: number) => {
    setPaginationPage(page);
  };

  const validateDisponibilidad = async (items: Solicitud[]) => {
    const nombres: string[] = [];
    const fechasInicio: Date[] = [];
    const fechasFin: Date[] = [];

    items.forEach(item => {
      nombres.push(item.nombre);
      fechasInicio.push(new Date(item.fecha_inicio));
      fechasFin.push(new Date(item.fecha_fin));
    });

    const response = await solicitudApi.validarDisponibilidad(nombres, fechasInicio, fechasFin);

    const solicitudesActualizadas = items.map((item, i) => ({
      ...item,
      valida: response.data.data[i].valido,
    }));

    setSolicitudes(solicitudesActualizadas);
    solicitudesActualizadas.some(solicitud => !solicitud.valida)
      ? toast.error('Hubieron solicitudes inválidas')
      : toast.success('Validación completada');
  };

  const handleDeleteSolicitud = (index: number) => {
    setSolicitudes(prev => prev.filter((_, i) => i !== index));
  };

  const getItemsForPlan = async (plan: PlanSala, mes: number, año: number) => {
    const nombrePlan = plan.PlanBaseModel?.nombre;
    if (!nombrePlan) {
      return;
    }

    const req = { nombre: nombrePlan, mes, año };
    if (isRequestCached(req)) {
      return;
    }

    try {
      const response = await solicitudApi.obtenerPorMes(año, mes + 1, nombrePlan);

      if (response.data) {
        const eventosFormateados = response.data.data.map((evento: any) => ({
          ...evento,
          title: nombrePlan,
          planId: plan.id,
          fecha_inicio: new Date(evento.fecha_inicio),
          fecha_fin: new Date(evento.fecha_fin),
        }));

        setAllItems(prev => [...prev, ...eventosFormateados]);
        setReqsHistory(prev => [...prev, req]);
      }
    } catch (error) {
      console.error(`Error cargando eventos para ${nombrePlan}:`, error);
    }
  };

  const loadMissingPlansForCurrentMonth = async () => {
    const mes = currentDate.getMonth();
    const año = currentDate.getFullYear();

    for (const plan of selected) {
      await getItemsForPlan(plan, mes, año);
    }
  };

  useEffect(() => {
    loadMissingPlansForCurrentMonth();
  }, [selected, currentDate]);

  const handleNavigate = (date: Date) => {
    setCurrentDate(date);
  };

  const filteredItems = useMemo(() => {
    const selectedNames = selected.map(p => p.PlanBaseModel?.nombre);
    return allItems.filter(item => selectedNames.includes(item.title));
  }, [allItems, selected]);

  return (
    <div className='w-9/12'>
      <div className='flex items-center justify-between mb-1.5'>
        <div className='flex items-center'>
          <button onClick={solicitudes.length > 0 ? () => setIsBackModalOpen(true) : back} className='text-primary-dark hover:text-primary-extradark'>
            <ArrowLeftCircleIcon className='w-8 h-8' />
          </button>
          <div className='ml-4'>
            <span className='font-bold text-2xl'>Planes seleccionados: </span>
            <span className='text-lg'>{selected.length} {selected.length !== 1 ? 'planes' : 'plan'}</span>
          </div>
        </div>
        <div className='ml-5 space-x-1'>
          <span className='font-bold text-2xl'>Leyenda:</span>
          <span className='text-white bg-primary-dark rounded-3xl px-2 py-1.5'>confirmados</span>
          <span className='text-white bg-warning rounded-3xl px-2 py-1.5'>pendientes</span>
          <span className='text-white bg-success rounded-3xl px-2 py-1.5'>nuevos</span>
        </div>
      </div>
      <div className='h-136'>
        <Calendar
          localizer={localizer}
          events={filteredItems.concat(solicitudes as any)}
          startAccessor="fecha_inicio"
          endAccessor="fecha_fin"
          style={{ height: '100%', backgroundColor: 'white', borderRadius: '8px', padding: '3px' }}
          dayLayoutAlgorithm="no-overlap"
          views={['month', 'day']}
          view={currentView}
          onView={setCurrentView}
          defaultView="month"
          popup={true}
          showMultiDayTimes={true}
          date={currentDate}
          onSelectEvent={(event) => { setSelectedItem(event); setIsModalOpen(true); }}
          onNavigate={handleNavigate}
          messages={{
            next: 'Siguiente',
            previous: 'Anterior',
            today: 'Hoy',
            month: 'Mes',
            day: 'Día',
            allDay: 'Todo el día',
            showMore: (total) => `+ ${total} más`,
          }}
          formats={{
            monthHeaderFormat: 'MMMM yyyy',
            dayHeaderFormat: "EEEE d 'de' MMMM",
            dayFormat: 'd',
            weekdayFormat: 'EEEE',
            timeGutterFormat: 'HH:mm',
            eventTimeRangeFormat: ({ start, end }) => {
              return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
            },
          }}
          culture='es'
          showAllEvents={true}
          eventPropGetter={item => {
            let backgroundColor = '#F59E0B';
            if (item.estado === 'aceptado') {
              backgroundColor = '#162456';
            }
            if (item.estado === 'nueva') {
              backgroundColor = '#10B981';
            }
            return { style: { backgroundColor } };
          }}
        />
      </div>
      <div className='flex justify-between'>
        <button onClick={() => setIsClientInfoModalOpen(true)} className='mt-4 w-3/17 bg-primary-dark text-white py-2 rounded-md hover:bg-primary transition-colors flex items-center justify-center gap-1'>
            Datos del cliente {isValidClientData && <CheckBadgeIcon className='h-4 w-4' />}
        </button>
        <button onClick={() => setIsContratoModalOpen(true)} className='mt-4 w-3/17 bg-primary-dark text-white py-2 rounded-md hover:bg-primary transition-colors flex items-center justify-center gap-1'>
            Datos del contrato {isValidContractData && <CheckBadgeIcon className='h-4 w-4' />}
        </button>
        <button onClick={() => setIsFormModalOpen(true)} disabled={selected.length === 0 || !isValidClientData || !isValidContractData} className='mt-4 w-3/17 bg-primary-dark text-white py-2 rounded-md hover:bg-primary transition-colors disabled:bg-primary disabled:cursor-not-allowed'>Añadir solicitud</button>
        <button onClick={() => setIsListOpen(true)} disabled={solicitudes.length === 0 || !isValidClientData || !isValidContractData} className='mt-4 w-3/17 bg-primary-dark text-white py-2 rounded-md hover:bg-primary transition-colors disabled:bg-primary disabled:cursor-not-allowed'>Ver solicitudes ({solicitudes.length})</button>
        <button onClick={handleEnviarSolicitudes} disabled={solicitudes.length === 0 || !isValidClientData || !isValidContractData || isSending} className='mt-4 w-3/17 bg-primary-dark text-white py-2 rounded-md hover:bg-primary transition-colors disabled:bg-primary disabled:cursor-not-allowed'>{!isSending ? 'Enviando solicitud' : 'Realizar solicitud'} </button>
      </div>

      <ModalComponent isOpen={isClientInfoModalOpen} onClose={() => setIsClientInfoModalOpen(false)} title='Información del cliente'>
        <ClientInfoForm
          onSubmit={(data: ClientDataType) => {
            setClientData(data);
            setIsClientInfoModalOpen(false);
          }}
          clientData={clientData}
          validateLink={(link: string) => validarLink(link)}
        />
      </ModalComponent>

      <ModalComponent isOpen={isContratoModalOpen} onClose={() => setIsContratoModalOpen(false)} title='Datos del Contrato'>
        <ContratoInfoForm
            onSubmit={(data) => {
                setContratoData(data);
                setIsContratoModalOpen(false);
            }}
            contratoData={contratoData}
        />
    </ModalComponent>

      <ModalComponent isOpen={isListOpen} onClose={() => setIsListOpen(false)}>
        <div className='flex justify-between items-center'>
          <button onClick={() => validateDisponibilidad(solicitudes)} className='w-4/10 bg-primary-dark text-white py-2 rounded-md hover:bg-primary transition-colors'>Validar disponibilidad</button>
          <Pagination currentPage={paginationPage} totalPages={Math.ceil(solicitudes.length / 6)} onPageChange={onPageChange} />
        </div>
        <SolicitudList solicitudes={solicitudes.slice((paginationPage - 1) * 6, paginationPage * 6)} onDelete={handleDeleteSolicitud} onToggleGrabar={handleToggleGrabar}/>
      </ModalComponent>

      <ModalComponent isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedItem &&
          <div>
            <p><strong>Plan:</strong> {selectedItem.title}</p>
            <p><strong>Fecha de inicio:</strong> {selectedItem.fecha_inicio.toLocaleDateString()} : {selectedItem.fecha_inicio.toLocaleTimeString()}</p>
            <p><strong>Fecha de fin:</strong> {selectedItem.fecha_fin.toLocaleDateString()} : {selectedItem.fecha_fin.toLocaleTimeString()}</p>
            <p><strong>Estado:</strong> {selectedItem.estado}</p>
          </div>
        }
      </ModalComponent>

      <ModalComponent isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title="Nueva Solicitud">
        <SolicitudForm
          selectedPlanes={selected.map(p => ({ id: p.id, nombre: p.PlanBaseModel?.nombre || '' }))}
          onSubmit={handleCreateSolicitud}
          onCancel={() => setIsFormModalOpen(false)}
          loading={formLoading}
        />
      </ModalComponent>

      <ModalComponent isOpen={isBackModalOpen} onClose={() => setIsBackModalOpen(false)} title='⚠️ Advertencia'>
        <div className='items-center flex flex-col'>
          <span className='font-bold text-xl'>¿Seguro que desea volver atrás?</span>
          <br />
          <span className='text-gray-600'>La configuración realizada se perderá</span>
          <div className='flex space-x-3 mt-10'>
            <button className='bg-primary-dark p-2 rounded-md text-white' onClick={back}>Confirmar</button>
            <button className='border border-primary-dark p-2 rounded-md hover:text-white hover:bg-primary-dark transition-colors' onClick={() => setIsBackModalOpen(false)}>Cancelar</button>
          </div>
        </div>
      </ModalComponent>

      <ModalComponent isOpen={isBlockerModalOpen} onClose={handleBlockerCancel} title='⚠️ Advertencia'>
        <div className='items-center flex flex-col'>
          <span className='font-bold text-xl'>¿Seguro que desea volver atrás?</span>
          <br />
          <span className='text-gray-600'>La configuración realizada se perderá</span>
          <div className='flex space-x-3 mt-10'>
            <button className='bg-primary-dark p-2 rounded-md text-white' onClick={handleBlockerProceed}>Confirmar</button>
            <button className='border border-primary-dark p-2 rounded-md hover:text-white hover:bg-primary-dark transition-colors' onClick={handleBlockerCancel}>Cancelar</button>
          </div>
        </div>
      </ModalComponent>
    </div>
  );
};

export default CalendarSala;