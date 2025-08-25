import { LinearSRGBColorSpace } from 'three'

import EventEmitter from './EventEmitter'

export default class Resources extends EventEmitter
{
    constructor(sources)
    {
        super()

        this.sources = sources

        this.items = {}
        this.toLoad = this.sources.length
        this.loaded = 0

        this.textureLoader = {loaded: false}

        this.startLoading()
    }

    async startLoading()
    {
        for(const source of this.sources)
        {
            if(source.type === 'textureLoader')
            {
                if(this.textureLoader.loaded === false)
                {
                    try
                    {
                        const module = await import('three')
                        this.textureLoader.loader = new module.TextureLoader()
                        this.textureLoader.loaded = true
                    } catch (error) {
                        console.error('Error loading TextureLoader:', error)
                        continue
                    }
                }

                await this.loadTexture(source)
            }
        }
    }

    async loadTexture(source)
    {
        await this.textureLoader.loader.load(source.url, (texture) =>
        {
            texture.colorSpace = LinearSRGBColorSpace
            this.sourceLoaded(source, texture)
        })
    }

    sourceLoaded(source, file)
    {
        this.items[source.name] = file

        this.loaded++

        if(this.loaded === this.toLoad)
        {
            this.trigger('ready')
        }
    }
}