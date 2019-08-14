const request = require('../../utils/request.js');
const util = require("../../utils/util.js");
const config = require("../../utils/config.js");
const app = getApp()

Page({
  data: {
    keyword: '',
    date: '',
    contentHeight: 0,
    scrollTop: 0,
    batchList: [],
    noData: false,
    noMoreData: false,
    noDataIcon: config.noDataIcon,
    calendarIcon: config.calendarIcon
  },

  staticData: {
    pageNum: 0
  },

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
    //默认显示当前日期
    this.changeExpectDialDateValue();
  },

  onShow() {
    var userInfo = app.getStorageUserInfo();
    if (userInfo) {
      this.staticData.userUid = userInfo.userUid;
      //调用模板 的refresh方法刷新列表
      this.loadCallBatchListData();
    }
  },

  onClear(e) {
    // console.log('onClear', e)
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
    // console.log(this.staticData.keyword);
    this.loadCallBatchListData();
  },

  changeExpectDialDateValue(date) {
    if (!date) {
      date = new Date();
    } else {
      date = new Date(date);
    }
    var formatDate = util.formatDate(date);
    this.setData({
      date: formatDate
    })
    this.staticData.expectDialDate = formatDate;
    // console.log(this.staticData.expectDialDate);
  },

  bindDateChange(e) {
    this.changeExpectDialDateValue(e.detail.value);
    this.loadCallBatchListData();
  },

  handleNavigatorToBatchResumeList: function(e) {
    // console.log(e);
    let batchUid = e.currentTarget.id;
    let batchName = e.currentTarget.dataset.name;
    wx.navigateTo({
      url: './batchResumeList?batchUid=' + batchUid + '&batchName=' + batchName
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.loadCallBatchListData();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.onLoadmore();
  },

  loadCallBatchListData() {
    this.onRefresh();
  },

  onRefresh() {
    // console.log('onRefresh')
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
    })
    this.staticData.pageNum = this.staticData.pageNum + 1;
    this.getList(10, this.staticData.pageNum, 2);
  },

  getList(pageSize, pageNum, fromLoadding) {
    // console.log("请求获取list数据");
    if (this.staticData.userUid) {
      var params = Object.assign({}, {
        userUid: this.staticData.userUid,
        pageSize: pageSize,
        pageNum: pageNum,
        keyword: this.staticData.keyword,
        expectDialDate: this.staticData.expectDialDate
      });
      var that = this;
      request.fetch(config.requestApi.getCallBatchData, params, 'POST').then((res) => {
        // console.log(res);
        wx.hideLoading();
        const data = res.data;
        if (data.result > 0) {
          var callBatchDataBeanList = data.responseData;
          this.staticData.callBatchDataBeanList = callBatchDataBeanList;
        } else {
          this.staticData.callBatchDataBeanList = new Array();
        }
        this.staticData.count = this.staticData.callBatchDataBeanList.length;
        //总数量
        this.staticData.totalCount = data.pageBean.totalCount;

        if (fromLoadding == 1) {
          that.setData({
            batchList: [...that.staticData.callBatchDataBeanList],
            noData: that.staticData.count == 0,
            noMoreData: false
          })
        } else {
          that.setData({
            batchList: [...that.data.batchList, ...that.staticData.callBatchDataBeanList]
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
  },

  handleLoadDataBtn() {
    this.loadCallBatchListData();
  }
})