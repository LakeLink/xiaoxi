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

    let filtered = true
    let agg = col.aggregate()
    if (event.id) {
        filtered = false
        agg = agg.match({
            _id: event.id
        })
    } else {
        filtered = !await quickAction.invitedUser(OPENID)
        if (filtered) {
            agg = agg.match({
                _openid: OPENID
            })
        }
    }

    agg = agg.lookup({
        from: 'Users',
        localField: '_openid',
        foreignField: '_id',
        as: 'authorInfo'
    }).sort({
        when: -1
    })

    let r = await quickAction.lookupLikedAndComments(agg, _, $, OPENID).end()

    r.list.forEach(e => {
        e.authorInfo = e.authorInfo[0]
        e.mine = e._openid == OPENID
    })
    r.list.forEach(e => {
        e.comments.forEach(c =>
            c.userIndex = e.commentUserInfo.findIndex(x => x._id == c.author)
        )
        // e.comments.sort((a, b) => a.when > b.when)
    })
    return { list: r.list, filtered }
}

exports.updateStepInfo = async (event, context) => {
    if (!event.weRunData.data) {
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

    let last
    if (r.data.length) last = r.data[0].timestamp
    else last = 0

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
        timestamp: _.gte(Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 30)
    }).match({
        user: OPENID
    }).group({
        _id: null,
        totalSteps: $.sum('$step')
    }).end()
    return r.list[0]
}

exports.rankTotalSteps = async (event, context) => {
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
        timestamp: _.gte(Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 31)
    }).group({
        _id: '$user',
        totalSteps: $.sum('$step')
    }).lookup({
        from: 'Users',
        localField: '_id',
        foreignField: '_id',
        as: 'info'
    }).project({
        info: $.arrayElemAt(['$info', 0]),
        totalSteps: true
    }).sort({
        totalSteps: -1
    }).end()
    return r.list
}