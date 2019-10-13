import { Schema, SchemaTypes, Types, Model, model, Document } from 'mongoose';

export let schema = new Schema({
    idPaciente: SchemaTypes.ObjectId,
    anio: Number,
    accesos: [{
        fecha: Date,
        usuario: {
            id: SchemaTypes.ObjectId,
            nomreCompleto: String,
            nombre: String,
            apellido: String,
            username: String,
            documento: String
        },
        matricula: String,
        motivo: String,
        idTurno: SchemaTypes.ObjectId,
        idPrestacion: SchemaTypes.ObjectId,
        organizacion: SchemaTypes.Mixed,
        cliente: {
            ip: String,
            userAgent: { // schema de plugin https://github.com/biggora/express-useragent
                isMobile: Boolean,
                isDesktop: Boolean,
                isBot: Boolean,
                browser: String,
                version: String,
                os: String,
                platform: String,
                source: String
            }
        },
        servidor: {
            ip: String
        }
    }]
});

export interface ILogPrivacidad extends Document {
    idPaciente: Types.ObjectId;
    anio: Number;
    accesos: [{
        fecha: Date;
        usuario: any;
        matricula: String;
        motivo: String;
        idTurno: Types.ObjectId;
        idPrestacion: Types.ObjectId;
        organizacion: any;

    }];
    cliente: {
        ip: String;
        userAgent: {
            isMobile: Boolean;
            isDesktop: Boolean;
            isBot: Boolean;
            browser: String;
            version: String;
            os: String;
            platform: String;
            source: String;
        }
    };
    servidor: {
        ip: String
    };
}

// Exportar modelo
export const LogPrivacidad: Model<ILogPrivacidad> = model<ILogPrivacidad>('logPrivacidad', schema, 'logPrivacidad');

