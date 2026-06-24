// src/tests/helpers/mocks/repoService.ts
import { container } from '../../../helpers/services.container';

export const mockSubirPDF = jest.fn().mockResolvedValue({ 
    success: true, 
    url: 'https://repo.test/documento.pdf' 
});

const mockRepoService = {
    subirPDF: mockSubirPDF,
};

// Registrar en el container antes de que nadie lo instancie
container.register('RepoService', mockRepoService);