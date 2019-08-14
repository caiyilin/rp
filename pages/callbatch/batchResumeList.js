const app = getApp()

const templateCallResumePage = require('../../templates/templateCallResumePage.js')

const data = Object.assign({}, templateCallResumePage.data, {});

const config = Object.assign({}, templateCallResumePage, {

  data: data,

  onLoad(options) {
    let batchUid = options.batchUid;
    this.staticData.batchUid = batchUid;
    //修改导航条bar title
    this.updateNavigationBarTitle(options);
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
          value: '1'
        },
        {
          label: '昨日',
          value: '0'
        }
      ],
    });
    //置于第一位
    this.data.filterItems[0].children.splice(0, 0, dateFlagObj);
    const dialStatusObj = Object.assign({}, {
      type: 'radio',
      label: '是否拨打',
      value: 'dialStatus',
      children: [{
          label: '已拨打',
          value: '1'
        },
        {
          label: '未拨打',
          value: '0'
        }
      ],
    });
    //置于第二位
    this.data.filterItems[0].children.splice(1, 0, dialStatusObj);
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

  onShow() {},

  updateNavigationBarTitle(options) {
    let batchName = options.batchName;
    if (batchName) {
      wx.setNavigationBarTitle({
        title: batchName
      })
    }
  }
});

Page(config)