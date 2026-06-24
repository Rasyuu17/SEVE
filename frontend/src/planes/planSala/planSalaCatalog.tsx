import { useEffect, useState } from 'react';

import { PlanSalaCard } from './components/planSalaCard';
import { PlanCombinadoCard } from './combinados/planCombinadoCard';
import { planApi } from './planSala.client';
import type { PlanSala } from './planSala.interface';
import CalendarSala from './solicitud/salaCalendar';

type TipoOferta = 'nacional' | 'provincial' | 'combinado';

export const PlanSalaCatalog = () => {
  const [nacionales, setNacionales] = useState<PlanSala[]>([]);
  const [provinciales, setProvinciales] = useState<PlanSala[]>([]);
  const [tipoActivo, setTipoActivo] = useState<TipoOferta>('nacional');
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [checkPlans, setCheckPlans] = useState<PlanSala[]>([]);
  const [planesIntegrables, setPlanesIntegrables] = useState<PlanSala[]>([]);
  const [todosLosPlanes, setTodosLosPlanes] = useState<PlanSala[]>([]);
  const [filtroCatalogo, setFiltroCatalogo] = useState<TipoOferta>('nacional');

  const handleCheckboxChange = (plan: PlanSala, checked: boolean) => {
    if (checked) {
      setCheckPlans([...checkPlans, plan]);
    } else {
      setCheckPlans(checkPlans.filter(p => p.id !== plan.id));
    }
  };

  const handleSelectPlan = (plan: PlanSala) => {
    setCheckPlans([plan]);
    setShowCalendar(true);
  };

  const handleSelectCombinado = (planes: PlanSala[]) => {
    setCheckPlans(planes);
    setShowCalendar(true);
  };

  useEffect(() => {
    const cargarPlanes = async () => {
      try {
        const response = await planApi.listar();
        const planes = response.data;

        setTodosLosPlanes(planes);
        setNacionales(planes.filter(p => p.esNacional === true));
        setProvinciales(planes.filter(p => p.esNacional === false));
        setPlanesIntegrables(planes.filter(p => p.esIntegrable === true));
      } catch (error) {
        console.error('Error al cargar planes:', error);
      } finally {
        setLoading(false);
      }
    };
    cargarPlanes();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Cargando planes...</div>;
  }

  const planesActuales = tipoActivo === 'nacional' ? nacionales : provinciales;
  const titulo = tipoActivo === 'nacional' ? 'Planes Nacionales' : tipoActivo === 'provincial' ? 'Planes Provinciales' : 'Planes Combinados';



    const handleFiltroChange = (tipo: TipoOferta) => {
        setFiltroCatalogo(tipo);
        setCheckPlans([]);
    };
  if (showCalendar) {
    const nacionalesLista = todosLosPlanes.filter(p => p.esNacional);
    const provincialesLista = todosLosPlanes.filter(p => !p.esNacional);
    const integrablesNac = planesIntegrables.filter(p => p.esNacional);
    const integrablesProv = planesIntegrables.filter(p => !p.esNacional);

    return (
      <div className='flex gap-y-2 gap-x-6'>
        <CalendarSala
          selected={checkPlans}
          back={() => setShowCalendar(false)}
          validateLink={() => {}}
        />
        <div className='mt-2 w-78'>
          <div className="flex gap-2 mb-3 justify-evenly">
            {(['nacional', 'provincial', 'combinado'] as const).map(t => (
              <button
                key={t}
                onClick={() => handleFiltroChange(t)}
                className={`px-5 py-1 rounded text-sm ${
                filtroCatalogo === t ? 'bg-primary-dark text-white' : 'bg-gray-200'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="max-h-100 overflow-y-auto space-y-1">
            {filtroCatalogo === 'combinado' ? (
              <>
                {integrablesNac.length > 0 && (
                  <p className="text-xs font-bold text-primary-dark border-b pb-1">Nacionales</p>
                )}
                {integrablesNac.map(plan => (
                  <label key={plan.id} className="flex items-center gap-2 cursor-pointer text-sm py-0.5">
                    <input
                      type="checkbox"
                      checked={checkPlans.some(p => p.id === plan.id)}
                      onChange={e => handleCheckboxChange(plan, e.target.checked)}
                      className="accent-primary-dark"
                    />
                      {plan.PlanBaseModel?.nombre}
                  </label>
                ))}
                {integrablesProv.length > 0 && (
                  <p className="text-xs font-bold text-primary-dark border-b pb-1 mt-2">Provinciales</p>
                )}
                {integrablesProv.map(plan => (
                  <label key={plan.id} className="flex items-center gap-2 cursor-pointer text-sm py-0.5">
                  <input
                    type="checkbox"
                    checked={checkPlans.some(p => p.id === plan.id)}
                    onChange={e => handleCheckboxChange(plan, e.target.checked)}
                    className="accent-primary-dark"
                   />
                    {plan.PlanBaseModel?.nombre}
                   </label>
                  ))}
              </>
                  ) : (
                  (filtroCatalogo === 'nacional' ? nacionalesLista : provincialesLista).map((plan, i) => (
                    <label key={plan.id} className="flex items-center gap-2 cursor-pointer text-sm py-0.5">
                      <input
                        type="radio"
                        name="planSeleccionado"
                        checked={checkPlans.some(p => p.id === plan.id)}
                        onChange={() => setCheckPlans([plan])}
                        className="accent-primary-dark"
                      />
                        {i + 1}. {plan.PlanBaseModel?.nombre}
                    </label>
                  ))
              )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-primary-dark mb-6">Catálogo de Planes</h1>
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="bg-gray-200 rounded-lg p-1 inline-flex">
            <button
              onClick={() => setTipoActivo('nacional')}
              className={`px-6 py-2 rounded-md transition-all ${
                tipoActivo === 'nacional'
                  ? 'bg-primary-dark text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-300'
              }`}
            >
              Nacionales
            </button>
            <button
              onClick={() => setTipoActivo('provincial')}
              className={`px-6 py-2 rounded-md transition-all ${
                tipoActivo === 'provincial'
                  ? 'bg-primary-dark text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-300'
              }`}
            >
              Provinciales
            </button>
            <button
              onClick={() => setTipoActivo('combinado')}
              className={`px-6 py-2 rounded-md transition-all ${
                tipoActivo === 'combinado'
                  ? 'bg-primary-dark text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-300'
              }`}
            >
              Combinado
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-primary-dark text-center">{titulo}</h2>

        {tipoActivo === 'combinado' ? (
          planesIntegrables.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay planes integrables disponibles</p>
          ) : (
            <PlanCombinadoCard
              planesIntegrables={planesIntegrables}
              onSelect={handleSelectCombinado}
            />
          )
        ) : planesActuales.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No hay planes {tipoActivo}es disponibles</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {planesActuales.map(plan => (
              <PlanSalaCard
                key={plan.id}
                plan={plan}
                onSelect={() => handleSelectPlan(plan)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};