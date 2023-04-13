// components/comments.js
Component({
    /**
     * 组件的属性列表
     */
    /*使用 setData 修改 properties 的值
    由于 data 数据和 properties 属性在本质上没有任何区别，因此 properties 属性的值也可以用于页面渲染，或使用 setData 为 properties 中的属性重新赋值*/
    properties: {
        //https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxml/event.html#dataset
        //大写变小写，横线变驼峰
        comments: Object,
        userInfo: Object,
        showPopup: false,
        showInput: false,
        sending: false,
        newComment: ''
    },

    /**
     * 组件的初始数据
     */
    data: {
        showAllComments: false
    },

    /**
     * 组件的方法列表
     */
    methods: {
        onShowEarlier(e) {
            this.setData({
                showAllComments: true
            })
        },

        onSubmitComment(e) {
            if (this.data.newComment.length == 0) {
                wx.showToast({
                    title: '请输入评论',
                    icon: 'error'
                })
                return
            }
            this.triggerEvent('submit', {
                newComment: this.data.newComment
            })
        },

        onReply(e) {
            const c = this.properties.comments[e.target.dataset.idx]
            this.setData({
                showInput: true,
                newComment: `回复 ${this.properties.userInfo[c.userIndex].nickname}: `
            })
        }
    }
})