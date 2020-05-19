import {UserProviderContract} from "../Contract/UserProviderContract";
import {Hasher} from "@tngraphql/illuminate/dist/Contracts/Hashing/Hasher";
import {Authenticatable} from "../Contract/Authenticatable";
import {GenericUser} from "../GenericUser";
import {hash_equals} from "../utils";
import {QueryClientContract} from "@tngraphql/lucid/build/src/Contracts/Database/QueryClientContract";
import {DatabaseContract} from "@tngraphql/lucid/build/src/Contracts/Database/DatabaseContract";

/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/28/2020
 * Time: 2:36 PM
 */

export class DatabaseUserProvider implements UserProviderContract {
    /**
     * Custom connection or query client
     */
    private connection?: string | QueryClientContract

    constructor(private db: DatabaseContract, public hasher: Hasher, protected table: string) {
    }

    protected config: any = {}

    /**
     * Returns the query client for invoking queries
     */
    private getQueryClient() {
        if (!this.connection) {
            return this.db.connection(this.config.connection)
        }
        return typeof (this.connection) === 'string' ? this.db.connection(this.connection) : this.connection
    }

    public async retrieveByCredentials(credentials: any): Promise<Authenticatable | null> {
        if (!credentials || !Object.values(credentials).length) {
            return;
        }

        const query = this.getQueryClient().from(this.table);
        let num = 0;

        for (let [key, value] of Object.entries(credentials)) {
            if (key.endsWith('password')) {
                continue;
            }

            num++;
            query.where(key, value as any);
        }
        if (!num) {
            return null;
        }

        return this.getGenericUser(await query.first());
    }

    public async retrieveById(identifier: any): Promise<Authenticatable | null> {
        const user = await this.getQueryClient().from(this.table).where('id', identifier).first();

        return this.getGenericUser(user);
    }

    public async retrieveByToken(identifier: any, token: string): Promise<Authenticatable | null> {
        const user = this.getGenericUser(
            await this.getQueryClient().from(this.table).where('id', identifier).first()
        );

        return user && user.getRememberToken() && hash_equals(user.getRememberToken(), token) ? user : null;
    }

    public async updateRememberToken(user: Authenticatable, token: string): Promise<void> {
        await this.getQueryClient().from(this.table).update({
            [user.getRememberTokenName()]: token
        });
    }

    public validateCredentials(user: Authenticatable, credentials: any): boolean {
        const plain = credentials.password;

        return this.hasher.check(plain, user.getAuthPassword());
    }

    protected getGenericUser(user: any): GenericUser {
        if (!user) {
            return null;
        }
        return new GenericUser(user) as any;
    }
}
