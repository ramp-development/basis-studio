export const CheckPages = async (app, main) =>
{
    const container = main ? main : document.querySelector('main')
    const page = container.getAttribute('data-transition-page')

    switch(page)
    {
        case 'home':
        {
            const mod = await import('@pages/home')
            return app.page = new mod.default(main, app)
        }

        case 'cases':
        {
            const mod = await import('@pages/cases')
            return app.page = new mod.default(main, app)
        }

        case 'case-inner':
        {
            const mod = await import('@pages/case-inner')
            return app.page = new mod.default(main, app)
        }

        case 'services':
        {
            const mod = await import('@pages/services')
            return app.page = new mod.default(main, app)
        }

        case 'fintech':
        {
            const mod = await import('@pages/fintech')
            return app.page = new mod.default(main, app)
        }
    }
}