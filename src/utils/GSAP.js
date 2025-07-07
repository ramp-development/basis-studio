import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import SplitText from 'gsap/SplitText'
import Flip from 'gsap/Flip'

gsap.registerPlugin(ScrollTrigger, SplitText, Flip)

const def =
{
    duration: 0.8,
    ease: 'power3',
    stagger: 0.05,
}

const letters = 'abcdefghijklmnopqrstuvwxyz'
const original = '{original}'

gsap.defaults(def)

export { gsap, ScrollTrigger, Flip, SplitText, def }