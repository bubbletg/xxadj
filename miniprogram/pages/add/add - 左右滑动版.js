// pages/add/add.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    richangdaijia: "cur", //默认显示日常代驾
  },
  //导航点击切换
  daohangqiehuan: function(e) {
    let richangdaijia = ''; //日常代驾
    let baoshidaijia = ''; //包时代驾
    let baochefuwu = ''; //包车服务
    let qiehuan = e.currentTarget.dataset.daohangqiehuan;
    if (qiehuan == 'richangdaijia') {
      richangdaijia = 'cur';
    } else if (qiehuan == 'baoshidaijia') {
      baoshidaijia = 'cur';
    } else if (qiehuan == 'baochefuwu') {
      baochefuwu = 'cur';
    }
    this.setData({
      richangdaijia: richangdaijia,
      baoshidaijia: baoshidaijia,
      baochefuwu: baochefuwu,
    })
  },
  /**
   * 左右滑动切换
   * touchStart  触摸开始
   * touchEnd    触摸结束
   * zuoyouqiehuan 左右切换
   */
  zuoyouqiehuan: function(endX, startX) {
    //先获取目前处于那个模式，是日常代驾，还是包时代驾，或者包车服务
    let richangdaijia = this.data.richangdaijia; //日常代驾
    let baoshidaijia = this.data.baoshidaijia; //包时代驾
    let baochefuwu = this.data.baochefuwu; //包车服务
    //往左,开始触摸x的位置减去结束的x位置
    if ((startX - endX) == 0) {
      return;
    }
    if ((startX - endX) > 0) {
      console.log("-----------向左")
      if (richangdaijia == 'cur') {
        this.setData({
          richangdaijia: '',
          baoshidaijia: 'cur',
        })
      } else if (baoshidaijia == 'cur') {
        this.setData({
          baoshidaijia: '',
          baochefuwu: 'cur',
        })
      } else if (baochefuwu == 'cur') {
        this.setData({
          baochefuwu: '',
          richangdaijia: 'cur',
        })
      }
    } else {
      console.log("-----------向右")
      if (richangdaijia == 'cur') {
        this.setData({
          richangdaijia: '',
          baochefuwu: 'cur',
        })
      } else if (baoshidaijia == 'cur') {
        this.setData({
          baoshidaijia: '',
          richangdaijia: 'cur',
        })
      } else if (baochefuwu == 'cur') {
        this.setData({
          baochefuwu: '',
          baoshidaijia: 'cur',
        })
      }
    }
  },
  touchStart: function(e) {
    this.setData({
      startX: e.changedTouches[0].clientX, //触摸开始的位置
    });
  },
  touchEnd: function(e) {
    let endX = e.changedTouches[0].clientX; //触摸结束是的位置
    this.zuoyouqiehuan(endX, this.data.startX); //左右切换
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //执行云涵数，获得openid作为id
    wx.cloud.callFunction({
      name: 'login',
      complete: (res) => {
        this.setData({
          isopenid: res.result.openid,
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

    /**
     * 先判断用户是否登录，没有则让用户登录
     */
    console.log("-------------登录", this.data.isopenid)
    if (this.data.isopenid) {
      console.log("-------------已经登录")
    } else {
      console.log("-------------没有登录")
    }


  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})