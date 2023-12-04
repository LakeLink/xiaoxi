const create = require('./mini-stores')

class TabBarStore extends create.Store {
    data = {
        // current: 0,
        // 必须以 / 开头，否则无法 switchTab。
        list: [{
                value: 0,
                url: '/pages/stats/stepsRank',
                label: '爱运动',
                icon: 'thumb-up',
                badge: {}
            },
            {
                value: 1,
                url: '/pages/moment/feed',
                label: '爱水贴',
                icon: 'crooked-smile',
                badge: {}
            },
            {
                value: 2,
                url: '/pages/shop/index',
                useNavigate: true,
                label: '爱水果',
                icon: 'grape',
                badge: {}
            },
            {
                value: 3,
                url: '/pages/stats/foods',
                label: '爱干饭',
                icon: 'rice',
                badge: {}
            },
            {
                value: 4,
                url: '/pages/about/index',
                label: '我的',
                icon: 'user',
                badge: {}
            },
        ]
    }

    indexOfPage(page) {
        for (let i = 0; i < this.data.list.length; i++) {
            const e = this.data.list[i];
            if (e.url == page) {
                return i
            }
        }
        throw Error(`page ${page} not found`)
    }

    setBadgeOfPage(page, badge) {
        try {
            this.data.list[this.indexOfPage(page)].badge = badge
            this.update()
            return true
        } catch (error) {
            return false
        }
    }

    /*switchTab(value) {
        this.data.current = value
        this.update()
        console.log(this.data.current)
        wx.switchTab({
            url: this.data.list[value].url,
        })
    }*/
}

export default new TabBarStore()