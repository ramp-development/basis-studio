export default class Observer
{
    constructor()
    {
        this.instance = new IntersectionObserver((entries) =>
        {
            entries.forEach(entry =>
            {
                entry.target.dataset.visible = entry.isIntersecting ? "true" : "false";
            })
        },
        {
            root: null,
            rootMargin: '7.5% 0px 7.5% 0px'
        })
    }
}