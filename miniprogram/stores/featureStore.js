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
            // console.log('I will load')
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
            // console.log('Not loaded, but loading')
            await this.loading
        }
        // console.log('already loaded')
    }
}

export default new FeatureStore()