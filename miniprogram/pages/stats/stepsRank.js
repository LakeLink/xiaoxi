// pages/stats/stepsRank.js
import * as echarts from '@3rdparty/ec-canvas/echarts';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        rankForList: [],
        ec: {
            lazyLoad: true
        },
        collegeList: ["α", "β", "γ", "δ", "教", "博"]
    },

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
            console.log(y)
            var option = {
                title: {
                    text: (new Date().getMonth()+1)+'月步数排行榜'
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

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {},

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        this.ecCanvas = this.selectComponent('#mychart-dom-bar')
        this.ecCanvas.init(this.initChart)
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {},

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
        this.loadRank().then(wx.stopPullDownRefresh)
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