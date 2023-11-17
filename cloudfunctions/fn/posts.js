const cloud = require('wx-server-sdk');
const quickAction = require('./quickAction')

const dayjs = require('dayjs')

require('dayjs/locale/zh-cn')
dayjs.extend(require('dayjs/plugin/utc'))
dayjs.extend(require('dayjs/plugin/timezone'))
dayjs.extend(require('dayjs/plugin/relativeTime'))
dayjs.locale('zh-cn')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});

// exports.getTopics = async (event, context) => {
//     return ["三行诗"]
// }

exports.getPosts = async (event, context) => {
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
    // if(!user.admin) {
    if (user.verifiedIdentity) {
        cond.push(_.or([{
                visibility: 'all'
            },
            {
                visibility: 'verified'
            },
            {
                visibility: user.verifiedIdentity
            },
            {
                author: OPENID
            }
        ]))
    } else {
        cond.push({
            visibility: 'all'
        })
    }
    // }

    if (event.updatedBefore) {
        cond.push({
            updatedAt: _.lt(event.updatedBefore),
            pinned: false
        })
    }

    if (event.topic) {
        cond.push({
            topic: event.topic
        })
    }

    agg = agg.match(_.and(cond))
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

    agg = quickAction.lookupUserInfo('author', agg, _, $, OPENID)
        .sort({
            pinned: -1,
            updatedAt: -1
        })
        .limit(20)

    let r = await quickAction.lookupComments(agg, _, $, OPENID).end()

    r.list.forEach(e => {
        // e.authorInfo = e.authorInfo[0]
        if (e.useStagename) {
            e.userInfo = {
                nickname: e.stagename,
                // collegeIndex: e.authorInfo.collegeIndex
            }
        }

        if (user.admin) {
            e.canEdit = true
        }
        // e.canEdit = e.author == OPENID
        e.relUpdatedAt = dayjs(e.updatedAt).toNow()

        e.alreadyLiked = e.likedBy.includes(OPENID)
    })
    r.list.forEach(e => {
        e.comments.forEach(c => {
            if(user.admin) {
                c.canEdit = true
            }
        })
        // e.comments.sort((a, b) => a.when > b.when)
    })

    await db.collection('users').doc(OPENID).update({
        data: {
            lastReadPostAt: dayjs().valueOf()
        }
    })
    return {
        success: true,
        list: r.list,
        lastReadPostAt: user.lastReadPostAt
    }
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
            topic: event.topic,
            visibility: event.visibility,
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

    await col.doc(event.id)
        .update({
            data: {
                likedBy: undo ? _.pull(OPENID) : _.addToSet(OPENID)
            }
        })

    return await col.doc(event.id).get().then(r => {
        return {
            alreadyLiked: r.data.likedBy.includes(OPENID),
            likedBy: r.data.likedBy
        }
    })
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