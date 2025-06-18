export default class Year
{
    constructor(instance)
    {
        const date = new Date().getFullYear()
        instance.innerHTML = date
    }
}