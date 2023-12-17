const cloud = require('wx-server-sdk');
const quickAction = require('./quickAction')
const features = require('./features.js')
const common = require('./common')
const dayjs = common.dayjs

// exports.getTopics = async (event, context) => {
//     return ["三行诗"]
// }

function getTopicValue(label) {
    const t = features.config.post.topics
    for (let i = 0; i < t.length; i++) {
        if (t[i].label == label) return t[i].value
    }
    throw Error(`invalid topic label ${label}`)
}

function getTopicLabel(value) {
    const t = features.config.post.topics
    return t[value].label
}

function getNewVisibilityValue(oldValue) {
    if (oldValue == 'all') return 0
    if (oldValue == 'verified') return 1
    if (oldValue == 'student') return 2
    if (oldValue == 'faculty') return 3
    throw Error(`invalid oldValue ${oldValue}`)
}

function hashCode(s) {
    var hash = 0,
        i, chr;
    if (s.length === 0) return 0;
    for (i = 0; i < s.length; i++) {
        chr = s.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash >= 0 ? hash : -hash;
}

function getAvatarUrlforStagename(s) {
    let avatars = [
        'https://tdesign.gtimg.com/miniprogram/images/avatar1.png',
        'https://tdesign.gtimg.com/miniprogram/images/avatar2.png',
        'https://tdesign.gtimg.com/miniprogram/images/avatar3.png',
        'https://tdesign.gtimg.com/miniprogram/images/avatar4.png',
        'https://tdesign.gtimg.com/miniprogram/images/avatar5.png'
    ]
    return avatars[hashCode(s) % 5]
}

function updatedAtSorter(event, _, $, agg, cond) {
    // filter: get older posts
    if (event.updatedBefore)
        cond.push({
            updatedAt: _.lt(event.updatedBefore),
            pinned: false // pinned posts already displayed
        })

    if (cond.length) agg = agg.match(_.and(cond))
        .sort({
            pinned: -1,
            updatedAt: -1
        })
        .limit(10)
    return agg
}

function votesSorter(event, _, $, agg, cond) {
    if (cond.length) agg = agg.match(_.and(cond))

    agg = agg.lookup({
        from: 'votes',
        let: {
            id: '$_id'
        },
        pipeline: $.pipeline()
            .match(_.expr($.in(['$$id', '$topicIds'])))
            .count('count')
            .done(),
        as: 'votes'
    }).addFields({
        votes: $.arrayElemAt(['$votes', 0])
    }).sort({
        //   pinned: -1,
        'votes.count': -1
    }).limit(features.config.post.sorters[1].limit)

    return agg
}

exports.getPostsV2 = async (event, context) => {
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

    let user = await db.collection('users').doc(OPENID).get().then(r => r.data)

    let agg = col.aggregate()
    // console.log(user)
    let cond = []

    // admin override: no limitation
    if (!user.admin) {
        // verified user
        if (user.verifiedIdentity) {
            cond.push(_.or([{
                    visibilityValue: 0
                },
                {
                    visibilityValue: 1
                },
                {
                    visibilityValue: user.verifiedIdentity == 'student' ? 2 : 3
                },
                {
                    author: OPENID
                }
            ]))
        } else {
            cond.push({
                visibilityValue: 0
            })
        }
    }

    // filter: get certain topic
    if (event.topicValue) {
        cond.push({
            topicValue: event.topicValue
        })
    }

    switch (event.sorterValue) {
        case 0:
            agg = updatedAtSorter(event, _, $, agg, cond)
            break;
        case 1:
            agg = votesSorter(event, _, $, agg, cond)
            break;
        default:
            agg = updatedAtSorter(event, _, $, agg, cond)
            break;
    }


    /*if (event.id) {
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
    }*/

    agg = quickAction.lookupLiked(agg, _, $, OPENID)

    agg = quickAction.lookupUserInfo('author', agg, _, $, OPENID)

    let r = await quickAction.lookupComments(agg, _, $, OPENID).end()

    let lastUnreadPost = null
    common.each(r.list, {
        stagename: true,
        relativeTime: {
            k1: 'updatedAt',
            k2: 'relUpdatedAt'
        },
        adminEdit: user.admin,
        customFunc: (arr, idx) => {
            const e = arr[idx]
            arr[idx].topic = getTopicLabel(e.topicValue)

            if (!event.sorterValue) {
                if (!e.pinned && e.updatedAt > user.lastReadPostAt) {
                    lastUnreadPost = idx
                }
            }
            arr[idx].comments.forEach(c => {
                if (user.admin) {
                    c.canEdit = true
                }
            })
                // e.comments.sort((a, b) => a.when > b.when)
        }
    })

    await db.collection('users').doc(OPENID).update({
        data: {
            lastReadPostAt: dayjs().valueOf()
        }
    })
    return {
        success: true,
        list: r.list,
        lastReadPostAt: user.lastReadPostAt,
        lastUnreadPost
    }
}

exports.getTopicVotes = async (event, context) => {
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

    let user = await db.collection('users').doc(OPENID).get().then(r => r.data)

    let agg = col.aggregate()
    // console.log(user)
    let cond = []

    if (event.topicValue !== 1) throw Error(`votes not enabled for topicValue ${event.topicValue}`)

    cond.push({
        topicValue: event.topicValue
    })

    // admin override: no limitation
    // if (!user.admin) {
    //     // verified user
    //     if (user.verifiedIdentity) {
    //         cond.push(_.or([{
    //                 visibilityValue: 0
    //             },
    //             {
    //                 visibilityValue: 1
    //             },
    //             {
    //                 visibilityValue: user.verifiedIdentity == 'student' ? 2 : 3
    //             },
    //             {
    //                 author: OPENID
    //             }
    //         ]))
    //     } else {
    //         cond.push({
    //             visibilityValue: 0
    //         })
    //     }
    // }

    let t = dayjs().startOf('day').unix()

    return await agg
        .match(_.and(cond))
        .lookup({
            from: 'votes',
            let: {
                id: '$_id'
            },
            pipeline: $.pipeline()
                .match(_.expr($.in(['$$id', '$topicIds'])))
                .project({
                    day: true,
                    user: true
                })
                // .count()
                .done(),
            as: 'votes'
        })
        .sort({
            updatedAt: -1
        })
        .limit(100)
        .project({
            _id: true,
            votes: true
        })
        .end().then(r => {
            r.list.forEach(e => {
                e.hasVoted = false
                e.votes.forEach(v => {
                    if (v.day == t && v.user == OPENID) {
                        e.hasVoted = true
                    }
                });
            });
            return r.list
        })
}

exports.add = async (event, context) => {
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


    let user = await db.collection('users').doc(OPENID).get().then(r => r.data)
    if (event.topic == "三行诗大赛" && !user.verifiedIdentity) {
        return {
            success: false,
            reason: "投稿三行诗需要在“我的”中设置特殊符号，并通过认证。"
        }
    }

    let ok = await cloud.openapi.security.msgSecCheck({
        content: event.text,
        version: 2,
        scene: 4,
        openid: OPENID
    }).then(r => {
        console.log(r)
        return r.result.suggest == 'pass'
    })

    if (!ok) {
        return {
            success: false,
            reason: "似乎文字不太合适，换个说法吧"
        }
    }

    let t = dayjs()

    if (event.visibility) {
        event.visibilityValue = getNewVisibilityValue(event.visibility)
    }

    if (event.topic) {
        event.topicValue = getTopicValue(event.topic)
    }

    const {
        _id
    } = await col.add({
        data: {
            author: OPENID,
            useStagename: event.useStagename ? true : false,
            stagename: event.stagename,
            publishedAt: t.unix(),
            updatedAt: t.valueOf(),
            pinned: false,
            topicValue: event.topicValue,
            visibilityValue: event.visibilityValue,
            textContent: event.text,
            images: [],
            likedBy: [],
            comments: []
        }
    })
    return {
        success: true,
        id: _id
    }
}

exports.remove = async (event, context) => {
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
    try {
        let p = await col.doc(event.id).get().then(r => r.data)
        wx.cloud.deleteFile({
            fileList: p.images
        })
    } catch (error) {

    }

    let success = await col.doc(event.id).remove().then(r => r.stats.removed == 1)
    return {
        success,
        post: null
    }
}

exports.setMedia = async (event, context) => {
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

    let r = await col.doc(event.id).update({
        data: {
            images: event.images
        }
    })

    await cloud.getTempFileURL({
        fileList: event.images
    }).then(r => {

        for (let i = 0; i < r.fileList.length; i++) {
            const e = r.fileList[i];
            cloud.openapi.security.mediaCheckAsync({
                media_url: e.tempFileURL,
                media_type: 2,
                version: 2,
                scene: 4,
                openid: OPENID
            })
        }
    })

    return r.stats.updated == 1
}

exports.pin = async (event, context) => {
    // 获取基础信息
    const {
        ENV,
        OPENID,
        APPID
    } = cloud.getWXContext()
    console.log(OPENID)
    const db = cloud.database()
    const col = db.collection('posts')

    let success = await col.doc(event.id).update({
        data: {
            pinned: event.pin
        }
    }).then(r => r.stats.updated == 1)
    return {
        success
    }
}

exports.like = async (event, context, undo) => {
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

    if (undo) {
        await col.doc(event.id)
            .update({
                data: {
                    likedBy: _.pull(OPENID)
                }
            })
    } else {
        await col.doc(event.id)
            .update({
                data: {
                    likedBy: _.addToSet(OPENID),
                    updatedAt: dayjs().valueOf()
                }
            })
    }



    return await quickAction.lookupLiked(await col.aggregate().match({
        _id: event.id
    }), _, $, OPENID).end().then(r => r.list[0])
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
    const col = db.collection('comments')
    const _ = db.command
    const $ = _.aggregate

    let suggest = await cloud.openapi.security.msgSecCheck({
        content: event.content,
        version: 2,
        scene: 2,
        openid: OPENID
    }).then(r => r.result.suggest)

    if (suggest == 'risky') {
        return {
            success: false,
            reason: "似乎文字不太合适，换个说法吧"
        }
    }

    await col.add({
        data: {
            author: OPENID,
            parentId: event.id,
            publishedAt: dayjs().unix(),
            textContent: event.content,
            images: [],
            likedBy: [],
            // subComments: []
        }
    })

    await db.collection('posts').doc(event.id).update({
        data: {
            updatedAt: dayjs().valueOf()
        }
    })

    let agg = await col
        .aggregate()
        .match({
            parentId: event.id
        })

    return {
        success: true,
        comments: await quickAction.lookupUserInfo('author', agg, _, $, OPENID).end().then(r => r.list)
    }
}

exports.undoComment = async (event, context) => {
    // 获取基础信息
    const {
        ENV,
        OPENID,
        APPID
    } = cloud.getWXContext()
    console.log(OPENID)
    const db = cloud.database()
    const col = db.collection('comments')
    const _ = db.command
    const $ = _.aggregate

    await col.doc(event.cid).remove()

    let agg = col.aggregate().match({
        parentId: event.id
    })

    return {
        success: true,
        comments: await quickAction.lookupUserInfo('author', agg, _, $, OPENID).end().then(r => r.list)
    }
}

exports.vote = async (event, context) => {
    // 获取基础信息
    const {
        ENV,
        OPENID,
        APPID
    } = cloud.getWXContext()
    console.log(OPENID)
    const db = cloud.database()
    const col = db.collection('votes')
    const _ = db.command
    const $ = _.aggregate

    if (dayjs().isAfter(dayjs.tz('2023-12-04 00:00', 'Asia/Shanghai'))) {
        return {
            success: false,
            reason: '嘿！投票结束了哦'
        }
    }

    let t = dayjs().startOf('day').unix()
    try {
        let r = await col.doc(OPENID + '^' + t).get().then(r => r.data)
        if (r.topicIds.length >= 3) {
            return {
                success: false,
                reason: '每天最多投三票哦'
            }
        } else {
            if (r.topicIds.includes(event.id)) {
                return {
                    success: false,
                    reason: '当天不能重复投票哦'
                }
            } else {
                r.topicIds.push(event.id)
                let stats = await col.doc(OPENID + '^' + t).update({
                    data: {
                        topicIds: r.topicIds
                    }
                }).then(r => r.stats)
                if (stats.updated) {
                    await db.collection('posts').doc(event.id).update({
                        data: {
                            updatedAt: dayjs().valueOf()
                        }
                    })
                    return {
                        success: true
                    }
                } else {
                    return {
                        success: false,
                        reason: '数据库错误'
                    }
                }
            }
        }
    } catch (error) {
        console.log(error)
        // 今日第一次投票
        await col.add({
            data: {
                _id: OPENID + '^' + t,
                day: t,
                user: OPENID,
                topicIds: [event.id]
            }
        })
        return {
            success: true
        }
    }
}

exports.undoVote = async (event, context) => {
    // 获取基础信息
    const {
        ENV,
        OPENID,
        APPID
    } = cloud.getWXContext()
    console.log(OPENID)
    const db = cloud.database()
    const col = db.collection('votes')
    const _ = db.command
    const $ = _.aggregate

    let t = dayjs().startOf('day').unix()
    let stats = await col.doc(OPENID + '^' + t).update({
        data: {
            topicIds: _.pull(event.id)
        }
    }).then(r => r.stats)

    if (stats.updated) {
        return {
            success: true
        }
    } else {
        return {
            success: false,
            reason: '数据库错误'
        }
    }
}