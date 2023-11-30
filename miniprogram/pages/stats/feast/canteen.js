// pages/stats/feast/canteen.js
const image = 'https://tdesign.gtimg.com/miniprogram/images/example2.png';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        canteen: {},
        windows: [],
        sideBarIndex: 1,
        scrollTop: 0
    },
    canteenId: "",
    offsetTopList: [],
    allDishes: [],

    onTapFood(e) {
        console.log(e)
        wx.navigateTo({
          url: `/pages/stats/feast/food?id=${e.currentTarget.dataset.id}`,
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

        this.setData({
            canteen: r.canteen,
            windows: r.windows
        })
        // this.data.categories.forEach(e => {
        //     this.allDishes = this.allDishes.concat(e.items)
        // })
        // console.log(this.allDishes)

        // const query = wx.createSelectorQuery().in(this);
        // const {
        //     sideBarIndex
        // } = this.data;

        // query
        //     .selectAll('.title')
        //     .boundingClientRect((rects) => {
        //         this.offsetTopList = rects.map((item) => item.top);
        //         this.setData({
        //             scrollTop: rects[sideBarIndex].top
        //         });
        //     })
        //     .exec();
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
            scrollTop: this.offsetTopList[value]
        });
    },
    onScroll(e) {
        const {
            scrollTop
        } = e.detail;
        const threshold = 50; // 下一个标题与顶部的距离

        if (scrollTop < threshold) {
            this.setData({
                sideBarIndex: 0
            });
            return;
        }

        const index = this.offsetTopList.findIndex((top) => top > scrollTop && top - scrollTop <= threshold);

        if (index > -1) {
            this.setData({
                sideBarIndex: index
            });
        }
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