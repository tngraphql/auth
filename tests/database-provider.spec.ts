/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/29/2020
 * Time: 6:24 AM
 */

import {cleanup, getCtx, getDb, setup} from "./helpers";
import {Application} from "@tngraphql/illuminate";
import {GraphQLKernel} from "@tngraphql/illuminate/dist/Foundation";
import {HashServiceProvider} from "@tngraphql/illuminate/dist/Hashing/HashServiceProvider";
import {BaseModel} from "@tngraphql/lucid/build/src/Orm/BaseModel";
import {Adapter} from "@tngraphql/lucid/build/src/Orm/Adapter";
import {Auth} from "../src/Auth";
import {column} from "@tngraphql/lucid/build/src/Orm/Decorators";
import {AuthManager} from "../src/AuthManager";
import {generateToken} from "../src/utils";
import {DatabaseUserProvider} from "../src/Providers/DatabaseUserProvider";

describe('Database User Provider', () => {
    let app;
    let kernel;
    let authManager;
    let userModel;
    let ctx;

    beforeAll(async () => {
        await cleanup();
        await setup();

        app = new Application(__dirname);
        kernel = new GraphQLKernel(app);
        await app.register(new HashServiceProvider(app));
        await kernel.handle();
        app.singleton('db', () => getDb());
        ctx = await getCtx(app.use('db'), app);

        BaseModel.$adapter = new Adapter(app.use('db'))

        class User extends Auth {
            static table = 'users';

            @column({isPrimary: true})
            public id: number

            @column()
            public name: string

            @column()
            public password: string

            @column({columnName: 'remember_token'})
            public rememberToken: string

            _rememberTokenName = 'rememberToken';
        }

        userModel = User;

        app.config.set('auth', {
            defaults: {
                guard: 'api',
                provider: 'users'
            },
            guards: {
                api: {
                    driver: 'jwt'
                },
                web: {
                    driver: 'jwt'
                },
                customGuard: {
                    driver: 'customGuard'
                }
            },
            providers: {
                users: {
                    driver: 'lucid',
                    model: userModel,
                    table: 'users',
                },
                lucid: {
                    driver: 'lucid',
                    model: userModel,
                    table: 'users',
                },
                database: {
                    driver: 'database',
                    model: userModel,
                    table: 'users',
                },
                customProvider: {
                    driver: 'customProvider',
                    model: '',
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
        });

        authManager = new AuthManager(app, ctx);
    });

    beforeEach(async () => {
        authManager.plush();
    });

    it('should retrieve a user by their unique identifier.', async () => {
        const provider = authManager.createUserProvider('database');
        const user = await provider.retrieveById(1);
        expect(user.getAuthIdentifier()).toBe(1);
    });

    it('should retrieve a user by their unique identifier and "remember me" token', async () => {
        const provider: DatabaseUserProvider = authManager.createUserProvider('database');
        const user = await provider.retrieveByToken(1, 'bearer token');
        expect(user.getAuthIdentifier()).toBe(1);

        const user2 = await provider.retrieveByToken(1, 'bearer token2');
        expect(user2).toBeNull();

        const user3 = await provider.retrieveByToken(3, 'bearer token');
        expect(user3).toBeNull();
    });

    it('update the "remember me" token for the given user in storage.', async () => {
        const provider = authManager.createUserProvider('database');
        const user = await provider.retrieveByToken(1, 'bearer token');

        const token = generateToken(20);

        await provider.updateRememberToken(user, token);
        const user2 = await provider.retrieveByToken(1, token);

        expect(user2.getAuthIdentifier()).toBe(1);
    });

    it('Retrieve a user by the given credentials.', async () => {
        const provider = authManager.createUserProvider('database');
        const user = await provider.retrieveByCredentials({
            name: 'nguyen',
            password: '1232',
            ansd_password: '243253'
        });

        expect(user.name).toBe('nguyen');
        expect(user.getAuthIdentifier()).toBe(1);
    });

    // không thể tìm được user nếu chỉ có password
    it('Cannot find user if only password', async () => {
        const provider = authManager.createUserProvider('database');
        const user = await provider.retrieveByCredentials({
            password: '1232',
            ansd_password: '243253'
        });

        expect(user).toBeNull();
    });

    it('Validate a user against the given credentials.', async () => {
        const provider: DatabaseUserProvider = authManager.createUserProvider('database');
        const user = await provider.retrieveByCredentials({
            name: 'nguyen',
        });

        const validate = await provider.validateCredentials(user, {
            password: 'nguyen'
        });

        expect(validate).toBeTruthy();
    });
});
