# :cyclone::wrench: Javascript API

<br>

### `const r = rulo([options])`
Sets up a new instance of `rulo`.
The return value is an event emitter.


###### Basic entry example
```javascript
const r = rulo({ entry: 'app.js' })
// create a new rulo server that watches app.js and bundle it as UMD module.
// The bundle is accessible from http://localhost/app.js
```

###### Entry with explicit output path

```javascript
const r = rulo({
    entry: 'app.js',
    dest: 'scripts/bundle.js',
    format: 'cjs'
})
// create a new rulo server that bundles and watches app.js.
// The bundle is accessible from http://localhost/scripts/bundle.js
```

<br>

### options
`Object`
<br>
All options are optional.

#### `entry` (String)
* Default: `null`
* The bundle's entry point
* if set, it will remove entry/dest/format/targets options from rollup options or the loaded config file
* __:warning: If you pass an entry as first argument of rulo, rulo will automatically serve the bundle in-memory only and in an iife format for convenience.__ You can setup more advanced settings by setting the entry to false or undefined and only use a config file with `options.config` or an object of rollup options with `options.rollup`
* If no entry / config file is given at all, rulo acts as a static HTTP server with LiveReload ability.
<br>

#### `dest` (String)
* Default: value of `options.entry`
* The bundle destination filepath
* This will be used only if `options.entry` is set

#### `format` (String)
* Default: `umd`
* Can be `umd`, `iife`, `cjs`, `es`, `amd`
* If you choose umd or iife you have to set the moduleName options through the CLI or the config file.
* This will be used only if `options.entry` is set

#### `moduleName` (String)
* Module name passed to window.global when the bundle format is umd or iife
* This will be used only if `options.entry` is set

#### `host` (String)
* Default: `'localhost'`
* The host to listen on

#### `port` (Number)
* Default: `8080`
* The base port to use for the rulo server

#### `baseDir` (String)
* Default: `process.cwd()`
* A folder to use as the base path for serving static assets

#### `live` (Boolean)
* Default: `true`
* Enable/Disable LiveReload integration

#### `livePort` (Number)
* Default: `35729`
* The base port to use for the LiveReload server

#### `watchGlob` (Array|String)
* Default: `'**/*.{html,css}'`
* A glob string or array of glob strings to use for LiveReload.
* Only filenames matching that glob will trigger LiveReload events.

#### `middleware` (Array|Function)
* Default: `[]`
* An optional function or array of fn(req, res, next) functions for the server which is run before other routes; using connect style middleware

#### `pushState` (Boolean)
* Default: `false`
* Set to true to enable client-side pushstate router support, which rewrite 404 requests to the server root (`/index.html`)

#### `config` (Boolean|String)
* Default: `false`
* A path to a Rollup config file. See [rollup javascript API](https://github.com/rollup/rollup/wiki/JavaScript-API#rolluprollup-options-) for more informations
* If this is set to `true`, rulo wil try to load from the default rollup config file path (`./rollup.config.js`)

#### `rollup` (Object)
* An object of options passed to `rollup` and `another-rollup-watch`
* Default __if you pass an entry as 1st argument of rulo()__:
```javascript
{
  // main use case is a bundle included in a <script> tag.
  // iife format is the best format for this
  format: 'iife',
  // serve the bundle only in memory
  watch: { inMemory: true, write: false }
}
```
* If the first argument of rulo() is undefined, default is `{}`
* :warning: __Overides properties of the config file passed to `options.config`__
* See [another-rollup-watch API usage](https://github.com/pqml/another-rollup-watch#api-usage) and [rollup javascript API](https://github.com/rollup/rollup/wiki/JavaScript-API#rolluprollup-options-) for more informations

#### `index` (Object)
* An object of options to customize the generated index.html
* `index.title` (String)
    * The `<title>` to use (default: `'rulo'`)
* `index.css` (String|Array)
    * Stylesheets URL (default: `null`)
* `index.script` (String|Array)
    * `<script src>` scripts URL to use (default: _entry filename_)
* `index.force` (Boolean)
    * If true, always generate index.html, even if one is present (default: `false`)

#### `stream` (Writable Stream)
* Default: `process.stdout`
* A writable stream to log rulo activity
* The writable stream must have a `write()` method

#### `overlay` (Boolean)
* Default: `true`
* Set to false to disable the DOM-based error reporter

#### `verbose` (Boolean)
* Default: `false`
* Log additional informations

#### `mute` (Boolean)
* Default: `false`
* If true, don't write anything to the console