const db = wx.cloud.database();
const app = getApp();
var setIntervalID;
var setTimeoutID;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    jiashizhengtupian: ['../../../../images/shangchuan.png', '../../../../images/shangchuan.png'], //身份证图片

  },
  /**
   * 上传到云存储方法
   * fan 参数表示正反面
   */
  uploadFileZ: function(res, _this, fan) {
    var kl = _this.data.jiashizhengtupian[fan][0].length //取保存图片地址的长度
    //把图片上传到云存储
    wx.cloud.uploadFile({
      cloudPath: 'jiashizheng/' + _this.data.jiashizhengtupian[fan][0].substring(kl - 51, kl), // 上传至云端的路径
      filePath: _this.data.jiashizhengtupian[fan][0], // 小程序临时文件路径
      //证件上传到云存储成功
      success: res => {
        // 返回文件 ID
        console.log("云存储------",res.fileID)
        if (fan) {
          _this.fanmianshangchuandaoyuncuncu(res.fileID);
        } else {
          _this.zhengmianshangchuandaoyuncuncu(res.fileID);
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
      url: app.globalData.url + 'jiashizheng',
      filePath: _this.data.jiashizhengtupian[fan][0],
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
            if (data[2] == '' && data[4] == '') {
              wx.showToast({
                title: "请添加正确的正面照！！",
                icon: "none",
                duration: 2000
              });
            } else {
              _this.setData({
                xingming: data[0], //姓名
                jiashigzhenghao: data[1], //证件号
                begin: data[2], //初次领证日期
                guoji: data[3], //国籍
                youxiaoqixian: data[4].substring(0, 4) + '-' + data[4].substring(4, 6) + '-' + data[4].substring(6, 8), //有效期限开始
                youxiaoqixianzhi: data[5].substring(0, 4) + '-' + data[5].substring(4, 6) + '-' + data[5].substring(6, 8), //有效期结束
                zhunjiachexing: data[6], //准驾车型
                shangchuangzhengmianchengguo: 1, //识别并保存成功为1，失败为0
              })
            }
          } else if (fan == 1) {
            if (data[2] != '' && data[4] != '') {
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
  chooseImage: function(jiashizheng) {
    let _this = this;
    wx.showActionSheet({ //参考  https://developers.weixin.qq.com/miniprogram/dev/api/ui/interaction/wx.showActionSheet.html?search-key=%20wx.showActionSheet
      itemList: ['从相册中选择', '拍照'],
      itemColor: "#f7982a",
      success: function(res) {
        if (!res.cancel) {
          if (res.tapIndex == 0) { //tapIndex 获得 点击的按钮顺序
            _this.chooseWxImage('album', jiashizheng) //设置不同的参数触发下面函数
          } else if (res.tapIndex == 1) {
            _this.chooseWxImage('camera', jiashizheng)
          }
        }
      }
    })
  },
  chooseWxImage: function(type, jiashizheng) {
    let _this = this;
    wx.chooseImage({ //从本地相册选择图片或使用相机拍照。
      sizeType: ['original', 'compressed'],
      sourceType: [type], //从chooseImage 里获得点击是哪一个
      success: function(res) {
        //返回保存 tempFilePaths		图片的本地文件路径列表
        let fan = 0;
        if (jiashizheng == 0) {
          _this.data.jiashizhengtupian[0] = res.tempFilePaths;
          console.log('_this.data.jiashizhengtupian[0]-----', _this.data.jiashizhengtupian[0]);
          fan = 0; //正面
          //上传到云存储
          _this.uploadFileZ(res, _this, fan);
        } else {
          _this.data.jiashizhengtupian[1] = res.tempFilePaths;
          fan = 1; //反面
          //上传到云存储
          _this.uploadFileZ(res, _this, fan);
        }
        _this.setData({
          jiashizhengtupian: _this.data.jiashizhengtupian,
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
    // jiashizheng = 0 表示身份证正面
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
    // jiashizheng = 1 表示身份证反面
    this.chooseImage(1);
  },

  //上传提交
  jiashizhengtijiao: function(e) {
    //全为0表示修改驾驶认证且没有更新
    if (this.data.fanmianshangchuandaoyuncuncu == 0 &&
      this.data.zhengmianshangchuandaoyuncuncu == 0 &&
      this.data.shangchuangzhengmianchengguo == 0 &&
      this.data.shangchuangfanmianchengguo == 0) {
      wx.showToast({
        title: "请先更新证件！！",
        icon: "none",
        duration: 2000
      });
      return;
    } else
      //判断是否上传证件照
      if (this.data.jiashizhengtupian[0] == '../../../../images/shangchuan.png') {
        wx.showToast({
          title: "请先上传正面证件照！！",
          icon: "none",
          duration: 2000
        });
        return;
      } else if (this.data.jiashizhengtupian[1] == '../../../../images/shangchuan.png') {
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
          jiashizhengtijiao: 0, // 为0 隐藏
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
      if (thiss.data.jiashizhengtijiao != 0 && thiss.data.showxinxi != 1) {
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
    }, 30000, this)

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
      jiashizhengtijiao: 1, // 为0 隐藏
      showxinxi: 0, // 为1 显示
    })

  },
  /**
   * 确认提交
   */
  jiashisubmitForm: function(e) {

    this.setData({
      showLoading1: true,
    })
    /**
     * 更新到云数据库，修改user表中字段，表示已经实名认证
     */
    let thiss = this;
    
    /**
     * 由于thiss.data.jiashizhengtupian 中保存的是，缓存图片，所以要修改
     */
    thiss.data.jiashizhengtupian[0]=this.data.zhengmianshangchuandaoyuncuncuImgUrl;
    thiss.data.jiashizhengtupian[1] = this.data.fanmianshangchuandaoyuncuncuImgUrl;
    this.setData({
      jiashizhengtupian: thiss.data.jiashizhengtupian,
    })
    db.collection('jiashi').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        _id: '' + thiss.data.openid,
        xingming: '' + e.detail.value.xingming, //姓名
        jiashigzhenghao: e.detail.value.jiashigzhenghao, //证件号
        guoji: e.detail.value.guoji, //国籍
        youxiaoqixian: e.detail.value.youxiaoqixian, //有效日期
        zhunjiachexing: e.detail.value.zhunjiachexing, //准驾车型
        jiashi: '已驾驶认证', //驾驶认证
        jiashizhengtupian: thiss.data.jiashizhengtupian,   //保存在云存储的图片

      },
      success(res) {
        thiss.setData({
          ifjiashitianjia: 1, //驾驶添加
        })
      }
    });
    //更新用户表字段
    db.collection('user').doc(thiss.data.openid).update({
      data: {
        jiashi: '已驾驶认证', //
        //驾龄
        jialing: thiss.jialingjisuan(),
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
    if (thiss.data.ifjiashitianjia == thiss.data.ifusergengxing) {
      //提示
      wx.showToast({
        title: "你已经成功完成驾驶认证！！",
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
  //驾龄计算
  jialingjisuan: function() {
    // 用当前年月日减去生日年月日
    var yearMinus = (new Date().getFullYear()) - (this.data.begin.substring(0, 4));
    var monthMinus = (new Date().getMonth() + 1) - (this.data.begin.substring(4, 6));
    var dayMinus = (new Date().getDate()) - (this.data.begin.substring(6, 8));
    if (yearMinus == 0 && monthMinus == 0 && dayMinus > 0) {
      return dayMinus + "天";
    } else if (yearMinus == 0 && monthMinus > 0) {
      if (dayMinus > 0) {
        return monthMinus + " 月 " + dayMinus + " 天";
      } else {
        return (monthMinus - 1) + " 月 " + (30 + dayMinus) + " 天";
      }
    } else if (yearMinus >= 0 && monthMinus >= 0) {
      if (dayMinus >= 0) {
        return yearMinus + " 年 " + monthMinus + " 月 " + dayMinus + " 天";
      } else {
        return yearMinus + " 年 " + (monthMinus - 1) + " 月 " + (30 + dayMinus) + " 天";
      }

    } else if (yearMinus >= 0 && monthMinus < 0) {
      if (dayMinus <= 0) {
        return (yearMinus - 1) + " 年 " + (12 + monthMinus) + " 月 " + (30 + dayMinus) + " 天";
      } else {
        return (yearMinus - 1) + " 年 " + (12 + monthMinus) + " 月 " + (dayMinus) + " 天";
      }
    }
  },

  //正面上传成调用函数
  zhengmianshangchuandaoyuncuncu: function (imgUrl) {
    //解决异步
    this.setData({
      zhengmianshangchuandaoyuncuncuImgUrl: imgUrl,  //返回回来的图片地址
      zhengmianshangchuandaoyuncuncu: 1, //正面上传到云存储，1表示成功
    })
  },
  /**
   * 反面上传成调用函数
   */
  fanmianshangchuandaoyuncuncu: function(imgUrl) {
    this.setData({
      fanmianshangchuandaoyuncuncuImgUrl:imgUrl,  //返回回来的图片地址
      fanmianshangchuandaoyuncuncu: 1, //反面上传到云存储，1表示成功
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      openid: options.openid,
      ifJiashi: options.ifJiashi
    })

    var that = this;
    //已经认证
    if (this.data.ifJiashi == "已驾驶认证") {
      wx.showModal({
        content: '你也完成驾驶认证，可以点击图片修改认证信息',
        confirmText: '确定',
        cancelText: '取消',
        success(res) {
          console.log(res)
          //表示点击了取消
          if (res.confirm == false) {
            //关闭当前页面返回
            wx.redirectTo({
              url: '../redact?openid=' + that.data.openid,
            })
          } else {
            //点击确认时,把所有信息清理，然后在上传开始先判断
            that.setData({
              fanmianshangchuandaoyuncuncu: 0,
              zhengmianshangchuandaoyuncuncu: 0,
              shangchuangzhengmianchengguo: 0,
              shangchuangfanmianchengguo: 0
            })
          }
        }
      })
      db.collection('jiashi').doc(that.data.openid).get({
        success(res) {
          that.setData({
            jiashizhengtupian: res.data.jiashizhengtupian,
          })
        }
      })
    }

  },
})