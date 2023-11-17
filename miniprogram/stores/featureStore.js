const create = require('./mini-stores')

class FeatureStore extends create.Store {
    data = {
        post: {
            topics: [],
            sorters: [],
            visibilities: []
        }
    }

    async load() {
        await wx.cloud.callFunction({
            name: 'fn',
            data: {
                type: 'getFeatures'
            }
        }).then(r => {
            this.data.post = r.result.post
            console.log(this.data.post)
            this.update()
        })
    }
}

export default new FeatureStore()
