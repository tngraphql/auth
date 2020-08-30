/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/27/2020
 * Time: 6:57 PM
 */
import {Authenticatable} from "../Contract/Authenticatable";
import {Filesystem} from "@poppinss/dev-utils/build";
import {Application} from "@tngraphql/illuminate";
import * as path from "path";
import {ExpiredJwtTokenException} from "../Exception/ExpiredJwtTokenException";
import {InvalidJwtTokenException} from "../Exception/InvalidJwtTokenException";

export class JwtVerify {
    public filesystem: Filesystem;

    public jwt = require('jsonwebtoken');

    constructor(public provider, app) {
        this.filesystem = new Filesystem(process.cwd());
    }

    public user(request): Promise<Authenticatable> {
        if (request.bearerToken()) {
            return this.authenticateViaBearerToken(request);
        }
        return;
    }

    protected async authenticateViaBearerToken(request) {
        if (!await this.filesystem.exists('auth-public.key')) {
            throw new Error(`${path.join(this.filesystem.basePath, 'auth-public.key')} does not exist or is not readable. fix: ts-node ace auth:keys`);
        }

        let data = await this.getPsrRequestViaBearerToken(request);

        if (data) {
            const user = await this.provider.retrieveById(data.jti);

            if (user) {
                return user;
            }
        }

        return;
    }

    protected async getPsrRequestViaBearerToken(request) {
        if (!await this.filesystem.exists('auth-public.key')) {
            throw new Error(`${path.join(this.filesystem.basePath, 'auth-public.key')} does not exist or is not readable. fix: ts-node ace auth:keys`);
        }

        const cert = await this.filesystem.get('auth-public.key');

        try {
            return this.jwt.verify(request.bearerToken(), cert, {algorithm: 'RS256'});
        } catch ({name, message}) {
            const handle = Application.getInstance().make('ExceptionHandler');
            if (name === 'TokenExpiredError') {
                handle.report(new ExpiredJwtTokenException());
            } else {
                handle.report(new InvalidJwtTokenException(message));
            }
        }
    }
}
