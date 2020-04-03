/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/29/2020
 * Time: 2:39 PM
 */
import {ResolverData} from "@tngraphql/graphql";
import {AuthenticationException} from "../Exception/AuthenticationException";

export class Authenticate {
    /**
     * Handle an incoming request.
     *
     * @param data
     * @param next
     * @param args
     */
    public async handle(data: ResolverData<any>, next: () => Promise<void>, args: string[]) {
        const {auth} = data.context;
        if (!await auth.check()) {
            throw new AuthenticationException();
        }
        await next()
    }
}
