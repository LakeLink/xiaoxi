const cloud = require('wx-server-sdk');
const common = require('./common')

exports.handler = async (event, context) => {
    switch (event.func) {
        case 'rate':
            return await rate(event, context)
        case 'updateRatingMedia':
            return await updateRatingMedia(event, context)
        case 'voteRating':
            return await voteRating(event, context)
        case 'delRating':
            return await delRating(event, context)
        case 'getCanteen':
            return await getCanteen(event, context)
        case 'getFood':
            return await getFood(event, context)
        case 'listCanteens':
            return await listCanteens(event, context)
        default:
            throw Error('invalid func ' + event.func)
    }
}

async function listCanteens(event, context) {
    const db = cloud.database()
    const col = db.collection('feast_canteens')
    const _ = db.command
    const $ = _.aggregate

    return await col.get().then(r => r.data)
}

async function getCanteen(event, context) {
    const db = cloud.database()
    const col = db.collection('feast_canteens')
    const _ = db.command
    const $ = _.aggregate

    let canteen = await col.doc(event.id).get().then(r => r.data)

    let windows = await db.collection('feast_windows').aggregate().match({
        canteenId: event.id
    }).lookup({
        from: 'feast_foods',
        let: {
            id: '$_id'
        },
        pipeline: $.pipeline()
            .match(_.expr($.eq(['$windowId', '$$id'])))
            .lookup({
                from: 'feast_ratings',
                let: {
                    id: '$_id'
                },
                pipeline: $.pipeline()
                    .match(_.expr($.eq(['$targetId', '$$id'])))
                    .group({
                        _id: null,
                        avg: $.avg('$taste')
                    }).done(),
                as: 'avgRating'
            }).addFields({
                avgRating: $.arrayElemAt(['$avgRating.avg', 0])
            }).done(),
        as: 'foods'
    }).end().then(r => r.list)

    return {
        canteen,
        windows
    }
}

/*async function getWindow(event, context) {
    const db = cloud.database()
    const col = db.collection('feast_windows')
    const _ = db.command
    const $ = _.aggregate

    return await col.aggregate().match({
        _id: event.id
    }).lookup({
        from: 'feast_foods',
        let: {
            id: '$_id'
        },
        pipeline: $.pipeline()
            .match(_.expr($.eq(['$windowId', '$$id'])))
            .lookup({
                from: 'feast_ratings',
                let: {
                    id: '$_id'
                },
                pipeline: $.pipeline()
                    .match(_.expr($.eq(['$targetId', '$$id'])))
                    .group({
                        _id: null,
                        avgRating: $.avg('$taste')
                    }).done(),
                as: 'rating'
            }).done(),
        as: 'foods'
    }).end()
}*/

async function getFood(event, context) {
    // 获取基础信息
    const {
        ENV,
        OPENID,
        APPID
    } = cloud.getWXContext()
    const db = cloud.database()
    const col = db.collection('feast_foods')
    const _ = db.command
    const $ = _.aggregate

    let food = await col.aggregate().match({
        _id: event.id
    }).lookup({
        from: 'feast_ratings',
        let: {
            id: '$_id'
        },
        pipeline: $.pipeline()
            .match(_.expr($.eq(['$targetId', '$$id'])))
            .group({
                _id: '$taste',
                users: $.addToSet('$user')
            }).done(),
        as: 'ratingInfo'
    }).lookup({
        from: 'feast_ratings',
        let: {
            id: '$_id'
        },
        pipeline: $.pipeline()
            .match(_.expr($.eq(['$targetId', '$$id'])))
            .lookup({
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'userInfo'
            }).addFields({
                userInfo: $.arrayElemAt(['$userInfo', 0]),
                canEdit: $.eq(['$user', OPENID])
            }).sort({
                when: -1
            }).done(),
        as: 'ratings'
    }).end().then(r => r.list[0])

    common.each(food.ratings, {
        stagename: true,
        relativeTime: {
            k1: 'when',
            k2: 'relWhen',
            unix: true
        },
        customFunc: (arr, idx) => {
            arr[idx].alreadyVotedUp = arr[idx].upVotedBy?.includes(OPENID)
            arr[idx].alreadyVotedDown = arr[idx].downVotedBy?.includes(OPENID)
        }
    })

    let myRating = await db.collection('feast_ratings').doc(OPENID + '^' + event.id).get().then(r => r.data).catch(e => null)
    return {
        food,
        myRating
    }
}

// function calculatedWeightedRating(ratings) {
//     for (let i = 0; i < ratings.length; i++) {
//         const e = ratings[i];
//         .

//     }
// }

async function rate(event, context) {
    // 获取基础信息
    const {
        ENV,
        OPENID,
        APPID
    } = cloud.getWXContext()
    console.log(OPENID)
    const db = cloud.database()
    const col = db.collection('feast_ratings')
    const _ = db.command
    const $ = _.aggregate

    let key
    switch (event.targetType) {
        case 'canteen':
            key = 'env'
            break;
        case 'window':
            key = 'srv'
            break;
        case 'food':
            key = 'taste'
            break;
        default:
            throw Error('Invalid targetType ' + event.targetType)
            break;
    }
    let stats = await col.doc(OPENID + '^' + event.targetId).set({
        data: {
            type: event.targetType,
            targetId: event.targetId,
            when: common.ts(),
            user: OPENID,
            useStagename: event.useStagename ? true : false,
            stagename: event.useStagename ? event.stagename : null,
            textContent: event.textContent,
            [key]: event.rating,
            upVotedBy: [],
            downVotedBy: []
        }
    }).then(r => r.stats)

    return {
        success: stats.updated || stats.created,
        id: OPENID + '^' + event.targetId
    }
}

async function updateRatingMedia(event, context) {
    // 获取基础信息
    const {
        ENV,
        OPENID,
        APPID
    } = cloud.getWXContext()
    console.log(OPENID)
    const db = cloud.database()
    const col = db.collection('feast_ratings')
    const _ = db.command
    const $ = _.aggregate

    let r = await col.doc(event.id).update({
        data: {
            images: event.images
        }
    })

    return {
        success: r.stats.updated == 1
    }
}

async function delRating(event, context) {
    // 获取基础信息
    const {
        ENV,
        OPENID,
        APPID
    } = cloud.getWXContext()
    console.log(OPENID)
    const db = cloud.database()
    const col = db.collection('feast_ratings')
    const _ = db.command
    const $ = _.aggregate

    let stats = await col.doc(OPENID + '^' + event.targetId).remove().then(r => r.stats)
    return {
        success: stats.removed == 1
    }
}

async function voteRating(event, context) {
    // 获取基础信息
    const {
        ENV,
        OPENID,
        APPID
    } = cloud.getWXContext()
    console.log(OPENID)
    const db = cloud.database()
    const col = db.collection('feast_ratings')
    const _ = db.command
    const $ = _.aggregate
    if (event.undo) {
        let r = await col.doc(event.ratingId).update({
            data: {
                upVotedBy: _.pull(OPENID),
                downVotedBy: _.pull(OPENID)
            }
        })
        return {
            success: r.stats.updated == 1
        }
    } else {
        let a, b;
        if (event.action == "up") {
            a = "upVotedBy"
            b = "downVotedBy"
        } else if (event.action == "down") {
            a = "downVotedBy"
            b = "upVotedBy"
        } else {
            return {
                success: false,
                reason: "不支持该行为"
            }
        }
        let r = await col.doc(event.ratingId).update({
            data: {
                [a]: _.addToSet(OPENID),
                [b]: _.pull(OPENID)
            }
        })
        return {
            success: r.stats.updated == 1
        }
    }

}

async function commentFood(event, context) {
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

    if (common.commentReview(event.content) == 'risky') {
        return {
            success: false,
            reason: "似乎文字不太合适，换个说法吧"
        }
    }

    await col.add({
        data: {
            author: OPENID,
            parentId: event.foodId,
            publishedAt: common.ts(),
            textContent: event.content,
            images: [],
            likedBy: [],
            // subComments: []
        }
    })
}