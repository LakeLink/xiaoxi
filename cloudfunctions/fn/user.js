const cloud = require('wx-server-sdk');

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});

exports.read = async (event, context) => {
    // 获取基础信息
    const {
        ENV,
        OPENID,
        APPID
    } = cloud.getWXContext()
    const db = cloud.database()
    const col = db.collection('Users')

    if (event.q && event.q.invite == 'westlake') {
        invited = true
        db.collection('InvitedUsers').doc(OPENID).set({
            data: {
                invited
            }
        })
    }

    return col.doc(OPENID).get().then(r => r.data)
}

exports.save = async (event, context) => {
    // 获取基础信息
    const {
        ENV,
        OPENID,
        APPID
    } = cloud.getWXContext()
    const db = cloud.database()
    const col = db.collection('Users')

    return col.doc(OPENID).set({
        data: event.data
    }).then(r => r.stats)
}

exports.getAvatarPath = async (event, context) => {
    // 获取基础信息
    const {
        ENV,
        OPENID,
        APPID
    } = cloud.getWXContext()

    return `Avatars/${OPENID}`
}
