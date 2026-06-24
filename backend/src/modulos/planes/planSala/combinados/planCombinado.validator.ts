import z from 'zod';

export const planCombinadoSchema = z.object({
  planes: z.array(z.number()).min(2, 'Debe haber al menos dos planes para combinar'),
});

export type PlanCombinadoCreationType = z.infer<typeof planCombinadoSchema>;