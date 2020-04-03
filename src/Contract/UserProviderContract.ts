/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/26/2020
 * Time: 11:28 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { Authenticatable } from './Authenticatable';
import {Hasher} from "@tngraphql/illuminate/dist/Contracts/Hashing/Hasher";

export interface UserProviderContract {
    hasher: Hasher;

    /**
     * Retrieve a user by their unique identifier.
     *
     * @param  mixed  $identifier
     * @return \Illuminate\Contracts\Auth\Authenticatable|null
     */
    retrieveById(identifier: any): Promise<Authenticatable | null>;

    /**
     * Retrieve a user by their unique identifier and "remember me" token.
     *
     * @param  mixed  $identifier
     * @param  string  $token
     * @return \Illuminate\Contracts\Auth\Authenticatable|null
     */
    retrieveByToken(identifier: any, token: string): Promise<Authenticatable | null>;

    /**
     * Update the "remember me" token for the given user in storage.
     *
     * @param  \Illuminate\Contracts\Auth\Authenticatable  $user
     * @param  string  $token
     * @return void
     */
    updateRememberToken(user: Authenticatable, token: string): Promise<void>;

    /**
     * Retrieve a user by the given credentials.
     *
     * @param  array  $credentials
     * @return \Illuminate\Contracts\Auth\Authenticatable|null
     */
    retrieveByCredentials(credentials: any): Promise<Authenticatable | null>;

    /**
     * Validate a user against the given credentials.
     *
     * @param  {Authenticatable}  user
     * @param  {object}  credentials
     * @return bool
     */
    validateCredentials(user: Authenticatable, credentials: any): boolean;
}
