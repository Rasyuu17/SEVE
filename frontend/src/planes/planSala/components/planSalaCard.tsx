import type { PlanSala } from '../planSala.interface';

interface PlanSalaCardProps {
  plan: PlanSala;
  onSelect?: (plan: PlanSala) => void;
}

export const PlanSalaCard = ({ plan, onSelect }: PlanSalaCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold text-primary-dark">{plan.PlanBaseModel?.nombre}</h3>
      <p className="text-2xl font-bold text-green-600 mt-2">
        {(plan.PlanBaseModel?.tarifa! / 100).toFixed(2)} cup <br />
        {(plan.PlanBaseModel?.tarifa! / plan.PlanBaseModel?.TasaCambioModel?.tasa!).toFixed(2)} usd
      </p>
      <p className="text-sm text-gray-500">por {plan.PlanBaseModel?.normalizacionTiempo}</p>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Usuarios en línea:</span>
          <span className="font-medium">{plan.cantUsuariosLinea}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Usuarios invitados:</span>
          <span className="font-medium">{plan.cantUsuariosInvitados}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Almacenamiento:</span>
          <span className="font-medium">{plan.tiempoAlmacenamiento} días</span>
        </div>
      </div>

      {onSelect && (
        <button
          onClick={() => onSelect(plan)}
          className="mt-4 w-full bg-primary-dark text-white py-2 rounded-md hover:bg-primary transition-colors"
        >
          Seleccionar
        </button>
      )}
    </div>
  );
};