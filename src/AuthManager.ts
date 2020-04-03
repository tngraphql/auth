/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/26/2020
 * Time: 9:54 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { AuthManagerContract } from './Contract/AuthManagerContract';
import { ApplicationContract } from '@tngraphql/illuminate/dist/Contracts/ApplicationContract';
import { GuardContract } from './Contract/GuardContract';
import { InvalidArgumentException } from './Exception/InvalidArgumentException';
import { CreatesUserProviders } from './CreatesUserProviders';
import {JwtGuard} from "./Guards/JwtGuard";
import {JwtVerify} from "./Guards/JwtVerify";
import {RequestGuard} from "./Guards/RequestGuard";
import {StatefulGuardContract} from "./Contract/StatefulGuardContract";
import {Authenticatable} from "./Contract/Authenticatable";

const upperFirst = require('lodash.upperfirst');

export class AuthManager extends CreatesUserProviders implements AuthManagerContract {
    protected _guards: Map<any, any> = new Map<any, any>();

    /**
     * The registered custom driver creators.
     */
    protected _customCreators: { [key: string]: any; } = {};

    constructor(public app: ApplicationContract, public ctx: any) {
        super();
    }

    public plush() {
        this._guards = new Map<any, any>();
        this._customCreators = {};
        this._customProviderCreators = {};
    }

    /**
     * Attempt to get the guard from the local cache.
     *
     * @param name
     */
    public guard(name: string = null): StatefulGuardContract {
        if ( ! name ) {
            name = this.getDefaultDriver();
        }

        if ( ! this._guards.has(name) ) {
            this._guards.set(name, this.resolve(name));
        }

        return this._guards.get(name);
    }

    /**
     * Get the default authentication driver name.
     */
    public getDefaultDriver(): string {
        return this.app.config.get('auth.defaults.guard');
    }

    /**
     * Set the default authentication driver name.
     *
     * @param name
     */
    public setDefaultDriver(name: string): void {
        this.app.config.set('auth.defaults.guard', name);
    }

    /**
     * Resolve the given guard.
     *
     * @param name
     *
     * @Throw InvalidArgumentException
     */
    protected resolve(name: string): GuardContract {
        const config = this.getConfig(name);

        if ( ! config ) {
            throw new InvalidArgumentException(`Auth guard [${ name }] is not defined.`)
        }

        if ( this._customCreators[config.driver] ) {
            return this.callCustomCreator(name, config);
        }

        const driverMethod = `create${ upperFirst(config['driver'])}Driver`;

        if ( typeof this[driverMethod] === 'function' ) {
            return this[driverMethod](name, config);
        }

        throw new InvalidArgumentException(`Auth driver [${config['driver']}] for guard [${name}] is not defined.`)
    }

    protected getConfig(name: string): any {
        return this.app.config.get(`auth.guards.${ name }`);
    }

    protected callCustomCreator(name: string, config: any): GuardContract {
        return this._customCreators[config.driver](this.app, name, config);
    }

    /**
     * Register a custom driver creator Closure.
     *
     * @param driver
     * @param callback
     */
    public extend(driver: string, callback: Function): this {
        this._customCreators[driver] = callback.bind(this);
        return this;
    }

    /**
     *  Register a custom provider creator Closure.
     */
    public provider(name: string, callback: Function): this {
        this._customProviderCreators[name] = callback;
        return this;
    }

    /**
     * Create a token based authentication guard.
     *
     * @param name
     * @param config
     */
    public createJwtDriver(name: string, config: any) {
        return new JwtGuard((provider, request) => {

            return new JwtVerify(provider).user(request);

        }, this.createUserProvider(config.provider), this.ctx.req);
    }

    /**
     * Register a new callback based request guard.
     *
     * @param driver
     * @param callback
     */
    public viaRequest(driver, callback: () => Authenticatable | null | Promise<Authenticatable | null>) {
        return this.extend(driver, () => {
            return new RequestGuard(callback, this.ctx.req, this.createUserProvider());
        });
    }
}
