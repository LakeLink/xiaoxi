const together = require('./together')
const user = require('./user')
const weRun = require('./weRun')
const quickAction = require('./quickAction')

// 云函数入口函数
exports.main = async function (event, context) {
    console.log(event)
    switch (event.type) {
        case 'commentTogether':
            return await quickAction.comment(event, context, 'TogetherDetails')
        case 'likeTogether':
            return await quickAction.like(event, context, 'TogetherDetails')
        case 'undoLikeTogether':
            return await quickAction.undoLike(event, context, 'TogetherDetails')
        case 'joinTogether':
            return await together.join(event, context)
        case 'getTogether':
            return await together.get(event, context)
        case 'quitTogether':
            return await together.quit(event, context)
        case 'createTogetherActivityId':
            return await together.createActivityId(event, context)
        case 'afterDeleteTogether':
            return await together.afterDelete(event, context)

        case 'getUser':
            return await user.read(event, context)
        case 'saveUser':
            return await user.save(event, context)
        case 'getUserAvatarPath':
            return await user.getAvatarPath(event, context)
        case 'verifyUser':
            return await user.verify(event, context)
        
        case 'hasSubscribed':
            return await quickAction.hasSubscribed(event, context)

        case 'commentWeRun':
            return await quickAction.comment(event, context, 'WeRunDetails')
        case 'likeWeRun':
            return await quickAction.like(event, context, 'WeRunDetails')
        case 'undoLikeWeRun':
            return await quickAction.undoLike(event, context, 'WeRunDetails')

        case 'postWeRunNotice':
            return await weRun.postNotice(event, context)
        case 'getWeRunNotices':
            return await weRun.getNotices(event, context)
        case 'nudgeWeRunUser':
            return await weRun.nudge(event, context)
        case 'updateWeRunStepInfo':
            return await weRun.updateStepInfo(event, context)
        case 'getWeRunTotalSteps':
            return await weRun.getTotalSteps(event, context)
            
        case 'rankWeRunTotalStepsV2':
            return await weRun.rankTotalStepsV2(event, context)
        
        case 'comment':
            return await quickAction.comment(event, context, event.col)
        case 'delComment':
            return await quickAction.delComment(event, context)
        case 'getAds':
            return ["cloud://xiaoxiaiyundong-8g95vuw53cf7c6b4.7869-xiaoxiaiyundong-8g95vuw53cf7c6b4-1317841170/20230413_223142_0000.png"]
        default:
            throw new Error('Invalid event.type')
    }
}