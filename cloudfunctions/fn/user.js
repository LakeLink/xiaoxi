const cloud = require('wx-server-sdk');

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});

exports.verify = async (event, context) => {
    // 获取基础信息
    const {
        ENV,
        OPENID,
        APPID
    } = cloud.getWXContext()
    const db = cloud.database()
    const col = db.collection('users')
    const {
        got
    } = await import('got');
    const {
        username,
        password,
        collegeIndex
    } = event.data

    return await got.post('https://sso.westlake.edu.cn/cas/v1/users', {
        form: {
            username,
            password
        }
    }).json().then(async r => {
        let attrs = r.authentication.successes.RestAuthenticationHandler.principal.attributes
        let success = true
        if (1 <= collegeIndex && collegeIndex <= 5) {
            success = attrs.identity == "student"
        } else if (collegeIndex == 6) {
            success = attrs.identity == "teacher"
        } else {
            success = false
        }

        let stats = await col.doc(OPENID).update({
            data: {
                verifiedIdentity: attrs.identity,
                verifiedOrganization: attrs.organization,
                collegeIndex: success ? collegeIndex : undefined,
                realname: attrs.name,
                sex: attrs.sex
            }
        }).then(r => r.stats)

        return {
            success: success && stats.updated
        }
    }).catch(e => {
        console.log(e)
        return {
            success: false
        }
    })

}

exports.read = async (event, context) => {
    // 获取基础信息
    const {
        ENV,
        OPENID,
        APPID
    } = cloud.getWXContext()
    const db = cloud.database()
    const col = db.collection('users')

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
    const col = db.collection('users')

    const {
        avatarUrl,
        bio,
        nickname,
        realname,
        hobby,
        collegeIndex,
        year
    } = event.data;

    console.log(event.data)

    await cloud.openapi.security.msgSecCheck({
        content: bio+nickname+realname+hobby,
        version: 2,
        scene: 1,
        openid: OPENID,
        nickname,
        signature: bio
    }).then(r => {
        console.log(r)
        if (r.result.suggest !== 'pass') throw new Error('过不了审')
    })

    let success = false, needVerify = false
    try {
        let data = await col.doc(OPENID).get().then(r => r.data)

        if (!collegeIndex) {
            // success = true
            needVerify = false
        } else if (1 <= collegeIndex && collegeIndex <= 5) {
            // success = true
            needVerify = data.verifiedIdentity !== "student"
        } else if (collegeIndex == 6) {
            // success = true
            needVerify = data.verifiedIdentity !== "teacher"
        }
        // collegeIndex = Number(collegeIndex)
        let r = await col.doc(OPENID).update({
            data: {
                avatarUrl,
                bio,
                nickname,
                realname,
                hobby,
                year,
                collegeIndex: !needVerify && collegeIndex ? collegeIndex : undefined
            }
        })
        // If no field is changed, then udpated == 0
        // if (r.stats.updated) {
            success = true
        // }
    } catch(e) {
        r = await col.doc(OPENID).set({
            data: {
                avatarUrl,
                bio,
                nickname,
                realname,
                hobby,
                year
            }
        })
        // created
        if (!collegeIndex) {
            success = r.stats.created == 1
            needVerify = false
        } else {
            success = r.stats.created == 1
            needVerify = true
        }
    }

    return {
        success,
        needVerify
    }
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