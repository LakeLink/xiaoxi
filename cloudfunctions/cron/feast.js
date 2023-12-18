const cloud = require('wx-server-sdk')
const dayjs = require('dayjs')
require('dayjs/locale/zh-cn')
dayjs.extend(require('dayjs/plugin/utc'))
dayjs.extend(require('dayjs/plugin/timezone'))
dayjs.locale('zh-cn')

exports.handler = async (event, context) => {
    await updateUserScore()
    await updateFoodScore()
    await updateWindowScore()
}

async function updateUserScore() {
    const db = cloud.database()
    const col = db.collection('feast_ratings')
    const _ = db.command
    const $ = _.aggregate

    let t = dayjs().tz('Asia/Shanghai')

    let r = await col.aggregate().match({
        when: _.gte(t.subtract(21, 'day').unix())
    }).group({
        _id: '$user',
        upVotes: $.sum($.size('$upVotedBy')),
        downVotes: $.sum($.size('$downVotedBy'))
    }).end().then(r => r.list)

    r.forEach(e => {
        db.collection('users').doc(e._id).update({
            data: {
                feast_sigma: 1 - Math.trunc(e.upVotes / 10) * 0.3 + Math.trunc(e.downVotes / 10) * 0.2
            }
        })
    })
}

async function updateFoodScore() {
    const db = cloud.database()
    const col = db.collection('feast_ratings')
    const _ = db.command
    const $ = _.aggregate

    let t = dayjs().tz('Asia/Shanghai')

    let r = await col.aggregate().match({
        when: _.gte(t.subtract(21, 'day').unix()),
        type: 'food'
    }).lookup({
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userInfo'
    }).addFields({
        userInfo: $.arrayElemAt(['$userInfo', 0])
    }).end().then(r => r.list)

    let targetM = {},
        targetP = {};
    r.forEach(e => {
        let y = 1 - Math.trunc((t.unix() - e.when) / 604800) * 0.3

        if (targetM[e.targetId]) targetM[e.targetId] += e.userInfo.feast_sigma * e.taste * y
        else targetM[e.targetId] = e.userInfo.feast_sigma * e.taste * y

        if (targetP[e.targetId]) targetP[e.targetId] += e.userInfo.feast_sigma * y
        else targetP[e.targetId] = e.userInfo.feast_sigma * y
    })

    let tasks = []
    for (const k of Object.keys(targetM)) {
        let r = db.collection('feast_foods').doc(k).update({
            data: {
                score: targetM[k] / targetP[k]
            }
        })
        tasks.push(r)
    }
    await Promise.all(tasks)
}

async function updateWindowScore() {
    const db = cloud.database()
    const col = db.collection('feast_foods')
    const _ = db.command
    const $ = _.aggregate

    let r = await col.aggregate().group({
        _id: '$windowId',
        score: $.avg('$score')
    }).end().then(r => r.list)

    let tasks = []
    r.forEach(e => {
        let r = db.collection('feast_windows').doc(e._id).update({
            data: {
                score: e.score
            }
        })
        tasks.push(r)
    })
    await Promise.all(tasks)
}