/**
 * 接单操作，更新订单表里数据
 */
const cloud = require('./node_modules/wx-server-sdk')
cloud.init()
const db = cloud.database()
const _ = db.command
exports.main = async (event, context) => {
  try {

    return await  db.collection('user').doc(event.userid).update({
      data:{
       pinglunshu: (event.pinglunshu+1), //原来评论数加1
      }
    })
  } catch (e) {
    console.error(e)
  }
}

