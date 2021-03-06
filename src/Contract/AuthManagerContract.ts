/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/26/2020
 * Time: 10:05 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { GuardContract } from './GuardContract';
import {Authenticatable} from "./Authenticatable";

export interface AuthManagerContract {

    guard(name?: string): GuardContract;

    extend(driver: string, callback: Function): this;

    provider(name: string, callback: Function): this;
}
