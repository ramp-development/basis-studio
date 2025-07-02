import EventEmitter from './EventEmitter.js'

export default class ModuleLoader extends EventEmitter
{
    constructor(app)
    {
        super()

        this.app = app
    }

    async loadModules(main)
    {
        try
        {
            // const test = await import('./utils/Test.js').then(module => new module.default(this.app))

            const elements = main.querySelectorAll('[data-module]')

            if(elements.length < 1) return
            let count = 0
            let loaded = false

            elements.forEach(async (element) =>
            {
                const moduleName = element.getAttribute('data-module')
                const values = moduleName.split(' ')
                for(const value of values)
                {
                    const module = await import(`@modules/${value}.js`).then(module =>
                    {
                        new module.default(element, this.app, main)

                        count++
                        if(count === elements.length && !loaded)
                        {
                            loaded = true
                            this.trigger('loaded')
                        }
                    })

                }
            })
        } catch (error)
        {
            console.warn(`Error loading modules: ${error.message}`);
        }
    }
}