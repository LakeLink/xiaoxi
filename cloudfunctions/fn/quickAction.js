const cloud = require('wx-server-sdk');

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});

// exports.invitedUser = async (id) => {
//     const db = cloud.database()
//     const col = db.collection('InvitedUsers')
//     let u = await col.doc(id).get().then(r => r.data).catch(e => console.error(e))
//     if (u) return u.invited
//     else return false
// }

exports.postsLookupLikedAndComments = (agg, _, $, OPENID) =>
    agg.lookup({
        from: 'users',
        let: {
            l: '$likedBy'
        },
        pipeline: $.pipeline().match(_.expr($.in(['$_id', '$$l']))).project({
            nickname: true,
            realname: true,
            avatarUrl: true,
            collegeIndex: true,
            hobby: true,
            bio: true
        }).done(),
        as: 'likedUserInfo'
    })
    .lookup({
        from: 'posts',
        let: {
            id: '_id'
        },
        pipeline: $.pipeline()
            .match({
                parentId: _.expr('$$id')
            })
            .lookup({
                from: 'users',
                localField: 'author',
                foreignField: '_id',
                as: 'userInfo'
            }).project({
                userInfo: $.arrayElemAt(['$userInfo', 0])
            }).done()
    })
    .lookup({
        from: 'users',
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
            avatarUrl: true,
            collegeIndex: true,
            hobby: true,
            bio: true
        }).done(),
        as: 'commentUserInfo'
    }).addFields({
        alreadyLiked: $.in([OPENID, '$likedBy'])
    })

exports.like = async (event, context, collection) => {
    // 获取基础信息
    const {
        ENV,
        OPENID,
        APPID
    } = cloud.getWXContext()
    console.log(OPENID)
    const db = cloud.database()
    const col = db.collection(collection)
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

exports.undoLike = async (event, context, collection) => {
    // 获取基础信息
    const {
        ENV,
        OPENID,
        APPID
    } = cloud.getWXContext()
    console.log(OPENID)
    const db = cloud.database()
    const col = db.collection(collection)
    const _ = db.command
    const $ = _.aggregate

    let r = await col.doc(event.id).update({
        data: {
            likedBy: _.pull(OPENID)
        }
    })
    return r.stats
}

exports.comment = async (event, context, collection) => {
    // 获取基础信息
    const {
        ENV,
        OPENID,
        APPID
    } = cloud.getWXContext()
    console.log(OPENID)
    const db = cloud.database()
    const col = db.collection(collection)
    const _ = db.command
    const $ = _.aggregate

    return await cloud.openapi.security.msgSecCheck({
        content: event.content,
        version: 2,
        scene: 2,
        openid: OPENID
    }).then(r => {
        console.log(r)
        if (r.result.suggest == 'risky') throw new Error('Risky comment')
        else return col.doc(event.id).update({
            data: {
                comments: _.push({
                    author: OPENID,
                    content: event.content,
                    when: db.serverDate()
                })
            }
        })
    }).then(r => r.stats)
}

exports.delComment = async (event, context) => {
    // 获取基础信息
    const {
        ENV,
        OPENID,
        APPID
    } = cloud.getWXContext()
    console.log(OPENID)
    const db = cloud.database()
    const col = db.collection(event.col)
    const _ = db.command
    const $ = _.aggregate

    return await col.doc(event.id).update({
        data: {
            comments: _.pull({
                author: OPENID,
                content: event.content
            })
        }
    }).then(r => r.stats)
}