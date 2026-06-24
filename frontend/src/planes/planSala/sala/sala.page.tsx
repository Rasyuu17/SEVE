import { SalaForm } from './salaForm';
import { SalaList } from './salaList';

const SalaPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-primary-dark">Gestión de Salas</h1>
      <div className="grid md:grid-cols-3 gap-6 container">
        <div>
            <SalaForm />
        </div>
        <div className='col-span-2'>
            <SalaList />
        </div>
      </div>
    </div>
  );
};

export default SalaPage;