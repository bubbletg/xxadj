/**
 * 接单操作，更新订单表里数据
 */
const cloud = require('./node_modules/wx-server-sdk')
cloud.init()
const db = cloud.database()
const _ = db.command
exports.main = async (event, context) => {  
  try {
    //判断是否表示已读更新，还是放弃接单更新订单表示完成
    if(event.and == 'ifdakai'){
      return await db.collection("news").where({
        _id: event._id
      }).update({
        data:{
          ifdakai:true
        }
      })
    }else if(event.and == 'fangqijiedan'){
      return await db.collection("daijiadingdan").where({
        _id: event._id
      }).update({
        data:{
          ifFinish:true //表示完成
        }
      })
    }else if(event.and == 'shanchu'){
      //删除操作
      return await db.collection('news').doc(event._id).remove();
    }
 
  } catch (e) {
    console.error(e)
  }
}

