const cloud = require('wx-server-sdk');

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});

exports.like = async (event, context) => {
    // 获取基础信息
    const {
        ENV,
        OPENID,
        APPID
    } = cloud.getWXContext()
    console.log(OPENID)
    const db = cloud.database()
    const col = db.collection('WeRunDetails')
    const _ = db.command
    const $ = _.aggregate

    let r = await col.where(_.and([{
                _id: event.id
            },
            // 没点过赞
            {
                likedBy: _.not(_.elemMatch(_.eq(OPENID)))
            }
        ]))
        .update({
            data: {
                likedBy: _.push(OPENID)
            }
        })
    
    return r
}

exports.getFeed = async (event, context) => {
    // 获取基础信息
    const {
        ENV,
        OPENID,
        APPID
    } = cloud.getWXContext()
    console.log(OPENID)
    const db = cloud.database()
    const col = db.collection('WeRunDetails')
    const _ = db.command
    const $ = _.aggregate

    let r = await col.aggregate().lookup({
        from: 'Users',
        localField: '_openid',
        foreignField: '_id',
        as: 'authorInfo'
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
        as: 'commenterInfo'
    }).addFields({
        alreadyLiked: $.in([OPENID, '$likedBy'])
    }).end()
    r.list.forEach(e => e.authorInfo = e.authorInfo[0])
    return r.list
}