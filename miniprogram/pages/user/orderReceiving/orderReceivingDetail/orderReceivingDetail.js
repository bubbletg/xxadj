//获得数据库引用
const db = wx.cloud.database();
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  //获得数据
  daijiajiedan: function () {
    db.collection('daijiajiedan').doc(this.data.detailId).get().then(res => {
      // res.data 包含该记录的数据
      this.setData({
        daijiajiedanDetail: res.data,
      })
      //得到数据，关闭加载
      wx.hideLoading();
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //提示加载数据
    wx.showLoading({
      title: '加载中',
    })
     //获得传递过来的 detail
     this.setData({
      detailId: options.detailId
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.daijiajiedan();
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /**
   * 用户点击完成操作
   */
  wanchengcaozuo: function (e) {
    let that = this;
    wx.showModal({
      title: '确认完成',
      content: '订单完成后不可修改，确认完成了吗？',
      confirmText: '确定',
      cancelText: '取消',
      success(res) {
        //表示点击了取消
        if (res.confirm == false) {
          return;
        } else {
          db.collection('daijiajiedan').doc(that.data.detailId).update({
            data: {
              ifFinish: true
            },
            success(res) {
              getCurrentPages()[getCurrentPages().length - 1].onShow(); //重新页面显示
            }
          })
        }
      }
    })


  },
  /**
   * 用户点击删除时，删除根据id删除
   */
  orderReceivingDelete: function (e) {
  
    let that  = this;
    //其实是否确定删除
    wx.showModal({
      title: '确认删除',
      content: '订单删除后不可恢复，确认删除吗？',
      confirmText: '确定',
      cancelText: '取消',
      success(res) {
        //表示点击了取消
        if (res.confirm == false) {
          return;
        } else {
          //先删除（删除接单表），再取消(订单表）。
            db.collection('daijiajiedan').doc(that.data.detailId).remove({
              success(res) {
                wx.showToast({
                  title: '删除成功！',
                  icon: 'success',
                  duration: 2000
                })
                setTimeout(res=>{
                  //返回上一层页面
                  wx.navigateBack();
                  },2000)
              }
            })
        }
      }
    })

  },
    /**
   * 订单取消
   */
  orderReceivingUpdate:function(e){
    let that  = this;
    let daijiajiedanDetail = that.data.daijiajiedanDetail;
    //其实是否确定删除
    wx.showModal({
      title: '确认取消',
      content: '订单取消后此单后可在首页或搜索继续添加！',
      confirmText: '确定',
      cancelText: '取消',
      success(res) {
        //表示点击了取消
        if (res.confirm == false) {
          return;
        } else {
          wx.showLoading({
            title:"取消中",
          })
          db.collection('daijiajiedan').doc(daijiajiedanDetail._id).remove({
          }).then(res => {
           wx.cloud.callFunction({
            name: 'jiedancaozuo_daijiadingdangengxin_quexiao',
            data: {
              daijiadingdan_id: daijiajiedanDetail.daijiadingdan_id,
            },
            complete: res => { 
              wx.hideLoading();
              wx.showToast({
                title: '取消订单成功！',
                icon: 'success',
                duration: 2000
              })   
              setTimeout(res=>{
                //返回上一层页面
                wx.navigateBack();
                },1000)
            }
          });

          })
        }
      }
    })
  },

})