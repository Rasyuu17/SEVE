import { DocumentoList } from './documentosList';

const DocumentosPage = () => {
  return (
    <div className="mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-primary-dark">
        Repositorio de Documentos
      </h1>

      <DocumentoList />
    </div>
  );
};

export default DocumentosPage;