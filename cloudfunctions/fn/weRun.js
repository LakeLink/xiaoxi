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

exports.updateStepInfo = async (event, context) => {
    if (!event?.weRunData?.data) {
        throw new Error('No WeRunData found')
    }

    // 获取基础信息
    const {
        ENV,
        OPENID,
        APPID
    } = cloud.getWXContext()
    console.log(OPENID)
    const db = cloud.database()
    const col = db.collection('WeRunStepInfo')
    const _ = db.command
    const $ = _.aggregate

    const r = await col.where({
        user: OPENID
    }).orderBy('timestamp', 'desc').limit(1).get()

    const last = r.data?.[0]?.timestamp ?? 0

    for (e of event.weRunData.data.stepInfoList) {
        if (e.timestamp > last) {
            col.add({
                data: {
                    user: OPENID,
                    ...e
                }
            })
        }
    }
}

exports.getTotalSteps = async (event, context) => {
    // 获取基础信息
    const {
        ENV,
        OPENID,
        APPID
    } = cloud.getWXContext()
    console.log(OPENID)
    const db = cloud.database()
    const col = db.collection('WeRunStepInfo')
    const _ = db.command
    const $ = _.aggregate

    const r = await col.aggregate().match({
        user: OPENID
    }).group({
        _id: null,
        totalSteps: $.sum('$step')
    }).end()
    return r.list[0]
}