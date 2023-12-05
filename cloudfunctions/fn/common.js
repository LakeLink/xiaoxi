const dayjs = require('dayjs')
require('dayjs/locale/zh-cn')
dayjs.extend(require('dayjs/plugin/utc'))
dayjs.extend(require('dayjs/plugin/timezone'))
dayjs.extend(require('dayjs/plugin/relativeTime'))

dayjs.locale('zh-cn')
dayjs.tz.setDefault("Asia/Shanghai")

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

exports.each = (list, options) => {
    const {
        stagename,
        relativeTime,
        adminEdit,
        customFunc
    } = options
    for (let i = 0; i < list.length; i++) {
        if (stagename) {
            if (list[i].useStagename) {
                list[i].userInfo = {
                    nickname: list[i].stagename,
                    avatarUrl: getAvatarUrlforStagename(list[i][stagename.user] + list[i].stagename)
                }
            }
        }

        if (relativeTime) {
            if (relativeTime.unix) {
                list[i][relativeTime.k2] = dayjs.unix(list[i][relativeTime.k1]).toNow()
            } else {
                list[i][relativeTime.k2] = dayjs(list[i][relativeTime.k1]).toNow()
            }
        }

        if (adminEdit) {
            list[i].canEdit = true
        }

        if (customFunc) {
            customFunc(list, i)
        }
    }
}

exports.ts = () => {
    return dayjs().unix()
}

exports.tsmilli = () => {
    return dayjs().valueOf()
}

exports.commentReview = async (c) => {
    let suggest = await cloud.openapi.security.msgSecCheck({
        content: c,
        version: 2,
        scene: 2,
        openid: OPENID
    }).then(r => r.result.suggest)

    return suggest
}

exports.dayjs = dayjs