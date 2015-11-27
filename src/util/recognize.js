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

/**
 * 16K 采样率
 *
 * @const
 * @type {number}
 */
const SAMPLE_RATE_16K = 16000;

/**
 * 默认的语音识别采样率
 *
 * @const
 * @type {number}
 */
const SAMPLE_RATE = SAMPLE_RATE_8K;

/**
 * 默认的语言类型
 *
 * @const
 * @type {string}
 */
const DEFAULT_LANG = 'zh';

/**
 * 语音识别 API 地址
 *
 * @const
 * @type {string}
 */
const URL_API = 'http://vop.baidu.com/server_api';

/**
 * 设别 ID
 *
 * @const
 * @type {string}
 */
const UID = uid();

/**
 * 发送请求
 *
 * @param {string} url 请求地址
 * @param {Object} params 请求参数
 * @param {Function} resolve Promise resolve
 * @param {Function} reject Promise reject
 */
function send(url = URL_API, params, resolve, reject) {
    let xhr = new XMLHttpRequest();
    let data = JSON.stringify(params);
    xhr.open('POST', url);
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


/**
 * 语音识别
 *
 * @public
 * @param {Float32Array} data 语音数据
 * @param {Object} options 配置信息
 * @param {string} options.token 语音识别 token
 * @param {number} options.sampleRate 输入语音的采样率
 * @param {number=} options.outputSampleRate 语音识别采样率 默认为 8000
 * @param {string=} options.lang 语言类别，支持 zh(中文)、ct(粤语)、en(英文)，默认为 zh
 * @return {Promise}
 */
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

    return new Promise((resolve, reject) => send(options.url, params, resolve, reject));
}
