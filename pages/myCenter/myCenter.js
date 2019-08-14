const app = getApp();

Page({
  data: {
    baseInfo: {
      userName: '',
      positionName: '',
      deptName: '',
      photo: 'https://picsum.photos/750/750/?random&s=2'
    }
  },

  onLoad(options) {
    this.showMyCenterUserInfo();
  },

  showMyCenterUserInfo() {
    //获取缓存中的用户信息
    var userInfo = app.getStorageUserInfo();
    if (userInfo) {
      this.setData({
        'baseInfo.userName': userInfo.userName,
        'baseInfo.positionName': userInfo.positionName,
        'baseInfo.deptName': userInfo.deptName
      });
    }
  }
})