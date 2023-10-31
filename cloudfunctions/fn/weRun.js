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

exports.nudge = async (event, context) => {
    const {
        ENV,
        OPENID,
        APPID
    } = cloud.getWXContext()
    console.log(OPENID)
    const db = cloud.database()
    const col = db.collection('werun_nudges')
    const _ = db.command


    let t = dayjs().tz('Asia/Shanghai').startOf('day')
    let r = await col.doc(event.target + '^' + t.unix()).update({
        data: {
            tickledBy: _.addToSet(OPENID)
        }
    })
    if (!r.stats.updated) {
        return {
            success: (await col.doc(event.target + '^' + t.unix()).set({
                data: {
                    target: event.target,
                    tickledBy: [OPENID],
                    startOf: t.unix()
                }
            }).then(r => r.stats.created)) == 1
        }
    } else {
        return {
            success: true
        }
    }
}

exports.postNotice = async (event, context) => {
    const {
        ENV,
        OPENID,
        APPID
    } = cloud.getWXContext()
    console.log(OPENID)
    const db = cloud.database()
    const col = db.collection('werun_notices')
    let sec = await cloud.openapi.security.msgSecCheck({
        content: event.content,
        version: 2,
        scene: 4,
        openid: OPENID
    })

    if (sec.result.suggest !== 'pass') {
        return {
            success: false,
            reason: 'hmm...'
        }
    } else {
        await col.add({
            data: {
                author: OPENID,
                content: event.content,
                when: dayjs().tz('Asia/Shanghai').unix()
            }
        })
        return {
            success: true
        }
    }
}

exports.getNotices = async (event, context) => {
    const db = cloud.database()
    const col = db.collection('werun_notices')
    const _ = db.command
    const $ = _.aggregate
    let t = dayjs().tz('Asia/Shanghai').subtract(3, 'day')
    return await col.aggregate()
        .match({
            when: _.gte(t.unix())
        })
        .lookup({
            from: 'users',
            let: {
                author: '$author'
            },
            pipeline: $.pipeline()
                .match(_.expr($.eq(['$_id', '$$author'])))
                .project({
                    nickname: true
                }).done(),
            as: 'authorInfo'
        })
        .project({
            authorInfo: $.arrayElemAt(['$authorInfo', 0]),
            content: true,
            when: true
        })
        .sort({
            when: -1
        })
        .end().then(r => {
            // console.log(r)
            let a = ["每月排名前三的同学或许有神秘奖励", "每月被拍一拍次数最多的同学或许有神秘奖励"]
            return a.concat(r.list.map(x => `${x.authorInfo.nickname}: "${x.content}"`))
        })
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
    const col = db.collection('werun_steps')
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
    const col = db.collection('werun_steps')
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
    const col = db.collection('users')
    const _ = db.command
    const $ = _.aggregate

    let t = dayjs().tz('Asia/Shanghai').startOf('month')

    let agg = col.aggregate().lookup({
        from: 'werun_steps',
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

    agg = agg.lookup({
        from: 'werun_nudges',
        let: {
            openid: '$_id'
        },
        pipeline: $.pipeline().match(_.and([
            _.expr($.eq(['$target', '$$openid'])),
            {
                startOf: dayjs().tz('Asia/Shanghai').startOf('day').unix()
            }
        ])).project({
            cnt: $.size('$tickledBy')
        }).done(),
        as: 'tickledBy'
    })

    // if (await quickAction.invitedUser(OPENID)) {
    agg = agg.project({
        totalSteps: $.sum('$totalSteps.step'),
        avatarUrl: true,
        nickname: true,
        // realname: true,
        collegeIndex: true,
        bio: true,
        tickledBy: $.arrayElemAt(['$tickledBy.cnt', 0])
    })
    // } else {
    //     agg = agg.project({
    //         totalSteps: $.sum('$totalSteps.step'),
    //         avatarUrl: true,
    //         nickname: true,
    //         realname: true,
    //         collegeIndex: true
    //     })
    // }

    const r = await agg.sort({
        totalSteps: -1
    }).limit(100).end()
    return r.list
}