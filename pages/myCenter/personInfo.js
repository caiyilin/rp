const toastUtil = require('../../utils/toastUtil.js');
const request = require('../../utils/request.js');
const config = require("../../utils/config.js");
const app = getApp();

Page({
  data: {
    baseInfo: {},
  },

  staticData: {},

  onLoad(options) {
    // console.log(options);
    //获取登录用户UserUid
    var userInfo = app.getStorageUserInfo();
    if (userInfo) {
      this.staticData.userUid = userInfo.userUid;
      this.getUserFullInfo();
    }
  },

  onShow() {
  },

  //获取用户完整信息
  getUserFullInfo() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    const params = Object.assign({}, {
      userUid: this.staticData.userUid
    });
    var that = this;
    request.fetch(config.requestApi.getUserFullInfo, params, 'POST').then((res) => {
      // console.log(res);
      const data = res.data;
      setTimeout(function () {
        wx.hideLoading()
      }, 1000)
      if (data.result > 0) {
        const responseData = data.responseData;
        that.setData({
          baseInfo: Object.assign({}, responseData)
        })
      } else {
        toastUtil.toast(data.message, 'error');
        return;
      }
    });
  }
})