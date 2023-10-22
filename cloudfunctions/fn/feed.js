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
    const col = db.collection('posts')
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
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'authorInfo'
    }).sort({
        when: -1
    })

    let r = await quickAction.postsLookupLikedAndComments(agg, _, $, OPENID).end()

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
