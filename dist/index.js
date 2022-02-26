"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TBWF = void 0;
const express_1 = __importDefault(require("express"));
const browserify_1 = __importDefault(require("browserify"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uglify_js_1 = __importDefault(require("uglify-js"));
const chalk_1 = __importDefault(require("chalk"));
class TBWF {
    constructor() {
        this.app = (0, express_1.default)();
        this.app.use('/public', express_1.default.static('./build'));
        this.browserify = (0, browserify_1.default)();
        this.browserify.ignore('jsdom');
        // // add files
        // this.browserify.add(path.join(__dirname, '../dist/Element.js'))
        // this.browserify.add(path.join(__dirname, '../dist/Component.js'))
    }
    route(route, component) {
        var _a, _b;
        if (((_a = require.main) === null || _a === void 0 ? void 0 : _a.path) == undefined)
            return;
        const fp = path_1.default.join((_b = require.main) === null || _b === void 0 ? void 0 : _b.path, component);
        const c = require(fp);
        this.browserify.add(fp);
        const instance = new c();
        this.app.get(route, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const r = instance._render({}, true);
            if (r === null)
                res.status(500).json({ error: 'could not find required component' });
            else
                res.send(r.toHTML());
        }));
    }
    build() {
        return new Promise((resolve) => {
            console.log(chalk_1.default.blueBright('Starting build'));
            // // bundle and output
            if (!fs_1.default.existsSync('./build'))
                fs_1.default.mkdirSync('./build');
            this.browserify.bundle().pipe(fs_1.default.createWriteStream('./build/bundle.js')).once('close', () => {
                console.log(chalk_1.default.green('build created successfully'));
                console.log(chalk_1.default.blueBright('Minifying build'));
                fs_1.default.writeFileSync('./build/bundle.min.js', uglify_js_1.default.minify(fs_1.default.readFileSync('./build/bundle.js', 'utf-8'), {
                    mangle: false,
                    compress: {
                        dead_code: true
                    }
                }).code);
                console.log(chalk_1.default.green('build changed from ') +
                    chalk_1.default.yellow(fs_1.default.statSync('./build/bundle.js').size / 1000) +
                    chalk_1.default.green('kb to ') +
                    chalk_1.default.yellow(fs_1.default.statSync('./build/bundle.min.js').size / 1000) +
                    chalk_1.default.green('kb'));
                resolve();
            });
        });
    }
    start(port, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.build();
            this.app.listen(port, callback);
        });
    }
}
exports.TBWF = TBWF;
