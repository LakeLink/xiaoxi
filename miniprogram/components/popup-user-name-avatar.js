// components/userAvatarWithName.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        user: Object,
        showPopup: false
    },

    /**
     * 组件的初始数据
     */
    data: {
        collegeList: ["α", "β", "γ", "δ", "教", "博"]
    },

    /**
     * 组件的方法列表
     */
    methods: {
        onTapSlot(e) {
            console.log(e)
            this.setData({
                showPopup: true
            })
        },
    
        IdontKnowHowToDisableIt() {},
    }
})
