const db = wx.cloud.database();
const app = getApp();
var target = 0;//用于分页查询起始位置
var count_ = 0; //查询的记录总数
var userCard =[];// 用户信息卡片
Page({

  /**
   * 页面的初始数据
   */
  data: {
  },

/**
 * 获得数据，获得全局数据
 */
  acquisition() {
    db.collection('user').where({
      showData: true,
    }).count().then(res => {
      count_ = res.total;
    })
    let that = this;
    //查询数据库用户表，获取展示资料卡片的用户，初始显示10条
    db.collection("user").where({
      showData: true,
    })
      .skip(target) // 跳过结果集中的前 10 条，从第 11 条开始返回
      .limit(10) // 限制返回数量为 10 条
      .get().then(user_res => {
        target += 10; //查询完成，分页目标查询加10，表示
        for (let i = 0; i < user_res.data.length; i++) {
          userCard.push(user_res.data[i]);
        }
        that.setData({
          userCard: userCard,
        })
        //加载完成后
        if (target >= count_) {
          that.setData({
            isLoad: true,
          })
        }
      })
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    this.acquisition(); //获得数据

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    target = 0; //全局变量
    this.setData({
      userCard:[]
    })
  },

    /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.acquisition(); //获得数据
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    target = 0; //全局变量
    this.setData({
      userCard:[]
    })
    this.acquisition(); //获得数据

  },
})