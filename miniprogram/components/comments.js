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
        showPopup: Boolean,
        showInput: Boolean,
        rid: String,
        collection: String
    },

    /**
     * 组件的初始数据
     */
    data: {
        showAllComments: false,
        sending: false,
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

        onSubmitComment(e) {
            if (!getApp().globalData.userExist) {
                wx.showModal({
                    title: '个人信息',
                    content: '你尚未完善个人信息',
                    complete: (res) => {
                        if (res.confirm) {
                            wx.switchTab({
                                url: '/pages/about/index',
                            })
                        }
                    }
                })
                return
            }
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
                    type: 'comment',
                    col: this.properties.collection,
                    id: this.properties.rid,
                    content: this.data.newComment
                }
            }).then((r) => {
                if (r.result.updated == 1) {
                    this.setData({
                        sending: false,
                        newComment: ''
                    })
                    this.triggerEvent('refresh')
                } else {
                    throw new Error()
                }
            }).catch(e => {
                this.setData({
                    sending: false
                })
                wx.showToast({
                    title: '数据错误',
                    icon: 'error'
                })
            })
        },

        onDelete(e) {
            const c = this.properties.comments[e.target.dataset.idx]
            if (!c.canDelete) return
            wx.showModal({
                title: '删除评论',
                content: '是否要删除该评论',
                complete: (res) => {
                    if (res.confirm) {
                        wx.cloud.callFunction({
                            name: 'fn',
                            data: {
                                type: 'delComment',
                                id: this.properties.rid,
                                col: this.properties.collection,
                                content: c.content
                            }
                        }).then((r) => {
                            if (r.result.updated == 1) {
                                wx.showToast({
                                    title: '删除成功',
                                    icon: 'success'
                                })
                            } else {
                                throw new Error()
                            }
                            this.triggerEvent('refresh')
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
            const c = this.properties.comments[e.target.dataset.idx]
            this.setData({
                showInput: true,
                newComment: `回复 ${this.properties.userInfo[c.userIndex].nickname}: `
            })
        }
    }
})