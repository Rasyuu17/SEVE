import { useState } from 'react';
import toast from 'react-hot-toast';
import { z } from 'zod';

const contratoDataSchema = z.object({
    agente: z.object({
        nombre: z.string().min(2, 'Nombre requerido'),
        apellido: z.string().min(2, 'Apellido requerido'),
        unidad: z.string().min(2, 'Unidad requerida'),
        cargo: z.string().min(2, 'Cargo requerido'),
        telefono: z.string().min(8, 'Debe tener 8 digitos').max(8, 'Debe tener 8 digitos'),
        correo: z.email('Correo inválido'),
    }),
    especialista: z.object({
        nombre: z.string().min(2, 'Nombre requerido'),
        telefono: z.string().min(8, 'Debe tener 8 digitos').max(8, 'Debe tener 8 digitos'),
        correo: z.email('Correo inválido'),
    }),
    ubicacion: z.object({
        municipio: z.string().min(2, 'Municipio requerido'),
        provincia: z.string().min(2, 'Provincia requerida'),
    }),
    facturacion: z.object({
        tipo: z.enum(['comercial', 'telefonica']),
        numero: z.string().min(8, 'Debe tener 8 digitos').max(8, 'Debe tener 8 digitos').optional(),
    }).refine(
    (data) => data.tipo !== 'telefonica' || (data.numero && data.numero.length >= 8),
    { message: 'Debe tener 8 dígitos', path: ['numero'] }
),
});

export type ContratoDataType = z.infer<typeof contratoDataSchema>;

interface ContratoInfoFormProps {
    onSubmit: (info: ContratoDataType) => void;
    contratoData?: ContratoDataType | null;
}

const emptyContrato: ContratoDataType = {
    agente: { nombre: '', apellido: '', unidad: '', cargo: '', telefono: '', correo: '' },
    especialista: { nombre: '', telefono: '', correo: '' },
    ubicacion: { municipio: '', provincia: '' },
    facturacion: { tipo: 'comercial' },
};

export const ContratoInfoForm: React.FC<ContratoInfoFormProps> = ({ onSubmit, contratoData }) => {
    const [data, setData] = useState<ContratoDataType>(contratoData || emptyContrato);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = () => {
        const newErrors: Record<string, string> = {};

        // Validación extra para facturación telefónica
        if (data.facturacion.tipo === 'telefonica' && (!data.facturacion.numero || data.facturacion.numero.length < 8)) {
            newErrors['facturacion.numero'] = 'Debe tener 8 dígitos';
        }

        // Validar el resto con Zod
        const result = contratoDataSchema.safeParse(data);
        if (!result.success) {
            result.error.issues.forEach(issue => {
                const path = issue.path.join('.');
                if (!newErrors[path]) newErrors[path] = issue.message;
            });
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error('Corrija los campos marcados');
            return;
        }

        setErrors({});
        onSubmit(data);
        toast.success('Datos del contrato guardados');
    };

    const setAgente = (field: string, value: string) =>
        setData(prev => ({ ...prev, agente: { ...prev.agente, [field]: value } }));
    const setEspecialista = (field: string, value: string) =>
        setData(prev => ({ ...prev, especialista: { ...prev.especialista, [field]: value } }));
    const setUbicacion = (field: string, value: string) =>
        setData(prev => ({ ...prev, ubicacion: { ...prev.ubicacion, [field]: value } }));

    const input = (path: string, label: string, value: string, onChange: (v: string) => void, placeholder?: string, type = 'text') => {
        const hasError = errors[path];
        return (
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">
                    {label} {hasError && <span className="text-error">: {hasError}</span>}
                </label>
                <input
                    name={`${path}`}
                    type={type}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className={`w-full px-3 py-1.5 border rounded-md text-sm focus:ring-2 focus:ring-primary-dark outline-none ${
                        hasError ? 'border-error' : 'border-gray-300'
                    }`}
                    placeholder={placeholder}
                />
            </div>
        );
    };

    return (
        <form className="space-y-4 w-180 overflow-y-auto">
            {/* Agente Comercial */}
            <fieldset className="border border-gray-200 rounded-lg p-3">
                <legend className="text-sm font-semibold text-primary-dark px-2">Agente Comercial</legend>
                <div className="grid grid-cols-3 gap-2">
                    {input('agente.nombre', 'Nombre', data.agente.nombre, v => setAgente('nombre', v))}
                    {input('agente.apellido', 'Apellido', data.agente.apellido, v => setAgente('apellido', v))}
                    {input('agente.unidad', 'Unidad', data.agente.unidad, v => setAgente('unidad', v))}
                    {input('agente.cargo', 'Cargo', data.agente.cargo, v => setAgente('cargo', v))}
                    {input('agente.telefono', 'Teléfono', data.agente.telefono, v => setAgente('telefono', v))}
                    {input('agente.correo', 'Correo', data.agente.correo, v => setAgente('correo', v), 'correo@etecsa.cu', 'email')}
                </div>
            </fieldset>

            {/* Especialista Técnico */}
            <fieldset className="border border-gray-200 rounded-lg p-3">
                <legend className="text-sm font-semibold text-primary-dark px-2">Especialista Técnico</legend>
                <div className="grid grid-cols-3 gap-2">
                    {input('especialista.nombre', 'Nombre', data.especialista.nombre, v => setEspecialista('nombre', v))}
                    {input('especialista.telefono', 'Teléfono', data.especialista.telefono, v => setEspecialista('telefono', v))}
                    {input('especialista.correo', 'Correo', data.especialista.correo, v => setEspecialista('correo', v), '', 'email')}
                </div>
            </fieldset>

            {/* Ubicación del Cliente */}
            <fieldset className="border border-gray-200 rounded-lg p-3">
                <legend className="text-sm font-semibold text-primary-dark px-2">Ubicación del Cliente</legend>
                <div className="grid grid-cols-2 gap-2">
                    {input('ubicacion.municipio', 'Municipio', data.ubicacion.municipio, v => setUbicacion('municipio', v))}
                    {input('ubicacion.provincia', 'Provincia', data.ubicacion.provincia, v => setUbicacion('provincia', v))}
                </div>
            </fieldset>

            {/* Facturación */}
            <fieldset className="border border-gray-200 rounded-lg p-3">
                <legend className="text-sm font-semibold text-primary-dark px-2">Facturación</legend>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                            type="radio"
                            name="facturacion"
                            checked={data.facturacion.tipo === 'comercial'}
                            onChange={() => setData(prev => ({ ...prev, facturacion: { tipo: 'comercial' } }))}
                            className="accent-primary-dark"
                        />
                        Factura comercial entregada por ETECSA al CLIENTE
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                            type="radio"
                            name="facturacion"
                            checked={data.facturacion.tipo === 'telefonica'}
                            onChange={() => setData(prev => ({ ...prev, facturacion: { tipo: 'telefonica' } }))}
                            className="accent-primary-dark"
                        />
                        Próxima factura telefónica al número:
                    </label>
                    {data.facturacion.tipo === 'telefonica' && (
                        <div className='flex items-center gap-2'>
                        <input
                            type="text"
                            value={data.facturacion.numero || ''}
                            onChange={e => setData(prev => ({ ...prev, facturacion: { tipo: 'telefonica', numero: e.target.value } }))}
                            className={`w-40 px-3 py-1.5 border ${errors['facturacion.numero'] ? 'border-error' :'border-gray-300'}  rounded-md text-sm ml-6`}
                            placeholder="Número"
                        />
                         {errors['facturacion.numero'] && (
                            <p className="text-error text-xs mt-1">{errors['facturacion.numero']}</p>
                        )}</div>
                    )}
                </div>
            </fieldset>

            <button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-primary-dark text-white py-2 rounded-lg hover:bg-primary-extradark transition-colors font-medium"
            >
                Guardar Datos del Contrato
            </button>
        </form>
    );
};