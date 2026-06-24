import { createBrowserRouter } from 'react-router-dom';

import AppLayout from './AppLayout';
import CatalogoPage from './planes/catalogo.page';
import PlanesSalaPage from './planes/planSala/planSala.page';
import SalaPage from './planes/planSala/sala/sala.page';
import DocumentosPage from './documentos/documentos.page';
import CambiosTarifasPage from './cambioTarifas/cambioTarifas.page';
import CalendarioOperativo from './planes/planSala/calendarioOperativo/calendarioOperativo';
import HomePage from './HomePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'planes/sala',
        element: <PlanesSalaPage />,
      },
      {
        path: 'planes/sala/calendario-operativo',
        element: <CalendarioOperativo />,
      },
      {
        path: 'salas',
        element: <SalaPage />,
      },
      {
        path: 'catalogo',
        element: <CatalogoPage />,
      },
      {
        path: 'documentos',
        element: <DocumentosPage />,
      },
      {
        path: 'tarifas',
        element: <CambiosTarifasPage />,
      },
    ],
  },
]);