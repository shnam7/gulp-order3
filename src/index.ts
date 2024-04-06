import { Transform } from 'streamx'
import { minimatch } from 'minimatch'
import path from 'path'
import type File from 'vinyl'

export type Options = {
    base?: string
}

const order = function(patterns?: string | string[], options: Options = {}): NodeJS.ReadWriteStream {

    if (!patterns) patterns = []        // accept empty argument
    if (!Array.isArray(patterns)) patterns = [patterns]
    const files: File[] = []

    const matchers = patterns.map(function(pattern) {
        if (pattern.indexOf('./') === 0)
            throw new Error('Do not start patterns with `./` - they will never match. Just leave out `./`')

        return new minimatch.Minimatch(pattern)
    })

    const relative = (file: File): string => (options.base) ? path.relative(options.base, file.path) : file.relative

    const rank = function(s: string) {
        for (let index = 0; index < matchers.length; index++) {
            const matcher = matchers[index]
            if (matcher.match(s)) return index
        }

        return matchers.length
    }

    return new Transform({
        transform(file, cb) {
            files.push(file)
            cb()
        },
        flush(cb) {
            // sort.inplace(files, function(a, b) {
            files.sort((a: File, b: File) => {
                const aIndex = rank(relative(a))
                const bIndex = rank(relative(b))

                if (aIndex === bIndex) {
                    return String(relative(a)).localeCompare(relative(b))
                } else {
                    return aIndex - bIndex
                }
            })
            files.forEach(file => this.push(file))

            cb()
        }
    }) as unknown as NodeJS.ReadWriteStream
}

export { order }
export default order

// ES5/ES6 fallbacks
// module.exports = order
// module.exports.default = order
