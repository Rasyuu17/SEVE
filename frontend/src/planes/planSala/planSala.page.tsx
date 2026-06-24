import { useState } from 'react';

import { planApi } from './planSala.client';
import type { PlanSala, PlanSalaType } from './planSala.interface';
import { PlanSalaForm } from './planSalaForm';
import { PlanSalaList } from './planSalaList';
import { parsePlanSalaToFormData } from './planSala.utils';

const PlanesPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanSalaType & { id: number } | null>(null);

  const handleEdit = (plan: PlanSala) => {
    const planData = parsePlanSalaToFormData(plan);
    setEditingPlan({ ...planData, id: plan.id });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
      try {
        await planApi.eliminar(id);
        window.location.reload();
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
  };

  const handleCreate = () => {
    setEditingPlan(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPlan(null);
  };

  return (
    <div className="mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-primary-dark">Gestión de Planes</h1>

      {showForm ? (
        <PlanSalaForm
          initialData={editingPlan || undefined}
          onSuccess={handleCloseForm}
          onCancel={handleCloseForm}
        />
      ) : (
        <PlanSalaList
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
};

export default PlanesPage;