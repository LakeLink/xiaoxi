const together = require('./together')
const user = require('./user')

// 云函数入口函数
exports.main = async function (event, context) {
    switch (event.type) {
        case 'joinTogether':
            return await together.join(event, context)
        case 'getTogether':
            return await together.get(event, context)
        case 'getUser':
            return await user.read(event, context)
        case 'saveUser':
            return await user.save(event, context)
    }
}
