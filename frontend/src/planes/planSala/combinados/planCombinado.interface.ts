import type { PlanSala } from '../planSala.interface';

export interface PlanCombinado {
  id: number;
  planesSala: PlanSala[];
}