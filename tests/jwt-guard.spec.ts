/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/28/2020
 * Time: 9:31 PM
 */

import {Application} from "@tngraphql/illuminate";
import {AuthManager} from "../src/AuthManager";
import {cleanup, getCtx, getDb, setup} from "./helpers";
import {GraphQLKernel} from "@tngraphql/illuminate/dist/Foundation";
import {HashServiceProvider} from "@tngraphql/illuminate/dist/Hashing/HashServiceProvider";
import {BaseModel} from "@tngraphql/lucid/build/src/Orm/BaseModel";
import {Adapter} from "@tngraphql/lucid/build/src/Orm/Adapter";
import {Auth} from "../src/Auth";
import {column} from "@tngraphql/lucid/build/src/Orm/Decorators";
import * as path from "path";
import {LucidUserProvider} from "../src/Providers/LucidUserProvider";

describe('JWT Guard', () => {
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
        app.setBasePath(__dirname);
    });

    it('Attempt to authenticate a user using the given credentials.', async () => {
        const guard = authManager.guard();
        const check = await guard.attempt({name: 'nguyen', password: 'nguyen'});

        expect(await guard.id()).toBe(1);
    });

    it('false when attempt to authenticate a user using the given credentials.', async () => {
        const guard = authManager.guard();
        const check = await guard.attempt({name: 'nguyen', password: 'nguyen3'});

        expect(check).toBe(false);
    });

    it('login user using the given credentials', async () => {
        const guard = authManager.guard();
        const user = await userModel.query().first();
        guard.login(user);
        expect(await guard.id()).toBe(user.id);
    });

    it('login user using userId', async () => {
        const guard = authManager.guard();
        await guard.loginUsingId(1);
        expect(await guard.id()).toBe(1);
        guard.logout()
        expect(await guard.id()).toBe(undefined);
        guard._loggedOut = false;
    });

    // Login 1 id user không tồn tại
    it('login user using userid false', async () => {
        const guard = authManager.guard();
        await guard.loginUsingId(-1);
        expect(await guard.loginUsingId(-1)).toBe(false);
    });

    it('logout', async () => {
        const guard = authManager.guard();
        await guard.loginUsingId(1);
        expect(await guard.id()).toBe(1);
        await guard.logout();
        expect(await guard.user()).toBeNull();
    });

    it('check login', async () => {
        const guard = authManager.guard();
        await guard.loginUsingId(1);
        expect(await guard.check()).toBe(true);
        await guard.logout();
        expect(await guard.check()).toBe(false);
    });

    it('check guest', async () => {
        const guard = authManager.guard();
        await guard.loginUsingId(1);
        expect(await guard.guest()).toBe(false);
        guard.logout();
        expect(await guard.guest()).toBe(true);
    });

    it('user create token', async () => {
        const guard = authManager.guard();
        guard._loggedOut = false;
        const user = await guard.user();
        const token = await user.createToken('new', [], app);
    });

    it('should throw error when can\'t exist auth-public.key', async () => {
        const guard = authManager.guard();
        guard._loggedOut = false;
        try {
            await guard.user();
        } catch (e) {
            expect(e.message).toBe(`${path.join(__dirname, 'app', 'auth-public.key')} does not exist or is not readable. fix: ts-node ace auth:keys`);
        }
    });

    it('should throw error when can\'t exist auth-private.key', async () => {
        expect.assertions(1);

        const provider: LucidUserProvider = authManager.createUserProvider();
        const user = await provider.retrieveById(1);
        app.setBasePath(path.join(__dirname, 'app'));
        try {
            await user.createToken('new', [], app);
        } catch (e) {
            expect(e.message).toBe(`${path.join(__dirname, 'app', 'auth-private.key')} does not exist or is not readable. fix: ts-node ace auth:keys`);
        }
    });

    it('user create token using login userid', async () => {
        const guard = authManager.guard();
        const user = await guard.loginUsingId(1);
        const token = await user.createToken('new', [], app);
    });

    it('Validate a user\'s credentials.', async () => {
        const guard = authManager.guard();
        const check = await guard.validate({name: 'nguyen', password: 'nguyen'});

        expect(check).toBe(true);
    });

    it('Validate a user\'s false pass', async () => {
        const guard = authManager.guard();
        const check = await guard.validate({name: 'nguyen', password: 'nguyen3'});

        expect(check).toBe(false);
    });

    it('GenericUser all method', async () => {
        const guard = authManager.guard();
        const user = await guard.user();

        expect(user.getAuthIdentifierName()).toBe('id');
        expect(user.getAuthIdentifier()).toBe(2);
        expect(user.getAuthPassword()).not.toBeNull();

    });

    it('Authenticatable all method', async () => {
        const guard = authManager.guard();
        const user = await guard.loginUsingId(1);

        expect(user.getAuthIdentifierName()).toBe('id');
        expect(user.getAuthIdentifier()).toBe(1);
        expect(user.getAuthPassword()).not.toBeNull();
    });

    describe('Not Auth', () => {
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

            ctx.req.bearerToken = () => null;

            BaseModel.$adapter = new Adapter(app.use('db'))

            class User extends Auth {
                static table = 'users';

                @column({isPrimary: true})
                public id: number

                @column()
                public name: string
                @column()
                public password: string

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
            app.setBasePath(__dirname);
        });

        it('Should run properly without authentication', async () => {
            const guard = authManager.guard();
            expect(await guard.user()).toBe(null);
        });
    });

});
