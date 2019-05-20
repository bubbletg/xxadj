// pages/add/add.js
const db = wx.cloud.database();
const app = getApp();
let dateYear, dateMonth, dateDay, dateHour, dateMinute; //全是变量   年，月，日，小时，分钟。
var xiazaiportraitTup;   //下载头像
var portraitTup;  //保存的头像路径
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
    xuandingren:[],
    tianjiasiji:[],
    tianjiasiji_length:0,

  },
    /**
   * 下单成功，清除所有输入
   */
  qingchuinput(){
    //获取当前时间
    this.getCurrentDate();
    //设置默认下单时间
    this.setData({
      multiIndex: [(dateYear == 2019 ? 0 : (dateYear == 2020) ? 1 : 2), (dateMonth - 1), (dateDay - 1), dateHour, dateMinute],
    })
    this.setData({
      qishiweizhisuozaidi:'',
      zhongdianweizhisuozaidi:'',
      phone:'', 
      daijiarenIndex: 0,
      baoshiIndex: 0,
      baocheIndex: 0,
      xuandingren:[],
      tianjiasiji:[],
      tianjiasiji_length:0,
    })
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
      tianjiasiji:[],  //清空
      xuandingren:[], //清空
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
  //点击电话图标
  phonetap() {
    let that = this;
    wx.showModal({
      title: '默认联系方式',
      content: '默认联系方式可以在个人详细页面修改，你确定使用此 ' + this.data.phone + ' 默认联系方式吗？',
      confirmText: '确定',
      cancelText: '取消',
      success(ress) {
        //表示点击了取消
        if (ress.confirm == false) {
          return;
        } else {
          that.setData({
            ifphone: true,
          })

        }
      }
    })
  },

  /**
   * 
   * 下载头像上传到云存储
   */
  xiazaitouxiang: function (avatarUrl) {
    let that = this;
    //先下载
    wx.downloadFile({
      url: '' + avatarUrl,
      success(res) {
        if (res.statusCode === 200) {
          console.log(res.tempFilePath);
          portraitTup = res.tempFilePath;
        }
      },
      fail(){
        wx.showToast({
          title:'下载失败',
        })
      }
    })
  },
  //输入验证
  verify: function (e) {
    let appointmentDate = this.data.multiArray;
    let appointmentTime = this.data.multiIndex;
    var date1 = new Date(dateYear + "/" + dateMonth + "/" + dateDay + " " + dateHour + ":" + dateMinute);//传入时间格式，不传获取当前时间,结果格式为C
    var time1 = date1.getTime();
    var date2 = new Date(appointmentDate[0][appointmentTime[0]] + "/" + (appointmentTime[1] + 1) + "/"
      + (appointmentTime[2] + 1) + " " + appointmentDate[3][appointmentTime[3]] + ":"
      + appointmentDate[4][appointmentTime[4]]);
    var time2 = date2.getTime();
    console.log("---------------time1=" + time1 + "----------time2=" + time2)

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
    //验证时间，当前时间戳 time1 ，设置的时间戳 time2
    //(time2+60*30*1000) 表示现在设置的时间30分钟的时间戳
    console.log((time2 + (60 * 30 * 1000)) + "----" + time1);
    if ((time2 - time1) <= (60 * 30 * 1000)) {
      wx.showToast({
        title: "时间必须大于当前时间30分钟！",
        icon: "none",
        duration: 2000
      });
      return false;
    } else if ((time2 - time1) > (86400 * 15 * 1000)) {
      // 一天是86400=60*60*24秒   故 15 天前的时间戳为 (86400*15)  承1000表示毫秒
      wx.showToast({
        title: "最长时间为15天！",
        icon: "none",
        duration: 2000
      });
      return false;
    }
    //验证添加代驾 包车服务 包时代驾  
    if (this.data.baoshidaijia = 'cur') {
      if (e.detail.value.baoshidaijia == '请选择包时时间') {
        wx.showToast({
          title: "请选择包时时间！",
          icon: "none",
          duration: 2000
        });
        return false;
      }
    }
    if (this.data.baochefuwu = 'cur') {
      if (e.detail.value.baochefuwu == '请选择包车服务类型') {
        wx.showToast({
          title: "请选择包车服务类型！",
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
    //显示加载
    wx.showLoading({
      title: '预约中',
      icon: 'loading',
    })
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
    let that = this;
    db.collection("daijiadingdan").add({
      // data 字段表示需新增的 JSON 数据
      data: {
        _id: t,
        portrait: '',// 默认头像
        username: '' + this.data.userInfo.nickName, //默认
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
        isaccept: false, //表示是否被接单
        jiedanren: '', //表示此订单被谁接单
        daijiajiedan_id: '', //接单表的id
        zhidingsij: this.data.xuandingren, //指定司机信息id
        chuangjianshijian: [t.getFullYear() + '/' + (t.getMonth() + 1) +
          '/' + t.getDate(), t.getHours() + ':' + t.getMinutes()],//创建时间
      }
    }).then(add_res => {
      console.log("------------add_res",add_res)
      wx.cloud.uploadFile({
        // 指定上传到的云路径
        cloudPath: 'portrait/' + portraitTup.substring(15, (portraitTup.length)),
        filePath: portraitTup,
      }).then(uploadFile_res => {
        console.log('上传成功', uploadFile_res.fileID)
          db.collection("daijiadingdan").doc(add_res._id).update({
            //更新
            data: {
              portrait: uploadFile_res.fileID,
            },
            success: res_ => {
               //关闭加载...
               wx.hideLoading();
              //表示下单成功，把id保存到
              console.log("下单成功", res_)
              //下单成功，清空所有输入
              that.qingchuinput();
              that.setData({
                modalName: 'DialogModal2',
              })
            },
            fail(res_) {
              //关闭加载...
              wx.hideLoading();
              console.log("下单失败", res_)
              wx.showToast({
                title: "下单失败！",
                icon: "none",
                duration: 2000
              });
            }
          })
      }).catch(error => {
        //关闭加载...
        wx.hideLoading();
        console.log("下单失败", res)
        wx.showToast({
          title: "下单失败！",
          icon: "none",
          duration: 2000
        });
      })
    })
  },
  closeModal() {
    //关闭，留在此页
    this.setData({
      modalName: ''
    })
  },
  /**
   * 提示框操作
   */
  hideModal(e) {
    let operation = e.currentTarget.dataset.hidemodal;
    if (operation == 'this' || operation == 'close') {
      this.closeModal();
    } else if (operation == "index") {
      //跳转首页
      wx.switchTab({
        url: '../index/index'
      });
      this.closeModal();

    } else if (operation == "orderForm") {
      //跳转订单管理
      wx.navigateTo({
        url: '../user/orderForm/orderForm?openid=' + app.globalDataOpenid.openid_,
      });
      this.closeModal();
    }else if (operation == "chong") {
      //重新选择代驾人
      let daijiaren = (parseInt(this.data.daijiarenIndex)+1);
      wx.navigateTo({
        //参数代驾多少人
        url:'addYourOwnDriver?daijiaren='+daijiaren,
      })
      this.closeModal();
    }
    else if (operation == "zidongfenpei") {
      //系统自动分配,全部获取的归零
      this.setData({
        xuandingren:[],
        tianjiasiji:[],
        tianjiasiji_length:0,
      })
      this.closeModal();
    }

  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("----------add页面--onLoad生命周期函数-this.data")
      //判断账号是否存在
      db.collection('user').doc(app.globalDataOpenid.openid_).get({
        success(){
          app.globalDataAndLogin.login = true;
        },
        fail(){
          app.globalDataAndLogin.login = false;
          //失败不存在，提示登录
          wx.showModal({
            title: '登录过期',
            content: '登录过期，请重新登录',
            confirmText: '确定',
            cancelText: '取消',
            success(ress) {
              //表示点击了取消
                //切换到添加代驾
                wx.switchTab({
                  url: '../user/user'
                })        
            }
          })
        }
      })
  },

  /**
   * 
   * 获得数据
   */
  huodeshuju: function (openid_) {
    console.log("----------add页面----获得数据方法：")
    var thiss = this;
    //查询数据
    db.collection('user').doc(openid_).get({
      success(res) {
        console.log("----------add页面----获得数据方法：success--------------------", res)
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
      },
      fail() {
        console.log("----------add页面----获得数据方法：fail--------------------")
      }
    });

  },
  /**
   * 获取用户信息
   */
  huoquyonhuxinxi() {
    /**
     * 先根据全局openid_获得用户信息，减少云函数执行
     * 当获取全局失败时，则再次重新执行云函数。
     * 当openid_ 为空时，表示在全局app.js 中获取数据失败，需要重新获取。
     * 当openid_ 为不空时，表示在全局app.js 中获取数据成功，直接获取用户信息。
     */
    let openid_ = app.globalDataOpenid.openid_;
    console.log("------------------------", openid_);
    if (openid_ != '') {
      //获取用户信息
      this.huodeshuju(openid_);
    } else {
      //执行云涵数，获得openid作为id
      wx.cloud.callFunction({
        name: 'login',
        complete: (res) => {
          this.huodeshuju(res.result.openid);
        }
      })
    }
  },
  /**
   * 获得当前时间
   */
  getCurrentDate() {

    let currentDate = new Date();
    //年
    dateYear = currentDate.getFullYear();
    dateMonth = currentDate.getMonth() + 1;
    dateDay = currentDate.getDate();
    dateHour = currentDate.getHours();
    dateMinute = currentDate.getMinutes();
    console.log("当前时间是：" + dateYear + '/' + dateMonth + '/' + dateDay + ' ' + dateHour + ':' + dateMinute);
    //因为是全局变量，不用返回

  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log("----------add页面--onReady生命周期函数")

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log(this.data.xuandingren,+'=xuandingren')
    let that = this;
    console.log("----------add页面--onShow生命周期函数")
    /**
 * 先判断用户是否登录，没有则让用户登录
 */
    wx.getSetting({
      success(res) {
        console.log(res.authSetting)
        //没有授权
        if (!res.authSetting['scope.userInfo']) {
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
        } else {
          wx.getUserInfo({
            success(res) {
              that.xiazaitouxiang(res.userInfo.avatarUrl);
              that.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo,
              })
            }
          })
          //获取用户信息
          that.huoquyonhuxinxi();
        }
      }
    })

   


    // 判断是否子页面（自己挑选时司机页面）返回,大于0 ，表示挑选了司机
    if((this.data.xuandingren).length > 0){
      //初始化调用，默认为空，0
      this.tianjiasiji([],0);
    }else{
    //获取当前时间
    this.getCurrentDate();
    //设置默认下单时间
    this.setData({
      multiIndex: [(dateYear == 2019 ? 0 : (dateYear == 2020) ? 1 : 2), (dateMonth - 1), (dateDay - 1), dateHour, dateMinute],
    })
    }
  },
  /**
   * 自己添加司机按钮，
   * 需求：自己挑选，同意，不在首页显示，不可以被接单，发送信息给特定司机，
   * 司机是否同意，同意，接单完成，不同意，发布到首页，其他司机接单。
   */
  AddYourOwnDriver(){
    let that = this;
    wx.showModal({
      title: '确认自己挑选司机',
      content: '自己挑选司机将会发送信息给司机，不会在首页显示，若司机不同意接单，将为你代驾信息在首页显示',
      confirmText: '确定',
      cancelText: '取消',
      success(res) {
        console.log(res)
        //表示点击了取消
        if (res.confirm == false) {
         return;
        } else {
          let daijiaren = (parseInt(that.data.daijiarenIndex)+1);
          wx.navigateTo({
            //参数代驾多少人
            url:'addYourOwnDriver?daijiaren='+daijiaren,
          })
        }
      }
    })

  },

  /**
   * 自己选的司机
   * tianjiasiji_  暂时保存数据数组，
   * i 递归调用自己下标，作用，获得xuandingren里数据，判断何时停止调用自己
   */
  tianjiasiji(tianjiasiji_,i){
    db.collection('user').doc(this.data.xuandingren[i]).get().then(res=>{
      tianjiasiji_.push(res.data)
      //i = (this.data.xuandingren).length 表示要获取的用户卡片信息查询完成。
      if(i<(this.data.xuandingren).length){
        console.log("----------调用自己---------i="+i)
        i++;
        this.tianjiasiji(tianjiasiji_,i); //调用自己
      }
    })
    this.setData({
      tianjiasiji:tianjiasiji_,
      tianjiasiji_length:tianjiasiji_.length,
    })
  }
})