const cloud = require('wx-server-sdk');
const quickAction = require('./quickAction')
const dayjs = require('dayjs')

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

    // https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-sdk-api/database/command/Command.addToSet.html
    let r = await col.doc(event.id)
        .update({
            data: {
                partners: _.addToSet(OPENID)
            }
        })
    const doc = await col.doc(event.id).get().then(r => r.data)
    // doc.activityIds.forEach(e => {
    //     if (doc.limit < doc.partners.length) {
    //         cloud.openapi.setUpdatableMsg({
    //             activityId: e,
    //             targetState: 1,
    //             templateInfo: {
    //                 parameterList: [{
    //                     name: 'member_count',
    //                     value: r.result.current
    //                 }, {
    //                     name: 'room_limit',
    //                     value: r.result.limit
    //                 }],
    //                 templateInfo: '21B034D08C5615B9889CE362BB957B1EE69A584B'
    //             }
    //         })
    //     } else {
    //         cloud.openapi.setUpdatableMsg({
    //             activityId: e,
    //             targetState: 0,
    //             templateInfo: {
    //                 parameterList: [{
    //                     name: 'member_count',
    //                     value: r.result.current
    //                 }, {
    //                     name: 'room_limit',
    //                     value: r.result.limit
    //                 }],
    //                 templateInfo: '21B034D08C5615B9889CE362BB957B1EE69A584B'
    //             }
    //         })
    //     }
    // });
    return {
        r,
        full: doc.partners.indexOf(OPENID) + 1 > r.limit
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

    const agg = col.aggregate().addFields({
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
    }).addFields({
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
    })

    const r = await quickAction.lookupLikedAndComments(agg, _, $, OPENID).end()

    console.log(r)
    r.list.forEach(e => {
        e.host = e.host[0]
        e.mine = e.host._id == OPENID
    })
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

    const item = await col.doc(event.id).get().then(r => r.data)
    // console.log(item)
    const r = (await col.doc(event.id).update({
        data: {
            partners: _.pull(OPENID)
        }
    })).stats

    if (r.updated && item.partners.length > item.limit && item.partners.indexOf(OPENID) < item.limit) {
        cloud.openapi.subscribeMessage.send({
            templateId: 'Denmjkfh0o9B8LlimVu31V5GooHI2mM64ucAXj_3d1Y',
            page: `pages/feed/together?id=${item._id}`,
            touser: OPENID,
            data: {
                thing2: {
                    value: item.sportsType
                },
                time4: {
                    value: dayjs(item.scheduledAt).format('YYYY/MM/DD HH:mm')
                },
                thing5: {
                    value: item.location
                },
                thing6: {
                    value: '候补成功，您已加入运动队伍'
                }
            }
        })
    }
    return r
}

exports.createActivityId = async (event, context) => {
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

    const r = await cloud.openapi.updatableMessage.createActivityId({
        "openid": OPENID
    })
    console.log(r)
    await col.doc(event.id).update({
        data: {
            activityIds: _.push({
                activityId: r.activityId,
                expirationTime: r.expirationTime
            })
        }
    })
    const doc = await col.doc(event.id).get().then(r => r.data)
    // console.log(doc)
    return {
        activityId: r.activityId,
        limit: doc.limit,
        current: doc.partners.length
    }
}

exports.afterDelete = async (event, context) => {
    console.log(event)
    event.partners.forEach(e => {
        cloud.openapi.subscribeMessage.send({
            templateId: 'qHaLq87tBwA8RWHuAw7ZqW9pETn0pvx_OPYRe4uJN10',
            page: 'pages/feed/together',
            touser: e,
            data: {
                thing1: {
                    value: event.sportsType
                },
                date2: {
                    value: dayjs(event.scheduledAt).format('YYYY/MM/DD HH:mm')
                },
                thing3: {
                    value: event.location
                },
                thing11: {
                    value: '发起者已取消该活动，去看看别的吧'
                }
            }
        })
    })
}