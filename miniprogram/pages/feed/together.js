// pages/feed/together.js
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
        showPopup: false,
        showUserPopup: false,
        // waitListUserinfo: null,
        popupIndex: null,
        showCommentInput: -1,
        showHostDetail: false,
        filtered: false,
        
        collegeList: ["α", "β", "γ", "δ", "教职工", "博士生"],
    },

    async refresh() {
        const db = wx.cloud.database()
        const r = await wx.cloud.callFunction({
            name: 'fn',
            data: {
                type: 'getTogether',
                id: this.data.queryId
            }
        }).then(r => r.result)
        // console.log()
        console.log(r)
        r.list.forEach(e => {
            e.myScheduledAt = dayjs(e.scheduledAt).format("YY/M/D HH:mm")
            e.deltaPublishedAt = dayjs(e.publishedAt).fromNow()
        })
        this.setData({
            togetherDetails: r.list,
            filtered: r.filtered
        })
        console.log(this.data.togetherDetails)
    },

    onJoin(e) {
        console.log(e)
        wx.cloud.callFunction({
            name: 'fn',
            data: {
                type: 'joinTogether',
                id: e.target.dataset.id
            }
        }).then(r => {
            if (r.result.full) {
                wx.showToast({
                    title: '队伍已满，已加入到候补',
                    icon: 'none'
                })
            }
            this.refresh()
        })
        wx.requestSubscribeMessage({
            tmplIds: [
                'RdCfwdri-Etwwd_INtUpagcZd28Ovs-dflwE0GLhsv0', // 候补
                'aH2yD7DNu37aUJo8R85l-PYiTqSpi1EWLZ8HM1GyORQ', // 活动取消
                '1sNdWGOOafcONMUYyNj5d0f2Zk_8QI4GLbRQIaIaXI8' // 活动开始提醒
            ]
        }).then(r => console.log(r))
    },

    onQuit(e) {
        const item = this.data.togetherDetails[e.currentTarget.dataset.idx]
        wx.showModal({
            title: '已加入',
            content: '是否要退出该活动',
            complete: (r) => {
                if (r.confirm) {
                    wx.cloud.callFunction({
                        name: 'fn',
                        data: {
                            type: 'quitTogether',
                            id: item._id
                        }
                    }).catch(e => wx.showToast({
                        title: '数据错误',
                        icon: 'error'
                    })).then(r => {
                        if (r.result.updated) {
                            this.refresh()
                        } else {
                            wx.showToast({
                                title: '记录未匹配',
                                icon: 'error'
                            })
                        }
                    })
                }
            }
        })
    },

    onEdit(e) {
        const item = this.data.togetherDetails[e.currentTarget.dataset.idx]
        wx.showActionSheet({
            itemList: ['编辑', '删除'],
        }).then(r => {
            console.log(r)
            switch (r.tapIndex) {
                case 0:
                    wx.navigateTo({
                        url: `/pages/together/create?edit=${item._id}`,
                    })
                    break
                case 1:
                    wx.showModal({
                        title: '！！！',
                        content: '是否要删除该活动',
                        complete: r => {
                            if (r.confirm) {
                                const col = wx.cloud.database().collection('TogetherDetails')
                                col.doc(item._id).remove().then(r => {
                                    wx.cloud.callFunction({
                                        name: 'fn',
                                        data: {
                                            type: 'afterDeleteTogether',
                                            location: item.location,
                                            sportsType: item.sportsType,
                                            scheduledAt: item.scheduledAt,
                                            partners: item.partnerInfo.map(v => v._id)
                                        }
                                    })
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

    onImgTap(e) {
        wx.previewImage({
            urls: this.data.togetherDetails[e.target.dataset.idx].images,
            current: e.target.dataset.imgSrc
        })
    },

    onPopupClose(e) {
        this.setData({
            showPopup: false
        })
    },

    onTapOpenPopup(e) {
        console.log(e.target.dataset.idx)
        this.setData({
            showPopup: true,
            popupIndex: e.target.dataset.idx
        })
    },

    // onTabChange(e) {
    //     if (e.detail.index == 1) {
    //         console.log(this.data.togetherDetails[this.data.popupIndex].waitList)
    //         const db = wx.cloud.database()
    //         const _ = db.command
    //         const col = db.collection('Users')
    //         col.aggregate().match({
    //             _id: _.in(["oY_bj5cA6Cc8gfqkc35sOZtE3Nys"])
    //         }).project({nickname: 1}).end().then(r => {
    //             console.log(r)
    //         })
    //     }
    // },
    onLike(e) {
        if (this.data.togetherDetails[e.currentTarget.dataset.idx].alreadyLiked) {
            wx.cloud.callFunction({
                name: 'fn',
                data: {
                    type: 'undoLikeTogether',
                    id: this.data.togetherDetails[e.currentTarget.dataset.idx]._id
                }
            }).then(() => this.refresh())
        } else {
            wx.cloud.callFunction({
                name: 'fn',
                data: {
                    type: 'likeTogether',
                    id: this.data.togetherDetails[e.currentTarget.dataset.idx]._id
                }
            }).then(() => this.refresh())
        }
    },

    onSubmitComment(e) {
        this.setData({
            sendingComment: true
        })
        wx.cloud.callFunction({
            name: 'fn',
            data: {
                type: 'commentTogether',
                id: this.data.togetherDetails[e.target.dataset.idx]._id,
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

    async onShare(e) {
        // console.log(e)
        // let r = await wx.cloud.callFunction({
        //     name: 'fn',
        //     data: {
        //         type: 'createTogetherActivityId',
        //         id: e.currentTarget.dataset.id
        //     }
        // })
        // console.log(r)
        // await wx.updateShareMenu({
        //     isUpdatableMessage: true,
        //     activityId: r.result.activityId,
        //     templateInfo: {
        //         parameterList: [{
        //             name: 'member_count',
        //             value: r.result.current
        //         }, {
        //             name: 'room_limit',
        //             value: r.result.limit
        //         }],
        //         templateInfo: '21B034D08C5615B9889CE362BB957B1EE69A584B'
        //     }
        // })
        // await wx.showShareMenu({
        //         menus: ['shareAppMessage', 'shareTimeline']
        //     })
        // wx.showToast({
        //     title: '可在右上方分享'
        // })

    },

    onTapToplevel(e) {
        this.setData({
            showUserPopup: false
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.init = true
        if (options.id) this.setData({
            queryId: options.id
        })
        this.refresh()
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
        if (this.init) this.init = false
        else this.refresh()
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
        this.refresh().then(() =>
            wx.stopPullDownRefresh())
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
            const item = this.data.togetherDetails[e.target.dataset.idx]
            return {
                title: `运动搭子：${item.sportsType} ${item.description}`,
                path: `pages/feed/together?id=${item._id}`,
                imageUrl: item.images[0]
            }
        } else {
            return {
                title: '运动搭子',
                page: 'pages/feed/together'
            }
        }
    }
})