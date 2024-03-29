// pages/stats/stepsRank.js
import * as echarts from '@3rdparty/ec-canvas/echarts';
import Message from 'tdesign-miniprogram/message/index';

const dayjs = require('dayjs')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        rankForList: [],
        ec: {
            lazyLoad: true
        },
        collegeList: ["", "α", "β", "γ", "δ", "教", "博"],
        notices: []
    },

    lastNudge: {},

    async loadRank() {
        wx.cloud.callFunction({
            name: 'fn',
            data: {
                type: 'rankWeRunTotalStepsV2'
            }
        }).then(r => {
            const [rankForList, rankForChart] = [r.result, r.result.slice(0, 3)]

            this.setData({
                rankForList
            })

            const y = rankForChart.map(e => e.totalSteps)

            var option = {
                title: {
                    text: (new Date().getMonth() + 1) + '月步数排行榜'
                },
                textStyle: {
                    color: 'black'
                },
                xAxis: {
                    data: rankForChart.map(e => e.nickname),
                    axisTick: {
                        show: false
                    }
                },
                yAxis: {
                    axisLabel: {
                        margin: 2,
                        formatter: function (v, idx) {
                            return v >= 10000 ? (v / 10000).toFixed() + 'w' : v
                        }
                    },
                    min: Math.min(...y) * 0.9,
                    max: Math.max(...y) * 1.1,
                    splitNumber: 3
                },
                series: [{
                    type: 'bar',
                    data: y,
                    label: {
                        show: true,
                        position: "top",
                        distance: 2
                    },
                    barWidth: '30%',
                    itemStyle: {
                        color: '#91cc75'
                    }
                }]
            };
            this.chart.setOption(option);
        })

        wx.cloud.callFunction({
            name: 'fn',
            data: {
                type: 'getWeRunNotices'
            }
        }).then(r => {
            this.setData({
                notices: r.result
            })
        })
    },

    initChart(canvas, width, height, dpr) {
        const chart = echarts.init(canvas, null, {
            width: width,
            height: height,
            devicePixelRatio: dpr // 像素
        });
        canvas.setChart(chart);

        this.chart = chart
        this.loadRank()
        console.log('initChartDone')
        return chart;
    },

    onTapAvatar(e) {
        function hint() {
            Message.warning({
                context: this,
                offset: [20, 32],
                duration: 5000,
                content: '一分钟只能拍TA一次哦',
            });
        }

        let u = this.data.rankForList[e.target.dataset.idx]

        if (this.lastNudge[u._id]) {
            let t = dayjs().startOf('minute').unix()
            // 一分钟一次
            if (t <= this.lastNudge[u._id]) {
                console.log('pause nudge:', t, this.lastNudge[u._id])
                hint()
                return
            }
        }

        this.lastNudge[u._id] = dayjs().unix()

        wx.cloud.callFunction({
            name: 'fn',
            data: {
                type: 'nudgeWeRunUser',
                target: u._id
            }
        }).then(r => {
            if (r.result.success) {
                Message.success({
                    context: this,
                    offset: [20, 32],
                    duration: 5000,
                    content: `你拍了拍 ${u.nickname}`,
                });
                this.loadRank()
            } else {
                hint()
            }
        })
    },

    onClickNotice(e) {
        wx.showModal({
            title: '广告位招租!',
            content: '',
            editable: true,
            complete: (res) => {
                if (res.confirm) {
                    if (!res.content.length) {
                        wx.showToast({
                            title: '喂，至少写一个字吧！',
                            icon: 'error'
                        })
                        return
                    }
                    wx.cloud.callFunction({
                        name: 'fn',
                        data: {
                            type: 'postWeRunNotice',
                            content: res.content
                        }
                    }).then(r => {
                        if (r.result.success) {
                            wx.showToast({
                                title: '成功投稿！将占位三天',
                                icon: 'success'
                            })
                            this.loadRank()

                        } else {
                            wx.showToast({
                                title: '内容似乎不太对，改改再发吧',
                                icon: 'error'
                            })
                        }
                    })
                }
            }
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {},

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {},

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        if (!this.ecCanvas) {
            this.ecCanvas = this.selectComponent('#mychart-dom-bar')
            this.ecCanvas.init(this.initChart)
        } else {
            wx.startPullDownRefresh()
        }
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
        this.loadRank().then(setTimeout(wx.stopPullDownRefresh, 500))
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