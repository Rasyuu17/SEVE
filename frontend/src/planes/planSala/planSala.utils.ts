import type { PlanSala, PlanSalaType } from './planSala.interface';

export const parsePlanSalaToFormData = (plan: PlanSala): PlanSalaType => {
  return {
    nombre: plan.PlanBaseModel?.nombre || '',
    normalizacionTiempo: plan.PlanBaseModel?.normalizacionTiempo || 'mes',
    tarifa: plan.PlanBaseModel?.tarifa || 0,
    categoriaAnexable: plan.PlanBaseModel?.categoriaAnexable || 'sala',
    esIntegrable: plan.esIntegrable,
    esNacional: plan.esNacional,
    cantUsuariosLinea: plan.cantUsuariosLinea,
    cantUsuariosInvitados: plan.cantUsuariosInvitados,
    tieneVCReunionInteligente: plan.tieneVCReunionInteligente,
    tieneVCTodosPantalla: plan.tieneVCTodosPantalla,
    tieneVCRolesModerados: plan.tieneVCRolesModerados,
    tieneVCClaseVirtual: plan.tieneVCClaseVirtual,
    tieneColabEdicionAgenda: plan.tieneColabEdicionAgenda,
    tieneColabRealizarLlamadas: plan.tieneColabRealizarLlamadas,
    tieneColabCrearConferencias: plan.tieneColabCrearConferencias,
    tieneColabCompartirPantalla: plan.tieneColabCompartirPantalla,
    tieneColabControlRemoto: plan.tieneColabControlRemoto,
    tieneColabPresentacion: plan.tieneColabPresentacion,
    tieneColabEnviarArchivos: plan.tieneColabEnviarArchivos,
    tieneColabRecibirArchivos: plan.tieneColabRecibirArchivos,
    tieneColabGrabacion: plan.tieneColabGrabacion,
    tiempoAlmacenamiento: plan.tiempoAlmacenamiento,
    almacenamientoLocal: plan.almacenamientoLocal,
    extras: {
      salas_ids: plan.SalaModels?.map(s => s.id) || [],
    },
  };
};