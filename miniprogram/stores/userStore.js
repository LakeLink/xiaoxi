const create = require('./mini-stores')

class UserStore extends create.Store {
    data = {
        exist: false,
        nickname: "",
        realname: "",
        bio: "",
        hobby: "",
        collegeIndex: 0,
        // avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
        avatarUrl: '',

        totalSteps: 0,
        unreadPostCount: 0
    }

    async updateUnreadPosts() {
        return await wx.cloud.callFunction({
            name: 'fn',
            data: {
                type: 'countUserUnreadPosts'
            }
        }).then(r => {
            this.data.unreadPostCount = r.result
            // this.update()
            return r.result
        })
    }

    async load() {

        await wx.cloud.callFunction({
            name: 'fn',
            data: {
                type: 'getUser'
            }
        }).then(r => {
            // const {
            //     nickname,
            //     realname,
            //     bio,
            //     hobby,
            //     collegeIndex,
            //     avatarUrl
            // } = r.result

            this.data = {
                ...r.result,
                exist: true
            }

            this.update()
        }).catch(e => {
            wx.showModal({
              title: '嗨，新朋友！',
              content: '请前往`我`页面完善个人信息',
              complete: (res) => {
                if (res.confirm) {
                  wx.switchTab({
                    url: 'pages/about/index',
                  })
                }
              }
            })
        })

        await wx.cloud.callFunction({
            name: 'fn',
            data: {
                type: 'getWeRunTotalSteps'
            }
        }).then(r => {
            this.data.totalSteps = r.result.totalSteps
            this.update()
        })
    }
}
export default new UserStore()