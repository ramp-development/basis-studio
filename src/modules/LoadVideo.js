export default class LoadVideo
{
    constructor(instance)
    {
        if(window.innerWidth > 992) return

        const source = instance.querySelector('source')
        const url = source.dataset.src

        source.setAttribute('src', url)
        instance.load()
        instance.addEventListener('loadeddata', () =>
        {
            instance.play()
            instance.classList.add('loaded')
        })
    }
}