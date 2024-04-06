import { describe, expect, it } from 'vitest'
import order from '../src/index.js'
import path from 'path'
import File from 'vinyl'
import type { Transform } from 'streamx'

const cwd = process.cwd()

const orderedStream = (...args: any[]) => order(...args) as unknown as Transform

const newFile = (filepath: string, base?: string): any => {
    if (!base) base = cwd

    return new File({
        path: path.join(base, filepath),
        base,
        cwd,
        contents: Buffer.from('')
    })
}

describe('order()', () => {
    it('accepts no arguments call', () => {
        const stream = orderedStream()
        const files: File[] = []
        stream.on('data', file => files.push(file))
        stream.on('end', () => {
            expect(files.length).toBe(1)
            expect(files[0].relative).to.equal('foo.js')
        })
        stream.write(newFile('foo.js'))
        return stream.end()
    })

    it('accepts non array string argument', () => {
        const stream = orderedStream('foo.js')
        const files: File[] = []
        stream.on('data', file => files.push(file))
        stream.on('end', () => {
            expect(files.length).toBe(1)
            expect(files[0].relative).to.equal('foo.js')
        })
        stream.write(newFile('foo.js'))
        return stream.end()
    })

    it('orders files', (done) => {
        const stream = orderedStream(['foo.js', 'bar.js'])

        const files: File[] = []
        stream.on('data', file => {
            files.push(file)
        })
        stream.on('end', () => {
            expect(files.length).toBe(4)
            expect(files[0].relative).to.equal('foo.js')
            expect(files[1].relative).to.equal('bar.js')
            expect(files[2].relative).to.equal('baz-a.js')
            expect(files[3].relative).to.equal('baz-b.js')
        })

        stream.write(newFile('baz-b.js'))
        stream.write(newFile('bar.js'))
        stream.write(newFile('baz-a.js'))
        stream.write(newFile('foo.js'))
        return stream.end()
    })

    it('supports globs', () => {
        const stream = orderedStream(['vendor/**/*', 'app/**/*'])

        const files: File[] = []
        stream.on('data', files.push.bind(files))
        stream.on('end', function() {
            expect(files.length).to.equal(5)
            expect(files[0].relative).to.equal('vendor/f/b.js')
            expect(files[1].relative).to.equal('vendor/z/a.js')
            expect(files[2].relative).to.equal('app/a.js')
            expect(files[3].relative).to.equal('other/a.js')
            expect(files[4].relative).to.equal('other/b/a.js')
        })

        stream.write(newFile('vendor/f/b.js'))
        stream.write(newFile('app/a.js'))
        stream.write(newFile('vendor/z/a.js'))
        stream.write(newFile('other/a.js'))
        stream.write(newFile('other/b/a.js'))
        return stream.end()
    })

    it('supports a custom base', () => {
        const stream = orderedStream(['scripts/b.css'], { base: cwd })

        const files: File[] = []
        stream.on('data', files.push.bind(files))
        stream.on('end', function() {
            expect(files.length).toEqual(2)
            expect(files[0].relative).to.equal('b.css')
            expect(files[1].relative).to.equal('a.css')
        })

        stream.write(newFile('a.css', path.join(cwd, 'scripts/')))
        stream.write(newFile('b.css', path.join(cwd, 'scripts/')))
        return stream.end()
    })

    return it('warns on relative paths in order list', () =>
        expect(() => order(['./user.js']))
            .to.throw('Do not start patterns with `./` - they will never match. Just leave out `./`')
    )
})
