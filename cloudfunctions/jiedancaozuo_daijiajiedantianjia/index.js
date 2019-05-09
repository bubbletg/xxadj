

const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
exports.main = async (event, context) => {
  let information = event.information;
  let openid_ = event.openid_;
  try {
    return await db.collection('daijiajiedan').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        _id: information._id,    //id  自动生成
        qishiweizhi: information.qishiweizhi, //起始位置
        zhongdianweizhi: information.zhongdianweizhi, //终点位置
        phone: information.phone, //联系方式
        time: information.time, //预约时间
        tianjiadaijia: '' + information.tianjiadaijia, //添加代驾
        baochefuwu: '' + information.baochefuwu, //包车服务
        baoshidaijia: '' + information.baoshidaijia, //包时代驾
        qishiweizhilatitude: '' + information.qishiweizhilatitude, //起始位置纬度
        qishiweizhilongitude: '' + information.qishiweizhilongitude, //起始位置经度
        zhongdianweizhilatitude: '' + information.zhongdianweizhilatitude, //终点纬度
        zhongdianweizhilongitude: '' + information.zhongdianweizhilongitude, //终点经度
        ifFinish: false, //表示是否完成
        isaccept: true, //表示是否被接单
        jiedanren: openid_, //表示此订单当前登录用户接单
        daijiajiedanid: '', //接单表的id
        chuangjianshijian: information.chuangjianshijian,//创建时间
      }
    });
  } catch (e) {
    console.error(e)
  }
}
