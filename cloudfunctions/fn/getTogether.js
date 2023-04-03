const cloud = require('wx-server-sdk');

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});

// 获取openId云函数入口函数
exports.main = async (event, context) => {
    // 获取基础信息
    const {
        ENV,
        OPENID,
        APPID
    } = cloud.getWXContext()
    console.log(OPENID)
    const db = cloud.database()
    const col = db.collection('TogetherDetails')
    const _ = db.command
    const $ = _.aggregate

    const r = await col.get()
    console.log(r)
    return r.data.map(e => {
        e.isFull = e.partners.length >= e.limit
        e.alreadyJoined = e.partners.includes(OPENID) || e.waitList.includes(OPENID)
        return e
    })
}