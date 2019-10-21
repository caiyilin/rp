const host = "https://rpbak.renruihr.com";
// const host = "http://172.17.12.224:8385";
// const host = "https://test4rp2.renruihr.com";
const imageDirectory = host + "/static/images/rp/openapi/";
module.exports = {
  host,
  server: host + "/rp/open/api/",
  imageDirectory: imageDirectory,
  logoIcon: imageDirectory + "logo.png",
  bannerIcon: imageDirectory + "banner.png",
  callIcon: imageDirectory + "call.png",
  pencilIcon: imageDirectory + "pencil.png",
  menIcon: imageDirectory + "men.png",
  womenIcon: imageDirectory + "women.png",
  noDataIcon: imageDirectory + "no-data.png",
  calendarIcon: imageDirectory + "calendar.png",
  tokenKey: '1GQgYcAKmj2_G_tTDp0AsIoVL6hueMf3/9NUscA_8JXNc/yHLjW0F8cRvI1WuCBA',
  requestApi: {
    login: 'login',
    getAuthCode: 'getAuthCode',
    getIndexData: 'getIndexData',
    getCallBatchData: 'getCallBatchData',
    getCallBatchDetailData: 'getCallBatchDetailData',
    phoneDial: 'phoneDial',
    searchMobile: 'searchMobile',
    getUserFullInfo: 'getUserFullInfo',
    getCallerNumber: 'getCallerNumber',
    updateCallerNumber: 'updateCallerNumber',
    getFullResumeInfo: 'getFullResumeInfo',
    saveContactContent: 'saveContactContent',
    getFollowResultList: 'getFollowResultList',
    getInterviewBatchDetailData: 'getInterviewBatchDetailData'
  }
}