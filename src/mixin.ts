/**
 * (c) Phan Trung Nguyên <nguyenpl117@gmail.com>
 * User: nguyenpl117
 * Date: 3/26/2020
 * Time: 12:17 PM
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class Methods<A> {
}

export type PreventCollisions<A, B, C = never> = Extract<keyof A, keyof B | keyof C> extends never
    ? Extract<keyof A | keyof C, keyof B> extends never
        ? Ctor<A & B & C>
        : 'Error: Multiple mixins implement the following methods:' & Methods<Extract<keyof A | keyof C, keyof B>>
    : 'Error: Multiple mixins implement the following methods:' & Methods<Extract<keyof A, keyof B | keyof C>>

export function mixin<A>(a: Ctor<A>): Ctor<A>
export function mixin<A, B, R = PreventCollisions<A, B, {}>>(a: Ctor<A>, b: Ctor<B>): R
export function mixin<A, B, C, R = PreventCollisions<A, B, C>>(a: Ctor<A>, b: Ctor<B>, c: Ctor<C>): R

export function mixin(...as: Ctor<any>[]) {
    const x = (as as any[]).shift();

    return as.reduce((previousValue, currentValue) => {
        const prototype = new currentValue;
        Object.getOwnPropertyNames(prototype).forEach(name => {
            previousValue.prototype[name] = prototype[name];
        })

        Object.getOwnPropertyNames(currentValue.prototype).forEach(name => {
            if (! ['constructor'].includes(name) ) {
                Object.defineProperty(previousValue.prototype, name, Object.getOwnPropertyDescriptor(currentValue.prototype, name));
            }
        })
        Object.getOwnPropertyNames(currentValue).forEach(name => {
            if ( ['constructor', 'length', 'prototype', 'name'].includes(name) ) {
                return;
            }
            previousValue[name] = currentValue[name];
        });
        return previousValue;
    }, x);
}

export interface Ctor<A> {
    new (...args: any[]): A
}

// export type Ctor<A = any> = A
