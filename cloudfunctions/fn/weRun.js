const cloud = require('wx-server-sdk');
const quickAction = require('./quickAction')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});


exports.getFeed = async (event, context) => {
    // 获取基础信息
    const {
        ENV,
        OPENID,
        APPID
    } = cloud.getWXContext()
    console.log(OPENID)
    const db = cloud.database()
    const col = db.collection('WeRunDetails')
    const _ = db.command
    const $ = _.aggregate

    let agg = col.aggregate().lookup({
        from: 'Users',
        localField: '_openid',
        foreignField: '_id',
        as: 'authorInfo'
    })

    let r = await quickAction.lookupLikedAndComments(agg, _, $, OPENID).end()

    r.list.forEach(e => e.authorInfo = e.authorInfo[0])
    r.list.forEach(e => {
        e.comments.forEach(c =>
            c.userIndex = e.commentUserInfo.findIndex(x => x._id == c.author)
        )
        // e.comments.sort((a, b) => a.when > b.when)
    })
    return r.list
}