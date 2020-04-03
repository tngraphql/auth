/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/28/2020
 * Time: 8:43 PM
 */

import {StatefulGuardContract} from "../Contract/StatefulGuardContract";
import {Authenticatable} from "../Contract/Authenticatable";
import {UserProviderContract} from "../Contract/UserProviderContract";
import {GenericUser} from "../GenericUser";

export class JwtGuard implements StatefulGuardContract {
    protected _lastAttempted;

    protected _user;

    protected _loggedOut: boolean = false;

    constructor(
        public callback: Function,
        public provider: UserProviderContract,
        public request: any,
        public hash: boolean = false
    ) {
    }

    async attempt(credentials?: any): Promise<boolean> {
        const user = await this.provider.retrieveByCredentials(credentials);

        this._lastAttempted = user;

        if (await this.hasValidCredentials(user, credentials)) {
            this.login(user as any);
            return true;
        }

        return false;
    }

    public async check() {
        return !!await this.user()
    }

    public async guest() {
        return !await this.check();
    }

    public async id() {
        if (this._loggedOut) {
            return;
        }

        const user = await this.user();

        return user ? user.getAuthIdentifier() : null;
    }

    login(user: Authenticatable): void {
        this.setUser(user);
    }

    public async loginUsingId(id: any): Promise<Authenticatable | boolean> {
        const user = await this.provider.retrieveById(id);

        if (user) {
            this.login(user);
            return user;
        }

        return false;
    }

    public logout(): void {
        // xử lý logout
        this._user = null;
        this._loggedOut = true;
    }

    public setUser(user) {
        this._user = user;

        this._loggedOut = false;

        return this;
    }

    public async user() {
        if (this._loggedOut) {
            return null;
        }

        if (this._user) {
            return this._user;
        }

        const user = await this.callback(this.provider, this.request);

        if (!user) {
            return null;
        }

        this._user = user; // this.getGenericUser(user);

        return this._user;
    }

    /**
     * Validate a user's credentials.
     *
     * @param credentials
     */
    public async validate(credentials: any) {
        const user = await this.provider.retrieveByCredentials(credentials);

        if (await this.hasValidCredentials(user, credentials)) {
            return true;
        }
        return false;
    }

    protected hasValidCredentials(user, credentials: any): boolean {
        return user && this.provider.validateCredentials(user, credentials);
    }

    getGenericUser(user) {
        if (!user) {
            return null;
        }

        return new GenericUser(user);
    }
}
