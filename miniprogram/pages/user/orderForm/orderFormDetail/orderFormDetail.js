//获得数据库引用
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  //获得数据
  daijiadingdan: function () {
    db.collection('daijiadingdan').doc(this.data.detailId).get().then(res => {
      // res.data 包含该记录的数据
      this.setData({
        daijiadingdanDetail: res.data,
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
    console.log("-----------------详细页面", options.detailId)
    //获得传递过来的 detail
    this.setData({
      detailId: options.detailId
    })
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.daijiadingdan();
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
          db.collection('daijiadingdan').doc(that.data.detailId).update({
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
   * 用户点击删除时
   * 
   */
  //删除根据id删除
  orderFromDelete: function (e) {
    let that = this;
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
          db.collection('daijiadingdan').doc(that.data.detailId).remove({
            success(res) {
              wx.showToast({
                title: '删除成功！',
                icon: 'success',
                duration: 1000
              })
              setTimeout(res=>{
                //返回上一层页面
                wx.navigateBack();
                },1000)
            }
          })
        }
      }
    })

  },
  /**
   * 订单修改
   */
  orderFormUpdate:function(e){
    //跳转编辑信息页面
    wx.navigateTo({
      url: '../orderFormUpdate/orderFormUpdate?detailId=' + e.currentTarget.dataset.id,
    })
  },

})