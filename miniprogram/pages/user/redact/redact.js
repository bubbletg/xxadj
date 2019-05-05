// pages/user/redact.js
//获得数据库引用
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: '', //用户头像地址
    userInfo: '', //用户名
    name: 'BubbleTg', //姓名
    phone: '17863273072', //电话
    age: '0', //年龄
    jialing: '0', //驾龄
    suozaidi: '北京', //所在地
    spe_i: '未实名认证', //实名认证
    jiashi: '未驾驶认证', //驾驶认证
    region: ['山东省', '枣庄市', '市中区'],
  },

  //打开弹出框
  showModal: function(e) {
    //获得模板显示
    var showName = e.currentTarget.dataset.modal;
    //获得模板标题
    var modalName = e.currentTarget.dataset.modalName;
    //获得修改的值
    var modalValue = e.currentTarget.dataset.modalValue;
    //获得修改的值
    var modalTitle = e.currentTarget.dataset.modalTitle;
    this.setData({
      ifShow: showName,
      modalName: modalName,
      modalValue: modalValue,
      modalTitle: modalTitle
    })
  },
  //关闭弹出框
  closeModal: function(e) {
    this.setData({
      ifShow: null
    })
  },
  //判断是否实名认证
  ifSpei: function(e) {
    if (this.data.spe_i != '未实名认证') {
      //提示
      wx.showToast({
        title: "您已经实名认证！！！不可修改",
        icon: "none",
        duration: 2000
      })
    } else {
      //打开弹窗口修改
      this.showModal(e);
    }
  },
  //判断是否驾驶认证
  ifJiashi: function(e) {
    if (this.data.jiashi != '未驾驶认证') {
      //提示
      wx.showToast({
        title: "您已经驾驶认证！！！不可修改",
        icon: "none",
        duration: 2000
      })
    } else {
      //打开弹窗口修改
      this.showModal(e);
    }
  },
  //修改姓名
  alterName: function(e) {
    //先判断是否实名，并打开修改框
    this.ifSpei(e)
  },
  //修改电话
  alterPhone: function(e) {
    //先打开弹窗口
    this.showModal(e);
  },
  //修改年龄
  alterAge: function(e) {
    //先判断是否实名
    this.ifSpei(e);
  },
  //修改驾龄
  alterJialing: function(e) {
    //先判断是否驾驶认证
    this.ifJiashi(e);
   
  },
  //修改所在地
  alterSuozaidi(e) {
    console.log("修改所在地被点击。。。。。。。。。。", e);
    //更新到数据库
    var thiss = this;
    db.collection('user').doc(this.data.openid).update({
      data: {
        region: e.detail.value
      },
      success(res) {
        //提示
        wx.showToast({
          title: "修改成功！",
          icon: "none",
          duration: 2000
        })
        //刷新
        thiss.huodeshuju();
      }
    });
  },

  //修改实名认证
  alterSpei: function(e) {
    if (this.data.spe_i != '未实名认证') {
      //提示
      wx.showToast({
        title: "您已经实名认证！！",
        icon: "none",
        duration: 2000
      }
      )
      return;
    }else{
      //跳转编辑信息页面
      wx.navigateTo({
        url: 'alterSpei/alterSpei?openid=' + e.currentTarget.dataset.openid + '&ifSpei=' + e.currentTarget.dataset.modalValue,
      })
    }
    
  },
  //修改驾驶认证
  alterJiashi: function(e) {
    //跳转编辑信息页面
    wx.navigateTo({
      url: 'alterJiashi/alterJiashi?openid=' + e.currentTarget.dataset.openid + '&ifJiashi=' + e.currentTarget.dataset.modalValue,
    })
  },


  //更新
  updateAlter: function(e) {
    let modalTitle_ = e.detail.target.dataset.modalTitle;
    /**
     * 修改姓名
     */
    if (modalTitle_ == 'name') {
      //先判断用户是否填写完整
      if (e.detail.value.name == '') {
        //提示
        wx.showToast({
          title: "姓名不能为空",
          icon: "none",
          duration: 2000
        })
        return;
      }
      //当与原始ide数据相等时，不用更新数据库
      if (e.detail.value.name != this.data.modalValue) {
        //更新数据
        var thiss = this;
        db.collection('user').doc(this.data.openid).update({
          data: {

            name: e.detail.value.name
          },
          success(res) {
            //提示
            wx.showToast({
              title: "修改成功！",
              icon: "none",
              duration: 2000
            })
            //刷新
            thiss.huodeshuju();
          }
        });
      }

    }

    /**
     * 修改电话
     */
    if (modalTitle_ == 'phone') {
      //先判断用户是否填写完整
      if (e.detail.value.phone == '') {
        //提示
        wx.showToast({
          title: "电话不能为空",
          icon: "none",
          duration: 2000
        })
        return;
      }
      //当与原始ide数据相等时，不用更新数据库
      if (e.detail.value.phone != this.data.modalValue) {
        //更新具体操作
        var thiss = this;
        db.collection('user').doc(this.data.openid).update({
          data: {
            phone: e.detail.value.phone
          },
          success(res) {
            //提示
            wx.showToast({
              title: "修改成功！",
              icon: "none",
              duration: 2000
            })
            //刷新
            thiss.huodeshuju();
          }
        });
      }

    }

    /**
     * 修改年龄
     */
    if (modalTitle_ == 'age') {
      //先判断用户是否填写完整
      if (e.detail.value.age == '') {
        //提示
        wx.showToast({
          title: "年龄不能为空",
          icon: "none",
          duration: 2000
        })
        return;
      }
      //当与原始ide数据相等时，不用更新数据库
      if (e.detail.value.age != this.data.modalValue) {
        //更新到数据库
        var thiss = this;
        db.collection('user').doc(this.data.openid).update({
          data: {
            age: e.detail.value.age
          },
          success(res) {
            //提示
            wx.showToast({
              title: "修改成功！",
              icon: "none",
              duration: 2000
            })
            //刷新
            thiss.huodeshuju();
          }
        });
      }

    }

    /**
     * 修改驾龄
     */
    if (modalTitle_ == 'jialing') {
      //先判断用户是否填写完整
      if (e.detail.value.jialing == '') {
        //提示
        wx.showToast({
          title: "驾龄不能为空",
          icon: "none",
          duration: 2000
        })
        return;
      }
      //当与原始ide数据相等时，不用更新数据库
      if (e.detail.value.jialing != this.data.modalValue) {
        //更新到数据库
        var thiss = this;
        db.collection('user').doc(this.data.openid).update({
          data: {
            jialing: e.detail.value.jialing
          },
          success(res) {
            //提示
            wx.showToast({
              title: "修改成功！",
              icon: "none",
              duration: 2000
            })
            //刷新
            thiss.huodeshuju();
          }
        });
      }

    }






    //关闭修改框
    this.closeModal();
    //加载更新提示框
    this.setData({
      showLoading: true
    })
    //然后从新加载数据,关闭提示框
    this.setData({
      showLoading: false
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    //判断用户是否把授权关闭了
    wx.getSetting({
      success(res) {
        console.log(res.authSetting)
        //没有授权
        if(!res.authSetting['scope.userInfo']){
          //关闭加载...
          wx.hideLoading();
          //用户关闭授权
          wx.showModal({
            title: '是否需要打开设置页面',
            content: '你也取消获得用户信息，是否打开设置页面进行授权',
            confirmText: '确定',
            cancelText: '取消',
            success(res) {
              console.log(res)
              //表示点击了取消
              if (res.confirm == false) {
                //关闭当前页面
                wx.navigateBack();
              } else {
                wx.openSetting({
                  success(res) {
                    if(res.authSetting['scope.userInfo']){
                      that.huodeshuju(); //获得数据
                    }
                  }
                })
              }
            }
          })
        }
      }
    })
  
    //获得传递过来的 openid
    this.setData({
      openid: options.openid
    })  
 
  },
  huodeshuju: function(e) {
     //显示加载
     wx.showLoading({
      title: '加载中',
      icon: 'loading',
    })
     // 获取用户信息
     wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
              //关闭加载...
              wx.hideLoading()
            }
          })
        }
      }
    })
    var thiss = this;
    //查询数据
    db.collection('user').doc(this.data.openid).get({
      success(res) {
        // res.data 包含该记录的数据
        thiss.setData({
          name: res.data.name, //姓名
          phone: res.data.phone, //电话
          age: res.data.age, //年龄
          jialing: res.data.jialing, //驾龄
          suozaidi: res.data.suozaidi, //所在地
          spe_i: res.data.spe_i, //实名认证
          jiashi: res.data.jiashi, //驾驶认证
          region: res.data.region, //所在地
        })
      }
    })
  },



  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

    this.huodeshuju(); //获得数据
  
   
  },



})