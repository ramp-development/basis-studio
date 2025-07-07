export default class Nav
{
    constructor(app)
    {
        this.app = app

        this.instance = document.querySelector('nav')
        this.top = this.instance.querySelector('.nav_top')
        this.items = this.instance.querySelectorAll('.nav_item')
        this.navDots = this.instance.querySelector('.nav_dots')

        this.items.forEach((item, index) =>
        {
            const delay = 0.05 * index + 0.1
            item.style.setProperty('--delay', `${delay}s`)
        })

        this.navDots.addEventListener('click', (e) =>
        {
            if(this.instance.classList.contains('active'))
            {
                this.instance.classList.remove('active')
            } else
            {
                this.instance.classList.add('active')
            }
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