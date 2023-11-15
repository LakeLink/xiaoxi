// pages/about/index.js
import userStore from '~/stores/userStore'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        collegeList: ["暂无", "α", "β", "γ", "δ", "博士生", "教职工"],
        college: null,
        year: "",
        // age: "",

        skeletonRowWidth: [],
        loading: false,
        syncWeRunStepInfo: false,
        showOpenSettingButton: false,
        submitting: false
    },

    onFieldUpdate(e) {
        // console.log(e)
        this.setData({
            [`$user.${e.currentTarget.dataset.key}`]: e.detail
        })
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
                    "$user.avatarUrl": r.fileID
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
            "$user.collegeIndex": e.detail.value,
            college: this.data.collegeList[e.detail.value]
        })
    },

    onTapChooseAvatar(e) {
        this.avatarTapped++
        if (this.avatarTapped >= 3) {
            wx.showModal({
                title: '温馨提示',
                content: '头像选择弹窗可能存在延迟，点击后请耐心等待'
            })
            this.avatarTapped = 0
        }
    },

    async onTapSteps(e) {
        await this.refreshWeRunPermission()
        if (this.data.syncWeRunStepInfo) {
            wx.showLoading({
                title: '正在刷新'
            })
            await wx.getWeRunData().then(async r => {
                await wx.cloud.callFunction({
                    name: 'fn',
                    data: {
                        type: 'updateWeRunStepInfo',
                        weRunData: wx.cloud.CloudID(r.cloudID)
                    }
                })
                await wx.cloud.callFunction({
                    name: 'fn',
                    data: {
                        type: 'getWeRunTotalSteps'
                    }
                }).then(r => {
                    this.setData({
                        totalSteps: r.result.totalSteps
                    })
                })
            }).catch(e => {
                wx.showToast({
                    title: '微信运动数据错误',
                    icon: 'error'
                })
            })
            wx.hideLoading()
        } else {
            this.setData({
                showOpenSettingButton: true
            })
            wx.showToast({
                title: '未授权读取步数信息',
                icon: 'error'
            })
        }
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
            year
        } = this.data.$user
        if (!avatarUrl) {
            wx.showToast({
                title: '请设置头像',
                icon: 'error'
            })
            return
        }
        if (!avatarUrl || !nickname || !realname || !hobby) {
            wx.showToast({
                title: '个人信息不完整',
                icon: 'error'
            })
        } else {
            this.setData({
                submitting: true
            })
            // console.log(this.data)
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
                            collegeIndex: collegeIndex ? Number(collegeIndex) : 0,
                            year
                        }
                    }
                })
                .then(r => r.result)
                .then(r => {
                    if (r.success) {
                        if (r.needVerify) {
                            wx.showModal({
                                title: '验证',
                                content: '设置神秘符号需要验证身份，是否继续',
                                complete: (res) => {
                                    if (res.confirm) {
                                        wx.navigateTo({
                                            url: `/pages/about/verify?collegeIndex=${collegeIndex}`,
                                        })
                                    }
                                    if (res.cancel) {
                                        this.setData({
                                            colegeIndex: 0
                                        })
                                    }
                                }
                            })
                        } else {
                            userStore.load()
                            wx.showToast({
                                title: '保存成功',
                                icon: 'success'
                            })
                        }
                    } else {
                        wx.showToast({
                            title: '发生错误',
                            icon: 'error'
                        })
                    }
                }).catch(e => {
                    wx.showToast({
                        title: '发生错误',
                        icon: 'error'
                    })
                }).finally(() => {
                    this.setData({
                        submitting: false
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
            }).then(this.refreshWeRunPermission).then(() => {
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
    },

    /**
     * 生命周期函数--监听页面加载
     */


    onLoad(options) {
        userStore.bind(this, '$user')
        this.avatarTapped = 0

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
        userStore.unbind(this)
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