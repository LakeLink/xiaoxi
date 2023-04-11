// pages/stats/stepsRank.js
import * as echarts from '@3rdparty/ec-canvas/echarts';

async function initChart(canvas, width, height, dpr) {
    const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr // 像素
    });
    canvas.setChart(chart);

    const r = await wx.cloud.callFunction({
        name: 'fn',
        data: {
            type: 'rankWeRunTotalSteps'
        }
    })
    console.log(r)

    var option = {
        title: {
            text: '31天步数排行榜'
        },
        xAxis: {
            data: r.result.map(e => e.info.nickname)
        },
        yAxis: {
            axisLabel: {
                margin: 2,
                formatter: function(v, idx) {
                    return v >= 1000 ? (v/1000)+'k' : v
                }
            }
        },
        series: [{
            type: 'bar',
            data: r.result.map(e => e.totalSteps)
        }]
    };
    chart.setOption(option);
    return chart;
}

Page({

    /**
     * 页面的初始数据
     */
    data: {
        ec: {
            onInit: initChart
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

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