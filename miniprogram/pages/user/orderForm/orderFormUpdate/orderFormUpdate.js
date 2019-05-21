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
      }
    });
  },

  //点击起始位置图标
  qishiweizhitap: function (e) {
    this.huodeweizhi('qishiweizhi');
  },
  //点击终点位置图标
  zhongdianweizhitap: function (e) {
    this.huodeweizhi('zhongdianweizhi');
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

  //按钮立即下单  即更新按钮
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
    db.collection("daijiadingdan").doc(this.data.daijiadingdanDetail._id).update({
      // data 字段表示需新增的 JSON 数据
      data: {
        qishiweizhi: e.detail.value.qishiweizhi, //起始位置
        zhongdianweizhi: e.detail.value.zhongdianweizhi, //终点位置
        phone: e.detail.value.phone, //联系方式
        time: e.detail.value.time, //预约时间
        tianjiadaijia: tianjiadaijia, //添加代驾
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
        console.log("更新成功", res)
        wx.showToast({
          title: "更新成功！",
          icon: "none",
          duration: 2000
        });
        //返回上一层页面
        wx.navigateBack();
      }, fail(res) {
        console.log("更新失败", res)
        wx.showToast({
          title: "更新失败！",
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
    //提示加载数据
    wx.showLoading({
      title: '加载中',
    })
    console.log("-----------------修改订单", options.detailId)
    //获得传递过来的 detail
    this.setData({
      detailId: options.detailId
    })
  },

  /**
   * 
   * 获得数据 
   */
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

    //获得数据
    this.daijiadingdan();

  },
  //获得数据
  daijiadingdan: function () {
    db.collection('daijiadingdan').doc(this.data.detailId).get().then(res => {
      // res.data 包含该记录的数据
      this.setData({
        daijiadingdanDetail: res.data,
      })
      /**
       * 把订单信息显示在订单添加页面
       * 在这里防止异步
       */
      this.dingdanxianshi();
      //得到数据，关闭加载
      wx.hideLoading();
    })
  },
  /**
   * 订单显示，把数据库获得的数据显示在表单里面
   */
  dingdanxianshi: function () {
    //优先判断是包时订单，包车订单，还是普通订单
    if (this.data.daijiadingdanDetail.baoshidaijia != 'undefined') {
      this.setData({
        baoshidaijia: 'cur',
        baochefuwu: '',
        richangdaijia: '',
      })
    } else if (this.data.daijiadingdanDetail.baochefuwu != 'undefined') {
      this.setData({
        baoshidaijia: '',
        baochefuwu: 'cur',
        richangdaijia: '',
      })
    } else {
      this.setData({
        baoshidaijia: '',
        baochefuwu: '',
        richangdaijia: 'cur',
      })
    }
    ///////////////////////////////////////////////////////////////////////
    //判断时间  time	:	2019年-12月-31日 23:59
    var time_t = this.data.daijiadingdanDetail.time;
    //获得年份
    let year = time_t.substring(0, 4);
    if (year == 2019) {
      year = 0;  //获得下标
    } else if (year == 2020) {
      year = 1;  //获得下标
    } else if (year == 2021) {
      year = 2;  //获得下标
    }
    //判断多少为代驾
    var tianjiadaijia_ = this.data.daijiadingdanDetail.tianjiadaijia;
    console.log('')
    if(tianjiadaijia_=='undefined'){
      tianjiadaijia_ = 1;
    }
    var baoshi = this.data.daijiadingdanDetail.baoshidaijia;
    if (baoshi == '请选择包时时间' || baoshi == "undefined") {
      baoshi = 0;
    } else if (baoshi == '4小时') {
      baoshi = 1;
    } else if (baoshi == '1天') {
      baoshi = 2;
    } else if (baoshi == '2天') {
      baoshi = 3;
    } else if (baoshi == '3天') {
      baoshi = 4;
    } else if (baoshi == '4天') {
      baoshi = 5;
    } else if (baoshi == '5天') {
      baoshi = 6;
    } else if (baoshi == '10天') {
      baoshi = 7;
    }
  
    var baochefuwu_ = this.data.daijiadingdanDetail.baochefuwu;
    if (baochefuwu_ == '选择包车的类型' || baochefuwu_ == "undefined") {
      baochefuwu_ = 0;
    } else if (baochefuwu_ == '经济型小轿车') {
      baochefuwu_ = 1;
    } else if (baochefuwu_ == '舒适型小轿车') {
      baochefuwu_ = 2;
    } else if (baochefuwu_ == '豪华型小轿车') {
      baochefuwu_ = 3;
    } else if (baochefuwu_ == '商务车') {
      baochefuwu_ = 4;
    } else if (baochefuwu_ == '婚礼用车') {
      baochefuwu_ = 5;
    }
    console.log('-----包时---------',baoshi);
    this.setData({
      qishiweizhisuozaidi: this.data.daijiadingdanDetail.qishiweizhi, //起始位置
      zhongdianweizhisuozaidi: this.data.daijiadingdanDetail.zhongdianweizhi,//终点位置
      phone: this.data.daijiadingdanDetail.phone,//电话
      multiIndex: [year, (time_t.substring(6, 8) - 1), (time_t.substring(10, 12) - 1),
        parseInt(time_t.substring(14, 16)), parseInt(time_t.substring(17, 19))],//时间
      daijiarenIndex: parseInt(tianjiadaijia_) - 1, //代驾人数
      baoshiIndex: parseInt(baoshi),
      baocheIndex: parseInt(baochefuwu_),
    })

  }
})