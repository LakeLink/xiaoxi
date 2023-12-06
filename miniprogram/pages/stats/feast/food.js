// pages/stats/feast/food.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        food: {},
        ratingInfo: [],
        avgRating: "0.0",
        ratings: [{
            userInfo: {
                nickname: '小西'
            },
            relUpdatedAt: '三小时前',
            textContent: '吃吃喝喝睡睡美滋滋'
        }],
        newRatingVisible: false,
        draft: null
        // myRating: 0,
        // ratingSubmitting: false
    },

    foodId: "",

    onTapRate(e) {
        this.setData({
            newRatingVisible: true
        })
    },

    onHideRating(e) {
        this.setData({
            newRatingVisible: false
        })
    },

    onVote(e) {
        this.refresh()
    },

    // onRateChange(e) {
    //     this.setData({
    //         myRating: e.detail.value
    //     })
    // },

    // onTouchRateEnd(e) {
    //     if (this.data.ratingSubmitting) return
    //     if (this.data.myRating >= 1 && this.data.myRating <= 5) {
    //         this.setData({
    //             ratingSubmitting: true
    //         })
    //         wx.cloud.callFunction({
    //             name: 'fn',
    //             data: {
    //                 mod: 'feast',
    //                 func: 'rate',
    //                 targetId: this.foodId,
    //                 targetType: 'food',
    //                 rating: this.data.myRating
    //             }
    //         }).then(r => {
    //             this.refresh()
    //         }).finally(() => {
    //             this.setData({
    //                 ratingSubmitting: false
    //             })
    //         })
    //     }
    // },

    async refresh() {
        let {
            food,
            myRating
        } = await wx.cloud.callFunction({
            name: 'fn',
            data: {
                mod: 'feast',
                func: 'getFood',
                id: this.foodId
            }
        }).then(r => r.result)

        let transRatingInfo = {},
            totalRatings = 0,
            sumRatings = 0
        food.ratingInfo.forEach(e => {
            transRatingInfo[e._id] = e.users
            totalRatings += e.users.length
            sumRatings += e._id * e.users.length
        })
        let ratingInfo = []
        for (let i = 5; i >= 1; i--) {
            if (transRatingInfo[i]) {
                ratingInfo.push({
                    rating: i,
                    percent: Math.round(transRatingInfo[i].length / totalRatings * 100)
                })
            } else {
                // ratingInfo.push({
                //     rating: i,
                //     percent: 0
                // })
            }
        }

        this.setData({
            food,
            ratingInfo,
            avgRating: (sumRatings / totalRatings).toFixed(1)
        })

        if (myRating) {
            this.setData({
                draft: {
                    rating: myRating.taste,
                    stagename: myRating.stagename,
                    useStagename: myRating.useStagename,
                    textValue: myRating.textContent,
                    mediaList: myRating.images?.map(i => {
                        return {
                            type: 'image',
                            url: i
                        }
                    })
                }
            })
        } else {
            this.setData({
                draft: null
            })
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log(options)
        this.foodId = options.id

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

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})