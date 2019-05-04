const db = wx.cloud.database();
const app = getApp();
var setIntervalID;
var setTimeoutID;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shenfenzhengtupian: ['../../../../images/shangchuan.png', '../../../../images/shangchuan.png'], //身份证图片

  },
  /**
   * 上传到云存储方法
   * fan 参数表示正反面
   */
  uploadFileZ: function(res, _this, fan) {
    var kl = _this.data.shenfenzhengtupian[fan][0].length //取保存图片地址的长度
    //把图片上传到云存储
    wx.cloud.uploadFile({
      cloudPath: 'shenfenzheng/' + _this.data.shenfenzhengtupian[fan][0].substring(kl - 51, kl), // 上传至云端的路径
      filePath: _this.data.shenfenzhengtupian[fan][0], // 小程序临时文件路径
      //证件上传到云存储成功
      success: res => {
        // 返回文件 ID
        console.log(res.fileID)
        if (fan) {
          _this.fanmianshangchuandaoyuncuncu();
        } else {
          _this.zhengmianshangchuandaoyuncuncu();
        }

      },
      //证件上传到云存储失败
      fail: res => {
        var tit;
        if (fan == 1) {
          tit = '反面 图片验证失败, 请重新上传！';
        } else {
          tit = '正面 图片验证失败, 请重新上传！';
        }
        wx.showToast({
          title: tit,
          image: "../../../../images/shibai.png",
          duration: 2000
        });
      }
    })
    //上传图片到服务器并识别
    wx.uploadFile({
      url: app.globalData.url + 'shenfengzheng',
      filePath: _this.data.shenfenzhengtupian[fan][0],
      name: 'pictureFile',
      formData: {
        user: _this.data.openid,
        fan: 0, //0 表示正面
      },
      success(res) {
        //  res.data = 姓名-证件号-出生日器，所以用split()分割
        const data = res.data.split("-");
        /**
         * data 是数组，
         * 当长度大于1，表示上传身份证正面，然后返回姓名，证件号
         * 当长度大于1，表示上传身份证反面面，然后返回空
         * 上传成功，先判断是否正面与正面对应(fan 与返回结果来判断)
         */
        if (data.length > 1) {
          //fan = 0 表示正面
          if (fan == 0) {
            if (data[0] == '') {
              wx.showToast({
                title: "请添加正确的正面照！！",
                icon: "none",
                duration: 2000
              });
            } else {
              _this.setData({
                xingming: data[0], //姓名
                shenfengzhenghao: data[1], //身份证号
                chusheng: data[2], //身份证号
                shangchuangzhengmianchengguo: 1, //识别并保存成功为1，失败为0
              })
            }

          } else if (fan == 1) {
            if (data[0] != '') {
              wx.showToast({
                title: "请添加正确的反面照！！",
                icon: "none",
                duration: 2000
              });
            } else {
              _this.setData({
                shangchuangfanmianchengguo: 1, //识别并保存成功为1，失败为0
              })
            }
          }

          console.log(data)
        }



      },
      fail(res) {
        wx.showToast({
          title: "证件出错误了，请从新选择证件上传",
          icon: "none",
          duration: 2000
        });
      }
    })
  },
  //点击选择从哪里选择图片
  chooseImage: function(shenfenzheng) {
    let _this = this;
    wx.showActionSheet({ //参考  https://developers.weixin.qq.com/miniprogram/dev/api/ui/interaction/wx.showActionSheet.html?search-key=%20wx.showActionSheet
      itemList: ['从相册中选择', '拍照'],
      itemColor: "#f7982a",
      success: function(res) {
        if (!res.cancel) {
          if (res.tapIndex == 0) { //tapIndex 获得 点击的按钮顺序
            _this.chooseWxImage('album', shenfenzheng) //设置不同的参数触发下面函数
          } else if (res.tapIndex == 1) {
            _this.chooseWxImage('camera', shenfenzheng)
          }
        }
      }
    })
  },
  chooseWxImage: function(type, shenfenzheng) {
    let _this = this;
    wx.chooseImage({ //从本地相册选择图片或使用相机拍照。
      sizeType: ['original', 'compressed'],
      sourceType: [type], //从chooseImage 里获得点击是哪一个
      success: function(res) {
        //返回保存 tempFilePaths		图片的本地文件路径列表
        let fan = 0;
        if (shenfenzheng == 0) {
          _this.data.shenfenzhengtupian[0] = res.tempFilePaths;
          console.log('_this.data.shenfenzhengtupian[0]-----', _this.data.shenfenzhengtupian[0]);
          fan = 0; //正面
          //上传到云存储
          _this.uploadFileZ(res, _this, fan);
        } else {
          _this.data.shenfenzhengtupian[1] = res.tempFilePaths;
          fan = 1; //反面
          //上传到云存储
          _this.uploadFileZ(res, _this, fan);
        }
        _this.setData({
          shenfenzhengtupian: _this.data.shenfenzhengtupian,
        })

      }
    })
  },
  /**
   * 身份证照片上传正面
   *  通过百度开发平台识别并保存
   * 1.先把图片上传到服务器
   * 2.然后识别
   * 3.保存
   * 4.返回保存路径
   * 5.返回参数
   */
  shangchuanzhengmian: function(e) {
    //当用户重新上传时，shangchuangzhengmianchengguo 置为  0
    this.setData({
      shangchuangzhengmianchengguo: 0, //识别并保存成功为1，失败为0
    })
    // shenfenzheng = 0 表示身份证正面
    this.chooseImage(0);
  },
  /**
   * 身份证照片上传反面
   * 反面不要求识别
   * 1.先把图片上传到服务器
   * 2.然后不要求识别
   * 3.保存
   * 4.返回保存路径
   */
  shangchuanfanmian: function(e) {
    //当用户重新上传时，shangchuangfanmianchengguo 置为  0
    this.setData({
      shangchuangfanmianchengguo: 0, //识别并保存成功为1，失败为0
    })
    // shenfenzheng = 1 表示身份证反面
    this.chooseImage(1);
    //


  },

  //上传提交
  shenfenzhengtijiao: function(e) {
    //判断是否上传证件照
    if (this.data.shenfenzhengtupian[0] == '../../../../images/shangchuan.png') {
      wx.showToast({
        title: "请先上传正面证件照！！",
        icon: "none",
        duration: 2000
      });
      return;
    } else if (this.data.shenfenzhengtupian[1] == '../../../../images/shangchuan.png') {
      wx.showToast({
        title: "请先上传反面证件照！！",
        icon: "none",
        duration: 2000
      });
      return;
    }
    //开启上传显示框
    this.setData({
      showLoading: true,
    })
    setIntervalID = setInterval(function(thiss) {
      console.log("这是上传定时器", thiss.data.fanmianshangchuandaoyuncuncu, thiss.data.zhengmianshangchuandaoyuncuncu, thiss.data.shangchuangzhengmianchengguo, thiss.data.shangchuangfanmianchengguo)
      if (thiss.data.fanmianshangchuandaoyuncuncu == 1 &&
        thiss.data.zhengmianshangchuandaoyuncuncu == 1 &&
        thiss.data.shangchuangzhengmianchengguo == 1 &&
        thiss.data.shangchuangfanmianchengguo == 1) {
        // 切换界面
        thiss.setData({
          shenfenzhengtijiao: 0, // 为0 隐藏
          showxinxi: 1, // 为1 显示
          showLoading: false, //关闭上传显示加载
        })
      }
    }, 1000, this);

    //定时十秒后判断是否上传切换，若没有则提醒用户重新
     setTimeoutID = setTimeout(function(thiss) {
      //关闭自动定时器
      clearTimeout(setIntervalID);
      //到达时间没有切换页面，给出相应的信息
      if (thiss.data.shenfenzhengtijiao != 0 && thiss.data.showxinxi != 1) {
        wx.showToast({
          title: "图片验证失败,请重新上传",
          image: "../../../../images/shibai.png",
          duration: 2000
        });
        thiss.setData({
          showLoading: false, //关闭上传显示加载
        })
      }
      clearTimeout(setTimeoutID); //取消自己
    }, 10000, this)

  },
  /**
   * 重新上传
   * 
   */
  chongxinchangchuan: function() {
    //清除定时切换，不然点当上传是正确的时候，又会切换页面
    clearTimeout(setIntervalID);
    clearTimeout(setTimeoutID); //取消自己
    this.setData({
      shenfenzhengtijiao: 1, // 为0 隐藏
      showxinxi: 0, // 为1 显示
    })

  },
  /**
   * 确认提交
   */
  shenfensubmitForm: function(e) {

    this.setData({
      showLoading1: true,
    })
    /**
     * 更新到云数据库，修改user表中字段，表示已经实名认证
     */
    //登录成功后，向数据库里面添加一个表，表示用户证件信息
    let thiss = this;
    db.collection('shiming').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        _id: '' + thiss.data.openid,
        xingming: '' + e.detail.value.xingming, //姓名
        shenfengzhenghao: e.detail.value.shenfengzhenghao, //证件号
        spe_i: '已实名认证', //实名认证
      },
      success(res) {
        thiss.setData({
          ifshimingtianjia: 1, //实名添加
        })
      }
    });
    //更新用户表字段
    db.collection('user').doc(thiss.data.openid).update({
      data: {
        spe_i: '已实名认证', //实名认证
        name: e.detail.value.xingming, //姓名
        //获得今年年份，减去出生年份 ，年龄
        age: ((new Date().getFullYear()) - (thiss.data.chusheng.substring(0, 4))),
      },
      success(res) {
        thiss.setData({
          ifusergengxing: 1,
        })

      },
      fail(res) {
        //提示
        wx.showToast({
          title: '更新失败',
          icon: "none",
          duration: 2000
        })
        thiss.setData({
          showLoading1: false,
        })
      }
    });
    //当实名表添加成功时，更新用户表字段
    if (thiss.data.ifshimingtianjia == thiss.data.ifusergengxing) {
      //提示
      wx.showToast({
        title: "你已经成功完成实名认证！！",
        icon: "none",
        duration: 2000
      })
      thiss.setData({
        showLoading1: false,
      })
      //关闭当前页面返回
      wx.navigateBack({
        url: '../redact?openid=' + thiss.data.openid,
      })
    }


  },

  //正面上传成调用函数
  zhengmianshangchuandaoyuncuncu: function() {
    //解决异步
    this.setData({
      zhengmianshangchuandaoyuncuncu: 1, //正面上传到云存储，1表示成功
    })
  },
  //反面上传成调用函数
  fanmianshangchuandaoyuncuncu: function() {
    this.setData({
      fanmianshangchuandaoyuncuncu: 1, //反面上传到云存储，1表示成功
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      openid: options.openid,
      ifSpei: options.ifSpei
    })
    var that = this;
    //已经认证
    if (this.data.ifJiashi != "已实名认证") {
      //提示
      wx.showModal({
        content: '实名认证，完成认证后不可修改',
        confirmText: '确定',
        cancelText: '取消',
        success(res) {
          console.log(res)
          //表示点击了取消
          if (res.confirm == false) {
            //关闭当前页面返回
            wx.navigateBack({
              url: '../redact?openid=' + that.data.openid,
            })
          }
        }
      })
    }

  },




})