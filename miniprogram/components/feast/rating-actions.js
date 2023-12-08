// components/post-actions.js
Component({

    /**
     * 组件的属性列表
     */
    properties: {
        rating: Object
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

        onComment(e) {
            this.triggerEvent('showCommentInput')
            // this.setData({
            //     showInput: !this.data.showInput
            // })
        },

        onVote(e) {
            let data;
            if (e.currentTarget.dataset.t == "up") {
                data = {
                    mod: 'feast',
                    func: 'voteRating',
                    action: "up",
                    undo: this.data.rating.alreadyVotedUp ? true : false,
                    ratingId: this.data.rating._id
                }
            } else {
                data = {
                    mod: 'feast',
                    func: 'voteRating',
                    action: "down",
                    undo: this.data.rating.alreadyVotedDown ? true : false,
                    ratingId: this.data.rating._id
                }
            }
            wx.cloud.callFunction({
                name: 'fn',
                data
            }).then(r => {
                if (r.result.success) {
                    // https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/events.html#%E8%A7%A6%E5%8F%91%E4%BA%8B%E4%BB%B6
                    this.triggerEvent('vote', {}, {
                        bubbles: true,
                        composed: true
                    })
                } else {
                    wx.showToast({
                        title: r.result.reason,
                        icon: 'error'
                    })
                }
            })
        },

        onEdit(e) {
            wx.cloud.callFunction({
                name: 'fn',
                data: {
                    mod: 'feast',
                    func: 'delRating',
                    targetId: this.data.rating.targetId
                }
            }).then(r => {
                if (r.result.sucess) {
                    this.triggerEvent('vote', {}, {
                        bubbles: true,
                        composed: true
                    })
                }
            })
        }

    }
})