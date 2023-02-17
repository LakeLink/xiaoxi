// pages/exercise-now/exercise-now.ts
Page({

    /**
     * 页面的初始数据
     */
    data: {
        openCalendar: false,
        date: "",
        activity: {},
        /*
        运动类型	typeId	支持传入单位
        锻炼	1001	time/calorie
        体能训练	1002	time/calorie
        功能性训练	1003	time/calorie

        瑜伽	2001	time/calorie
        钓鱼	2002	time/calorie
        广场舞	2003	time/calorie
        踢足球	2004	time/calorie
        打篮球	2005	time/calorie
        打羽毛球	2006	time/calorie
        打乒乓球	2007	time/calorie
        打网球	2008	time/calorie

        跑步	3001	time/distance/calorie
        登山	3002	time/distance/calorie
        骑车	3003	time/distance/calorie
        游泳	3004	time/distance/calorie
        滑雪	3005	time/distance/calorie

        跳绳	4001	number/calorie
        俯卧撑	4002	number/calorie
        深蹲	4003	number/calorie*/
        activities: [
            { name: "跑步", typeId: 3001, unit: "distance" },
            { name: "登山", typeId: 3002, unit: "time" },
            { name: "骑车", typeId: 3003, unit: "distance" },
            { name: "游泳", typeId: 3004, unit: "distance" },
            { name: "滑雪", typeId: 3005, unit: "time" },

            { name: "跳绳", typeId: 4001, unit: "number" },
            { name: "俯卧撑", typeId: 4002, unit: "number" },
            { name: "深蹲", typeId: 4003, unit: "number" },

            { name: "体能训练", typeId: 1002, unit: "time" },
            { name: "瑜伽", typeId: 2001, unit: "time" },
            { name: "踢足球", typeId: 2004, unit: "time" },
            { name: "打篮球", typeId: 2005, unit: "time" },
            { name: "打羽毛球", typeId: 2006, unit: "time" },
            { name: "打乒乓球", typeId: 2007, unit: "time" },
            { name: "打网球", typeId: 2008, unit: "time" },
        ],
        numberInput: "",
        imgList: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {

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

    },

    openCalendar() {
        this.setData({
            isCalendarOpen: true
        })
    },

    closeCalendar() {
        this.setData({
            isCalendarOpen: false
        })
    },

    confirmDate(e) {
        console.log(e)
        var date = new Date(e.detail);
        this.setData({
            isCalendarOpen: false,
            date: `${date.getMonth() + 1}/${date.getDate()}`
        })
    },

    bindActivityChange: function (e) {
        console.log('picker event:', e)
        this.setData({
            activity: this.data.activities[e.detail.value]
        })
    },

    bindSubmit: function (e) {
        console.log("submit event:", e)
        console.log(this.data)
        switch (this.data.activity.unit) {
            case "number":
                wx.shareToWeRun({
                    recordList: [{ typeId: this.data.activity.typeId, number: parseInt(this.data.numberInput) }],
                    success(res) {
                        wx.showToast({ title: '打卡成功' })
                    },
                    fail(res) {
                        wx.showToast({ title: '打卡失败' })
                        console.log(res)
                    }
                })
                break;
            case "distance":
                wx.shareToWeRun({
                    recordList: [{ typeId: this.data.activity.typeId, distance: Math.round(parseFloat(this.data.numberInput) * 1000) }],
                    success(res) {
                        wx.showToast({ title: '打卡成功' })
                    },
                    fail(res) {
                        wx.showToast({ title: '打卡失败', icon: 'error' })
                        console.log(res)
                    }
                })
                break;
            case "time":
                wx.shareToWeRun({
                    recordList: [{ typeId: this.data.activity.typeId, time: parseInt(this.data.numberInput) }],
                    success(res) {
                        wx.showToast({ title: '打卡成功' })
                    },
                    fail(res) {
                        wx.showToast({ title: '打卡失败', icon: 'error' })
                        console.log(res)
                    }
                })
                break;

            default:
                break;
        }

    },

    bindNumberInput: function (e) {
        console.log("input event:", e)
        this.setData({
            numberInput: e.detail.value
        })
    },

    afterImgRead: function (e) {
        console.log(e)
        const file = e.detail.file
        this.data.imgList.push(...file);
        console.log(this.data.imgList)
        this.setData({ imgList: this.data.imgList });
    }
})