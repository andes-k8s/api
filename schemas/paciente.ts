import * as mongoose from 'mongoose';
import * as ubicacionSchema from './ubicacion';

var pacienteSchema = new mongoose.Schema({
    documento: String,
    activo: Boolean,
    estado: {
        type: String,
        required: true,
        enum: ["temporal", "identificado", "validado", "recienNacido", "extranjero"]
    },
    nombre: String,
    apellido: String,
    alias: String,
    contacto: [{
        tipo: {
            type: String,
            enum: ["telefonoFijo", "telefonoCelular", "email"]
        },
        valor: String,
        ranking: Number, // Specify preferred order of use (1 = highest) // Podemos usar el rank para guardar un historico de puntos de contacto (le restamos valor si no es actual???)
        ultimaActualizacion: Date,
        activo: Boolean
    }],
    sexo: {
        type: String,
        enum: ["femenino", "masculino", "otro"]
    },
    genero: {
        type: String,
        enum: ["femenino", "masculino", "otro"]
    }, // identidad autopercibida
    fechaNacimiento: Date, // Fecha Nacimiento
    fechaFallecimiento: Date,
    direccion: [{
        valor: String,
        codigoPostal: String,
        ubicacion: ubicacionSchema,
        ranking: Number,
        geoReferencia: {
            type: [Number], // [<longitude>, <latitude>]
            index: '2d' // create the geospatial index
        },
        ultimaActualizacion: Date,
        activo: Boolean
    }],
    estadoCivil: {
        type: String,
        enum: ["casado", "separado", "divorciado", "viudo", "soltero", "otro"]
    },
    foto: String,
    tutor: [{
        relacion: {
            type: String,
            enum: ["padre", "madre", "hijo", "tutor"]
        },
        referencia: {
            type: Number,
            ref: 'paciente'
        }
    }],
    financiador: [{ //obrasocial, plan sumar 
        id: mongoose.Schema.Types.ObjectId,
        nombre: String,
        activo: Boolean,
        fechaAlta: Date,
        fechaBaja: Date,
        ranking: Number,
    }]
});


//Creo un indice para fulltext Search
pacienteSchema.index({
    '$**': 'text'
});
var paciente = mongoose.model('paciente', pacienteSchema, 'paciente');
export = paciente;