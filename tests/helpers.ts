/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/26/2020
 * Time: 2:21 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {ConnectionConfigContract, DatabaseContract} from '@ioc:Adonis/Lucid/Database';
import {join} from "path";
import {Filesystem} from '@poppinss/dev-utils'
import * as dotenv from 'dotenv'
import * as knex from 'knex'
import {Database} from '@tngraphql/lucid/build/src/Database';
import {Profiler} from '@adonisjs/profiler/build/standalone'
import {FakeLogger as Logger} from '@adonisjs/logger/build/standalone'
import {BaseModel} from "@tngraphql/lucid/build/src/Orm/BaseModel";
import {Adapter} from "@tngraphql/lucid/build/src/Orm/Adapter";
import {column} from "@tngraphql/lucid/build/src/Orm/Decorators";
import {HashManager} from "@tngraphql/illuminate/dist/Hashing/HashManager";
import {Application, LoadConfiguration} from "@tngraphql/illuminate";

export const fs = new Filesystem(join(__dirname, 'tmp'))
dotenv.config()

/**
 * Returns config based upon DB set in environment variables
 */
export function getConfig(): ConnectionConfigContract {
    switch (process.env.DB) {
        case 'sqlite':
            return {
                client: 'sqlite',
                connection: {
                    filename: join(fs.basePath, 'db.sqlite'),
                },
                useNullAsDefault: true,
                debug: false,
            }
        case 'mysql':
            return {
                client: 'mysql',
                connection: {
                    host: process.env.MYSQL_HOST as string,
                    port: Number(process.env.MYSQL_PORT),
                    database: process.env.DB_NAME as string,
                    user: process.env.MYSQL_USER as string,
                    password: process.env.MYSQL_PASSWORD as string,
                },
                useNullAsDefault: true,
            }
        case 'pg':
            return {
                client: 'pg',
                connection: {
                    host: process.env.PG_HOST as string,
                    port: Number(process.env.PG_PORT),
                    database: process.env.DB_NAME as string,
                    user: process.env.PG_USER as string,
                    password: process.env.PG_PASSWORD as string,
                },
                useNullAsDefault: true,
            }
        default:
            throw new Error(`Missing test config for ${process.env.DB} connection`)
    }
}

export function getConfigAuth(Model) {
    return {
        defaults: {
            guard: 'api',
            provider: 'users'
        },
        guards: {
            api: {
                driver: 'jwt'
            }
        },
        providers: {
            users: {
                driver: 'lucid',
                model: Model,
                table: '',
            }
        },
        passwords: {
            users: {
                provider: '',
                table: '',
                expire: '',
            }
        },

        public_key: '',
        private_key: ''
    }
}

/**
 * Returns the database instance
 */
export function getDb() {
    const config = {
        connection: 'primary',
        connections: {
            primary: getConfig(),
            secondary: getConfig(),
        },
    }

    return new Database(config, getLogger(), getProfiler()) as DatabaseContract
}

/**
 * Returns fake logger instance
 */
export function getLogger() {
    return new Logger({
        enabled: true,
        name: 'lucid',
        level: 'debug',
    })
}

/**
 * Returns profiler instance
 */
export function getProfiler(enabled: boolean = false) {
    return new Profiler(__dirname, getLogger(), {enabled})
}

export async function getCtx(db) {
    BaseModel.$adapter = new Adapter(db)
    const {Auth} = require( "../src/Auth");
    class User extends Auth {
        static table = 'users';

        @column({isPrimary: true})
        public id: number

        @column()
        public name: string
    }

    User.boot();

    const model = User.query();
    model.where('id', 2);
    const user = await model.first()

    const token = await user.createToken('name', ['createUser', 'updateUser']);

    return {
        req: {
            // bearer
            bearerToken: () => {
                return token;
            }
        },
        res: {}
    };
}

/**
 * Does base setup by creating databases
 */
export async function setup() {
    if (process.env.DB === 'sqlite') {
        await fs.ensureRoot()
    }

    const db = knex(getConfig())

    const hasUsersTable = await db.schema.hasTable('users')
    if (!hasUsersTable) {
        await db.schema.createTable('users', (table) => {
            table.increments()
            table.string('name');
            table.string('password');
            table.string('remember_token', 100);
            table.timestamps();

        });
        const app = new Application();
        new LoadConfiguration().bootstrap(app);
        const hash = new HashManager(app);

        await db.table('users').insert([
            {
                id: 1,
                name: 'nguyen',
                password: hash.make('nguyen'),
                remember_token: 'bearer token',
            },
            {
                id: 2,
                name: 'nguyen2',
                password: hash.make('nguyen2'),
                remember_token: 'bearer ',
            }
        ]);
    }
    await db.destroy()
}

/**
 * Does cleanup removes database
 */
export async function cleanup(customTables?: string[]) {
    const db = knex(getConfig())

    if (customTables) {
        await Promise.all(customTables.map((table) => db.schema.dropTableIfExists(table)))
        await db.destroy()
        return
    }

    await db.schema.dropTableIfExists('users')

    await db.destroy()
}
