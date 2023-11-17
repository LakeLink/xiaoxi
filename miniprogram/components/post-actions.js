// components/post-actions.js
Component({

    /**
     * 组件的属性列表
     */
    properties: {
        post: Object
    },

    /**
     * 组件的初始数据
     */
    data: {

    },

    /**
     * 组件的方法列表
     */
    methods: {

        onLike(e) {
            if (this.data.post.alreadyLiked) {
                wx.cloud.callFunction({
                    name: 'fn',
                    data: {
                        type: 'undoLikePost',
                        id: this.data.post._id
                    }
                }).then(r => {
                    this.setData({
                        'post.likedBy': r.result.likedBy,
                        'post.likedUserInfo': r.result.likedUserInfo,
                        'post.alreadyLiked': r.result.alreadyLiked
                    })
                })
            } else {
                wx.cloud.callFunction({
                    name: 'fn',
                    data: {
                        type: 'likePost',
                        id: this.data.post._id
                    }
                }).then(r => {
                    this.setData({
                        'post.likedBy': r.result.likedBy,
                        'post.likedUserInfo': r.result.likedUserInfo,
                        'post.alreadyLiked': r.result.alreadyLiked
                    })
                })
            }
        },

        onComment(e) {
            this.triggerEvent('showCommentInput')
            // this.setData({
            //     showInput: !this.data.showInput
            // })
        },

        onEdit(e) {
            // 目前只支持删除
            wx.showModal({
                title: '删除帖子',
                content: '你确定要删除这个帖子吗？',
                complete: (res) => {
                    if (res.confirm) {
                        wx.cloud.callFunction({
                            name: 'fn',
                            data: {
                                type: 'removePost',
                                id: this.data.post._id
                            }
                        }).then(r => {
                            if (r.result.success) {
                                this.triggerEvent('postEdit', {
                                    post: r.result.post
                                })

                            } else {
                                wx.showToast({
                                    title: r.result.reason,
                                    icon: 'error'
                                })
                            }
                        })
                    }
                }
            })
        }

    }
})