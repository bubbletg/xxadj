// pages/user/user.js
//获得数据库引用
const db = wx.cloud.database();
const app = getApp();
var updatePortrait_ = false;//防止多次执行更新头像
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: '../../images/user-unlogin.png',
    userInfo: '',
  },
  /**
   * 更新头像
   */
  updatePortrait() {
    if (!updatePortrait_) {
      updatePortrait_ = true;//防止多次执行更新头像
      console.log("---------执行一次")
      //先查询当前用户
      db.collection('user').doc(app.globalDataOpenid.openid_).get().then(res => {
        if (res.data.portrait == this.data.avatarUrl) {
          return;
        } else {
          db.collection('user').doc(app.globalDataOpenid.openid_).update({
            data: {
              portrait: this.data.avatarUrl,
            }
          }).then(update_res => {
            console.log("----头像更新成功");
          })
        }
      })

    }

  },
  //登录授权
  onGetUserInfo: function (e) {
    console.log("---点击登录授权---", e)
    var thiss = this;
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo,
        openid: e.target.dataset.openid,

      })
      app.globalDataOpenid.openid_ = e.target.dataset.openid;
    }
    //插入用户信息
    this.adduser(e);
  },

  /**
   * 插入用户信息
   * 
   */

  adduser(e) {
    let currentDate = new Date();
    db.collection('user').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        _id: '' + e.target.dataset.openid,
        name: '' + this.data.userInfo.nickName, //默认
        username: '' + this.data.userInfo.nickName, //默认
        portrait: '' + this.data.userInfo.avatarUrl, //头像地址
        phone: '17863273072', //电话
        age: '0', //年龄
        jialing: '0', //驾龄
        suozaidi: '北京', //所在地
        spe_i: '未实名认证', //实名认证
        jiashi: '未驾驶认证', //驾驶认证
        region: ['山东省', '枣庄市', '市中区'],
        shoucangshu: 0,    //收藏数
        chakanshu: 0,   //查看数
        pinglunshu: 0,  //评论数
        showData: false,
        addDate: currentDate.getFullYear() + '/' + (currentDate.getMonth() + 1) + '/' + currentDate.getDate(),//加入时间
      },
      success(res) {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        console.log("插入成功", res)
      }
    })

  },
  // 点击设置
  setting: function () {
    console.log("---------------setting")
    wx.openSetting()
  },

  //判断是否登录
  ifLongin: function (e) {
    if (this.data.userInfo != '') {
      return true;
    } else {
      return false;
    }

  },
  //cutInterface 切换界面
  cutInterface: function (e) {
    var interfaceZ = '' + e.currentTarget.dataset.interface; //要切换的页面
    var openidZ = '' + e.currentTarget.dataset.openid; //获得openid
    console.log(interfaceZ)
    //先判断是否登录，当是设置，或者关于我们时，则不用判断
    if (interfaceZ == 'setting') {
      return;
    } else if (interfaceZ == 'regard') {
      return;
    } else if (this.ifLongin(e)) {
      //跳转编辑信息页面
      wx.navigateTo({
        url: interfaceZ + '/' + interfaceZ + '?openid=' + openidZ,
      })
    } else {
      wx.showToast({
        title: "请先登录！",
        icon: "none",
        duration: 2000
      });
      return;
    }
  },
  /**
 * 生命周期函数--监听页面加载
 */
  onLoad: function (options) {
    wx.showLoading({
      title: '登录中',
      icon: 'loading',
    })
    //执行云涵数，获得openid作为id
    wx.cloud.callFunction({
      name: 'login',
      complete: (res) => {
        this.setData({
          isopenid: res.result.openid,
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.showLoading({
      title: '刷新中',
      icon: 'loading',
    })
    let that = this;
    if (app.globalDataAndLogin.login) {
      //判断是否登录
      wx.getSetting({
        success(res) {
          console.log(res.authSetting)
          //没有授权
          if (!res.authSetting['scope.userInfo']) {
            //关闭加载...
        wx.hideLoading()
            that.setData({
              avatarUrl: '../../images/user-unlogin.png',
              userInfo: '',
            })
          } else {
            wx.getUserInfo({
              success(res) {
                //关闭加载...
                wx.hideLoading()
                that.setData({
                  avatarUrl: res.userInfo.avatarUrl,
                  userInfo: res.userInfo,
                });
                that.updatePortrait();
              }
            })
          }
        }
      })
       //消息查询，消息是否全部已读
    wx.cloud.database().collection('news').where({
      jiedanren: app.globalDataOpenid.openid_,
      ifdakai: false
    })
      .get().then(res => {
        console.log('------评论查询', res, '长度:' + res.data.length)
        if (res.data.length > 0) {
          this.setData({
            huodexiaoxiifdakai: true,
          })
        }else{
          this.setData({
            huodexiaoxiifdakai: false,
          })
        }
      })
    } else {
      //关闭加载...
      wx.hideLoading()
    }

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
})