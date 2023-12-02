// components/brief-post.js
Component({

    /**
     * 组件的属性列表
     */
    properties: {
        post: Object,
        votes: Object,
        topics: Array
    },

    /**
     * 组件的初始数据
     */
    data: {
        pvImages: [],
        showCommentInput: false
    },

    observers: {
        // 'post': function (post) {
        //     if (!post) return
        //     let images = post.images
        //     if (images && images.length > 0) {
        //         wx.cloud.getTempFileURL({
        //             fileList: images
        //         }).then(r => {
        //             this.setData({
        //                 pvImages: r.fileList.map(f => f.tempFileURL + '/small_pv')
        //             })
        //         })
        //     }
        // }
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