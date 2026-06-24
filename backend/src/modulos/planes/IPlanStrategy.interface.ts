import { Transaction } from 'sequelize';

import PlanBaseModel from './planBase.model';
import { PlanBaseType } from './planBase.validator';

export type PlanCompleto = { PlanBaseModel: PlanBaseModel };

export interface IPlanStrategy<T = any> {
  crear(data: PlanBaseType & T & { extras?: any }, id_tasa: number, transaction?: any): Promise<PlanCompleto & T>;
  obtenerTodos(): Promise<(PlanCompleto & T)[]>;
  obtenerCompleto(id: number): Promise<PlanCompleto & T>;
  modificar(id: number, data: Partial<PlanBaseType & T> & { extras?: any }, id_tasa: number, transaction?: Transaction): Promise<PlanCompleto & T>;
  eliminar(id: number, transaction?: Transaction): Promise<PlanCompleto & T>;
  encontrarUltimaVersion(idViejo: number, transaction?: Transaction): Promise<number>;
  /*versionarPorNuevaTasa(tasa_id: number, transaction: Transaction): Promise<void>;*/
}