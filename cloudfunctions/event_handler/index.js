// 云函数入口文件
const cloud = require('wx-server-sdk')
const subscribe = require('./subscribe')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
    console.log(event)
    if (event.MsgType == "event") {

        switch (event.Event) {
            case "subscribe_msg_popup_event":
                return await subscribe.subscribed(event, context)
            default:
                break;
        }
    }
}