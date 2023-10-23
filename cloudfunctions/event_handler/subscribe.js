const cloud = require('wx-server-sdk')

exports.subscribed = async (event, context) => {
    const db = cloud.database()
    const _ = db.command
    const col = db.collection('subscribed_msgs')

    let templateIds = []
    // 若 "List" 只有一个对象，则只返回对象本身；若 "List" 多于一个对象，则返回一个包含所有对象的数组。
    // https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/subscribe-message.html
    if (event.List instanceof Array) {
        for (let i = 0; i < event.List.length; i++) {
            const e = event.List[i];
            if (e.SubscribeStatusString == "accept") {
                templateIds.push(e.TemplateId)
            }
            
        }
    } else {
        templateIds.push(event.List.TemplateId)
    }
    let r = await col.doc(event.FromUserName).update({
        data: {
            templateIds: _.push(templateIds)
        }
    })
    if (!r.stats.updated) {
        r = await col.doc(event.FromUserName).set({
            data: {
                templateIds: templateIds
            }
        })
    }
    return r
}