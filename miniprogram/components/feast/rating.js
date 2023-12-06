// components/brief-post.js
Component({

    /**
     * 组件的属性列表
     */
    properties: {
        post: Object,
        votes: Object
    },

    /**
     * 组件的初始数据
     */
    data: {
        showCommentInput: false
    },

    lifetimes: {
        ready() {
        }
    },

    /**
     * 组件的方法列表
     */
    methods: {
        onTapImage(e) {
            let d = e.currentTarget.dataset
            wx.previewImage({
                urls: this.properties.post.images,
                current: this.properties.post.images[d.idx]
            })
        },

        onShowCommentInput(e) {
            // console.log(e)
            this.setData({
                showCommentInput: !this.data.showCommentInput
            })
        },

        onPostEdit(e) {
            // console.log(e)
            this.setData({
                post: e.detail.post
            })
        },

        onCommentsChange(e) {
            // console.log(e)
            this.setData({
                'post.comments': e.detail.comments
            })
        },

        // onPostVote(e) {
        //     console.log(e)
        // }
    }
})