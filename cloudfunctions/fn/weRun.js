const cloud = require('wx-server-sdk');
const quickAction = require('./quickAction')

const dayjs = require('dayjs')

require('dayjs/locale/zh-cn')
dayjs.extend(require('dayjs/plugin/utc'))
dayjs.extend(require('dayjs/plugin/timezone'))
dayjs.locale('zh-cn')

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
        e.comments.forEach(c => {
            c.userIndex = e.commentUserInfo.findIndex(x => x._id == c.author)
            c.canDelete = c.author == OPENID
        })
        // e.comments.sort((a, b) => a.when > b.when)
    })
    return {
        list: r.list,
        filtered
    }
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
        // 等号很重要：最后一天步数可能不全
        // if (e.timestamp >= last) {
            col.doc(OPENID + '^' + e.timestamp).set({
                data: {
                    user: OPENID,
                    ...e
                }
            })
        // }
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

    let t = dayjs().tz('Asia/Shanghai').startOf('month')
    const r = await col.aggregate().match({
        timestamp: _.gte(t.unix())
    }).match({
        user: OPENID
    }).group({
        _id: null,
        totalSteps: $.sum('$step')
    }).end()
    return r.list[0]
}


exports.rankTotalStepsV2 = async (event, context) => {
    // 获取基础信息
    const {
        ENV,
        OPENID,
        APPID
    } = cloud.getWXContext()
    console.log(OPENID)
    const db = cloud.database()
    const col = db.collection('Users')
    const _ = db.command
    const $ = _.aggregate

    let t = dayjs().tz('Asia/Shanghai').startOf('month')

    let agg = col.aggregate().lookup({
        from: 'InvitedUsers',
        let: {
            openid: '$_id'
        },
        pipeline: $.pipeline().match(_.expr(_.eq(['$_id', '$$openid']))).project({
            invited: true
        }).done(),
        as: 'invited'
    }).match({
        'invited.0.invited': true
    }).limit(100).lookup({
        from: 'WeRunStepInfo',
        let: {
            openid: '$_id'
        },
        pipeline: $.pipeline().match(
            _.and([
                _.expr(_.eq(['$user', '$$openid'])),
                {
                    timestamp: _.gte(t.unix())
                }
            ])
        ).project({
            step: true
        }).done(),
        as: 'totalSteps'
    })

    if (await quickAction.invitedUser(OPENID)) {
        agg = agg.project({
            totalSteps: $.sum('$totalSteps.step'),
            avatarUrl: true,
            nickname: true,
            realname: true,
            collegeIndex: true,
            bio: true
        })
    } else {
        agg = agg.project({
            totalSteps: $.sum('$totalSteps.step'),
            avatarUrl: true,
            nickname: true,
            realname: true,
            collegeIndex: true
        })
    }

    const r = await agg.sort({
        totalSteps: -1
    }).end()
    return r.list
}
