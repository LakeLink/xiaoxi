// 云函数入口文件
const cloud = require('wx-server-sdk')
const dayjs = require('dayjs')

require('dayjs/locale/zh-cn')
dayjs.extend(require('dayjs/plugin/utc'))
dayjs.extend(require('dayjs/plugin/timezone'))
dayjs.locale('zh-cn')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
}) // 使用当前云环境

async function getPreviousDayRank() {
    const db = cloud.database()
    const _ = db.command
    const $ = _.aggregate

    let t2 = dayjs().tz('Asia/Shanghai').subtract(1, 'day').endOf('day'),
        t1 = dayjs().tz('Asia/Shanghai').subtract(1, 'day').startOf('month')
    const r = await db.collection('werun_steps').aggregate().match({
        timestamp: _.and(_.gte(t1.unix()), _.lte(t2.unix()))
    }).group({
        _id: '$user',
        totalSteps: $.sum('$step')
    }).sort({
        totalSteps: -1
    }).limit(10).end()
    return r.list.map((x, idx) => {
        x.rank = idx + 1
        return x
    })
}

async function saveRankCache(p) {
    const db = cloud.database()
    const _ = db.command
    const $ = _.aggregate

    return await db.collection('werun_rank_cache')
        .doc(dayjs().tz('Asia/Shanghai').subtract(1, 'day').endOf('day').unix())
        .set({
            data: p
        })
}

// 云函数入口函数
exports.main = async (event, context) => {
    if (event.Type != 'timer') throw new Error("Bad event.Type")
    if (event.TriggerName == 'saveRankCache') {
        var p = {}
        for (const i of await getPreviousDayRank()) {
            console.log(i)
            p[i._id] = i.rank
        }

        return saveRankCache(p)
    }
}