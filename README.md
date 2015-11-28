# basr

Baidu Automatic Speech Recognition for JS

百度语音识别 JS SDK

使用 [百度语音](http://yuyin.baidu.com/) 的 [语音识别API](http://yuyin.baidu.com/docs/asr/54)，为页面提供语音识别能力。

## Usage

```js
import basr from 'basr';

basr
    .authorize({token: 'xxxx'}) // 语音识别 Access Token
    .then(
        () => {
            // 开始语音采集
            let voice = basr.start();
            // 录音 5 秒
            setTimeout(
                () => {
                    voice
                        .end() // 结束语音采集
                        .result() // 进行语音识别
                        .then(
                            text => {
                                // text 就是识别结果
                            },
                            error => {
                                // Oops ... 识别出错了...
                            }
                        );
                },
                5000
            );
        },
        () => alert('如要使用语音识别，请授权麦克风操作')
    );

```

## API

### Methods

#### authorize(options)

语音采集授权，提示用户授权麦克风的使用权限，进行语音采集之前必须调用此方法

* **options** `{Object}` 配置参数
    * **token** `{string}` 语音识别的 token, 具体请参见 [百度语音关于 Access Token 的说明](http://yuyin.baidu.com/docs/asr/56)
    * **url** `{string=}` 语音识别 API 地址，目前由于线上服务暂时不支持跨域通信，请设置此参数为本地的 API 代理地址
* _return_ `{Promise}` 授权结果

#### start(options)

语音采集

* **options** `{Object=}` 录音参数
    * **lang** `{string=}` 语言种类，支持 `zh`(中文)、`ct`(粤语)、`en`(英文)，默认为 `zh`
    * **sampleRate** `{string=}` 语音识别的采样率，可选 `8000`、`16000`，默认为 `8000`，采样率与数据传输量成正比
* _return_ `{Object}` [语音对象](#voice)

#### recognize(voice, options)

语音识别

* **voice** `{Float32Array}` 语音数据
* **options** `{Object}` 配置信息
    * **token** `{string}` 语音识别 token
    * **sampleRate** `{number}` 输入语音的采样率
    * **lang** `{string=}` 语言种类，支持 `zh`(中文)、`ct`(粤语)、`en`(英文)，默认为 `zh`
    * **outputSampleRate** `{number=}` 语音识别的采样率，可选 `8000`、`16000`，默认为 `8000`

### Voice

语音对象

#### end()

停止语音采集

#### result()

获取语音识别结果

* _return_ `{Promise}`

#### wav(sampleRate)

将语音导出成 wav 格式

* **sampleRate** `{number}` WAV 的采样率，可选 `8000`、`16000`，默认为 `8000`
* _return_ `{ArrayBuffer}`

```js
...
let wav = voice.wav();
let audio = document.createElement('audio');
audio.setAttribute('autoplay', 'autoplay');
audio.src = URL.createObjectURL(new Blob(wav, {type: 'audio/wav'}));
document.body.appendChild(audio);
```
