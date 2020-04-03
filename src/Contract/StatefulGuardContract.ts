/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/27/2020
 * Time: 3:42 PM
 */
import {GuardContract} from "./GuardContract";
import {Authenticatable} from "./Authenticatable";

export interface StatefulGuardContract extends GuardContract {
    /**
     * Attempt to authenticate a user using the given credentials.
     *
     * @param  {object}     credentials default by {}
     * @param  {boolean}    remember default by false
     * @return boolean
     *
     */
    attempt(credentials?: any): Promise<boolean>;

    /**
     * Log a user into the application.
     *
     * @param  {Authenticatable}  user
     * @param  {boolean}  remember default by false
     * @return void
     */
    login(user: Authenticatable): void;

    /**
     * Log the given user ID into the application.
     *
     * @param  {any}  id
     * @param  {boolean}   remember default by false
     * @return Authenticatable
     */
    loginUsingId(id: any): Promise<Authenticatable | boolean>;

    /**
     * Log the user out of the application.
     *
     * @return void
     */
    logout(): void;
}
