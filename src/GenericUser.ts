import {Authenticatable} from "./Contract/Authenticatable";
import {Application} from "@tngraphql/illuminate";
import {PersonalAccessTokenFactory} from "./PersonalAccessTokenFactory";

/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/28/2020
 * Time: 2:45 PM
 */

export class GenericUser implements Authenticatable {
    [key: string]: any;

    /**
     * The column name of the "remember me" token.
     *
     * @var string
     */
    protected _rememberTokenName = 'remember_token';

    // protected _accessToken;

    constructor(protected $attributes = {}) {
        for (let key in $attributes) {
            Object.defineProperty(this, key, {
                get: () => {
                    return $attributes[key];
                },
                configurable: true,
                enumerable: true,
            })
        }
    }

    toJSON() {
        return this.$attributes;
    }

    createToken(name: string, scopes: any = []) {
        return new PersonalAccessTokenFactory(Application.getInstance())
            .make(this.getAuthIdentifier(), name, scopes);
    }

    // public withAccessToken(accessToken) {
    //     this._accessToken = accessToken;
    //     return this;
    // }

    getAuthIdentifier(): any {
        return this.$attributes[this.getAuthIdentifierName()];
    }

    getAuthIdentifierName(): string {
        return "id";
    }

    getAuthPassword(): string {
        return this.$attributes['password'];
    }

    getRememberToken(): string {
        return this.$attributes[this.getRememberTokenName()];
    }

    getRememberTokenName(): string {
        return this._rememberTokenName;
    }

    setRememberToken(value): void {
        if (this.getRememberTokenName()) {
            this.$attributes[this.getRememberTokenName()] = value;
        }
    }
}
