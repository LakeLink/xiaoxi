const cloud = require('wx-server-sdk')
const CloudBase = require('@cloudbase/manager-node')
const {
    storage
} = new CloudBase()

function getPath(url) {
    console.log(url)
    // https://developers.weixin.qq.com/miniprogram/dev/wxcloudrun/src/development/storage/miniapp/compon.html
    if (url.indexOf('cloud://') === 0) {
        var first = url.indexOf('.')
        var end = url.indexOf('/', first)
        return url.slice(end + 1, url.length)
    } else {
        throw Error('not cloud:// url')
    }
}
async function avatarsGC() {
    const db = cloud.database()
    const _ = db.command
    const $ = _.aggregate
    const col = db.collection('users')
    let r = await col.aggregate().project({
        avatarUrl: true
    }).group({
        _id: null,
        avatarUrls: $.addToSet('$avatarUrl')
    }).end().then(r => r.list[0])

    let avatarUrls = {}
    r.avatarUrls.forEach((e) => {
        avatarUrls[getPath(e)] = true
        // console.log(getPath(e))
    })

    let garbages = []
    const res = await storage.listDirectoryFiles('Avatars/')
    res.forEach((e) => {
        if (!(e.Key in avatarUrls)) {
            garbages.push(e.Key)
        }
    })
    console.log(garbages)

    // return await storage.deleteFile(garbages)
}
async function feastRatingsGC() {
    const db = cloud.database()
    const _ = db.command
    const $ = _.aggregate
    const col = db.collection('feast_ratings')
    let r = await col.aggregate().project({
        images: true
    }).end().then(r => r.list)

    let images = {}
    r.forEach((e) => {
        if (e.images)
            e.images.forEach((e) => {
                images[getPath(e)] = true
                // console.log(getPath(e))
            })
    })

    let garbages = []
    const res = await storage.listDirectoryFiles('feast_ratings/')
    res.forEach((e) => {
        if (!(e.Key in images)) {
            garbages.push(e.Key)
        }
    })
    console.log(garbages)

    // return await storage.deleteFile(garbages)
}
exports.gc = async (event, context) => {
    // await avatarsGC()
    await feastRatingsGC()
}