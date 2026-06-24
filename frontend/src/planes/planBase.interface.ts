import z from 'zod';

import { planBaseSchema } from './planBase.validator';

export type NormalizacionTiempo = 'hora' | 'dia' | 'mes';
export type CategoriaAnexable = 'sala' | 'autogestionado y eventos' | 'valor agregado';

export interface PlanBase {
  id: number;
  tasa_fk: number;
  nombre: string;
  normalizacionTiempo: NormalizacionTiempo;
  tarifa: number;
  categoriaAnexable: CategoriaAnexable;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  TasaCambioModel: { id: number; tasa: number };
}

export type PlanBaseType = z.infer<typeof planBaseSchema>;