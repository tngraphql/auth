/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/29/2020
 * Time: 2:46 PM
 */
import {Exception} from '@poppinss/utils/build'

export class InvalidJwtTokenException extends Exception{
    constructor(message = 'The Jwt token is invalid.') {
        super(message, 401, 'E_INVALID_JWT_TOKEN');
    }
}
