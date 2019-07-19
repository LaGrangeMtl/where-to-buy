import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
// import external from 'rollup-plugin-peer-deps-external'
// import postcss from 'rollup-plugin-postcss'
import resolve from 'rollup-plugin-node-resolve'
import url from 'rollup-plugin-url'
// import svgr from '@svgr/rollup'

import pkg from './package.json'

export default {
  input: 'src/index.js',
  context: 'window',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: false
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: false
    }
  ],
  plugins: [
    // external(),
    // postcss({
    //   modules: true
    // }),
    url(),
    // svgr(),
    babel({
      "presets": [
        "@babel/env",
        "@babel/react",
      ],
      exclude: 'node_modules/**',
      plugins: [ '@babel/plugin-proposal-class-properties', '@babel/plugin-proposal-object-rest-spread' ]
    }),
    resolve(),
    commonjs({
      include: 'node_modules/**',
      exclude: [ 'node_modules/xhr2/**'],
      namedExports: {
        'node_modules/react/index.js': ['Component', 'PureComponent', 'Fragment', 'Children', 'createElement']
      }
    })
  ]
}
