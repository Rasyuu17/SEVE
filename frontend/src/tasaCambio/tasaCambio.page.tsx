import { TasaCambioForm } from './tasaCambioForm';
import { TasaActiva } from './tasaCambioActiva';

const TasaCambioPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Tasa de Cambio</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <TasaCambioForm />
        <TasaActiva />
      </div>
    </div>
  );
};

export default TasaCambioPage;