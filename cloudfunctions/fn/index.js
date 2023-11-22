const cloud = require('wx-server-sdk');

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});

const features = require('./features')
const user = require('./user')
const weRun = require('./weRun')
const quickAction = require('./quickAction')
const posts = require('./posts')

// 云函数入口函数
exports.main = async function (event, context) {
    console.log(event)
    switch (event.type) {
        case 'getFeatures':
            return await features.get(event, context)
        // case 'getTopics':
        //     return await posts.getTopics(event, context)
        case 'getPosts':
            return await posts.getPosts(event, context)
        case 'getPostsV2':
            return await posts.getPostsV2(event, context)
        case 'getTopicVotes':
            return await posts.getTopicVotes(event, context)
        case 'addPost':
            return await posts.add(event, context)
        case 'removePost':
            return await posts.remove(event, context)
        case 'setPostMedia':
            return await posts.setMedia(event, context)
        case 'likePost':
            return await posts.like(event, context, false)
        case 'undoLikePost':
            return await posts.like(event, context, true)
        case 'commentPost':
            return await posts.comment(event, context)
        case 'undoCommentPost':
            return await posts.undoComment(event, context)
        case 'votePost':
            return await posts.vote(event, context)
        case 'undoVotePost':
            return await posts.undoVote(event, context)

        /*case 'commentTogether':
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
            return await together.afterDelete(event, context)*/

        case 'getUser':
            return await user.read(event, context)
        case 'saveUser':
            return await user.save(event, context)
        case 'getUserAvatarPath':
            return await user.newAvatarPath(event, context)
        case 'newUserAvatarPath':
            return await user.newAvatarPath(event, context)
        case 'verifyUser':
            return await user.verify(event, context)
        case 'countUserUnreadPosts':
            return await user.countUnreadPosts(event, context)
        
        case 'hasSubscribed':
            return await quickAction.hasSubscribed(event, context)

       /* case 'commentWeRun':
            return await quickAction.comment(event, context, 'WeRunDetails')
        case 'likeWeRun':
            return await quickAction.like(event, context, 'WeRunDetails')
        case 'undoLikeWeRun':
            return await quickAction.undoLike(event, context, 'WeRunDetails')*/

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
        
        /*case 'comment':
            return await quickAction.comment(event, context, event.col)
        case 'delComment':
            return await quickAction.delComment(event, context)
        case 'getAds':
            return ["cloud://xiaoxiaiyundong-8g95vuw53cf7c6b4.7869-xiaoxiaiyundong-8g95vuw53cf7c6b4-1317841170/20230413_223142_0000.png"]*/
        default:
            throw new Error('Invalid event.type')
    }
}