const toastUtil = require('../../utils/toastUtil.js');
const request = require('../../utils/request.js');
const config = require("../../utils/config.js");
const app = getApp();

Page({
  data: {
    callMobileList: [],
    selectedMobile: '',
    displayMobileLabel: '请选择'
  },

  staticData: {},

  onLoad(options) {
    //获取登录用户UserUid
    var userInfo = app.getStorageUserInfo();
    if (userInfo) {
      this.staticData.userUid = userInfo.userUid;
      this.getCallerNumber();
    }
  },

  onShow() {},

  //获取主叫号码
  getCallerNumber() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    const params = Object.assign({}, {
      userUid: this.staticData.userUid
    });
    var that = this;
    request.fetch(config.requestApi.getCallerNumber, params, 'POST').then((res) => {
      // console.log(res);
      const data = res.data;
      if (data.result > 0) {
        setTimeout(function() {
          wx.hideLoading()
        }, 1000);
        const responseData = data.responseData;
        const callMobileList = responseData.mobileList
        that.setData({
          callMobileList: [...callMobileList],
          selectedMobile: responseData.ccMobile,
          displayMobileLabel: responseData.ccMobile
        })
      } else {
        wx.hideLoading();
        toastUtil.toast(data.message, 'error');
        return;
      }
    });
  },

  onConfirm(e) {
    var ccMobile = e.detail.value;
    // console.log("选择的value:" + e.detail.value + ",displayValue:" + e.detail.label);
    const params = Object.assign({}, {
      userUid: this.staticData.userUid,
      ccMobile: ccMobile
    });
    var that = this;
    request.fetch(config.requestApi.updateCallerNumber, params, 'POST').then((res) => {
      // console.log(res);
      const data = res.data;
      if (data.result > 0) {
        toastUtil.toast("主叫号码已切换。", 'success', 1000, this.handleConfirmSuccessCallBack.bind(this, ccMobile));
        return;
      } else {
        toastUtil.toast(data.message, 'error');
        return;
      }
    });
  },

  handleConfirmSuccessCallBack(ccMobile) {
    this.setData({
      selectedMobile: ccMobile,
      displayMobileLabel: ccMobile
    })
  },

  onValueChange(e) {
    const {
      index
    } = e.currentTarget.dataset
    // console.log(`onValueChange${index}`, e.detail)
  },

  handleLoginOut(e) {
    wx.reLaunch({
      url: '/pages/login/login',
      success: this.handleLoginOutSuccess.bind(this)
    })
  },

  handleLoginOutSuccess() {
    //清除用户登录
    app.clearStorageUserInfo();
  }
})