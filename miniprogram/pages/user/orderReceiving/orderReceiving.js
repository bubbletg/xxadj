//获得数据库引用
const db = wx.cloud.database();
// 订单页面
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderReceivingProceed: 'cur',//默认订单进行中

  },
  orderReceivingUpdate: function (e) {
    console.log("orderReceivingUpdate-------------底部触发。。。。。");

  },

  //导航点击切换
  daohangqiehuan: function (e) {
    let orderReceivingProceed = '';
    let orderReceivingFinish = '';
    let qiehuan = e.currentTarget.dataset.daohangqiehuan; //获得点击传递过的值
    if (qiehuan == 'orderReceivingFinish') {
      orderReceivingFinish = 'cur';
      this.daijiadingdan(true);
    } else {
      orderReceivingProceed = 'cur';
      this.daijiadingdan(false);
    }
    this.setData({
      orderReceivingFinish: orderReceivingFinish,
      orderReceivingProceed: orderReceivingProceed
    })
  },
  /**
   * 
   * 获得数据
   * 因为是接单管理，所以查询条件接单人员是自己的数据
   *  */
  daijiadingdan: function (ifFinish) {
    console.log(this.data.openid,"-----------------")
    //
    db.collection('daijiajiedan').where({
      jiedanren: this.data.openid, //openid 表示当前用户
      ifFinish: ifFinish  //订单是否完成 
    }).get().then(res => {
      // res.data 包含该记录的数据
      if (ifFinish) {
        //完成
        this.setData({
          daijiadingdanFinish: res.data,
        })
      } else {
        //未完成
        this.setData({
          daijiadingdanNoFinish: res.data,
        })
      }
      //得到数据，关闭加载
      wx.hideLoading();
    })
  },

  //删除根据id删除
  orderReceivingDelete: function (e) {
    let that  = this;
    let daijiadingdanNoFinish = that.data.daijiadingdanNoFinish[0];
    //其实是否确定删除
    wx.showModal({
      title: '确认删除',
      content: '订单删除后此单后可在首页或搜索继续添加！',
      confirmText: '确定',
      cancelText: '取消',
      success(res) {
        //表示点击了取消
        if (res.confirm == false) {
          return;
        } else {
          wx.showLoading({
            title:"删除中",
          })
          //先删除（删除接单表），再取消(订单表）。
          db.collection('daijiajiedan').doc(daijiadingdanNoFinish._id).remove({
          }).then(res => {
            //取消订单表，
           //通过云函数更新驾驶dingdan表，因为不同用户更新一个表不可能，只有通过云函数
           wx.cloud.callFunction({
            name: 'jiedancaozuo_daijiadingdangengxin_quexiao',
            data: {
              daijiadingdan_id: daijiadingdanNoFinish.daijiadingdan_id,
            },
            complete: res => { 
              wx.hideLoading();
              wx.showToast({
                title: '取消订单成功！',
                icon: 'success',
                duration: 2000
              })   
                getCurrentPages()[getCurrentPages().length - 1].onShow(); //重新页面显示
            }
          });

          })
        }
      }
    })

  },

  //进入订单详细
  coderFormDetail: function (e) {
    //跳转编辑信息页面
    wx.navigateTo({
      url: 'orderReceivingDetail/orderReceivingDetail?detailId=' + e.currentTarget.dataset.id,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获得传递过来的 openid
    this.setData({
      openid: options.openid
    })
    //提示加载数据
    wx.showLoading({
      title: '加载中',
    })


  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log("onShow");
    //获得数据,默认先获得没有完成的
    this.daijiadingdan(false);
    this.daijiadingdan(true);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})