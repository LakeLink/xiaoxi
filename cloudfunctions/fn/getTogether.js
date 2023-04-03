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

    const r = await col.aggregate().lookup({
        from: 'Users',
        let: {
            // openidList: $.setUnion(['$partners', '$waitList'])
            p: '$partners',
            w: '$waitList'
        },
        pipeline: $.pipeline().match(_.expr($.in(['$_id', '$$p']))).project({
                nickname: true,
                realname: true,
                avatarUrl: true
            })
            .done(),
        as: 'userList'
    }).lookup({
        from: 'Users',
        localField: '_openid',
        foreignField: '_id',
        as: 'host'
    }).addFields({
        unsatisfied: $.gt(['$limit', $.size('$partners')])
    }).sort({
        // 此处存在顺序
        unsatisfied: -1,
        scheduledAt: -1,
        // Not likely to happen: Because `scheduledAt` actually has seconds part
        publishedAt: -1,
    }).end()
    console.log(r)
    return r.list.map(e => {
        e.isFull = e.partners.length >= e.limit
        e.alreadyJoined = e.partners.includes(OPENID) || e.waitList.includes(OPENID)
        e.host = e.host[0]
        return e
    })
}