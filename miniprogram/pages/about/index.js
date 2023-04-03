// pages/about/index.js

Page({

    /**
     * 页面的初始数据
     */
    data: {
        nickname: "",
        realname: "",
        bio: "",
        hobby: "",
        college: "请选择",
        collegeIndex: null,
        collegeList: ["α", "β", "γ", "δ", "教职工"],
        year: "",
        age: "",
        defaultAvatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
        avatarUrl: null,
    },
    onChooseAvatar(e) {
        const {
            avatarUrl
        } = e.detail
        wx.showLoading({
            title: '上传头像...'
        })
        const regex = /[a-zA-Z0-9.]+$/;
        
        wx.cloud.uploadFile({
            cloudPath: `Avatars/${new Date().getTime()}-${avatarUrl.match(regex)[0]}`,
            filePath: avatarUrl
        })
        .catch(e => {
            wx.hideLoading()
            wx.showToast({
                title: '头像上传失败',
                icon: 'error'
            })
        })
        .then(r => {
            this.setData({
                avatarUrl: r.fileID
            })
            wx.hideLoading()
        })

    },
    onPickerChange: function (e) {
        //        const collegeIndex = e.detail.value, college = this.data.collegeList[e.detail.value] 
        // console.log('picker_college发送选择改变，携带值为', e.detail.value)
        this.setData({
            collegeIndex: e.detail.value,
            college: this.data.collegeList[e.detail.value]
        })
    },
    onSubmit(e) {
        // console.log("submit event:", e.detail)
        // console.log("data:", this.data)
        const {
            avatarUrl,
            bio,
            nickname,
            realname,
            hobby,
            collegeIndex,
            year,
            age
        } = this.data
        if (!avatarUrl || !nickname || !realname || !hobby || !collegeIndex) {
            wx.showToast({
                title: '个人信息不完整',
                icon: 'error'
            })
        } else {
            wx.cloud.callFunction({
                name: 'fn',
                data: {
                    type: 'saveUser',
                    data: {
                        avatarUrl,
                        bio,
                        nickname,
                        realname,
                        hobby,
                        collegeIndex,
                        year,
                        age
                    }
                }
            }).then(r => {
                if (r.result.created || r.result.updated) wx.showToast({
                    title: '保存成功',
                    icon: 'success'
                })
            }).catch(e => {
                wx.showToast({
                    title: '发生错误',
                    icon: 'error'
                })
            })
        }
        return
        // const db = wx.cloud.database()
        // const col = db.collection('WeUser_InfDetails')
        // wx.cloud.callFunction({
        //     name: 'openid',
        //     complete: res => {
        //         //console.log('callFunction test result: ',res.result.userInfo.openId)
        //         col.where({
        //             _openid: res.result.userInfo.openId,
        //         }).count().then(ress => {
        //             console.log(ress)
        //             if (ress.total == 1) {
        //                 col.where({
        //                         _openid: res.result.userInfo.openId,
        //                     })
        //                     .update({
        //                         data: {
        //                             posttime: db.serverDate(),
        //                             nickname: this.data.nickname,
        //                             realname: this.data.realname,
        //                             biography: this.data.bio,
        //                             hobby: this.data.hobby,
        //                             college: this.data.college,
        //                             collegeIndex: this.data.collegeIndex,
        //                             year: this.data.year,
        //                             age: this.data.age
        //                         }
        //                     }).then(ress => {
        //                         console.log('text', ress)
        //                     })
        //             } else {
        //                 col.add({
        //                     data: {
        //                         posttime: db.serverDate(),
        //                         nickname: this.data.nickname,
        //                         realname: this.data.realname,
        //                         biography: this.data.bio,
        //                         hobby: this.data.hobby,
        //                         college: this.data.college,
        //                         collegeIndex: this.data.collegeIndex,
        //                         year: this.data.year,
        //                         age: this.data.age
        //                     }
        //                 }).then(res => {
        //                     console.log(res)
        //                 })
        //             }

        //         })

        //     }

        // })

    },
    /**
     * 生命周期函数--监听页面加载
     */


    onLoad(options) {
        // const col = db.collection('WeUser_InfDetails')
        // const da =this

        // wx.cloud.callFunction({
        //     name: 'openid',
        //     complete: res => {
        //       //console.log('callFunction test result: ',res.result.userInfo.openId)
        //       col.where({
        //         _openid: res.result.userInfo.openId,
        //       }).count().then(ress=>{
        //         console.log(ress)
        //       })
        //       col.where({
        //         _openid: res.result.userInfo.openId,
        //       })
        //       .get({
        //         success: function(ress) {
        //           // res.data 是包含以上定义的两条记录的数组
        //           //console.log('text',ress.data)
        //           da.setData(ress.data[0])   
        //           /*da.setData({
        //                 nickname : ress.data[0].nickname,
        //                 realname : ress.data[0].realname,
        //                 bio : ress.data[0].biography,
        //                 hobby : ress.data[0].hobby,
        //                 college : ress.data[0].college,
        //                 collegeIndex : ress.data[0].collegeIndex,
        //                 year : ress.data[0].year,
        //                 age : ress.data[0].age
        //             })*/
        //             /*
        //             da.nickname = ress.data[0].nickname,
        //             da.realname = ress.data[0].realname,
        //             da.bio = ress.data[0].biography,
        //             da.hobby = ress.data[0].hobby,
        //             da.college = ress.data[0].college,
        //             da.collegeIndex = ress.data[0].collegeIndex,
        //             da.year = ress.data[0].year,
        //             da.age = ress.data[0].age
        //             console.log('text',ress.data[0].nickname,'datt',da)
        //             */
        //         }
        //       })
        //     }

        //   })
        //console.log('text','datt',da)
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        wx.cloud.callFunction({
            name: 'fn',
            data: {
                type: 'getUser'
            }
        }).then(r => {
            r.result.college = this.data.collegeList[r.result.collegeIndex]
            this.setData(r.result)
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})