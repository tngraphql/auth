import {time} from "./utils";
import {Filesystem} from "@poppinss/dev-utils/build";
import {Application} from "@tngraphql/illuminate";
import * as path from "path";
import {InvalidArgumentException} from "./Exception/InvalidArgumentException";

/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/27/2020
 * Time: 7:49 PM
 */

export class PersonalAccessTokenFactory {
    public jwt = require('jsonwebtoken');

    public filesystem: Filesystem;

    constructor(public app: Application) {
        this.filesystem = new Filesystem(process.cwd());
    }

    public async make(identifier: any, name: string, scopes = {}) {
        if (!identifier) {
            throw new InvalidArgumentException('Identifier key value is missing for user');
        }

        const jwtid = String(identifier);

        const exp = this.app.config.get('auth.expired', 60) * 60;

        const data = {
            scopes,
            exp: time() + exp
        }

        for (let key of Object.keys(data)) {
            if (key.endsWith('password')) {
                delete data[key];
            }
        }

        const privateKey = await this.getPrivateKey();

        if (!privateKey) {
            return this.jwt.sign(data, 'shhh');
        }

        return this.jwt.sign(data, privateKey, {
            jwtid,
            algorithm: 'RS256',
            notBefore: '0',
            audience: '3',
            header: {
                jti: jwtid
            }
        });
    }

    private async getPrivateKey(): Promise<string | null> {
        let key = this.app.config.get('auth.private_key', null);

        if (!key) {
            if (!await this.filesystem.exists('auth-private.key')) {
                throw new Error(`${path.join(this.filesystem.basePath, 'auth-private.key')} does not exist or is not readable. fix: ts-node ace auth:keys`);
            }

            key = await this.filesystem.get('auth-private.key');
        }

        return key;
    }
}
