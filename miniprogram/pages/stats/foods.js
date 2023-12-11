// pages/stats/foods.js
const image = 'https://tdesign.gtimg.com/miniprogram/images/example2.png';
// const items = new Array(12).fill({
//     label: '标题文字',
//     image
// }, 0, 12);
Page({
    /**
     * 页面的初始数据
     */
    data: {
        subscribed: false
    },

    onTapSubscribe(e) {

        wx.requestSubscribeMessage({
            tmplIds: [
                'NAzpKmK5_dla6rINPfQGswGc2Q6dknKW2TLFuBDR4kU'
            ]
        }).then(r => {
            if (r['NAzpKmK5_dla6rINPfQGswGc2Q6dknKW2TLFuBDR4kU'] == "accept") {
                console.log(r)
                wx.showToast({
                    icon: 'success',
                    title: '订阅成功…'
                })
                this.refresh()
            }
        })
    },

    onLoad() {

    }


})