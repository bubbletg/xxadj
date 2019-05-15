// pages/user/news/news.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },


    // ListTouch触摸开始
    ListTouchStart(e) {
      console.log('ListTouch触摸开始',e.touches);
      this.setData({
        ListTouchStart: e.touches[0].pageX,
        ListTouchStartY: e.touches[0].pageY  //
      })
    },
  
    // ListTouch计算方向
    ListTouchMove(e) {
     //判断是是上下滑动还是左右滑动
      if(e.touches[0].pageY-this.data.ListTouchStartY >100 ||this.data.ListTouchStartY - e.touches[0].pageY>100){
        return ;
      }else{
        this.setData({
          ListTouchDirection: e.touches[0].pageX - this.data.ListTouchStart > 0 ? 'right' : 'left'
        })
      }
      
    },
  
    // ListTouch计算滚动
    ListTouchEnd(e) {
      console.log('ListTouch计算滚动',e);
      if (this.data.ListTouchDirection =='left'){
        this.setData({
          modalName: e.currentTarget.dataset.target
        })
      } else {
        this.setData({
          modalName: null
        })
      }
      this.setData({
        ListTouchDirection: null
      })
    },

})