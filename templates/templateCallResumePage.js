import {
  $wuxDialog
} from '../components/index';

const toastUtil = require('../utils/toastUtil.js');
const request = require('../utils/request.js');
const util = require("../utils/util.js");
const config = require("../utils/config.js");

module.exports = {
  data: {
    keyword: '',
    contentHeight: 0,
    count: 0,
    scrollTop: 0,
    batchResumeList: [],
    noData: false,
    noMoreData: false,
    images: {
      callIcon: config.callIcon,
      contactIcon: config.pencilIcon,
      menIcon: config.menIcon,
      womenIcon: config.womenIcon,
      noDataIcon: config.noDataIcon
    },

    filterItems: [{
      type: 'filter',
      label: '筛选',
      value: 'filter',
      checked: true,
      children: [{
          type: 'radio',
          label: '拨打结果',
          value: 'dialResultCd',
          children: [{
              label: '已接通',
              value: '03',
            },
            {
              label: '未接通',
              value: '01',
            }
          ],
        },
        {
          type: 'radio',
          label: '性别',
          value: 'sexCd',
          children: [{
              label: '男',
              value: '01',
            },
            {
              label: '女',
              value: '02',
            }
          ],
        }
      ],
      groups: ['000']
    }]
  },

  staticData: {
    pageNum: 0
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
    // console.log(this.staticData.keyword);
    this.loadCallResumeListData();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.loadCallResumeListData();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.onLoadmore();
  },

  loadCallResumeListData() {
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
    if (this.staticData.userUid || this.staticData.batchUid) {
      const params = Object.assign({}, {
        userUid: this.staticData.userUid,
        batchUid: this.staticData.batchUid,
        pageSize: pageSize,
        pageNum: pageNum,
        keyword: this.staticData.keyword,
        dialResultCd: this.staticData.dialResultCd,
        sexCd: this.staticData.sexCd,
        dialStatus: this.staticData.dialStatus,
        followResultCd: this.staticData.followResultCd,
        dateFlag: this.staticData.dateFlag
      });
      var that = this;
      request.fetch(config.requestApi.getCallBatchDetailData, params, 'POST').then((res) => {
        // console.log(res);
        wx.hideLoading();
        const data = res.data;
        if (data.result > 0) {
          var callBatchDetailDataBeanList = data.responseData;
          this.staticData.callBatchDetailDataBeanList = callBatchDetailDataBeanList;
        } else {
          this.staticData.callBatchDetailDataBeanList = new Array();
        }
        this.staticData.count = this.staticData.callBatchDetailDataBeanList.length;
        //总数量
        this.staticData.totalCount = data.pageBean.totalCount;

        if (fromLoadding == 1) {
          that.setData({
            batchResumeList: [...that.staticData.callBatchDetailDataBeanList],
            noData: that.staticData.count == 0,
            noMoreData: false
          });
        } else {
          that.setData({
            batchResumeList: [...that.data.batchResumeList, ...that.staticData.callBatchDetailDataBeanList]
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

  handleClickCallBtn(e) {
    // console.log(e);
    let index = e.currentTarget.dataset.index;
    let currentResume = this.data.batchResumeList[index];
    this.staticData.currentCallIndex = index;

    // console.log(currentResume.expectDialDate);
    //预计拨打日期<当前日期 不可拨打
    var nowDate = util.formatDate(new Date());
    var formatDate = util.formatDate(new Date(currentResume.expectDialDate));
    if (formatDate < nowDate) {
      toastUtil.toast("该名单所在批次的预计拨打日期小于当前日期，不可拨打。", 'error');
      return;
    }

    $wuxDialog().open({
      resetOnClose: true,
      title: '确定拨打电话给【' + currentResume.resumeName + '】吗？',
      content: '',
      verticalButtons: !0,
      buttons: [{
          text: '立即拨打',
          bold: !0,
          type: 'primary',
          onTap: this.handleCallToMobile.bind(this, currentResume.batchDetailUid),
        },
        {
          text: '取消',
          bold: !0,
        }
      ],
    })
  },

  handleCallToMobile(batchDetailUid) {
    wx.showLoading({
      title: '正在拨号...',
      mask: true
    });
    // console.log(batchDetailUid);
    const params = Object.assign({}, {
      userUid: this.staticData.userUid,
      batchDetailUid: batchDetailUid
    });
    //请求后台接口 电话拨打
    var that = this;
    request.fetch(config.requestApi.phoneDial, params, 'POST').then((res) => {
      // console.log(res);
      const data = res.data;
      wx.hideLoading();
      if (data.result > 0) {
        toastUtil.toast("已拨通，请留意来电。", 'success', 2000, that.handleCallToMobileSuccessCallBack.bind(this));
        return;
      } else {
        toastUtil.toast(data.message, 'error', 5000);
        return;
      }
    });
  },

  //局部单独设置拨打状态
  handleCallToMobileSuccessCallBack() {
    let index = this.staticData.currentCallIndex;
    // console.log("当前拨打index", index)
    if (index) {
      let currentCallResumeDialStatus = 'batchResumeList[' + index + '].dialStatus';
      this.setData({
        [currentCallResumeDialStatus]: 1
      });
      // console.log("dialStatus:", this.data.batchResumeList[index].dialStatus);
    }
  },

  handleViewMobile(e) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    var that = this;
    let index = e.currentTarget.dataset.index;
    let currentBatchResumeIsShowMobile = 'batchResumeList[' + index + '].isShowMobile';
    let currentBatchResumeMobileValue = 'batchResumeList[' + index + '].mobile';
    var resumeUid = this.data.batchResumeList[index].resumeUid;
    const params = Object.assign({}, {
      userUid: this.staticData.userUid,
      resumeUid: resumeUid
    });
    //请求后台接口 查看手机号
    var that = this;
    request.fetch(config.requestApi.searchMobile, params, 'POST').then((res) => {
      // console.log(res);
      const data = res.data;
      if (data.result > 0) {
        wx.hideLoading();
        const responseData = data.responseData
        that.setData({
          [currentBatchResumeIsShowMobile]: true,
          [currentBatchResumeMobileValue]: responseData.mobile
        })
      } else {
        toastUtil.toast(data.message, 'error');
        return;
      }
    });
  },

  handleAddContactRecordBtn(e) {
    // console.log(e);
    let index = e.currentTarget.dataset.index;
    let currentResume = this.data.batchResumeList[index];
    this.staticData.currentCallIndex = index;
    //预计拨打日期<当前日期 不可添加/修改跟进记录
    // console.log(currentResume.expectDialDate);
    var nowDate = util.formatDate(new Date());
    var formatDate = util.formatDate(new Date(currentResume.expectDialDate));
    if (formatDate < nowDate) {
      toastUtil.toast("该名单所在批次的预计拨打日期小于当前日期，不可添加/修改跟进记录。", 'error');
      return;
    }

    wx.navigateTo({
      url: '/pages/contactrecord/addContactRecord?batchDetailUid=' + currentResume.batchDetailUid + '&resumeName=' + currentResume.resumeName + "&followResultCds=" + currentResume.followResultCd + "&contactContent=" + currentResume.contactContent
    })
  },

  refreshContactRecordInfo() {
    var that = this;
    let index = this.staticData.currentCallIndex;
    // console.log("当前拨打index", index)
    if (index) {
      let currentCallFollowResultCd = 'batchResumeList[' + index + '].followResultCd';
      let currentCallFollowResultNames = 'batchResumeList[' + index + '].followResultNameList';
      let currentCallFollowResultContent = 'batchResumeList[' + index + '].contactContent';
      that.setData({
        [currentCallFollowResultCd]: [...that.staticData.savedFollowResultCd.split(',')],
        [currentCallFollowResultNames]: [...that.staticData.savedFollowResultNames.split(',')],
        [currentCallFollowResultContent]: that.staticData.savedFollowContactContent
      });
    }
  },

  handleNavigatorToResumeDetail(e) {
    // console.log(e);
    let resumeUid = e.currentTarget.dataset.resumeUid;
    let resumeName = e.currentTarget.dataset.resumeName;
    wx.navigateTo({
      url: '/pages/resumedetail/resumeDetail?resumeUid=' + resumeUid + '&resumeName=' + resumeName
    })
  },

  onChangeFilter(e) {
    const {
      checkedItems,
      items,
      checkedValues
    } = e.detail
    const params = {}
    checkedItems.forEach((n) => {
      if (n.checked) {
        if (n.value === 'filter') {
          // console.log(n.children);
          n.children.filter((n) => n.selected).forEach((n) => {
            if (n.value === 'dateFlag') {
              const selected = n.children.filter((n) => n.checked).map((n) => n.value).join(',')
              params.dateFlag = selected
            } else if (n.value === 'dialStatus') {
              const selected = n.children.filter((n) => n.checked).map((n) => n.value).join(' ')
              params.dialStatus = selected
            } else if (n.value === 'dialResultCd') {
              const selected = n.children.filter((n) => n.checked).map((n) => n.value).join(' ')
              params.dialResultCd = selected
            } else if (n.value === 'sexCd') {
              const selected = n.children.filter((n) => n.checked).map((n) => n.value).join(' ')
              params.sexCd = selected
            } else if (n.value === 'followResultCd') {
              const selected = n.children.filter((n) => n.checked).map((n) => n.value).join(',')
              params.followResultCd = selected
            }
          })
        }
      }
    })

    Object.assign(this.staticData, {
      dialStatus: !params.dialStatus ? '' : params.dialStatus,
      dialResultCd: !params.dialResultCd ? '' : params.dialResultCd,
      sexCd: !params.sexCd ? '' : params.sexCd,
      followResultCd: !params.followResultCd ? '' : params.followResultCd,
      dateFlag: !params.dateFlag ? '' : params.dateFlag,
    });
    // console.log('filterParams:', this.staticData);
    //筛选调用刷新
    this.loadCallResumeListData();
  },

  /**
   * 阻止触摸移动
   */
  noop() {},

  //无数据是轻触刷新
  handleLoadDataBtn() {
    this.loadCallResumeListData();
  }
}