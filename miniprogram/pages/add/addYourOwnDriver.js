const db = wx.cloud.database();
const app = getApp();
var target = 0,pingluntarget = 0;//用于分页查询起始位置
var count_ = 0; //查询的记录总数
var userCard = [];// 用户信息卡片
var userCardUnfold = []; //卡片是否显示
var cheUserCard = []; //卡片是否选中
var pinglun = []; //评论是否展开
var pinglunneirong = []; //评论内容
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cheUserCard:[], //卡片是否选中
    userCardUnfold: [],// 用户卡片展示 
    pinglun:[],
    xuandingren:0,
  },
  /**
   * 点击评论触发
   */
  pinglunTap: function (e) {

    let index = e.currentTarget.dataset.index;
    pinglunneirong = [];
    this.setData({
      pinglunneirong: pinglunneirong,
    })
    //当评论是关闭时候，执行查询，
    if (pinglun[index] == false) {
      //查询评论
      db.collection('pinglun_user').where({
        user_id: e.currentTarget.dataset.userid,
      })
        .get().then(getres => {
          for (let i = 0; i < getres.data.length; i++) {
            pinglunneirong.push(getres.data[i]);
            this.setData({
              pinglunneirong: pinglunneirong,
            })
          }
        });
    }else{
      pinglunneirong = [];
    }
    //把其他打开的评论关闭
    for(let i = 0;i<pinglun.length; i++){
      if(i == index){
         //打开，关闭当前评论
        pinglun[index] = !pinglun[index];
      }else{
        pinglun[i] = false;
      }
     
    }
    this.setData({
      pinglun: pinglun,  //显示评论
    })

  },
  /**
   * 展开用户卡片切换
   */
  userCardUnfoldTap(e) {
    console.log(e)
    let index = e.currentTarget.dataset.index;
    userCardUnfold[index] = !userCardUnfold[index];  //把要展示的卡片设为true
    this.setData({
      userCardUnfold: userCardUnfold,
    })
  },
  /**
   * 
   * 选择触发
   */
  checkboxChangeTap(e){
    let index = e.currentTarget.dataset.index;
 
    cheUserCard[index] = ! cheUserCard[index];
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];  //上一个页面
    if(this.data.daijiaren < this.data.xuandingren){
      let that = this;
      wx.showModal({
        title: '确认代驾司机人数',
        content: '你选择的代驾人数('+ that.data.daijiaren+')与选择代驾司机人数( '+that.data.xuandingren+' )不符合，多个司机不可能代驾一个',
        confirmText: '确定',
        cancelText: '取消',
        success(res) {
            prevPage.data.xuandingren.pop();//删除最后一个元素
          prevPage.setData({
            xuandingren:prevPage.data.xuandingren, 
          })
          let cheUserCard = that.data.cheUserCard;
          cheUserCard[index] = false;
          that.setData({
            cheUserCard: cheUserCard, //让最后选中的取消选择
          })
        }
      })  
    }
  },
  /**
   * 选择是触发
   */
  checkboxChange(e){
    console.log('checkbox发生change事件，携带value值为：', e.detail.value)
    //把选择有多少个保存起来
    
    this.setData({
      xuandingren: e.detail.value.length,
    })
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];  //上一个页面
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      xuandingren:  e.detail.value
    })
    //判断是否多选
    //选定人卡片数不等于代驾人数
    // if(this.data.daijiaren < this.data.xuandingren){
    //   let that = this;
    //   wx.showModal({
    //     title: '确认代驾司机人数',
    //     content: '你选择的代驾人数('+ that.data.daijiaren+')与选择代驾司机人数( '+that.data.xuandingren+' )不符合，多个司机不可能代驾一个',
    //     confirmText: '确定',
    //     cancelText: '取消',
    //     success(res) {
    //       prevPage.setData({
    //         cheUserCard: !that.data.cheUserCard[that.data.cheUserCard_index], //让最后选中的取消选择
    //         xuandingren:  e.detail.value.pop(),//删除最后一个元素
    //       })
    //     }
    //   })  
    // }
  },

  /**
   * 获得数据，获得全局数据
   */
  acquisition() {
    db.collection('user').where({
      showData: true,
    }).count().then(res => {
      count_ = res.total;
    })
    let that = this;
    //查询数据库用户表，获取展示资料卡片的用户，初始显示10条
    db.collection("user").where({
      showData: true,
    })
      .skip(target) // 跳过结果集中的前 10 条，从第 11 条开始返回
      .limit(10) // 限制返回数量为 10 条
      .get().then(user_res => {
        target += 10; //查询完成，分页目标查询加10，表示
        for (let i = 0; i < user_res.data.length; i++) {
          userCard.push(user_res.data[i]);
          userCardUnfold.push(false);  //用于卡片是否展示
          cheUserCard.push(false);  //用于卡片是否选中
          pinglun.push(false);  //用于评论展开与否
        }
        that.setData({
          userCard: userCard,
          userCardUnfold: userCardUnfold,
          pinglun:pinglun,
          cheUserCard:cheUserCard,
        })
        //加载完成后
        if (target >= count_) {
          that.setData({
            isLoad: true,
          })
        }
      })
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      daijiaren:options.daijiaren, //代驾多少人
    })
  

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    target = 0;//用于分页查询起始位置
   userCard = [];// 用户信息卡片
    userCardUnfold = []; //卡片是否显示
    pinglun = [];  //评论是否展开
    cheUserCard = []; //卡片是否选中
    this.setData({
      userCard: userCard,
      userCardUnfold: userCardUnfold,//卡片是否显示
      pinglun:pinglun,
      cheUserCard: cheUserCard, //卡片是否选中
    })
    this.acquisition(); //获得数据
  },

  /**
 * 页面上拉触底事件的处理函数
 */
  onReachBottom: function () {
    this.acquisition(); //获得数据
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    target = 0;//用于分页查询起始位置
    userCard = [];// 用户信息卡片
    userCardUnfold = []; //卡片是否显示
    pinglun =[];
    cheUserCard = []; //卡片是否选中
    this.setData({
      userCard: userCard,
      pinglun:pinglun,
      userCardUnfold: userCardUnfold,//卡片是否显示
      cheUserCard: cheUserCard, //卡片是否选中
    })
    this.acquisition(); //获得数据
  },
  /**
   * 页面卸载触发
   */
  onUnload(){
   //选定人卡片数不等于代驾人数
   if(this.data.daijiaren > this.data.xuandingren){
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];  //上一个页面
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      modalName:  'DialogModal3',
    });
  }
  },

})