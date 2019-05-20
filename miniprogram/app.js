//app.js
App({

  onLaunch: function () {
    var openid_='';
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    /**
     * 设置全局变量
     */
    this.globalData = {
      //url: "http://localhost:8080/xxadj/",
      url: "https://xxadj.bubbletg.cn/",
    }
    this.globalDataOpenid = {
      openid_: openid_,
    }
    //默认没有登录
    this.globalDataAndLogin={
      login:false,
    }
  }
 
})
