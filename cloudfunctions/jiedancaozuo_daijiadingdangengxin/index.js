/**
 * 接单操作，更新订单表里数据
 */
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const _ = db.command
exports.main = async (event, context) => {
  let informationid = event.informationid;
  let openid_ = event.openid_;
  try {
    console.log("--------------云函数更新-------------", openid_)
    return await db.collection("daijiadingdan").where({
      _id: informationid
    }).update({
      data: {
        isaccept: true, //表示被接单
        jiedanren: openid_, //表示此订单当前登录用户接单
        daijiajiedan_id:daijiajiedan_id, //接单id，表示当前被接的订单
      }
    })
  } catch (e) {
    console.error(e)
  }
}

