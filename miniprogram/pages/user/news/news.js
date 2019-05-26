const db = wx.cloud.database();
const app = getApp();
var target_ = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
  },
  deletenews:function(e){
    let that = this;
    //给出提示，是否放弃此单
     wx.showModal({
      title: '删除此单',
      content: '删除此单后不可恢复，是否删除？',
      confirmText: '删除',
      cancelText: '取消',
      success(ress_) {
        //表示点击了取消
        if (ress_.confirm == false) {
          getCurrentPages()[getCurrentPages().length - 1].onShow(); //重新页面显示
        } else {
          console.log("-----------",e)
        //删除
        wx.cloud.callFunction({
          name: 'xiaoxicaozuo_gengxin',
          data: {
            _id: e.currentTarget.dataset.andid,
            and:'shanchu', 
          },
          complete: res => { 
            console.log('---删除成功')
            getCurrentPages()[getCurrentPages().length-1].onShow(); //重新页面显示
            //判断是否自己，自己就不发了
            if(app.globalDataOpenid.openid_ != e.currentTarget.dataset.jiedanren){
            //判断是否未放弃，放弃就再发了
            if(e.currentTarget.dataset.ifand == 'fangqi'){
              let t = new Date();
              //插入要发送的信息
              db.collection("news").add({
                data: {
                  fadanren: app.globalDataOpenid.openid_, //下单者id
                  gaunlianId: e.currentTarget.dataset.gaunlianid, //订单号 ,当是点赞时，表示点赞表id
                  jiedanren: e.currentTarget.dataset.jiedanren,  //接单人   ,这里表示接收信息者，也就是发单人
                  newsName: that.data.userInfo.nickName + '放弃接单了', //信息标题
                  newsNameP: that.data.userInfo.avatarUrl,//头像
                  newsContent: '您指定的接单人：' + that.data.userInfo.nickName+' 放弃接单了',//信息内容,
                  chuangjianshijian: t.getFullYear() + '/' + (t.getMonth() + 1) +
                    '/' + t.getDate() + ' ' + t.getHours() + ':' + t.getMinutes(),//创建时间
                  ifdakai: false,//标记是否打开,每一个用户有不同的标签
                  if_and: "fangqi", //值为add 表示代驾,
                }
              }).then(res => {
                //让订单自动完成，云函数操作
                wx.cloud.callFunction({
                  name: 'xiaoxicaozuo_gengxin',
                  data: {
                    _id: e.currentTarget.dataset.gaunlianid,
                    and:'fangqijiedan', //表示已读
                  },
                  complete: res => { 
                    console.log('---更新成功')
                    getCurrentPages()[getCurrentPages().length-1].onShow(); //重新页面显示
                  }
                });
                console.log("-----消息发送成功！！！")
              }).catch(res => {
                console.log("-----消息发送成功！！！")
              })
            }
            }
           

          }
        });
        }
      }
    })


  },

  /**
   * 
   * 已读操作
   * @param {} e 
   */
  yidunews:function(e){

    wx.cloud.callFunction({
      name: 'xiaoxicaozuo_gengxin',
      data: {
        _id: e.currentTarget.dataset.andid,
        and:'ifdakai', //表示已读
      },
      complete: res => { 
        console.log('---更新成功')
        getCurrentPages()[getCurrentPages().length-1].onShow(); //重新页面显示
      }
    });
  },

/**
 * 信息详细
 */
  newsDetail:function(e){
    //修改标签，表表示已经读了

    // db.collection('news').doc(e.currentTarget.dataset.andid).update({
    //   data:{
    //     ifdakai:true
    //   }
    // })
    // .then(res=>{
    //     console.log('-更新成功------------',e.currentTarget.dataset.andid)
    // }).catch(res=>{
    //   console.log('-更新失败------------')
    // })
    //用云函数更新
        wx.cloud.callFunction({
          name: 'xiaoxicaozuo_gengxin',
          data: {
            _id: e.currentTarget.dataset.andid,
            and:'ifdakai',
          },
          complete: res => { 
            console.log('---更新成功')
          }
        });

  
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
    }else if(e.currentTarget.dataset.ifand == 'fangqi'){
      //表示放弃
      this.setData({
        fangqi:true,
        fangqiconten:e.currentTarget.dataset.fangqiconten,
      })
    }


  },
  hideModal(){
 //表示放弃
 this.setData({
  fangqi:false,
})
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
    let that = this;
    target_ = 0;
    this.huodeshuju();
    wx.getUserInfo({
      success(res) {
        that.setData({
          userInfo: res.userInfo,
        });
      }
    })
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