const fs = require('fs-extra')
const rimraf = require('rimraf')
const path = require('path')
const eventually = require('@wix/wix-eventually')
const {localFilesWatcher} = require('../src/watcher')
const basePath = path.resolve('/tmp', 'testDir')
describe('local files watcher', () => {
    beforeEach((done) => {
        rimraf(basePath, () => {
            fs.ensureDirSync(basePath)
            done()
        })
    })
    afterAll(() => {
        rimraf(basePath)
    })
    it("should catch adding of file", async (done)=> {
        const mockFn = jest.fn()
        const watcher = await localFilesWatcher(basePath, mockFn)
        const testFilePath = path.resolve(basePath, 'test.js')
        fs.writeFileSync(testFilePath, 'console.log("test")')
        await eventually(() => {
            expect(mockFn.mock.calls.length).toBe(1)
            expect(mockFn.mock.calls[0][0]).toBe("add")
            expect(mockFn.mock.calls[0][1]).toBe(testFilePath)
        })
        watcher.close()
        done()
    })
    it("should catch deleting of file", async (done)=> {
        const mockFn = jest.fn()
        const testFilePath = path.resolve(basePath, 'test.js')
        fs.writeFileSync(testFilePath, 'console.log("test")')
        const watcher = await localFilesWatcher(basePath, mockFn)
        fs.unlinkSync(testFilePath)
        await eventually(() => {
            expect(mockFn.mock.calls.length).toBe(1)
            expect(mockFn.mock.calls[0][0]).toBe("unlink")
            expect(mockFn.mock.calls[0][1]).toBe(testFilePath)
        })
        watcher.close()
        done()
    })
    it("should catch changing of file", async (done)=> {
        const mockFn = jest.fn()
        const testFilePath = path.resolve(basePath, 'test.js')
        fs.writeFileSync(testFilePath, 'console.log("test")')
        const watcher = await localFilesWatcher(basePath, mockFn)
        fs.writeFileSync(testFilePath, 'console.log("test1")')
        await eventually(() => {
            expect(mockFn.mock.calls.length).toBe(1)
            expect(mockFn.mock.calls[0][0]).toBe("change")
            expect(mockFn.mock.calls[0][1]).toBe(testFilePath)
        })
        watcher.close()
        done()
    })
    it("should not catch adding of file when paused", async (done)=> {
        const mockFn = jest.fn()
        const testFilePath = path.resolve(basePath, 'test.js')
        fs.writeFileSync(testFilePath, 'console.log("test")')
        const watcher = await localFilesWatcher(basePath, mockFn)
        watcher.pause()
        fs.writeFileSync(testFilePath, 'console.log("test1")')
        await new Promise((res) => setTimeout(res, 500))
        watcher.resume()
        const testFilePath1 = path.resolve(basePath, 'test1.js')
        fs.writeFileSync(testFilePath1, 'console.log("test")')
        await eventually(() => {
            expect(mockFn.mock.calls.length).toBe(1)
            expect(mockFn.mock.calls[0][0]).toBe("add")
            expect(mockFn.mock.calls[0][1]).toBe(testFilePath1)
        })
        watcher.close()
        done()
    })
})