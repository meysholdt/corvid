const driver = require("./driver");
const eventually = require("@wix/wix-eventually");
const { localFilesWatcher } = require("../src/watcher");
const basePath = driver.getBasePath();
describe("local files watcher", () => {
  beforeEach(done => {
    driver.clearBasePath(() => {
      driver.watcher.createBasePath();
      done();
    });
  });
  afterAll(() => {
    driver.clearBasePath();
  });
  it("should catch adding of file", async done => {
    const mockFn = jest.fn();
    const watcher = await localFilesWatcher(basePath, mockFn);
    driver.watcher.createFile("test.js", 'console.log("test")');
    await eventually(() => {
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("add", "test.js");
    });
    watcher.close();
    done();
  });
  it("should catch deleting of file", async done => {
    const mockFn = jest.fn();
    driver.watcher.createFile("test.js", 'console.log("test")');
    const watcher = await localFilesWatcher(basePath, mockFn);
    driver.watcher.deleteFile("test.js");
    await eventually(() => {
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("unlink", "test.js");
    });
    watcher.close();
    done();
  });
  it("should catch changing of file", async done => {
    const mockFn = jest.fn();
    driver.watcher.createFile("test.js", 'console.log("test")');
    const watcher = await localFilesWatcher(basePath, mockFn);
    driver.watcher.createFile("test.js", 'console.log("test1")');
    await eventually(() => {
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("change", "test.js");
    });
    watcher.close();
    done();
  });
  it("should not catch adding of file when paused", async done => {
    const mockFn = jest.fn();
    driver.watcher.createFile("test.js", 'console.log("test")');
    const watcher = await localFilesWatcher(basePath, mockFn);
    watcher.pause();
    driver.watcher.createFile("test.js", 'console.log("test1")');
    await new Promise(res => setTimeout(res, 500));
    watcher.resume();
    driver.watcher.createFile("test1.js", 'console.log("test")');
    await eventually(() => {
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("add", "test1.js");
    });
    watcher.close();
    done();
  });
});
