// pages/add/add.js
const db = wx.cloud.database();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    richangdaijia: "cur", //默认显示日常代驾
    multiArray: [
      ['2019', '2020', '2021'],
      ['01月', '02月', '03月', '04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月'],
      ['01日', '02日', '03日', '04日', '05日', '06日', '07日', '08日', '09日', '10日', '11日', '12日',
        '13日', '14日', '15日', '16日', '17日', '18日', '19日', '20日', '21日', '22日', '23日', '24日',
        '25日', '26日', '27日', '28日', '29日', '30日', '31日'
      ],
      ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12',
        '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'
      ],
      ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12',
        '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25',
        '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38',
        '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51',
        '52', '53', '54', '55', '56', '57', '58', '59'
      ]
    ],
    multiIndex: [0, 0, 0, 0, 0],
    //  daijiarenshuArrayn 代驾人数数组
    daijiarenshuArray: [
      ['1位', '2位', '3位', '4位', '5位', '6位', '7位', '8位', '9位', '10位']
    ],
    daijiarenIndex: 0,
    //包时服务
    baoshiArray: [['请选择包时时间', '4小时', '1天', '2天', '3天', '4天', '5天', '10天']],
    baoshiIndex: 0,
    //包车服务
    baocheArray: [['选择包车的类型', '经济型小轿车', '舒适型小轿车', '豪华型小轿车', '商务车', '婚礼用车']],
    baocheIndex: 0,

  },

  //预约时间 切换调用
  bindMultiPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      multiIndex: e.detail.value
    })
  },
  //添加代驾
  daijiarenPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      daijiarenIndex: e.detail.value
    })
  },
  //包时服务
  baoshiPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      baoshiIndex: e.detail.value
    })
  },
  //包车服务
  baochePickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      baocheIndex: e.detail.value
    })
  },

  //导航点击切换
  daohangqiehuan: function (e) {
    let richangdaijia = ''; //日常代驾
    let baoshidaijia = ''; //包时代驾
    let baochefuwu = ''; //包车服务
    let qiehuan = e.currentTarget.dataset.daohangqiehuan;
    if (qiehuan == 'richangdaijia') {
      richangdaijia = 'cur';
    } else if (qiehuan == 'baoshidaijia') {
      baoshidaijia = 'cur';
    } else if (qiehuan == 'baochefuwu') {
      baochefuwu = 'cur';
    }
    this.setData({
      richangdaijia: richangdaijia,
      baoshidaijia: baoshidaijia,
      baochefuwu: baochefuwu,
    })
  },

  /**
   * 获得位置方法
   * ifqishi 判断起始位置调用还是终点位置调用
   */
  huodeweizhi: function (ifqishi) {
    let thiss = this;
    //获得位置
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function (res) {
        //打开地图获取位置
        wx.chooseLocation({
          success: function (res) {
            //为起始位置
            if (ifqishi == 'qishiweizhi') {
              thiss.setData({
                qishiweizhidizhiName: res.name, //位置名称
                qishiweizhisuozaidi: res.address, //详细地址
                qishiweizhilatitude: res.latitude, //纬度
                qishiweizhilongitude: res.longitude, //经度
              })
            } else {
              //终点位置
              thiss.setData({
                zhongdianweizhidizhiName: res.name, //位置名称
                zhongdianweizhisuozaidi: res.address, //详细地址
                zhongdianweizhilatitude: res.latitude, //纬度
                zhongdianweizhilongitude: res.longitude, //经度
              })
            }
          }
        })
      },
      fail(res) {
        wx.showModal({
          title: '是否需要打开设置页面',
          content: '你也取消授权位置，是否打开设置页面进行授权',
          confirmText: '确定',
          cancelText: '取消',
          success(res) {
            console.log(res)
            //表示点击了取消
            if (res.confirm == false) {
              return;
            } else {
              wx.openSetting({
                success(res) {
                  if (res.authSetting['scope.userLocation']) {
                    thiss.huodeweizhi();
                  }
                }
              })
            }
          }
        })
      }
    });
  },

  //点击起始位置图标
  qishiweizhitap: function (e) {
    this.huodeweizhi('qishiweizhi');
  },
  //点击终点位置图标
  zhongdianweizhitap: function (e) {
    this.huodeweizhi('zhongdianwei');
  },


  //输入验证
  verify: function (e) {
    //验证起始位置是否添加
    if (e.detail.value.qishiweizhi == '') {
      wx.showToast({
        title: "请添加起始位置！",
        icon: "none",
        duration: 2000
      });
      return false;
    }
    //验证手机号码
    if (e.detail.value.phone == '') {
      wx.showToast({
        title: "请添加联系方式!",
        icon: "none",
        duration: 2000
      });
      return false;
    } else if (!(/^1[3578]\d{9}$/.test(e.detail.value.phone))) {
      wx.showToast({
        title: "请添加正确的联系方式!",
        icon: "none",
        duration: 2000
      });
      return false;
    }
    //验证时间
    if (e.detail.value.time == '') {
      wx.showToast({
        title: "请添加预约时间！",
        icon: "none",
        duration: 2000
      });
      return false;
    }
    //验证添加代驾 包车服务 包时代驾
    if (this.data.richangdaijia = 'cur') {
      if (e.detail.value.tianjiadaijia == '') {
        wx.showToast({
          title: "请添加添加代驾人员！",
          icon: "none",
          duration: 2000
        });
        return false;
      }
    }
    if (this.data.baoshidaijia = 'cur') {
      if (e.detail.value.tianjiadaijia == '') {
        wx.showToast({
          title: "请添加添加代驾人员！",
          icon: "none",
          duration: 2000
        });
        return false;
      }
      if (e.detail.value.baoshidaijia == '') {
        wx.showToast({
          title: "请添加包时时间！",
          icon: "none",
          duration: 2000
        });
        return false;
      }
    }
    if (this.data.baochefuwu = 'cur') {
      if (e.detail.value.baochefuwu == '') {
        wx.showToast({
          title: "请添加包车服务类型！",
          icon: "none",
          duration: 2000
        });
        return false;
      }
    }
    return true;

  },

  //按钮立即下单
  lijixiadan: function (e) {
    //验证
    if (!this.verify(e)) {
      //失败
      return;
    }
    console.log("lijixiadan", e)
    let tianjiadaijia = ''; //添加代驾
    let baochefuwu = ''; //包车服务
    let baoshidaijia = ''; //包时代驾
    //当是日常代驾下点击立即下单时
    if (this.data.richangdaijia = 'cur') {
      tianjiadaijia = e.detail.value.tianjiadaijia;
    }
    if (this.data.baoshidaijia = 'cur') {
      tianjiadaijia = e.detail.value.tianjiadaijia;
      baoshidaijia = e.detail.value.baoshidaijia;
    }
    if (this.data.baochefuwu = 'cur') {
      baochefuwu = e.detail.value.baochefuwu;
    }
    let t = new Date(); //获得时间
    //向daijiadingdan表中添加信息
    db.collection("daijiadingdan").add({
      // data 字段表示需新增的 JSON 数据
      data: {
        _id: t,
        qishiweizhi: e.detail.value.qishiweizhi, //起始位置
        zhongdianweizhi: e.detail.value.zhongdianweizhi, //终点位置
        phone: e.detail.value.phone, //联系方式
        time: e.detail.value.time, //预约时间
        tianjiadaijia: '' + tianjiadaijia, //添加代驾
        baochefuwu: '' + baochefuwu, //包车服务
        baoshidaijia: '' + baoshidaijia, //包时代驾
        qishiweizhilatitude: '' + this.data.qishiweizhilatitude, //起始位置纬度
        qishiweizhilongitude: '' + this.data.qishiweizhilongitude, //起始位置经度
        zhongdianweizhilatitude: '' + this.data.zhongdianweizhilatitude, //终点纬度
        zhongdianweizhilongitude: '' + this.data.zhongdianweizhilongitude, //终点经度
        ifFinish: false, //表示是否完成
        chuangjianshijian: [t.getFullYear() + '/' + (t.getMonth() + 1) + '/' + t.getDate(), t.getHours() + ':' + t.getMinutes()]//创建时间
      },
      success(res) {
        //表示下单成功，把id保存到
        console.log("下单成功", res)
        wx.showToast({
          title: "下单成功！",
          icon: "none",
          duration: 2000
        });
      }, fail(res) {
        console.log("下单失败", res)
        wx.showToast({
          title: "下单失败！",
          icon: "none",
          duration: 2000
        });
      }
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
        //获取用户信息
        this.huodeshuju();
      }
    })
  },

  huodeshuju: function (e) {
    console.log("----------addthis.data.openid", this.data.isopenid)
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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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
          console.log("add -------------已经登录")
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
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})