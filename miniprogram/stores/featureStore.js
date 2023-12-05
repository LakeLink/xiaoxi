const create = require('./mini-stores')

class FeatureStore extends create.Store {
    data = {
        loaded: false,
        post: {
            topics: [],
            sorters: [],
            visibilities: []
        }
    }
    
    loading = null

    async load() {
        // console.log(this.loading)
        if (!this.loading) {
            this.loading = wx.cloud.callFunction({
                name: 'fn',
                data: {
                    type: 'getFeatures'
                }
            }).then(r => {
                this.data.post = r.result.post
                this.data.loaded = true
                // console.log(this.data.post)
                this.update()
            }).catch((e) => {
                this.loading = null
            })

            await this.loading
        } else if (!this.data.loaded) {
            await this.loading
        }
    }
}

export default new FeatureStore()