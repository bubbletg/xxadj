const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    jiashizhengtupian: ['../../../../images/shangchuan.png', '../../../../images/shangchuan.png'], //身份证图片

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
          fan = 0; //正面
        } else {
          _this.data.jiashizhengtupian[1] = res.tempFilePaths;
          fan = 1; //反面

        }
        _this.setData({
          jiashizhengtupian: _this.data.jiashizhengtupian,
        })
        //上传图片
        wx.uploadFile({
          url: app.globalData.url + 'jiashizheng',
          filePath: _this.data.jiashizhengtupian[fan][0],
          name: 'pictureFile',
          formData: {
            user: _this.data.openid,
            fan: fan,

          },
          success(res) {
            //  res.data = 姓名-证件号-初次领证日期-国籍-有效期限开始-有效期限结束-准驾车型，所以用split()分割
            const data = res.data.split("-");
            if (data.length > 1) {
              //上传成功，
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
              wx.showToast({
                title: "现在上传到验证吧",
                icon: "none",
                duration: 2000
              });
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
      }
    })
  },

  shangchuanzhengmian: function(e) {
    // jiashizheng = 0 表示身份证正面
    this.chooseImage(0);
  },

  shangchuanfanmian: function(e) {
    // jiashizheng = 1 表示身份证反面
    this.chooseImage(1);

    this.setData({
      shangchuangfanmianchengguo: 1, //识别并保存成功为1，失败为0
    })

  },

  jiashizhengtijiao: function(e) {
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
    //判断识别上传是否成功 ,正面与反面相等时成功
    if (this.data.shangchuangzhengmianchengguo == 1 && 1 == this.data.shangchuangfanmianchengguo) {
      //上传证件
      for (let i = 0; i < 2; i++) {
        var kl = this.data.jiashizhengtupian[i][0].length //取保存图片地址的长度
        //把图片上传到云存储
        wx.cloud.uploadFile({
          cloudPath: 'jiashizheng/' + this.data.jiashizhengtupian[i][0].substring(kl - 51, kl), // 上传至云端的路径
          filePath: this.data.jiashizhengtupian[i][0], // 小程序临时文件路径
          //证件上传到云存储成功
          success: res => {
            // 返回文件 ID
            console.log(res.fileID)
            this.data.jiashizhengtupian[i] = res.fileID;
            // 切换界面
            this.setData({
              jiashizhengtijiao: 0, // 为0 隐藏
              showxinxi: 1, // 为1 显示
              showLoading: false, //关闭上传显示加载
              jiashizhengtupian: this.data.jiashizhengtupian,
            })


          },
          //证件上传到云存储失败
          fail: res => {
            wx.showToast({
              title: "正在后台验证图片是否合格！请稍等片刻",
              icon: "none",
              duration: 2000
            });
            this.setData({
              showLoading: false, //关闭上传显示加载
            })
            return;
          }
        })
      }

    } else {
      wx.showToast({
        title: "网络出问题了呢！请稍等片刻",
        icon: "none",
        duration: 2000
      });
      this.setData({
        showLoading: false, //关闭上传显示加载
      })
      return;
    }
  },
  /**
   * 重新上传
   */
  chongxinchangchuan: function() {
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
        jiashizhengtupian: thiss.data.jiashizhengtupian,
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
      wx.redirectTo({
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
        success(res){
          console.log(res)
          //表示点击了取消
          if (res.confirm ==false){
            //关闭当前页面返回
            wx.redirectTo({
              url: '../redact?openid=' + that.data.openid,
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