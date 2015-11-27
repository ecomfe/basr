/**
 * @file Main
 * @author treelite(c.xinle@gmail.com)
 */

'use strict';

import Voice from './src/Voice';

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
    options.sampleRate = ctx.sampleRate;
    options.token = config.token;
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
 * @return {Promise}
 */
export function authorize(options) {
    config.token = options.token;
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
 * @param {Object} options 录音参数
 * @return {Object}
 */
export function start(options) {
    return createVoice(options);
}
