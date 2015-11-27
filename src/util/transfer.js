/**
 * @file 数据转换帮助工具
 * @author treelite(c.xinle@gmail.com)
 */

'use strict';

/**
 * 写入 16 位 PCM
 *
 * @param {DataView} data 目标数据
 * @param {number} offset 偏移量
 * @param {Float32Array} buffer 语音数据源
 * @return {number}
 */
export function write16PCM(data, offset, buffer) {
    for (let i = 0, len = buffer.length, s; i < len; i++, offset += 2) {
        s = Math.max(-1, Math.min(1, buffer[i]));
        data.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    return offset;
}

/**
 * 写入 ASCII 字符
 *
 * @param {DataView} data 目标数据
 * @param {number} offset 偏移量
 * @param {string} str ASCII 字符串
 * @return {number}
 */
export function writeASCII(data, offset, str) {
    for (let i = 0, len = str.length; i < len; i++, offset++) {
        data.setUint8(offset, str.charCodeAt(i));
    }
    return offset;
}

/**
 * 写入 Uint8Array
 *
 * @param {DataView} data 目标数据
 * @param {number} offset 偏移量
 * @param {Uint8Array} buffer 数据源
 * @return {number}
 */
export function writeUint8Array(data, offset, buffer) {
    for (let v of buffer) {
        data.setUint8(offset++, v);
    }
    return offset;
}

/**
 * 采样率转化
 *
 * @param {Float32Array} data 语音数据
 * @param {number} inputRate 输入采样率
 * @param {number} outputRate 输出采样率
 * @return {Float32Array}
 */
export function convertSampleRate(data, inputRate, outputRate) {
    let rate = inputRate / outputRate;
    let len = Math.ceil(data.length / rate);
    let res = new Float32Array(len);
    for (let i = 0; i < len; i++) {
        res[i] = data[Math.floor(i * rate)];
    }

    return res;
}
