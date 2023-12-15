// pages/stats/feast/canteen.js
const image = 'https://tdesign.gtimg.com/miniprogram/images/example2.png';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        canteen: {},
        windows: [],
        sideBarIndex: 0,
        scrollTo: "window0",
        timeOptions: [{
            value: 0,
            label: "默认"
        }, {
            value: 1,
            label: "早餐"
        }, {
            value: 2,
            label: "中餐"
        }, {
            value: 3,
            label: "晚餐"
        }, {
            value: 4,
            label: "夜宵"
        }],
        timeFilterValue: 0,
        showTimeValues: [0, 1, 2, 3, 4]
    },
    canteenId: "",
    offsetTopList: [],
    allDishes: [],

    onTapFood(e) {
        console.log(e)
        wx.navigateTo({
            url: `/pages/stats/feast/food?id=${e.currentTarget.dataset.id}&canteenName=${this.data.canteen.name}&windowName=${e.currentTarget.dataset.window}`,
        })
    },

    onTimeFilterChange(e) {
        let a;
        switch (e.detail.value) {
            default:
            case 0:
                a = [0, 1, 2, 3, 4]
                break
            case 1:
                a = [1]
                break
            case 2:
                a = [0, 2]
                break
            case 3:
                a = [0, 3]
                break
            case 4:
                a = [4]
                break
        }
        this.setData({
            timeFilterValue: e.detail.value,
            showTimeValues: a
        })
    },

    async refresh() {

        let r = await wx.cloud.callFunction({
            name: 'fn',
            data: {
                mod: 'feast',
                func: 'getCanteen',
                id: this.canteenId
            }
        }).then(r => r.result)

        let canteenFoodSumRating = 0,
            canteenFoodCount = 0,
            categories = []
        r.windows.forEach((w, idx) => {
            // let windowAvgRating = 0
            categories.push({
                value: idx,
                label: w.name
            })
            w.foods.forEach(f => {
                // windowAvgRating += f.avgRating
                if (f.score) {
                    canteenFoodSumRating += f.score
                    canteenFoodCount += 1
                }
            })
            // windowAvgRating /= w.foods.length
        })
        r.canteen.foodAvgRating = (canteenFoodSumRating / canteenFoodCount).toFixed(1)

        this.setData({
            canteen: r.canteen,
            windows: r.windows,
            categories
        })

        // this.data.categories.forEach(e => {
        //     this.allDishes = this.allDishes.concat(e.items)
        // })
        // console.log(this.allDishes)
    },

    onLoad(options) {
        this.canteenId = options.id

        this.refresh();
    },
    onSideBarChange(e) {
        const {
            value
        } = e.detail;

        this.setData({
            sideBarIndex: value,
            scrollTo: `window${value}`
            // scrollTop: this.offsetTopList[value]
        });
    },
    onScroll(e) {
        // console.log(e)
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