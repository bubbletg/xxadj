//获得数据库引用
const db = wx.cloud.database();
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userid:'', //当前订单用户id
    xuanzhedeyonghu:'点击上面用户信息进行评论',  //提示
  },
  //获得数据
  daijiadingdan: function () {
    db.collection('daijiadingdan').doc(this.data.detailId).get().then(res => {
      // res.data 包含该记录的数据
      this.setData({
        daijiadingdanDetail: res.data,
      })
      this.tianjiasiji([],0);
      //得到数据，关闭加载
      wx.hideLoading();
    })
  },
  /**
   * 自己选的司机
   * tianjiasiji_  暂时保存数据数组，
   * i 递归调用自己下标，作用，获得xuandingren里数据，判断何时停止调用自己
   */
  tianjiasiji(tianjiasiji_,i){
    db.collection('user').doc(this.data.daijiadingdanDetail.zhidingsij[i]).get().then(res=>{
      tianjiasiji_.push(res.data)
      //i = (this.data.xuandingren).length 表示要获取的用户卡片信息查询完成。
      if(i<(this.data.daijiadingdanDetail.zhidingsij).length){
        console.log("----------调用自己---------i="+i)
        i++;
        this.tianjiasiji(tianjiasiji_,i); //调用自己
      }
    })
    this.setData({
      tianjiasiji:tianjiasiji_,
      tianjiasiji_length:tianjiasiji_.length,
    })
  },

  /**
   * 评论司机,拉起操作
   */
  pinglunTap:function(){
    //先判断是否完成
    if(this.data.daijiadingdanDetail.ifFinish!=false){
      this.setData({
        sijitanchuang:true,
        pinglunTapFaView:true,
      })
    }else{
      wx.showToast({
        title: '请先完成订单',
        icon:'none',
        duration: 2000
      })
    }
  },
  /**
   * 
   * 选择用户
   */
  xuanzeyonghu:function(e){
    console.log(e.currentTarget.dataset.item);
    let item = e.currentTarget.dataset.item;
    this.setData({
      xuanzhedeyonghu:'你选择的用户是：'+item.username,
      userid:item._id,
    })
  },
  /**
   * 评论司机，提交
   */
  pinglunTapFa:function(e){
    let userid = this.data.userid; //被评价的用户id;
    //先判断用户是否选择司机
    if(userid == ''){
      wx.showToast({
        title: "请选择评论司机",
        icon: "none",
        duration: 2000
      });     
      return;
    }
    //关闭
    this.chankaidaijguanbi();
    wx.showLoading({
      title:"评论中",
    })
    let currentDate = new Date();
    let pinglun_content  =  e.detail.value.pinglun_content;
    //插入数据库，pinglun_user与用户表相连接，存储用户卡片被评论信息
    db.collection("pinglun_user").add({
      data:{
            //id 自动生成
          user_id: userid, //用户卡片id
          content:pinglun_content, //评论内容
          pinglunDate: currentDate.getFullYear()+'/'+(currentDate.getMonth() + 1)+'/'+currentDate.getDate()+' '+currentDate.getHours() + ':' + currentDate.getMinutes(),//评论时间
          pinglunzhe:app.globalDataOpenid.openid_,//评论着 openid
      }
    })
    .then(add_res => {
        //查询
      db.collection('user').doc(userid).get().then(getuserres => {
       //修改用户表 更新数据库，更新被评价的用户被评价的数量
       db.collection('user').doc(userid).update({
         data:{
          pinglunshu: (getuserres.data.pinglunshu+1), //原来评论数加1
         }
       }).then(updateuserres => {
          //关闭加载...
        wx.hideLoading();
        console.log("评论成功", updateuserres)
        wx.showToast({
          title: "评论成功",
          icon: "none",
          duration: 2000
        });     
       })
      }) 
    })
    .catch(error => {
      //关闭加载...
      wx.hideLoading();
      console.log("评论失败", res)
      wx.showToast({
        title: "评论失败！",
        icon: "none",
        duration: 2000
      });
    })
    // 更新数据库，更新被评价的用户被评价的数量

  },
  //点击查看详细代驾司机
  chankaidaij:function(){
    this.setData({
      sijitanchuang:true,
    })
  },
  //关闭点击查看详细代驾司机
  chankaidaijguanbi:function(){
    this.setData({
      pinglunTapFaView:false,
      sijitanchuang:false,
      userid:'', //当前订单用户id
    xuanzhedeyonghu:'点击上面用户信息进行评论',  //提示
    }) 
  }
  ,
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