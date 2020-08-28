/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/26/2020
 * Time: 10:07 AM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import {AuthManagerContract} from "./AuthManagerContract";
import {StatefulGuardContract} from "./StatefulGuardContract";

interface AuthContract extends AuthManagerContract, StatefulGuardContract {
}