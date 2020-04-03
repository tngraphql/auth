/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/27/2020
 * Time: 1:15 PM
 */
const assert = require('assert');
const crypto = require('crypto');

export function hash_equals(known_string: string, user_string: string) {
    assert(typeof known_string === 'string' && typeof user_string === 'string', 'both arguments should be strings');

    const rb = crypto.pseudoRandomBytes(32);
    const ahmac = crypto.createHmac('sha256', rb).update(known_string).digest('hex');
    const ghmac = crypto.createHmac('sha256', rb).update(user_string).digest('hex');

    const len = ahmac.length;

    let result = 0;
    for (let i = 0; i < len; ++i) {
        result |= (ahmac.charCodeAt(i) ^ ghmac.charCodeAt(i));
    }

    return result === 0;
}

export function time() {
    return Math.floor((new Date().getTime()) / 1000);
}

export function generateToken(length: number): string {
    return crypto.randomBytes(Math.ceil(length * 0.5)).toString('hex').slice(0, length)
}
