const cloud = require('wx-server-sdk');

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});

// 获取openId云函数入口函数
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
    let r = await col.where(_.and([{
                _id: event.id
            },
            // 没报名
            _.nor([{
                    partners: OPENID
                },
                {
                    waitList: OPENID
                }
            ]),
            //人数没超
            _.expr(
                $.lt([
                    $.size('$partners'),
                    '$limit'
                ])
            )
        ]))
        .update({
            data: {
                partners: _.push(OPENID)
            }
        })
        .then(r => {
            // 报满了
            if (!r || r.stats.updated == 0) {
                return col.where(_.and([{
                        _id: event.id
                    },
                    // 没报名
                    _.nor([{
                            partners: OPENID
                        },
                        {
                            waitList: OPENID
                        }
                    ]),
                    //人数超了
                    _.expr(
                        $.gte([
                            $.size('$partners'),
                            '$limit'
                        ])
                    )
                ]))
                .update({
                    data: {
                        waitList: _.push(OPENID)
                    }
                })
            } else return r
        })
    return {
        r,
        full
    }
};

// 获取openId云函数入口函数
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

    const r = await col.aggregate().lookup({
        from: 'Users',
        let: {
            p: '$partners'
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
            w: '$waitList'
        },
        pipeline: $.pipeline().match(_.expr($.in(['$_id', '$$w']))).project({
                nickname: true,
                realname: true,
                avatarUrl: true
            })
            .done(),
        as: 'waitUserInfo'
    })
    .lookup({
        from: 'Users',
        localField: '_openid',
        foreignField: '_id',
        as: 'host'
    }).addFields({
        unSatisfied: $.gt(['$limit', $.size('$partners')]),
        expired: $.lte(['$scheduledAt', new Date()]),
        alreadyJoined: $.or([$.in([OPENID, '$partners']), $.in([OPENID, '$waitList'])])
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
    }).end()
    console.log(r)
    return r.list.map(e => {
        // e.alreadyJoined = e.partners.includes(OPENID) || e.waitList.includes(OPENID)
        e.host = e.host[0]
        return e
    })
}
