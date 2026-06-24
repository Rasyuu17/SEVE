import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckCircleIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  DocumentCheckIcon,
  ExclamationCircleIcon,
  EyeIcon,
  PhoneIcon,
  XCircleIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import Pagination from '../utils/pagination';
import type { PaginationInfo } from '../utils/pagination.interface';
import { documentoApi } from './documentos.client';
import { DocumentoFiltersComponent } from './documentosFilters';
import type { Documento, DocumentoFilters } from './documentos.interface';
import { formatDate } from './documentos.utils';
import { SolicitudesModal } from './solicitudes.modal';
import ModalComponent from '../components/Modal';
import { solicitudApi } from '../planes/planSala/solicitud/solicitudSala.client';

export const DocumentoList = () => {
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 7,
  });
  const [modalDocumento, setModalDocumento] = useState<Documento | null>(null);
  const [documentoAFirmar, setDocumentoAFirmar] = useState<number | null>(null);
  const [filters, setFilters] = useState<DocumentoFilters>({
    search: searchParams.get('search') || '',
    entidad: searchParams.get('entidad') || '',
    nombre_solicitante: searchParams.get('nombre_solicitante') || '',
    correo: searchParams.get('correo') || '',
    id_contratoGeneral: searchParams.get('id_contratoGeneral') || '',
    id_contratoEspecifico: searchParams.get('id_contratoEspecifico') || '',
    numero: searchParams.get('numero') || '',
    fechaDesde: searchParams.get('fechaDesde') || '',
    fechaHasta: searchParams.get('fechaHasta') || '',
    page: 1,
    limit: 7,
  });
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    titulo: string;
    mensaje: string;
    onConfirm: () => void;
  }>({ open: false, titulo: '', mensaje: '', onConfirm: () => {} });

  const abrirConfirmacion = (titulo: string, mensaje: string, onConfirm: () => void) => {
    setConfirmModal({ open: true, titulo, mensaje, onConfirm });
  };

  const handleConfirmar = (documento: Documento) => {
    abrirConfirmacion(
      'Confirmar cambios de tarifas',
      `¿Está seguro de confirmar los cambios para el documento de ${documento.entidad}?`,
      async () => {
        try {
          await documentoApi.confirmar(documento.id, 'sala');
          toast.success('Documento confirmado');
          cargarDocumentos();
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Error al confirmar');
        }
      }
    );
  };

  const handleRechazar = (documento: Documento) => {
    abrirConfirmacion(
      'Rechazar cambios de tarifas',
      `¿Está seguro de rechazar los cambios? Las solicitudes serán anuladas.`,
      async () => {
        try {
          await solicitudApi.cancelarPorDocumento(documento.id);
          toast.success('Cambios rechazados');
          cargarDocumentos();
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Error al rechazar');
        }
      }
    );
  };

  const cargarDocumentos = async () => {
    try {
      const params: Record<string, string> = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params[key] = String(value);
        }
      });

      const response = await documentoApi.buscar(params);
      setDocumentos(response.data.data);
      setPagination({
        currentPage: response.data.pagination.page,
        totalPages: response.data.pagination.totalPages,
        totalItems: response.data.pagination.total,
        itemsPerPage: response.data.pagination.limit,
      });
    } catch (error) {
      console.error('Error al cargar documentos:', error);
    }
  };

  useEffect(() => {
    cargarDocumentos();
  }, [filters.page, filters.limit]);

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
    cargarDocumentos();
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleDescargar = async (documento: Documento, firmado: boolean = false) => {
    try {
      const response = await documentoApi.descargar(documento.id, firmado);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `documento_${documento.numero}${firmado ? '_firmado' : ''}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Error al descargar el documento');
    }
  };

  const handleUploadFirmado = (documento: Documento) => {
    setDocumentoAFirmar(documento.id);
    fileInputRef.current?.click();
  };

  const estaFirmado = (doc: Documento) => {
    return !!doc.direccion_firmado;
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !documentoAFirmar) {
      return;
    }

    try {
      await documentoApi.subirFirmado(documentoAFirmar, file);
      toast.success('Documento firmado subido correctamente');
      cargarDocumentos();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al subir');
    }

    setDocumentoAFirmar(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <DocumentoFiltersComponent
        filters={filters}
        onChange={setFilters}
        onSearch={handleSearch}
      />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Entidad
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Solicitante
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Contacto
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Contratos
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Estado
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-32">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {documentos.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-4 text-center text-gray-500">
                  No se encontraron documentos
                </td>
              </tr>
            ) : (
              documentos.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {doc.entidad}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {doc.nombre_solicitante}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <PhoneIcon className="h-3 w-3" />
                      <span>{doc.numero}</span>
                    </div>
                    <div className="text-xs">{doc.correo}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="text-xs">Gral: {doc.id_contratoGeneral}</div>
                    <div className="text-xs">Esp: {doc.id_contratoEspecifico}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(doc.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                  {doc.estado === 'necesita confirmacion' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-700">
                      <ExclamationCircleIcon className="h-4 w-4"/>
                      Por confirmar
                    </span>
                  ) : doc.estado === 'terminado' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700">
                      <LockClosedIcon className="h-4 w-4"/>
                      Terminado
                    </span>) : estaFirmado(doc) ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                      <DocumentCheckIcon className="h-4 w-4" />
                      Firmado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-700">
                      <DocumentArrowUpIcon className="h-4 w-4" />
                      Sin firmar
                    </span>
                  )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setModalDocumento(doc)}
                        className="text-rose-600 hover:text-rose-900"
                        title="Ver solicitudes"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDescargar(doc)}
                        className="text-primary hover:text-primary-dark"
                        title="Descargar original"
                      >
                        <DocumentArrowDownIcon className="h-5 w-5" />
                      </button>
                      
                      {estaFirmado(doc) ? (
                        <button
                          onClick={() => handleDescargar(doc, true)}
                          className="text-green-600 hover:text-green-900"
                          title="Descargar firmado"
                        >
                          <DocumentCheckIcon className="h-5 w-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUploadFirmado(doc)}
                          className="text-yellow-600 hover:text-yellow-900 disabled:cursor-not-allowed"
                          title="Subir firmado"
                          disabled={doc.estado == 'necesita confirmacion' || doc.estado == 'terminado'}
                        >
                          <DocumentArrowUpIcon className="h-5 w-5" />
                        </button>
                      )}
                      {doc.estado === 'necesita confirmacion' && 
                      <>
                        <button
                          onClick={() => handleConfirmar(doc)}
                          className="text-green-600 hover:text-green-900"
                          title="Confirmar cambios"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleRechazar(doc)}
                          className="text-red-600 hover:text-red-900"
                          title="Rechazar cambios"
                        >
                          <XCircleIcon className="h-5 w-5" />
                        </button>
                      </>}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {pagination.totalItems} documentos encontrados
            </span>
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileSelected}
      />
      {modalDocumento && (
        <SolicitudesModal
          documento={modalDocumento}
          onClose={() => {setModalDocumento(null), cargarDocumentos()}}
        />
      )}
      <ModalComponent
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal(prev => ({ ...prev, open: false }))}
        title={confirmModal.titulo}
      >
        <div className="flex flex-col items-center gap-4 py-4">
          <p className="text-gray-600">{confirmModal.mensaje}</p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                confirmModal.onConfirm();
                setConfirmModal(prev => ({ ...prev, open: false }));
              }}
              className="bg-error text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Confirmar
            </button>
            <button
              onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}
              className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      </ModalComponent>
    </div>
  );
};