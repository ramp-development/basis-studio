import gsap from 'gsap'

export default class Loader
{
    constructor(main, app)
    {
        this.main = main
        this.app = app

        this.hero = this.main.querySelector('.hero')
        this.meshs = this.app.gl.world.hero.meshs

        this.init()
    }

    init()
    {
        this.tl = gsap.timeline({defaults: {ease: 'power2', duration: 1}})

        this.meshs.forEach(({mesh}, index) =>
        {
            this.tl.fromTo(mesh.position, {z: 1500}, {z: 0, duration: 1.5}, index * 0.1)
        })
    }
}