//获得数据库引用
const db = wx.cloud.database();
var informationid; //信息id
var pages;  //表示上一个页面
var jiedanyonghuxinxi; //接单用户信息 
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 放弃此单，原理，当有人放弃此订单时，发送信息给接单人，然后删除此订单，并给出建议
   * 
   * 此为v1.0.0版本不足之处，后期在2.0版本上改正
   */
  fangqicidan:function(e){
    let that = this;
    //给出提示，是否放弃此单
     wx.showModal({
      title: '放弃此单',
      content: '放弃此单后不可恢复，是否放弃？',
      confirmText: '放弃',
      cancelText: '取消',
      success(ress_) {
        //表示点击了取消
        if (ress_.confirm == false) {
          getCurrentPages()[getCurrentPages().length - 1].onShow(); //重新页面显示
        } else {
          let t = new Date();
          //插入要发送的信息
          db.collection("news").add({
            data: {
              fadanren: app.globalDataOpenid.openid_, //下单者id
              gaunlianId: informationid, //订单号 ,当是点赞时，表示点赞表id
              jiedanren: that.data.information._openid,  //接单人   ,这里表示接收信息者
              newsName: that.data.userInfo.nickName + '放弃接单了', //信息标题
              newsNameP: that.data.userInfo.avatarUrl,//头像
              newsContent: '您指定的接单人：' + that.data.userInfo.nickName+' 放弃接单了',//信息内容,  ，该订单自动自动完成，出于安全考虑，建议您指定的代驾司机一个一个指定！
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
                _id: informationid,
                and:'fangqijiedan', //表示已读
              },
              complete: res => { 
                console.log('---更新成功')
                wx.navigateBack();
              }
            });

            console.log("-----消息发送成功！！！")
          }).catch(res => {
            console.log("-----消息发送成功！！！")
          })
        }
      }
    })


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("-----information 页面----------onLoad（）---------");
    informationid = options.informationid;
    pages =options.pages;
    this.setData({
      pages:pages, 
    })

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
          jiedanyonghuxinxi: jiedanyonghuxinxi[0],
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
    let that = this;
    //根据信息id查询信息
    //显示加载
    wx.showLoading({
      title: '加载中',
      icon: 'loading',
    })
    //查询详细信息
    this.getinformation();
    wx.getUserInfo({
      success(res) {
        that.setData({
          userInfo: res.userInfo,
        });
      }
    })
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