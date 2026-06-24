import { addDays, addMonths, eachMonthOfInterval, eachWeekOfInterval, format, isWithinInterval } from 'date-fns';
import { useState } from 'react';

import type { Solicitud } from './solicitudList';

interface SolicitudFormProps {
  selectedPlanes: { id: number; nombre: string }[];
  onSubmit: (solicitudes: any[]) => void;
  onCancel: () => void;
  loading?: boolean;
}

type RecurrenciaTipo = 'simple' | 'semanal' | 'mensual_dias' | 'mensual_semana';

export const SolicitudForm = ({ selectedPlanes, onSubmit, onCancel, loading }: SolicitudFormProps) => {
  const [recurrenciaTipo, setRecurrenciaTipo] = useState<RecurrenciaTipo>('simple');
  const [grabar, setGrabar] = useState(false);

  const [duracionHoras, setDuracionHoras] = useState(2);
  const [duracionMinutos, setDuracionMinutos] = useState(0);

  const [fechaSimple, setFechaSimple] = useState(new Date());
  const [horaSimple, setHoraSimple] = useState('09:00');

  const [fechaInicioRecurrencia, setFechaInicioRecurrencia] = useState(new Date());
  const [fechaFinRecurrencia, setFechaFinRecurrencia] = useState(addMonths(new Date(), 3));
  const [horaRecurrencia, setHoraRecurrencia] = useState('09:00');

  const [diasSemana, setDiasSemana] = useState<number[]>([1]);
  const diasSemanaOptions = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
    { value: 0, label: 'Domingo' },
  ];

  const [diasMes, setDiasMes] = useState<number[]>([1, 15]);

  const [semanaMes, setSemanaMes] = useState<number>(1);
  const [diaSemanaMes, setDiaSemanaMes] = useState<number>(1);

  const parseDateInput = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const calcularFechaFin = (fecha: Date) => {
    const fin = new Date(fecha);
    fin.setHours(fin.getHours() + duracionHoras);
    fin.setMinutes(fin.getMinutes() + duracionMinutos);
    return fin;
  };

  const generarFechasRecurrentes = () => {
    const fechas: Date[] = [];

    if (recurrenciaTipo === 'simple') {
      const [h, m] = horaSimple.split(':').map(Number);
      const start = new Date(fechaSimple);
      start.setHours(h, m);
      return [{ start, end: calcularFechaFin(start) }];
    }

    const [h, m] = horaRecurrencia.split(':').map(Number);

    if (recurrenciaTipo === 'semanal') {
      const weeks = eachWeekOfInterval({ start: fechaInicioRecurrencia, end: fechaFinRecurrencia });

      weeks.forEach(weekStart => {
        diasSemana.forEach(dia => {
          const fecha = addDays(weekStart, dia);
          if (isWithinInterval(fecha, { start: fechaInicioRecurrencia, end: fechaFinRecurrencia })) {
            const start = new Date(fecha);
            start.setHours(h, m);
            fechas.push(start);
          }
        });
      });
    }

    if (recurrenciaTipo === 'mensual_dias') {
      const months = eachMonthOfInterval({ start: fechaInicioRecurrencia, end: fechaFinRecurrencia });

      months.forEach(month => {
        diasMes.forEach(dia => {
          const fecha = new Date(month.getFullYear(), month.getMonth(), dia);
          if (fecha >= fechaInicioRecurrencia && fecha <= fechaFinRecurrencia) {
            const start = new Date(fecha);
            start.setHours(h, m);
            fechas.push(start);
          }
        });
      });
    }

    if (recurrenciaTipo === 'mensual_semana') {
      const months = eachMonthOfInterval({ start: fechaInicioRecurrencia, end: fechaFinRecurrencia });

      months.forEach(month => {
        const primerDia = new Date(month.getFullYear(), month.getMonth(), 1);
        let fecha: Date | null = null;

        if (semanaMes === 1) {
          fecha = addDays(primerDia, (diaSemanaMes - primerDia.getDay() + 7) % 7);
        } else if (semanaMes === 2) {
          fecha = addDays(primerDia, (diaSemanaMes - primerDia.getDay() + 7) % 7 + 7);
        } else if (semanaMes === 3) {
          fecha = addDays(primerDia, (diaSemanaMes - primerDia.getDay() + 7) % 7 + 14);
        } else if (semanaMes === 4) {
          fecha = addDays(primerDia, (diaSemanaMes - primerDia.getDay() + 7) % 7 + 21);
        } else if (semanaMes === -1) {
          const ultimoDia = new Date(month.getFullYear(), month.getMonth() + 1, 0);
          fecha = addDays(ultimoDia, (diaSemanaMes - ultimoDia.getDay() - 7) % 7);
        }

        if (fecha && fecha >= fechaInicioRecurrencia && fecha <= fechaFinRecurrencia) {
          const start = new Date(fecha);
          start.setHours(h, m);
          fechas.push(start);
        }
      });
    }

    return fechas.map(fecha => ({
      start: fecha,
      end: calcularFechaFin(fecha),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fechasGeneradas = generarFechasRecurrentes();
    const nombre = selectedPlanes.map((p) => p.nombre).join('&&');
    const solicitudes: Solicitud[] = fechasGeneradas.map(({ start, end }) => ({
      nombre,
      title: selectedPlanes.map((p) => p.nombre).join(' + '),
      fecha_inicio: start,
      fecha_fin: end,
      planIds: selectedPlanes.map(p => p.id),
      estado: 'nueva',
      grabar: grabar,
    }));

    onSubmit(solicitudes);
  };

  const toggleDiaSemana = (dia: number) => {
    setDiasSemana(prev =>
      prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]
    );
  };

  const toggleDiaMes = (dia: number) => {
    setDiasMes(prev =>
      prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]
    );
  };

  const duracionTexto = `${duracionHoras}h ${duracionMinutos > 0 ? `${duracionMinutos}min` : ''}`;
  const tituloVistaPrevia = selectedPlanes.map((p) => p.nombre).join(' + ');

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto p-2">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Planes seleccionados
        </label>
        <div className="bg-gray-100 p-2 rounded-md">
          {selectedPlanes.map((p, idx) => (
            <span key={p.id} className="inline-block bg-primary-light text-white text-xs px-2 py-1 rounded mr-1 mb-1">
              {idx + 1}. {p.nombre}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Título: <span className="font-mono">{tituloVistaPrevia}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duración (horas)
          </label>
          <input
            name="duracion.horas"
            type="number"
            value={duracionHoras}
            onChange={(e) => setDuracionHoras(Number(e.target.value))}
            min={0}
            step={1}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duración (minutos)
          </label>
          <input
            name="duracion.minutos"
            type="number"
            value={duracionMinutos}
            onChange={(e) => setDuracionMinutos(Math.min(59, Math.max(0, Number(e.target.value))))}
            min={0}
            max={59}
            step={5}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
      </div>
      <p className="text-xs text-gray-500 -mt-2">Total: {duracionTexto}</p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo
        </label>
        <select
          value={recurrenciaTipo}
          onChange={(e) => setRecurrenciaTipo(e.target.value as RecurrenciaTipo)}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="simple">Normal (una sola fecha)</option>
          <option value="semanal">Recurrente - Semanal</option>
          <option value="mensual_dias">Recurrente - Mensual (días específicos)</option>
          <option value="mensual_semana">Recurrente - Mensual (ej: primer lunes)</option>
        </select>
      </div>

      {recurrenciaTipo === 'simple' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={format(fechaSimple, 'yyyy-MM-dd')}
              onChange={(e) => setFechaSimple(parseDateInput(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora
            </label>
            <input
              type="time"
              value={horaSimple}
              onChange={(e) => setHoraSimple(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>
      )}

      {recurrenciaTipo !== 'simple' && (
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Desde
            </label>
            <input
              type="date"
              value={format(fechaInicioRecurrencia, 'yyyy-MM-dd')}
              onChange={(e) => setFechaInicioRecurrencia(parseDateInput(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hasta
            </label>
            <input
              type="date"
              value={format(fechaFinRecurrencia, 'yyyy-MM-dd')}
              onChange={(e) => setFechaFinRecurrencia(parseDateInput(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora
            </label>
            <input
              type="time"
              value={horaRecurrencia}
              onChange={(e) => setHoraRecurrencia(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>
      )}

      {recurrenciaTipo === 'semanal' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Días
          </label>
          <div className="flex flex-wrap gap-2">
            {diasSemanaOptions.map(dia => (
              <button
                key={dia.value}
                type="button"
                onClick={() => toggleDiaSemana(dia.value)}
                className={`px-3 py-1 rounded-full text-sm ${
                  diasSemana.includes(dia.value)
                    ? 'bg-primary-dark text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {dia.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {recurrenciaTipo === 'mensual_dias' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Días del mes
          </label>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
            {Array.from({ length: 31 }, (_, i) => i + 1).map(dia => (
              <button
                key={dia}
                name={`dia.${dia}`}
                type="button"
                onClick={() => toggleDiaMes(dia)}
                className={`w-10 h-10 rounded-full text-sm ${
                  diasMes.includes(dia)
                    ? 'bg-primary-dark text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {dia}
              </button>
            ))}
          </div>
        </div>
      )}

      {recurrenciaTipo === 'mensual_semana' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semana
            </label>
            <select
              value={semanaMes}
              onChange={(e) => setSemanaMes(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value={1}>Primera</option>
              <option value={2}>Segunda</option>
              <option value={3}>Tercera</option>
              <option value={4}>Cuarta</option>
              <option value={-1}>Última</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Día
            </label>
            <select
              value={diaSemanaMes}
              onChange={(e) => setDiaSemanaMes(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value={1}>Lunes</option>
              <option value={2}>Martes</option>
              <option value={3}>Miércoles</option>
              <option value={4}>Jueves</option>
              <option value={5}>Viernes</option>
              <option value={6}>Sábado</option>
              <option value={0}>Domingo</option>
            </select>
          </div>
        </div>
      )}

      <label className="flex items-center gap-2 cursor-pointer">
          <input
              type="checkbox"
              checked={grabar}
              onChange={(e) => setGrabar(e.target.checked)}
              className="accent-primary-dark"
          />
          <span className="text-sm">Grabar videoconferencia</span>
      </label>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary-dark text-white rounded-md hover:bg-primary-extradark disabled:opacity-50"
        >
          {loading ? 'Creando...' : 'Crear Solicitud'}
        </button>
      </div>
    </form>
  );
};