/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/29/2020
 * Time: 6:44 AM
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
import {RequestGuard} from "../src/Guards/RequestGuard";
import {GenericUser} from "../src/GenericUser";

describe('Request Guard', () => {
    describe('Auth', () => {
        let app;
        let kernel;
        let authManager: AuthManager;
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
                        driver: 'lucid',
                        model: userModel,
                        table: 'users',
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

            authManager.extend('customGuard', function() {
                return new RequestGuard((request, provider) => {
                    return new GenericUser({
                        id: 1,
                        name: 'nguyen',
                        password: '12345'
                    });
                }, this.ctx.req, this.createUserProvider());
            });
        });

        afterEach(async () => {
            authManager.plush();
            authManager.extend('customGuard', function() {
                return new RequestGuard((request, provider) => {
                    return new GenericUser({
                        id: 1,
                        name: 'nguyen',
                        password: '12345'
                    });
                }, this.ctx.req, this.createUserProvider());
            });
        });

        it('Get the currently authenticated user.', async () => {
            const guard = authManager.guard('customGuard');
            const user = await guard.user();
            expect(user.getAuthIdentifier()).toBe(1);
        });

        it('Determine if the current user is authenticated.', async () => {
            const guard = authManager.guard('customGuard');
            expect(await guard.check()).toBe(true);
        });

        it('Determine if the current user is a guest.', async () => {
            const guard = authManager.guard('customGuard');
            expect(await guard.guest()).toBe(false);
        });

        it('Get the ID for the currently authenticated user.', async () => {
            const guard = authManager.guard('customGuard');
            expect(await guard.id()).toBe(1);
        });

        it('Validate a user\'s credentials.', async () => {
            const guard = authManager.guard('customGuard');
            expect(await guard.validate({})).toBe(true);
        });

        it('Set the current user.', async () => {
            const guard = authManager.guard('customGuard');
            guard.setUser(new GenericUser({
                id: 2,
                name: 'nguyen2'
            }));

            expect(await guard.id()).toBe(2);
        });

        it('Set the current request instance.', async () => {
            const guard: RequestGuard = authManager.guard('customGuard') as any;
            guard.setRequest({});
            expect(guard.request).toEqual({});
        });
    });

    describe('no Auth', () => {
        let app;
        let kernel;
        let authManager: AuthManager;
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
                        driver: 'lucid',
                        model: userModel,
                        table: 'users',
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

            authManager.extend('customGuard', function() {
                return new RequestGuard((request, provider) => {
                    return null;
                }, this.ctx.req, this.createUserProvider());
            });
        });

        afterEach(async () => {
            authManager.plush();
            authManager.extend('customGuard', function() {
                return new RequestGuard((request, provider) => {
                    return null;
                }, this.ctx.req, this.createUserProvider());
            });
        });

        it('Get the currently authenticated user.', async () => {
            const guard = authManager.guard('customGuard');
            expect(await guard.user()).toBe(null);
        });

        it('Determine if the current user is authenticated.', async () => {
            const guard = authManager.guard('customGuard');
            expect(await guard.check()).toBe(false);
        });

        it('Determine if the current user is a guest.', async () => {
            const guard = authManager.guard('customGuard');
            expect(await guard.guest()).toBe(true);
        });

        it('Get the ID for the currently authenticated user.', async () => {
            const guard = authManager.guard('customGuard');
            expect(await guard.id()).toBe(null);
        });

        it('Validate a user\'s credentials.', async () => {
            const guard = authManager.guard('customGuard');
            expect(await guard.validate({})).toBe(false);
        });
    });
});
