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
      //执行云涵数，获得openid作为id
      wx.cloud.callFunction({
        name: 'login',
        complete: (res) => {
          /**
           *  在前面写是防止res.result.openid 出错，
           *  后面不执行了，然后实现为openid_ 赋值空
           */
          this.globalDataOpenid = {
            openid_: openid_,
          }
          console.log("---------------quanju", res.result.openid);
          openid_ = res.result.openid;
          /**
           * 设置全局变量
           * 在后面写是防止res.result.openid 没有出错，
           * 然后赋值获取到的openid
           */
          this.globalDataOpenid = {
            openid_: openid_,
          }
        }
      })
    }

    /**
     * 设置全局变量
     */
    this.globalData = {
      //url: "http://localhost:8080/xxadj/",
      url: "https://xxadj.bubbletg.cn/",
    }
  }
})
