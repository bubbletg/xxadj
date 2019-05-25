const db = wx.cloud.database();
const app = getApp();
var target_ = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

/**
 * 信息详细
 */
  newsDetail:function(e){
    //修改标签，表表示已经读了

    db.collection('news').doc(this.data.news._id).update({
      data:{
        ifdakai:{[app.globalDataOpenid.openid_]:true},
      }
    })
    .then(res=>{
        console.log('-更新成功------------')
    }).catch(res=>{
      console.log('-更新失败------------')
    })
    console.log("-----newsDetail---",e)
    // 判断是什么信息，订单，评论，还是点赞
    if(e.currentTarget.dataset.ifand =='add'){
      //表示代驾
      //跳转编辑信息页面
    wx.navigateTo({
      url: '../../index/information/information?pages=news&informationid=' + e.currentTarget.dataset.gaunlianid,
    })

    }else if(e.currentTarget.dataset.ifand =='dianzan'){
      //表示点赞
    }else if(e.currentTarget.dataset.ifand =='pinglun'){
      //表示评论
    }


  },

  huodeshuju:function(){
    db.collection('news').where({
      jiedanren:app.globalDataOpenid.openid_,
    }).skip(target_) // 跳过结果集中的前 10 条，从第 11 条开始返回
    .limit(10) // 限制返回数量为 10 条
    .get().then(res=>{
      target_+=10;
      this.setData({
        news:res.data,
        myopenid:app.globalDataOpenid.openid_,
      })
    })
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
    this.huodeshuju();
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    target_ = 0;
    this.huodeshuju();
  },
        /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.huodeshuju();
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