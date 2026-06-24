import { useState } from 'react';
import toast from 'react-hot-toast';
import { z, ZodError } from 'zod';

const clientDataSchema = z.object({
    numero: z.number().int().min(10000000, 'Debe tener mínimo 8 dígitos').max(99999999, 'Debe tener máximo 8 dígitos'),
    entidad: z.string().min(3, 'El campo de la entidad debe tener una extensión mínima de 3 caracteres'),
    link_vc: z.string().min(3, 'El campo del link debe tener una extensión mínima de 3 caracteres'),
    id_contratoGeneral: z.number().int().min(1, 'Debe ser un valor mayor que 0'),
    id_contratoEspecifico: z.number().int().min(1, 'Debe ser un valor mayor que 0'),
    solicitante: z.string().min(3, 'El campo del solicitante debe tener una extensión mínima de 3 caracteres'),
    correo: z.email('Email inválido'),
    cargo: z.string().min(2, 'Cargo requerido'),
});

export type ClientDataType = z.infer<typeof clientDataSchema>;

interface ClientInfoFormProps {
    onSubmit: (info: ClientDataType) => void;
    clientData: ClientDataType;
    validateLink: (link: string) => void;
}

export const ClientInfoForm: React.FC<ClientInfoFormProps> = ({ onSubmit, clientData, validateLink }) => {
    const [clientInfo, setClientInfo] = useState<ClientDataType>(clientData);
    const [clientInfoError, setClientInfoError] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setClientInfo(prev => ({
            ...prev,
            [name]: name.startsWith('id_contrato') || name === 'numero' ? parseInt(value) || 0 : value,
        }));
    };

    const handleValidationErrors = (error: ZodError) => {
        const newErrors: Record<string, string> = {};
        error.issues.forEach(issue => {
            newErrors[issue.path[0].toString() + 'Error'] = issue.message;
        });
        setClientInfoError(newErrors);
    };

    const handleSubmit = () => {
        try {
            setClientInfoError({});
            clientDataSchema.parse(clientInfo);
            onSubmit(clientInfo);
            toast.success('Información del solicitante establecida correctamente');
        } catch (error) {
            if (error instanceof ZodError) {
                handleValidationErrors(error);
            } else {
                toast.error('Error al guardar los datos');
            }
        }
    };

    const field = (name: string, label: string, type = 'text', placeholder?: string) => {
        const errorKey = name + 'Error';
        return (
            <div>
                <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                    {label} {clientInfoError[errorKey] && <span className="text-error">: {clientInfoError[errorKey]}</span>}
                </label>
                <input
                    type={type}
                    id={name}
                    name={name}
                    value={type === 'number' ? (clientInfo as any)[name] || '' : (clientInfo as any)[name]}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-dark focus:border-transparent outline-none transition-all ${
                        clientInfoError[errorKey] ? 'border-error' : 'border-gray-300'
                    }`}
                    placeholder={placeholder}
                />
            </div>
        );
    };

    return (
        <form className="space-y-2 w-150">
            {field('numero', 'Número telefónico', 'number', 'Nº')}
            {field('entidad', 'Entidad', 'text', 'Nombre de la entidad')}
            {field('cargo', 'Cargo del solicitante', 'text', 'Ej: Director')}

            <div>
                <label htmlFor="link_vc" className="block text-sm font-medium text-gray-700 mb-1">
                    Link de Videoconferencia {clientInfoError.link_vcError && <span className="text-error">: {clientInfoError.link_vcError}</span>}
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        id="link_vc"
                        name="link_vc"
                        value={clientInfo.link_vc}
                        onChange={handleChange}
                        className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-dark focus:border-transparent outline-none transition-all ${
                            clientInfoError.link_vcError ? 'border-error' : 'border-gray-300'
                        }`}
                        placeholder="Ej. VideoCuba"
                    />
                    <button
                        type="button"
                        onClick={() => validateLink(clientInfo.link_vc)}
                        className="px-4 py-2 bg-primary-dark text-white rounded-lg hover:bg-primary-extradark transition-colors active:scale-95"
                    >
                        Validar
                    </button>
                </div>
            </div>

            {field('id_contratoGeneral', 'ID Contrato General', 'number', 'Ej: 12345')}
            {field('id_contratoEspecifico', 'ID Contrato Específico', 'number', 'Ej: 67890')}
            {field('solicitante', 'Solicitante', 'text', 'Nombre del solicitante')}
            {field('correo', 'Correo Electrónico', 'email', 'usuario@ejemplo.com')}

            <button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-primary-dark text-white py-2 px-4 rounded-lg hover:bg-primary-extradark transition-colors active:scale-95 font-medium"
            >
                Guardar Información
            </button>
        </form>
    );
};