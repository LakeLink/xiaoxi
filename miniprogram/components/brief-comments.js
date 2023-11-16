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
        postId: String,
        comments: Object,
        // userInfo: Object,
        // showPopup: Boolean,
        showInput: Boolean,
        // rid: String,
        // collection: String
    },

    /**
     * 组件的初始数据
     */
    data: {
        showAllComments: false,
        sending: false,
        replyTo: null,
        replyPrefix: '',
        newComment: ''
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

        onNewCommentInput(e) {
            if(!e.detail.value.startsWith(this.data.replyPrefix)) {
                this.setData({
                    newComment: '',
                    replyTo: null,
                    replyPrefix: ''
                })
            } else {
                this.setData({
                    newComment: e.detail.value
                })
            }
        },

        onSubmitComment(e) {
            // if (!getApp().globalData.userExist) {
            //     wx.showModal({
            //         title: '个人信息',
            //         content: '你尚未完善个人信息',
            //         complete: (res) => {
            //             if (res.confirm) {
            //                 wx.switchTab({
            //                     url: '/pages/about/index',
            //                 })
            //             }
            //         }
            //     })
            //     return
            // }
            if (this.data.newComment.length == 0) {
                wx.showToast({
                    title: '请输入评论',
                    icon: 'error'
                })
                return
            }

            this.setData({
                sendingComment: true
            })

            wx.cloud.callFunction({
                name: 'fn',
                data: {
                    type: 'commentPost',
                    id: this.data.replyTo ? this.data.replyTo : this.data.postId,
                    content: this.data.newComment
                }
            }).then((r) => {
                if (r.result.success) {
                    this.setData({
                        newComment: '',
                        comments: r.result.comments
                    })
                    // this.triggerEvent('')
                } else {
                    throw new Error()
                }
            }).catch(e => {
                wx.showToast({
                    title: '数据错误',
                    icon: 'error'
                })
            }).finally(() => {
                this.setData({
                    sending: false
                })
            })
        },

        onDelete(e) {
            const c = this.data.comments[e.currentTarget.dataset.idx]
            if (!c.canEdit) return
            wx.showModal({
                title: '删除评论',
                content: '是否要删除该评论',
                complete: (res) => {
                    if (res.confirm) {
                        wx.cloud.callFunction({
                            name: 'fn',
                            data: {
                                type: 'undoCommentPost',
                                cid: c._id,
                                id: this.data.postId
                            }
                        }).then((r) => {
                            if (r.result.success) {
                                this.setData({
                                    comments: r.result.comments
                                })
                                wx.showToast({
                                    title: '删除成功',
                                    icon: 'success'
                                })
                            }
                        }).catch(e => {
                            wx.showToast({
                                title: '数据错误',
                                icon: 'error'
                            })
                        })
                    }
                }
            })
        },

        onReply(e) {
            const c = this.data.comments[e.currentTarget.dataset.idx]
            this.setData({
                showInput: true,
                replyTo: c._id,
                replyPrefix: `回复 ${c.userInfo.nickname}: `,
                newComment: `回复 ${c.userInfo.nickname}: `
            })
        }
    }
})