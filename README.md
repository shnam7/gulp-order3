# gulp-order3

Gulp plugin that re-orders the files in gulp stream.

**Note**

This is written in Typescript referencing the earlier versions, [gulp-order](https://github.com/gulp-community/gulp-order) and [gulp-order2](https://github.com/sphela/gulp-order), to support **ESM** with gulp4.

Install with: npm/pnpm/yarn

```sh
npm i --save-dev gulp-order3

# or

pnpm i --save-dev gulp-order3

# or

yarn add gulp-order2 --dev
```

## Motivation

Assume you want to concatenate the following files in the given order (with `gulp-concat`):

-   `vendor/js1.js`
-   `vendor/**/*.{coffee,js}`
-   `app/coffee1.coffee`
-   `app/**/*.{coffee,js}`

You'll need two streams:

-   A stream that emits the JavaScript files, and
-   a stream that emits the compiled CoffeeScript files.

To combine the streams you can pipe into another `gulp.src` or use `es.merge` (from `event-stream`). But you'll notice that in both cases the files are emitted in the same order as they come in - and this can seem very random. With `gulp-order` you can reorder the files.


## Usage

For ESM mode:
```ts
import order from 'gulp-order3'

// or
import { order } from 'gulp-order3'
```

For CommonJS mode:
```ts
const { order } = require('gulp-order3')
```


## API

```ts
order(patterns?: string | string[], options: Options = {}) => stream.Transform
```

### patterns

pattern can be a string or an array of strings containing filenames in expected sequence. It can also be `undefined`, which results in no ordering.

```javascript
import gulp from 'gulp'
import order from 'gulp-order3'
import coffee from 'gulp-coffee'
import concat from 'gulp-concat'

gulp.src('**/*.coffee')
    .pipe(coffee())
    .pipe(gulp.src('**/*.js')) // gulp.src passes through input
    .pipe(
        order([
            'vendor/js1.js',
            'vendor/**/*.js',
            'app/coffee1.js',
            'app/**/*.js',
        ])
    )
    .pipe(concat('all.js'))
    .pipe(gulp.dest('dist'))
```

## Options

```javascript
gulp
  .src("**/*.coffee")
  // ...
  .pipe(order([...], options))
```

#### `base`

Some plugins might provide a wrong `base` on the Vinyl file objects. `base` allows you to set a base directory (for example: your application root directory) for all files.

## Features

Uses [`minimatch`](https://github.com/isaacs/minimatch) for matching.

## Tips

-   Try to move your ordering out of your `gulp.src(...)` calls into `order(...)` instead.
-   You can see the order of the outputted files with [`gulp-print`](https://github.com/alexgorbatchev/gulp-print)

## Troubleshooting

If your files aren't being ordered in the manner that you expect, try adding the [`base`](#base) option.

Make sure that your environment satisfies following requirements:

-   Node: >=14.13
-   Gulp: >=4.0

## License

MIT - Copyright © 2024 Robin Nam
