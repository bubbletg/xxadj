// pages/user/user.js
//获得数据库引用
const db = wx.cloud.database();
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
  gengxintouxiang:function(fileID) {
    db.collection('user').doc(this.data.openid).update({
      data: {
        portrait: fileID,
      },
      success(res) {
      },
      fail() {
      }
    });

  },
  /**
   * 
   * 下载头像上传到云存储
   */
  xiazaitouxiang:function(avatarUrl) {
    let that = this;
    //先下载
    wx.downloadFile({
      url: '' + avatarUrl,
      success(res) {
        if (res.statusCode === 200) {
          console.log(res.tempFilePath);
          //下载成功，保存到云存储
          wx.cloud.uploadFile({
            // 指定上传到的云路径
            cloudPath: 'portrait/' + that.data.openid + res.tempFilePath.substring((res.tempFilePath.length) - 5, (res.tempFilePath.length)),
            filePath: res.tempFilePath,
            // 成功回调
            success: res => {
              console.log('上传成功', res.fileID)
              //保存云路径
              that.touxiangFilePath(res.fileID);
            },
          })
        }
      }
    })
  },
  /**
   * 保存上传路径
   */
  touxiangFilePath(fileID) {
    console.log('保存上传路径', fileID)
    this.setData({
      touxiangFilePath: fileID,
    })
    //更新头像
    this.gengxintouxiang(fileID);
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
    }
    //登录成功后通过缓存来设置登录成功标记
    wx.setStorage({
      key: 'dengluchenggong',
      data: 'ture',
    })
    //执行成功  下载头像
    this.xiazaitouxiang(e.detail.userInfo.avatarUrl);
    this.adduser(e);
    // //登录成功后，向数据库里面添加一个表，表示用户信息
    // db.collection('user').add({
    //   // data 字段表示需新增的 JSON 数据
    //   data: {
    //     _id: '' + e.target.dataset.openid,
    //     name: '' + this.data.userInfo.nickName, //默认
    //     username: '' + this.data.userInfo.nickName, //默认
    //     portrait: '' + this.data.touxiangtempFilePath,// 默认头像
    //     phone: '17863273072', //电话
    //     age: '0', //年龄
    //     jialing: '0', //驾龄
    //     suozaidi: '北京', //所在地
    //     spe_i: '未实名认证', //实名认证
    //     jiashi: '未驾驶认证', //驾驶认证
    //     region: ['山东省', '枣庄市', '市中区'],
    //   },
    //   success(res) {
    //     // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
    //     console.log("插入成功", res)
    //   }
    // })
  },
  /**
   * 插入用户信息
   * 
   */

   adduser(e){
    //登录成功后，向数据库里面添加一个表，表示用户信息
    db.collection('user').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        _id: '' + e.target.dataset.openid,
        name: '' + this.data.userInfo.nickName, //默认
        username: '' + this.data.userInfo.nickName, //默认
        portrait: '' + this.data.touxiangtempFilePath,// 默认头像
        phone: '17863273072', //电话
        age: '0', //年龄
        jialing: '0', //驾龄
        suozaidi: '北京', //所在地
        spe_i: '未实名认证', //实名认证
        jiashi: '未驾驶认证', //驾驶认证
        region: ['山东省', '枣庄市', '市中区'],
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
    var that = this;
    /**
     * 获得缓存 dengluchenggong 
     * 值为 ture  表示登录
     * 值为 false  表示没有登录
     */
    wx.getStorage({
      key: 'dengluchenggong',
      success(res) {
        if (res.data == 'ture') {
          console.log("user----------dengluchenggong 登录");
          wx.getUserInfo({
            success(res) {
              //执行成功  下载头像
              that.xiazaitouxiang(res.userInfo.avatarUrl);
              that.setData({
                ifdengluchenggong: 1,
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo,
              })
            }
          })
        }
      },
      /**
      * 没有缓存，表示获取失败，则没有登录过
      */
      fail(res) {
        if (res.data != 'ture') {
          console.log("user----------dengluchenggong 没有登录")
        }
      }
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
  onShow: function () { },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
})