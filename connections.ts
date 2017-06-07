import * as mongoose from 'mongoose';
import { schemaDefaults } from './mongoose/defaults';
import * as configPrivate from './config.private';

export class Connections {
    static main: mongoose.Connection;
    static mpi: mongoose.Connection;
    static snomed: mongoose.Connection;

    /**
     * Inicializa las conexiones a MongoDB
     *
     * @static
     *
     * @memberOf Connections
     */
    static initialize() {
        // Configura Mongoose
        mongoose.plugin(schemaDefaults);
        if (configPrivate.mongooseDebugMode) {
            mongoose.set('debug', true);
        }

        // Conecta y configura conexiones
        mongoose.connect(`mongodb://${configPrivate.hosts.mongoDB_main.host}`, { auth: configPrivate.hosts.mongoDB_mpi.auth, server: configPrivate.hosts.mongoDB_mpi.server });
        this.main = mongoose.connection;

        this.mpi = mongoose.createConnection(`mongodb://${configPrivate.hosts.mongoDB_mpi.host}`, { auth: configPrivate.hosts.mongoDB_mpi.auth, server: configPrivate.hosts.mongoDB_mpi.server });

        this.snomed = mongoose.createConnection(`mongodb://${configPrivate.hosts.mongoDB_snomed.host}/es-edition`, { auth: configPrivate.hosts.mongoDB_mpi.auth, server: configPrivate.hosts.mongoDB_snomed.server });

        // Configura eventos
        this.configEvents('MongoDB', this.main);
        this.configEvents('MPI', this.mpi);
        this.configEvents('SNOMED', this.snomed);
    }

    private static configEvents(name: string, connection: mongoose.Connection) {
        connection.on('connecting', function () {
            console.log(`[${name}] Connecting ...`);
        });

        connection.on('error', function (error) {
            console.log(`[${name}] Error: ${error}`);
            // try {
            //     mongoose.disconnect();
            // } catch (e) {
            // }
        });
        connection.on('connected', function () {
            console.log(`[${name}] Connected`);
        });
        connection.once('open', function () {
            console.log(`[${name}] Open`);
        });
        connection.on('reconnected', function () {
            console.log(`[${name}] Reconnected`);
        });
        connection.on('disconnected', function () {
            console.log(`[${name}] Disconnected`);
        });
    }
}
