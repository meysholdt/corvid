const loadEditor = require("@wix/fake-local-mode-editor");
const localServer = require("../../src/server");
const { initLocalSite } = require("../utils/localSiteDir");

describe("edit mode", () => {
  it("should send code files to the editor", async () => {
    const localSiteFiles = {
      public: {
        pages: {
          "page1.json": "page code"
        },
        "public-file.json": "public code"
      },
      backend: {
        "sub-folder": {
          "backendFile.jsw": "bakend code"
        }
      }
    };

    const localSitePath = await initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);

    const codeFiles = await editor.getCodeFiles();
    expect(codeFiles).toEqual({
      public: {
        "public-file.json": "public code"
      },
      backend: {
        "sub-folder": {
          "backendFile.jsw": "bakend code"
        }
      }
    });

    await editor.close();
    await server.close();
  });
});