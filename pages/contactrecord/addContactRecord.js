const toastUtil = require('../../utils/toastUtil.js');
const request = require('../../utils/request.js');
const config = require("../../utils/config.js");
const app = getApp();

Page({
  data: {
    followResultArray: [],
    contactContent: ''
  },

  staticData: {},

  onLoad(options) {
    let batchDetailUid = options.batchDetailUid;
    this.staticData.batchDetailUid = batchDetailUid;
    //修改导航条bar title
    this.updateNavigationBarTitle(options);
    //获取跟进结果字典数据
    this.getFollowResultList();
    //选中上次跟进结果
    this.staticData.followResultCds = options.followResultCds;
    //默认填写上次沟通内容
    this.staticData.contactContent = options.contactContent;
  },

  updateNavigationBarTitle(options) {
    let resumeName = options.resumeName;
    if (resumeName) {
      wx.setNavigationBarTitle({
        title: "沟通记录-" + resumeName
      })
    }
  },

  onShow() {
    //获取登录用户UserUid
    var userInfo = app.getStorageUserInfo();
    if (userInfo) {
      this.staticData.userUid = userInfo.userUid;
    }
    this.setData({
      contactContent: this.staticData.contactContent
    })
    //设置名单列表页面不刷新，如果直接返回的时候
    // this.checkPrevRefresh(false);
  },

  // checkPrevRefresh(isPrevPageRefresh) {
  //   //取出名单列表页
  //   var that = this;
  //   var pages = getCurrentPages();
  //   var prevPage = pages[pages.length - 2]; //上一个页面
  //   prevPage.staticData.isNeedRefresh = isPrevPageRefresh
  // },

  getFollowResultList() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    var that = this;
    request.fetch(config.requestApi.getFollowResultList).then((res) => {
      // console.log(res);
      const data = res.data;
      if (data.result > 0) {
        setTimeout(function() {
          wx.hideLoading()
        }, 1000)
        var followResultArray = data.responseData.map((value, index) => {
          return {
            subCd: value.subCd,
            subName: value.subName,
            activied: false
          }
        });
        var followResultCds = this.staticData.followResultCds.split(",");
        for (let i = 0; i < followResultCds.length; i++) {
          var selectedCd = followResultCds[i];
          for (let j = 0; j < followResultArray.length; j++) {
            var value = followResultArray[j];
            if (selectedCd === value.subCd) {
              followResultArray[j].activied = true;
            }
          }
        }
        that.setData({
          followResultArray: [...followResultArray]
        })
      } else {
        toastUtil.toast(data.message, 'error');
        return;
      }
    });
  },

  addContactRecord(e) {
    // console.log(e);
    var content = e.detail.value.content;
    this.staticData.contactContent = content;
    // console.log(content);
    //取出选中的沟通结果
    var selectedFollowResultCd = this.getSelectedFollowResultCd();
    // console.log(selectedFollowResultCd);
    this.staticData.followResultCd = selectedFollowResultCd;
    this.saveContactContent();
  },

  saveContactContent() {
    var that = this;
    //检测登录账号密码
    if (!this.staticData.contactContent && !this.staticData.followResultCd) {
      toastUtil.toast('请选择跟进结果或者填写沟通记录。', 'error');
      return;
    }
    var that = this;
    const params = Object.assign({}, {
      userUid: this.staticData.userUid,
      batchDetailUid: this.staticData.batchDetailUid,
      contactContent: this.staticData.contactContent,
      followResultCd: this.staticData.followResultCd
    });
    request.fetch(config.requestApi.saveContactContent, params, 'POST').then((res) => {
      // console.log(res);
      const data = res.data;
      if (data.result > 0) {
        toastUtil.toast(data.message, 'success', 1000, this.handleSaveContactContentSuccessCallBack.bind(this));
        return;
      } else {
        toastUtil.toast(data.message, 'error');
        return;
      }
    });
  },

  handleSaveContactContentSuccessCallBack() {
    //设置名单列表页面刷新
    // this.checkPrevRefresh(true);
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //上一个页面
    prevPage.staticData.savedFollowResultCd = this.staticData.followResultCd;
    prevPage.staticData.savedFollowResultNames = this.staticData.followResultNames;
    prevPage.staticData.savedFollowContactContent = this.staticData.contactContent;
    wx.navigateBack({
      delta: 1,
      success: function(){
        prevPage.refreshContactRecordInfo();
      }
    })
  },
 
  getSelectedFollowResultCd() {
    var followResultCdStr = new Array();
    var followResultNameStr = new Array();
    for (let i = 0; i < this.data.followResultArray.length; i++) {
      if (this.data.followResultArray[i].activied) {
        followResultCdStr.push(this.data.followResultArray[i].subCd);
        followResultNameStr.push(this.data.followResultArray[i].subName);
      }
    }
    this.staticData.followResultNames = followResultNameStr.join(",");
    return followResultCdStr.join(",");
  },

  handleSelectFollowResultCd(e) {
    // console.log(e);
    var that = this;
    let index = e.currentTarget.dataset.index;
    let subCd = e.currentTarget.dataset.subCd;
    //先取出当前item中是否activied，如果已activied则取消选中，反之设置activied为选中true
    var isActivied = that.data.followResultArray[index].activied;

    // console.log("切换前：" + isActivied)
    let currentBatchResume = 'followResultArray[' + index + '].activied';
    that.setData({
      [currentBatchResume]: !isActivied
    })
    // console.log("切换后：" + that.data.followResultArray[index].activied);
  }
})