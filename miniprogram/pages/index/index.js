//获得数据库引用
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sousuoValue:null,  //搜索框默认
    avatarUrl: '../../images/user-unlogin.png',
    qishiweizhiqiehuan:'cur',//起始位置切换
    zhongdianweizhiqiehuan:'',//终点位置切换
  },

  /**
   * 
   * 搜索位置切换
   */
  weizhiqiehuan:function(e){
    if(e.currentTarget.dataset.weizhiqiehuan=='终点位置'){
      this.setData({
        zhongdianweizhiqiehuan:"cur",
        qishiweizhiqiehuan:"",
      })
    }else{
      this.setData({
        qishiweizhiqiehuan:"cur",
        zhongdianweizhiqiehuan:"",
      })
    }
  },

  /**
   * 进入搜索详细页面
   */
  sousuoxiangxi:function(e){
    let sousuoid=e.currentTarget.dataset.sousuoid;
    
  },

  /**
   * 点击搜索叉叉，删除缓存
   */
  shanchusousuo:function(){
    //删除输入框里面内容
    this.obliterate();
  },
  /**
   * 
   * 清空搜索缓存
   */
  obliterate:function(e){
    this.setData({
      sousuoValue:null,
      zhongdianweizhi:null,
      qishiweizhi:null,
    })

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
            }
          })
        }
      }
    })
  },
  
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    //隐藏清空缓存
    this.obliterate();
  },
  /**
   * 
   * 进入个人详细信息
   */
  xiangxixinxi: function () {
    let that = this;
    /**
     * 先判断用户是否登录，没有则让用户登录
     * 获得缓存 dengluchenggong 
     * 值为 ture  表示登录
     * 值为 false  表示没有登录
     */
    wx.getStorage({
      key: 'dengluchenggong',
      success(res) {
        if (res.data == 'ture') {
          //跳转编辑信息页面
          wx.navigateTo({
            url: '../user/redact/redact?openid=' + that.data.isopenid,
          })

        }
      },

      /**
       * 没有缓存，表示获取失败，则没有登录过
       */
      fail(res) {
        if (res.data != 'ture') {
          console.log("add -------------没有登录")
          wx.showModal({
            title: '请登录',
            content: '您好还没有登录，请先登录再操作！',
            confirmText: '确定',
            cancelText: '取消',
            success(res) {
              console.log(res)
              //表示点击了取消
              if (res.confirm == false) {
                //关闭当前页面返回主界面
                wx.switchTab({
                  url: '../index/index',
                })
              } else {
                //点击确认时,跳转到登录界面
                wx.switchTab({
                  url: '../user/user',
                })
              }
            }
          })
        }
      }
    })

  },
  /**
   * 输入是触发
   */
  shurushichufa: function (e) {
    let sousuo = e.detail.value.trim();
    this.setData({
      sousuoValue:sousuo,
    })
    //为空则不进行操作
    if (sousuo != '') {
      //查询数据库   起始位置
      db.collection("daijiadingdan").where({
        qishiweizhi: {
          $regex: '.*' + sousuo,
          $options: '1'
        },
      }).get().then(res => {
        // res.data 包含该记录的数据
        console.log(res.data)
        this.setData({
          qishiweizhi: res.data,
        })
      })
      //查询数据库   终点位置
      db.collection("daijiadingdan").where({
        zhongdianweizhi: {
          $regex: '.*' + sousuo,
          $options: '1'
        }
      }).get().then(res => {
        // res.data 包含该记录的数据
        console.log(res.data)
        this.setData({
          zhongdianweizhi: res.data,
        })
      })
    } else {
       //隐藏清空缓存
      this.obliterate();
      console.log("--------- 输入是触发-为空---");
      return;
    }

  }
})