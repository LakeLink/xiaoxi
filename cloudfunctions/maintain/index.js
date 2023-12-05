// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
async function cleanOrphanComments() {
    const db = cloud.database()
    const _ = db.command
    const $ = _.aggregate
    const col = db.collection('comments')
    let l = await col.aggregate().lookup({
        from: 'posts',
        localField: 'parentId',
        foreignField: '_id',
        as: 'parentPosts'
    }).match({
        parentPosts: _.size(0)
    }).end().then(r => r.list)
    l.forEach(e => {
        col.doc(e._id).remove()
    });
}
// 云函数入口函数
exports.main = async (event, context) => {
    switch(event.type) {
        case 'cleanComments':
            return await cleanOrphanComments()
        case 'storageGC':
            return await require('./storage').gc()
    }
}