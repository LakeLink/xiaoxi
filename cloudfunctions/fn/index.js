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
    switch (event.mod) {
        case 'feast':
            return await require('./feast').handler(event, context)
        default:
            break;
    }

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

        default:
            throw new Error('Invalid event.type')
    }
}