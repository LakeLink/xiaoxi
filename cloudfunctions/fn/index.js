const together = require('./together')
const user = require('./user')
const weRun = require('./weRun')

// 云函数入口函数
exports.main = async function (event, context) {
    switch (event.type) {
        case 'commentTogether':
            return await together.comment(event, context)
        case 'likeTogether':
            return await together.like(event, context)
        case 'undoLikeTogether':
            return await together.undoLike(event, context)
        case 'joinTogether':
            return await together.join(event, context)
        case 'getTogether':
            return await together.get(event, context)
        case 'quitTogether':
            return await together.quit(event, context)
        case 'getUser':
            return await user.read(event, context)
        case 'saveUser':
            return await user.save(event, context)
        case 'getWeRunFeed':
            return await weRun.getFeed(event, context)
        case 'commentWeRun':
            return await weRun.comment(event, context)
        case 'likeWeRun':
            return await weRun.like(event, context)
        case 'undoLikeWeRun':
            return await weRun.undoLike(event, context)
    }
}