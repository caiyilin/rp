const app = getApp();

const templateCallResumePage = require('../../templates/templateCallResumePage.js')

const data = Object.assign({}, templateCallResumePage.data, {});

const callResumeConfig = Object.assign({}, templateCallResumePage, {

  data: data,

  onLoad(options) {
    //首页传入的时间标识 昨日0 今日1
    let dateFlag = options.dateFlag;
    //首页传入的拨打状态 已拨打1 未拨打0
    let dialStatus = options.dialStatus;
    //声明节点查询的方法
    wx.createSelectorQuery().selectAll('.page,.search-container').fields({
      size: true
    }, ([p, m]) => {
      this.setData({
        contentHeight: p.height - m.height
      })
      // console.log(this.data.contentHeight)
    }).exec();

    //动态设置字典
    var that = this;
    const dateFlagObj = Object.assign({}, {
      type: 'radio',
      label: '查询时间',
      value: 'dateFlag',
      children: [{
          label: '今日',
          value: '1',
          checked: dateFlag == '1' ? true : false
        },
        {
          label: '昨日',
          value: '0',
          checked: dateFlag == '0' ? true : false
        }
      ],
    });
    //置于第一位
    this.data.filterItems[0].children.splice(0, 0, dateFlagObj);
    this.staticData.dateFlag = dateFlag;
    const dialStatusObj = Object.assign({}, {
      type: 'radio',
      label: '是否拨打',
      value: 'dialStatus',
      children: [{
          label: '已拨打',
          value: '1',
          checked: dialStatus == '1' ? true : false
        },
        {
          label: '未拨打',
          value: '0',
          checked: dialStatus == '0' ? true : false
        }
      ],
    });
    //置于第二位
    this.data.filterItems[0].children.splice(1, 0, dialStatusObj);
    this.staticData.dialStatus = dialStatus;
    const followObj = Object.assign({}, {
      type: 'checkbox',
      label: '跟进结果',
      value: 'followResultCd',
      children: app.globalData.followResultCdItems
    });
    // console.log("this.data.filterItems", this.data.filterItems);
    this.data.filterItems[0].children.push(followObj);
    that.setData({
      filterItems: that.data.filterItems
    });

    this.onLoadListData();
  },

  onLoadListData() {
    //获取登录用户UserUid
    var userInfo = app.getStorageUserInfo();
    if (userInfo) {
      this.staticData.userUid = userInfo.userUid;
      //调用模板 的refresh方法刷新列表
      this.loadCallResumeListData();
    }
  },

  onShow() {}
});

Page(callResumeConfig)