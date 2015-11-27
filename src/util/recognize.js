/**
 * @file 语音识别
 * @author treelite(c.xinle@gmail.com)
 */

import uid from './uid';
import {convertSampleRate, write16PCM} from './transfer';

/**
 * 8K 采样率
 *
 * @const
 * @type {number}
 */
const SAMPLE_RATE_8K = 8000;
const SAMPLE_RATE_16K = 16000;
const SAMPLE_RATE = SAMPLE_RATE_8K;
const DEFAULT_LANG = 'zh';
//const URL_API = 'http://vop.baidu.com/server_api';
const URL_API = '/server_api';
const UID = uid();

function send(params, resolve, reject) {
    let xhr = new XMLHttpRequest();
    let data = JSON.stringify(params);
    xhr.open('POST', URL_API);
    xhr.responseType = 'json';
    xhr.onload = () => {
        if (xhr.status === 200) {
            let res = xhr.response;
            if (!res.err_no) {
                resolve(res.result);
            }
            else {
                reject({type: res.err_no, message: res.err_msg});
            }
        }
        else {
            reject({type: xhr.status});
        }
    };
    xhr.ontimeout = () => {
        reject({type: 'timeout'});
    };
    xhr.onerror = () => {
        reject({type: 'unknow'});
    };
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(data);
}


export default function (data, options = {}) {
    // 采样率转化
    let outputSampleRate = options.outputSampleRate || SAMPLE_RATE;
    data = convertSampleRate(data, options.sampleRate, outputSampleRate);

    // 32bit to 16bit
    let buffer = new ArrayBuffer(data.length * 2);
    let dataView = new DataView(buffer);
    write16PCM(dataView, 0, data);

    // base64
    let str = '';
    let bytes = new Uint8Array(dataView.buffer);
    for (let bit of bytes) {
        str += String.fromCharCode(bit);
    }
    data = btoa(str);

    let params = {
        format: 'pcm',
        rate: outputSampleRate,
        channel: 1,
        cuid: UID,
        token: options.token,
        lan: options.lang || DEFAULT_LANG,
        len: bytes.length,
        speech: data
    };

    return new Promise((resolve, reject) => send(params, resolve, reject));
}
