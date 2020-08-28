/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/27/2020
 * Time: 6:12 PM
 */
import {GuardContract} from "../Contract/GuardContract";
import {Authenticatable} from "../Contract/Authenticatable";
import { Macroable } from 'macroable/build';
import {UserProviderContract} from "../Contract/UserProviderContract";

export class RequestGuard extends Macroable implements GuardContract {
    /**
     * Required by macroable
     */
    protected static macros = {}
    protected static getters = {}

    protected $requestUser;

    protected _user: Authenticatable;

    constructor(
        public callback: (request, provider) => Promise<any> | any,
        public request: any,
        public provider: UserProviderContract) {
        super();
    }

    public async check() {
        return !!await this.user();
    }

    public async guest() {
        return !await this.check();
    }

    public async id() {
        const user = await this.user();

        return user ? user.getAuthIdentifier() : null;
    }

    /**
     *
     * @param user
     */
    public setUser(user: Authenticatable) {
        this._user = user;
        return this;
    }

    public async user() {
        if (this._user) {
            return this._user;
        }

        if (!this.$requestUser) {
            this.$requestUser = this.callback(this.provider, this.request);
        }

        const user = await this.$requestUser;

        this.$requestUser = null;

        if (!user) {
            return null;
        }

        return this._user = user;
    }

    public async validate(credentials: any[]) {
        return !!await (new RequestGuard(this.callback, this.request, this.provider)).user();
    }

    /**
     * Set the current request instance.
     * @param request
     */
    public setRequest(request) {
        this.request = request;
        return this;
    }
}
