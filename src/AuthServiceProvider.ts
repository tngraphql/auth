/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/29/2020
 * Time: 9:46 AM
 */
import {ServiceProvider} from "@tngraphql/illuminate";
import {Context} from "@tngraphql/graphql/dist/resolvers/context";
import {AuthManager} from "./AuthManager";
import {KeysCommand} from "./command/KeysCommand";

export class AuthServiceProvider extends ServiceProvider {
    public register(): void {
        this.registerCommand();
    }

    public boot(): void {
        const self = this;
        Context.getter('auth', function () {
            if (this.$guard) {
                return this.$guard;
            }
            this.req.bearerToken = () => {
                try {
                    return this.req.headers.authorization.replace(/^(Bearer\s)/g, '');
                } catch (e) {
                    return null;
                }
            };

            const manage = this.$guard = new AuthManager(self.app, this);
            return this.$guard;
        });
    }

    public registerCommand() {
        this.commands([KeysCommand]);
    }
}
