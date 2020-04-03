/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/26/2020
 * Time: 11:57 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export interface Authenticatable {
    [key: string]: any;

    /**
     * Get the name of the unique identifier for the user.
     *
     * @return string
     */
    getAuthIdentifierName(): string;

    /**
     * Get the unique identifier for the user.
     *
     * @return mixed
     */
    getAuthIdentifier(): any;

    /**
     * Get the password for the user.
     *
     * @return string
     */
    getAuthPassword(): string;

    /**
     * Get the token value for the "remember me" session.
     *
     * @return string
     */
    // getRememberToken(): string;

    /**
     * Set the token value for the "remember me" session.
     *
     * @param  string  $value
     * @return void
     */
    // setRememberToken($value): void;
    //
    // /**
    //  * Get the column name for the "remember me" token.
    //  *
    //  * @return string
    //  */
    // getRememberTokenName(): string;
}
