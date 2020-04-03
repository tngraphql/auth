import {ApplicationContract} from '@tngraphql/illuminate/dist/Contracts/ApplicationContract';
import {UserProviderContract} from './Contract/UserProviderContract';
import {InvalidArgumentException} from './Exception/InvalidArgumentException';
import {LucidUserProvider} from './Providers/LucidUserProvider';
import {DatabaseUserProvider} from "./Providers/DatabaseUserProvider";

/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/26/2020
 * Time: 12:10 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
export class CreatesUserProviders {
    public app: ApplicationContract;

    protected _customProviderCreators: any = {};

    public createUserProvider(provider: string = null): UserProviderContract {
        const config = this.getProviderConfiguration(provider);
        if (!config) {
            return null;
        }
        const driver = (config['driver'] ?? null);

        if (this._customProviderCreators[driver]) {
            return this._customProviderCreators[driver](this.app, config);
        }

        switch (driver) {
            case 'lucid':
                return this.createLucidProvider(config) as any;
            case 'database':
                return this.createDatabaseProvider(config) as any;

            default:
                throw new InvalidArgumentException(`Authentication user provider [${driver}] is not defined.`);
        }
    }

    protected getProviderConfiguration(provider: string) {
        provider = provider || this.getDefaultUserProvider();

        if (provider) {
            return this.app.config.get(`auth.providers.${provider}`);
        }
        return;
    }

    public getDefaultUserProvider(): string {
        return this.app.config.get('auth.defaults.provider');
    }

    public setDefaultUserProvider(provider: string) {
        this.app.config.set(`auth.defaults.provider`, provider);
    }

    protected createLucidProvider(config) {
        return new LucidUserProvider(this.app.use('hash'), config.model);
    }

    protected createDatabaseProvider(config) {
        return new DatabaseUserProvider(this.app.use('db'), this.app.use('hash'), config.table);
    }
}
