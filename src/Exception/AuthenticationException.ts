/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/29/2020
 * Time: 2:39 PM
 */

import {Exception} from '@poppinss/utils/build'

export class AuthenticationException extends Exception {
    constructor(message = 'Unauthenticated.') {
        super(message, 401, 'E_AUTHENTICATION');
    }
}
