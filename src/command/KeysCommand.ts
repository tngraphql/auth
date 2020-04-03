/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/28/2020
 * Time: 1:57 PM
 */
import {BaseCommand, flags} from "@tngraphql/console";
import {Filesystem} from "@poppinss/dev-utils/build";
import * as path from "path";

export class KeysCommand extends BaseCommand {
    static commandName = 'auth:keys';

    static description = 'Create the encryption keys for API authentication';

    @flags.boolean({description: 'Overwrite keys they already exist'})
    public force: boolean;

    @flags.boolean({description: 'The length of the private key', default: 4096})
    public length: number;

    async handle(): Promise<any> {
        const filesystem = new Filesystem((this.application as any).basePath());

        let [publicKey, privateKey] = [
            path.join(filesystem.basePath, './auth-public.key'),
            path.join(filesystem.basePath, './auth-private.key'),
        ];

        if ((await filesystem.exists(publicKey) || await filesystem.exists(privateKey)) && !this.force) {
            this.log('Encryption keys already exist. Use the --force option to overwrite them.', 'error');
        } else {
            let keypair = await this.createKey(this.length ? this.length : 4096);

            await filesystem.add(publicKey, keypair.publicKey);
            await filesystem.add(privateKey, keypair.privateKey);

            this.log('Encryption keys generated successfully.');
        }
    }

    log(message: string, type: string = 'info') {
        if ( this.application.environment === 'test' ) {
            this.logger.logs.push(message);
        } else {
            this.logger[type](message);
        }
    }

    /**
     * Create public / private key pair
     */
    async createKey(bits: number = 4096): Promise<{ publicKey: string, privateKey: string }> {
        return new Promise(resolve => {
            const RSA = require('hybrid-crypto-js').RSA;
            const rsa = new RSA();

            // Generate 4096 bit RSA key pair
            rsa.generateKeyPair(function (key) {
                resolve(key);
            }, bits);
        });
    }

}
