/* global fetch */
require("isomorphic-fetch");
const packageJson = require("../../package.json");

const biParams = {
  src: 39
};

const biUserAgent = `Corvid CLI v${packageJson.version}`;

function sendBiEvent(evid) {
  return async (msid, uuid, status = "start", additionalParams = {}) => {
    const eventParams = Object.assign(
      {},
      biParams,
      {
        evid,
        msid,
        uuid,
        csi: process.env.CORVID_SESSION_ID,
        status_text: status
      },
      additionalParams
    );
    const biUrlQueryString = Object.entries(eventParams)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

    return fetch(`http://frog.wix.com/code?${biUrlQueryString}`, {
      headers: { "User-Agent": biUserAgent }
    });
  };
}

module.exports = {
  sendInitEvent: sendBiEvent(200),
  sendOpenEditorEvent: sendBiEvent(201),
  sendPullEvent: sendBiEvent(202)
};