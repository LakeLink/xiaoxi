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
        value: '/pages/stats/stepsRank',
        list: [{
                value: '/pages/stats/stepsRank',
                label: '爱运动',
                icon: 'thumb-up'
            },
            {
                value: '/pages/feed/placeholder',
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
    },

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
    }
})