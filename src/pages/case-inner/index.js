import Loader from './Loader.js'

export default class index
{
    constructor(main, app)
    {
        this.main = main
        this.app = app

        this.once = false

        this.triggerLoad = async () => this.load()
        if(this.app.onceLoaded) this.load()
    }

    load()
    {
        if(this.once) return
        this.loader = new Loader(this.main, this.app)

        this.once = true
    }
}