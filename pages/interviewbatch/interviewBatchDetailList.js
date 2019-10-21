const toastUtil = require('../../utils/toastUtil.js');
const request = require('../../utils/request.js');
const config = require("../../utils/config.js");
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    keyword: '',
    contentHeight: 0,
    count: 0,
    scrollTop: 0,
    interviewBatchDetailList: [],
    noData: false,
    noMoreData: false,
    images: {
      menIcon: config.menIcon,
      womenIcon: config.womenIcon,
      noDataIcon: config.noDataIcon
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    //声明节点查询的方法
    wx.createSelectorQuery().selectAll('.page,.search-container').fields({
      size: true
    }, ([p, m]) => {
      this.setData({
        contentHeight: p.height - m.height
      })
      // console.log(this.data.contentHeight)
    }).exec();
    this.onLoadListData();
  },

  onLoadListData() {
    //获取登录用户UserUid
    var userInfo = app.getStorageUserInfo();
    if (userInfo) {
      this.staticData.userUid = userInfo.userUid;
      //调用模板 的refresh方法刷新列表  
      this.loadInterviewBatchDetailListData();
    }
  },

  staticData: {
    pageNum: 0
  },

  /**
   * 阻止触摸移动
   */
  noop() {},

  //无数据是轻触刷新
  handleLoadDataBtn() {
    this.loadInterviewBatchDetailListData();
  },

  onClear(e) {
    this.setData({
      keyword: '',
    })
    this.staticData.keyword = '';
  },

  onChange(e) {
    this.setData({
      keyword: e.detail.value,
    })
    this.staticData.keyword = e.detail.value;
  },

  onConfirm(e) {
    this.setData({
      keyword: e.detail.value,
    })
    this.staticData.keyword = e.detail.value;
    this.loadInterviewBatchDetailListData();
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.loadInterviewBatchDetailListData();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.onLoadmore();
  },

  loadInterviewBatchDetailListData() {
    this.onRefresh();
  },

  onRefresh() {
    // console.log('onRefresh');
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    this.staticData.pageNum = 0;
    this.getList(10, 0, 1);
    setTimeout(function() {
      wx.stopPullDownRefresh()
    }, 1000);
  },

  onLoadmore() {
    var that = this;
    // console.log('onLoadmore');
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    this.staticData.pageNum = this.staticData.pageNum + 1;
    this.getList(10, this.staticData.pageNum, 2);
  },

  getList(pageSize, pageNum, fromLoadding) {
    // console.log("请求获取list数据");
    if (this.staticData.userUid) {
      const params = Object.assign({}, {
        userUid: this.staticData.userUid,
        pageSize: pageSize,
        pageNum: pageNum,
        keyword: this.staticData.keyword
      });
      var that = this;
      request.fetch(config.requestApi.getInterviewBatchDetailData, params, 'POST').then((res) => {
        // console.log(res);
        wx.hideLoading();
        const data = res.data;
        if (data.result > 0) {
          var interviewBatchDetailDataBeanList = data.responseData;
          this.staticData.interviewBatchDetailDataBeanList = interviewBatchDetailDataBeanList;
        } else {
          this.staticData.interviewBatchDetailDataBeanList = new Array();
        }
        this.staticData.count = this.staticData.interviewBatchDetailDataBeanList.length;
        //总数量
        this.staticData.totalCount = data.pageBean.totalCount;

        if (fromLoadding == 1) {
          that.setData({
            interviewBatchDetailList: [...that.staticData.interviewBatchDetailDataBeanList],
            noData: that.staticData.count == 0,
            noMoreData: false
          });
        } else {
          that.setData({
            interviewBatchDetailList: [...that.data.interviewBatchDetailList, ...that.staticData.interviewBatchDetailDataBeanList]
          });
          if (that.staticData.count == 0) {
            // console.log('没有更多数据')
            that.setData({
              noMoreData: true
            })
          }
        }
      });
    }
  }

})