// src/tests/integration/global-setup.ts
import sequelize from '../../config/database';

import '../../modulos/solicitudes/solicitudesSala/solicitudSala.model';
import '../../modulos/solicitudes/solicitudBase.model';
import '../../modulos/planes/planSala/planSala.model';
import '../../modulos/planes/planSala/sala/sala.model';
import '../../modulos/planes/planSala/combinados/planCombinado.model';
import '../../modulos/planes/planBase.model';
import '../../modulos/tasaCambio/tasaCambio.model';
import '../../modulos/solicitudes/pdfDocs/pdfDocs.model';

export default async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log('✓ Base de datos sincronizada para tests');
};