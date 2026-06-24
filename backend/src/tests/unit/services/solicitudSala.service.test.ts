import './../../helpers/mocks/models'
import { SolicitudSalaService } from '../../../modulos/solicitudes/solicitudesSala/solicitudSala.service';


describe('SolicitudSalaService - validarFechasLocales', () => {
    let service: SolicitudSalaService;

    beforeAll(() => {
        service = new SolicitudSalaService({} as any);
    });

    it('debe validar fechas correctas', () => {
        const ahora = Date.now();
        const inicio = new Date(ahora + 3 * 60 * 60 * 1000); // 3h desde ahora
        const fin = new Date(ahora + 5 * 60 * 60 * 1000);    // 5h desde ahora

        const resultado = service.validarFechasLocales(
            [inicio],
            [fin],
            ['Plan Test']
        );

        expect(resultado[0].valido).toBe(true);
    });

    it('debe rechazar fecha de inicio menor a 1 hora desde ahora', () => {
        const ahora = Date.now();
        const inicio = new Date(ahora + 30 * 60 * 1000); // 30min
        const fin = new Date(ahora + 3 * 60 * 60 * 1000);

        const resultado = service.validarFechasLocales(
            [inicio],
            [fin],
            ['Plan Test']
        );

        expect(resultado[0].valido).toBe(false);
    });

    it('debe rechazar si la duración es menor a 1 hora', () => {
        const ahora = Date.now();
        const inicio = new Date(ahora + 3 * 60 * 60 * 1000);
        const fin = new Date(ahora + 3.5 * 60 * 60 * 1000); // solo 30min

        const resultado = service.validarFechasLocales(
            [inicio],
            [fin],
            ['Plan Test']
        );

        expect(resultado[0].valido).toBe(false);
    });

    it('debe detectar solapamiento entre dos intervalos', () => {
        const ahora = Date.now();
        const inicio1 = new Date(ahora + 3 * 60 * 60 * 1000);     
        const fin1 = new Date(ahora + 5 * 60 * 60 * 1000);        
        const inicio2 = new Date(ahora + 4 * 60 * 60 * 1000);   
        const fin2 = new Date(ahora + 6 * 60 * 60 * 1000);         

        const resultado = service.validarFechasLocales(
            [inicio1, inicio2],
            [fin1, fin2],
            ['Plan A', 'Plan B']
        );

        expect(resultado[0].valido).toBe(false);  
        expect(resultado[1].valido).toBe(false); 
    });

    it('debe aceptar intervalos consecutivos sin solapamiento', () => {
        const ahora = Date.now();
        const margen = 30 * 60 * 1000 + 1000; // 30min + 1seg
        const inicio1 = new Date(ahora + 3 * 60 * 60 * 1000);
        const fin1 = new Date(ahora + 5 * 60 * 60 * 1000);
        const inicio2 = new Date(fin1.getTime() + margen);
        const fin2 = new Date(inicio2.getTime() + 2 * 60 * 60 * 1000);

        const resultado = service.validarFechasLocales(
            [inicio1, inicio2],
            [fin1, fin2],
            ['Plan A', 'Plan B']
        );

        expect(resultado[0].valido).toBe(true);
        expect(resultado[1].valido).toBe(true);
    });
});