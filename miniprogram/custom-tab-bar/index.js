// components/tabbar.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {

    },

    /**
     * 组件的初始数据
     */
    data: {
        // 必须以 / 开头，否则无法 switchTab。
        value: '/pages/stats/stepsRank',
        list: [{
                value: '/pages/stats/stepsRank',
                label: '爱运动',
                icon: 'thumb-up'
            },
            {
                value: '/pages/moment/feed',
                label: '爱水贴',
                icon: 'crooked-smile'
            },
            {
                value: '/pages/stats/foods',
                label: '爱干饭',
                icon: 'rice'
            },
            {
                value: '/pages/about/index',
                label: '我的',
                icon: 'user'
            },
        ],
        badges: {}
    },

    // this doesn't work on custom-tab-bar, known bug
    // pageLifetimes: {
    //     show: function() {
    //     }
    // },


    /**
     * 组件的方法列表
     */
    methods: {
        onChange(e) {
            // this.setData({
            //     value: e.detail.value,
            // });
            wx.switchTab({
                url: e.detail.value,
            })
        },

        onPageShow(page) {
            //但是 page.route 返回没有/
            this.setData({
                value: '/' + page.route,
                badges: getApp().globalData.tabBarBadges
            })
        },

        setBadge(b) {
            this.setBadgeOfPage(this.data.value, b)
        },

        setBadgeOfPage(pagePath, b) {
            this.setData({
                [`badges.${pagePath}`]: b
            })
            
            getApp().globalData.tabBarBadges[pagePath] = b
        }
    }
})