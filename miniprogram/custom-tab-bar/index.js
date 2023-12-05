// components/tabbar.js
import tabBarStore from '~/stores/tabBarStore'

Component({
    /**
     * 组件的属性列表
     */
    properties: {},

    /**
     * 组件的初始数据
     */
    data: {

        current: 0,
    },

    // this doesn't work on custom-tab-bar, known bug
    // pageLifetimes: {
    //     show: function() {
    //     }
    // },

    lifetimes: {
        ready() {
            try {
                tabBarStore.bind(this, '$tabBar')
                let pages = getCurrentPages()
                // console.log('/' + pages[pages.length-1].route)
                this.setData({
                    current: tabBarStore.indexOfPage('/' + pages[pages.length - 1].route)
                })

            } catch (error) {
                // console.log('ε=ε=ε=(~￣▽￣)~', error)
            }
        }
    },


    /**
     * 组件的方法列表
     */
    methods: {
        async onChange(e) {
            // tabBarStore.switchTab(e.detail.value)
            if (tabBarStore.data.list[e.detail.value].useNavigate) {
                await wx.navigateTo({
                    url: tabBarStore.data.list[e.detail.value].url,
                })
            } else {
                await wx.switchTab({
                    url: tabBarStore.data.list[e.detail.value].url,
                })

            }
            // switch it back: no flickering
            this.setData({
                current: this.data.current,
            });
        }
    }
})