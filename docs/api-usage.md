# Javascript API

<br>

### `const r = rulo(entry, [options])`
Sets up a new instance of `rulo`.
The return value is an event emitter.

<br>

### entry
`String` (Default: `undefined`)
<br>
The bundle's entry point. By default, the bundle will be served at the base dir of the rulo server, with the same name as the entry file.<br>

* __By default, the bundle is only written in memory.__
* If no entry is given, rulo will use the entry property passed to `options.rollup`.
* If there is no entry property, rulo will use the entry property from the config file passed to `options.config`
* If no entry / config file is given, rulo acts as a static HTTP server with LiveReload ability.



###### Basic entry example
```javascript
const r = rulo('app.js')
// create a new rulo server that bundles and watches app.js.
// The bundle is accessible from http://localhost/app.js
```

<br>

You can specify the location of the bundle with the syntax `entry.js:bundle.js`.
The path of the output starts from the root of the rulo server, configurable via `options.baseDir`.

###### Entry with explicit output path

```javascript
const r = rulo('app.js:scripts/bundle.js')
// create a new rulo server that bundles and watches app.js.
// The bundle is accessible from http://localhost/scripts/bundle.js
```

<br>

### options
`Object`
<br>
All options are optional.

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
* Enable client-side pushstate router support, which rewrite 404 requests to the server root (`/index.html`)

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
* Overides properties of the config file passed to `options.config`
* See [another-rollup-watch API usage](https://github.com/pqml/another-rollup-watch#api-usage) and [rollup javascript API](https://github.com/rollup/rollup/wiki/JavaScript-API#rolluprollup-options-) for more informations

#### `stream` (Writable Stream)
* Default: `process.stdout`
* A writable stream to log rulo activity
* The writable stream must have a `write()` method

#### `verbose` (Boolean)
* Default: `false`
* Log additional informations