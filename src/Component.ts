import createElem, { Element } from "./Element";

type NotObj<T> = Exclude<T, Object>

export interface ComponentState {
    [key: string]: NotObj<any>
}

export default class Component {

    state: ComponentState
    _state: ComponentState

    constructor(state: ComponentState | undefined) {
        this.state = {}
        this._state = state || {}

        if (typeof document != "undefined")
            this._state = eval(`_${this.constructor.name.replace(/\s/g, '')}State`)

        let sp = this._state

        const reloadF = () => this.reload()
        if (typeof state != 'undefined') {
            for (let k of Object.keys(this._state))
                Object.defineProperty(this.state, k, {
                    get() {
                        return sp[k]
                    },
                    set(value) {
                        sp[k] = value
                        reloadF()
                    }
                })
        }

        if (typeof window != 'undefined') {
            // @ts-ignore
            if (typeof window.components == 'undefined')
                // @ts-ignore
                window.components = {}
            // @ts-ignore
            window.components[this.constructor.name] = this
        }
    }

    reload() {
        const id = this.constructor.name.replace(/\s/g, '')
        if (typeof document != "undefined")
            this._state = eval(`_${id}State`)
        if (typeof document != 'undefined') {
            const elem = document.querySelector(`[tbwf-id="${id}"]`)
            // @ts-ignore
            elem?.parentNode?.replaceChild(this._render().node, elem)
        }
    }

    _render(args?: any, isMain?: boolean, bundlePath?: string): Element | null {
        // render
        if (typeof document == 'undefined') this.beforeMount()
        var elem: any = this.render(args || {})
        if (elem == null) elem = createElem('div', {}, undefined, null)
        // add script
        if (elem != null) {
            const win = elem.DOM == null ? window : elem.DOM.window
            // state
            const stateScript: any = win.document.createElement('script')
            stateScript.innerHTML = `var _${this.constructor.name.replace(/\s/g, '')}State=${JSON.stringify(this._state)};`
            elem.node.appendChild(stateScript)
        }
        if (elem != null && isMain) {
            // bundle
            const script: any = elem.DOM?.window.document.createElement('script')
            script?.setAttribute('src', bundlePath || '/public/bundle.min.js')
            elem?.DOM?.window.document.body?.appendChild(script)
        }
        // set id
        elem?.setID(this.constructor.name.replace(/\s/g, ''))
        return elem
    }

    render(args: any): Element | null {
        return null
    }

    onMount() { }
    beforeMount() { }

    static Load(component: any) {
        if (typeof document == 'undefined') return
        const c = new component()
        c.reload()
        c.onMount()
    }
}