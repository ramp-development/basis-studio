export default class Nav
{
    constructor(app)
    {
        this.app = app

        this.instance = document.querySelector('nav')
        this.top = this.instance.querySelector('.nav_top')
        this.items = this.instance.querySelectorAll('.nav_item')

        this.items.forEach((item, index) =>
        {
            const delay = 0.05 * index + 0.1
            item.style.setProperty('--delay', `${delay}s`)
        })

        this.resize()
        this.app.on('resize', () => this.resize())
    }

    resize()
    {
        const height = this.top.offsetHeight
        this.instance.style.setProperty('--topHeight', `${height}px`)
    }
}