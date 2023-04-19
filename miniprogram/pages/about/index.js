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
        collegeList: ["α", "β", "γ", "δ", "教职工", "博士生"],
        year: "",
        age: "",
        defaultAvatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
        avatarUrl: null,
        skeletonRowWidth: [],
        loading: true,
        syncWeRunStepInfo: false,
        showOpenSettingButton: false,
        totalSteps: null
    },

    onChooseAvatar(e) {
        const {
            avatarUrl
        } = e.detail
        wx.showLoading({
            title: '上传头像...'
        })
        wx.cloud.callFunction({
            name: 'fn',
            data: {
                type: 'getUserAvatarPath'
            }
        }).then(r => {
            wx.cloud.uploadFile({
                cloudPath: r.result,
                filePath: avatarUrl
            }).then(r => {
                this.setData({
                    avatarUrl: r.fileID
                })
                wx.hideLoading()
            })
        }).catch(e => {
            wx.hideLoading()
            wx.showToast({
                title: '头像上传失败',
                icon: 'error'
            })
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
                getApp().globalData.userExist = true
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

    async refreshWeRunPermission() {
        const r = await wx.getSetting();
        this.setData({
            syncWeRunStepInfo: r.authSetting['scope.werun'] ?? false
        });
    },

    async onChangeSync() {
        await this.refreshWeRunPermission()
        if (!this.data.syncWeRunStepInfo) { // Maybe want to enable it
            wx.authorize({
                scope: 'scope.werun',
            }).catch(async e => {
                this.setData({
                    showOpenSettingButton: true
                })
                wx.showToast({
                    title: '请打开设置页授权运动数据',
                    icon: 'error'
                })
            })
            .then(this.refreshWeRunPermission)
            .then(() => {
                if (r.authSetting['scope.werun']) {
                    wx.getWeRunData().then(r => {
                        console.log(r)
                        wx.cloud.callFunction({
                            name: 'fn',
                            data: {
                                type: 'updateWeRunStepInfo',
                                weRunData: wx.cloud.CloudID(r.cloudID)
                            }
                        })
                    })
                }
            })
        } else { // Maybe want to disable it
            this.setData({
                showOpenSettingButton: true
            })
            wx.showToast({
                title: '请打开设置页取消运动数据',
                icon: 'error'
            })
        }
    },

    async refresh() {
        wx.cloud.callFunction({
            name: 'fn',
            data: {
                type: 'getUser',
                q: this.query
            }
        }).then(r => {
            r.result.college = this.data.collegeList[r.result.collegeIndex]
            this.setData({
                loading: false,
                ...r.result
            })
            getApp().globalData.userExist = true
        }).catch(e => {
            this.setData({
                loading: false
            })
            getApp().globalData.userExist = false
        })

        wx.cloud.callFunction({
            name: 'fn',
            data: {
                type: 'getWeRunTotalSteps'
            }
        }).then(r => {
            this.setData({
                totalSteps: r.result.totalSteps
            })
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */


    onLoad(options) {
        this.query = options

        let skeletonRowWidth = []
        for (let i = 0; i < 7; i++) {
            skeletonRowWidth.push(`${(Math.random()*60+40).toFixed()}%`)
        }
        this.setData({
            skeletonRowWidth
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {},

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        this.refreshWeRunPermission()
        this.refresh()
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