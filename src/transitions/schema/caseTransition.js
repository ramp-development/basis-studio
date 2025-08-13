import { customTrigger } from './customTrigger'

export const caseTransition = (app, CheckPages) =>
{
    console.log('🔧 Creating caseTransition')
    return {
        name: 'case-transition',
        from: {
            namespace: ['home', 'services', 'cases', 'fintech']
        },
        to: {
            namespace: ['case-inner']
        },
        async leave(data)
        {
            // Double-check that we're going TO a case study, not FROM one
            const fromNamespace = data.current?.namespace
            const toNamespace = data.next?.namespace
            
            console.log('🎯 Case transition triggered!', { fromNamespace, toNamespace })
            
            if (toNamespace !== 'case-inner') {
                console.log('❌ Not going to case-inner, skipping case transition')
                return
            }
            
            if (fromNamespace === 'case-inner') {
                console.log('❌ Coming from case-inner, skipping case transition') 
                return
            }
            
            const done = this.async()
            const HomeToCase = await import('@transitions/HomeToCase.js')
            new HomeToCase.default(data, done, CheckPages, app)
        }
    }
}