/**
 * @file 语音对象
 * @author treelite(c.xinle@gmail.com)
 */

'use strict';

import recognize from './util/recognize';
import {convertSampleRate, write16PCM, writeASCII} from './util/transfer';

/**
 * 合并 Float32Array
 *
 * @param {Array.<Float32Array>} list 待合并元素
 * @return {Float32Array}
 */
function mergeBuffers(list) {
    let item;
    let len = 0;
    for (item of list) {
        len += item.length;
    }
    let res = new Float32Array(len);
    let offset = 0;
    for (item of list)  {
        res.set(item, offset);
        offset += item.length;
    }

    return res;
}

/**
 * 语音对象
 *
 * @class
 */
class Voice {

    constructor(options = {}) {
        this.sampleRate = options.sampleRate;
        this.outputSampleRate = options.outputSampleRate;
        this.token = options.token;
        this.lang = options.lang;

        this.isOver = false;
        this.data = new Set();
        this.recognizing;
    }

    /**
     * 添加语音数据
     *
     * @public
     * @param {Object} buffer 语音数据
     */
    push(buffer) {
        this.data.add(buffer);
    }

    /**
     * 语音识别
     *
     * @public
     * @return {Prmise}
     */
    result() {
        if (!this.data.size) {
            return Promise.reject('no data');
        }

        if (!this.recognizing) {
            this.recognizing = recognize(
                mergeBuffers(this.data),
                {
                    sampleRate: this.sampleRate,
                    outputSampleRate: this.outputSampleRate,
                    token: this.token,
                    lang: this.lang
                }
            );
        }

        return this.recognizing;
    }

    /**
     * 结束语音采集
     *
     * @public
     * @return {Object}
     */
    end() {
        this.isOver = true;
        return this;
    }

    /**
     * 导出 WAV 格式
     *
     * @public
     * @param {number=} sampleRate 输出的采样率，默认为 8000
     * @return {ArrayBuffer}
     */
    wav(sampleRate = 8000) {
        let data = convertSampleRate(
            mergeBuffers(this.data),
            this.sampleRate,
            sampleRate
        );
        let buffer = new ArrayBuffer(44 + data.length * 2);
        let view = new DataView(buffer);

        /* RIFF identifier */
        writeASCII(view, 0, 'RIFF');
        /* file length */
        view.setUint32(4, 32 + data.length * 2, true);
        /* RIFF type */
        writeASCII(view, 8, 'WAVE');
        /* format chunk identifier */
        writeASCII(view, 12, 'fmt ');
        /* format chunk length */
        view.setUint32(16, 16, true);
        /* sample format (raw) */
        view.setUint16(20, 1, true);
        /* channel count */
        view.setUint16(22, 1, true);
        /* sample rate */
        view.setUint32(24, sampleRate, true);
        /* byte rate (sample rate * block align) */
        view.setUint32(28, sampleRate, true);
        /* block align (channel count * bytes per sample) */
        view.setUint16(32, 2, true);
        /* bits per sample */
        view.setUint16(34, 16, true);
        /* data chunk identifier */
        writeASCII(view, 36, 'data');
        /* data chunk length */
        view.setUint32(40, data.length * 2, true);
        /* data */
        write16PCM(view, 44, data);

        return buffer;
    }
}

export default Voice;
