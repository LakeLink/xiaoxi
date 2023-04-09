const cloud = require('wx-server-sdk');

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});

exports.join = async (event, context) => {
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

    let full = false
    // https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-sdk-api/database/command/Command.addToSet.html
    let r = await col.doc(event.id)
        .update({
            data: {
                partners: _.addToSet(OPENID)
            }
        })
    await col.doc(event.id).get().then(r => full = r.data.partners.indexOf(OPENID) + 1 > r.data.limit)
    return {
        r,
        full
    }
};

exports.get = async (event, context) => {
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

    const r = await col.aggregate().addFields({
        // partners: 0,
        limitedPartners: $.slice(['$partners', '$limit']),
        // if size == 0 then error pops up;
        waitList: $.slice(['$partners', '$limit', $.max(1, $.size('$partners'))])
    }).lookup({
        from: 'Users',
        let: {
            p: '$limitedPartners'
        },
        pipeline: $.pipeline().match(_.expr($.in(['$_id', '$$p']))).project({
                nickname: true,
                realname: true,
                avatarUrl: true
            })
            .done(),
        as: 'partnerInfo'
    }).lookup({
        from: 'Users',
        let: {
            p: '$waitList'
        },
        pipeline: $.pipeline().match(_.expr($.in(['$_id', '$$p']))).project({
                nickname: true,
                realname: true,
                avatarUrl: true
            })
            .done(),
        as: 'waitUserInfo'
    }).lookup({
        from: 'Users',
        localField: '_openid',
        foreignField: '_id',
        as: 'host'
    }).lookup({
        from: 'Users',
        let: {
            l: '$likedBy'
        },
        pipeline: $.pipeline().match(_.expr($.in(['$_id', '$$l']))).project({
            nickname: true,
            realname: true,
            avatarUrl: true
        }).done(),
        as: 'likedUserInfo'
    }).lookup({
        from: 'Users',
        let: {
            c: $.map({
                input: '$comments',
                as: 't',
                in: '$$t.author'
            })
        },
        pipeline: $.pipeline().match(_.expr($.in(['$_id', '$$c']))).project({
            nickname: true,
            realname: true,
            avatarUrl: true
        }).done(),
        as: 'commentUserInfo'
    }).addFields({
        alreadyLiked: $.in([OPENID, '$likedBy']),
        unSatisfied: $.gt(['$limit', $.size('$partners')]),
        expired: $.lte(['$scheduledAt', new Date()]),
        alreadyJoined: $.in([OPENID, '$partners'])
    }).sort({
        // 此处存在顺序
        // 过期在后
        expired: 1,
        // 未过期：未满员在前
        unSatisfied: -1,
        // 未过期，未满员，近期（时间值小）在前
        scheduledAt: 1,
        // Not likely to happen: Because `scheduledAt` actually has seconds part
        publishedAt: 1,
    }).project({
        partners: 0 // 不需要重复数据
    }).end()
    console.log(r)
    r.list.forEach(e => e.host = e.host[0])
    r.list.forEach(e => {
        e.comments.forEach(c =>
            c.userIndex = e.commentUserInfo.findIndex(x => x._id == c.author)
        )
        // e.comments.sort((a, b) => a.when > b.when)
    })
    return r.list
}

exports.quit = async (event, context) => {

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

    return (await col.doc(event.id).update({
        data: {
            partners: _.pull(OPENID)
        }
    })).stats
}

exports.like = async (event, context) => {
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

    let r = await col.where(_.and([{
            _id: event.id
        }]))
        .update({
            data: {
                likedBy: _.addToSet(OPENID)
            }
        })

    return r
}

exports.undoLike = async (event, context) => {
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

    let r = await col.doc(event.id).update({
        data: {
            likedBy: _.pull(OPENID)
        }
    })
    return r.stats
}

exports.comment = async (event, context) => {
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

    let r = await col.doc(event.id).update({
        data: {
            comments: _.push({
                author: OPENID,
                content: event.content,
                when: db.serverDate()
            })
        }
    })
    return r.stats
}

