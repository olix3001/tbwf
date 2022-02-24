"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Element = void 0;
const jsdom_1 = require("jsdom");
class Element {
    constructor(tag, DOM) {
        this.node = tag;
        this.DOM = DOM;
    }
    toString() {
        if (this.node !== undefined)
            return this.node.outerHTML;
        return '';
    }
    toHTML() {
        if (this.DOM !== undefined)
            return this.DOM.serialize();
        return '';
    }
    setID(id) {
        if (this.node !== undefined)
            this.node.setAttribute('tbwf-id', id);
    }
    on(event, callback) {
        var _a;
        (_a = this.node) === null || _a === void 0 ? void 0 : _a.addEventListener(event, callback);
        return this;
    }
}
exports.Element = Element;
function createElem(type, attrs, content, parent) {
    var _a, _b;
    // Create virtual DOM if it's not passed as an argument
    if (typeof document == 'undefined' && parent === undefined) {
        parent = new jsdom_1.JSDOM('');
    }
    const doc = typeof document != 'undefined' ? document :
        (parent instanceof jsdom_1.JSDOM ? parent.window.document : (_a = parent === null || parent === void 0 ? void 0 : parent.DOM) === null || _a === void 0 ? void 0 : _a.window.document);
    if (doc === undefined)
        throw 'Cannot find DOM while creating an element';
    // If this is supposed to be a new tag
    if (typeof type == "string") { // New tag
        // Create this tag
        const tag = doc.createElement(type);
        // Set attributes
        if (attrs !== undefined)
            for (let attr of Object.keys(attrs))
                tag.setAttribute(attr, attrs[attr]);
        // Set innerHTML
        if (content !== undefined)
            if (typeof content == "string")
                tag.appendChild(doc.createTextNode(content));
            else
                for (let inner of content)
                    if (inner && inner.node)
                        tag.appendChild(inner.node);
        // Append to parent
        if (parent instanceof Element)
            (_b = parent.node) === null || _b === void 0 ? void 0 : _b.appendChild(tag);
        else
            doc.body.appendChild(tag);
        // Return new element
        return new Element(tag, (typeof jsdom_1.JSDOM != 'undefined' && parent instanceof jsdom_1.JSDOM ? parent : undefined));
    }
    else { // Component
        const rendered = type._render();
        if (rendered === null)
            return undefined;
        return new Element(rendered.node, (typeof jsdom_1.JSDOM != 'undefined' && parent instanceof jsdom_1.JSDOM ? parent : undefined));
    }
}
exports.default = createElem;
