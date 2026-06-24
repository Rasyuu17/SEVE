import { container } from "./services.container";
import { TasaCambioService } from "../modulos/tasaCambio/tasaCambio.service";

export async function initTasa(): Promise<void> {
    const hayTasa = await container.get<TasaCambioService>('TasaCambioService').initTasa()
    if(!hayTasa){
      throw new Error('Error inicializando la tasa de cambio');
    }
  }