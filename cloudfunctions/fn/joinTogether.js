const cloud = require('wx-server-sdk');

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});

// 获取openId云函数入口函数
exports.main = async (event, context) => {
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