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

    // if (await quickAction.invitedUser(OPENID)) {
        agg = agg.project({
            totalSteps: $.sum('$totalSteps.step'),
            avatarUrl: true,
            nickname: true,
            // realname: true,
            collegeIndex: true,
            bio: true
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
