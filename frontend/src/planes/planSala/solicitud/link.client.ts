import api from '../../../apiClient/api';

export const linkApi = {
  validarLink: (link: string) => api.get<{ response: boolean; message: string }>(`link/${link}`),
};