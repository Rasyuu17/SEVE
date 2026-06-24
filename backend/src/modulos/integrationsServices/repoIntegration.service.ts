import FormData from 'form-data';
import { AxiosInstance } from 'axios';

import RepoClient from '../../config/repo.client';
import { Injectable } from '../../helpers/decorators/injectable.decorator';

@Injectable([])
export class RepoService {
  private get client(): AxiosInstance {
    return RepoClient.getInstance().getClient();
  }

  private get apiToken(): string {
    return RepoClient.getInstance().getApiToken();
  }

  async subirPDF(
    pdfBuffer: Buffer,
    filename: string,
    idContratoGeneral: number,
    idContratoEspecifico: number
  ): Promise<{ url: string; filename: string }> {
    const form = new FormData();
    form.append('file', pdfBuffer, {
      filename,
      contentType: 'application/pdf',
    });
    form.append('idContratoGeneral', String(idContratoGeneral));
    form.append('idContratoEspecifico', String(idContratoEspecifico));

    try {
      const response = await this.client.post('/upload', form, {
        headers: {
          'X-API-Token': this.apiToken,
          ...form.getHeaders(),
        },
      });

      return {
        url: response.data.data.url,
        filename: response.data.data.filename,
      };
    } catch (error) {
      throw new Error('Error de comunicación con el repositorio de documentos');
    }
  }

  async obtenerPDF(rutaRelativa: string): Promise<Buffer> {
    try {
      const response = await this.client.get(`/repo/${rutaRelativa}`, {
        params: { token: this.apiToken },
        responseType: 'arraybuffer',
      });

      return Buffer.from(response.data);
    } catch (error) {
      throw new Error('Error al descargar el documento del repositorio');
    }
  }

  getUrlDescarga(rutaRelativa: string): string {
    const baseURL = this.client.defaults.baseURL;
    return `${baseURL}/repo/${rutaRelativa}?token=${this.apiToken}`;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.data.status === 'ok';
    } catch {
      return false;
    }
  }
}

export default RepoService;