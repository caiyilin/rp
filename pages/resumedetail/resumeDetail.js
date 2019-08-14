const toastUtil = require('../../utils/toastUtil.js');
const request = require('../../utils/request.js');
const config = require("../../utils/config.js");
const app = getApp();

Page({
  data: {
    detail: {
      resumeBaseInfo: {},
      resumeWorkExperienceList: [],
      educationExperienceList: [],
      resumeApplyInfoList: []
    }
  },

  staticData: {},

  onLoad(options) {
    let resumeUid = options.resumeUid;
    this.staticData.resumeUid = resumeUid;
    //修改导航条bar title
    this.updateNavigationBarTitle(options);
  },

  onShow() {
    //获取登录用户UserUid
    var userInfo = app.getStorageUserInfo();
    if (userInfo) {
      this.staticData.userUid = userInfo.userUid;
      this.getFullResumeInfo();
    }
    //设置名单列表页面不刷新，如果直接返回的时候
    this.checkPrevRefresh(false);
  },

  checkPrevRefresh(isPrevPageRefresh) {
    //取出名单列表页
    var that = this;
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //上一个页面
    prevPage.staticData.isNeedRefresh = isPrevPageRefresh
  },

  updateNavigationBarTitle(options) {
    let resumeName = options.resumeName;
    if (resumeName) {
      wx.setNavigationBarTitle({
        title: resumeName
      })
    }
  },

  getFullResumeInfo() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    var that = this;
    const params = Object.assign({}, {
      userUid: this.staticData.userUid,
      resumeUid: this.staticData.resumeUid
    });
    request.fetch(config.requestApi.getFullResumeInfo, params, 'POST').then((res) => {
      // console.log(res);
      const data = res.data;
      if (data.result > 0) {
        wx.hideLoading();
        const responseData = data.responseData;
        that.setData({
          ['detail.resumeBaseInfo']: responseData,
          ['detail.resumeWorkExperienceList']: [...responseData.resumeWorkInfoList],
          ['detail.educationExperienceList']: [...responseData.resumeEducationInfoList],
          ['detail.resumeApplyInfoList']: [...responseData.resumeApplyInfoList]
        })
      } else {
        toastUtil.toast(data.message, 'error');
        return;
      }
    });
  }
})