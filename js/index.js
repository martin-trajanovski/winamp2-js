import "babel-polyfill";
import Raven from "raven-js";
import base from "../skins/base-2.91-png.wsz";
import osx from "../skins/MacOSXAqua1-5.wsz";
import topaz from "../skins/TopazAmp1-2.wsz";
import visor from "../skins/Vizor1-01.wsz";
import xmms from "../skins/XMMS-Turquoise.wsz";
import zaxon from "../skins/ZaxonRemake1-0.wsz";
import green from "../skins/Green-Dimension-V2.wsz";
import Winamp from "./winamp";

import {
  hideAbout,
  skinUrl,
  initialTracks,
  initialState,
  sentryDsn
} from "./config";

Raven.config(sentryDsn).install();

// Don't prompt user to install Winamp2-js. It's probably not
// what they want.
window.addEventListener("beforeinstallprompt", e => {
  // TODO: we could add this as a context menu item, or something.
  e.preventDefault();
});

// Requires Dropbox's Chooser to be loaded on the page
function genAudioFileUrlsFromDropbox() {
  return new Promise((resolve, reject) => {
    if (window.Dropbox == null) {
      reject();
    }
    window.Dropbox.choose({
      success: resolve,
      error: reject,
      linkType: "direct",
      folderselect: false,
      multiselect: true,
      extensions: ["video", "audio"]
    });
  });
}

Raven.context(() => {
  if (hideAbout) {
    document.getElementsByClassName("about")[0].style.visibility = "hidden";
  }
  if (!Winamp.browserIsSupported()) {
    document.getElementById("browser-compatibility").style.display = "block";
    document.getElementById("app").style.visibility = "hidden";
    return;
  }

  const winamp = new Winamp({
    initialSkin: {
      url: skinUrl
    },
    initialTracks,
    availableSkins: [
      { url: base, name: "<Base Skin>" },
      { url: green, name: "Green Dimension V2" },
      { url: osx, name: "Mac OSX v1.5 (Aqua)" },
      { url: topaz, name: "TopazAmp" },
      { url: visor, name: "Vizor" },
      { url: xmms, name: "XMMS Turquoise " },
      { url: zaxon, name: "Zaxon Remake" }
    ],
    filePickers: [
      {
        contextMenuName: "Dropbox...",
        filePicker: async () => {
          const files = await genAudioFileUrlsFromDropbox();
          return files.map(file => ({
            url: file.link,
            defaultName: file.name
          }));
        },
        requiresNetwork: true
      }
    ],
    enableHotkeys: true,
    __initialState: initialState
  });

  winamp.renderWhenReady(document.getElementById("app"));
});
