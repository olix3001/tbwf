import Component from "./Component"
import { JSDOM } from 'jsdom'

type NotObj<T> = Exclude<T, Object>

export interface ElemAttrs {
    [key: string]: NotObj<any>
}

export class Element {
    node: HTMLElement | undefined
    DOM: any | undefined

    constructor(tag: HTMLElement | undefined, DOM: JSDOM | undefined) {
        this.node = tag
        this.DOM = DOM
    }

    toString() {
        if (this.node !== undefined) return this.node.outerHTML
        return ''
    }

    toHTML() {
        if (this.DOM !== undefined) return this.DOM.serialize()
        return ''
    }

    setID(id: string) {
        if (this.node !== undefined) this.node.setAttribute('tbwf-id', id)
    }

    on(event: string, callback: () => void) {
        this.node?.addEventListener(event, callback)
        return this
    }
}

export default function createElem(
    type: string | Component,
    attrs: ElemAttrs | undefined,
    content: string | [Element] | undefined,
    parent: any
): Element | undefined {

    // Create virtual DOM if it's not passed as an argument
    if (typeof document == 'undefined' && parent === undefined) {
        parent = new JSDOM('')
    }
    const doc = typeof document != 'undefined' ? document :
        (parent instanceof JSDOM ? parent.window.document : parent?.DOM?.window.document)
    if (doc === undefined) throw 'Cannot find DOM while creating an element'

    // If this is supposed to be a new tag
    if (typeof type == "string") { // New tag
        // Create this tag
        const tag = doc.createElement(type)
        // Set attributes
        if (attrs !== undefined)
            for (let attr of Object.keys(attrs))
                tag.setAttribute(attr, attrs[attr])
        // Set innerHTML
        if (content !== undefined)
            if (typeof content == "string")
                tag.appendChild(doc.createTextNode(content))
            else
                for (let inner of content)
                    if (inner && inner.node) tag.appendChild(inner.node)

        // Append to parent
        if (parent instanceof Element) parent.node?.appendChild(tag)
        else doc.body.appendChild(tag)
        // Return new element
        return new Element(tag, (typeof JSDOM != 'undefined' && parent instanceof JSDOM ? parent : undefined))
    } else { // Component
        const rendered = type._render()
        if (rendered === null) return undefined
        return new Element(rendered.node, (typeof JSDOM != 'undefined' && parent instanceof JSDOM ? parent : undefined))
    }


}