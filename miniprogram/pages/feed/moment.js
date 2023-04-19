// pages/feed/moment.js
const dayjs = require('dayjs')

const relativeTime = require('@3rdparty/dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

require('@3rdparty/dayjs/locale/zh-cn')
dayjs.locale('zh-cn')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        weRunDetails: [],
        showCommentInput: -1,
        sendingComment: false,
        showPopup: false,
        ads: null,
        // only parent -> child, no child -> parent; This is how it works (Vue style)
        onlyForResetNewComment: '',
        filtered: false
    },

    async refresh() {
        let r = await wx.cloud.callFunction({
            name: 'fn',
            data: {
                type: 'getWeRunFeed',
                id: this.data.queryId
            }
        }).then(r => r.result)
        // const db = wx.cloud.database()
        // const r = await db.collection('WeRunDetails').get()
        // if (this.data.queryId) r.result.unshift(r.result.find(e => e._id == this.data.queryId))
        r.list.forEach(e => {
            e.when = dayjs(e.when).fromNow()
        })
        console.log(r)
        this.setData({
            weRunDetails: r.list,
            filtered: r.filtered
        })
        console.log(this.data.weRunDetails)
    },

    onImgTap(e) {
        wx.previewImage({
            urls: this.data.weRunDetails[e.target.dataset.id].media.filter(e => e.type == 'image').map(e => e.fileID),
            current: this.data.weRunDetails[e.target.dataset.id].media[e.target.dataset.imgIdx].fileID
        })
    },

    onLike(e) {
        if (this.data.weRunDetails[e.currentTarget.dataset.idx].alreadyLiked) {
            wx.cloud.callFunction({
                name: 'fn',
                data: {
                    type: 'undoLikeWeRun',
                    id: this.data.weRunDetails[e.currentTarget.dataset.idx]._id
                }
            }).then(() => this.refresh())
        } else {
            wx.cloud.callFunction({
                name: 'fn',
                data: {
                    type: 'likeWeRun',
                    id: this.data.weRunDetails[e.currentTarget.dataset.idx]._id
                }
            }).then(() => this.refresh())
        }
    },

    onShowEarlier(e) {
        this.setData({
            showAllComments: true
        })
    },

    onComment(e) {
        console.log(e)
        this.setData({
            showCommentInput: this.data.showCommentInput == -1 ? e.currentTarget.dataset.idx : -1
        })
        // wx.cloud.callFunction({
        //     name: 'fn',
        //     data: {
        //         type: 'commentTogether',
        //         id: this.data.togetherDetails[e.currentTarget.dataset.idx]._id,
        //         content: 
        //     }
        // })
    },

    onSubmitComment(e) {
        this.setData({
            sendingComment: true
        })
        wx.cloud.callFunction({
            name: 'fn',
            data: {
                type: 'commentWeRun',
                id: this.data.weRunDetails[e.target.dataset.idx]._id,
                content: e.detail.newComment
            }
        }).then((r) => {
            if (r.result.updated == 1) {
                this.setData({
                    sendingComment: false,
                    onlyForResetNewComment: ''
                })
                this.refresh()
            } else {
                throw new Error()
            }
        }).catch(e => {
            this.setData({
                sendingComment: false
            })
            wx.showToast({
                title: '数据错误',
                icon: 'error'
            })
        })
    },

    onEdit(e) {
        const item = this.data.weRunDetails[e.currentTarget.dataset.idx]
        wx.showActionSheet({
            itemList: ['编辑', '删除'],
        }).then(r => {
            console.log(r)
            switch (r.tapIndex) {
                case 0:
                    wx.navigateTo({
                        url: `/pages/moment/create?edit=${item._id}`,
                    })
                    break
                case 1:
                    wx.showModal({
                        title: '！！！',
                        content: '是否要删除该活动',
                        complete: r => {
                            if (r.confirm) {
                                const col = wx.cloud.database().collection('WeRunDetails')
                                col.doc(item._id).remove().then(r => {
                                    this.refresh()
                                    wx.showToast({
                                        title: '已删除',
                                        icon: 'success'
                                    })
                                }).catch(e => {
                                    wx.showToast({
                                        title: '数据错误',
                                        icon: 'error'
                                    })
                                })
                            }
                        }
                    })
                    break
            }
        })
    },


    onTapToplevel(e) {
        this.setData({
            showPopup: false,
            // showCommentInput: -1
        })
    },

    onAdTap(e) {
        wx.previewImage({
            urls: this.data.ads,
            current: this.data.ads[e.target.dataset.imgid]
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log("onLoad")

        if (options.id) this.setData({
            queryId: options.id
        })

        // this.refresh()
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        console.log("onShow")
        this.refresh()
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {
        this.setData({
            queryId: null
        })
        this.refresh().then(() => {
            console.log("Finished")
            wx.stopPullDownRefresh()
        })
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage(e) {
        console.log(e)
        if (e.from == 'button') {
            const item = this.data.weRunDetails[e.target.dataset.idx]
            return {
                title: `小西爱运动：${item.exerciseType} ${item.textContent}`,
                path: `pages/feed/moment?id=${item._id}`,
                imageUrl: item.images[0]
            }
        } else {
            return {
                title: '小西按运动',
                page: 'pages/feed/moment'
            }
        }
    }
})