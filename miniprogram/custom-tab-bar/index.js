// components/tabbar.js
import tabBarStore from '~/stores/tabBarStore'

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        current: 0,
    },

    /**
     * 组件的初始数据
     */
    data: {

    },

    // this doesn't work on custom-tab-bar, known bug
    // pageLifetimes: {
    //     show: function() {
    //     }
    // },

    lifetimes: {
        ready() {
            try {
                let pages = getCurrentPages()
                this.setData({
                    current: tabBarStore.indexOfPage('/' + pages[pages.length-1].route)
                })
                
                tabBarStore.bind(this, '$tabBar')
            } catch (error) {
                console.log('ε=ε=ε=(~￣▽￣)~')
            }
        }
    },


    /**
     * 组件的方法列表
     */
    methods: {
        onChange(e) {
            // this.setData({
            //     value: e.detail.value,
            // });
            // tabBarStore.switchTab(e.detail.value)
            wx.switchTab({
                url: tabBarStore.data.list[e.detail.value].url,
            })
        },

        onPageShow(page) {
            //但是 page.route 返回没有/
            // tabBarStore.data.current = '/' + page.route
            // tabBarStore.update()
        },

    }
})