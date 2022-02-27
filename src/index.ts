import express from 'express'
import browserify from 'browserify'
import fs from 'fs'
import path from 'path'
import UglifyJS from 'uglify-js'
import chalk from 'chalk'

export class TBWF {
    app: express.Express
    browserify: browserify.BrowserifyObject

    constructor() {
        this.app = express()
        this.app.use('/public', express.static('./build'))


        this.browserify = browserify()
        this.browserify.ignore('jsdom')
        // // add files
        // this.browserify.add(path.join(__dirname, '../dist/Element.js'))
        // this.browserify.add(path.join(__dirname, '../dist/Component.js'))
    }

    route(route: string, component: string) {
        if (require.main?.path == undefined) return;
        const fp = path.join(require.main?.path, component)
        const c = require(fp)
        this.browserify.add(fp)
        this.app.get(route, async (req: express.Request, res: express.Response) => {
            const instance = new c()
            const r = instance._render({}, true)
            if (r === null) res.status(500).json({ error: 'could not find required component' })
            else res.send(r.toHTML())
        })
    }

    build() {
        return new Promise<void>((resolve) => {
            console.log(chalk.blueBright('Starting build'))
            // // bundle and output
            if (!fs.existsSync('./build')) fs.mkdirSync('./build')
            this.browserify.bundle().pipe(fs.createWriteStream('./build/bundle.js')).once('close', () => {
                console.log(chalk.green('build created successfully'))
                console.log(chalk.blueBright('Minifying build'))
                fs.writeFileSync('./build/bundle.min.js',
                    UglifyJS.minify(fs.readFileSync('./build/bundle.js', 'utf-8'), {
                        mangle: false,
                        compress: {
                            dead_code: true
                        }
                    }).code)
                console.log(
                    chalk.green('build changed from ') +
                    chalk.yellow(fs.statSync('./build/bundle.js').size / 1000) +
                    chalk.green('kb to ') +
                    chalk.yellow(fs.statSync('./build/bundle.min.js').size / 1000) +
                    chalk.green('kb')
                )

                resolve()
            })
        })
    }

    async start(port: number, callback: () => void) {
        await this.build()
        this.app.listen(port, callback)
    }
}