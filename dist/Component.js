"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Element_1 = __importDefault(require("./Element"));
class Component {
    constructor(state) {
        this.state = {};
        const reloadF = () => this.reload();
        if (typeof state != 'undefined') {
            for (let k of Object.keys(state))
                Object.defineProperty(this.state, k, {
                    get() {
                        return state[k];
                    },
                    set(value) {
                        state[k] = value;
                        reloadF();
                    }
                });
        }
        if (typeof window != 'undefined') {
            // @ts-ignore
            if (typeof window.components == 'undefined')
                // @ts-ignore
                window.components = {};
            // @ts-ignore
            window.components[this.constructor.name] = this;
        }
    }
    reload() {
        var _a;
        const id = this.constructor.name.replace(/\s/g, '');
        if (typeof document != 'undefined') {
            const elem = document.querySelector(`[tbwf-id="${id}"]`);
            // @ts-ignore
            (_a = elem === null || elem === void 0 ? void 0 : elem.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(this._render().node, elem);
        }
    }
    _render(args, isMain, bundlePath) {
        var _a, _b, _c;
        // render
        var elem = this.render(args || {});
        if (elem == null)
            elem = (0, Element_1.default)('div', {}, undefined, null);
        // add script
        if (elem != null && isMain) {
            const script = (_a = elem.DOM) === null || _a === void 0 ? void 0 : _a.window.document.createElement('script');
            script === null || script === void 0 ? void 0 : script.setAttribute('src', bundlePath || '/public/bundle.min.js');
            (_c = (_b = elem === null || elem === void 0 ? void 0 : elem.DOM) === null || _b === void 0 ? void 0 : _b.window.document.body) === null || _c === void 0 ? void 0 : _c.appendChild(script);
        }
        // set id
        elem === null || elem === void 0 ? void 0 : elem.setID(this.constructor.name.replace(/\s/g, ''));
        return elem;
    }
    render(args) {
        return null;
    }
    static Load(component) {
        if (typeof document == 'undefined')
            return;
        const c = new component();
        c.reload();
        c.onMount();
    }
}
exports.default = Component;
