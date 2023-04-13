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

        case 'getUser':
            return await user.read(event, context)
        case 'saveUser':
            return await user.save(event, context)
        case 'getUserAvatarPath':
            return await user.getAvatarPath(event, context)

        case 'getWeRunFeed':
            return await weRun.getFeed(event, context)
        case 'commentWeRun':
            return await quickAction.comment(event, context, 'WeRunDetails')
        case 'likeWeRun':
            return await quickAction.like(event, context, 'WeRunDetails')
        case 'undoLikeWeRun':
            return await quickAction.undoLike(event, context, 'WeRunDetails')

        case 'updateWeRunStepInfo':
            return await weRun.updateStepInfo(event, context)
        case 'getWeRunTotalSteps':
            return await weRun.getTotalSteps(event, context)
        case 'rankWeRunTotalSteps':
            return await weRun.rankTotalSteps(event, context)
        
        case 'getAds':
            return ["cloud://miniprogram-6gjjtiee3da042a9.6d69-miniprogram-6gjjtiee3da042a9-1316898046/Ads/20230413_223142_0000.png"]
    }
}