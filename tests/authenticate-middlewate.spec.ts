/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/29/2020
 * Time: 3:23 PM
 */

import {Application} from "@tngraphql/illuminate";
import {cleanup, getCtx, getDb, setup} from "./helpers";
import {GraphQLKernel} from "@tngraphql/illuminate/dist/Foundation";
import {HashServiceProvider} from "@tngraphql/illuminate/dist/Hashing/HashServiceProvider";
import {BaseModel} from "@tngraphql/lucid/build/src/Orm/BaseModel";
import {Auth} from "../src/Auth";
import {column} from "@tngraphql/lucid/build/src/Orm/Decorators";
import {AuthManager} from "../src/AuthManager";
import {Authenticate} from "../src/Middleware/Authenticate";
import {Context} from "@tngraphql/graphql/dist/resolvers/context";
import {AuthServiceProvider} from "../src/AuthServiceProvider";
import {Adapter} from "@tngraphql/lucid/build/src/Orm/Adapter/Adapter";

describe('Authenticate | Middleware', () => {
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
    afterAll(async () => {
        await cleanup();
    })

    beforeEach(async () => {
        authManager.plush();
        app.setBasePath(__dirname);
    });

    it('should pass authen', async () => {
        await app.register(new AuthServiceProvider(app));
        const context: any = new Context({
            req: {
                headers: {}
            },
            res: {}
        });

        context.req.headers.authorization = ctx.req.bearerToken();
        await new Authenticate().handle({context} as any, async () => {
        }, []);
    });

    it('should throw when no authorization', async () => {
        expect.assertions(3);

        await app.register(new AuthServiceProvider(app));
        const context: any = new Context({
            req: {
                headers: {}
            },
            res: {}
        });

        // context.req.headers.authorization = ctx.req.bearerToken();

        try {
            await new Authenticate().handle({context} as any, async () => {
            }, [])
        } catch (e) {
            expect(e.message).toBe('E_AUTHENTICATION: Unauthenticated.');
            expect(e.code).toBe('E_AUTHENTICATION');
            expect(e.status).toBe(401);
        }
        ;
    });
});
