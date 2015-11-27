/**
 * @file Main
 * @author treelite(c.xinle@gmail.com)
 */

'use strict';

import Voice from './src/Voice';
import identify from './src/util/recognize';

let authorization;
let voiceList = new Set();
let getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
let AudioContext = window.AudioContext || window.webkitAudioContext;
let ctx = new AudioContext();
let config = {};

const BUFFER_SIZE = 1024;

/**
 * 音频采集
 *
 * @private
 * @param {Object} e 语音采集信息
 */
function gather(e) {
    let volume = ctx.createGain();
    let source = ctx.createMediaStreamSource(e);
    let processor = ctx.createScriptProcessor(BUFFER_SIZE, 1, 1);

    processor.onaudioprocess = (e) => {
        let item;
        for (item of voiceList) {
            if (item.isOver) {
                voiceList.delete(item);
            }
        }
        if (!voiceList.size) {
            return;
        }

        let buffer;
        let input = e.inputBuffer;

        for (let item of voiceList) {
            buffer = new Float32Array(input.length);
            input.copyFromChannel(buffer, 0, 0);
            item.push(buffer);
        }
    };

    source.connect(volume);
    volume.connect(processor);
    processor.connect(ctx.destination);
}

/**
 * 创建语音对象
 *
 * @private
 * @param {Object} options 配置参数
 * @return {Object}
 */
function createVoice(options = {}) {
    // 当前音频的采样率
    options.sampleRate = ctx.sampleRate;
    options.token = config.token;
    options.url = config.url;
    let voice = new Voice(options);
    voiceList.add(voice);
    return voice;
}

/**
 * 语音采集授权
 *
 * @public
 * @param {Object} options 配置参数
 * @param {string} options.token 语音识别 token
 * @param {string=} options.url 语音识别 URL
 * @return {Promise}
 */
export function authorize(options) {
    config.token = options.token;
    config.url = options.url;
    if (!authorization) {
        authorization = new Promise((resolve, reject) => {
            getUserMedia.call(
                navigator,
                {audio: true},
                (e) => {
                    gather(e);
                    resolve();
                },
                reject
            );
        });
    }
    return authorization;
}

/**
 * 开始采集录音
 *
 * @public
 * @param {Object=} options 录音参数
 * @param {string=} options.lang 语言种类，支持 zh(中文)、ct(粤语)、en(英文)，默认为 zh
 * @param {number=} options.outputSampleRate 语音识别的采样率，可选 8000、16000，默认为 8000
 * @return {Object}
 */
export function start(options) {
    return createVoice(options);
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
export function recognize(data, options) {
    return identify(data, options);
}
