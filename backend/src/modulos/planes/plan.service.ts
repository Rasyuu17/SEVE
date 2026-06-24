import { Transaction } from 'sequelize';
import { Injectable } from '../../helpers/decorators/injectable.decorator';
import { IPlanStrategy, PlanCompleto } from './IPlanStrategy.interface';
import { PlanSalaStrategy } from './planSala/planSala.strategy';

@Injectable(['PlanSalaStrategy'])
export class PlanService {
  private strategies: Map<string, IPlanStrategy<any>> = new Map();

  constructor(
    private planSalaStrategy: PlanSalaStrategy
  ) {
    this.strategies.set('sala', planSalaStrategy);
  }

  private getStrategy(tipo: string): IPlanStrategy<any> {
    const strategy = this.strategies.get(tipo);
    if (!strategy) {
      throw new Error(`Tipo de plan no soportado: ${tipo}`);
    }
    return strategy;
  }

  async crearPlan(tipo: string, id_tasa: number, data: any): Promise<PlanCompleto> {
    return this.getStrategy(tipo).crear(data, id_tasa);
  }

  async obtenerTodos(tipo: string) {
    return this.getStrategy(tipo).obtenerTodos();
  }

  async obtenerPlan(tipo: string, id: number): Promise<PlanCompleto> {
    return this.getStrategy(tipo).obtenerCompleto(id);
  }

  async modificarPlan(tipo: string, id: number, tasa_id: number, data: any, transaction?: Transaction): Promise<PlanCompleto> {
    return this.getStrategy(tipo).modificar(id, data, tasa_id, transaction);
  }

  async eliminarPlan(tipo: string, id: number): Promise<PlanCompleto> {
    return this.getStrategy(tipo).eliminar(id);
  }

  async obtenerUltimaVersionPlan(tipo: string, id: number, transaction?: Transaction): Promise<number>{
    return this.getStrategy(tipo).encontrarUltimaVersion(id, transaction);
  }

  /*async versionarPlanesPorNuevaTasa(tasa_id: number, transaction: Transaction): Promise<void> {
    for (const strategy of this.strategies.values()) {
      await strategy.versionarPorNuevaTasa(tasa_id, transaction);
    }
  }*/
}