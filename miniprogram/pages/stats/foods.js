// pages/stats/foods.js
const items = new Array(12).fill({
    label: '标题文字'
}, 0, 12);
Page({
    /**
     * 页面的初始数据
     */
    data: {
        sideBarIndex: 1,
        scrollTop: 0,
        categories: [{
                label: '选项一',
                title: '标题一',
                badgeProps: {},
                items,
            },
            {
                label: '选项二',
                title: '标题二',
                badgeProps: {
                    dot: true,
                },
                items: items.slice(0, 9),
            },
            {
                label: '选项三',
                title: '标题三',
                badgeProps: {},
                items: items.slice(0, 9),
            },
            {
                label: '选项四',
                title: '标题四',
                badgeProps: {
                    count: 6,
                },
                items: items.slice(0, 6),
            },
            {
                label: '选项五',
                title: '标题五',
                badgeProps: {},
                items: items.slice(0, 3),
            },
        ],
        subscribed: false
    },

    refresh() {
        wx.cloud.callFunction({
            name: 'fn',
            data: {
                type: 'hasSubscribed',
                templateId: 'NAzpKmK5_dla6rINPfQGswGc2Q6dknKW2TLFuBDR4kU'
            }
        }).then(r => {
            this.setData({
                subscribed: r.result
            })
        })
    },

    onTapSubscribe(e) {
        console.log(e)

        wx.requestSubscribeMessage({
            tmplIds: [
                'NAzpKmK5_dla6rINPfQGswGc2Q6dknKW2TLFuBDR4kU'
            ]
        }).then(r => {
            if (r['NAzpKmK5_dla6rINPfQGswGc2Q6dknKW2TLFuBDR4kU'] == "accept") {
                console.log(r)
                wx.showToast({
                    icon: 'success',
                    title: '订阅成功…'
                })
                this.refresh()
            }
        })
    },

    onLoad() {
        /*
        const query = wx.createSelectorQuery().in(this);
        const {
            sideBarIndex
        } = this.data;

        query
            .selectAll('.title')
            .boundingClientRect((rects) => {
                this.offsetTopList = rects.map((item) => item.top);
                this.setData({
                    scrollTop: rects[sideBarIndex].top
                });
            })
            .exec();*/
        // this.refresh();
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