const cloud = require('./node_modules/wx-server-sdk')
cloud.init()
exports.main = async (event, context) => {
   let touser = event.touser;  //接受者id
   let dingdanhao = event.dingdanhao; //订单号
   let xiadanyonghu = event.xiadanyonghu; //下单用户
   let formId = event.formId;
   console.log('----------'+formId+'----'+touser+'--'+dingdanhao+'----'+xiadanyonghu);
  try {
    const result = await cloud.openapi.uniformMessage.send({
      touser: ''+touser,
      weappTemplateMsg:{
        page: 'user/news/news',
        data: {
          keyword1: {
            value: ''+dingdanhao,
          },
          keyword2: {
            value: ''+xiadanyonghu,
          },
        },
        templateId: 'fZpY_wxwZ-u6IVFx8JevC9smBBcbiC2gYSmOSHWlKtA',
      formId: ''+formId,
      emphasisKeyword: 'keyword2.DATA'
      },
  
    })
    console.log(result)
    return result
  } catch (err) {
    console.log(err)
    return err
  }
}