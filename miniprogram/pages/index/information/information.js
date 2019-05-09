//获得数据库引用
const db = wx.cloud.database();
var informationid; //信息id
var yonghuxinxi; //用户信息 
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
    console.log("-----information 页面----------onLoad（）---------");
    informationid = options.informationid;
    
  },
  /**
   * 
   * 点击接单按钮，实现接单
   * 原理：把订单（daijiadingdan）表中isaccept 更新为 true表示该订单被接单，
   *       保存接单人员的opeind,方便查询
   * @param   e 
   */
  informationJieDan(e) {
    wx.showModal({
      title: '确认接单',
      content: '在接单前确认已和发布者沟通清除，你确认接此单吗？',
      confirmText: '确定',
      cancelText: '取消',
      success(ress) {
        //表示点击了取消
        if (ress.confirm == false) {
          return;
        } else {
          //接单
          db.collection("daijiadingdan").doc(e.currentTarget.dataset.informationid).update({
            data: {
              isaccept: true, //表示被接单
              jiedanren: informationid, //表示此订单被当前用户接单
            }, success(res) {
              wx.showToast({
                title: '接单成功',
                icon: 'success',
                duration: 2000
              });
              getCurrentPages()[getCurrentPages().length - 1].onShow(); //重新页面显示
            }, fail(res) {
              wx.showToast({
                title: '出错了',
                icon: 'fail',
                duration: 2000
              })
            }
          });
        }
      }
    })

  },
  /**
   * 查询详细信息
   *  */
  getinformation() {
    let that = this;
    //用于保存首页查询到的代驾信息
    let information;
    //查询数据库   起始位置
    const _ = db.command;
    console.log("-----getinformation---------执行----------");
    db.collection("daijiadingdan").doc(informationid).get().then(res => {
      console.log("--------------详细信息获取完成---------");
      information = res.data;
      db.collection("user").where({
        _openid: res.data._openid,
      }).get().then(ress => {
        //关闭加载...
        wx.hideLoading()
        yonghuxinxi = ress.data;
        that.setData({
          yonghuxinxi: yonghuxinxi,
          information: information,
        })

      })
    });
  },

  /**
   * 
   * 打开起始位置地图
   * @param  e 
   */
  dakaiqishiweizhiditu(e){
    let latitude=parseFloat(e.currentTarget.dataset.latitude);
   let longitude = parseFloat(e.currentTarget.dataset.longitude);
    wx.openLocation({
      latitude,
      longitude,
      scale: 18
    })

  },
  /**
   * 拨号
   */
  dial(e){
     console.log(e);
     //拨打电话
    wx.makePhoneCall({
      phoneNumber:e.currentTarget.dataset.phone,
    })
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
//根据信息id查询信息
    //显示加载
    wx.showLoading({
      title: '加载中',
      icon: 'loading',
    })
    this.getinformation();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },



  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})