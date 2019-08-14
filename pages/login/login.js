import {
  $wuxDialog,
  $wuxCountDown
} from '../../components/index'

const toastUtil = require('../../utils/toastUtil.js');
const request = require('../../utils/request.js');
const config = require("../../utils/config.js");
const app = getApp();

Page({
  data: {
    logoIcon: config.logoIcon,
    isValidAccountSuccess: false,
    mobile: ''
  },

  staticData: {},

  onLoad() {
    //login界面隐藏tabBar
    wx.hideTabBar();
  },

  onShow() {},

  handleAccountChange(e) {
    this.staticData.userCd = e.detail.value;
  },

  handlePasswordChange(e) {
    this.staticData.password = e.detail.value;
  },

  handleCodeChange(e) {
    this.staticData.authCode = e.detail.value;
  },

  handleSendCode() {
    var mobile = this.data.mobile;
    // console.log("发送验证码到：", mobile);

    $wuxDialog().confirm({
      resetOnClose: true,
      closable: true,
      title: '确定将验证码发送到号码【' + mobile + '】吗？',
      content: '',
      onConfirm: this.confirmSendCodeToMobile.bind(this),
      onCancel: this.cancelSendCode.bind(this),
    })

  },

  confirmSendCodeToMobile(e) {
    // console.log(e);
    var userUid = this.staticData.userUid;
    // console.log("userUid:", userUid)
    if (userUid) {
      const params = Object.assign({}, {
        userUid: userUid
      });
      //请求后台接口发送验证码
      var that = this;
      request.fetch(config.requestApi.getAuthCode, params, 'POST').then((res) => {
        // console.log(res);
        const data = res.data;
        if (data.result > 0) {
          toastUtil.toast(data.message, 'success', 1000, this.handleSendCodeToMobileSuccessCallBack.bind(this));
          return;
        } else {
          toastUtil.toast(data.message, 'error');
          return;
        }
      });
    }
  },

  handleSendCodeToMobileSuccessCallBack() {
    var that = this;
    if (this.codeDown && this.codeDown.interval) return !1
    this.codeDown = new $wuxCountDown({
      date: +(new Date) + 60000,
      onEnd() {
        that.setData({
          codeDown: '获取验证码',
          isCodeDisabled: false
        })
      },
      render(date) {
        const sec = "重新获取(" + this.leadingZeros(date.sec, 2) + ')'
        date.sec !== 0 && that.setData({
          codeDown: sec,
          isCodeDisabled: true
        })
      },
    });
  },

  cancelSendCode(e) {
    // console.log("取消发送")
  },

  handleLogin(e) {
    var that = this;
    //检测登录账号密码
    if (!this.staticData.userCd) {
      toastUtil.toast('请输入用户名。', 'error');
      return;
    }
    if (!this.staticData.password) {
      toastUtil.toast('请输入密码。', 'error');
      return;
    }

    //验证码验证
    if (this.data.isValidAccountSuccess && !this.staticData.authCode) {
      toastUtil.toast('请输入验证码。', 'error');
      return;
    }

    //调用接口验证账号密码，成功后返回个人信息
    var that = this;
    request.fetch(config.requestApi.login, this.staticData, 'POST').then((res) => {
      // console.log(res);
      const data = res.data;
      if (data.result < 0) {
        toastUtil.toast(data.message, 'error');
        return;
      }

      const userBean = data.responseData;
      that.staticData.userUid = userBean.uid;
      
      if (!that.data.isValidAccountSuccess) {
        that.setData({
          isValidAccountSuccess: true,
          mobile: userBean.userPhone
        })
        // toastUtil.toast('请先验证您的手机号', 'error');
        return;
      }

      try {
        var userInfo = app.getStorageUserInfo();
        if (!userInfo) {
          //放入storage
          let userInfo = Object.assign({}, {
            userUid: userBean.uid,
            mobile: userBean.userPhone,
            userName: userBean.userName,
            deptName: userBean.deptName,
            positionName: userBean.positionName
          });
          wx.setStorageSync('userInfo', userInfo);
        }
      } catch (e) {
        console.log(e);
      }

      toastUtil.toast('登录成功', 'success', 2000, this.handleLoginSuccessCallBack.bind(this));

    });
  },

  handleLoginSuccessCallBack() {
    this.handleNavigateToIndex();
  },

  handleNavigateToIndex() {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },

  handleNavigateToBack(e) {
    this.setData({
      isValidAccountSuccess: false,
      codeDown: '获取验证码',
      isCodeDisabled: false
    })
    this.staticData.userCd = "";
    this.staticData.password = "";
    this.staticData.authCode = "";
    if (this.codeDown) {
      clearInterval(this.codeDown.interval)
    }
  },

  onShareAppMessage: function(res) {
    return {
      title: '瑞聘小程序',
      path: '/pages/login/login'
    }
  }
})