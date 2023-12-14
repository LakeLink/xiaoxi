const cloud = require('wx-server-sdk')
const dayjs = require('dayjs')
require('dayjs/locale/zh-cn')
dayjs.extend(require('dayjs/plugin/utc'))
dayjs.extend(require('dayjs/plugin/timezone'))
dayjs.locale('zh-cn')

exports.handler = async (event, context) => {
    await updateUserScore()
    await updateFoodScore()
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
                feast_sigma: 1-Math.trunc(e.upVotes/10)*0.3+Math.trunc(e.downVotes/10)*0.2
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
        userInfo: $.arrayElemAt(['$userInfo', 0]),
        y: $.subtract([
            1,
            $.multiply([
                $.floor(
                    $.divide([$.subtract([t.unix(), '$when']), 604800])
                ),
                0.3
            ])
        ])
    }).group({
        _id: '$targetId',
        p: $.sum($.multiply(['$userInfo.feast_sigma', '$y'])),
        m: $.sum($.multiply(['$userInfo.feast_sigma', '$taste', '$y'])),
    }).end()
}
