// pages/exercise-now/exercise-now.ts
Page({

    /**
     * 页面的初始数据
     */
    data: {
        openCalendar: false,
        date: "",
        textInput: "",
        shareToWeRun: false,
        weRunActivity: null,
        activity: "",
        /*
        运动类型	typeId	支持传入单位
        锻炼	1001	time/calorie
        体能训练	1002	time/calorie
        功能性训练	1003	time/calorie

        瑜伽	2001	time/calorie
        钓鱼	2002	time/calorie
        广场舞	2003	time/calorie
        踢足球	2004	time/calorie
        打篮球	2005	time/calorie
        打羽毛球	2006	time/calorie
        打乒乓球	2007	time/calorie
        打网球	2008	time/calorie

        跑步	3001	time/distance/calorie
        登山	3002	time/distance/calorie
        骑车	3003	time/distance/calorie
        游泳	3004	time/distance/calorie
        滑雪	3005	time/distance/calorie

        跳绳	4001	number/calorie
        俯卧撑	4002	number/calorie
        深蹲	4003	number/calorie*/
        activities: [{
                name: "跑步",
                typeId: 3001,
                unit: "distance"
            },
            {
                name: "登山",
                typeId: 3002,
                unit: "time"
            },
            {
                name: "骑车",
                typeId: 3003,
                unit: "distance"
            },
            {
                name: "游泳",
                typeId: 3004,
                unit: "distance"
            },
            {
                name: "滑雪",
                typeId: 3005,
                unit: "time"
            },

            {
                name: "跳绳",
                typeId: 4001,
                unit: "number"
            },
            {
                name: "俯卧撑",
                typeId: 4002,
                unit: "number"
            },
            {
                name: "深蹲",
                typeId: 4003,
                unit: "number"
            },

            {
                name: "体能训练",
                typeId: 1002,
                unit: "time"
            },
            {
                name: "瑜伽",
                typeId: 2001,
                unit: "time"
            },
            {
                name: "踢足球",
                typeId: 2004,
                unit: "time"
            },
            {
                name: "打篮球",
                typeId: 2005,
                unit: "time"
            },
            {
                name: "打羽毛球",
                typeId: 2006,
                unit: "time"
            },
            {
                name: "打乒乓球",
                typeId: 2007,
                unit: "time"
            },
            {
                name: "打网球",
                typeId: 2008,
                unit: "time"
            },
        ],
        minDateForCalendar: Date.now() - 1000 * 60 * 60 * 24 * 30,
        numberInput: "",
        location: "",
        mediaList: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.edit = options.edit
        if (this.edit) {
            const col = wx.cloud.database().collection('WeRunDetails')
            col.doc(this.edit).get().then(item => {
                const {
                    when,
                    exerciseType,
                    numericData,
                    textContent,
                    location,
                    media
                } = item.data
                this.realDate = when
                this.setData({
                    activity: exerciseType,
                    numberInput: numericData,
                    textInput: textContent,
                    shareToWeRun: false,
                    location,
                    mediaList: media.map((v) => {
                        return {
                            type: v.type,
                            url: v.fileID
                        }
                    }),
                    date: `${this.realDate.getMonth() + 1}/${this.realDate.getDate()}`
                })
            })
        } else {
            this.realDate = new Date()
            this.setData({
                date: `${this.realDate.getMonth() + 1}/${this.realDate.getDate()}`
            })
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        if (!getApp().globalData.userExist) {
            wx.showModal({
                title: '个人信息',
                content: '你尚未完善个人信息',
                complete: (res) => {
                    if (res.confirm) {
                        wx.switchTab({
                            url: '/pages/about/index',
                        })
                    }
                    if (res.cancel) {
                        wx.navigateBack()
                    }
                }
            })
            return
        }
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

    },

    openCalendar() {
        this.setData({
            isCalendarOpen: true
        })
    },

    closeCalendar() {
        this.setData({
            isCalendarOpen: false
        })
    },

    confirmDate(e) {
        console.log(e)
        this.realDate = e.detail
        this.setData({
            isCalendarOpen: false,
            date: `${this.realDate.getMonth() + 1}/${this.realDate.getDate()}`
        })
    },

    bindWeRunActivityChange(e) {
        console.log('picker event:', e)
        this.setData({
            weRunActivity: this.data.activities[e.detail.value]
        })
    },

    onBack(e) {
        wx.navigateBack();
    },

    async bindSubmit(e) {
        const db = wx.cloud.database()
        const col = db.collection('WeRunDetails')

        if (!this.data.mediaList.length) {
            wx.showModal({
                title: '缺少细节',
                content: '需要至少一张图片或视频'
            })
            return
        }

        if (!this.data.date || !this.data.location || !(this.data.shareToWeRun ? this.data.weRunActivity && this.data.numberInput : this.data.activity)) {
            wx.showModal({
                title: '缺少细节',
                content: '信息不完整'
            })
            return
        }

        if (this.edit) {
            console.log(this.edit)
            await col.doc(this.edit).update({
                data: {
                    when: this.realDate,
                    exerciseType: this.data.shareToWeRun ? this.data.weRunActivity.name : this.data.activity,
                    unit: this.data.shareToWeRun ? this.data.activity.unit : undefined,
                    numericData: this.data.shareToWeRun ? this.data.numberInput : undefined,
                    textContent: this.data.textInput,
                    location: this.data.location
                }
            }).catch(e => {
                wx.showToast({
                    title: '数据错误',
                    icon: 'error'
                })
                throw e
            })

            if (this.data.mediaList.length) await this.uploadMediaToCloud(this.data.mediaList, `WeRunDetails/${this.edit}`)
                .then(uploadResult => {
                    console.log(uploadResult)
                    col.doc(this.edit).update({
                        data: {
                            media: uploadResult
                        }
                    })
                })
        } else {
            await col.add({
                data: {
                    when: this.realDate,
                    exerciseType: this.data.shareToWeRun ? this.data.weRunActivity.name : this.data.activity,
                    unit: this.data.shareToWeRun ? this.data.activity.unit : undefined,
                    numericData: this.data.shareToWeRun ? this.data.numberInput : undefined,
                    textContent: this.data.textInput,
                    location: this.data.location,
                    media: [],
                    likedBy: [],
                    comments: []
                }
            }).then(async r => {
                if (this.data.mediaList.length) await this.uploadMediaToCloud(this.data.mediaList, `WeRunDetails/${r._id}`)
                    .then(uploadResult => {
                        console.log(uploadResult)
                        col.doc(r._id).update({
                            data: {
                                media: uploadResult
                            }
                        })
                    })
            }).catch(e => {
                wx.showToast({
                    title: '数据错误',
                    icon: 'error'
                })
                throw e
            })

        }

        if (this.data.shareToWeRun) {
            let recordList = []
            switch (this.data.weRunActivity.unit) {
                case "number":
                    recordList.push({
                        typeId: this.data.weRunActivity.typeId,
                        number: parseInt(this.data.numberInput)
                    })
                    break;
                case "distance":
                    recordList.push({
                        typeId: this.data.weRunActivity.typeId,
                        distance: Math.round(parseFloat(this.data.numberInput) * 1000)
                    })
                    break;
                case "time":
                    recordList.push({
                        typeId: this.data.weRunActivity.typeId,
                        time: parseInt(this.data.numberInput)
                    })
                    break;
                default:
                    wx.showToast({
                        title: '单位数据异常',
                        icon: 'error'
                    })
                    return
            }

            await wx.shareToWeRun({
                recordList
            }).catch(e => {
                wx.hideLoading()
                wx.showToast({
                    title: '推送到微信运动时发生错误',
                    icon: 'error'
                })
                throw e
            })
        }

        wx.showToast({
            title: '打卡成功',
            icon: 'success'
        })
        wx.navigateBack()
    },

    bindNumberInput: function (e) {
        console.log("input event:", e)
        this.setData({
            numberInput: e.detail.value
        })
    },

    afterFileRead(e) {
        console.log(e)
        this.data.mediaList.push(...e.detail.file);
        this.setData({
            mediaList: this.data.mediaList
        });
    },

    fileDelete(e) {
        console.log(e)
        this.data.mediaList.splice(e.detail.index);
        this.setData({
            mediaList: this.data.mediaList
        });
    },

    async uploadMediaToCloud(fileList, cloudFolderPath) {
        wx.showLoading({
            title: '正在上传',
        })
        const uploadTasks = fileList.map((file, index) => {
            if (!file.url.startsWith('cloud')) {
                return wx.cloud.uploadFile({
                    cloudPath: `${cloudFolderPath}/${file.type}${index}`,
                    filePath: file.url
                }).then(r => {
                    return {
                        fileID: r.fileID,
                        type: file.type
                    }
                })
            } else return {
                fileID: file.url,
                type: file.type
            }
        });
        return Promise.all(uploadTasks)
            .catch(e => {
                wx.hideLoading()
                wx.showToast({
                    title: '上传失败',
                    icon: 'none'
                });
                console.log(e);
            })
            .then(data => {
                wx.hideLoading()
                return data
            })
    },

    onChange(e) {
        this.setData({
            shareToWeRun: e.detail
        })
    }
})