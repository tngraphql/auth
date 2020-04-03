/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/26/2020
 * Time: 12:22 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { UserProviderContract } from '../Contract/UserProviderContract';
import { Authenticatable } from '../Contract/Authenticatable';
import { Hasher } from '@tngraphql/illuminate/dist/Contracts/Hashing/Hasher';
import {randomBytes} from "crypto";
import {hash_equals} from "../utils";

export class LucidUserProvider implements UserProviderContract {
    constructor(public hasher: Hasher, public model: any) {
    }

    /**
     * Retrieve a user by their unique identifier.
     *
     * @param identifier
     */
    public async retrieveById(identifier: any): Promise<Authenticatable | null> {
        const model = this.createModel();

        return this.newModelQuery(model)
                   .where(model.primaryKey, identifier)
                   .first();
    }

    public async retrieveByToken(identifier: any, token: string) {
        const model = this.createModel();

        const user = await this.newModelQuery(model)
                                   .where(model.primaryKey, identifier)
                                   .first();

        if ( ! user ) {
            return null;
        }

        const rememberToken = user.getRememberToken();

        return rememberToken && hash_equals(rememberToken, token) ? user : null;
    }

    public async updateRememberToken(user: Authenticatable, token: string) {
        user.setRememberToken(token);

        const timestamps = user.timestamps;

        user.timestamps = false;

        await user.save();

        user.timestamps = timestamps;
    }

    public async retrieveByCredentials(credentials: any) {
        if ( ! credentials || !Object.values(credentials).length) {
            return;
        }

        const query = this.newModelQuery();
        let num = 0;

        for( let [key, value] of Object.entries(credentials) ) {
            if (key.endsWith('password')) {
                continue;
            }

            num++;
            query.where(key, value);
        }

        if (num === 0) {
            return null;
        }

        return query.first();
    }

    public validateCredentials(user: Authenticatable, credentials: any): boolean {
        const plain = credentials.password;

        return this.hasher.check(plain, user.getAuthPassword());
    }

    protected createModel(): any {
        return this.model;
    }

    protected newModelQuery(model = null) {
        if ( ! model ) {
            return this.createModel().query();
        }

        return model.query();
    }
}
