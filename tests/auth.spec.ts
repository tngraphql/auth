/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/26/2020
 * Time: 10:02 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {AuthManager} from '../src/AuthManager';
import {Application} from '@tngraphql/illuminate';
import {GraphQLKernel} from '@tngraphql/illuminate/dist/Foundation';
import {BaseModel} from '@tngraphql/lucid/build/src/Orm/BaseModel';
import {column} from '@tngraphql/lucid/build/src/Orm/Decorators';
import {Adapter} from '@tngraphql/lucid/build/src/Orm/Adapter';
import {cleanup, getCtx, getDb, setup} from './helpers';
import {HashServiceProvider} from '@tngraphql/illuminate/dist/Hashing/HashServiceProvider';
import {Auth} from "../src/Auth";
import {GenericUser} from "../src/GenericUser";

require('dotenv').config()

let db;
describe('auth', () => {
    let app;
    let kernel;
    let authManager: AuthManager;
    let userModel;

    beforeAll(async () => {
        await cleanup();
        await setup();

        app = new Application(__dirname);
        kernel = new GraphQLKernel(app);
        await app.register(new HashServiceProvider(app));
        await kernel.handle();

        app.singleton('db', () => getDb());
        const ctx = await getCtx(app.use('db'), app);

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
                },
                noDriver: {
                    driver: 'no'
                }
            },
            providers: {
                users: {
                    driver: 'lucid',
                    model: '',
                    table: '',
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
        BaseModel.$adapter = new Adapter(app.use('db'))

        class User extends Auth {
            static table = 'users';

            @column({isPrimary: true})
            public id: number

            @column()
            public name: string
        }

        userModel = User;

        authManager = new AuthManager(app, ctx);
    });

    afterEach(() => {
        authManager.plush();
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
                },
                noDriver: {
                    driver: 'no'
                }
            },
            providers: {
                users: {
                    driver: 'lucid',
                    model: '',
                    table: '',
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
    })

    // Nhận một guard từ bộ nhớ cục bộ
    it('get the guard from the default', async () => {
        const guard = authManager.guard();

        expect(guard).toBe(authManager.guard(authManager.getDefaultDriver()));
    });

    it('get the guard from the name', async () => {
        expect(() => authManager.guard('web')).not.toThrow();
        const guard = authManager.guard('web');
        expect(guard).toBe((authManager as any)._guards.get('web'));
    });

    it('set default guard', async () => {
        authManager.setDefaultDriver('web');

        expect(authManager.getDefaultDriver()).toBe('web');
    });

    it('define custom guard', async () => {
        authManager.extend('customGuard', () => {
            return 'customGuard';
        });

        expect(Object.keys((authManager as any)._customCreators).includes('customGuard')).toBe(true);
        expect(authManager.guard('customGuard')).toBe('customGuard');
    });

    it('define custom provider', async () => {
        authManager.provider('customProvider', () => {
            return 'customProvider';
        });

        expect(Object.keys((authManager as any)._customProviderCreators).includes('customProvider')).toBe(true);
        expect(authManager.createUserProvider('customProvider')).toBe('customProvider');
    });

    it('update default provider', async () => {
        authManager.setDefaultUserProvider('customProvider');
        expect(authManager.getDefaultUserProvider()).toBe('customProvider');
    });

    it('should throw when can\'t find guard', async () => {
        expect(() => authManager.guard('not')).toThrow('Auth guard [not] is not defined.');
    });

    it('should throw when can\'t find driver', async () => {
        expect(() => authManager.guard('noDriver')).toThrow('Auth driver [no] for guard [noDriver] is not defined.');
    });

    it('Register a new callback based request guard.', async () => {
        await authManager.plush();
        await authManager.viaRequest('customGuard', () => {
            return new GenericUser({id: 1, name: 'nguyen'});
        });
        const user = await authManager.guard('customGuard');

        expect(Object.keys((authManager as any)._customCreators).includes('customGuard')).toBe(true);
        expect(await user.id()).toBe(1);
    });

    it('should throw when provider is not define.', async () => {
        expect(() => authManager.createUserProvider('customProvider')).toThrow('Authentication user provider [customProvider] is not defined.');

    });

    it(`provider is null, undefined, '', 0 then should get default provider`, async () => {
        const provider = authManager.createUserProvider();

        const classInstance = (provider as any).constructor;

        expect(authManager.createUserProvider(null)).toBeInstanceOf(classInstance);
        expect(authManager.createUserProvider(undefined)).toBeInstanceOf(classInstance);
        expect(authManager.createUserProvider('')).toBeInstanceOf(classInstance);
        expect(authManager.createUserProvider(0 as any)).toBeInstanceOf(classInstance);
    });

    it('if default provider is null and get provider null then return null', async () => {
        authManager.setDefaultUserProvider(null);
        expect(authManager.createUserProvider()).toBe(null);
    });
})
