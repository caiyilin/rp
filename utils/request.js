var aes = require('aesUtil.js')
var md5 = require("md5.js")
var config = require("config.js")

var server = config.server;
/** ajax请求数据接口
 * [ajax请求数据接口]
 * @param  {[String]} url    [请求地址]
 * @param  {[Object||String]} data   [参数]
 * @param  {[String]} method [请求类型：默认为 GET，有效值：OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT]
 * @param [[String]] contentType 默认为application/json
 * @return {[Promise]}        [返回结果]
 */
function fetch(url, data, method = 'GET', contentType = 'application/json') {
  // 非get请求加上_xsrf参数
  // if (method !== 'GET') {
  //   data = typeof(data) === 'object' ? data : {}
  // }
  //转为JSON
  var jsonStr = JSON.stringify(data);
  //根据特定规则生成Token token 格式： timestamp-key   时间戳-约定key 拼接后MD5加密
  var token = productionToken();
  // console.log("token:" + token);

  let header = {
    'content-type': contentType,
    'RP-Agent': 'Ruipin/1.0.0 (1.0.0;9.2.1;iPhone;wifi;wxapp)',
    Cookie: wx.getStorageSync('cookie'),
    'token': token
  }
  // 处理header的XC-Agent
  if (wx.getStorageSync('systemInfo') || wx.getStorageSync('networkType')) {
    let sys = wx.getStorageSync('systemInfo');
    let version = wx.getStorageSync('version');
    let networkType = wx.getStorageSync('networkType');
    header['XC-Agent'] = `Ruipin/${version} (${sys.version};${sys.system};${sys.model};${networkType};wxapp)`
  }

  const aesData = aes.Encrypt(jsonStr);
  const decrypt = aes.Decrypt(aesData);
  // console.log('请求=>明文参数：' + jsonStr);
  // console.log('请求=>加密参数：' + aesData);
  // console.log('解密' + JSON.stringify(decrypt));

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${server}${url}`,
      data: aesData,
      method: method,
      header: header,
      success: function(res) {
        if (res) {
          // console.log("res=====", res);
          //判断请求结果是否成功
          var result = aes.Decrypt(res.data);
          // console.log('解密result:' + JSON.stringify(result));
          if (result) {
            var data = Object.assign({}, {
              data: JSON.parse(result)
            });
            // console.log("data:" + data)
            resolve(data)
          }
        } else {
          reject(res)
        }
      },
      fail: function(err) {
        reject(err)
      }
    })
  })
}

function productionToken() {
  var timestamp = new Date().getTime();
  return timestamp + "-" + config.tokenKey;
}

module.exports = {
  fetch: fetch,
  server: server
}