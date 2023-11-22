// pages/stats/foods.js
const image = 'https://tdesign.gtimg.com/miniprogram/images/example2.png';
// const items = new Array(12).fill({
//     label: '标题文字',
//     image
// }, 0, 12);
Page({
    /**
     * 页面的初始数据
     */
    data: {
        luckyVisible: false,
        sideBarIndex: 1,
        scrollTop: 0,
        categories: [{
                label: 'C17',
                title: 'C17',
                badgeProps: {},
                items: [{
                    label: '￥1.8',
                    image
                }, {
                    label: '彩虹碟',
                    image
                }],
            },
            {
                label: 'C18-1F',
                title: 'C18-1F',
                badgeProps: {
                    dot: true,
                },
                items: [{
                    label: '茶泡饭',
                    image
                },{
                    label: '拌/汤面',
                    image
                }],
            },
            {
                label: 'C18-2F',
                title: 'C18-2F',
                badgeProps: {},
                items: [{
                    label: '麻辣烫',
                    image
                }, {
                    label: '水饺',
                    image
                }, {
                    label: '烧仙草',
                    image
                }],
            },
            {
                label: 'C19-1F',
                title: 'C19',
                badgeProps: {},
                items: [{
                    label: '???',
                    image
                }],
            },
            {
                label: 'C19-西餐',
                title: 'C19-西餐',
                badgeProps: {
                    count: 6,
                },
                items: [{
                    label: '披萨',
                    image
                }, {
                    label: '沙拉',
                    image
                }, {
                    label: '牛排',
                    image
                }, {
                    label: '咖喱饭',
                    image
                }, {
                    label: '虾仁炒饭',
                    image
                }],
            }
        ],
        subscribed: false
    },
    offsetTopList: [],
    allDishes: [],
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
    onLuckyVisibleChange(e) {
        this.setData({
            luckyVisible: e.detail.visible,
        });
    },
    onTapLucky(e) {
        let item = this.allDishes[Math.trunc(Math.random() * this.allDishes.length)]
        this.setData({
            luckyVisible: true,
            luckyItem: item
        })
    },
    onTapCloseLucky(e) {
        this.setData({
            luckyVisible: false
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
        this.data.categories.forEach(e => {
            this.allDishes = this.allDishes.concat(e.items)
        })
        console.log(this.allDishes)

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
            .exec();
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
    onShow() {},

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