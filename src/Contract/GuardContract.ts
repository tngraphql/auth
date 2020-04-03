/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/26/2020
 * Time: 9:58 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {UserProviderContract} from './UserProviderContract';
import {Authenticatable} from "./Authenticatable";

/**
 * Provider user works as a bridge between the provider real user
 * and the guard
 */
export interface ProviderUserContract<User extends any> {
    user: User | null,

    getId(): string | number | null,

    verifyPassword: (plainPassword: string) => Promise<boolean>,

    getRememberMeToken(): string | null,

    setRememberMeToken(token: string): void,
}

export interface GuardContract {
    /**
     * Determine if the current user is authenticated.
     *
     * @return bool
     */
    check(): Promise<boolean>;

    /**
     * Determine if the current user is a guest.
     *
     * @return bool
     */
    guest(): Promise<boolean>;

    /**
     * Get the currently authenticated user.
     *
     * @return \Illuminate\Contracts\Auth\Authenticatable|null
     */
    user(): Promise<Authenticatable | null>;

    /**
     * Get the ID for the currently authenticated user.
     *
     * @return int|string|null
     */
    id(): Promise<number|string|null>;

    /**
     * Validate a user's credentials.
     *
     * @param  array  $credentials
     * @return bool
     */
    validate(credentials: any): Promise<boolean>;

    /**
     * Set the current user.
     *
     * @param  \Illuminate\Contracts\Auth\Authenticatable  $user
     * @return void
     */
    setUser(user);
}
