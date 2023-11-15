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
                // console.log('/' + pages[pages.length-1].route)
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
        async onChange(e) {
            // tabBarStore.switchTab(e.detail.value)
            await wx.switchTab({
                url: tabBarStore.data.list[e.detail.value].url,
            })
            // switch it back: no flickering
            this.setData({
                current: this.data.current,
            });
        }
    }
})