import { verifyPDF, getCertificatesInfoFromPDF } from '@qlever-llc/verify-pdf';
import { Op, OrderItem, Transaction } from 'sequelize';

import { Injectable } from '../../../helpers/decorators/injectable.decorator';
import RepoService from '../../integrationsServices/repoIntegration.service';
import { PlanCompleto } from '../../planes/IPlanStrategy.interface';
import { PlanService } from '../../planes/plan.service';
import PlanSalaModel from '../../planes/planSala/planSala.model';
import SolicitudSalaModel from '../solicitudesSala/solicitudSala.model';
import { DocumentDiscriminator, VerificacionFirma } from './pdfDocs.interface';
import { PdfBuilder } from './pdfDocs.builder';
import DocumentoModel from './pdfDocs.model';
import { contractInfoType, facturaType } from '../solicitudesSala/solicitudSala.schemas';

interface DocumentoFilters {
  numero?: number;
  nombre_solicitante?: string;
  entidad?: string;
  correo?: string;
  id_contratoGeneral?: number;
  id_contratoEspecifico?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  search?: string;
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
}

@Injectable(['PlanService', 'RepoService'])
export class PdfDocService {
  private docModel = DocumentoModel;

  constructor(private planService: PlanService, private repoService: RepoService) {}

  async crearPDFSala(id_contratoGeneral: number, id_contratoEspecifico: number, solicitudes: SolicitudSalaModel[], contractInfo: contractInfoType, clientData: { entidad: string; solicitante: string; correo: string; numero: string; cargo: string }) {
    const ahora = new Date();
    const servicios: (PlanCompleto & PlanSalaModel)[] = await this.planService.obtenerTodos('sala');
    const planIdsSolicitados = new Set<number>();
    solicitudes.forEach(s => {
        if ((s as any).id_planSala) planIdsSolicitados.add((s as any).id_planSala);
        if ((s as any).PlanCombinadoModel?.PlanSalaModels) {
            (s as any).PlanCombinadoModel.PlanSalaModels.forEach((p: any) => planIdsSolicitados.add(p.id));
        }
    });

    const nacionales= servicios.filter(s => s.esNacional)

    const primeraFecha = new Date(solicitudes[0].SolicitudBaseModel?.fecha_inicio || solicitudes[0].SolicitudBaseModel!.fecha_inicio);
    const ultimaFecha = new Date(solicitudes[solicitudes.length - 1].SolicitudBaseModel?.fecha_inicio || solicitudes[solicitudes.length - 1].SolicitudBaseModel!.fecha_inicio);
    const mismoMes = primeraFecha.getMonth() === ultimaFecha.getMonth() && primeraFecha.getFullYear() === ultimaFecha.getFullYear();

    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const desde = `${meses[primeraFecha.getMonth()]} ${primeraFecha.getFullYear()}`;
    const hasta = `${meses[ultimaFecha.getMonth()]} ${ultimaFecha.getFullYear()}`;
    const mesUnico = `${meses[primeraFecha.getMonth()]} ${primeraFecha.getFullYear()}`;

    const serviciosSolicitados = servicios.filter(s => planIdsSolicitados.has(s.id));

    const nombresPlanesSolicitados = serviciosSolicitados
      .sort((a, b) => (a.PlanBaseModel?.tarifa || 0) - (b.PlanBaseModel?.tarifa || 0))
      .map(s => s.PlanBaseModel!.nombre);

    const doc = new PdfBuilder()
      doc.setFontSize({ value: 11 })
      .setText('ANEXO', { align: 'center', bold: true })
      .setSpace()
      .setText('SERVICIOS ESPECIALIZADOS DE VIDEOCONFERENCIA', { align: 'center', bold: true })
      .setSpace()
      .setText('MODALIDAD: SERVICIOS DE SALA DE VIDEOCONFERENCIA', { align: 'center', bold: true })
      .setSpace(2)
      .setText(`AL CONTRATO ESPECÍFICO DE PRESTACIÓN DE SERVICIOS DE TELECOMUNICACIONES No. ${id_contratoEspecifico}, DERIVADO DE LAS CONDICIONES GENERALES DE LOS CONTRATOS RELACIONADOS CON LA PRESTACIÓN DE SERVICIOS PÚBLICOS DE TELECOMUNICACIONES A PERSONAS JURÍDICAS No. ${id_contratoGeneral}`, { align: 'justify', bold: true })
      .setSpace(3)
      .setText('1. DESCRIPCION DEL SERVICIO', {bold: true})
      .setSpace()
      .setText('1.1. Conferencia virtual asistida, de alcance nacional e internacional, que permite a los participantes de Sala Presencial de ',{continue: true})
      .setText( 'ETECSA ', {bold: true, continue: true})
      .setText('la interacción en tiempo real con usuarios externos conectados a Internet, proporcionando accesibilidad total y el uso de herramientas de colaboración: chat, compartir pantalla, presentaciones, transferencia de archivos y grabaciones. Conformado por (4) planes que pueden complementarse con Servicios de Valor Agregado (SVA), que el ', {continue:true})
      .setText('CLIENTE ',{bold: true, continue: true})
      .setText('puede contratar mediante el ', {continue:true})
      .setText('Modelo 1: Reservación de las Salas de Videoconferencias ', {bold: true, continue: true})
      .setText('que forma parte del presente Contrato.')
      .setText('1.2. El servicio puede contratarse por: \na) ', {continue:true})
      .setText('Suscripción Mensual ', {bold:true,continue:true})
      .setText('(un mes o más), y pagará una tarifa recurrente mensual según la cantidad de horas contratadas en cada mes, o;')
      .setText('b) ',{continue:true})
      .setText('Basado en Uso',{bold:true, continue:true})
      .setText(': horas de conferencias eventuales dentro del propio mes.')
      .setText('1.3. El ',{continue: true})
      .setText('CLIENTE ',{bold:true, continue:true})
      .setText('contratará los planes del SVA mediante el ',{continue: true})
      .setText('Anexo: Servicios de Valor Agregado ',{bold:true, continue:true})
      .setText('del Anexo Servicios Especializados de Videoconferencia al Contrato Especifico de Prestación de Servicios de Telecomunicaciones, los que se facturarán y pagarán como se pacte en dicho instrumento legal.')
      .setText('1.4. Cuando se contrate el Plan Sala Teatro Híbrido, y el teatro donde se ejecute el servicio no pertenezca a ',{continue:true})
      .setText('ETECSA',{bold:true, continue:true})
      .setText(', el ',{continue: true})
      .setText('CLIENTE ',{continue: true, bold: true})
      .setText('debe suscribir el ',{continue: true})
      .setText('Anexo: Autogestionado y Servicios Profesionales a Eventos ', {bold:true, continue:true})
      .setText('del Anexo Servicios Especializados de Videoconferencia al Contrato Especifico de Prestación de Servicios de Telecomunicaciones, para que ',{continue:true})
      .setText('ETECSA ',{bold: true, continue:true})
      .setText('implemente la solución de conectividad e integración, y proporcione si es necesario los equipos terminales y periféricos. La facturación y pago de este Anexo son independientes del presente Contrato.')
      .setText('1.5. El detalle de los modelos de negocio y el resto de los detalles del servicio se especifican en el Manual Digital de Usuario que ',{continue: true})
      .setText('ETECSA ',{bold:true, continue:true})
      .setText(' facilitará al ',{continue:true})
      .setText('CLIENTE ',{bold: true, continue:true})
      .setText(' y formará parte del presente Contrato.')
      .setSpace()
      .setText('2. PLANES Y COMPONENTES POR TIPOS DE SALAS.', { bold: true })
      .setSpace()
      .setTable({
        headers: [
          [{ text: 'Componentes de los Planes de Servicio', rowSpan: 2, colSpan:3, bold: true, align: 'center'}, { text: 'Planes', colSpan: nacionales.length, bold: true, align: 'center'}],
          nacionales.map(servicio => ({ text: servicio.PlanBaseModel!.nombre, bold: true, align: 'center' })),
        ],
        rows: [
          [{ text: 'Cantidad de usuarios en linea', colSpan:3 }].concat(nacionales.map(servicio => ({ text: servicio.cantUsuariosLinea.toString(), colSpan: 1, align: 'center' }))),
          [{ text: 'Cantidad de usuarios invitados', colSpan:3 }].concat(nacionales.map(servicio => ({ text: servicio.cantUsuariosInvitados.toString(), colSpan: 1, align: 'center'}))),
          [{ text: 'Terminales SIP/H323', colSpan:3 }].concat(nacionales.map(servicio => ({ text: servicio.SalaModels?.filter(sala => (sala.tieneTerminal)).length.toString() || '0', colSpan: 1, align: 'center' }))),
          [{ text: 'Tipos de videoconferencia', colSpan:3 }].concat(nacionales.map(servicio => {
            const vc = [
              { tiene: servicio.tieneVCClaseVirtual, texto: 'Clase virtual' },
              { tiene: servicio.tieneVCReunionInteligente, texto: 'Reunión inteligente' },
              { tiene: servicio.tieneVCRolesModerados, texto: 'Roles moderados' },
              { tiene: servicio.tieneVCTodosPantalla, texto: 'Todos en pantalla' },
            ];
            const tieneVC = vc.filter(VC => VC.tiene).map(VC => VC.texto);
            return { text: tieneVC.length === 4 ? 'Todos los tipos' : tieneVC.length === 0 ? 'Ninguno' : tieneVC.join(', '), colSpan: 1, align: 'center'};
          })),
          [{ text: 'Herramientas de colaboración', colSpan:3 }].concat(nacionales.map(servicio => {
            const hc = [
              { tiene: servicio.tieneColabCompartirPantalla, texto: 'Compartir pantalla' },
              { tiene: servicio.tieneColabControlRemoto, texto: 'Control remoto' },
              { tiene: servicio.tieneColabCrearConferencias, texto: 'Crear conferencias' },
              { tiene: servicio.tieneColabEdicionAgenda, texto: 'Editar agenda' },
              { tiene: servicio.tieneColabEnviarArchivos, texto: 'Enviar archivos' },
              { tiene: servicio.tieneColabGrabacion, texto: 'Grabación' },
              { tiene: servicio.tieneColabPresentacion, texto: 'Presentación' },
              { tiene: servicio.tieneColabRealizarLlamadas, texto: 'Realizar llamada' },
              { tiene: servicio.tieneColabRecibirArchivos, texto: 'Recibir archivos' },
            ];
            const tieneHC = hc.filter(HC => HC.tiene).map(HC => HC.texto);
            return { text: tieneHC.length === 9 ? 'Todos los tipos' : tieneHC.length === 0 ? 'Ninguno' : tieneHC.join(', '), colSpan: 1, align: 'center' };
          })),
          [{ text: 'Grabar en el servidor', colSpan:3 }].concat(nacionales.map(servicio => ({ text: servicio.tiempoAlmacenamiento > 0 ? 'Si' : 'No', colSpan: 1, align: 'center'}))),
          [{ text: 'Grabar en local', colSpan:3 }].concat(nacionales.map(servicio => ({ text: servicio.almacenamientoLocal ? 'Si' : 'No', colSpan: 1, align: 'center' }))),
        ],
      })
      .setSpace()
      .setText('Los Planes pueden combinarse a fin de potenciar las capacidades del Servicio:', { bold: true })
      .setSpace()
      .setTable({
          headers: [[
              { text: 'Planes', bold: true,colSpan: 2},
              { text: 'Es integrable', bold: true, colSpan: 1 },
          ]],
          rows: nacionales.map(servicio => [
              { text: servicio.PlanBaseModel!.nombre, colSpan: 2},
              { text: servicio.esIntegrable ? 'Sí' : 'No' , colSpan: 1},
          ]),
      })
      .setSpace()
      .setText('Servicios de Valor Agregado a contratar para los Planes de Sala:')
      .setSpace()
.setTable({
    headers: [
        [{ text: 'Servicios de Valor Agregado', bold: true, rowSpan: 2, colSpan:3, align: 'center' }, { text: 'Complementos disponibles', bold: true, colSpan: 4, align: 'center' }],
        [{text: 'Cabinas de Reunión', align: 'center'},{text: 'Sala Teatro Híbrida', align: 'center'},{text: 'Sala Híbrida Capital', align: 'center'},{text: 'Sala Híbrida Corporativo', align: 'center'}]
    ],
    rows: [
        [{ text: 'Conectores de Sala SIP/H323', colSpan:3  }, { text: 'No', align: 'center' }, {text: 'Incluido sin pago adicional', align: 'center', colSpan: 3}],
        [{ text: 'Conectores de Telefónico', colSpan:3  }, { text: 'No', align: 'center'  }, {text: 'SVA disponible si se contrata almenso dos tipos diferentes de salas. Son complementos de pago', align: 'center', colSpan: 3, rowSpan: 6}],
        [{ text: 'SVA (múltiples tipos de salas)' , colSpan:3 }, { text: 'No' , align: 'center' }],
        [{ text: 'Traducción Simultanea' , colSpan:3 }, { text: 'No', align: 'center' }],
        [{ text: 'Traducción en Línea con movilidad', colSpan:3  }, { text: 'No', align: 'center' }],
        [{ text: 'Transcripción Voz a Texto', colSpan:3  }, { text: 'Sí', align: 'center' }],
        [{ text: 'Transmisiones en Vivo (streaming)', colSpan:3  }, { text: 'No', align: 'center' }],
        [{ text: 'Soporte y Servicio al Cliente', colSpan:3  }, { text: 'Mesa de Ayuda y Atención al Cliente \nSoporte y Asistencia Avanzada', colSpan:4, align: 'center' }],
    ],
}).setSpace()
      .setText('3. OBLIGACIONES DE LAS PARTES', { bold: true, continue: true })
      .setText(', además de las referidas en las cláusulas 2.1 y 2.2 del Contrato Específico de Prestación de Servicios de Telecomunicaciones suscrito por las Partes, las siguientes:')
      .setSpace()
      .setText('3.1. Corresponde a ', { continue: true })
      .setText('ETECSA', { bold: true, continue: true })
      .setText(':', { bold: true })
      // 3.1.1
      .setText('3.1.1. Asistir al ', { continue: true })
      .setText('CLIENTE', { bold: true, continue: true })
      .setText(' en la integración y compra de los Planes de servicio.')
      // 3.1.2
      .setText('3.1.2. Facilitar al ', { continue: true })
      .setText('CLIENTE', { bold: true, continue: true })
      .setText(' el Manual Digital de Usuario con las características del servicio.')
      // 3.1.3
      .setText('3.1.3. Prestar el servicio con calidad y confort de los locales.')
      // 3.1.4
      .setText('3.1.4. Garantizar la presencia de un operador asistente en la Sala Presencial.')
      // 3.1.5
      .setText('3.1.5. Brindar Soportes y Asistencia al ', { continue: true })
      .setText('CLIENTE', { bold: true, continue: true })
      .setText('.')
      // 3.1.6
      .setText('3.1.6. Comunicar al ', { continue: true })
      .setText('CLIENTE ', { bold: true, continue: true })
      .setText('con seis (6) horas de antelación la cancelación de la videoconferencia de surgir una dificultad técnica imprevista que imposibilite realizar la misma en la hora reservada.')
      // 3.1.7
      .setText('3.1.7. Facturar al ', { continue: true })
      .setText('CLIENTE ', { bold: true, continue: true })
      .setText('el precio de los planes contratados y los cargos aplicables al servicio.')
      // 3.1.8
      .setText('3.1.8. Compensar al ', { continue: true })
      .setText('CLIENTE ', { bold: true, continue: true })
      .setText('no facturando las horas de servicio de videoconferencia contratadas que sean afectadas por problemas imputables a ', { continue: true })
      .setText('ETECSA', { bold: true, continue: true })
      .setText('.')
      // 3.1.9
      .setText('3.1.9. No permitir cambios en la infraestructura de las Salas de Videoconferencias presenciales que puedan afectar el servicio.')
      // 3.1.10
      .setText('3.1.10. Grabar la videoconferencia a solicitud del ', { continue: true })
      .setText('CLIENTE', { bold: true, continue: true })
      .setText(', siempre que estén disponibles las condiciones técnicas para ello. De no resultar posible su entrega al finalizar el servicio, se guardará por dos (2) días hábiles. La entrega se hará efectiva al representante designado por el ', { continue: true })
      .setText('CLIENTE', { bold: true, continue: true })
      .setText('.')
      // 3.1.11
      .setText('3.1.11. Dar por ejecutado y concluido el servicio, si el ', { continue: true })
      .setText('CLIENTE ', { bold: true, continue: true })
      .setText(' se retrasa por treinta (30) minutos o más, contados a partir de la hora pactada para el inicio del servicio.')
      // 3.1.12
      .setText('3.1.12. Avisar al ', { continue: true })
      .setText('CLIENTE ', { bold: true, continue: true })
      .setText(' quince (15) minutos antes de consumir el tiempo contratado y proceder a finalizar el servicio al término del tiempo pactado.')
      // 3.1.13
      .setText('3.1.13. Extender el tiempo adicional solicitado por el ', { continue: true })
      .setText('CLIENTE ', { bold: true, continue: true })
      .setText(' siempre y cuando no afecte la programación de otros y no se extienda fuera de los horarios establecidos para brindar el servicio.')
      // 3.1.14
      .setText('3.1.14. Informar por correo al ', { continue: true })
      .setText('CLIENTE ', { bold: true, continue: true })
      .setText(' la programación de las conferencias realizadas sobre la plataforma y el enlace a la conferencia programada para la conexión de participantes externos.')
      // 3.1.15
      .setText('3.1.15. Gestionar reubicación de la programación original de conferencia solicitadas por el ', { continue: true })
      .setText('CLIENTE', { bold: true, continue: true })
      .setText('. La no existencia de soluciones de reubicación, no constituyen descuentos del Plan original contratado.')
      // 3.1.16
      .setText('3.1.16. Gestionar los problemas en las salas y equipos terminales que afecten el servicio.')
      // 3.1.17
      .setText('3.1.17. Firmar el ',{continue: true})
      .setText('Modelo 2: Orden de Cierre ',{bold: true, continue: true})
      .setText('del presente Contrato, al concluir cada videoconferencia.')
      // 3.1.18
      .setText('3.1.18. ', { continue: true })
      .setText('ETECSA ', { bold: true, continue: true })
      .setText(' no se responsabiliza con la calidad, alcance, contenido, licitud y uso que el ', { continue: true })
      .setText('CLIENTE ', { bold: true, continue: true })
      .setText(' o los participantes hagan de las grabaciones, videos, sonidos e imágenes durante la prestación del servicio o posterior a su culminación.')
      // 3.1.19
      .setText('3.1.19. ', { continue: true })
      .setText('ETECSA ', { bold: true, continue: true })
      .setText(' no será responsable bajo ninguna circunstancia por cualquier daño directo o indirecto, perjuicio, afectación o menoscabo que pudiera sufrir el ', { continue: true })
      .setText('CLIENTE ', { bold: true, continue: true })
      .setText(' o los participantes de la videoconferencia o cualquier otra persona, como resultado del uso inapropiado del servicio.')
      .setSpace()
      // 3.2
      .setText('3.2. Corresponde al ', { bold: true, continue: true })
      .setText('CLIENTE', { bold: true, continue: true })
      .setText(':', { bold: true })
      // 3.2.1
      .setText('3.2.1. Solicitar el servicio mediante carta firmada por el máximo representante.')
      // 3.2.2
      .setText('3.2.2. Requerir mediante el ', {continue:true})
      .setText('Modelo 1: Reservación de las Salas de Videoconferencias ',{bold: true, continue: true})
      .setText(' del presente Contrato, los planes a contratar, así como la programación de las conferencias planificadas o eventuales que generan el precio de cada plan contratado, con setenta y dos (72) horas de antelación a la primera videoconferencia que desee realizar.')
      // 3.2.3
      .setText('3.2.3. Reservar en el último mes del año las videoconferencias que desee contratar para el año siguiente cumpliendo las formalidades descritas en el apartado anterior.')
      // 3.2.4
      .setText('3.2.4. Asistir con quince (15) minutos antes del comienzo del servicio.')
      // 3.2.5
      .setText('3.2.5. Cumplir con el horario reservado en beneficio de la programación establecida para otros ', { continue: true })
      .setText('CLIENTES', { bold: true, continue: true })
      .setText(', y realizar las solicitudes de extensión del horario de conferencia en ejecución, con quince (15) minutos antes de su culminación.')
      // 3.2.6
      .setText('3.2.6. Notificar con veinticuatro (24) horas hábiles de antelación, al correo electrónico que aparece en el Manual Digital de Usuario cuando requiera cancelar la ejecución de la videoconferencia. La cancelación de reservaciones no exime al ', { continue: true })
      .setText('CLIENTE ', { bold: true, continue: true })
      .setText('del pago de las horas reservadas durante el año.')
      // 3.2.7
      .setText('3.2.7. Informar mediante carta firmada por el máximo representante de la entidad, los datos de la persona designada que debe recoger la grabación de las conferencias, dentro de los dos (2) días hábiles siguientes a la fecha de su realización.')
      // 3.2.8
      .setText('3.2.8. Distribuir el enlace de la conferencia programada y el Manual de Usuario Digital entregado por ', { continue: true })
      .setText('ETECSA ', { bold: true, continue: true })
      .setText('a todos los participantes externos que participen en la conferencia.')
      // 3.2.9
      .setText('3.2.9. Firmar el ',{continue: true})
      .setText('Modelo 2: Orden de Cierre',{bold: true, continue:true})
      .setText(' al concluir la videoconferencia que reflejará las condiciones reales en que se prestó el servicio.')
      // 3.2.10
      .setText('3.2.10. Pagar a ', { continue: true })
      .setText('ETECSA ', { bold: true, continue: true })
      .setText('el importe total de los servicios recibidos.')
      // 3.2.11
      .setText('3.2.11. El ', { continue: true })
      .setText('CLIENTE ', { bold: true, continue: true })
      .setText('se responsabiliza con la calidad, alcance, contenido, licitud y uso de las grabaciones, videos, sonidos e imágenes durante la prestación del servicio o posterior a su culminación.')
      // 3.2.12
      .setText('3.2.12. Adoptar las medidas necesarias para evitar una posible contaminación por virus de su equipo y de los equipos de los demás participantes por cualquier archivo o programa de Software compartido a través del Servicio, por lo que ', { continue: true })
      .setText('ETECSA', { bold: true, continue: true })
      .setText(' no será responsable por los daños y perjuicios causados al ', { continue: true })
      .setText('CLIENTE ', { bold: true, continue: true })
      .setText('y/o a los participantes por el hecho antes señalado.')
      // 3.2.13
      .setText('3.2.13. Reconocer y aceptar que los costos del tráfico de datos y de las llamadas telefónicas (nacionales, internacionales) que se generen por parte del ', { continue: true })
      .setText('CLIENTE ', { bold: true, continue: true })
      .setText('y/o los participantes para consumir los servicios de salas de videoconferencias, son independientes del costo del servicio que suscriben en el presente Contrato.')
      // 3.2.14
      .setText('3.2.14. Reconocer y aceptar que los problemas de calidad, fallas o interrupciones en el servicio atribuibles al medio de transmisión Internet, redes de acceso y terminales del ', { continue: true })
      .setText('CLIENTE', { bold: true, continue: true })
      .setText(', son completamente independientes al Servicio de Sala, por lo que ', { continue: true })
      .setText('ETECSA', { bold: true, continue: true })
      .setText(' no será responsable dichas afectaciones.')
      .setSpace()
      .setText('4. PLANES, TARIFAS, MONEDA Y FORMA DE PAGO.', { bold: true })
      .setSpace()
      .setText('4.1. El valor del presente Contrato, es la suma de todas las facturas emitidas por ', { continue: true })
      .setText('ETECSA', { bold: true, continue: true })
      .setText('.')
      .setText('4.2. Las tarifas, precios, cargos a aplicar y la moneda de pago Peso Cubano (CUP) o el Dólar Estadounidense (USD) para este servicio son las publicadas en el sitio oficial de ', { continue: true })
      .setText('ETECSA ', { bold: true, continue: true })
      .setText('www.etecsa.cu, las cuales se mantendrán actualizadas.')
      .setText('4.3. El ', { continue: true })
      .setText('CLIENTE ', { bold: true, continue: true })
      .setText('que contrate de forma eventual cualquiera de los planes de servicio, se le facturará mensualmente todas las horas que contrate por la tarifa del plan, más los cargos que apliquen.')
      .setText('4.4. El ', { continue: true })
      .setText('CLIENTE ', { bold: true, continue: true })
      .setText('que contrate cualquiera de los planes de servicio y reserve horas de videoconferencias en varios meses, se le realizará una suscripción mensual por la cual pagará una tarifa recurrente mensual según la cantidad de horas reservadas en cada mes, por la tarifa del plan, más los cargos que apliquen.')
      .setText('4.5. Si el ', { continue: true })
      .setText('CLIENTE ', { bold: true, continue: true })
      .setText('después de realizar una suscripción mensual, necesita hacer conferencias eventuales, se le aplican y sumarán los cargos por exceso.')
      .setText('4.6. Se aplicarán los cargos al servicio por concepto de inmediatez (solicitud de prestación con menos de setenta y dos (72) horas), cargo por minutos adicionales de servicio en cada videoconferencia y cargo por ejecución fuera de horario de prestación del servicio.')
      .setText('4.7. El Monto Total de los servicios de Sala de Videoconferencia prestados mensualmente se calculan de la forma siguiente:')
      .setSpace()
      .setText('Monto Total = ', { bold: true, italic: true, continue: true })
      .setText('((Tarifa en CUP o USD x Horas de conferencia reservadas mensuales) + (Tarifa en CUP o USD x Horas de conferencias eventuales en el mes) + Cargo por inmediatez + Cargo por minutos adicionales de servicio + Cargo por ejecución fuera de horario de prestación del servicio) – (Tarifa en CUP o USD x Horas de conferencia contratadas no ejecutadas por problemas de ', { italic: true, continue: true })
      .setText('ETECSA', { bold: true, italic: true, continue: true })
      .setText(')).', { italic: true, continue: false })
      .setSpace()
      .setText('4.8. Cuando se combinan en una sola videoconferencia dos (2) o más tipos de Salas de Videoconferencia según los Planes de Servicio que se contraten, el Monto Total se calcula, como la suma de los montos de cada Planes de Servicio.')
      .setText('4.9. ', { continue: true })
      .setText('ETECSA', { bold: true, continue: true })
      .setText(' cargará el importe total por los servicios prestados para su pago por el ', { continue: true })
      .setText('CLIENTE', { bold: true, continue: true })
      .setText(', en la variante seleccionada por este último a continuación:')
      .setSpace(2);

      // Facturación según datos del contrato
      if (contractInfo?.facturacion?.tipo === 'comercial') {
          doc.setText('_X_ En formato de factura comercial a entregar por ', { continue: true })
              .setText('ETECSA', { bold: true, continue: true })
              .setText(' al ', { continue: true })
              .setText('CLIENTE', { bold: true, continue: true })
              .setText('.')
              .setText('___ En la próxima factura telefónica de los servicios del ', { continue: true })
              .setText('CLIENTE', { bold: true, continue: true })
              .setText(', al número _____________.');
      } else if (contractInfo?.facturacion?.tipo === 'telefonica') {
          doc.setText('___ En formato de factura comercial a entregar por ', { continue: true })
              .setText('ETECSA', { bold: true, continue: true })
              .setText(' al ', { continue: true })
              .setText('CLIENTE', { bold: true, continue: true })
              .setText('.')
              .setText(`_X_ En la próxima factura telefónica de los servicios del `, { continue: true })
              .setText('CLIENTE', { bold: true, continue: true })
              .setText(`, al número ${contractInfo.facturacion.numero || '_____________'}.`);
      } else {
          doc.setText('___ En formato de factura comercial a entregar por ', { continue: true })
              .setText('ETECSA', { bold: true, continue: true })
              .setText(' al ', { continue: true })
              .setText('CLIENTE', { bold: true, continue: true })
              .setText('.')
              .setText('___ En la próxima factura telefónica de los servicios del ', { continue: true })
              .setText('CLIENTE', { bold: true, continue: true })
              .setText(', al número _____________.');
      }
      doc.setSpace()
          .setText('4.10. Si el ', { continue: true })
          .setText('CLIENTE ', { bold: true, continue: true })
          .setText('selecciona la primera variante en el apartado anterior e incumple con sus obligaciones de pago, ', { continue: true })
          .setText('ETECSA', { bold: true, continue: true })
          .setText(' procederá de la forma siguiente:')
          .setText('a) A los cinco (5) días posteriores al vencimiento de la factura, se notificará del impago, por correo electrónico, llamada de voz, al representante de la entidad registrado en la ficha del ', { continue: true })
          .setText('CLIENTE', { bold: true, continue: true })
          .setText('.')
          .setText('b) ', { continue: true })
          .setText('ETECSA', { bold: true, continue: true })
          .setText(' no aceptará nuevas solicitudes relacionadas con el servicio hasta tanto sea liquidado el adeudo.')
          .setText('c) Trascurrido noventa (90) días de impago, ', { continue: true })
          .setText('ETECSA ', { bold: true, continue: true })
          .setText('cargará el importe dejado de pagar a la factura telefónica del ', { continue: true })
          .setText('CLIENTE', { bold: true, continue: true })
          .setText(', o a la factura de cualquier otro servicio de los que el ', { continue: true })
          .setText('CLIENTE', { bold: true, continue: true })
          .setText(' tenga contrato con ', { continue: true })
          .setText('ETECSA', { bold: true, continue: true })
          .setText(', según esta última decida.')
          .setText(`Y para que así conste, se suscribe el presente en dos (2) ejemplares, a un solo tenor e iguales efectos legales, en ${contractInfo.ubicacion.provincia}, a los ${ahora.toLocaleDateString('es-CU', { day: 'numeric' })} días del mes de ${ahora.toLocaleDateString('es-CU', { month: 'long' })} de ${ahora.getFullYear()}.`)
          .setSpace()
          .setTable({
              headers: [],
              rows: [
                  [
                      { text: '_____________________', align: 'center', border: false },
                      { text: '', border: false },
                      { text: '_____________________', align: 'center', border: false },
                  ],
                  [
                      { text: 'ETECSA', bold: true, align: 'center', border: false },
                      { text: '', border: false },
                      { text: 'CLIENTE', bold: true, align: 'center', border: false },
                  ],
                  [
                      { text: 'Nombres y Apellidos', align: 'center', border: false },
                      { text: '', border: false },
                      { text: 'Nombres y Apellidos', align: 'center', border: false },
                  ],
                  [
                      { text: 'Cargo/Firma', align: 'center', border: false },
                      { text: '', border: false },
                      { text: 'Cargo/Firma', align: 'center', border: false },
                  ],
              ],
              options: {
                  border: false,
                  width: 500,
              },
          })
          .setNewPage()
          .setTable({
            headers: [
                [
                    { text: 'MODELO 1: Reservación de las Salas de Videoconferencias', bold: true, colSpan: 4, align: 'center' }
                ],[{ text: 'Datos del CLIENTE y de ETECSA', bold: true, colSpan: 4, align: 'center' }]
            ],
            rows: [
                [
                    { text: 'CLIENTE', bold: true, colSpan: 2, align: 'center' },
                    { text: 'Grupo de Servicios Especializados de Videoconferencia de ETECSA (GSEVE)', bold: true, colSpan: 2, align: 'center' },
                ],
                [
                    { text: 'Entidad', bold: true },
                    { text: clientData?.entidad || '' },
                    { text: 'Especialista', bold: true },
                    { text: contractInfo?.especialista.nombre || '' },
                ],
                [
                    { text: 'Provincia', bold: true },
                    { text: contractInfo?.ubicacion.provincia || '' },
                    { text: 'Teléfono', bold: true },
                    { text: contractInfo?.especialista.telefono || '' },
                ],
                [
                    { text: 'Municipio', bold: true },
                    { text: contractInfo?.ubicacion.municipio || '' },
                    { text: 'Correo Electrónico', bold: true },
                    { text: contractInfo?.especialista.correo || '' },
                ],
            ],
        })
        .setTable({
          headers: [],
          rows: [
              // Fila 1: headers de suscripción
              [
                  { text: 'Suscripción Mensual', bold: true, rowSpan: 2, align: 'center' },
                  { text: 'Desde', bold: true , align: 'center' },
                  { text: 'Hasta', bold: true , align: 'center' },
                  { text: 'Eventual Basado en Uso', bold: true, rowSpan: 2, align: 'center' },
                  { text: 'Mes', bold: true, colSpan: 2, align: 'center' },
              ],
              // Fila 2: valores
              [
                  { text: desde != hasta ? desde : '' , align: 'center' },
                  { text: desde != hasta ? hasta : '' , align: 'center'  },
                  { text: mismoMes ? mesUnico : '', colSpan: 2 , align: 'center'  },
              ],
          ],
      })
      .setTable({
        headers: [
            [
                { text: 'Tipo de Sala', bold: true, rowSpan: 2, align: 'center' },
                ...nombresPlanesSolicitados.map(nombre => ({ text: nombre, bold: true, align: 'center' as const })),
            ],
        ],
        rows: [
            nombresPlanesSolicitados.map((_, i) => ({ text: String(i + 1), align: 'center' })),
        ],
    })
    .setTable({
      headers: [
          [
              { text: 'Detalles de la planificación de las horas de servicio reservadas contratadas', bold: true, colSpan: 7, align: 'center' },
          ],
      ],
      rows: [
          // Headers con rowSpan
          [
              { text: 'Días y mes', bold: true, rowSpan: 2, align: 'center' },
              { text: 'Horario Reservado', bold: true, colSpan: 2, align: 'center' },
              { text: 'Menos de 72 horas', bold: true, rowSpan: 2, align: 'center' },
              { text: 'Tipo de Sala', bold: true, rowSpan: 2, align: 'center' },
              { text: 'Enlace (Link)', bold: true, rowSpan: 2, align: 'center' },
              { text: 'Grabar', bold: true, rowSpan: 2, align: 'center' },
          ],
          // Sub-headers de Horario
          [
              { text: 'Inicio', bold: true, align: 'center' },
              { text: 'Final', bold: true, align: 'center' },
          ],
          // Datos de cada solicitud
          ...solicitudes.map(s => {
              const base = s.SolicitudBaseModel!;
              const fechaInicio = new Date(base.fecha_inicio);
              const fechaFin = new Date(base.fecha_fin);
              const diaMes = `${fechaInicio.getDate()}/${fechaInicio.getMonth() + 1}`;
              const horarioInicio = `${fechaInicio.getHours().toString().padStart(2, '0')}:${fechaInicio.getMinutes().toString().padStart(2, '0')}`;
              const horarioFin = `${fechaFin.getHours().toString().padStart(2, '0')}:${fechaFin.getMinutes().toString().padStart(2, '0')}`;
              
              // Tipo de sala: índice o índices separados por +
              const tipoSala = (s as any).PlanCombinadoModel
                  ? (s as any).PlanCombinadoModel.PlanSalaModels.map((p: any) => {
                      const idx = nombresPlanesSolicitados.indexOf(p.PlanBaseModel?.nombre);
                      return idx >= 0 ? idx + 1 : '?';
                  }).join('+')
                  : String(nombresPlanesSolicitados.indexOf((s as any).PlanSalaModel?.PlanBaseModel?.nombre) + 1);

              // Menos de 72 horas: si la solicitud se creó con menos de 72h de antelación
              const createdAt = new Date(base.createdAt || Date.now());
              const horasAntelacion = Math.round((fechaInicio.getTime() - createdAt.getTime()) / (1000 * 60 * 60));
              const menos72h = horasAntelacion < 72 ? 'Sí' : 'No';

              return [
                  { text: diaMes, align: 'center' },
                  { text: horarioInicio, align: 'center' },
                  { text: horarioFin, align: 'center' },
                  { text: menos72h, align: 'center' },
                  { text: tipoSala, align: 'center' },
                  { text: s.link_vc || '', align: 'center' },
                  { text: s.grabar ? 'Sí' : 'No', align: 'center' as const },
                  
              ] as any;
          }),
      ],
  })
  .setTable({
      headers: [
          [
              { text: 'Datos de los firmantes', bold: true, colSpan: 4, align: 'center' },
          ],
      ],
      rows: [
          [
              { text: 'Cliente que solicita', bold: true, colSpan: 2, align: 'center' },
              { text: 'Comercial de ETECSA que recibe la solicitud', bold: true, colSpan: 2, align: 'center' },
          ],
          [
              { text: 'Nombre y Apellidos', bold: true },
              { text: clientData?.solicitante || '' },
              { text: 'Nombre y Apellidos', bold: true },
              { text: `${contractInfo?.agente.nombre || ''} ${contractInfo?.agente.apellido || ''}` },
          ],
          [
              { text: 'Cargo', bold: true },
              { text: clientData?.cargo || '' },
              { text: 'Cargo', bold: true },
              { text: contractInfo?.agente.cargo || '' },
          ],
          [
              { text: 'Teléfono de contacto', bold: true },
              { text: String(clientData?.numero || '') },
              { text: 'Unidad Comercial', bold: true },
              { text: contractInfo?.agente.unidad || '' },
          ],
          [
              { text: 'Correo Electrónico', bold: true },
              { text: clientData?.correo || '' },
              { text: 'Teléfono de contacto', bold: true },
              { text: contractInfo?.agente.telefono || '' },
          ],
          [
              { text: 'Fecha de solicitud', bold: true },
              { text: new Date().toLocaleDateString('es-CU') },
              { text: 'Correo Electrónico', bold: true },
              { text: contractInfo?.agente.correo || '' },
          ],
          [
              { text: 'Firma', bold: true, align: 'center' },
              { text: '' },
              { text: 'Firma', bold: true, align: 'center' },
              { text: '' },
          ],
      ],
  })
    return await doc.build();
  }

  async crear(
    numero: number,
    id_contratoGeneral: number,
    id_contratoEspecifico: number,
    nombre_solicitante: string,
    entidad: string,
    correo: string,
    nombre_documento: string,
    tipo: DocumentDiscriminator,
    transaction: Transaction
  ) {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const nombreConTimestamp = `${timestamp}_${nombre_documento}`;
    const ruta = `${id_contratoGeneral}/${id_contratoEspecifico}/${nombreConTimestamp}`;

    return await this.docModel.create({
      numero,
      id_contratoGeneral,
      id_contratoEspecifico,
      nombre_solicitante,
      entidad,
      correo,
      tipo,
      direccion_original: ruta,
      estado: 'confirmado'
    }, { transaction });
  }

  async setDocumentPath(
    documento: DocumentoModel,
    path: string,
    esFirmado: boolean = false,
    transaction?: Transaction
  ): Promise<void> {
    const campo = esFirmado ? 'direccion_firmado' : 'direccion_original';
    const values = esFirmado ? { [campo]: path, estado: 'confirmado' } : { [campo] : path }
    const [affectedRows] = await DocumentoModel.update(
      values,
      {
        where: {
          id: documento.id,
          [campo]: null,
        },
        transaction,
      }
    );

    if (affectedRows === 0) {
      const existing = await DocumentoModel.findByPk(documento.id, { transaction });
      if (existing?.get(campo)) {
        throw new Error(`${campo} ya fue asignado: ${existing.get(campo)}`);
      }
      throw new Error(`No se pudo asignar ${campo}`);
    }
  }

  async descargarPDF(documentoId: number, esFirmado: boolean = false): Promise<{ buffer: Buffer; filename: string }> {
    const documento = await this.docModel.findByPk(documentoId);

    if (!documento) {
      throw new Error('Documento no encontrado');
    }

    const ruta = esFirmado ? documento.direccion_firmado : documento.direccion_original;

    if (!ruta) {
      throw new Error(esFirmado ? 'El documento no tiene versión firmada' : 'El documento no tiene PDF generado');
    }

    const buffer = await this.repoService.obtenerPDF(ruta);

    const filename = esFirmado
      ? `documento_${documento.numero}_firmado.pdf`
      : `documento_${documento.numero}.pdf`;

    return { buffer, filename };
  }

  async buscarDocumentoPorId(id: number, transaction?: Transaction): Promise<DocumentoModel | null> {
    const documento = await this.docModel.findByPk(id, { transaction });
    return documento;
  }

  async buscarDocumentos(filters: DocumentoFilters): Promise<{
    documentos: DocumentoModel[];
    total: number;
  }> {
    const where: any = {};

    if (filters.numero) {
      where.numero = filters.numero;
    }
    if (filters.nombre_solicitante) {
      where.nombre_solicitante = filters.nombre_solicitante;
    }
    if (filters.entidad) {
      where.entidad = filters.entidad;
    }
    if (filters.correo) {
      where.correo = filters.correo;
    }
    if (filters.id_contratoGeneral) {
      where.id_contratoGeneral = filters.id_contratoGeneral;
    }
    if (filters.id_contratoEspecifico) {
      where.id_contratoEspecifico = filters.id_contratoEspecifico;
    }

    if (filters.fechaDesde || filters.fechaHasta) {
      where.createdAt = {};
      if (filters.fechaDesde) {
        where.createdAt[Op.gte] = new Date(filters.fechaDesde);
      }
      if (filters.fechaHasta) {
        where.createdAt[Op.lte] = new Date(filters.fechaHasta);
      }
    }

    if (filters.search) {
      where[Op.or] = [
        { nombre_solicitante: { [Op.like]: `%${filters.search}%` } },
        { entidad: { [Op.like]: `%${filters.search}%` } },
        { correo: { [Op.like]: `%${filters.search}%` } },
      ];
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;
    const order = [[filters.orderBy || 'createdAt', filters.orderDir || 'DESC']] as OrderItem[];

    const { rows: documentos, count: total } = await this.docModel.findAndCountAll({
      where,
      order,
      limit,
      offset,
    });

    return { documentos, total };
  }

  async validarFirma(pdfBuffer: Buffer): Promise<VerificacionFirma> {
    try {
      const resultado = verifyPDF(pdfBuffer);

      if (resultado.signatures?.length !== 2) {
        return {
          valido: false,
          autenticidad: resultado.authenticity || false,
          integridad: resultado.integrity || false,
          expirado: resultado.expired || false,
          cantidadFirmas: resultado.signatures?.length || 0,
          certificados: [],
          error: `Debe tener 2 firmas, tiene ${resultado.signatures?.length}`,
        };
      }

      return {
        valido: resultado.verified,
        autenticidad: resultado.authenticity || false,
        integridad: resultado.integrity || false,
        expirado: resultado.expired || false,
        cantidadFirmas: resultado.signatures.length,
        certificados: getCertificatesInfoFromPDF(pdfBuffer),
      };
    } catch (error: any) {
      return {
        valido: false,
        autenticidad: false,
        integridad: false,
        expirado: false,
        cantidadFirmas: 0,
        certificados: [],
        error: 'El archivo no contiene firmas digitales válidas',
      };
    }
  }

  async necesitaConfirmacion(docIds: number[], transaction?: Transaction): Promise<DocumentoModel[]> {
    const [,rows] = await this.docModel.update(
      { estado: 'necesita confirmacion' },
      { where: { id: { [Op.in]: docIds} }, transaction, returning: true }
    );

    return rows;
  }

  async confirmarDocumento(docId: number, transaction?: Transaction): Promise<DocumentoModel[]> {
        const [,rows] = await this.docModel.update(
      { estado: 'confirmado' },
      { where: { id: docId }, transaction, returning: true }
    );

    return rows;
  }

  async obtenerIdDocumentosVencidos(transaction?: Transaction): Promise<number[]> {
    const haceDosDias = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    const [count,rows] = await this.docModel.update({
      estado: 'terminado'
    },{
      where : {
        direccion_firmado: null as any,
        createdAt: {[Op.lt]: haceDosDias}
      },
      returning: true,
      transaction
    })

    return rows.map(doc => doc.id)
  }
}