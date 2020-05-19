import {BaseModel} from "@tngraphql/lucid/build/src/Orm/BaseModel";
import {Authenticatable} from "./Contract/Authenticatable";
import {Application} from "@tngraphql/illuminate";
import {PersonalAccessTokenFactory} from "./PersonalAccessTokenFactory";

/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/28/2020
 * Time: 6:17 AM
 */

export class Auth extends BaseModel implements Authenticatable {
    /**
     * The column name of the "remember me" token.
     *
     * @var string
     */
    protected _rememberTokenName = 'remember_token';

    // protected _accessToken;

    createToken(name: string, scopes: any = [], app?: any) {
        return new PersonalAccessTokenFactory(app || Application.getInstance()).make(this.getAuthIdentifier(), name, scopes);
    }

    // public withAccessToken(accessToken) {
    //     this._accessToken = accessToken;
    //     return this;
    // }

    static getAuthIdentifierName() {
        return (this as any).primaryKey;
    }

    getAuthIdentifier(): any {
        return this[this.getAuthIdentifierName()];
    }

    getAuthIdentifierName(): string {
        return (this.constructor as any).primaryKey;
    }

    getAuthPassword(): string {
        return (this as any).password;
    }

    getRememberToken(): string {
        return this[this.getRememberTokenName()];
    }

    getRememberTokenName(): string {
        return this._rememberTokenName;
    }
    //
    setRememberToken(value): void {
        if (this.getRememberTokenName()) {
            this[this.getRememberTokenName()] = value;
        }
    }
}
