/**
 * @file 对象扩展
 * @author treelite(c.xinle@gmail.com)
 */

'use strict';

/**
 * 复制
 *
 * @private
 * @param {Object} target 目标对象
 * @param {Object} source 源对象
 */
function copy(target, source) {
    Object.keys(source).forEach((key) => {
        target[key] = source[key];
    });
}

/**
 * 对象属性拷贝
 *
 * @param {Object} target 目标对象
 * @param {...Object} sources 源对象
 * @return {Object}
 */
export default function (target, ...sources) {
    for (let item of sources) {
        if (!item) {
            continue;
        }
        copy(target, item);
    }

    return target;
}
