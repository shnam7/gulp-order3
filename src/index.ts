import path from 'node:path'
import {Transform, type TransformCallback} from 'node:stream'
import {Minimatch} from 'minimatch'
import type Vinyl from 'vinyl'

export type Options = {
    base?: string
}

function order(patterns?: string | string[], options: Options = {}): Transform {
    patterns ||= [] // accept empty argument
    if (!Array.isArray(patterns)) patterns = [patterns]
    const files: Vinyl[] = []
    const matchers = patterns.map(function (pattern) {
        if (pattern.startsWith('./'))
            throw new Error(
                'Do not start patterns with `./` - they will never match. Just leave out `./`',
            )
        return new Minimatch(pattern)
    })
    const relative = (file: Vinyl): string =>
        options.base ? path.relative(options.base, file.path) : file.relative
    const rank = function (s: string) {
        for (const [index, matcher] of matchers.entries()) {
            if (matcher.match(s)) return index // eslint-disable-line unicorn/prefer-regexp-test
        }

        return matchers.length
    }

    function transform(file: Vinyl, enc: BufferEncoding, cb: TransformCallback) {
        files.push(file)
        cb()
    }

    function flush(cb: () => void) {
        files.sort((a: Vinyl, b: Vinyl) => {
            const aIndex = rank(relative(a))
            const bIndex = rank(relative(b))
            return aIndex === bIndex
                ? String(relative(a)).localeCompare(relative(b))
                : aIndex - bIndex
        })

        for (const file of files) (this as Transform).push(file)
        cb()
    }

    return new Transform({objectMode: true, highWaterMark: 16, transform, flush})
}

export default order
