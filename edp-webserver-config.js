/**
 * @file WebServer 配置
 * @author edpx-mobile
 */

/* globals autostylus, proxy, file */

// 端口
exports.port = 8848;

// 网站根目录
exports.documentRoot = process.cwd();

// 当路径为目录时，是否显示文件夹内文件列表
exports.directoryIndexes = true;

/* handlers
 * 支持expressjs的path的写法，可以通过request.parameters来获取url中的参数
 * 如:
 *  {
 *      location: '/lib/:filename',
 *      handler: function(context) {
 *          console.log(context.request.parameters);
 *      }
 *  }
 *
 * 如果访问http://127.0.0.1:8848/lib/config.js
 *  handler将打印出{"filename": "config.js"}
 */
exports.getLocations = function () {
    return [
        {
            location: /^\/server_api/,
            handler: [
                proxy(
                    'vop.baidu.com',
                    '80'
                )
            ]
        },
        {
            location: /worker\.js/,
            handler: [
                babel()
            ] 
        },
        {
            location: /^.*\.js/,
            handler: [
                babel({modules: 'amd'})
            ] 
        },
        {
            location: /^.*$/,
            handler: [
                file()
            ]
        }
    ];
};

/* eslint-disable guard-for-in */
exports.injectResource = function (res) {
    for (var key in res) {
        global[key] = res[key];
    }
};
