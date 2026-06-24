import { Injectable } from "../../helpers/decorators/injectable.decorator";
import { TrueConfClient } from "../../config/trueconf.client";


//@Injectable()
class TrueConfIntegrationService{
    constructor(private client = TrueConfClient.getInstance().getClient()){}

    async obtenerConferencia(conferenceId: string): Promise<any>{
        if(process.env.NODE_ENV == 'development'){
            return true;
        }
            const conferencia = await this.client.get(`${conferenceId}`);
            return conferencia.data;
    }

    async existeConferencia(conferenceId: string): Promise<boolean>{
        const conferencia = await this.obtenerConferencia(conferenceId);
        return conferencia != null;
    }

}

export default TrueConfIntegrationService;