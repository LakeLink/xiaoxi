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

    let invited
    if (event.q && event.q.invite == 'westlake') {
        invited = true
        db.collection('InvitedUsers').doc(OPENID).set({
            data: {
                invited
            }
        })
    } else {
        invited = await db.collection('InvitedUsers').doc(OPENID).get().catch(e => console.error(e)).then(r => r ? r.data.invited : false)
    }

    return col.doc(OPENID).get().catch(e => console.error(e)).then(r => {
        if (r) return { ...r.data, invited, exist: true }
        else return { invited, exist: false }
    })
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
