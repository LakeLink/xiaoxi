const joinTogether = require('./joinTogether')
const getTogether = require('./getTogether')
// 云函数入口函数
exports.main = async function(event, context) {
    switch(event.type) {
        case 'joinTogether':
            return await joinTogether.main(event, context)
        case 'getTogether':
            return await getTogether.main(event, context)
    }
}