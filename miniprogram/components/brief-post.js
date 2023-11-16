// components/brief-post.js
Component({

    /**
     * 组件的属性列表
     */
    properties: {
        post: Object
    },

    /**
     * 组件的初始数据
     */
    data: {
        pvImages: [],
        showCommentInput: false
    },


    lifetimes: {
        attached() {
            if (this.data.post.images && this.data.post.images.length > 0) {
                wx.cloud.getTempFileURL({
                    fileList: this.properties.post.images
                }).then(r => {
                    this.setData({
                        pvImages: r.fileList.map(f => f.tempFileURL + '/small_pv')
                    })
                })
            }
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

        onPostEdited(e) {
            console.log(e)
            this.setData({
                post: e.detail.post
            })
        }
    }
})