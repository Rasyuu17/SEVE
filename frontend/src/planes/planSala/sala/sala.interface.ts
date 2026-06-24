import z from 'zod';

import { salaSchema } from './sala.validator';

export interface Sala {
  id: number;
  nombre: string;
  tieneTerminal: boolean;
  ubicacion: string;
}

export type SalaType = z.infer<typeof salaSchema>;