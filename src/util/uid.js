/**
 * @file uid
 * @author treelite(c.xinle@gmail.com)
 */

'use strict';

/**
 * 生成 uid
 *
 * @public
 * @return {string}
 */
export default function () {
    return Math.random().toString(35).substring(2, 17);
}
