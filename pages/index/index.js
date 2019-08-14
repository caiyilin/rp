const toastUtil = require('../../utils/toastUtil.js');
const request = require('../../utils/request.js');
const config = require("../../utils/config.js");
const app = getApp()

Page({
  data: {
    bannerIcon: config.bannerIcon,
    todayCalledPercent: 0,
    todayUnCallPercent: 0,
    yestodayCalledPercent: 0,
    yestodayUnCallPercent: 0
  },

  onLoad(options) {
    //如果已经存在登录信息，则保持现状。如果不存在登录信息则跳转到登录页。
    var userInfo = app.getStorageUserInfo();
    // console.log("进入onload-userInfo", userInfo);
    if (!userInfo) {
      wx.showLoading({
        title: '加载中...',
        mask: true
      })
      this.handleNavigateToLogin();
    } else {
      // console.log("onLoad账号已登录，登录人：" + userInfo.userUid);
    }
  },

  onShow() {
    var userInfo = app.getStorageUserInfo();
    // console.log("onShow账号已登录，登录人：" + userInfo.userUid);
    if (userInfo) {
      wx.showTabBar();
      this.showIndexCallData();
    }
  },

  handleNavigateToLogin() {
    wx.redirectTo({
      url: '/pages/login/login',
    });
    setTimeout(function() {
      wx.hideLoading()
    }, 1000);
  },

  showIndexCallData() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    var userInfo = app.getStorageUserInfo();
    if (userInfo) {
      const params = Object.assign({}, {
        userUid: userInfo.userUid
      });
      //请求后台接口发送验证码
      var that = this;
      request.fetch(config.requestApi.getIndexData, params, 'POST').then((res) => {
        // console.log(res);
        const data = res.data;
        if (data.result > 0) {
          wx.hideLoading();
          const indexDataBean = data.responseData;
          that.setData({
            todayCalledPercent: indexDataBean.currentDialedCount,
            todayUnCallPercent: indexDataBean.currentUnDialCount,
            yestodayCalledPercent: indexDataBean.yesterdayDialedCount,
            yestodayUnCallPercent: indexDataBean.yesterdayUnDialCount
          })
        }
      });
    }
  },

  handleNavigatorToCallResume(e) {
    const dateFlag = e.currentTarget.dataset.searchDay == 'yestoday' ? 0 : 1;
    wx.reLaunch({
      url: '/pages/callresume/callResumeList?dialStatus=' + e.currentTarget.dataset.dialStatus + '&dateFlag=' + dateFlag,
    })
  },

  onShareAppMessage: function(res) {
    return {
      title: '瑞聘小程序',
      path: '/pages/index/index'
    }
  }
})