//获得数据库引用
const db = wx.cloud.database();
var informationid; //信息id
var jiedanyonghuxinxi; //接单用户信息 
const app = getApp();
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
   *       jiedanren保存接单人员的opeind,方便查询,daijiajiedanid  是接单的表的id。
   * @param   e 
   */
  informationJieDan(e) {
    console.log("---------informationJieDan执行----------------", this.data);
    //判断是否实名
    if (this.data.jiedanyonghuxinxi.spe_i == '已实名认证') {
      let information = this.data.information;
      //先判断接单是否自己的的单
      if (information._openid == app.globalDataOpenid.openid_) {
        wx.showToast({
          title: '自己不可接自己的订单！',
          icon: '',
          duration: 2000
        })
        return;
      }
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
            wx.showLoading({
              title: '接单中',
            })
            //添加在数据库
            db.collection('daijiajiedan').add({
              // data 字段表示需新增的 JSON 数据
              data: {
                _id: information._id + (new Date()),    //id  用订单表_id + 现在时间表示  
                daijiadingdan_id: information._id, //订单id，表示当前被接的订单
                qishiweizhi: information.qishiweizhi, //起始位置
                zhongdianweizhi: information.zhongdianweizhi, //终点位置
                phone: information.phone, //联系方式
                time: information.time, //预约时间
                tianjiadaijia: '' + information.tianjiadaijia, //添加代驾
                baochefuwu: '' + information.baochefuwu, //包车服务
                baoshidaijia: '' + information.baoshidaijia, //包时代驾
                qishiweizhilatitude: '' + information.qishiweizhilatitude, //起始位置纬度
                qishiweizhilongitude: '' + information.qishiweizhilongitude, //起始位置经度
                zhongdianweizhilatitude: '' + information.zhongdianweizhilatitude, //终点纬度
                zhongdianweizhilongitude: '' + information.zhongdianweizhilongitude, //终点经度
                ifFinish: false, //表示是否完成
                isaccept: true, //表示是否被接单
                jiedanren: app.globalDataOpenid.openid_, //表示此订单当前登录用户接单
                chuangjianshijian: information.chuangjianshijian,//创建时间
              }
            }).then(daijiajiedan_res => {
              console.log("------------daijiajiedanid_" + daijiajiedan_res._id);
              //通过云函数更新驾驶dingdan表，因为不同用户更新一个表不可能，只有通过云函数
              wx.cloud.callFunction({
                name: 'jiedancaozuo_daijiadingdangengxin',
                data: {
                  informationid: information._id,
                  openid_: app.globalDataOpenid.openid_,
                  daijiajiedan_id: daijiajiedan_res._id,
                },
                complete: res => {
                  wx.hideLoading();
                  wx.showModal({
                    title: '完成成功',
                    content: '您已经成功接单，是否切换到接单管理页面？',
                    confirmText: '确定',
                    cancelText: '取消',
                    success(ress_) {
                      //表示点击了取消
                      if (ress_.confirm == false) {
                        getCurrentPages()[getCurrentPages().length - 1].onShow(); //重新页面显示
                      } else {
                        wx.redirectTo({
                          url: '../../user/orderReceiving/orderReceiving?openid=' + app.globalDataOpenid.openid_,
                        })
                      }
                    }
                  })
                }
              });
            })

          }
        }
      })
    } else {
      //没有实名
      wx.showModal({
        title: '实名认证',
        content: '您还没有实名认证，是否进入个人详细实名认证？',
        confirmText: '确定',
        cancelText: '取消',
        success(ress_) {
          //表示点击了取消
          if (ress_.confirm == false) {
            getCurrentPages()[getCurrentPages().length - 1].onShow(); //重新页面显示
          } else {
            wx.redirectTo({
              url: '../../user/redact/redact',
            })
          }
        }
      })
    }


  },

  /**
   * 查询详细信息
   *  */
  // getinformation() {
  //   let that = this;
  //   //用于保存首页查询到的代驾信息
  //   let information;
  //   //查询数据库   起始位置
  //   const _ = db.command;
  //   console.log("-----getinformation---------执行----------");
  //   db.collection("daijiadingdan").doc(informationid).get().then(res => {
  //     console.log("--------------详细信息获取完成---------");
  //     information = res.data;
  //     wx.hideLoading()
  //     that.setData({
  //       jiedanyonghuxinxi: jiedanyonghuxinxi,
  //       information: information,
  //     })

  //   });
  // },
  
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
        _openid: app.globalDataOpenid.openid_,
      }).get().then(ress => {
        //关闭加载...
        wx.hideLoading()
        jiedanyonghuxinxi = ress.data;
        that.setData({
          jiedanyonghuxinxi: jiedanyonghuxinxi,
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
  dakaiqishiweizhiditu(e) {
    let latitude = parseFloat(e.currentTarget.dataset.latitude);
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
  dial(e) {
    console.log(e);
    //拨打电话
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone,
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
    //查询详细信息
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