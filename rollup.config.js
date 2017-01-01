const rollupConfig = {
  entry: 'test.js',
  indent: '\t',
  sourceMap: false,
  targets: [
    {
      format: 'cjs',
      dest: 'bundle.cjs.js'
    },
    {
      format: 'es',
      dest: 'bundle.module.js'
    }
  ]
}

export default rollupConfig
/*
    nodeResolve({
      main: true,
      module: true,
      browser: true,
      skip: [],
      extensions: ['.js', '.json']
    })
 */