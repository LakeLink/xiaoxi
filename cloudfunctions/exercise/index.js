const joinTogether = require('./joinTogether')
// 云函数入口函数
exports.main = async (event, context) => {
    switch(event.type) {
        case 'joinTogether':
            return await joinTogether.main(event, context)
    }
}