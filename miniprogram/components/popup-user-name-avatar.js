// components/userAvatarWithName.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        avatarUrl: String,
        nickname: String,
        realname: String,
        
        showPopup: false
    },

    /**
     * 组件的初始数据
     */
    data: {
    },

    /**
     * 组件的方法列表
     */
    methods: {
        onTapCommentUser(e) {
            console.log(e)
            this.setData({
                showPopup: true
            })
        },
    
        onTapAuthor(e) {
            this.setData({
                showAuthorDetail: true
            })
        },
    
        onTapToplevel(e) {
            if (this.data.showCommentUserDetail || this.data.showAuthorDetail) {
                this.setData({
                    showCommentUserDetail: null,
                    showAuthorDetail: false
                })
            }
        },
    
        IdontKnowHowToDisableIt() {},
    }
})
