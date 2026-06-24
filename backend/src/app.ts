import express, { Application } from 'express';
import cors from 'cors';

import { tasaRouter } from './modulos/tasaCambio/tasaCambio.router';
import { salaRouter } from './modulos/planes/planSala/sala/sala.router';
import { planRouter } from './modulos/planes/plan.router';
import { solicitudSalaRouter } from './modulos/solicitudes/solicitudesSala/solicitudSala.router';
import { linkRouter } from './modulos/solicitudes/solicitudesSala/link/link.router';
import RepoClient from './config/repo.client';
import { TrueConfClient } from './config/trueconf.client';
import { pdfDocsRouter } from './modulos/solicitudes/pdfDocs/pdfDocs.router';
import testRouter from './tests/helpers/test-utils/test-routes'

const BASE_URL = process.env.TRUECONF_BASE_URL || 'http://trueConfTestURL/api/v3.10';
const CLIENT_ID = process.env.CLIENT_ID || 'UserTestID';
const CLIENT_SECRET = process.env.CLIENT_SECRET || 'atestpassword';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.clients();
    this.middlewares();
    this.routes();
  }

  private clients(): void {
    RepoClient.getInstance({
      baseURL: process.env.REPO_URL || 'http://localhost',
      apiToken: process.env.REPO_API_TOKEN || 'token_secreto',
    });
    if (process.env.NODE_ENV == 'production2') {
      TrueConfClient.getInstance({
        baseURL: BASE_URL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
      });
    }
  }

  private middlewares(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private routes(): void {
    this.app.get('/health', (req, res) => {
      res.status(200).json({ status: 'OK', timestamp: new Date() });
    });

    this.app.use('/tasa', tasaRouter);
    this.app.use('/sala', salaRouter);
    this.app.use('/plan', planRouter);
    this.app.use('/solicitud/sala', solicitudSalaRouter);
    this.app.use('/documentos', pdfDocsRouter);
    this.app.use('/link', linkRouter);
    if (process.env.NODE_ENV === 'test') {
        this.app.use('/test', testRouter);
    }
  }
}
export default new App().app;