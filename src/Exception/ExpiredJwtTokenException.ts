/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/29/2020
 * Time: 2:46 PM
 */
import {Exception} from '@poppinss/utils/build'

export class ExpiredJwtTokenException extends Exception{
    constructor(message = 'The jwt token has been expired. Generate a new one to continue.') {
        super(message, 401, 'E_JWT_TOKEN_EXPIRED');
    }
}
