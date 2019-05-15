/**
 * 接单操作，更新订单表里数据
 */
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const _ = db.command
exports.main = async (event, context) => {
  let daijiadingdan_id = event.daijiadingdan_id;
  console.log("-------取消订单更新--------"+daijiadingdan_id)
  try {
    return await db.collection("daijiadingdan").where({
      _id: daijiadingdan_id
    }).update({
      data: {
        isaccept: false, //表示被接单
        jiedanren: '', //表示此订单当前登录用户接单
        daijiajiedan_id:'', //接单id，表示当前被接的订单
      }
    })
  } catch (e) {
    console.error(e)
  }
}

