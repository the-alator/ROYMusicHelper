/*


 SoundManager 2: JavaScript Sound for the Web
 ----------------------------------------------
 http://schillmania.com/projects/soundmanager2/

 Copyright (c) 2007, Scott Schiller. All rights reserved.
 Code provided under the BSD License:
 http://schillmania.com/projects/soundmanager2/license.txt

 V2.97a.20150601
*/
(function (window, _undefined) {
    if (!window || !window.document) throw new Error("SoundManager requires a browser with window and document objects.");
    var soundManager = null;

    function SoundManager(smURL, smID) {
        this.setupOptions = {
            "url": smURL || null,
            "flashVersion": 8,
            "debugMode": true,
            "debugFlash": false,
            "useConsole": true,
            "consoleOnly": true,
            "waitForWindowLoad": false,
            "bgColor": "#ffffff",
            "useHighPerformance": false,
            "flashPollingInterval": null,
            "html5PollingInterval": null,
            "flashLoadTimeout": 1E3,
            "wmode": null,
            "allowScriptAccess": "always",
            "useFlashBlock": false,
            "useHTML5Audio": true,
            "forceUseGlobalHTML5Audio": false,
            "ignoreMobileRestrictions": false,
            "html5Test": /^(probably|maybe)$/i,
            "preferFlash": false,
            "noSWFCache": false,
            "idPrefix": "sound"
        };
        this.defaultOptions = {
            "autoLoad": false,
            "autoPlay": false,
            "from": null,
            "loops": 1,
            "onid3": null,
            "onload": null,
            "whileloading": null,
            "onplay": null,
            "onpause": null,
            "onresume": null,
            "whileplaying": null,
            "onposition": null,
            "onstop": null,
            "onfailure": null,
            "onfinish": null,
            "multiShot": true,
            "multiShotEvents": false,
            "position": null,
            "pan": 0,
            "stream": true,
            "to": null,
            "type": null,
            "usePolicyFile": false,
            "volume": 100
        };
        this.flash9Options = {
            "isMovieStar": null,
            "usePeakData": false,
            "useWaveformData": false,
            "useEQData": false,
            "onbufferchange": null,
            "ondataerror": null
        };
        this.movieStarOptions = {"bufferTime": 3, "serverURL": null, "onconnect": null, "duration": null};
        this.audioFormats = {
            "mp3": {
                "type": ['audio/mpeg; codecs="mp3"', "audio/mpeg", "audio/mp3", "audio/MPA", "audio/mpa-robust"],
                "required": true
            },
            "mp4": {
                "related": ["aac", "m4a", "m4b"], "type": ['audio/mp4; codecs="mp4a.40.2"',
                    "audio/aac", "audio/x-m4a", "audio/MP4A-LATM", "audio/mpeg4-generic"], "required": false
            },
            "ogg": {"type": ["audio/ogg; codecs=vorbis"], "required": false},
            "opus": {"type": ["audio/ogg; codecs=opus", "audio/opus"], "required": false},
            "wav": {"type": ['audio/wav; codecs="1"', "audio/wav", "audio/wave", "audio/x-wav"], "required": false}
        };
        this.movieID = "sm2-container";
        this.id = smID || "sm2movie";
        this.debugID = "soundmanager-debug";
        this.debugURLParam = /([#?&])debug=1/i;
        this.versionNumber = "V2.97a.20150601";
        this.version = null;
        this.movieURL =
            null;
        this.altURL = null;
        this.swfLoaded = false;
        this.enabled = false;
        this.oMC = null;
        this.sounds = {};
        this.soundIDs = [];
        this.muted = false;
        this.didFlashBlock = false;
        this.filePattern = null;
        this.filePatterns = {"flash8": /\.mp3(\?.*)?$/i, "flash9": /\.mp3(\?.*)?$/i};
        this.features = {
            "buffering": false,
            "peakData": false,
            "waveformData": false,
            "eqData": false,
            "movieStar": false
        };
        this.sandbox = {
            "type": null, "types": {
                "remote": "remote (domain-based) rules",
                "localWithFile": "local with file access (no internet access)",
                "localWithNetwork": "local with network (internet access only, no local access)",
                "localTrusted": "local, trusted (local+internet access)"
            }, "description": null, "noRemote": null, "noLocal": null
        };
        this.html5 = {"usingFlash": null};
        this.flash = {};
        this.html5Only = false;
        this.ignoreFlash = false;
        var SMSound, sm2 = this, globalHTML5Audio = null, flash = null, sm = "soundManager", smc = sm + ": ",
            h5 = "HTML5::", id, ua = navigator.userAgent, wl = window.location.href.toString(), doc = document,
            doNothing, setProperties, init, fV, on_queue = [], debugOpen = true, debugTS, didAppend = false,
            appendSuccess = false, didInit = false, disabled = false, windowLoaded =
                false, _wDS, wdCount = 0, initComplete, mixin, assign, extraOptions, addOnEvent, processOnEvents,
            initUserOnload, delayWaitForEI, waitForEI, rebootIntoHTML5, setVersionInfo, handleFocus, strings, initMovie,
            domContentLoaded, winOnLoad, didDCLoaded, getDocument, createMovie, catchError, setPolling, initDebug,
            debugLevels = ["log", "info", "warn", "error"], defaultFlashVersion = 8, disableObject, failSafely,
            normalizeMovieURL, oRemoved = null, oRemovedHTML = null, str, flashBlockHandler, getSWFCSS, swfCSS,
            toggleDebug, loopFix, policyFix, complain, idCheck,
            waitingForEI = false, initPending = false, startTimer, stopTimer, timerExecute, h5TimerCount = 0,
            h5IntervalTimer = null, parseURL, messages = [], canIgnoreFlash, needsFlash = null, featureCheck, html5OK,
            html5CanPlay, html5Ext, html5Unload, domContentLoadedIE, testHTML5, event, slice = Array.prototype.slice,
            useGlobalHTML5Audio = false, lastGlobalHTML5URL, hasFlash, detectFlash, badSafariFix, html5_events,
            showSupport, flushMessages, wrapCallback, idCounter = 0, didSetup, msecScale = 1E3,
            is_iDevice = ua.match(/(ipad|iphone|ipod)/i), isAndroid = ua.match(/android/i),
            isIE = ua.match(/msie/i), isWebkit = ua.match(/webkit/i),
            isSafari = ua.match(/safari/i) && !ua.match(/chrome/i), isOpera = ua.match(/opera/i),
            mobileHTML5 = ua.match(/(mobile|pre\/|xoom)/i) || is_iDevice || isAndroid,
            isBadSafari = !wl.match(/usehtml5audio/i) && !wl.match(/sm2\-ignorebadua/i) && isSafari && !ua.match(/silk/i) && ua.match(/OS X 10_6_([3-7])/i),
            hasConsole = window.console !== _undefined && console.log !== _undefined,
            isFocused = doc.hasFocus !== _undefined ? doc.hasFocus() : null,
            tryInitOnFocus = isSafari && (doc.hasFocus === _undefined ||
                !doc.hasFocus()), okToDisable = !tryInitOnFocus, flashMIME = /(mp3|mp4|mpa|m4a|m4b)/i,
            emptyURL = "about:blank",
            emptyWAV = "data:audio/wave;base64,/UklGRiYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQIAAAD//w==",
            overHTTP = doc.location ? doc.location.protocol.match(/http/i) : null,
            http = !overHTTP ? "http:/" + "/" : "",
            netStreamMimeTypes = /^\s*audio\/(?:x-)?(?:mpeg4|aac|flv|mov|mp4||m4v|m4a|m4b|mp4v|3gp|3g2)\s*(?:$|;)/i,
            netStreamTypes = ["mpeg4", "aac", "flv", "mov", "mp4", "m4v", "f4v", "m4a", "m4b", "mp4v", "3gp", "3g2"],
            netStreamPattern =
                new RegExp("\\.(" + netStreamTypes.join("|") + ")(\\?.*)?$", "i");
        this.mimePattern = /^\s*audio\/(?:x-)?(?:mp(?:eg|3))\s*(?:$|;)/i;
        this.useAltURL = !overHTTP;
        swfCSS = {
            "swfBox": "sm2-object-box",
            "swfDefault": "movieContainer",
            "swfError": "swf_error",
            "swfTimedout": "swf_timedout",
            "swfLoaded": "swf_loaded",
            "swfUnblocked": "swf_unblocked",
            "sm2Debug": "sm2_debug",
            "highPerf": "high_performance",
            "flashDebug": "flash_debug"
        };
        this.hasHTML5 = function () {
            try {
                return Audio !== _undefined && (isOpera && opera !== _undefined && opera.version() <
                10 ? new Audio(null) : new Audio).canPlayType !== _undefined
            } catch (e) {
                return false
            }
        }();
        this.setup = function (options) {
            var noURL = !sm2.url;
            if (options !== _undefined && didInit && needsFlash && sm2.ok() && (options.flashVersion !== _undefined || options.url !== _undefined || options.html5Test !== _undefined)) complain(str("setupLate"));
            assign(options);
            if (!useGlobalHTML5Audio) if (mobileHTML5) {
                if (!sm2.setupOptions.ignoreMobileRestrictions || sm2.setupOptions.forceUseGlobalHTML5Audio) {
                    messages.push(strings.globalHTML5);
                    useGlobalHTML5Audio =
                        true
                }
            } else if (sm2.setupOptions.forceUseGlobalHTML5Audio) {
                messages.push(strings.globalHTML5);
                useGlobalHTML5Audio = true
            }
            if (!didSetup && mobileHTML5) if (sm2.setupOptions.ignoreMobileRestrictions) messages.push(strings.ignoreMobile); else {
                if (!sm2.setupOptions.useHTML5Audio || sm2.setupOptions.preferFlash) sm2._wD(strings.mobileUA);
                sm2.setupOptions.useHTML5Audio = true;
                sm2.setupOptions.preferFlash = false;
                if (is_iDevice) sm2.ignoreFlash = true; else if (isAndroid && !ua.match(/android\s2\.3/i) || !isAndroid) {
                    sm2._wD(strings.globalHTML5);
                    useGlobalHTML5Audio = true
                }
            }
            if (options) {
                if (noURL && didDCLoaded && options.url !== _undefined) sm2.beginDelayedInit();
                if (!didDCLoaded && options.url !== _undefined && doc.readyState === "complete") setTimeout(domContentLoaded, 1)
            }
            didSetup = true;
            return sm2
        };
        this.ok = function () {
            return needsFlash ? didInit && !disabled : sm2.useHTML5Audio && sm2.hasHTML5
        };
        this.supported = this.ok;
        this.getMovie = function (smID) {
            return id(smID) || doc[smID] || window[smID]
        };
        this.createSound = function (oOptions, _url) {
            var cs, cs_string, options, oSound = null;
            cs =
                sm + ".createSound(): ";
            cs_string = cs + str(!didInit ? "notReady" : "notOK");
            if (!didInit || !sm2.ok()) {
                complain(cs_string);
                return false
            }
            if (_url !== _undefined) oOptions = {"id": oOptions, "url": _url};
            options = mixin(oOptions);
            options.url = parseURL(options.url);
            if (options.id === _undefined) options.id = sm2.setupOptions.idPrefix + idCounter++;
            if (options.id.toString().charAt(0).match(/^[0-9]$/)) sm2._wD(cs + str("badID", options.id), 2);
            sm2._wD(cs + options.id + (options.url ? " (" + options.url + ")" : ""), 1);
            if (idCheck(options.id, true)) {
                sm2._wD(cs +
                    options.id + " exists", 1);
                return sm2.sounds[options.id]
            }

            function make() {
                options = loopFix(options);
                sm2.sounds[options.id] = new SMSound(options);
                sm2.soundIDs.push(options.id);
                return sm2.sounds[options.id]
            }

            if (html5OK(options)) {
                oSound = make();
                if (!sm2.html5Only) sm2._wD(options.id + ": Using HTML5");
                oSound._setup_html5(options)
            } else {
                if (sm2.html5Only) {
                    sm2._wD(options.id + ": No HTML5 support for this sound, and no Flash. Exiting.");
                    return make()
                }
                if (sm2.html5.usingFlash && options.url && options.url.match(/data:/i)) {
                    sm2._wD(options.id +
                        ": data: URIs not supported via Flash. Exiting.");
                    return make()
                }
                if (fV > 8) {
                    if (options.isMovieStar === null) options.isMovieStar = !!(options.serverURL || (options.type ? options.type.match(netStreamMimeTypes) : false) || options.url && options.url.match(netStreamPattern));
                    if (options.isMovieStar) {
                        sm2._wD(cs + "using MovieStar handling");
                        if (options.loops > 1) _wDS("noNSLoop")
                    }
                }
                options = policyFix(options, cs);
                oSound = make();
                if (fV === 8) flash._createSound(options.id, options.loops || 1, options.usePolicyFile); else {
                    flash._createSound(options.id,
                        options.url, options.usePeakData, options.useWaveformData, options.useEQData, options.isMovieStar, options.isMovieStar ? options.bufferTime : false, options.loops || 1, options.serverURL, options.duration || null, options.autoPlay, true, options.autoLoad, options.usePolicyFile);
                    if (!options.serverURL) {
                        oSound.connected = true;
                        if (options.onconnect) options.onconnect.apply(oSound)
                    }
                }
                if (!options.serverURL && (options.autoLoad || options.autoPlay)) oSound.load(options)
            }
            if (!options.serverURL && options.autoPlay) oSound.play();
            return oSound
        };
        this.destroySound = function (sID, _bFromSound) {
            if (!idCheck(sID)) return false;
            var oS = sm2.sounds[sID], i;
            oS.stop();
            oS._iO = {};
            oS.unload();
            for (i = 0; i < sm2.soundIDs.length; i++) if (sm2.soundIDs[i] === sID) {
                sm2.soundIDs.splice(i, 1);
                break
            }
            if (!_bFromSound) oS.destruct(true);
            oS = null;
            delete sm2.sounds[sID];
            return true
        };
        this.load = function (sID, oOptions) {
            if (!idCheck(sID)) return false;
            return sm2.sounds[sID].load(oOptions)
        };
        this.unload = function (sID) {
            if (!idCheck(sID)) return false;
            return sm2.sounds[sID].unload()
        };
        this.onPosition =
            function (sID, nPosition, oMethod, oScope) {
                if (!idCheck(sID)) return false;
                return sm2.sounds[sID].onposition(nPosition, oMethod, oScope)
            };
        this.onposition = this.onPosition;
        this.clearOnPosition = function (sID, nPosition, oMethod) {
            if (!idCheck(sID)) return false;
            return sm2.sounds[sID].clearOnPosition(nPosition, oMethod)
        };
        this.play = function (sID, oOptions) {
            var result = null, overloaded = oOptions && !(oOptions instanceof Object);
            if (!didInit || !sm2.ok()) {
                complain(sm + ".play(): " + str(!didInit ? "notReady" : "notOK"));
                return false
            }
            if (!idCheck(sID,
                overloaded)) {
                if (!overloaded) return false;
                if (overloaded) oOptions = {url: oOptions};
                if (oOptions && oOptions.url) {
                    sm2._wD(sm + '.play(): Attempting to create "' + sID + '"', 1);
                    oOptions.id = sID;
                    result = sm2.createSound(oOptions).play()
                }
            } else if (overloaded) oOptions = {url: oOptions};
            if (result === null) result = sm2.sounds[sID].play(oOptions);
            return result
        };
        this.start = this.play;
        this.setPosition = function (sID, nMsecOffset) {
            if (!idCheck(sID)) return false;
            return sm2.sounds[sID].setPosition(nMsecOffset)
        };
        this.stop = function (sID) {
            if (!idCheck(sID)) return false;
            sm2._wD(sm + ".stop(" + sID + ")", 1);
            return sm2.sounds[sID].stop()
        };
        this.stopAll = function () {
            var oSound;
            sm2._wD(sm + ".stopAll()", 1);
            for (oSound in sm2.sounds) if (sm2.sounds.hasOwnProperty(oSound)) sm2.sounds[oSound].stop()
        };
        this.pause = function (sID) {
            if (!idCheck(sID)) return false;
            return sm2.sounds[sID].pause()
        };
        this.pauseAll = function () {
            var i;
            for (i = sm2.soundIDs.length - 1; i >= 0; i--) sm2.sounds[sm2.soundIDs[i]].pause()
        };
        this.resume = function (sID) {
            if (!idCheck(sID)) return false;
            return sm2.sounds[sID].resume()
        };
        this.resumeAll =
            function () {
                var i;
                for (i = sm2.soundIDs.length - 1; i >= 0; i--) sm2.sounds[sm2.soundIDs[i]].resume()
            };
        this.togglePause = function (sID) {
            if (!idCheck(sID)) return false;
            return sm2.sounds[sID].togglePause()
        };
        this.setPan = function (sID, nPan) {
            if (!idCheck(sID)) return false;
            return sm2.sounds[sID].setPan(nPan)
        };
        this.setVolume = function (sID, nVol) {
            var i, j;
            if (sID !== _undefined && !isNaN(sID) && nVol === _undefined) {
                for (i = 0, j = sm2.soundIDs.length; i < j; i++) sm2.sounds[sm2.soundIDs[i]].setVolume(sID);
                return
            }
            if (!idCheck(sID)) return false;
            return sm2.sounds[sID].setVolume(nVol)
        };
        this.mute = function (sID) {
            var i = 0;
            if (sID instanceof String) sID = null;
            if (!sID) {
                sm2._wD(sm + ".mute(): Muting all sounds");
                for (i = sm2.soundIDs.length - 1; i >= 0; i--) sm2.sounds[sm2.soundIDs[i]].mute();
                sm2.muted = true
            } else {
                if (!idCheck(sID)) return false;
                sm2._wD(sm + '.mute(): Muting "' + sID + '"');
                return sm2.sounds[sID].mute()
            }
            return true
        };
        this.muteAll = function () {
            sm2.mute()
        };
        this.unmute = function (sID) {
            var i;
            if (sID instanceof String) sID = null;
            if (!sID) {
                sm2._wD(sm + ".unmute(): Unmuting all sounds");
                for (i = sm2.soundIDs.length - 1; i >= 0; i--) sm2.sounds[sm2.soundIDs[i]].unmute();
                sm2.muted = false
            } else {
                if (!idCheck(sID)) return false;
                sm2._wD(sm + '.unmute(): Unmuting "' + sID + '"');
                return sm2.sounds[sID].unmute()
            }
            return true
        };
        this.unmuteAll = function () {
            sm2.unmute()
        };
        this.toggleMute = function (sID) {
            if (!idCheck(sID)) return false;
            return sm2.sounds[sID].toggleMute()
        };
        this.getMemoryUse = function () {
            var ram = 0;
            if (flash && fV !== 8) ram = parseInt(flash._getMemoryUse(), 10);
            return ram
        };
        this.disable = function (bNoDisable) {
            var i;
            if (bNoDisable ===
                _undefined) bNoDisable = false;
            if (disabled) return false;
            disabled = true;
            _wDS("shutdown", 1);
            for (i = sm2.soundIDs.length - 1; i >= 0; i--) disableObject(sm2.sounds[sm2.soundIDs[i]]);
            initComplete(bNoDisable);
            event.remove(window, "load", initUserOnload);
            return true
        };
        this.canPlayMIME = function (sMIME) {
            var result;
            if (sm2.hasHTML5) result = html5CanPlay({type: sMIME});
            if (!result && needsFlash) result = sMIME && sm2.ok() ? !!((fV > 8 ? sMIME.match(netStreamMimeTypes) : null) || sMIME.match(sm2.mimePattern)) : null;
            return result
        };
        this.canPlayURL =
            function (sURL) {
                var result;
                if (sm2.hasHTML5) result = html5CanPlay({url: sURL});
                if (!result && needsFlash) result = sURL && sm2.ok() ? !!sURL.match(sm2.filePattern) : null;
                return result
            };
        this.canPlayLink = function (oLink) {
            if (oLink.type !== _undefined && oLink.type) if (sm2.canPlayMIME(oLink.type)) return true;
            return sm2.canPlayURL(oLink.href)
        };
        this.getSoundById = function (sID, _suppressDebug) {
            if (!sID) return null;
            var result = sm2.sounds[sID];
            if (!result && !_suppressDebug) sm2._wD(sm + '.getSoundById(): Sound "' + sID + '" not found.', 2);
            return result
        };
        this.onready = function (oMethod, oScope) {
            var sType = "onready", result = false;
            if (typeof oMethod === "function") {
                if (didInit) sm2._wD(str("queue", sType));
                if (!oScope) oScope = window;
                addOnEvent(sType, oMethod, oScope);
                processOnEvents();
                result = true
            } else throw str("needFunction", sType);
            return result
        };
        this.ontimeout = function (oMethod, oScope) {
            var sType = "ontimeout", result = false;
            if (typeof oMethod === "function") {
                if (didInit) sm2._wD(str("queue", sType));
                if (!oScope) oScope = window;
                addOnEvent(sType, oMethod, oScope);
                processOnEvents({type: sType});
                result = true
            } else throw str("needFunction", sType);
            return result
        };
        this._writeDebug = function (sText, sTypeOrObject) {
            var sDID = "soundmanager-debug", o, oItem;
            if (!sm2.setupOptions.debugMode) return false;
            if (hasConsole && sm2.useConsole) {
                if (sTypeOrObject && typeof sTypeOrObject === "object") console.log(sText, sTypeOrObject); else if (debugLevels[sTypeOrObject] !== _undefined) console[debugLevels[sTypeOrObject]](sText); else console.log(sText);
                if (sm2.consoleOnly) return true
            }
            o = id(sDID);
            if (!o) return false;
            oItem = doc.createElement("div");
            if (++wdCount % 2 === 0) oItem.className = "sm2-alt";
            if (sTypeOrObject === _undefined) sTypeOrObject = 0; else sTypeOrObject = parseInt(sTypeOrObject, 10);
            oItem.appendChild(doc.createTextNode(sText));
            if (sTypeOrObject) {
                if (sTypeOrObject >= 2) oItem.style.fontWeight = "bold";
                if (sTypeOrObject === 3) oItem.style.color = "#ff3333"
            }
            o.insertBefore(oItem, o.firstChild);
            o = null;
            return true
        };
        if (wl.indexOf("sm2-debug=alert") !== -1) this._writeDebug = function (sText) {
            window.alert(sText)
        };
        this._wD = this._writeDebug;
        this._debug = function () {
            var i, j;
            _wDS("currentObj", 1);
            for (i = 0, j = sm2.soundIDs.length; i < j; i++) sm2.sounds[sm2.soundIDs[i]]._debug()
        };
        this.reboot = function (resetEvents, excludeInit) {
            if (sm2.soundIDs.length) sm2._wD("Destroying " + sm2.soundIDs.length + " SMSound object" + (sm2.soundIDs.length !== 1 ? "s" : "") + "...");
            var i, j, k;
            for (i = sm2.soundIDs.length - 1; i >= 0; i--) sm2.sounds[sm2.soundIDs[i]].destruct();
            if (flash) try {
                if (isIE) oRemovedHTML = flash.innerHTML;
                oRemoved = flash.parentNode.removeChild(flash)
            } catch (e) {
                _wDS("badRemove",
                    2)
            }
            oRemovedHTML = oRemoved = needsFlash = flash = null;
            sm2.enabled = didDCLoaded = didInit = waitingForEI = initPending = didAppend = appendSuccess = disabled = useGlobalHTML5Audio = sm2.swfLoaded = false;
            sm2.soundIDs = [];
            sm2.sounds = {};
            idCounter = 0;
            didSetup = false;
            if (!resetEvents) for (i in on_queue) {
                if (on_queue.hasOwnProperty(i)) for (j = 0, k = on_queue[i].length; j < k; j++) on_queue[i][j].fired = false
            } else on_queue = [];
            if (!excludeInit) sm2._wD(sm + ": Rebooting...");
            sm2.html5 = {"usingFlash": null};
            sm2.flash = {};
            sm2.html5Only = false;
            sm2.ignoreFlash =
                false;
            window.setTimeout(function () {
                if (!excludeInit) sm2.beginDelayedInit()
            }, 20);
            return sm2
        };
        this.reset = function () {
            _wDS("reset");
            return sm2.reboot(true, true)
        };
        this.getMoviePercent = function () {
            return flash && "PercentLoaded" in flash ? flash.PercentLoaded() : null
        };
        this.beginDelayedInit = function () {
            windowLoaded = true;
            domContentLoaded();
            setTimeout(function () {
                if (initPending) return false;
                createMovie();
                initMovie();
                initPending = true;
                return true
            }, 20);
            delayWaitForEI()
        };
        this.destruct = function () {
            sm2._wD(sm + ".destruct()");
            sm2.disable(true)
        };
        SMSound = function (oOptions) {
            var s = this, resetProperties, add_html5_events, remove_html5_events, stop_html5_timer, start_html5_timer,
                attachOnPosition, onplay_called = false, onPositionItems = [], onPositionFired = 0, detachOnPosition,
                applyFromTo, lastURL = null, lastHTML5State, urlOmitted;
            lastHTML5State = {duration: null, time: null};
            this.id = oOptions.id;
            this.sID = this.id;
            this.url = oOptions.url;
            this.options = mixin(oOptions);
            this.instanceOptions = this.options;
            this._iO = this.instanceOptions;
            this.pan = this.options.pan;
            this.volume = this.options.volume;
            this.isHTML5 = false;
            this._a = null;
            urlOmitted = this.url ? false : true;
            this.id3 = {};
            this._debug = function () {
                sm2._wD(s.id + ": Merged options:", s.options)
            };
            this.load = function (oOptions) {
                var oSound = null, instanceOptions;
                if (oOptions !== _undefined) s._iO = mixin(oOptions, s.options); else {
                    oOptions = s.options;
                    s._iO = oOptions;
                    if (lastURL && lastURL !== s.url) {
                        _wDS("manURL");
                        s._iO.url = s.url;
                        s.url = null
                    }
                }
                if (!s._iO.url) s._iO.url = s.url;
                s._iO.url = parseURL(s._iO.url);
                s.instanceOptions = s._iO;
                instanceOptions =
                    s._iO;
                sm2._wD(s.id + ": load (" + instanceOptions.url + ")");
                if (!instanceOptions.url && !s.url) {
                    sm2._wD(s.id + ": load(): url is unassigned. Exiting.", 2);
                    return s
                }
                if (!s.isHTML5 && fV === 8 && !s.url && !instanceOptions.autoPlay) sm2._wD(s.id + ": Flash 8 load() limitation: Wait for onload() before calling play().", 1);
                if (instanceOptions.url === s.url && s.readyState !== 0 && s.readyState !== 2) {
                    _wDS("onURL", 1);
                    if (s.readyState === 3 && instanceOptions.onload) wrapCallback(s, function () {
                        instanceOptions.onload.apply(s, [!!s.duration])
                    });
                    return s
                }
                s.loaded = false;
                s.readyState = 1;
                s.playState = 0;
                s.id3 = {};
                if (html5OK(instanceOptions)) {
                    oSound = s._setup_html5(instanceOptions);
                    if (!oSound._called_load) {
                        s._html5_canplay = false;
                        if (s.url !== instanceOptions.url) {
                            sm2._wD(_wDS("manURL") + ": " + instanceOptions.url);
                            s._a.src = instanceOptions.url;
                            s.setPosition(0)
                        }
                        s._a.autobuffer = "auto";
                        s._a.preload = "auto";
                        s._a._called_load = true
                    } else sm2._wD(s.id + ": Ignoring request to load again")
                } else {
                    if (sm2.html5Only) {
                        sm2._wD(s.id + ": No flash support. Exiting.");
                        return s
                    }
                    if (s._iO.url &&
                        s._iO.url.match(/data:/i)) {
                        sm2._wD(s.id + ": data: URIs not supported via Flash. Exiting.");
                        return s
                    }
                    try {
                        s.isHTML5 = false;
                        s._iO = policyFix(loopFix(instanceOptions));
                        if (s._iO.autoPlay && (s._iO.position || s._iO.from)) {
                            sm2._wD(s.id + ": Disabling autoPlay because of non-zero offset case");
                            s._iO.autoPlay = false
                        }
                        instanceOptions = s._iO;
                        if (fV === 8) flash._load(s.id, instanceOptions.url, instanceOptions.stream, instanceOptions.autoPlay, instanceOptions.usePolicyFile); else flash._load(s.id, instanceOptions.url, !!instanceOptions.stream,
                            !!instanceOptions.autoPlay, instanceOptions.loops || 1, !!instanceOptions.autoLoad, instanceOptions.usePolicyFile)
                    } catch (e) {
                        _wDS("smError", 2);
                        debugTS("onload", false);
                        catchError({type: "SMSOUND_LOAD_JS_EXCEPTION", fatal: true})
                    }
                }
                s.url = instanceOptions.url;
                return s
            };
            this.unload = function () {
                if (s.readyState !== 0) {
                    sm2._wD(s.id + ": unload()");
                    if (!s.isHTML5) if (fV === 8) flash._unload(s.id, emptyURL); else flash._unload(s.id); else {
                        stop_html5_timer();
                        if (s._a) {
                            s._a.pause();
                            lastURL = html5Unload(s._a)
                        }
                    }
                    resetProperties()
                }
                return s
            };
            this.destruct = function (_bFromSM) {
                sm2._wD(s.id + ": Destruct");
                if (!s.isHTML5) {
                    s._iO.onfailure = null;
                    flash._destroySound(s.id)
                } else {
                    stop_html5_timer();
                    if (s._a) {
                        s._a.pause();
                        html5Unload(s._a);
                        if (!useGlobalHTML5Audio) remove_html5_events();
                        s._a._s = null;
                        s._a = null
                    }
                }
                if (!_bFromSM) sm2.destroySound(s.id, true)
            };
            this.play = function (oOptions, _updatePlayState) {
                var fN, allowMulti, a, onready, audioClone, onended, oncanplay, startOK = true, exit = null;
                fN = s.id + ": play(): ";
                _updatePlayState = _updatePlayState === _undefined ? true : _updatePlayState;
                if (!oOptions) oOptions = {};
                if (s.url) s._iO.url = s.url;
                s._iO = mixin(s._iO, s.options);
                s._iO = mixin(oOptions, s._iO);
                s._iO.url = parseURL(s._iO.url);
                s.instanceOptions = s._iO;
                if (!s.isHTML5 && s._iO.serverURL && !s.connected) {
                    if (!s.getAutoPlay()) {
                        sm2._wD(fN + " Netstream not connected yet - setting autoPlay");
                        s.setAutoPlay(true)
                    }
                    return s
                }
                if (html5OK(s._iO)) {
                    s._setup_html5(s._iO);
                    start_html5_timer()
                }
                if (s.playState === 1 && !s.paused) {
                    allowMulti = s._iO.multiShot;
                    if (!allowMulti) {
                        sm2._wD(fN + "Already playing (one-shot)", 1);
                        if (s.isHTML5) s.setPosition(s._iO.position);
                        exit = s
                    } else sm2._wD(fN + "Already playing (multi-shot)", 1)
                }
                if (exit !== null) return exit;
                if (oOptions.url && oOptions.url !== s.url) if (!s.readyState && !s.isHTML5 && fV === 8 && urlOmitted) urlOmitted = false; else s.load(s._iO);
                if (!s.loaded) if (s.readyState === 0) {
                    sm2._wD(fN + "Attempting to load");
                    if (!s.isHTML5 && !sm2.html5Only) {
                        s._iO.autoPlay = true;
                        s.load(s._iO)
                    } else if (s.isHTML5) s.load(s._iO); else {
                        sm2._wD(fN + "Unsupported type. Exiting.");
                        exit = s
                    }
                    s.instanceOptions = s._iO
                } else if (s.readyState === 2) {
                    sm2._wD(fN + "Could not load - exiting",
                        2);
                    exit = s
                } else sm2._wD(fN + "Loading - attempting to play..."); else sm2._wD(fN.substr(0, fN.lastIndexOf(":")));
                if (exit !== null) return exit;
                if (!s.isHTML5 && fV === 9 && s.position > 0 && s.position === s.duration) {
                    sm2._wD(fN + "Sound at end, resetting to position: 0");
                    oOptions.position = 0
                }
                if (s.paused && s.position >= 0 && (!s._iO.serverURL || s.position > 0)) {
                    sm2._wD(fN + "Resuming from paused state", 1);
                    s.resume()
                } else {
                    s._iO = mixin(oOptions, s._iO);
                    if ((!s.isHTML5 && s._iO.position !== null && s._iO.position > 0 || s._iO.from !== null && s._iO.from >
                        0 || s._iO.to !== null) && s.instanceCount === 0 && s.playState === 0 && !s._iO.serverURL) {
                        onready = function () {
                            s._iO = mixin(oOptions, s._iO);
                            s.play(s._iO)
                        };
                        if (s.isHTML5 && !s._html5_canplay) {
                            sm2._wD(fN + "Beginning load for non-zero offset case");
                            s.load({_oncanplay: onready});
                            exit = false
                        } else if (!s.isHTML5 && !s.loaded && (!s.readyState || s.readyState !== 2)) {
                            sm2._wD(fN + "Preloading for non-zero offset case");
                            s.load({onload: onready});
                            exit = false
                        }
                        if (exit !== null) return exit;
                        s._iO = applyFromTo()
                    }
                    if (!s.instanceCount || s._iO.multiShotEvents ||
                        s.isHTML5 && s._iO.multiShot && !useGlobalHTML5Audio || !s.isHTML5 && fV > 8 && !s.getAutoPlay()) s.instanceCount++;
                    if (s._iO.onposition && s.playState === 0) attachOnPosition(s);
                    s.playState = 1;
                    s.paused = false;
                    s.position = s._iO.position !== _undefined && !isNaN(s._iO.position) ? s._iO.position : 0;
                    if (!s.isHTML5) s._iO = policyFix(loopFix(s._iO));
                    if (s._iO.onplay && _updatePlayState) {
                        s._iO.onplay.apply(s);
                        onplay_called = true
                    }
                    s.setVolume(s._iO.volume, true);
                    s.setPan(s._iO.pan, true);
                    if (!s.isHTML5) {
                        startOK = flash._start(s.id, s._iO.loops ||
                            1, fV === 9 ? s.position : s.position / msecScale, s._iO.multiShot || false);
                        if (fV === 9 && !startOK) {
                            sm2._wD(fN + "No sound hardware, or 32-sound ceiling hit", 2);
                            if (s._iO.onplayerror) s._iO.onplayerror.apply(s)
                        }
                    } else if (s.instanceCount < 2) {
                        start_html5_timer();
                        a = s._setup_html5();
                        s.setPosition(s._iO.position);
                        a.play()
                    } else {
                        sm2._wD(s.id + ": Cloning Audio() for instance #" + s.instanceCount + "...");
                        audioClone = new Audio(s._iO.url);
                        onended = function () {
                            event.remove(audioClone, "ended", onended);
                            s._onfinish(s);
                            html5Unload(audioClone);
                            audioClone = null
                        };
                        oncanplay = function () {
                            event.remove(audioClone, "canplay", oncanplay);
                            try {
                                audioClone.currentTime = s._iO.position / msecScale
                            } catch (err) {
                                complain(s.id + ": multiShot play() failed to apply position of " + s._iO.position / msecScale)
                            }
                            audioClone.play()
                        };
                        event.add(audioClone, "ended", onended);
                        if (s._iO.volume !== _undefined) audioClone.volume = Math.max(0, Math.min(1, s._iO.volume / 100));
                        if (s.muted) audioClone.muted = true;
                        if (s._iO.position) event.add(audioClone, "canplay", oncanplay); else audioClone.play()
                    }
                }
                return s
            };
            this.start = this.play;
            this.stop = function (bAll) {
                var instanceOptions = s._iO, originalPosition;
                if (s.playState === 1) {
                    sm2._wD(s.id + ": stop()");
                    s._onbufferchange(0);
                    s._resetOnPosition(0);
                    s.paused = false;
                    if (!s.isHTML5) s.playState = 0;
                    detachOnPosition();
                    if (instanceOptions.to) s.clearOnPosition(instanceOptions.to);
                    if (!s.isHTML5) {
                        flash._stop(s.id, bAll);
                        if (instanceOptions.serverURL) s.unload()
                    } else if (s._a) {
                        originalPosition = s.position;
                        s.setPosition(0);
                        s.position = originalPosition;
                        s._a.pause();
                        s.playState = 0;
                        s._onTimer();
                        stop_html5_timer()
                    }
                    s.instanceCount = 0;
                    s._iO = {};
                    if (instanceOptions.onstop) instanceOptions.onstop.apply(s)
                }
                return s
            };
            this.setAutoPlay = function (autoPlay) {
                sm2._wD(s.id + ": Autoplay turned " + (autoPlay ? "on" : "off"));
                s._iO.autoPlay = autoPlay;
                if (!s.isHTML5) {
                    flash._setAutoPlay(s.id, autoPlay);
                    if (autoPlay) if (!s.instanceCount && s.readyState === 1) {
                        s.instanceCount++;
                        sm2._wD(s.id + ": Incremented instance count to " + s.instanceCount)
                    }
                }
            };
            this.getAutoPlay = function () {
                return s._iO.autoPlay
            };
            this.setPosition = function (nMsecOffset) {
                if (nMsecOffset ===
                    _undefined) nMsecOffset = 0;
                var position, position1K,
                    offset = s.isHTML5 ? Math.max(nMsecOffset, 0) : Math.min(s.duration || s._iO.duration, Math.max(nMsecOffset, 0));
                s.position = offset;
                position1K = s.position / msecScale;
                s._resetOnPosition(s.position);
                s._iO.position = offset;
                if (!s.isHTML5) {
                    position = fV === 9 ? s.position : position1K;
                    if (s.readyState && s.readyState !== 2) flash._setPosition(s.id, position, s.paused || !s.playState, s._iO.multiShot)
                } else if (s._a) {
                    if (s._html5_canplay) {
                        if (s._a.currentTime !== position1K) {
                            sm2._wD(s.id + ": setPosition(" +
                                position1K + ")");
                            try {
                                s._a.currentTime = position1K;
                                if (s.playState === 0 || s.paused) s._a.pause()
                            } catch (e) {
                                sm2._wD(s.id + ": setPosition(" + position1K + ") failed: " + e.message, 2)
                            }
                        }
                    } else if (position1K) {
                        sm2._wD(s.id + ": setPosition(" + position1K + "): Cannot seek yet, sound not ready", 2);
                        return s
                    }
                    if (s.paused) s._onTimer(true)
                }
                return s
            };
            this.pause = function (_bCallFlash) {
                if (s.paused || s.playState === 0 && s.readyState !== 1) return s;
                sm2._wD(s.id + ": pause()");
                s.paused = true;
                if (!s.isHTML5) {
                    if (_bCallFlash || _bCallFlash === _undefined) flash._pause(s.id,
                        s._iO.multiShot)
                } else {
                    s._setup_html5().pause();
                    stop_html5_timer()
                }
                if (s._iO.onpause) s._iO.onpause.apply(s);
                return s
            };
            this.resume = function () {
                var instanceOptions = s._iO;
                if (!s.paused) return s;
                sm2._wD(s.id + ": resume()");
                s.paused = false;
                s.playState = 1;
                if (!s.isHTML5) {
                    if (instanceOptions.isMovieStar && !instanceOptions.serverURL) s.setPosition(s.position);
                    flash._pause(s.id, instanceOptions.multiShot)
                } else {
                    s._setup_html5().play();
                    start_html5_timer()
                }
                if (!onplay_called && instanceOptions.onplay) {
                    instanceOptions.onplay.apply(s);
                    onplay_called = true
                } else if (instanceOptions.onresume) instanceOptions.onresume.apply(s);
                return s
            };
            this.togglePause = function () {
                sm2._wD(s.id + ": togglePause()");
                if (s.playState === 0) {
                    s.play({position: fV === 9 && !s.isHTML5 ? s.position : s.position / msecScale});
                    return s
                }
                if (s.paused) s.resume(); else s.pause();
                return s
            };
            this.setPan = function (nPan, bInstanceOnly) {
                if (nPan === _undefined) nPan = 0;
                if (bInstanceOnly === _undefined) bInstanceOnly = false;
                if (!s.isHTML5) flash._setPan(s.id, nPan);
                s._iO.pan = nPan;
                if (!bInstanceOnly) {
                    s.pan =
                        nPan;
                    s.options.pan = nPan
                }
                return s
            };
            this.setVolume = function (nVol, _bInstanceOnly) {
                if (nVol === _undefined) nVol = 100;
                if (_bInstanceOnly === _undefined) _bInstanceOnly = false;
                if (!s.isHTML5) flash._setVolume(s.id, sm2.muted && !s.muted || s.muted ? 0 : nVol); else if (s._a) {
                    if (sm2.muted && !s.muted) {
                        s.muted = true;
                        s._a.muted = true
                    }
                    s._a.volume = Math.max(0, Math.min(1, nVol / 100))
                }
                s._iO.volume = nVol;
                if (!_bInstanceOnly) {
                    s.volume = nVol;
                    s.options.volume = nVol
                }
                return s
            };
            this.mute = function () {
                s.muted = true;
                if (!s.isHTML5) flash._setVolume(s.id, 0);
                else if (s._a) s._a.muted = true;
                return s
            };
            this.unmute = function () {
                s.muted = false;
                var hasIO = s._iO.volume !== _undefined;
                if (!s.isHTML5) flash._setVolume(s.id, hasIO ? s._iO.volume : s.options.volume); else if (s._a) s._a.muted = false;
                return s
            };
            this.toggleMute = function () {
                return s.muted ? s.unmute() : s.mute()
            };
            this.onPosition = function (nPosition, oMethod, oScope) {
                onPositionItems.push({
                    position: parseInt(nPosition, 10),
                    method: oMethod,
                    scope: oScope !== _undefined ? oScope : s,
                    fired: false
                });
                return s
            };
            this.onposition = this.onPosition;
            this.clearOnPosition =
                function (nPosition, oMethod) {
                    var i;
                    nPosition = parseInt(nPosition, 10);
                    if (isNaN(nPosition)) return false;
                    for (i = 0; i < onPositionItems.length; i++) if (nPosition === onPositionItems[i].position) if (!oMethod || oMethod === onPositionItems[i].method) {
                        if (onPositionItems[i].fired) onPositionFired--;
                        onPositionItems.splice(i, 1)
                    }
                };
            this._processOnPosition = function () {
                var i, item, j = onPositionItems.length;
                if (!j || !s.playState || onPositionFired >= j) return false;
                for (i = j - 1; i >= 0; i--) {
                    item = onPositionItems[i];
                    if (!item.fired && s.position >=
                        item.position) {
                        item.fired = true;
                        onPositionFired++;
                        item.method.apply(item.scope, [item.position]);
                        j = onPositionItems.length
                    }
                }
                return true
            };
            this._resetOnPosition = function (nPosition) {
                var i, item, j = onPositionItems.length;
                if (!j) return false;
                for (i = j - 1; i >= 0; i--) {
                    item = onPositionItems[i];
                    if (item.fired && nPosition <= item.position) {
                        item.fired = false;
                        onPositionFired--
                    }
                }
                return true
            };
            applyFromTo = function () {
                var instanceOptions = s._iO, f = instanceOptions.from, t = instanceOptions.to, start, end;
                end = function () {
                    sm2._wD(s.id + ': "To" time of ' +
                        t + " reached.");
                    s.clearOnPosition(t, end);
                    s.stop()
                };
                start = function () {
                    sm2._wD(s.id + ': Playing "from" ' + f);
                    if (t !== null && !isNaN(t)) s.onPosition(t, end)
                };
                if (f !== null && !isNaN(f)) {
                    instanceOptions.position = f;
                    instanceOptions.multiShot = false;
                    start()
                }
                return instanceOptions
            };
            attachOnPosition = function () {
                var item, op = s._iO.onposition;
                if (op) for (item in op) if (op.hasOwnProperty(item)) s.onPosition(parseInt(item, 10), op[item])
            };
            detachOnPosition = function () {
                var item, op = s._iO.onposition;
                if (op) for (item in op) if (op.hasOwnProperty(item)) s.clearOnPosition(parseInt(item,
                    10))
            };
            start_html5_timer = function () {
                if (s.isHTML5) startTimer(s)
            };
            stop_html5_timer = function () {
                if (s.isHTML5) stopTimer(s)
            };
            resetProperties = function (retainPosition) {
                if (!retainPosition) {
                    onPositionItems = [];
                    onPositionFired = 0
                }
                onplay_called = false;
                s._hasTimer = null;
                s._a = null;
                s._html5_canplay = false;
                s.bytesLoaded = null;
                s.bytesTotal = null;
                s.duration = s._iO && s._iO.duration ? s._iO.duration : null;
                s.durationEstimate = null;
                s.buffered = [];
                s.eqData = [];
                s.eqData.left = [];
                s.eqData.right = [];
                s.failures = 0;
                s.isBuffering = false;
                s.instanceOptions =
                    {};
                s.instanceCount = 0;
                s.loaded = false;
                s.metadata = {};
                s.readyState = 0;
                s.muted = false;
                s.paused = false;
                s.peakData = {left: 0, right: 0};
                s.waveformData = {left: [], right: []};
                s.playState = 0;
                s.position = null;
                s.id3 = {}
            };
            resetProperties();
            this._onTimer = function (bForce) {
                var duration, isNew = false, time, x = {};
                if (s._hasTimer || bForce) {
                    if (s._a && (bForce || (s.playState > 0 || s.readyState === 1) && !s.paused)) {
                        duration = s._get_html5_duration();
                        if (duration !== lastHTML5State.duration) {
                            lastHTML5State.duration = duration;
                            s.duration = duration;
                            isNew = true
                        }
                        s.durationEstimate =
                            s.duration;
                        time = s._a.currentTime * msecScale || 0;
                        if (time !== lastHTML5State.time) {
                            lastHTML5State.time = time;
                            isNew = true
                        }
                        if (isNew || bForce) s._whileplaying(time, x, x, x, x)
                    }
                    return isNew
                }
            };
            this._get_html5_duration = function () {
                var instanceOptions = s._iO,
                    d = s._a && s._a.duration ? s._a.duration * msecScale : instanceOptions && instanceOptions.duration ? instanceOptions.duration : null,
                    result = d && !isNaN(d) && d !== Infinity ? d : null;
                return result
            };
            this._apply_loop = function (a, nLoops) {
                if (!a.loop && nLoops > 1) sm2._wD("Note: Native HTML5 looping is infinite.",
                    1);
                a.loop = nLoops > 1 ? "loop" : ""
            };
            this._setup_html5 = function (oOptions) {
                var instanceOptions = mixin(s._iO, oOptions), a = useGlobalHTML5Audio ? globalHTML5Audio : s._a,
                    dURL = decodeURI(instanceOptions.url), sameURL;
                if (useGlobalHTML5Audio) {
                    if (dURL === decodeURI(lastGlobalHTML5URL)) sameURL = true
                } else if (dURL === decodeURI(lastURL)) sameURL = true;
                if (a) {
                    if (a._s) if (useGlobalHTML5Audio) {
                        if (a._s && a._s.playState && !sameURL) a._s.stop()
                    } else if (!useGlobalHTML5Audio && dURL === decodeURI(lastURL)) {
                        s._apply_loop(a, instanceOptions.loops);
                        return a
                    }
                    if (!sameURL) {
                        if (lastURL) resetProperties(false);
                        a.src = instanceOptions.url;
                        s.url = instanceOptions.url;
                        lastURL = instanceOptions.url;
                        lastGlobalHTML5URL = instanceOptions.url;
                        a._called_load = false
                    }
                } else {
                    if (instanceOptions.autoLoad || instanceOptions.autoPlay) {
                        s._a = new Audio(instanceOptions.url);
                        s._a.load()
                    } else s._a = isOpera && opera.version() < 10 ? new Audio(null) : new Audio;
                    a = s._a;
                    a._called_load = false;
                    if (useGlobalHTML5Audio) globalHTML5Audio = a
                }
                s.isHTML5 = true;
                s._a = a;
                a._s = s;
                add_html5_events();
                s._apply_loop(a,
                    instanceOptions.loops);
                if (instanceOptions.autoLoad || instanceOptions.autoPlay) s.load(); else {
                    a.autobuffer = false;
                    a.preload = "auto"
                }
                return a
            };
            add_html5_events = function () {
                if (s._a._added_events) return false;
                var f;

                function add(oEvt, oFn, bCapture) {
                    return s._a ? s._a.addEventListener(oEvt, oFn, bCapture || false) : null
                }

                s._a._added_events = true;
                for (f in html5_events) if (html5_events.hasOwnProperty(f)) add(f, html5_events[f]);
                return true
            };
            remove_html5_events = function () {
                var f;

                function remove(oEvt, oFn, bCapture) {
                    return s._a ?
                        s._a.removeEventListener(oEvt, oFn, bCapture || false) : null
                }

                sm2._wD(s.id + ": Removing event listeners");
                s._a._added_events = false;
                for (f in html5_events) if (html5_events.hasOwnProperty(f)) remove(f, html5_events[f])
            };
            this._onload = function (nSuccess) {
                var fN, loadOK = !!nSuccess || !s.isHTML5 && fV === 8 && s.duration;
                fN = s.id + ": ";
                sm2._wD(fN + (loadOK ? "onload()" : "Failed to load / invalid sound?" + (!s.duration ? " Zero-length duration reported." : " -") + " (" + s.url + ")"), loadOK ? 1 : 2);
                if (!loadOK && !s.isHTML5) {
                    if (sm2.sandbox.noRemote ===
                        true) sm2._wD(fN + str("noNet"), 1);
                    if (sm2.sandbox.noLocal === true) sm2._wD(fN + str("noLocal"), 1)
                }
                s.loaded = loadOK;
                s.readyState = loadOK ? 3 : 2;
                s._onbufferchange(0);
                if (s._iO.onload) wrapCallback(s, function () {
                    s._iO.onload.apply(s, [loadOK])
                });
                return true
            };
            this._onbufferchange = function (nIsBuffering) {
                if (s.playState === 0) return false;
                if (nIsBuffering && s.isBuffering || !nIsBuffering && !s.isBuffering) return false;
                s.isBuffering = nIsBuffering === 1;
                if (s._iO.onbufferchange) {
                    sm2._wD(s.id + ": Buffer state change: " + nIsBuffering);
                    s._iO.onbufferchange.apply(s,
                        [nIsBuffering])
                }
                return true
            };
            this._onsuspend = function () {
                if (s._iO.onsuspend) {
                    sm2._wD(s.id + ": Playback suspended");
                    s._iO.onsuspend.apply(s)
                }
                return true
            };
            this._onfailure = function (msg, level, code) {
                s.failures++;
                sm2._wD(s.id + ": Failure (" + s.failures + "): " + msg);
                if (s._iO.onfailure && s.failures === 1) s._iO.onfailure(msg, level, code); else sm2._wD(s.id + ": Ignoring failure")
            };
            this._onwarning = function (msg, level, code) {
                if (s._iO.onwarning) s._iO.onwarning(msg, level, code)
            };
            this._onfinish = function () {
                var io_onfinish = s._iO.onfinish;
                s._onbufferchange(0);
                s._resetOnPosition(0);
                if (s.instanceCount) {
                    s.instanceCount--;
                    if (!s.instanceCount) {
                        detachOnPosition();
                        s.playState = 0;
                        s.paused = false;
                        s.instanceCount = 0;
                        s.instanceOptions = {};
                        s._iO = {};
                        stop_html5_timer();
                        if (s.isHTML5) s.position = 0
                    }
                    if (!s.instanceCount || s._iO.multiShotEvents) if (io_onfinish) {
                        sm2._wD(s.id + ": onfinish()");
                        wrapCallback(s, function () {
                            io_onfinish.apply(s)
                        })
                    }
                }
            };
            this._whileloading = function (nBytesLoaded, nBytesTotal, nDuration, nBufferLength) {
                var instanceOptions = s._iO;
                s.bytesLoaded =
                    nBytesLoaded;
                s.bytesTotal = nBytesTotal;
                s.duration = Math.floor(nDuration);
                s.bufferLength = nBufferLength;
                if (!s.isHTML5 && !instanceOptions.isMovieStar) if (instanceOptions.duration) s.durationEstimate = s.duration > instanceOptions.duration ? s.duration : instanceOptions.duration; else s.durationEstimate = parseInt(s.bytesTotal / s.bytesLoaded * s.duration, 10); else s.durationEstimate = s.duration;
                if (!s.isHTML5) s.buffered = [{"start": 0, "end": s.duration}];
                if ((s.readyState !== 3 || s.isHTML5) && instanceOptions.whileloading) instanceOptions.whileloading.apply(s)
            };
            this._whileplaying = function (nPosition, oPeakData, oWaveformDataLeft, oWaveformDataRight, oEQData) {
                var instanceOptions = s._iO, eqLeft;
                if (isNaN(nPosition) || nPosition === null) return false;
                s.position = Math.max(0, nPosition);
                s._processOnPosition();
                if (!s.isHTML5 && fV > 8) {
                    if (instanceOptions.usePeakData && oPeakData !== _undefined && oPeakData) s.peakData = {
                        left: oPeakData.leftPeak,
                        right: oPeakData.rightPeak
                    };
                    if (instanceOptions.useWaveformData && oWaveformDataLeft !== _undefined && oWaveformDataLeft) s.waveformData = {
                        left: oWaveformDataLeft.split(","),
                        right: oWaveformDataRight.split(",")
                    };
                    if (instanceOptions.useEQData) if (oEQData !== _undefined && oEQData && oEQData.leftEQ) {
                        eqLeft = oEQData.leftEQ.split(",");
                        s.eqData = eqLeft;
                        s.eqData.left = eqLeft;
                        if (oEQData.rightEQ !== _undefined && oEQData.rightEQ) s.eqData.right = oEQData.rightEQ.split(",")
                    }
                }
                if (s.playState === 1) {
                    if (!s.isHTML5 && fV === 8 && !s.position && s.isBuffering) s._onbufferchange(0);
                    if (instanceOptions.whileplaying) instanceOptions.whileplaying.apply(s)
                }
                return true
            };
            this._oncaptiondata = function (oData) {
                sm2._wD(s.id +
                    ": Caption data received.");
                s.captiondata = oData;
                if (s._iO.oncaptiondata) s._iO.oncaptiondata.apply(s, [oData])
            };
            this._onmetadata = function (oMDProps, oMDData) {
                sm2._wD(s.id + ": Metadata received.");
                var oData = {}, i, j;
                for (i = 0, j = oMDProps.length; i < j; i++) oData[oMDProps[i]] = oMDData[i];
                s.metadata = oData;
                if (s._iO.onmetadata) s._iO.onmetadata.call(s, s.metadata)
            };
            this._onid3 = function (oID3Props, oID3Data) {
                sm2._wD(s.id + ": ID3 data received.");
                var oData = [], i, j;
                for (i = 0, j = oID3Props.length; i < j; i++) oData[oID3Props[i]] = oID3Data[i];
                s.id3 = mixin(s.id3, oData);
                if (s._iO.onid3) s._iO.onid3.apply(s)
            };
            this._onconnect = function (bSuccess) {
                bSuccess = bSuccess === 1;
                sm2._wD(s.id + ": " + (bSuccess ? "Connected." : "Failed to connect? - " + s.url), bSuccess ? 1 : 2);
                s.connected = bSuccess;
                if (bSuccess) {
                    s.failures = 0;
                    if (idCheck(s.id)) if (s.getAutoPlay()) s.play(_undefined, s.getAutoPlay()); else if (s._iO.autoLoad) s.load();
                    if (s._iO.onconnect) s._iO.onconnect.apply(s, [bSuccess])
                }
            };
            this._ondataerror = function (sError) {
                if (s.playState > 0) {
                    sm2._wD(s.id + ": Data error: " + sError);
                    if (s._iO.ondataerror) s._iO.ondataerror.apply(s)
                }
            };
            this._debug()
        };
        getDocument = function () {
            return doc.body || doc.getElementsByTagName("div")[0]
        };
        id = function (sID) {
            return doc.getElementById(sID)
        };
        mixin = function (oMain, oAdd) {
            var o1 = oMain || {}, o2, o;
            o2 = oAdd === _undefined ? sm2.defaultOptions : oAdd;
            for (o in o2) if (o2.hasOwnProperty(o) && o1[o] === _undefined) if (typeof o2[o] !== "object" || o2[o] === null) o1[o] = o2[o]; else o1[o] = mixin(o1[o], o2[o]);
            return o1
        };
        wrapCallback = function (oSound, callback) {
            if (!oSound.isHTML5 && fV === 8) window.setTimeout(callback,
                0); else callback()
        };
        extraOptions = {"onready": 1, "ontimeout": 1, "defaultOptions": 1, "flash9Options": 1, "movieStarOptions": 1};
        assign = function (o, oParent) {
            var i, result = true, hasParent = oParent !== _undefined, setupOptions = sm2.setupOptions,
                bonusOptions = extraOptions;
            if (o === _undefined) {
                result = [];
                for (i in setupOptions) if (setupOptions.hasOwnProperty(i)) result.push(i);
                for (i in bonusOptions) if (bonusOptions.hasOwnProperty(i)) if (typeof sm2[i] === "object") result.push(i + ": {...}"); else if (sm2[i] instanceof Function) result.push(i +
                    ": function() {...}"); else result.push(i);
                sm2._wD(str("setup", result.join(", ")));
                return false
            }
            for (i in o) if (o.hasOwnProperty(i)) if (typeof o[i] !== "object" || o[i] === null || o[i] instanceof Array || o[i] instanceof RegExp) if (hasParent && bonusOptions[oParent] !== _undefined) sm2[oParent][i] = o[i]; else if (setupOptions[i] !== _undefined) {
                sm2.setupOptions[i] = o[i];
                sm2[i] = o[i]
            } else if (bonusOptions[i] === _undefined) {
                complain(str(sm2[i] === _undefined ? "setupUndef" : "setupError", i), 2);
                result = false
            } else if (sm2[i] instanceof Function) sm2[i].apply(sm2,
                o[i] instanceof Array ? o[i] : [o[i]]); else sm2[i] = o[i]; else if (bonusOptions[i] === _undefined) {
                complain(str(sm2[i] === _undefined ? "setupUndef" : "setupError", i), 2);
                result = false
            } else return assign(o[i], i);
            return result
        };

        function preferFlashCheck(kind) {
            return sm2.preferFlash && hasFlash && !sm2.ignoreFlash && (sm2.flash[kind] !== _undefined && sm2.flash[kind])
        }

        event = function () {
            var old = window.attachEvent, evt = {
                add: old ? "attachEvent" : "addEventListener",
                remove: old ? "detachEvent" : "removeEventListener"
            };

            function getArgs(oArgs) {
                var args =
                    slice.call(oArgs), len = args.length;
                if (old) {
                    args[1] = "on" + args[1];
                    if (len > 3) args.pop()
                } else if (len === 3) args.push(false);
                return args
            }

            function apply(args, sType) {
                var element = args.shift(), method = [evt[sType]];
                if (old) element[method](args[0], args[1]); else element[method].apply(element, args)
            }

            function add() {
                apply(getArgs(arguments), "add")
            }

            function remove() {
                apply(getArgs(arguments), "remove")
            }

            return {"add": add, "remove": remove}
        }();

        function html5_event(oFn) {
            return function (e) {
                var s = this._s, result;
                if (!s || !s._a) {
                    if (s &&
                        s.id) sm2._wD(s.id + ": Ignoring " + e.type); else sm2._wD(h5 + "Ignoring " + e.type);
                    result = null
                } else result = oFn.call(this, e);
                return result
            }
        }

        html5_events = {
            abort: html5_event(function () {
                sm2._wD(this._s.id + ": abort")
            }), canplay: html5_event(function () {
                var s = this._s, position1K;
                if (s._html5_canplay) return true;
                s._html5_canplay = true;
                sm2._wD(s.id + ": canplay");
                s._onbufferchange(0);
                position1K = s._iO.position !== _undefined && !isNaN(s._iO.position) ? s._iO.position / msecScale : null;
                if (this.currentTime !== position1K) {
                    sm2._wD(s.id +
                        ": canplay: Setting position to " + position1K);
                    try {
                        this.currentTime = position1K
                    } catch (ee) {
                        sm2._wD(s.id + ": canplay: Setting position of " + position1K + " failed: " + ee.message, 2)
                    }
                }
                if (s._iO._oncanplay) s._iO._oncanplay()
            }), canplaythrough: html5_event(function () {
                var s = this._s;
                if (!s.loaded) {
                    s._onbufferchange(0);
                    s._whileloading(s.bytesLoaded, s.bytesTotal, s._get_html5_duration());
                    s._onload(true)
                }
            }), durationchange: html5_event(function () {
                var s = this._s, duration;
                duration = s._get_html5_duration();
                if (!isNaN(duration) &&
                    duration !== s.duration) {
                    sm2._wD(this._s.id + ": durationchange (" + duration + ")" + (s.duration ? ", previously " + s.duration : ""));
                    s.durationEstimate = s.duration = duration
                }
            }), ended: html5_event(function () {
                var s = this._s;
                sm2._wD(s.id + ": ended");
                s._onfinish()
            }), error: html5_event(function () {
                sm2._wD(this._s.id + ": HTML5 error, code " + this.error.code);
                this._s._onload(false)
            }), loadeddata: html5_event(function () {
                var s = this._s;
                sm2._wD(s.id + ": loadeddata");
                if (!s._loaded && !isSafari) s.duration = s._get_html5_duration()
            }), loadedmetadata: html5_event(function () {
                sm2._wD(this._s.id +
                    ": loadedmetadata")
            }), loadstart: html5_event(function () {
                sm2._wD(this._s.id + ": loadstart");
                this._s._onbufferchange(1)
            }), play: html5_event(function () {
                this._s._onbufferchange(0)
            }), playing: html5_event(function () {
                sm2._wD(this._s.id + ": playing " + String.fromCharCode(9835));
                this._s._onbufferchange(0)
            }), progress: html5_event(function (e) {
                var s = this._s, i, j, progStr, buffered = 0, isProgress = e.type === "progress",
                    ranges = e.target.buffered, loaded = e.loaded || 0, total = e.total || 1;
                s.buffered = [];
                if (ranges && ranges.length) {
                    for (i =
                             0, j = ranges.length; i < j; i++) s.buffered.push({
                        "start": ranges.start(i) * msecScale,
                        "end": ranges.end(i) * msecScale
                    });
                    buffered = (ranges.end(0) - ranges.start(0)) * msecScale;
                    loaded = Math.min(1, buffered / (e.target.duration * msecScale));
                    if (isProgress && ranges.length > 1) {
                        progStr = [];
                        j = ranges.length;
                        for (i = 0; i < j; i++) progStr.push(e.target.buffered.start(i) * msecScale + "-" + e.target.buffered.end(i) * msecScale);
                        sm2._wD(this._s.id + ": progress, timeRanges: " + progStr.join(", "))
                    }
                    if (isProgress && !isNaN(loaded)) sm2._wD(this._s.id + ": progress, " +
                        Math.floor(loaded * 100) + "% loaded")
                }
                if (!isNaN(loaded)) {
                    s._whileloading(loaded, total, s._get_html5_duration());
                    if (loaded && total && loaded === total) html5_events.canplaythrough.call(this, e)
                }
            }), ratechange: html5_event(function () {
                sm2._wD(this._s.id + ": ratechange")
            }), suspend: html5_event(function (e) {
                var s = this._s;
                sm2._wD(this._s.id + ": suspend");
                html5_events.progress.call(this, e);
                s._onsuspend()
            }), stalled: html5_event(function () {
                sm2._wD(this._s.id + ": stalled")
            }), timeupdate: html5_event(function () {
                this._s._onTimer()
            }),
            waiting: html5_event(function () {
                var s = this._s;
                sm2._wD(this._s.id + ": waiting");
                s._onbufferchange(1)
            })
        };
        html5OK = function (iO) {
            var result;
            if (!iO || !iO.type && !iO.url && !iO.serverURL) result = false; else if (iO.serverURL || iO.type && preferFlashCheck(iO.type)) result = false; else result = iO.type ? html5CanPlay({type: iO.type}) : html5CanPlay({url: iO.url}) || sm2.html5Only || iO.url.match(/data:/i);
            return result
        };
        html5Unload = function (oAudio) {
            var url;
            if (oAudio) {
                url = isSafari ? emptyURL : sm2.html5.canPlayType("audio/wav") ? emptyWAV :
                    emptyURL;
                oAudio.src = url;
                if (oAudio._called_unload !== _undefined) oAudio._called_load = false
            }
            if (useGlobalHTML5Audio) lastGlobalHTML5URL = null;
            return url
        };
        html5CanPlay = function (o) {
            if (!sm2.useHTML5Audio || !sm2.hasHTML5) return false;
            var url = o.url || null, mime = o.type || null, aF = sm2.audioFormats, result, offset, fileExt, item;
            if (mime && sm2.html5[mime] !== _undefined) return sm2.html5[mime] && !preferFlashCheck(mime);
            if (!html5Ext) {
                html5Ext = [];
                for (item in aF) if (aF.hasOwnProperty(item)) {
                    html5Ext.push(item);
                    if (aF[item].related) html5Ext =
                        html5Ext.concat(aF[item].related)
                }
                html5Ext = new RegExp("\\.(" + html5Ext.join("|") + ")(\\?.*)?$", "i")
            }
            fileExt = url ? url.toLowerCase().match(html5Ext) : null;
            if (!fileExt || !fileExt.length) if (!mime) result = false; else {
                offset = mime.indexOf(";");
                fileExt = (offset !== -1 ? mime.substr(0, offset) : mime).substr(6)
            } else fileExt = fileExt[1];
            if (fileExt && sm2.html5[fileExt] !== _undefined) result = sm2.html5[fileExt] && !preferFlashCheck(fileExt); else {
                mime = "audio/" + fileExt;
                result = sm2.html5.canPlayType({type: mime});
                sm2.html5[fileExt] = result;
                result = result && sm2.html5[mime] && !preferFlashCheck(mime)
            }
            return result
        };
        testHTML5 = function () {
            if (!sm2.useHTML5Audio || !sm2.hasHTML5) {
                sm2.html5.usingFlash = true;
                needsFlash = true;
                return false
            }
            var a = Audio !== _undefined ? isOpera && opera.version() < 10 ? new Audio(null) : new Audio : null, item,
                lookup, support = {}, aF, i;

            function cp(m) {
                var canPlay, j, result = false, isOK = false;
                if (!a || typeof a.canPlayType !== "function") return result;
                if (m instanceof Array) {
                    for (i = 0, j = m.length; i < j; i++) if (sm2.html5[m[i]] || a.canPlayType(m[i]).match(sm2.html5Test)) {
                        isOK =
                            true;
                        sm2.html5[m[i]] = true;
                        sm2.flash[m[i]] = !!m[i].match(flashMIME)
                    }
                    result = isOK
                } else {
                    canPlay = a && typeof a.canPlayType === "function" ? a.canPlayType(m) : false;
                    result = !!(canPlay && canPlay.match(sm2.html5Test))
                }
                return result
            }

            aF = sm2.audioFormats;
            for (item in aF) if (aF.hasOwnProperty(item)) {
                lookup = "audio/" + item;
                support[item] = cp(aF[item].type);
                support[lookup] = support[item];
                if (item.match(flashMIME)) {
                    sm2.flash[item] = true;
                    sm2.flash[lookup] = true
                } else {
                    sm2.flash[item] = false;
                    sm2.flash[lookup] = false
                }
                if (aF[item] && aF[item].related) for (i =
                                                           aF[item].related.length - 1; i >= 0; i--) {
                    support["audio/" + aF[item].related[i]] = support[item];
                    sm2.html5[aF[item].related[i]] = support[item];
                    sm2.flash[aF[item].related[i]] = support[item]
                }
            }
            support.canPlayType = a ? cp : null;
            sm2.html5 = mixin(sm2.html5, support);
            sm2.html5.usingFlash = featureCheck();
            needsFlash = sm2.html5.usingFlash;
            return true
        };
        strings = {
            notReady: "Unavailable - wait until onready() has fired.",
            notOK: "Audio support is not available.",
            domError: sm + "exception caught while appending SWF to DOM.",
            spcWmode: "Removing wmode, preventing known SWF loading issue(s)",
            swf404: smc + "Verify that %s is a valid path.",
            tryDebug: "Try " + sm + ".debugFlash = true for more security details (output goes to SWF.)",
            checkSWF: "See SWF output for more debug info.",
            localFail: smc + "Non-HTTP page (" + doc.location.protocol + " URL?) Review Flash player security settings for this special case:\nhttp://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html\nMay need to add/allow path, eg. c:/sm2/ or /users/me/sm2/",
            waitFocus: smc + "Special case: Waiting for SWF to load with window focus...",
            waitForever: smc + "Waiting indefinitely for Flash (will recover if unblocked)...",
            waitSWF: smc + "Waiting for 100% SWF load...",
            needFunction: smc + "Function object expected for %s",
            badID: 'Sound ID "%s" should be a string, starting with a non-numeric character',
            currentObj: smc + "_debug(): Current sound objects",
            waitOnload: smc + "Waiting for window.onload()",
            docLoaded: smc + "Document already loaded",
            onload: smc + "initComplete(): calling soundManager.onload()",
            onloadOK: sm + ".onload() complete",
            didInit: smc + "init(): Already called?",
            secNote: "Flash security note: Network/internet URLs will not load due to security restrictions. Access can be configured via Flash Player Global Security Settings Page: http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html",
            badRemove: smc + "Failed to remove Flash node.",
            shutdown: sm + ".disable(): Shutting down",
            queue: smc + "Queueing %s handler",
            smError: "SMSound.load(): Exception: JS-Flash communication failed, or JS error.",
            fbTimeout: "No flash response, applying ." +
            swfCSS.swfTimedout + " CSS...",
            fbLoaded: "Flash loaded",
            fbHandler: smc + "flashBlockHandler()",
            manURL: "SMSound.load(): Using manually-assigned URL",
            onURL: sm + ".load(): current URL already assigned.",
            badFV: sm + '.flashVersion must be 8 or 9. "%s" is invalid. Reverting to %s.',
            as2loop: "Note: Setting stream:false so looping can work (flash 8 limitation)",
            noNSLoop: "Note: Looping not implemented for MovieStar formats",
            needfl9: "Note: Switching to flash 9, required for MP4 formats.",
            mfTimeout: "Setting flashLoadTimeout = 0 (infinite) for off-screen, mobile flash case",
            needFlash: smc + "Fatal error: Flash is needed to play some required formats, but is not available.",
            gotFocus: smc + "Got window focus.",
            policy: "Enabling usePolicyFile for data access",
            setup: sm + ".setup(): allowed parameters: %s",
            setupError: sm + '.setup(): "%s" cannot be assigned with this method.',
            setupUndef: sm + '.setup(): Could not find option "%s"',
            setupLate: sm + ".setup(): url, flashVersion and html5Test property changes will not take effect until reboot().",
            noURL: smc + "Flash URL required. Call soundManager.setup({url:...}) to get started.",
            sm2Loaded: "SoundManager 2: Ready. " + String.fromCharCode(10003),
            reset: sm + ".reset(): Removing event callbacks",
            mobileUA: "Mobile UA detected, preferring HTML5 by default.",
            globalHTML5: "Using singleton HTML5 Audio() pattern for this device.",
            ignoreMobile: "Ignoring mobile restrictions for this device."
        };
        str = function () {
            var args, i, j, o, sstr;
            args = slice.call(arguments);
            o = args.shift();
            sstr = strings && strings[o] ? strings[o] : "";
            if (sstr && args && args.length) for (i = 0, j = args.length; i < j; i++) sstr = sstr.replace("%s", args[i]);
            return sstr
        };
        loopFix = function (sOpt) {
            if (fV === 8 && sOpt.loops > 1 && sOpt.stream) {
                _wDS("as2loop");
                sOpt.stream = false
            }
            return sOpt
        };
        policyFix = function (sOpt, sPre) {
            if (sOpt && !sOpt.usePolicyFile && (sOpt.onid3 || sOpt.usePeakData || sOpt.useWaveformData || sOpt.useEQData)) {
                sm2._wD((sPre || "") + str("policy"));
                sOpt.usePolicyFile = true
            }
            return sOpt
        };
        complain = function (sMsg) {
            if (hasConsole && console.warn !== _undefined) console.warn(sMsg); else sm2._wD(sMsg)
        };
        doNothing = function () {
            return false
        };
        disableObject = function (o) {
            var oProp;
            for (oProp in o) if (o.hasOwnProperty(oProp) &&
                typeof o[oProp] === "function") o[oProp] = doNothing;
            oProp = null
        };
        failSafely = function (bNoDisable) {
            if (bNoDisable === _undefined) bNoDisable = false;
            if (disabled || bNoDisable) sm2.disable(bNoDisable)
        };
        normalizeMovieURL = function (smURL) {
            var urlParams = null, url;
            if (smURL) if (smURL.match(/\.swf(\?.*)?$/i)) {
                urlParams = smURL.substr(smURL.toLowerCase().lastIndexOf(".swf?") + 4);
                if (urlParams) return smURL
            } else if (smURL.lastIndexOf("/") !== smURL.length - 1) smURL += "/";
            url = (smURL && smURL.lastIndexOf("/") !== -1 ? smURL.substr(0, smURL.lastIndexOf("/") +
                1) : "./") + sm2.movieURL;
            if (sm2.noSWFCache) url += "?ts=" + (new Date).getTime();
            return url
        };
        setVersionInfo = function () {
            fV = parseInt(sm2.flashVersion, 10);
            if (fV !== 8 && fV !== 9) {
                sm2._wD(str("badFV", fV, defaultFlashVersion));
                sm2.flashVersion = fV = defaultFlashVersion
            }
            var isDebug = sm2.debugMode || sm2.debugFlash ? "_debug.swf" : ".swf";
            if (sm2.useHTML5Audio && !sm2.html5Only && sm2.audioFormats.mp4.required && fV < 9) {
                sm2._wD(str("needfl9"));
                sm2.flashVersion = fV = 9
            }
            sm2.version = sm2.versionNumber + (sm2.html5Only ? " (HTML5-only mode)" : fV ===
            9 ? " (AS3/Flash 9)" : " (AS2/Flash 8)");
            if (fV > 8) {
                sm2.defaultOptions = mixin(sm2.defaultOptions, sm2.flash9Options);
                sm2.features.buffering = true;
                sm2.defaultOptions = mixin(sm2.defaultOptions, sm2.movieStarOptions);
                sm2.filePatterns.flash9 = new RegExp("\\.(mp3|" + netStreamTypes.join("|") + ")(\\?.*)?$", "i");
                sm2.features.movieStar = true
            } else sm2.features.movieStar = false;
            sm2.filePattern = sm2.filePatterns[fV !== 8 ? "flash9" : "flash8"];
            sm2.movieURL = (fV === 8 ? "soundmanager2.swf" : "soundmanager2_flash9.swf").replace(".swf", isDebug);
            sm2.features.peakData = sm2.features.waveformData = sm2.features.eqData = fV > 8
        };
        setPolling = function (bPolling, bHighPerformance) {
            if (!flash) return false;
            flash._setPolling(bPolling, bHighPerformance)
        };
        initDebug = function () {
            if (sm2.debugURLParam.test(wl)) sm2.setupOptions.debugMode = sm2.debugMode = true;
            if (id(sm2.debugID)) return false;
            var oD, oDebug, oTarget, oToggle, tmp;
            if (sm2.debugMode && !id(sm2.debugID) && (!hasConsole || !sm2.useConsole || !sm2.consoleOnly)) {
                oD = doc.createElement("div");
                oD.id = sm2.debugID + "-toggle";
                oToggle =
                    {
                        "position": "fixed",
                        "bottom": "0px",
                        "right": "0px",
                        "width": "1.2em",
                        "height": "1.2em",
                        "lineHeight": "1.2em",
                        "margin": "2px",
                        "textAlign": "center",
                        "border": "1px solid #999",
                        "cursor": "pointer",
                        "background": "#fff",
                        "color": "#333",
                        "zIndex": 10001
                    };
                oD.appendChild(doc.createTextNode("-"));
                oD.onclick = toggleDebug;
                oD.title = "Toggle SM2 debug console";
                if (ua.match(/msie 6/i)) {
                    oD.style.position = "absolute";
                    oD.style.cursor = "hand"
                }
                for (tmp in oToggle) if (oToggle.hasOwnProperty(tmp)) oD.style[tmp] = oToggle[tmp];
                oDebug = doc.createElement("div");
                oDebug.id = sm2.debugID;
                oDebug.style.display = sm2.debugMode ? "block" : "none";
                if (sm2.debugMode && !id(oD.id)) {
                    try {
                        oTarget = getDocument();
                        oTarget.appendChild(oD)
                    } catch (e2) {
                        throw new Error(str("domError") + " \n" + e2.toString());
                    }
                    oTarget.appendChild(oDebug)
                }
            }
            oTarget = null
        };
        idCheck = this.getSoundById;
        _wDS = function (o, errorLevel) {
            return !o ? "" : sm2._wD(str(o), errorLevel)
        };
        toggleDebug = function () {
            var o = id(sm2.debugID), oT = id(sm2.debugID + "-toggle");
            if (!o) return false;
            if (debugOpen) {
                oT.innerHTML = "+";
                o.style.display = "none"
            } else {
                oT.innerHTML =
                    "-";
                o.style.display = "block"
            }
            debugOpen = !debugOpen
        };
        debugTS = function (sEventType, bSuccess, sMessage) {
            if (window.sm2Debugger !== _undefined) try {
                sm2Debugger.handleEvent(sEventType, bSuccess, sMessage)
            } catch (e) {
                return false
            }
            return true
        };
        getSWFCSS = function () {
            var css = [];
            if (sm2.debugMode) css.push(swfCSS.sm2Debug);
            if (sm2.debugFlash) css.push(swfCSS.flashDebug);
            if (sm2.useHighPerformance) css.push(swfCSS.highPerf);
            return css.join(" ")
        };
        flashBlockHandler = function () {
            var name = str("fbHandler"), p = sm2.getMoviePercent(), css =
                swfCSS, error = {type: "FLASHBLOCK"};
            if (sm2.html5Only) return false;
            if (!sm2.ok()) {
                if (needsFlash) {
                    sm2.oMC.className = getSWFCSS() + " " + css.swfDefault + " " + (p === null ? css.swfTimedout : css.swfError);
                    sm2._wD(name + ": " + str("fbTimeout") + (p ? " (" + str("fbLoaded") + ")" : ""))
                }
                sm2.didFlashBlock = true;
                processOnEvents({type: "ontimeout", ignoreInit: true, error: error});
                catchError(error)
            } else {
                if (sm2.didFlashBlock) sm2._wD(name + ": Unblocked");
                if (sm2.oMC) sm2.oMC.className = [getSWFCSS(), css.swfDefault, css.swfLoaded + (sm2.didFlashBlock ?
                    " " + css.swfUnblocked : "")].join(" ")
            }
        };
        addOnEvent = function (sType, oMethod, oScope) {
            if (on_queue[sType] === _undefined) on_queue[sType] = [];
            on_queue[sType].push({"method": oMethod, "scope": oScope || null, "fired": false})
        };
        processOnEvents = function (oOptions) {
            if (!oOptions) oOptions = {type: sm2.ok() ? "onready" : "ontimeout"};
            if (!didInit && oOptions && !oOptions.ignoreInit) return false;
            if (oOptions.type === "ontimeout" && (sm2.ok() || disabled && !oOptions.ignoreInit)) return false;
            var status = {
                    success: oOptions && oOptions.ignoreInit ? sm2.ok() :
                        !disabled
                }, srcQueue = oOptions && oOptions.type ? on_queue[oOptions.type] || [] : [], queue = [], i, j,
                args = [status], canRetry = needsFlash && !sm2.ok();
            if (oOptions.error) args[0].error = oOptions.error;
            for (i = 0, j = srcQueue.length; i < j; i++) if (srcQueue[i].fired !== true) queue.push(srcQueue[i]);
            if (queue.length) for (i = 0, j = queue.length; i < j; i++) {
                if (queue[i].scope) queue[i].method.apply(queue[i].scope, args); else queue[i].method.apply(this, args);
                if (!canRetry) queue[i].fired = true
            }
            return true
        };
        initUserOnload = function () {
            window.setTimeout(function () {
                if (sm2.useFlashBlock) flashBlockHandler();
                processOnEvents();
                if (typeof sm2.onload === "function") {
                    _wDS("onload", 1);
                    sm2.onload.apply(window);
                    _wDS("onloadOK", 1)
                }
                if (sm2.waitForWindowLoad) event.add(window, "load", initUserOnload)
            }, 1)
        };
        detectFlash = function () {
            if (hasFlash !== _undefined) return hasFlash;
            var hasPlugin = false, n = navigator, nP = n.plugins, obj, type, types, AX = window.ActiveXObject;
            if (nP && nP.length) {
                type = "application/x-shockwave-flash";
                types = n.mimeTypes;
                if (types && types[type] && types[type].enabledPlugin && types[type].enabledPlugin.description) hasPlugin =
                    true
            } else if (AX !== _undefined && !ua.match(/MSAppHost/i)) {
                try {
                    obj = new AX("ShockwaveFlash.ShockwaveFlash")
                } catch (e) {
                    obj = null
                }
                hasPlugin = !!obj;
                obj = null
            }
            hasFlash = hasPlugin;
            return hasPlugin
        };
        featureCheck = function () {
            var flashNeeded, item, formats = sm2.audioFormats,
                isSpecial = is_iDevice && !!ua.match(/os (1|2|3_0|3_1)\s/i);
            if (isSpecial) {
                sm2.hasHTML5 = false;
                sm2.html5Only = true;
                if (sm2.oMC) sm2.oMC.style.display = "none"
            } else if (sm2.useHTML5Audio) {
                if (!sm2.html5 || !sm2.html5.canPlayType) {
                    sm2._wD("SoundManager: No HTML5 Audio() support detected.");
                    sm2.hasHTML5 = false
                }
                if (isBadSafari) sm2._wD(smc + "Note: Buggy HTML5 Audio in Safari on this OS X release, see https://bugs.webkit.org/show_bug.cgi?id=32159 - " + (!hasFlash ? " would use flash fallback for MP3/MP4, but none detected." : "will use flash fallback for MP3/MP4, if available"), 1)
            }
            if (sm2.useHTML5Audio && sm2.hasHTML5) {
                canIgnoreFlash = true;
                for (item in formats) if (formats.hasOwnProperty(item)) if (formats[item].required) if (!sm2.html5.canPlayType(formats[item].type)) {
                    canIgnoreFlash = false;
                    flashNeeded = true
                } else if (sm2.preferFlash &&
                    (sm2.flash[item] || sm2.flash[formats[item].type])) flashNeeded = true
            }
            if (sm2.ignoreFlash) {
                flashNeeded = false;
                canIgnoreFlash = true
            }
            sm2.html5Only = sm2.hasHTML5 && sm2.useHTML5Audio && !flashNeeded;
            return !sm2.html5Only
        };
        parseURL = function (url) {
            var i, j, urlResult = 0, result;
            if (url instanceof Array) {
                for (i = 0, j = url.length; i < j; i++) if (url[i] instanceof Object) {
                    if (sm2.canPlayMIME(url[i].type)) {
                        urlResult = i;
                        break
                    }
                } else if (sm2.canPlayURL(url[i])) {
                    urlResult = i;
                    break
                }
                if (url[urlResult].url) url[urlResult] = url[urlResult].url;
                result =
                    url[urlResult]
            } else result = url;
            return result
        };
        startTimer = function (oSound) {
            if (!oSound._hasTimer) {
                oSound._hasTimer = true;
                if (!mobileHTML5 && sm2.html5PollingInterval) {
                    if (h5IntervalTimer === null && h5TimerCount === 0) h5IntervalTimer = setInterval(timerExecute, sm2.html5PollingInterval);
                    h5TimerCount++
                }
            }
        };
        stopTimer = function (oSound) {
            if (oSound._hasTimer) {
                oSound._hasTimer = false;
                if (!mobileHTML5 && sm2.html5PollingInterval) h5TimerCount--
            }
        };
        timerExecute = function () {
            var i;
            if (h5IntervalTimer !== null && !h5TimerCount) {
                clearInterval(h5IntervalTimer);
                h5IntervalTimer = null;
                return false
            }
            for (i = sm2.soundIDs.length - 1; i >= 0; i--) if (sm2.sounds[sm2.soundIDs[i]].isHTML5 && sm2.sounds[sm2.soundIDs[i]]._hasTimer) sm2.sounds[sm2.soundIDs[i]]._onTimer()
        };
        catchError = function (options) {
            options = options !== _undefined ? options : {};
            if (typeof sm2.onerror === "function") sm2.onerror.apply(window, [{type: options.type !== _undefined ? options.type : null}]);
            if (options.fatal !== _undefined && options.fatal) sm2.disable()
        };
        badSafariFix = function () {
            if (!isBadSafari || !detectFlash()) return false;
            var aF = sm2.audioFormats, i, item;
            for (item in aF) if (aF.hasOwnProperty(item)) if (item === "mp3" || item === "mp4") {
                sm2._wD(sm + ": Using flash fallback for " + item + " format");
                sm2.html5[item] = false;
                if (aF[item] && aF[item].related) for (i = aF[item].related.length - 1; i >= 0; i--) sm2.html5[aF[item].related[i]] = false
            }
        };
        this._setSandboxType = function (sandboxType) {
            var sb = sm2.sandbox;
            sb.type = sandboxType;
            sb.description = sb.types[sb.types[sandboxType] !== _undefined ? sandboxType : "unknown"];
            if (sb.type === "localWithFile") {
                sb.noRemote = true;
                sb.noLocal = false;
                _wDS("secNote", 2)
            } else if (sb.type === "localWithNetwork") {
                sb.noRemote = false;
                sb.noLocal = true
            } else if (sb.type === "localTrusted") {
                sb.noRemote = false;
                sb.noLocal = false
            }
        };
        this._externalInterfaceOK = function (swfVersion) {
            if (sm2.swfLoaded) return false;
            var e;
            debugTS("swf", true);
            debugTS("flashtojs", true);
            sm2.swfLoaded = true;
            tryInitOnFocus = false;
            if (isBadSafari) badSafariFix();
            if (!swfVersion || swfVersion.replace(/\+dev/i, "") !== sm2.versionNumber.replace(/\+dev/i, "")) {
                e = sm + ': Fatal: JavaScript file build "' +
                    sm2.versionNumber + '" does not match Flash SWF build "' + swfVersion + '" at ' + sm2.url + ". Ensure both are up-to-date.";
                setTimeout(function versionMismatch() {
                    throw new Error(e);
                }, 0);
                return false
            }
            setTimeout(init, isIE ? 100 : 1)
        };
        createMovie = function (smID, smURL) {
            if (didAppend && appendSuccess) return false;

            function initMsg() {
                var options = [], title, msg = [], delimiter = " + ";
                title = "SoundManager " + sm2.version + (!sm2.html5Only && sm2.useHTML5Audio ? sm2.hasHTML5 ? " + HTML5 audio" : ", no HTML5 audio support" : "");
                if (!sm2.html5Only) {
                    if (sm2.preferFlash) options.push("preferFlash");
                    if (sm2.useHighPerformance) options.push("useHighPerformance");
                    if (sm2.flashPollingInterval) options.push("flashPollingInterval (" + sm2.flashPollingInterval + "ms)");
                    if (sm2.html5PollingInterval) options.push("html5PollingInterval (" + sm2.html5PollingInterval + "ms)");
                    if (sm2.wmode) options.push("wmode (" + sm2.wmode + ")");
                    if (sm2.debugFlash) options.push("debugFlash");
                    if (sm2.useFlashBlock) options.push("flashBlock")
                } else if (sm2.html5PollingInterval) options.push("html5PollingInterval (" + sm2.html5PollingInterval + "ms)");
                if (options.length) msg = msg.concat([options.join(delimiter)]);
                sm2._wD(title + (msg.length ? delimiter + msg.join(", ") : ""), 1);
                showSupport()
            }

            if (sm2.html5Only) {
                setVersionInfo();
                initMsg();
                sm2.oMC = id(sm2.movieID);
                init();
                didAppend = true;
                appendSuccess = true;
                return false
            }
            var remoteURL = smURL || sm2.url, localURL = sm2.altURL || remoteURL,
                swfTitle = "JS/Flash audio component (SoundManager 2)", oTarget = getDocument(),
                extraClass = getSWFCSS(), isRTL = null, html = doc.getElementsByTagName("html")[0], oEmbed, oMovie, tmp,
                movieHTML, oEl, s, x,
                sClass;
            isRTL = html && html.dir && html.dir.match(/rtl/i);
            smID = smID === _undefined ? sm2.id : smID;

            function param(name, value) {
                return '<param name="' + name + '" value="' + value + '" />'
            }

            setVersionInfo();
            sm2.url = normalizeMovieURL(overHTTP ? remoteURL : localURL);
            smURL = sm2.url;
            sm2.wmode = !sm2.wmode && sm2.useHighPerformance ? "transparent" : sm2.wmode;
            if (sm2.wmode !== null && (ua.match(/msie 8/i) || !isIE && !sm2.useHighPerformance) && navigator.platform.match(/win32|win64/i)) {
                messages.push(strings.spcWmode);
                sm2.wmode = null
            }
            oEmbed = {
                "name": smID,
                "id": smID,
                "src": smURL,
                "quality": "high",
                "allowScriptAccess": sm2.allowScriptAccess,
                "bgcolor": sm2.bgColor,
                "pluginspage": http + "www.macromedia.com/go/getflashplayer",
                "title": swfTitle,
                "type": "application/x-shockwave-flash",
                "wmode": sm2.wmode,
                "hasPriority": "true"
            };
            if (sm2.debugFlash) oEmbed.FlashVars = "debug=1";
            if (!sm2.wmode) delete oEmbed.wmode;
            if (isIE) {
                oMovie = doc.createElement("div");
                movieHTML = ['<object id="' + smID + '" data="' + smURL + '" type="' + oEmbed.type + '" title="' + oEmbed.title + '" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0">',
                    param("movie", smURL), param("AllowScriptAccess", sm2.allowScriptAccess), param("quality", oEmbed.quality), sm2.wmode ? param("wmode", sm2.wmode) : "", param("bgcolor", sm2.bgColor), param("hasPriority", "true"), sm2.debugFlash ? param("FlashVars", oEmbed.FlashVars) : "", "</object>"].join("")
            } else {
                oMovie = doc.createElement("embed");
                for (tmp in oEmbed) if (oEmbed.hasOwnProperty(tmp)) oMovie.setAttribute(tmp, oEmbed[tmp])
            }
            initDebug();
            extraClass = getSWFCSS();
            oTarget = getDocument();
            if (oTarget) {
                sm2.oMC = id(sm2.movieID) || doc.createElement("div");
                if (!sm2.oMC.id) {
                    sm2.oMC.id = sm2.movieID;
                    sm2.oMC.className = swfCSS.swfDefault + " " + extraClass;
                    s = null;
                    oEl = null;
                    if (!sm2.useFlashBlock) if (sm2.useHighPerformance) s = {
                        "position": "fixed",
                        "width": "8px",
                        "height": "8px",
                        "bottom": "0px",
                        "left": "0px",
                        "overflow": "hidden"
                    }; else {
                        s = {
                            "position": "absolute",
                            "width": "6px",
                            "height": "6px",
                            "top": "-9999px",
                            "left": "-9999px"
                        };
                        if (isRTL) s.left = Math.abs(parseInt(s.left, 10)) + "px"
                    }
                    if (isWebkit) sm2.oMC.style.zIndex = 1E4;
                    if (!sm2.debugFlash) for (x in s) if (s.hasOwnProperty(x)) sm2.oMC.style[x] =
                        s[x];
                    try {
                        if (!isIE) sm2.oMC.appendChild(oMovie);
                        oTarget.appendChild(sm2.oMC);
                        if (isIE) {
                            oEl = sm2.oMC.appendChild(doc.createElement("div"));
                            oEl.className = swfCSS.swfBox;
                            oEl.innerHTML = movieHTML
                        }
                        appendSuccess = true
                    } catch (e) {
                        throw new Error(str("domError") + " \n" + e.toString());
                    }
                } else {
                    sClass = sm2.oMC.className;
                    sm2.oMC.className = (sClass ? sClass + " " : swfCSS.swfDefault) + (extraClass ? " " + extraClass : "");
                    sm2.oMC.appendChild(oMovie);
                    if (isIE) {
                        oEl = sm2.oMC.appendChild(doc.createElement("div"));
                        oEl.className = swfCSS.swfBox;
                        oEl.innerHTML =
                            movieHTML
                    }
                    appendSuccess = true
                }
            }
            didAppend = true;
            initMsg();
            return true
        };
        initMovie = function () {
            if (sm2.html5Only) {
                createMovie();
                return false
            }
            if (flash) return false;
            if (!sm2.url) {
                _wDS("noURL");
                return false
            }
            flash = sm2.getMovie(sm2.id);
            if (!flash) {
                if (!oRemoved) createMovie(sm2.id, sm2.url); else {
                    if (!isIE) sm2.oMC.appendChild(oRemoved); else sm2.oMC.innerHTML = oRemovedHTML;
                    oRemoved = null;
                    didAppend = true
                }
                flash = sm2.getMovie(sm2.id)
            }
            if (typeof sm2.oninitmovie === "function") setTimeout(sm2.oninitmovie, 1);
            flushMessages();
            return true
        };
        delayWaitForEI = function () {
            setTimeout(waitForEI, 1E3)
        };
        rebootIntoHTML5 = function () {
            window.setTimeout(function () {
                complain(smc + "useFlashBlock is false, 100% HTML5 mode is possible. Rebooting with preferFlash: false...");
                sm2.setup({preferFlash: false}).reboot();
                sm2.didFlashBlock = true;
                sm2.beginDelayedInit()
            }, 1)
        };
        waitForEI = function () {
            var p, loadIncomplete = false;
            if (!sm2.url) return false;
            if (waitingForEI) return false;
            waitingForEI = true;
            event.remove(window, "load", delayWaitForEI);
            if (hasFlash && tryInitOnFocus && !isFocused) {
                _wDS("waitFocus");
                return false
            }
            if (!didInit) {
                p = sm2.getMoviePercent();
                if (p > 0 && p < 100) loadIncomplete = true
            }
            setTimeout(function () {
                p = sm2.getMoviePercent();
                if (loadIncomplete) {
                    waitingForEI = false;
                    sm2._wD(str("waitSWF"));
                    window.setTimeout(delayWaitForEI, 1);
                    return false
                }
                if (!didInit) {
                    sm2._wD(sm + ": No Flash response within expected time. Likely causes: " + (p === 0 ? "SWF load failed, " : "") + "Flash blocked or JS-Flash security error." + (sm2.debugFlash ? " " + str("checkSWF") : ""), 2);
                    if (!overHTTP && p) {
                        _wDS("localFail", 2);
                        if (!sm2.debugFlash) _wDS("tryDebug",
                            2)
                    }
                    if (p === 0) sm2._wD(str("swf404", sm2.url), 1);
                    debugTS("flashtojs", false, ": Timed out" + (overHTTP ? " (Check flash security or flash blockers)" : " (No plugin/missing SWF?)"))
                }
                if (!didInit && okToDisable) if (p === null) if (sm2.useFlashBlock || sm2.flashLoadTimeout === 0) {
                    if (sm2.useFlashBlock) flashBlockHandler();
                    _wDS("waitForever")
                } else if (!sm2.useFlashBlock && canIgnoreFlash) rebootIntoHTML5(); else {
                    _wDS("waitForever");
                    processOnEvents({type: "ontimeout", ignoreInit: true, error: {type: "INIT_FLASHBLOCK"}})
                } else if (sm2.flashLoadTimeout ===
                    0) _wDS("waitForever"); else if (!sm2.useFlashBlock && canIgnoreFlash) rebootIntoHTML5(); else failSafely(true)
            }, sm2.flashLoadTimeout)
        };
        handleFocus = function () {
            function cleanup() {
                event.remove(window, "focus", handleFocus)
            }

            if (isFocused || !tryInitOnFocus) {
                cleanup();
                return true
            }
            okToDisable = true;
            isFocused = true;
            _wDS("gotFocus");
            waitingForEI = false;
            delayWaitForEI();
            cleanup();
            return true
        };
        flushMessages = function () {
            if (messages.length) {
                sm2._wD("SoundManager 2: " + messages.join(" "), 1);
                messages = []
            }
        };
        showSupport = function () {
            flushMessages();
            var item, tests = [];
            if (sm2.useHTML5Audio && sm2.hasHTML5) {
                for (item in sm2.audioFormats) if (sm2.audioFormats.hasOwnProperty(item)) tests.push(item + " = " + sm2.html5[item] + (!sm2.html5[item] && needsFlash && sm2.flash[item] ? " (using flash)" : sm2.preferFlash && sm2.flash[item] && needsFlash ? " (preferring flash)" : !sm2.html5[item] ? " (" + (sm2.audioFormats[item].required ? "required, " : "") + "and no flash support)" : ""));
                sm2._wD("SoundManager 2 HTML5 support: " + tests.join(", "), 1)
            }
        };
        initComplete = function (bNoDisable) {
            if (didInit) return false;
            if (sm2.html5Only) {
                _wDS("sm2Loaded", 1);
                didInit = true;
                initUserOnload();
                debugTS("onload", true);
                return true
            }
            var wasTimeout = sm2.useFlashBlock && sm2.flashLoadTimeout && !sm2.getMoviePercent(), result = true, error;
            if (!wasTimeout) didInit = true;
            error = {type: !hasFlash && needsFlash ? "NO_FLASH" : "INIT_TIMEOUT"};
            sm2._wD("SoundManager 2 " + (disabled ? "failed to load" : "loaded") + " (" + (disabled ? "Flash security/load error" : "OK") + ") " + String.fromCharCode(disabled ? 10006 : 10003), disabled ? 2 : 1);
            if (disabled || bNoDisable) {
                if (sm2.useFlashBlock &&
                    sm2.oMC) sm2.oMC.className = getSWFCSS() + " " + (sm2.getMoviePercent() === null ? swfCSS.swfTimedout : swfCSS.swfError);
                processOnEvents({type: "ontimeout", error: error, ignoreInit: true});
                debugTS("onload", false);
                catchError(error);
                result = false
            } else debugTS("onload", true);
            if (!disabled) if (sm2.waitForWindowLoad && !windowLoaded) {
                _wDS("waitOnload");
                event.add(window, "load", initUserOnload)
            } else {
                if (sm2.waitForWindowLoad && windowLoaded) _wDS("docLoaded");
                initUserOnload()
            }
            return result
        };
        setProperties = function () {
            var i, o = sm2.setupOptions;
            for (i in o) if (o.hasOwnProperty(i)) if (sm2[i] === _undefined) sm2[i] = o[i]; else if (sm2[i] !== o[i]) sm2.setupOptions[i] = sm2[i]
        };
        init = function () {
            if (didInit) {
                _wDS("didInit");
                return false
            }

            function cleanup() {
                event.remove(window, "load", sm2.beginDelayedInit)
            }

            if (sm2.html5Only) {
                if (!didInit) {
                    cleanup();
                    sm2.enabled = true;
                    initComplete()
                }
                return true
            }
            initMovie();
            try {
                flash._externalInterfaceTest(false);
                setPolling(true, sm2.flashPollingInterval || (sm2.useHighPerformance ? 10 : 50));
                if (!sm2.debugMode) flash._disableDebug();
                sm2.enabled =
                    true;
                debugTS("jstoflash", true);
                if (!sm2.html5Only) event.add(window, "unload", doNothing)
            } catch (e) {
                sm2._wD("js/flash exception: " + e.toString());
                debugTS("jstoflash", false);
                catchError({type: "JS_TO_FLASH_EXCEPTION", fatal: true});
                failSafely(true);
                initComplete();
                return false
            }
            initComplete();
            cleanup();
            return true
        };
        domContentLoaded = function () {
            if (didDCLoaded) return false;
            didDCLoaded = true;
            setProperties();
            initDebug();
            if (!hasFlash && sm2.hasHTML5) {
                sm2._wD("SoundManager 2: No Flash detected" + (!sm2.useHTML5Audio ? ", enabling HTML5." :
                    ". Trying HTML5-only mode."), 1);
                sm2.setup({"useHTML5Audio": true, "preferFlash": false})
            }
            testHTML5();
            if (!hasFlash && needsFlash) {
                messages.push(strings.needFlash);
                sm2.setup({"flashLoadTimeout": 1})
            }
            if (doc.removeEventListener) doc.removeEventListener("DOMContentLoaded", domContentLoaded, false);
            initMovie();
            return true
        };
        domContentLoadedIE = function () {
            if (doc.readyState === "complete") {
                domContentLoaded();
                doc.detachEvent("onreadystatechange", domContentLoadedIE)
            }
            return true
        };
        winOnLoad = function () {
            windowLoaded = true;
            domContentLoaded();
            event.remove(window, "load", winOnLoad)
        };
        detectFlash();
        event.add(window, "focus", handleFocus);
        event.add(window, "load", delayWaitForEI);
        event.add(window, "load", winOnLoad);
        if (doc.addEventListener) doc.addEventListener("DOMContentLoaded", domContentLoaded, false); else if (doc.attachEvent) doc.attachEvent("onreadystatechange", domContentLoadedIE); else {
            debugTS("onload", false);
            catchError({type: "NO_DOM2_EVENTS", fatal: true})
        }
    }

    if (window.SM2_DEFER === _undefined || !SM2_DEFER) soundManager = new SoundManager;
    if (typeof module ===
        "object" && module && typeof module.exports === "object") {
        module.exports.SoundManager = SoundManager;
        module.exports.soundManager = soundManager
    } else if (typeof define === "function" && define.amd) define(function () {
        function getInstance(smBuilder) {
            if (!window.soundManager && smBuilder instanceof Function) {
                var instance = smBuilder(SoundManager);
                if (instance instanceof SoundManager) window.soundManager = instance
            }
            return window.soundManager
        }

        return {constructor: SoundManager, getInstance: getInstance}
    });
    window.SoundManager = SoundManager;
    window.soundManager = soundManager
})(window);
!function (e) {
    if ("object" == typeof exports && "undefined" != typeof module) module.exports = e(); else if ("function" == typeof define && define.amd) define([], e); else {
        var t;
        t = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this, t.store = e()
    }
}(function () {
    var define, module, exports;
    return function e(t, n, r) {
        function o(u, a) {
            if (!n[u]) {
                if (!t[u]) {
                    var c = "function" == typeof require && require;
                    if (!a && c) return c(u, !0);
                    if (i) return i(u, !0);
                    var f = new Error("Cannot find module '" + u +
                        "'");
                    throw f.code = "MODULE_NOT_FOUND", f;
                }
                var s = n[u] = {exports: {}};
                t[u][0].call(s.exports, function (e) {
                    var n = t[u][1][e];
                    return o(n ? n : e)
                }, s, s.exports, e, t, n, r)
            }
            return n[u].exports
        }

        for (var i = "function" == typeof require && require, u = 0; u < r.length; u++) o(r[u]);
        return o
    }({
        1: [function (e, t, n) {
            var r = e("../src/store-engine"), o = e("../storages/all"), i = [e("../plugins/json2")];
            t.exports = r.createStore(o, i)
        }, {"../plugins/json2": 2, "../src/store-engine": 4, "../storages/all": 6}], 2: [function (e, t, n) {
            function r() {
                return e("./lib/json2"),
                    {}
            }

            t.exports = r
        }, {"./lib/json2": 3}], 3: [function (require, module, exports) {
            var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (e) {
                return typeof e
            } : function (e) {
                return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
            };
            "object" !== ("undefined" == typeof JSON ? "undefined" : _typeof(JSON)) && (JSON = {}), function () {
                function f(e) {
                    return e < 10 ? "0" + e : e
                }

                function this_value() {
                    return this.valueOf()
                }

                function quote(e) {
                    return rx_escapable.lastIndex = 0, rx_escapable.test(e) ?
                        '"' + e.replace(rx_escapable, function (e) {
                            var t = meta[e];
                            return "string" == typeof t ? t : "\\u" + ("0000" + e.charCodeAt(0).toString(16)).slice(-4)
                        }) + '"' : '"' + e + '"'
                }

                function str(e, t) {
                    var n, r, o, i, u, a = gap, c = t[e];
                    switch (c && "object" === ("undefined" == typeof c ? "undefined" : _typeof(c)) && "function" == typeof c.toJSON && (c = c.toJSON(e)), "function" == typeof rep && (c = rep.call(t, e, c)), "undefined" == typeof c ? "undefined" : _typeof(c)) {
                        case "string":
                            return quote(c);
                        case "number":
                            return isFinite(c) ? String(c) : "null";
                        case "boolean":
                        case "null":
                            return String(c);
                        case "object":
                            if (!c) return "null";
                            if (gap += indent, u = [], "[object Array]" === Object.prototype.toString.apply(c)) {
                                for (i = c.length, n = 0; n < i; n += 1) u[n] = str(n, c) || "null";
                                return o = 0 === u.length ? "[]" : gap ? "[\n" + gap + u.join(",\n" + gap) + "\n" + a + "]" : "[" + u.join(",") + "]", gap = a, o
                            }
                            if (rep && "object" === ("undefined" == typeof rep ? "undefined" : _typeof(rep))) for (i = rep.length, n = 0; n < i; n += 1) "string" == typeof rep[n] && (r = rep[n], o = str(r, c), o && u.push(quote(r) + (gap ? ": " : ":") + o)); else for (r in c) Object.prototype.hasOwnProperty.call(c, r) && (o =
                                str(r, c), o && u.push(quote(r) + (gap ? ": " : ":") + o));
                            return o = 0 === u.length ? "{}" : gap ? "{\n" + gap + u.join(",\n" + gap) + "\n" + a + "}" : "{" + u.join(",") + "}", gap = a, o
                    }
                }

                var rx_one = /^[\],:{}\s]*$/, rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
                    rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
                    rx_four = /(?:^|:|,)(?:\s*\[)+/g,
                    rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
                    rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
                "function" != typeof Date.prototype.toJSON && (Date.prototype.toJSON = function () {
                    return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z" : null
                }, Boolean.prototype.toJSON = this_value, Number.prototype.toJSON = this_value, String.prototype.toJSON = this_value);
                var gap, indent, meta, rep;
                "function" != typeof JSON.stringify && (meta = {
                    "\b": "\\b", "\t": "\\t", "\n": "\\n", "\f": "\\f", "\r": "\\r",
                    '"': '\\"', "\\": "\\\\"
                }, JSON.stringify = function (e, t, n) {
                    var r;
                    if (gap = "", indent = "", "number" == typeof n) for (r = 0; r < n; r += 1) indent += " "; else "string" == typeof n && (indent = n);
                    if (rep = t, t && "function" != typeof t && ("object" !== ("undefined" == typeof t ? "undefined" : _typeof(t)) || "number" != typeof t.length)) throw new Error("JSON.stringify");
                    return str("", {"": e})
                }), "function" != typeof JSON.parse && (JSON.parse = function (text, reviver) {
                    function walk(e, t) {
                        var n, r, o = e[t];
                        if (o && "object" === ("undefined" == typeof o ? "undefined" : _typeof(o))) for (n in o) Object.prototype.hasOwnProperty.call(o,
                            n) && (r = walk(o, n), void 0 !== r ? o[n] = r : delete o[n]);
                        return reviver.call(e, t, o)
                    }

                    var j;
                    if (text = String(text), rx_dangerous.lastIndex = 0, rx_dangerous.test(text) && (text = text.replace(rx_dangerous, function (e) {
                        return "\\u" + ("0000" + e.charCodeAt(0).toString(16)).slice(-4)
                    })), rx_one.test(text.replace(rx_two, "@").replace(rx_three, "]").replace(rx_four, ""))) return j = eval("(" + text + ")"), "function" == typeof reviver ? walk({"": j}, "") : j;
                    throw new SyntaxError("JSON.parse");
                })
            }()
        }, {}], 4: [function (e, t, n) {
            function r() {
                var e = "undefined" ==
                typeof console ? null : console;
                if (e) {
                    var t = e.warn ? e.warn : e.log;
                    t.apply(e, arguments)
                }
            }

            function o(e, t, n) {
                n || (n = ""), e && !l(e) && (e = [e]), t && !l(t) && (t = [t]);
                var o = n ? "__storejs_" + n + "_" : "", i = n ? new RegExp("^" + o) : null, v = /^[a-zA-Z0-9_\-]*$/;
                if (!v.test(n)) throw new Error("store.js namespaces can only have alphanumerics + underscores and dashes");
                var h = {
                    _namespacePrefix: o, _namespaceRegexp: i, _testStorage: function (e) {
                        try {
                            var t = "__storejs__test__";
                            e.write(t, t);
                            var n = e.read(t) === t;
                            return e.remove(t), n
                        } catch (r$0) {
                            return !1
                        }
                    },
                    _assignPluginFnProp: function (e, t) {
                        var n = this[t];
                        this[t] = function () {
                            function t() {
                                if (n) return c(arguments, function (e, t) {
                                    r[t] = e
                                }), n.apply(o, r)
                            }

                            var r = u(arguments, 0), o = this, i = [t].concat(r);
                            return e.apply(o, i)
                        }
                    }, _serialize: function (e) {
                        return JSON.stringify(e)
                    }, _deserialize: function (e, t) {
                        if (!e) return t;
                        var n = "";
                        try {
                            n = JSON.parse(e)
                        } catch (r$1) {
                            n = e
                        }
                        return void 0 !== n ? n : t
                    }, _addStorage: function (e) {
                        this.enabled || this._testStorage(e) && (this.storage = e, this.enabled = !0)
                    }, _addPlugin: function (e) {
                        var t = this;
                        if (l(e)) return void c(e,
                            function (e) {
                                t._addPlugin(e)
                            });
                        var n = a(this.plugins, function (t) {
                            return e === t
                        });
                        if (!n) {
                            if (this.plugins.push(e), !p(e)) throw new Error("Plugins must be function values that return objects");
                            var r = e.call(this);
                            if (!d(r)) throw new Error("Plugins must return an object of function properties");
                            c(r, function (n, r) {
                                if (!p(n)) throw new Error("Bad plugin property: " + r + " from plugin " + e.name + ". Plugins should only return functions.");
                                t._assignPluginFnProp(n, r)
                            })
                        }
                    }, addStorage: function (e) {
                        r("store.addStorage(storage) is deprecated. Use createStore([storages])"),
                            this._addStorage(e)
                    }
                }, m = s(h, g, {plugins: []});
                return m.raw = {}, c(m, function (e, t) {
                    p(e) && (m.raw[t] = f(m, e))
                }), c(e, function (e) {
                    m._addStorage(e)
                }), c(t, function (e) {
                    m._addPlugin(e)
                }), m
            }

            var i = e("./util"), u = i.slice, a = i.pluck, c = i.each, f = i.bind, s = i.create, l = i.isList,
                p = i.isFunction, d = i.isObject;
            t.exports = {createStore: o};
            var g = {
                version: "2.0.12", enabled: !1, get: function (e, t) {
                    var n = this.storage.read(this._namespacePrefix + e);
                    return this._deserialize(n, t)
                }, set: function (e, t) {
                    return void 0 === t ? this.remove(e) : (this.storage.write(this._namespacePrefix +
                        e, this._serialize(t)), t)
                }, remove: function (e) {
                    this.storage.remove(this._namespacePrefix + e)
                }, each: function (e) {
                    var t = this;
                    this.storage.each(function (n, r) {
                        e.call(t, t._deserialize(n), (r || "").replace(t._namespaceRegexp, ""))
                    })
                }, clearAll: function () {
                    this.storage.clearAll()
                }, hasNamespace: function (e) {
                    return this._namespacePrefix == "__storejs_" + e + "_"
                }, createStore: function () {
                    return o.apply(this, arguments)
                }, addPlugin: function (e) {
                    this._addPlugin(e)
                }, namespace: function (e) {
                    return o(this.storage, this.plugins, e)
                }
            }
        },
            {"./util": 5}], 5: [function (e, t, n) {
            (function (e) {
                function n() {
                    return Object.assign ? Object.assign : function (e, t, n, r) {
                        for (var o = 1; o < arguments.length; o++) a(Object(arguments[o]), function (t, n) {
                            e[n] = t
                        });
                        return e
                    }
                }

                function r() {
                    if (Object.create) return function (e, t, n, r) {
                        var o = u(arguments, 1);
                        return d.apply(this, [Object.create(e)].concat(o))
                    };
                    var e = function () {
                    };
                    return function (t, n, r, o) {
                        var i = u(arguments, 1);
                        return e.prototype = t, d.apply(this, [new e].concat(i))
                    }
                }

                function o() {
                    return String.prototype.trim ? function (e) {
                            return String.prototype.trim.call(e)
                        } :
                        function (e) {
                            return e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "")
                        }
                }

                function i(e, t) {
                    return function () {
                        return t.apply(e, Array.prototype.slice.call(arguments, 0))
                    }
                }

                function u(e, t) {
                    return Array.prototype.slice.call(e, t || 0)
                }

                function a(e, t) {
                    f(e, function (e, n) {
                        return t(e, n), !1
                    })
                }

                function c(e, t) {
                    var n = s(e) ? [] : {};
                    return f(e, function (e, r) {
                        return n[r] = t(e, r), !1
                    }), n
                }

                function f(e, t) {
                    if (s(e)) for (var n = 0; n < e.length; n++) {
                        if (t(e[n], n)) return e[n]
                    } else for (var r in e) if (e.hasOwnProperty(r) && t(e[r], r)) return e[r]
                }

                function s(e) {
                    return null != e && "function" != typeof e && "number" == typeof e.length
                }

                function l(e) {
                    return e && "[object Function]" === {}.toString.call(e)
                }

                function p(e) {
                    return e && "[object Object]" === {}.toString.call(e)
                }

                var d = n(), g = r(), v = o(), h = "undefined" != typeof window ? window : e;
                t.exports = {
                    assign: d,
                    create: g,
                    trim: v,
                    bind: i,
                    slice: u,
                    each: a,
                    map: c,
                    pluck: f,
                    isList: s,
                    isFunction: l,
                    isObject: p,
                    Global: h
                }
            }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
        }, {}],
        6: [function (e, t, n) {
            t.exports = [e("./localStorage"), e("./oldFF-globalStorage"), e("./oldIE-userDataStorage"), e("./cookieStorage"), e("./sessionStorage"), e("./memoryStorage")]
        }, {
            "./cookieStorage": 7,
            "./localStorage": 8,
            "./memoryStorage": 9,
            "./oldFF-globalStorage": 10,
            "./oldIE-userDataStorage": 11,
            "./sessionStorage": 12
        }], 7: [function (e, t, n) {
            function r(e) {
                if (!e || !c(e)) return null;
                var t = "(?:^|.*;\\s*)" + escape(e).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*";
                return unescape(p.cookie.replace(new RegExp(t),
                    "$1"))
            }

            function o(e) {
                for (var t = p.cookie.split(/; ?/g), n = t.length - 1; n >= 0; n--) if (l(t[n])) {
                    var r = t[n].split("="), o = unescape(r[0]), i = unescape(r[1]);
                    e(i, o)
                }
            }

            function i(e, t) {
                e && (p.cookie = escape(e) + "=" + escape(t) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/")
            }

            function u(e) {
                e && c(e) && (p.cookie = escape(e) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/")
            }

            function a() {
                o(function (e, t) {
                    u(t)
                })
            }

            function c(e) {
                return (new RegExp("(?:^|;\\s*)" + escape(e).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(p.cookie)
            }

            var f =
                e("../src/util"), s = f.Global, l = f.trim;
            t.exports = {name: "cookieStorage", read: r, write: i, each: o, remove: u, clearAll: a};
            var p = s.document
        }, {"../src/util": 5}], 8: [function (e, t, n) {
            function r() {
                return s.localStorage
            }

            function o(e) {
                return r().getItem(e)
            }

            function i(e, t) {
                return r().setItem(e, t)
            }

            function u(e) {
                for (var t = r().length - 1; t >= 0; t--) {
                    var n = r().key(t);
                    e(o(n), n)
                }
            }

            function a(e) {
                return r().removeItem(e)
            }

            function c() {
                return r().clear()
            }

            var f = e("../src/util"), s = f.Global;
            t.exports = {
                name: "localStorage", read: o, write: i,
                each: u, remove: a, clearAll: c
            }
        }, {"../src/util": 5}], 9: [function (e, t, n) {
            function r(e) {
                return c[e]
            }

            function o(e, t) {
                c[e] = t
            }

            function i(e) {
                for (var t in c) c.hasOwnProperty(t) && e(c[t], t)
            }

            function u(e) {
                delete c[e]
            }

            function a(e) {
                c = {}
            }

            t.exports = {name: "memoryStorage", read: r, write: o, each: i, remove: u, clearAll: a};
            var c = {}
        }, {}], 10: [function (e, t, n) {
            function r(e) {
                return s[e]
            }

            function o(e, t) {
                s[e] = t
            }

            function i(e) {
                for (var t = s.length - 1; t >= 0; t--) {
                    var n = s.key(t);
                    e(s[n], n)
                }
            }

            function u(e) {
                return s.removeItem(e)
            }

            function a() {
                i(function (e,
                            t) {
                    delete s[e]
                })
            }

            var c = e("../src/util"), f = c.Global;
            t.exports = {name: "oldFF-globalStorage", read: r, write: o, each: i, remove: u, clearAll: a};
            var s = f.globalStorage
        }, {"../src/util": 5}], 11: [function (e, t, n) {
            function r(e, t) {
                if (!v) {
                    var n = c(e);
                    g(function (e) {
                        e.setAttribute(n, t), e.save(p)
                    })
                }
            }

            function o(e) {
                if (!v) {
                    var t = c(e), n = null;
                    return g(function (e) {
                        n = e.getAttribute(t)
                    }), n
                }
            }

            function i(e) {
                g(function (t) {
                    for (var n = t.XMLDocument.documentElement.attributes, r = n.length - 1; r >= 0; r--) {
                        var o = n[r];
                        e(t.getAttribute(o.name), o.name)
                    }
                })
            }

            function u(e) {
                var t = c(e);
                g(function (e) {
                    e.removeAttribute(t), e.save(p)
                })
            }

            function a() {
                g(function (e) {
                    var t = e.XMLDocument.documentElement.attributes;
                    e.load(p);
                    for (var n = t.length - 1; n >= 0; n--) e.removeAttribute(t[n].name);
                    e.save(p)
                })
            }

            function c(e) {
                return e.replace(/^\d/, "___$&").replace(h, "___")
            }

            function f() {
                if (!d || !d.documentElement || !d.documentElement.addBehavior) return null;
                var e, t, n, r = "script";
                try {
                    t = new ActiveXObject("htmlfile"), t.open(), t.write("<" + r + ">document.w=window</" + r + '><iframe src="/favicon.ico"></iframe>'),
                        t.close(), e = t.w.frames[0].document, n = e.createElement("div")
                } catch (o$2) {
                    n = d.createElement("div"), e = d.body
                }
                return function (t) {
                    var r = [].slice.call(arguments, 0);
                    r.unshift(n), e.appendChild(n), n.addBehavior("#default#userData"), n.load(p), t.apply(this, r), e.removeChild(n)
                }
            }

            var s = e("../src/util"), l = s.Global;
            t.exports = {name: "oldIE-userDataStorage", write: r, read: o, each: i, remove: u, clearAll: a};
            var p = "storejs", d = l.document, g = f(),
                v = (l.navigator ? l.navigator.userAgent : "").match(/ (MSIE 8|MSIE 9|MSIE 10)\./),
                h = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]",
                    "g")
        }, {"../src/util": 5}], 12: [function (e, t, n) {
            function r() {
                return s.sessionStorage
            }

            function o(e) {
                return r().getItem(e)
            }

            function i(e, t) {
                return r().setItem(e, t)
            }

            function u(e) {
                for (var t = r().length - 1; t >= 0; t--) {
                    var n = r().key(t);
                    e(o(n), n)
                }
            }

            function a(e) {
                return r().removeItem(e)
            }

            function c() {
                return r().clear()
            }

            var f = e("../src/util"), s = f.Global;
            t.exports = {name: "sessionStorage", read: o, write: i, each: u, remove: a, clearAll: c}
        }, {"../src/util": 5}]
    }, {}, [1])(1)
});
var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.findInternal = function (a, l, k) {
    a instanceof String && (a = String(a));
    for (var q = a.length, p = 0; p < q; p++) {
        var z = a[p];
        if (l.call(k, z, p, a)) return {i: p, v: z}
    }
    return {i: -1, v: void 0}
};
$jscomp.ASSUME_ES5 = !1;
$jscomp.ASSUME_NO_NATIVE_MAP = !1;
$jscomp.ASSUME_NO_NATIVE_SET = !1;
$jscomp.defineProperty = $jscomp.ASSUME_ES5 || "function" == typeof Object.defineProperties ? Object.defineProperty : function (a, l, k) {
    a != Array.prototype && a != Object.prototype && (a[l] = k.value)
};
$jscomp.getGlobal = function (a) {
    return "undefined" != typeof window && window === a ? a : "undefined" != typeof global && null != global ? global : a
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.polyfill = function (a, l, k, q) {
    if (l) {
        k = $jscomp.global;
        a = a.split(".");
        for (q = 0; q < a.length - 1; q++) {
            var p = a[q];
            p in k || (k[p] = {});
            k = k[p]
        }
        a = a[a.length - 1];
        q = k[a];
        l = l(q);
        l != q && null != l && $jscomp.defineProperty(k, a, {configurable: !0, writable: !0, value: l})
    }
};
$jscomp.polyfill("Array.prototype.find", function (a) {
    return a ? a : function (a, k) {
        return $jscomp.findInternal(this, a, k).v
    }
}, "es6", "es3");
(function (a) {
    a.zvPlayer = {version: "1.0.7", author: "AY"};
    jQuery.fn.zvPlayer = function (l) {
        function k() {
            return c.find(".player-time-total").width()
        }

        function q() {
            v.playlist && (r = a("#plpop-songs"));
            p();
            D();
            K(r.find("#pl-song-list").children("div"))
        }

        function p() {
            a(".song-download").each(function (index, element) {
                var url = a(element).attr("data-url");
                "#" == url && (url = a(element).attr("data-href"));
                a(element).unbind("click");
                a(element).click(function () {
                    return a.zvPlayer.download(a(element), url)
                })
            })
        }

        function z() {
            a(".radio-play").each(function (b, d) {
                a(d).unbind("click");
                a(d).click(function () {
                    var b = a(this).attr("data-href");
                    G(a(this).attr("data-title"), b);
                    return !1
                })
            })
        }

        function D() {
            v.volume && (a.zvPlayer.volume(w / 100), c.find(".player-volume-slider").unbind("click"), c.find(".player-volume-slider").click(function (b) {
                b = (b.pageX - a(this).offset().left) / 100;
                a.zvPlayer.volume(b, 1);
                0 != w ? c.find(".player-volume-button").removeClass("off") : c.find(".player-volume-button").addClass("off")
            }), c.find(".player-volume-slider").unbind("drag"), c.find(".player-volume-slider").bind("drag",
                function (b) {
                    1 == b.which && (b = (b.pageX - a(this).offset().left) / 100, a.zvPlayer.volume(b), 0 != w ? c.find(".player-volume-button").removeClass("off") : c.find(".player-volume-button").addClass("off"))
                }), c.find(".player-volume-button").unbind("click"), c.find(".player-volume-button").click(function () {
                0 != w ? (a.zvPlayer.volume(0, 1), a(this).addClass("off")) : (a.zvPlayer.volume(a.cookie("ZvcurrentVolume") / 100, 1), a(this).removeClass("off"))
            }));
            c.find(".player-time-total, .player-time-loaded, .player-time-current, .player-song-name, .player-time-start, .player-time-end").unbind("click");
            c.find(".player-time-total, .player-time-loaded, .player-time-current, .player-song-name, .player-time-start, .player-time-end").click(function (b) {
                b = (b.pageX - a(this).parent().offset().left) / k();
                0 < e[f].duration ? h.setPosition(b * e[f].duration * 1E3) : h.setPosition(b * h.duration);
                y(b)
            });
            c.find(".player-nav-prev").unbind("click");
            c.find(".player-nav-prev").click(function () {
                a.zvPlayer.previous();
                return !1
            });
            c.find(".player-nav-play").unbind("click");
            c.find(".player-nav-play").click(function () {
                a.zvPlayer.toggle();
                return !1
            });
            c.find(".player-nav-next").unbind("click");
            c.find(".player-nav-next").click(function () {
                a.zvPlayer.next();
                return !1
            });
            c.find(".player-menu-plus").unbind("click");
            c.find(".player-menu-plus").click(function () {
                showTopNotify("<strong>\u0414\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u043a\u043e\u043c\u043f\u043e\u0437\u0438\u0446\u0438\u044e \u0432 \u043f\u043b\u0435\u0435\u0440</strong>");
                return !1
            });
            c.find(".player-menu-download").unbind("click");
            c.find(".player-menu-download").click(function () {
                showTopNotify("<strong>\u0414\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u043a\u043e\u043c\u043f\u043e\u0437\u0438\u0446\u0438\u044e \u0432 \u043f\u043b\u0435\u0435\u0440</strong>");
                return !1
            });
            A = !0;
            c.unbind("song-play");
            c.bind("song-play", function (a, d) {
                E && u(d, E)
            })
        }

        function L() {
            r.find("#pl-song-list").children("div").shuffle();
            e = [];
            r.find("#pl-song-list").children("div").each(function (b, g) {
                b = a(g).find(".song-play");
                g = b.attr("data-url");
                "#" == g && (g = b.attr("data-href"));
                t({duration: b.attr("data-time"), stream_url: g, title: b.attr("data-title"), id: b.attr("data-sid")})
            });
            if (x) for (var b = 0; b < e.length; ++b) e[b].id == x && (f = b)
        }

        function H() {
            function b() {
                if (!A) return !1;
                var b = a(this);
                if ("true" ==
                    b.attr("pl")) e = [], r.find("#pl-song-list").children("div").each(function (b, d) {
                    b = a(d).find(".song-play");
                    d = b.attr("data-url");
                    "#" == d && (d = b.attr("data-href"));
                    t({
                        duration: b.attr("data-time"),
                        stream_url: d,
                        title: b.attr("data-title"),
                        id: b.attr("data-sid")
                    })
                }); else {
                    e = [];
                    var d = b.attr("data-url");
                    "#" == d && (d = b.attr("data-href"));
                    t({
                        duration: b.attr("data-time"),
                        stream_url: d,
                        title: b.attr("data-title"),
                        id: b.attr("data-sid")
                    });
                    f = -1;
                    a.zvPlayer.addTrack(d, b.attr("data-title"), b.attr("data-sid"), !0, b.attr("data-time"))
                }
                return !1
            }

            var d = a("body");
            "1.7" <= c.jquery ? (d.off("click", ".song-play"), d.on("click", ".song-play", b)) : (d.undelegate(".song-play", "click"), d.delegate(".song-play", "click", b));
            jQuery(document).bind("delete-song", function () {
                var b = a("#playlist-content-" + playlist_id).find(".playlist-count");
                animateCount(a(b), -1)
            });
            d = a("#resorting-songs");
            d.unbind("click");
            d.click(function () {
                L()
            });
            -1 < f && (a("[data-sid]").removeClass("stop"), a("div[data-play]").removeClass("played"), a("[data-sid=" + e[f].id + "].song-play").addClass("stop"),
                a("div[data-play=" + e[f].id + "].").addClass("played"));
            d = a(".song-plus");
            d.unbind("click");
            d.click(function () {
                if ("1" == isGuest) return window.location = "/login", !1;
                var b = a(this);
                if (!A) return !1;
                var d = a(this), c = d.attr("data-url");
                "#" == c && (c = d.attr("data-href"));
                var e = "";
                !1 === a.zvPlayer.addToPlaylist(c, d.attr("data-title"), d.attr("data-sid"), d.attr("data-time")) ? (b.addClass("in_playlist").attr("title", "\u0412 \u043f\u043b\u0435\u0439\u043b\u0438\u0441\u0442\u0435"), e = a('<div class="song_mess2"><div class="bg"><div class="cnt">\u041f\u0435\u0441\u043d\u044f \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u0430<br/>\u0432 \u043f\u043b\u0435\u0439\u043b\u0438\u0441\u0442</div></div></div>')) :
                    e = a('<div class="song_mess2"><div class="bg"><div class="cnt2">\u042d\u0442\u0430 \u043f\u0435\u0441\u043d\u044f \u0443\u0436\u0435<br/>\u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u0430 \u0432 \u043f\u043b\u0435\u0439\u043b\u0438\u0441\u0442</div></div></div>');
                e.fadeIn(500);
                e.appendTo("body");
                d = b.offset().left - e.outerWidth() / 2 + b.outerWidth() / 2;
                b = b.offset().top - e.outerHeight() - 13;
                e.css({top: b, left: d, display: "block"});
                setTimeout(function () {
                    e.fadeOut(400, function () {
                        a(this).remove()
                    })
                }, 900);
                return !1
            })
        }

        function K(b) {
            c.unbind("song-play");
            c.bind("song-play", function () {
                ++B;
                if (B < b.length) {
                    var d = b.eq(B).find(".song-play"), g = d.attr("data-url");
                    "#" == g && (g = d.attr("data-href"));
                    a.zvPlayer.addTrack(g, d.attr("data-title"), d.attr("data-sid"), !1, d.attr("data-time"))
                } else c.unbind("song-play"), D()
            })
        }

        function t(a) {
            for (var b = e.length, c = 0; c < e.length; ++c) if (a.title == e[c].title) return b = c;
            return "undefined" != a.id ? (e.push(a), b) : -1
        }

        function u(b, d) {
            var g = a(".player-menu-reload");
            g.unbind("click");
            g.click(function () {
                a(this).hasClass("active") ?
                    a(this).removeClass("active") : a(this).addClass("active")
            });
            if (0 >= e.length) return a.zvPlayer.clear(), !1;
            if (b == f) return !1;
            f = 0 > b ? e.length - 1 : b == e.length ? 0 : b;
            n = !d;
            c.find(".player-time-total, .player-time-loaded, .player-time-current, .player-song-name, .player-time-start, .player-time-end").css("cursor", "pointer");
            c.find(".player-time-total, .player-time-loaded, .player-time-current, .player-song-name, .player-time-start, .player-time-end").unbind("click");
            c.find(".player-time-total, .player-time-loaded, .player-time-current, .player-song-name, .player-time-start, .player-time-end").click(function (b) {
                b =
                    (b.pageX - a(this).parent().offset().left) / k();
                0 < e[f].duration ? h.setPosition(b * e[f].duration * 1E3) : h.setPosition(b * h.duration);
                y(b)
            });
            c.find(".player-time-loaded, .player-time-current").width(0);
            c.find(".player-time-start, .player-time-end").text("");
            c.find(".player-song-name").text(e[f].title);
            c.find(".player-menu-plus").attr("data-title", e[f].title);
            c.find(".player-menu-plus").attr("data-sid", e[f].id);
            c.find(".player-menu-plus").attr("data-url", e[f].stream_url);
            c.find(".player-menu-plus").attr("data-time",
                e[f].duration);
            c.find(".player-menu-plus").removeClass("in_playlist");
            c.find(".player-nav-prev").unbind("click");
            c.find(".player-nav-prev").click(function () {
                a.zvPlayer.previous();
                return !1
            });
            c.find(".player-nav-next").unbind("click");
            c.find(".player-nav-next").click(function () {
                a.zvPlayer.next();
                return !1
            });
            c.find(".player-menu-plus").unbind("click");
            c.find(".player-menu-plus").click(function () {
                if ("1" == isGuest) return window.location = "/login", !1;
                var b = a.zvPlayer.addToPlaylist(e[f].stream_url, e[f].title,
                    e[f].id, e[f].duration), d = a(this), c = "";
                !1 === b ? d.hasClass("in_playlist") || (d.addClass("in_playlist").attr("title", "\u0412 \u043f\u043b\u0435\u0439\u043b\u0438\u0441\u0442\u0435"), c = a('<div class="song_mess2"><div class="bg"><div class="cnt">\u041f\u0435\u0441\u043d\u044f \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u0430<br/>\u0432 \u043f\u043b\u0435\u0439\u043b\u0438\u0441\u0442</div></div></div>')) : !0 !== b || d.hasClass("in_playlist") || (d.addClass("in_playlist").attr("title", "\u0412 \u043f\u043b\u0435\u0439\u043b\u0438\u0441\u0442\u0435"),
                    c = a('<div class="song_mess2"><div class="bg"><div class="cnt">\u042d\u0442\u0430 \u043f\u0435\u0441\u043d\u044f \u0443\u0436\u0435<br/>\u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u0430 \u0432 \u043f\u043b\u0435\u0439\u043b\u0438\u0441\u0442</div></div></div>'));
                if ("" != c) {
                    c.fadeIn(500);
                    c.appendTo("body");
                    b = d.offset().left - c.outerWidth() / 2 + d.outerWidth() / 2;
                    var g = "center bottom";
                    d.hasClass("left_song_mess") && (b = d.offset().left - c.outerWidth() / 1.1 + d.outerWidth() / 2, g = "95% bottom");
                    d = d.offset().top -
                        c.outerHeight() - 13;
                    c.css({top: d, left: b, display: "block", backgroundPosition: g});
                    setTimeout(function () {
                        c.fadeOut(400, function () {
                            a(this).remove()
                        })
                    }, 900)
                }
                return !1
            });
            a("[data-sid]").removeClass("stop");
            a("div[data-play]").removeClass("played");
            c.find(".player-menu-download").unbind("click");
            c.find(".player-menu-download").click(function () {
                a.zvPlayer.download(e[f].id, e[f].stream_url);
                return !1
            });
            h && (a.zvPlayer.pause(), h.destruct());
            n = !1;
            x = e[f].id;
            a(".player-nav-play").addClass("stop");
            if (b = a("#SongView")) b.find(".left span").attr("class",
                "stop"), b.find(".cnt").text("\u041f\u0430\u0443\u0437\u0430");
            a("[data-sid=" + e[f].id + "]").addClass("stop");
            a("div[data-play=" + e[f].id + "]").addClass("played");
            a("#face").fadeOut(1E3);
            a(".player-time-total").fadeIn(1E3);
            a(".player-time-loaded,.player-time-current").fadeIn(1E3);
            a(".player-time-total").removeClass("green-player");
            window.soundManager.stopAll();
            h = window.soundManager.createSound({
                id: "zv_sound" + e[f].id,
                url: e[f].stream_url + "?play=on",
                autoPlay: !0,
                autoLoad: !0,
                volume: w,
                multiShot: !1,
                whileloading: M,
                whileplaying: N,
                onfinish: I,
                bufferTime: 2,
                type: "audio/mp3"
            });
            a.zvPlayer.lastSound = h
        }

        function G(b, d) {
            var g = a(".player-menu-reload");
            g.unbind("click");
            g.click(function () {
                showTopNotify("<strong>\u041d\u0435\u043b\u044c\u0437\u044f \u043f\u0440\u0438 \u043f\u0440\u043e\u0441\u043b\u0443\u0448\u0438\u0432\u0430\u043d\u0438\u0438 \u0440\u0430\u0434\u0438\u043e</strong>")
            });
            a.zvPlayer.clear();
            c.find(".player-time-loaded, .player-time-current").width(0);
            c.find(".player-time-start").text("");
            c.find(".player-time-end").text("");
            c.find(".player-song-name").text(b);
            c.find(".player-menu-plus").attr("data-title", b);
            c.find(".player-menu-plus").attr("data-sid", 0);
            c.find(".player-menu-plus").attr("data-url", "#plus");
            c.find(".player-menu-plus").attr("data-time", 0);
            c.find(".player-menu-plus").removeClass("in_playlist");
            c.find(".player-menu-plus").unbind("click");
            c.find(".player-menu-plus").click(function () {
                showTopNotify("<strong>\u041d\u0435\u043b\u044c\u0437\u044f \u043f\u0440\u0438 \u043f\u0440\u043e\u0441\u043b\u0443\u0448\u0438\u0432\u0430\u043d\u0438\u0438 \u0440\u0430\u0434\u0438\u043e</strong>");
                return !1
            });
            c.find(".player-menu-download").unbind("click");
            c.find(".player-menu-download").click(function () {
                showTopNotify("<strong>\u041d\u0435\u043b\u044c\u0437\u044f \u043f\u0440\u0438 \u043f\u0440\u043e\u0441\u043b\u0443\u0448\u0438\u0432\u0430\u043d\u0438\u0438 \u0440\u0430\u0434\u0438\u043e</strong>");
                return !1
            });
            h && h.destruct();
            x = -1;
            c.find(".player-time-total, .player-time-loaded, .player-time-current, .player-song-name, .player-time-start, .player-time-end").unbind("click");
            c.find(".player-time-total, .player-time-loaded, .player-time-current, .player-song-name, .player-time-start, .player-time-end").css("cursor",
                "default");
            c.find(".player-nav-prev").unbind("click");
            c.find(".player-nav-prev").click(function () {
                showTopNotify("<strong>\u041d\u0435\u043b\u044c\u0437\u044f \u043f\u0440\u0438 \u043f\u0440\u043e\u0441\u043b\u0443\u0448\u0438\u0432\u0430\u043d\u0438\u0438 \u0440\u0430\u0434\u0438\u043e</strong>")
            });
            c.find(".player-nav-play").unbind("click");
            c.find(".player-nav-play").click(function () {
                a.zvPlayer.toggleRadio();
                return !1
            });
            c.find(".player-nav-next").unbind("click");
            c.find(".player-nav-next").click(function () {
                showTopNotify("<strong>\u041d\u0435\u043b\u044c\u0437\u044f \u043f\u0440\u0438 \u043f\u0440\u043e\u0441\u043b\u0443\u0448\u0438\u0432\u0430\u043d\u0438\u0438 \u0440\u0430\u0434\u0438\u043e</strong>")
            });
            n = !1;
            a(".player-nav-play").addClass("stop");
            a("[data-sid]").removeClass("stop");
            a("div[data-play]").removeClass("played");
            if (b = a("#SongView")) b.find(".left span").attr("class", "play"), b.find(".cnt").text("\u0421\u043b\u0443\u0448\u0430\u0442\u044c");
            a("#face").fadeOut(1E3);
            a(".player-time-total").fadeIn(1E3);
            a(".player-time-loaded,.player-time-current").fadeOut(1E3);
            a(".player-time-total").addClass("green-player");
            setTimeout(function () {
                a.post("/ajax/inc/radio", {url: d})
            }, 5E3);
            h = window.soundManager.createSound({
                id: "zv_radio" +
                Math.random(),
                url: d,
                autoPlay: !0,
                autoLoad: v.autoLoad,
                volume: w,
                whileloading: O,
                whileplaying: P,
                onfinish: I
            });
            a.zvPlayer.lastSound = h
        }

        function M() {
            if (1 > this.bytesLoaded / this.bytesTotal) {
                var a = this.bytesLoaded / this.bytesTotal * k();
                c.find(".player-time-loaded").css("width", a + "px")
            } else c.find(".player-time-loaded").css("width", "0")
        }

        function O() {
        }

        function P() {
            var a = this.position / 1E3;
            a = Math.abs(a);
            var d = [];
            var g = 0;
            d[g] = Math.floor(a / 3600 % 24);
            0 < d[g] && g++;
            d[g] = Math.floor(a / 60 % 60);
            g++;
            d[g] = Math.floor(a % 60);
            a = !0;
            var e = -1;
            for (g = 0; g < d.length; g++) 10 > d[g] && (1 == g || 2 == g) && (d[g] = "0" + d[g]), "00" == d[g] && g < d.length - 2 && !a ? e = g : a = !0;
            d.splice(0, e + 1);
            d = d.join(":");
            C != d && (c.find(".player-time-start").text(d), c.find(".player-time-end").text(""));
            C = d
        }

        function N() {
            0 < e[f].duration ? J(this.position, 1E3 * e[f].duration) : J(this.position, this.duration)
        }

        function I() {
            var b;
            if (v.playNextWhenFinished) if (0 == a(".player-menu-reload").hasClass("active") && 1 < e.length) a.zvPlayer.next(); else if (1 == a(".player-menu-reload").hasClass("active")) h.playState =
                !1, a.zvPlayer.play(); else {
                if (a.zvPlayer.pause(), c.find(".player-time-start").text(""), c.find(".player-time-end").text(""), h.setPosition(0), y(0), b = a("div[data-play=" + e[f].id + "]").attr("data-next")) if (b = a("div[data-play=" + b + "] .song-play")) {
                    e = [];
                    var d = b.attr("data-url");
                    "#" == d && (d = b.attr("data-href"));
                    t({
                        duration: b.attr("data-time"),
                        stream_url: d,
                        title: b.attr("data-title"),
                        id: b.attr("data-sid")
                    });
                    f = -1;
                    a.zvPlayer.addTrack(d, b.attr("data-title"), b.attr("data-sid"), !0, b.attr("data-time"))
                }
            } else if (a.zvPlayer.pause(),
                c.find(".player-time-start").text(""), c.find(".player-time-end").text(""), h.setPosition(0), y(0), b = a("div[data-play=" + e[f].id + "]").attr("data-next")) if (b = a("div[data-play=" + b + "] .song-play")) e = [], d = b.attr("data-url"), "#" == d && (d = b.attr("data-href")), t({
                duration: b.attr("data-time"),
                stream_url: d,
                title: b.attr("data-title"),
                id: b.attr("data-sid")
            }), f = -1, a.zvPlayer.addTrack(d, b.attr("data-title"), b.attr("data-sid"), !0, b.attr("data-time"))
        }

        function y(a) {
            a *= k();
            c.find(".player-time-current").css("width", a)
        }

        function J(a, d) {
            var b = F(a / 1E3);
            C != b && (c.find(".player-time-start").text(b), c.find(".player-time-end").text("-" + F(d / 1E3 - a / 1E3)), y(a / d));
            C = b
        }

        function F(a) {
            a = Math.abs(a);
            var b = [];
            b[0] = Math.floor(a / 60 % 60);
            b[1] = Math.floor(a % 60);
            a = !0;
            for (var c = -1, e = 0; e < b.length; e++) 10 > b[e] && 1 == e && (b[e] = "0" + b[e]), "00" == b[e] && e < b.length - 2 && !a ? c = e : a = !0;
            b.splice(0, c + 1);
            return b.join(":")
        }

        var v = a.extend({}, a.fn.zvPlayer.defaults, l), c, r, h, C, B = -1, f = -1, w = 100, n = !0, A, x, E = !0,
            e = [];
        a.zvPlayer.download = function (downloadSpan, playerDownloadSpan) {
            playerDownloadSpan = a(downloadSpan);
            !isNaN(parseFloat(downloadSpan)) &&
            isFinite(downloadSpan) && (playerDownloadSpan = a(".player-menu-download"));
            var DSpanOrDataSid = 0;
            DSpanOrDataSid = !isNaN(parseFloat(downloadSpan)) && isFinite(downloadSpan) ? downloadSpan : playerDownloadSpan.attr("data-sid");
            a.getJSON("/ajax/inc/" + DSpanOrDataSid, {}, function (data) {
                $iframe = a("<iframe>").attr("style", "text-indent:-9999px;border:none;width:0px;height:0px;visibility:hidden;").attr("src", data.url).appendTo("body");
                saveSongIdCookie(DSpanOrDataSid)
            });
            a('[data-sid="' + DSpanOrDataSid + '"].download').addClass("visited").attr("data-original-title", "");
            return !1
        };
        a.zvPlayer.radionInit = function () {
            a(".radio-play").each(function (b, d) {
                a(d).unbind("click");
                a(d).click(function () {
                    var b = a(this).attr("data-href");
                    G(a(this).attr("data-title"), b);
                    return !1
                })
            })
        };
        a.zvPlayer.renderElement = function () {
            p();
            H()
        };
        a.zvPlayer.play = function () {
            if (0 < e.length) {
                a("[data-sid]").removeClass("stop");
                a("div[data-play]").removeClass("played");
                -1 == f && 0 < e.length && (f = 0);
                a("[data-sid=" + e[f].id + "]").addClass("stop");
                a("div[data-play=" + e[f].id + "]").addClass("played");
                a(".player-nav-play").addClass("stop");
                var b = a("#SongView");
                b && (b.find(".left span").attr("class", "stop"), b.find(".cnt").text("\u041f\u0430\u0443\u0437\u0430"));
                h.playState ? h.resume() : h.play();
                n = !1
            }
            return !0
        };
        a.zvPlayer.pause = function () {
            if (0 < e.length) {
                a("[data-sid]").removeClass("stop");
                a("div[data-play]").removeClass("played");
                a(".player-nav-play").removeClass("stop");
                var b = a("#SongView");
                b && (b.find(".left span").attr("class", "play"), b.find(".cnt").text("\u0421\u043b\u0443\u0448\u0430\u0442\u044c"));
                0 == n && (n = !0, h.pause())
            }
            return !0
        };
        a.zvPlayer.toggleRadio = function () {
            n ? (h.play(), a(".player-nav-play").addClass("stop"), n = !1) : (h.pause(), a(".player-nav-play").removeClass("stop"), n = !0)
        };
        a.zvPlayer.toggle = function () {
            n ? a.zvPlayer.play() : a.zvPlayer.pause()
        };
        a.zvPlayer.previous = function () {
            if (1 <
                e.length) u(f - 1, !0); else {
                var b = a("div[data-play=" + e[f].id + "]").attr("data-prev");
                if (b && (b = a("div[data-play=" + b + "] .song-play"))) {
                    e = [];
                    var d = b.attr("data-url");
                    "#" == d && (d = b.attr("data-href"));
                    t({
                        duration: b.attr("data-time"),
                        stream_url: d,
                        title: b.attr("data-title"),
                        id: b.attr("data-sid")
                    });
                    f = -1;
                    a.zvPlayer.addTrack(d, b.attr("data-title"), b.attr("data-sid"), !0, b.attr("data-time"))
                }
            }
        };
        a.zvPlayer.next = function () {
            if (1 < e.length) u(f + 1, !0); else {
                var b = a("div[data-play=" + e[f].id + "]").attr("data-next");
                if (b && (b =
                    a("div[data-play=" + b + "] .song-play"))) {
                    e = [];
                    var d = b.attr("data-url");
                    "#" == d && (d = b.attr("data-href"));
                    t({
                        duration: b.attr("data-time"),
                        stream_url: d,
                        title: b.attr("data-title"),
                        id: b.attr("data-sid")
                    });
                    f = -1;
                    a.zvPlayer.addTrack(d, b.attr("data-title"), b.attr("data-sid"), !0, b.attr("data-time"))
                }
            }
        };
        a.zvPlayer.volume = function (b, d) {
            d || (d = 0);
            0 > b && (b = 0);
            1 < b && (b = 1);
            var e = 100 * b;
            0 != b && a.cookie("ZvcurrentVolume", e);
            h && h.setVolume(e);
            1 == d ? (c.find("#player-volume-current").animate({width: 100 * b}), c.find("#player-volume-handle").animate({
                left: 100 *
                b
            })) : (c.find("#player-volume-current").css("width", 100 * b), c.find("#player-volume-handle").css("left", 100 * b));
            c.find("#player-volume-handle").attr("data-original-title", parseInt(100 * b) + "%");
            w = e
        };
        a.zvPlayer.addToPlaylist = function (b, d, c, k) {
            if (!v.playlist) return !1;
            var g = !1;
            a.ajaxSetup({async: !1});
            a.getJSON("/playlist/add/song/" + c, function (b) {
                if ("login" == b.status) window.location = "/login", g = !0; else if ("max_song_count" == b.status) showTopNotify("<strong>\u041c\u0430\u043a\u0441\u0438\u043c\u0430\u043b\u044c\u043d\u043e\u0435 \u0447\u0438\u0441\u043b\u043e \u043a\u043e\u043c\u043f\u043e\u0437\u0438\u0446\u0438\u0439 100</strong>"),
                    g = "max"; else if ("1" == b.status) {
                    var d = b.id, c = a("#playlist-content-" + d).find(".playlist-count");
                    0 === c.length && (c = a("#playlist-content-nill").clone(), c.attr("id", "playlist-content-" + b.id), c.find("#name-playlist-null").attr("id", "name-playlist-" + b.id).attr("place", b.name).val(b.name), c.find(".playlist-del").click(function () {
                        deletePlaylist(b.id, this)
                    }), c.find(".playlist-ok").click(function () {
                        saveNamePlaylist(b.id)
                    }), c.find(".playlist-play").unbind("click"), c.find(".playlist-play").click(function (b) {
                        a("#plpop-playlists").hide();
                        a("#plpop-songs").show();
                        a("#plpop .playlist-play").removeClass("stop");
                        a(this).addClass("stop");
                        var c = a("#pl-song-list");
                        c.html("loading");
                        a.get("/playlist/" + d, function (b) {
                            c.html(b);
                            setTimeout(function () {
                                var b = a(".plpop-scroll-pane");
                                b.jScrollPane({showArrows: !0});
                                b.data("jsp").reinitialise()
                            }, 1500);
                            a.zvPlayer.rebuild()
                        });
                        b.preventDefault()
                    }), c.find(".playlist-rename input").focus(function () {
                        a(this).parents(".playlist-wrap:first").addClass("renamed")
                    }), c.find(".playlist-wrap").hover(function () {
                        a(this).hasClass("renamed") ||
                        (a(".playlist-wrap").removeClass("renamed"), a(".playlist-rename input").parents(".playlist-wrap:first").removeClass("renamed"))
                    }, function () {
                    }), a("#plki").append(c), c.show(), c = a("#playlist-content-" + d).find(".playlist-count"));
                    animateCount(a(c), 1)
                } else g = !0
            });
            a.ajaxSetup({async: !0});
            if (g) return g;
            var m = a("#nullSongPatern").clone();
            m.removeAttr("id");
            m.addClass("song_" + c);
            var l = explode("\u2014", d);
            m.find(".song-artist a").attr("href", "/song/" + c).find("span").text(l[0].trim());
            m.find(".song-name a").attr("href",
                "/song/" + c).find("span").text(l[1].trim());
            m.find(".song-time").text(F(k));
            r.find("#pl-song-list").append(m);
            m.show();
            reloadScroll();
            t({duration: k, stream_url: b, title: d, id: c});
            m.find(".song-play").attr("data-sid", c);
            m.find(".song-play").attr("data-title", d);
            m.find(".song-play").attr("data-url", b);
            m.find(".song-play").attr("data-time", k);
            m.off("click", ".song-play");
            m.find(".song-play").unbind();
            m.find(".song-play").click(function () {
                if (x != a(this).attr("data-sid")) {
                    var b = r.find("#pl-song-list").find("div.songs-list-item").index(a(this).parent().parent().parent());
                    u(b, !0)
                } else h.toggle();
                return !1
            });
            m.find(".song-delete").unbind("click");
            m.find(".song-delete").click(function () {
                var b = a(this),
                    d = b.parent().parent().parent().parent().parent().parent().children("div").index(b.parent().parent().parent().parent().parent()),
                    g = !1;
                a.ajaxSetup({async: !1});
                a.getJSON("/playlist/delete/song/" + c, function (a) {
                    "login" == a.status && (window.location = "/login", g = !0)
                });
                a.ajaxSetup({async: !0});
                if (g) return !1;
                a("body").trigger("delete-song");
                e.splice(d, 1);
                b.parent().parent().parent().parent().parent().remove();
                reloadScroll();
                d == f ? (f--, d = d == e.length ? 0 : d, u(d, n ? !1 : !0)) : d < f && f--
            });
            return g
        };
        a.zvPlayer.addTrack = function (b, d, c, e, f) {
            void 0 === d && (d = "");
            void 0 === e && (e = !1);
            E = e;
            b = t({duration: f, stream_url: b, title: d, id: c});
            e && (x != c ? (a("[data-sid]").removeClass("stop"), a("div[data-play]").removeClass("played"), u(b, !0), a("[data-sid=" + c + "].song-play").addClass("stop"), a("div[data-play=" + c + "].").addClass("played")) : a.zvPlayer.toggle())
        };
        a.zvPlayer.playFirst = function () {
            0 < e.length && (a("[data-sid]").removeClass("stop"), a("div[data-play]").removeClass("played"),
                u(0, !0), a("[data-sid=" + e[0].id + "].song-play").addClass("stop"), a("div[data-play=" + e[0].id + "].").addClass("played"))
        };
        a.zvPlayer.rebuild = function () {
            a.zvPlayer.clear();
            v.playlist && (r = a("#plpop-songs"));
            h || D();
            r.find("#pl-song-list").children("div").each(function (b, c) {
                b = a(c).find(".song-play");
                t({
                    duration: a(b).attr("data-time"),
                    stream_url: a(b).attr("data-url"),
                    title: a(b).attr("data-title"),
                    id: a(b).attr("data-sid")
                });
                var d = a(b).attr("data-sid");
                a(c).find(".song-play").off("click");
                a(c).find(".song-play").unbind("click");
                a(c).find(".song-play").click(function () {
                    if (x != a(this).attr("data-sid")) {
                        var b = a(this);
                        b = b.parent().parent().parent().parent().children("div").index(b.parent().parent().parent());
                        e = [];
                        f = -1;
                        r.find("#pl-song-list").children("div").each(function (b, c) {
                            b = a(c).find(".song-play");
                            c = b.attr("data-url");
                            "#" == c && (c = b.attr("data-href"));
                            t({
                                duration: a(b).attr("data-time"),
                                stream_url: c,
                                title: a(b).attr("data-title"),
                                id: a(b).attr("data-sid")
                            })
                        });
                        u(b, !0)
                    } else h.toggle();
                    return !1
                });
                a(c).find(".song-delete").unbind("click");
                a(c).find(".song-delete").click(function () {
                    var b = a(this),
                        c = b.parent().parent().parent().parent().parent().parent().children("div").index(b.parent().parent().parent().parent().parent()),
                        g = !1;
                    a.ajaxSetup({async: !1});
                    a.getJSON("/playlist/delete/song/" + d, function (a) {
                        "login" == a.status && (window.location = "/login", g = !0)
                    });
                    a.ajaxSetup({async: !0});
                    if (g) return !1;
                    a("body").trigger("delete-song");
                    e.splice(c, 1);
                    b.tooltip("hide");
                    b.parent().parent().parent().parent().parent().remove();
                    reloadScroll();
                    c == f ? (f--, c =
                        c == e.length ? 0 : c, u(c, n ? !1 : !0)) : c < f && f--
                })
            });
            reloadScroll();
            a.zvPlayer.playFirst()
        };
        a.zvPlayer.clear = function () {
            c.find(".player-time-loaded, .player-time-current").width(0);
            c.find(".player-time-start, .player-time-end").text("");
            n = !0;
            f = -1;
            B = 0;
            v.playlist && r.find("#plpop-songs .songs-list").empty();
            e = [];
            h && h.destruct()
        };
        return this.each(function () {
            c = a(this);
            A = !0;
            n = !v.autoPlay;
            w = a.cookie("ZvcurrentVolume") ? a.cookie("ZvcurrentVolume") : 100;
            H();
            z();
            window.soundManager.onready(q)
        })
    };
    a.fn.zvPlayer.defaults =
        {opened: !0, volume: !0, playlist: !0, autoLoad: !0, autoPlay: !0, playNextWhenFinished: !0, keyboard: !0}
})(jQuery);

function explode(a, l) {
    var k = {0: ""};
    if (2 != arguments.length || "undefined" == typeof arguments[0] || "undefined" == typeof arguments[1]) return null;
    if ("" === a || !1 === a || null === a) return !1;
    if ("function" == typeof a || "object" == typeof a || "function" == typeof l || "object" == typeof l) return k;
    !0 === a && (a = "1");
    return l.toString().split(a.toString())
};(function (c) {
    "function" === typeof define && define.amd ? define(["jquery"], c) : "object" === typeof exports ? module.exports = c : c(jQuery)
})(function (c) {
    function l(a) {
        var b = a || window.event, k = r.call(arguments, 1), f = 0, e = 0, d = 0, g = 0, l = 0, n = 0;
        a = c.event.fix(b);
        a.type = "mousewheel";
        "detail" in b && (d = -1 * b.detail);
        "wheelDelta" in b && (d = b.wheelDelta);
        "wheelDeltaY" in b && (d = b.wheelDeltaY);
        "wheelDeltaX" in b && (e = -1 * b.wheelDeltaX);
        "axis" in b && b.axis === b.HORIZONTAL_AXIS && (e = -1 * d, d = 0);
        f = 0 === d ? e : d;
        "deltaY" in b && (f = d = -1 * b.deltaY);
        "deltaX" in
        b && (e = b.deltaX, 0 === d && (f = -1 * e));
        if (0 !== d || 0 !== e) {
            1 === b.deltaMode ? (g = c.data(this, "mousewheel-line-height"), f *= g, d *= g, e *= g) : 2 === b.deltaMode && (g = c.data(this, "mousewheel-page-height"), f *= g, d *= g, e *= g);
            g = Math.max(Math.abs(d), Math.abs(e));
            if (!h || g < h) h = g, m.settings.adjustOldDeltas && ("mousewheel" === b.type && 0 === g % 120) && (h /= 40);
            m.settings.adjustOldDeltas && ("mousewheel" === b.type && 0 === g % 120) && (f /= 40, e /= 40, d /= 40);
            f = Math[1 <= f ? "floor" : "ceil"](f / h);
            e = Math[1 <= e ? "floor" : "ceil"](e / h);
            d = Math[1 <= d ? "floor" : "ceil"](d / h);
            m.settings.normalizeOffset && this.getBoundingClientRect && (b = this.getBoundingClientRect(), l = a.clientX - b.left, n = a.clientY - b.top);
            a.deltaX = e;
            a.deltaY = d;
            a.deltaFactor = h;
            a.offsetX = l;
            a.offsetY = n;
            a.deltaMode = 0;
            k.unshift(a, f, e, d);
            p && clearTimeout(p);
            p = setTimeout(s, 200);
            return (c.event.dispatch || c.event.handle).apply(this, k)
        }
    }

    function s() {
        h = null
    }

    var n = ["wheel", "mousewheel", "DOMMouseScroll", "MozMousePixelScroll"],
        k = "onwheel" in document || 9 <= document.documentMode ? ["wheel"] : ["mousewheel", "DomMouseScroll", "MozMousePixelScroll"],
        r = Array.prototype.slice, p, h;
    if (c.event.fixHooks) for (var q = n.length; q;) c.event.fixHooks[n[--q]] = c.event.mouseHooks;
    var m = c.event.special.mousewheel = {
        version: "3.1.12", setup: function () {
            if (this.addEventListener) for (var a = k.length; a;) this.addEventListener(k[--a], l, !1); else this.onmousewheel = l;
            c.data(this, "mousewheel-line-height", m.getLineHeight(this));
            c.data(this, "mousewheel-page-height", m.getPageHeight(this))
        }, teardown: function () {
            if (this.removeEventListener) for (var a = k.length; a;) this.removeEventListener(k[--a],
                l, !1); else this.onmousewheel = null;
            c.removeData(this, "mousewheel-line-height");
            c.removeData(this, "mousewheel-page-height")
        }, getLineHeight: function (a) {
            a = c(a);
            var b = a["offsetParent" in c.fn ? "offsetParent" : "parent"]();
            b.length || (b = c("body"));
            return parseInt(b.css("fontSize"), 10) || parseInt(a.css("fontSize"), 10) || 16
        }, getPageHeight: function (a) {
            return c(a).height()
        }, settings: {adjustOldDeltas: !0, normalizeOffset: !0}
    };
    c.fn.extend({
        mousewheel: function (a) {
            return a ? this.bind("mousewheel", a) : this.trigger("mousewheel")
        },
        unmousewheel: function (a) {
            return this.unbind("mousewheel", a)
        }
    })
});
(function (a) {
    function g() {
        this === b.elem && (b.pos = [-260, -260], b.elem = !1, c = 3)
    }

    var b = {pos: [-260, -260]}, c = 3, d = document, m = d.documentElement, h = d.body, k, l;
    a.event.special.mwheelIntent = {
        setup: function () {
            var e = a(this).bind("mousewheel", a.event.special.mwheelIntent.handler);
            this !== d && (this !== m && this !== h) && e.bind("mouseleave", g);
            return !0
        }, teardown: function () {
            a(this).unbind("mousewheel", a.event.special.mwheelIntent.handler).unbind("mouseleave", g);
            return !0
        }, handler: function (e, d) {
            var f = [e.clientX, e.clientY];
            if (this ===
                b.elem || Math.abs(b.pos[0] - f[0]) > c || Math.abs(b.pos[1] - f[1]) > c) return b.elem = this, b.pos = f, c = 250, clearTimeout(l), l = setTimeout(function () {
                c = 10
            }, 200), clearTimeout(k), k = setTimeout(function () {
                c = 3
            }, 1500), e = a.extend({}, e, {type: "mwheelIntent"}), (a.event.dispatch || a.event.handle).apply(this, arguments)
        }
    };
    a.fn.extend({
        mwheelIntent: function (a) {
            return a ? this.bind("mwheelIntent", a) : this.trigger("mwheelIntent")
        }, unmwheelIntent: function (a) {
            return this.unbind("mwheelIntent", a)
        }
    });
    a(function () {
        h = d.body;
        a(d).bind("mwheelIntent.mwheelIntentDefault",
            a.noop)
    })
})(jQuery);
$(function () {
    $("#plpop .playlist-play").each(function (a, c) {
        $(c).attr("rel") && ($(c).unbind("click"), $(c).click(function (a) {
            $("#plpop-playlists").hide();
            $("#plpop-songs").show();
            $("#plpop .playlist-play").removeClass("stop");
            $(c).addClass("stop");
            if ($(c).attr("rel") != playlist_id) {
                var b = $(c).attr("rel");
                $("#pl-song-list").hide();
                $("#songs-playlists-preloader").fadeIn();
                $("#pl-song-list").load("/playlist/" + b, function () {
                    playlist_id = b;
                    $.zvPlayer.rebuild();
                    $("#songs-playlists-preloader").hide();
                    $("#pl-song-list").fadeIn()
                })
            } else $.zvPlayer.rebuild();
            reloadScroll();
            return !1
        }))
    });
    $("#plpop .prev-ico").unbind("click");
    $("#plpop .prev-ico").click(function (a) {
        $("#plpop-playlists").show();
        $("#plpop-songs").hide();
        reloadScroll();
        a.preventDefault()
    });
    var a = $.cookie("playListIsOpen") ? $.cookie("playListIsOpen") : "1";
    $(".player-menu-playlists").unbind("click");
    $(".player-menu-playlists").click(function () {
        "0" == isGuest ? ($(this).toggleClass("active"), "hidden" != $("#plpop").css("visibility") ? ($("#plpop").css("visibility",
            "hidden"), $.cookie("playListIsOpen", "0")) : ($("#plpop").css("visibility", "visible"), $.cookie("playListIsOpen", "1"))) : window.location = "/login"
    });
    "0" == isGuest && "1" == a && $(".player-menu-playlists").click();
    $(".player-menu-reload").unbind("click");
    $(".player-menu-reload").click(function () {
        $(this).hasClass("active") ? ($(this).removeClass("active"), loping = !1) : (loping = !0, $(this).addClass("active"))
    })
});

function reloadScroll() {
    var a = $(".plpop-scroll-pane"), b = {showArrows: !0};
    a && "function" == typeof $.prototype.jScrollPane && (a.jScrollPane(b), a = a.data("jsp"), a.reinitialise());
    $(".song .mb-tooltip").tooltip({limit_width: 600, placement: "bottom"})
}

function addNewPlaylist() {
    $.getJSON("/playlist/create", function (a) {
        if ("max_pl_count" == a.status) showTopNotify("<b>\u041c\u0430\u043a\u0441\u0438\u043c\u0430\u043b\u044c\u043d\u043e\u0435 \u0447\u0438\u0441\u043b\u043e \u043f\u043b\u0435\u0439\u043b\u0438\u0441\u0442\u043e\u0432 20</b>"), out = !0; else if ("login" == a.status) window.location = "/login", out = !0; else if ("" != a.name) {
            var b = $("#playlist-content-nill").clone();
            b.attr("id", "playlist-content-" + a.id);
            b.find("#name-playlist-null").attr("id", "name-playlist-" +
                a.id).attr("place", a.name).val(a.name);
            b.find(".playlist-del").unbind("click");
            b.find(".playlist-del").click(function () {
                deletePlaylist(a.id, this)
            });
            b.find(".playlist-ok").unbind("click");
            b.find(".playlist-ok").click(function () {
                saveNamePlaylist(a.id)
            });
            b.find(".playlist-play").unbind("click");
            b.find(".playlist-play").click(function (b) {
                $("#plpop-playlists").hide();
                $("#plpop-songs").show();
                $("#plpop .playlist-play").removeClass("stop");
                $(this).addClass("stop");
                if ($(this).attr("rel") != playlist_id) {
                    var d =
                        a.id;
                    $("#pl-song-list").html("loading");
                    $("#pl-song-list").load("/playlist/" + d, function () {
                        playlist_id = d;
                        $.zvPlayer.rebuild()
                    })
                } else $.zvPlayer.rebuild();
                reloadScroll();
                b.preventDefault()
            });
            b.find(".playlist-rename input").unbind("focus");
            b.find(".playlist-rename input").focus(function () {
                $(this).parents(".playlist-wrap:first").addClass("renamed")
            });
            b.find(".playlist-wrap").unbind("hover");
            b.find(".playlist-wrap").hover(function () {
                $(this).hasClass("renamed") || ($(".playlist-wrap").removeClass("renamed"),
                    $(".playlist-rename input").parents(".playlist-wrap:first").removeClass("renamed"))
            }, function () {
            });
            $("#plki").append(b);
            b.show();
            reloadScroll()
        }
    })
}

function deletePlaylist(a, b) {
    $.getJSON("/playlist/delete/" + a, function (c) {
        "login" == c.status ? (window.location = "/login", out = !0) : 0 == c && ($(b).tooltip("hide"), $("#playlist-content-" + a).remove(), reloadScroll())
    })
}

function saveNamePlaylist(a) {
    $("#name-playlist-" + a).val() != $("#name-playlist-" + a).attr("place") && $.getJSON("/playlist/update/" + a, {name: $("#name-playlist-" + a).val()}, function (b) {
        "login" == b.status && (window.location = "/login", out = !0);
        $("#name-playlist-" + a).attr("place", $("#name-playlist-" + a).val())
    });
    $("#name-playlist-" + a).parents(".playlist-wrap:first").removeClass("renamed")
}

jQuery.event.special.drag = {
    add: function (a) {
        var b = a.handler;
        a.handler = function (a) {
            if (jQuery(this).data("mousePressed")) return b.apply(this, arguments)
        }
    }, setup: function (a, b) {
        var c = jQuery(this);
        c.data("mousePressed", !1);
        c.bind("mousedown", function () {
            jQuery(this).data("mousePressed", !0)
        });
        jQuery(document).bind("mouseup", function () {
            c.data("mousePressed", !1)
        });
        c.bind("mousemove", jQuery.event.special.drag.handler)
    }, teardown: function (a) {
        a = jQuery(this);
        jQuery.removeData(this, "mousePressed");
        a.unbind("mousedown");
        a.unbind("mouseup")
    }, handler: function (a) {
        a.type = "drag";
        jQuery.event.handle.apply(this, arguments)
    }
};
(function (a) {
    setInterval(function () {
        var b = a(".plpop-scroll-pane"), c = {showArrows: !0};
        b && "function" == typeof a.prototype.jScrollPane && (b.jScrollPane(c), (b = b.data("jsp")) && b.reinitialise())
    }, 1E3);
    a.fn.shuffle = function () {
        var b = this.get(), c = a.map(b, function () {
            var c = Math.floor(Math.random() * b.length), e = a(b[c]).clone(!0)[0];
            b.splice(c, 1);
            return e
        });
        this.each(function (b) {
            a(this).replaceWith(a(c[b]))
        });
        return a(c)
    }
})(jQuery);
window.JSON || (window.JSON = {}), function () {
    function f(a) {
        return a < 10 ? "0" + a : a
    }

    function quote(a) {
        return escapable.lastIndex = 0, escapable.test(a) ? '"' + a.replace(escapable, function (a) {
            var b = meta[a];
            return typeof b == "string" ? b : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
        }) + '"' : '"' + a + '"'
    }

    function str(a, b) {
        var c, d, e, f, g = gap, h, i = b[a];
        i && typeof i == "object" && typeof i.toJSON == "function" && (i = i.toJSON(a)), typeof rep == "function" && (i = rep.call(b, a, i));
        switch (typeof i) {
            case "string":
                return quote(i);
            case "number":
                return isFinite(i) ?
                    String(i) : "null";
            case "boolean":
            case "null":
                return String(i);
            case "object":
                if (!i) return "null";
                gap += indent, h = [];
                if (Object.prototype.toString.apply(i) === "[object Array]") {
                    f = i.length;
                    for (c = 0; c < f; c += 1) h[c] = str(c, i) || "null";
                    return e = h.length === 0 ? "[]" : gap ? "[\n" + gap + h.join(",\n" + gap) + "\n" + g + "]" : "[" + h.join(",") + "]", gap = g, e
                }
                if (rep && typeof rep == "object") {
                    f = rep.length;
                    for (c = 0; c < f; c += 1) d = rep[c], typeof d == "string" && (e = str(d, i), e && h.push(quote(d) + (gap ? ": " : ":") + e))
                } else for (d in i) Object.hasOwnProperty.call(i,
                    d) && (e = str(d, i), e && h.push(quote(d) + (gap ? ": " : ":") + e));
                return e = h.length === 0 ? "{}" : gap ? "{\n" + gap + h.join(",\n" + gap) + "\n" + g + "}" : "{" + h.join(",") + "}", gap = g, e
        }
    }

    "use strict", typeof Date.prototype.toJSON != "function" && (Date.prototype.toJSON = function (a) {
        return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z" : null
    }, String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON =
        function (a) {
            return this.valueOf()
        });
    var JSON = window.JSON,
        cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap, indent, meta = {"\b": "\\b", "\t": "\\t", "\n": "\\n", "\f": "\\f", "\r": "\\r", '"': '\\"', "\\": "\\\\"},
        rep;
    typeof JSON.stringify != "function" && (JSON.stringify = function (a, b, c) {
        var d;
        gap = "", indent = "";
        if (typeof c ==
            "number") for (d = 0; d < c; d += 1) indent += " "; else typeof c == "string" && (indent = c);
        rep = b;
        if (!b || typeof b == "function" || typeof b == "object" && typeof b.length == "number") return str("", {"": a});
        throw new Error("JSON.stringify");
    }), typeof JSON.parse != "function" && (JSON.parse = function (text, reviver) {
        function walk(a, b) {
            var c, d, e = a[b];
            if (e && typeof e == "object") for (c in e) Object.hasOwnProperty.call(e, c) && (d = walk(e, c), d !== undefined ? e[c] = d : delete e[c]);
            return reviver.call(a, b, e)
        }

        var j;
        text = String(text), cx.lastIndex = 0, cx.test(text) &&
        (text = text.replace(cx, function (a) {
            return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
        }));
        if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) return j = eval("(" + text + ")"), typeof reviver == "function" ? walk({"": j}, "") : j;
        throw new SyntaxError("JSON.parse");
    })
}(), function (a, b) {
    var c = a.History = a.History || {}, d = a.jQuery;
    if (typeof c.Adapter != "undefined") throw new Error("History.js Adapter has already been loaded...");
    c.Adapter = {
        bind: function (a, b, c) {
            d(a).bind(b, c)
        }, trigger: function (a, b, c) {
            d(a).trigger(b, c)
        }, extractEventData: function (a, c, d) {
            var e = c && c.originalEvent && c.originalEvent[a] || d && d[a] || b;
            return e
        }, onDomLoad: function (a) {
            d(a)
        }
    }, typeof c.init != "undefined" && c.init()
}(window), function (a, b) {
    var c = a.document, d = a.setTimeout || d, e = a.clearTimeout || e, f = a.setInterval || f,
        g = a.History = a.History || {};
    if (typeof g.initHtml4 != "undefined") throw new Error("History.js HTML4 Support has already been loaded...");
    g.initHtml4 = function () {
        if (typeof g.initHtml4.initialized !=
            "undefined") return !1;
        g.initHtml4.initialized = !0, g.enabled = !0, g.savedHashes = [], g.isLastHash = function (a) {
            var b = g.getHashByIndex(), c;
            return c = a === b, c
        }, g.saveHash = function (a) {
            return g.isLastHash(a) ? !1 : (g.savedHashes.push(a), !0)
        }, g.getHashByIndex = function (a) {
            var b = null;
            return typeof a == "undefined" ? b = g.savedHashes[g.savedHashes.length - 1] : a < 0 ? b = g.savedHashes[g.savedHashes.length + a] : b = g.savedHashes[a], b
        }, g.discardedHashes = {}, g.discardedStates = {}, g.discardState = function (a, b, c) {
            var d = g.getHashByState(a), e;
            return e = {discardedState: a, backState: c, forwardState: b}, g.discardedStates[d] = e, !0
        }, g.discardHash = function (a, b, c) {
            var d = {discardedHash: a, backState: c, forwardState: b};
            return g.discardedHashes[a] = d, !0
        }, g.discardedState = function (a) {
            var b = g.getHashByState(a), c;
            return c = g.discardedStates[b] || !1, c
        }, g.discardedHash = function (a) {
            var b = g.discardedHashes[a] || !1;
            return b
        }, g.recycleState = function (a) {
            var b = g.getHashByState(a);
            return g.discardedState(a) && delete g.discardedStates[b], !0
        }, g.emulated.hashChange && (g.hashChangeInit =
            function () {
                g.checkerFunction = null;
                var b = "", d, e, h, i;
                return g.isInternetExplorer() ? (d = "historyjs-iframe", e = c.createElement("iframe"), e.setAttribute("id", d), e.style.display = "none", c.body.appendChild(e), e.contentWindow.document.open(), e.contentWindow.document.close(), h = "", i = !1, g.checkerFunction = function () {
                    if (i) return !1;
                    i = !0;
                    var c = g.getHash() || "", d = g.unescapeHash(e.contentWindow.document.location.hash) || "";
                    return c !== b ? (b = c, d !== c && (h = d = c, e.contentWindow.document.open(), e.contentWindow.document.close(),
                        e.contentWindow.document.location.hash = g.escapeHash(c)), g.Adapter.trigger(a, "hashchange")) : d !== h && (h = d, g.setHash(d, !1)), i = !1, !0
                }) : g.checkerFunction = function () {
                    var c = g.getHash();
                    return c !== b && (b = c, g.Adapter.trigger(a, "hashchange")), !0
                }, g.intervalList.push(f(g.checkerFunction, g.options.hashChangeInterval)), !0
            }, g.Adapter.onDomLoad(g.hashChangeInit)), g.emulated.pushState && (g.onHashChange = function (b) {
            var d = b && b.newURL || c.location.href, e = g.getHashByUrl(d), f = null, h = null, i = null, j;
            return g.isLastHash(e) ? (g.busy(!1),
                !1) : (g.doubleCheckComplete(), g.saveHash(e), e && g.isTraditionalAnchor(e) ? (g.Adapter.trigger(a, "anchorchange"), g.busy(!1), !1) : (f = g.extractState(g.getFullUrl(e || c.location.href, !1), !0), g.isLastSavedState(f) ? (g.busy(!1), !1) : (h = g.getHashByState(f), j = g.discardedState(f), j ? (g.getHashByIndex(-2) === g.getHashByState(j.forwardState) ? g.back(!1) : g.forward(!1), !1) : (g.pushState(f.data, f.title, f.url, !1), !0))))
        }, g.Adapter.bind(a, "hashchange", g.onHashChange), g.pushState = function (b, d, e, f) {
            if (g.getHashByUrl(e)) throw new Error("History.js does not support states with fragement-identifiers (hashes/anchors).");
            if (f !== !1 && g.busy()) return g.pushQueue({
                scope: g,
                callback: g.pushState,
                args: arguments,
                queue: f
            }), !1;
            g.busy(!0);
            var h = g.createStateObject(b, d, e), i = g.getHashByState(h), j = g.getState(!1), k = g.getHashByState(j),
                l = g.getHash();
            return g.storeState(h), g.expectedStateId = h.id, g.recycleState(h), g.setTitle(h), i === k ? (g.busy(!1), !1) : i !== l && i !== g.getShortUrl(c.location.href) ? (g.setHash(i, !1), !1) : (g.saveState(h), g.Adapter.trigger(a, "statechange"), g.busy(!1), !0)
        }, g.replaceState = function (a, b, c, d) {
            if (g.getHashByUrl(c)) throw new Error("History.js does not support states with fragement-identifiers (hashes/anchors).");
            if (d !== !1 && g.busy()) return g.pushQueue({
                scope: g,
                callback: g.replaceState,
                args: arguments,
                queue: d
            }), !1;
            g.busy(!0);
            var e = g.createStateObject(a, b, c), f = g.getState(!1), h = g.getStateByIndex(-2);
            return g.discardState(f, e, h), g.pushState(e.data, e.title, e.url, !1), !0
        }), g.emulated.pushState && g.getHash() && !g.emulated.hashChange && g.Adapter.onDomLoad(function () {
            g.Adapter.trigger(a, "hashchange")
        })
    }, typeof g.init != "undefined" && g.init()
}(window), function (a, b) {
    var c = a.console || b, d = a.document, e = a.navigator, f = a.sessionStorage ||
        !1, g = a.setTimeout, h = a.clearTimeout, i = a.setInterval, j = a.clearInterval, k = a.JSON, l = a.alert,
        m = a.History = a.History || {}, n = a.history;
    k.stringify = k.stringify || k.encode, k.parse = k.parse || k.decode;
    if (typeof m.init != "undefined") throw new Error("History.js Core has already been loaded...");
    m.init = function () {
        return typeof m.Adapter == "undefined" ? !1 : (typeof m.initCore != "undefined" && m.initCore(), typeof m.initHtml4 != "undefined" && m.initHtml4(), !0)
    }, m.initCore = function () {
        if (typeof m.initCore.initialized != "undefined") return !1;
        m.initCore.initialized = !0, m.options = m.options || {}, m.options.hashChangeInterval = m.options.hashChangeInterval || 100, m.options.safariPollInterval = m.options.safariPollInterval || 500, m.options.doubleCheckInterval = m.options.doubleCheckInterval || 500, m.options.storeInterval = m.options.storeInterval || 1E3, m.options.busyDelay = m.options.busyDelay || 250, m.options.debug = m.options.debug || !1, m.options.initialTitle = m.options.initialTitle || d.title, m.intervalList = [], m.clearAllIntervals = function () {
            var a, b = m.intervalList;
            if (typeof b != "undefined" && b !== null) {
                for (a = 0; a < b.length; a++) j(b[a]);
                m.intervalList = null
            }
        }, m.debug = function () {
            (m.options.debug || !1) && m.log.apply(m, arguments)
        }, m.log = function () {
            var a = typeof c != "undefined" && typeof c.log != "undefined" && typeof c.log.apply != "undefined",
                b = d.getElementById("log"), e, f, g, h, i;
            a ? (h = Array.prototype.slice.call(arguments), e = h.shift(), typeof c.debug != "undefined" ? c.debug.apply(c, [e, h]) : c.log.apply(c, [e, h])) : e = "\n" + arguments[0] + "\n";
            for (f = 1, g = arguments.length; f < g; ++f) {
                i = arguments[f];
                if (typeof i == "object" && typeof k != "undefined") try {
                    i = k.stringify(i)
                } catch (j$3) {
                }
                e += "\n" + i + "\n"
            }
            return b ? (b.value += e + "\n-----\n", b.scrollTop = b.scrollHeight - b.clientHeight) : a || l(e), !0
        }, m.getInternetExplorerMajorVersion = function () {
            var a = m.getInternetExplorerMajorVersion.cached = typeof m.getInternetExplorerMajorVersion.cached != "undefined" ? m.getInternetExplorerMajorVersion.cached : function () {
                var a = 3, b = d.createElement("div"), c = b.getElementsByTagName("i");
                while ((b.innerHTML = "\x3c!--[if gt IE " + ++a + "]><i></i><![endif]--\x3e") &&
                c[0]) ;
                return a > 4 ? a : !1
            }();
            return a
        }, m.isInternetExplorer = function () {
            var a = m.isInternetExplorer.cached = typeof m.isInternetExplorer.cached != "undefined" ? m.isInternetExplorer.cached : Boolean(m.getInternetExplorerMajorVersion());
            return a
        }, m.emulated = {
            pushState: !Boolean(a.history && a.history.pushState && a.history.replaceState && !/ Mobile\/([1-7][a-z]|(8([abcde]|f(1[0-8]))))/i.test(e.userAgent) && !/AppleWebKit\/5([0-2]|3[0-2])/i.test(e.userAgent)),
            hashChange: Boolean(!("onhashchange" in a || "onhashchange" in d) ||
                m.isInternetExplorer() && m.getInternetExplorerMajorVersion() < 8)
        }, m.enabled = !m.emulated.pushState, m.bugs = {
            setHash: Boolean(!m.emulated.pushState && e.vendor === "Apple Computer, Inc." && /AppleWebKit\/5([0-2]|3[0-3])/.test(e.userAgent)),
            safariPoll: Boolean(!m.emulated.pushState && e.vendor === "Apple Computer, Inc." && /AppleWebKit\/5([0-2]|3[0-3])/.test(e.userAgent)),
            ieDoubleCheck: Boolean(m.isInternetExplorer() && m.getInternetExplorerMajorVersion() < 8),
            hashEscape: Boolean(m.isInternetExplorer() && m.getInternetExplorerMajorVersion() <
                7)
        }, m.isEmptyObject = function (a) {
            for (var b in a) return !1;
            return !0
        }, m.cloneObject = function (a) {
            var b, c;
            return a ? (b = k.stringify(a), c = k.parse(b)) : c = {}, c
        }, m.getRootUrl = function () {
            var a = d.location.protocol + "//" + (d.location.hostname || d.location.host);
            if (d.location.port || !1) a += ":" + d.location.port;
            return a += "/", a
        }, m.getBaseHref = function () {
            var a = d.getElementsByTagName("base"), b = null, c = "";
            return a.length === 1 && (b = a[0], c = b.href.replace(/[^\/]+$/, "")), c = c.replace(/\/+$/, ""), c && (c += "/"), c
        }, m.getBaseUrl = function () {
            var a =
                m.getBaseHref() || m.getBasePageUrl() || m.getRootUrl();
            return a
        }, m.getPageUrl = function () {
            var a = m.getState(!1, !1), b = (a || {}).url || d.location.href, c;
            return c = b.replace(/\/+$/, "").replace(/[^\/]+$/, function (a, b, c) {
                return /\./.test(a) ? a : a + "/"
            }), c
        }, m.getBasePageUrl = function () {
            var a = d.location.href.replace(/[#\?].*/, "").replace(/[^\/]+$/, function (a, b, c) {
                return /[^\/]$/.test(a) ? "" : a
            }).replace(/\/+$/, "") + "/";
            return a
        }, m.getFullUrl = function (a, b) {
            var c = a, d = a.substring(0, 1);
            return b = typeof b == "undefined" ? !0 : b, /[a-z]+:\/\//.test(a) ||
            (d === "/" ? c = m.getRootUrl() + a.replace(/^\/+/, "") : d === "#" ? c = m.getPageUrl().replace(/#.*/, "") + a : d === "?" ? c = m.getPageUrl().replace(/[\?#].*/, "") + a : b ? c = m.getBaseUrl() + a.replace(/^(\.\/)+/, "") : c = m.getBasePageUrl() + a.replace(/^(\.\/)+/, "")), c.replace(/#$/, "")
        }, m.getShortUrl = function (a) {
            var b = a, c = m.getBaseUrl(), d = m.getRootUrl();
            return m.emulated.pushState && (b = b.replace(c, "")), b = b.replace(d, "/"), m.isTraditionalAnchor(b) && (b = "./" + b), b = b.replace(/^(\.\/)+/g, "./").replace(/#$/, ""), b
        }, m.store = {}, m.idToState = m.idToState ||
            {}, m.stateToId = m.stateToId || {}, m.urlToId = m.urlToId || {}, m.storedStates = m.storedStates || [], m.savedStates = m.savedStates || [], m.normalizeStore = function () {
            m.store.idToState = m.store.idToState || {}, m.store.urlToId = m.store.urlToId || {}, m.store.stateToId = m.store.stateToId || {}
        }, m.getState = function (a, b) {
            typeof a == "undefined" && (a = !0), typeof b == "undefined" && (b = !0);
            var c = m.getLastSavedState();
            return !c && b && (c = m.createStateObject()), a && (c = m.cloneObject(c), c.url = c.cleanUrl || c.url), c
        }, m.getIdByState = function (a) {
            var b =
                m.extractId(a.url), c;
            if (!b) {
                c = m.getStateString(a);
                if (typeof m.stateToId[c] != "undefined") b = m.stateToId[c]; else if (typeof m.store.stateToId[c] != "undefined") b = m.store.stateToId[c]; else {
                    for (; ;) {
                        b = (new Date).getTime() + String(Math.random()).replace(/\D/g, "");
                        if (typeof m.idToState[b] == "undefined" && typeof m.store.idToState[b] == "undefined") break
                    }
                    m.stateToId[c] = b, m.idToState[b] = a
                }
            }
            return b
        }, m.normalizeState = function (a) {
            var b, c;
            if (!a || typeof a != "object") a = {};
            if (typeof a.normalized != "undefined") return a;
            if (!a.data ||
                typeof a.data != "object") a.data = {};
            b = {}, b.normalized = !0, b.title = a.title || "", b.url = m.getFullUrl(m.unescapeString(a.url || d.location.href)), b.hash = m.getShortUrl(b.url), b.data = m.cloneObject(a.data), b.id = m.getIdByState(b), b.cleanUrl = b.url.replace(/\??&_suid.*/, ""), b.url = b.cleanUrl, c = !m.isEmptyObject(b.data);
            if (b.title || c) b.hash = m.getShortUrl(b.url).replace(/\??&_suid.*/, ""), /\?/.test(b.hash) || (b.hash += "?"), b.hash += "&_suid=" + b.id;
            return b.hashedUrl = m.getFullUrl(b.hash), (m.emulated.pushState || m.bugs.safariPoll) &&
            m.hasUrlDuplicate(b) && (b.url = b.hashedUrl), b
        }, m.createStateObject = function (a, b, c) {
            var d = {data: a, title: b, url: c};
            return d = m.normalizeState(d), d
        }, m.getStateById = function (a) {
            a = String(a);
            var c = m.idToState[a] || m.store.idToState[a] || b;
            return c
        }, m.getStateString = function (a) {
            var b, c, d;
            return b = m.normalizeState(a), c = {data: b.data, title: a.title, url: a.url}, d = k.stringify(c), d
        }, m.getStateId = function (a) {
            var b, c;
            return b = m.normalizeState(a), c = b.id, c
        }, m.getHashByState = function (a) {
            var b, c;
            return b = m.normalizeState(a),
                c = b.hash, c
        }, m.extractId = function (a) {
            var b, c, d;
            return c = /(.*)&_suid=([0-9]+)$/.exec(a), d = c ? c[1] || a : a, b = c ? String(c[2] || "") : "", b || !1
        }, m.isTraditionalAnchor = function (a) {
            var b = !/[\/\?\.]/.test(a);
            return b
        }, m.extractState = function (a, b) {
            var c = null, d, e;
            return b = b || !1, d = m.extractId(a), d && (c = m.getStateById(d)), c || (e = m.getFullUrl(a), d = m.getIdByUrl(e) || !1, d && (c = m.getStateById(d)), !c && b && !m.isTraditionalAnchor(a) && (c = m.createStateObject(null, null, e))), c
        }, m.getIdByUrl = function (a) {
            var c = m.urlToId[a] || m.store.urlToId[a] ||
                b;
            return c
        }, m.getLastSavedState = function () {
            return m.savedStates[m.savedStates.length - 1] || b
        }, m.getLastStoredState = function () {
            return m.storedStates[m.storedStates.length - 1] || b
        }, m.hasUrlDuplicate = function (a) {
            var b = !1, c;
            return c = m.extractState(a.url), b = c && c.id !== a.id, b
        }, m.storeState = function (a) {
            return m.urlToId[a.url] = a.id, m.storedStates.push(m.cloneObject(a)), a
        }, m.isLastSavedState = function (a) {
            var b = !1, c, d, e;
            return m.savedStates.length && (c = a.id, d = m.getLastSavedState(), e = d.id, b = c === e), b
        }, m.saveState = function (a) {
            return m.isLastSavedState(a) ?
                !1 : (m.savedStates.push(m.cloneObject(a)), !0)
        }, m.getStateByIndex = function (a) {
            var b = null;
            return typeof a == "undefined" ? b = m.savedStates[m.savedStates.length - 1] : a < 0 ? b = m.savedStates[m.savedStates.length + a] : b = m.savedStates[a], b
        }, m.getHash = function () {
            var a = m.unescapeHash(d.location.hash);
            return a
        }, m.unescapeString = function (b) {
            var c = b, d;
            for (; ;) {
                d = a.unescape(c);
                if (d === c) break;
                c = d
            }
            return c
        }, m.unescapeHash = function (a) {
            var b = m.normalizeHash(a);
            return b = m.unescapeString(b), b
        }, m.normalizeHash = function (a) {
            var b =
                a.replace(/[^#]*#/, "").replace(/#.*/, "");
            return b
        }, m.setHash = function (a, b) {
            var c, e, f;
            return b !== !1 && m.busy() ? (m.pushQueue({
                scope: m,
                callback: m.setHash,
                args: arguments,
                queue: b
            }), !1) : (c = m.escapeHash(a), m.busy(!0), e = m.extractState(a, !0), e && !m.emulated.pushState ? m.pushState(e.data, e.title, e.url, !1) : d.location.hash !== c && (m.bugs.setHash ? (f = m.getPageUrl(), m.pushState(null, null, f + "#" + c, !1)) : d.location.hash = c), m)
        }, m.escapeHash = function (b) {
            var c = m.normalizeHash(b);
            return c = a.escape(c), m.bugs.hashEscape || (c = c.replace(/%21/g,
                "!").replace(/%26/g, "&").replace(/%3D/g, "=").replace(/%3F/g, "?")), c
        }, m.getHashByUrl = function (a) {
            var b = String(a).replace(/([^#]*)#?([^#]*)#?(.*)/, "$2");
            return b = m.unescapeHash(b), b
        }, m.setTitle = function (a) {
            var b = a.title, c;
            b || (c = m.getStateByIndex(0), c && c.url === a.url && (b = c.title || m.options.initialTitle));
            try {
                d.getElementsByTagName("title")[0].innerHTML = b.replace("<", "&lt;").replace(">", "&gt;").replace(" & ", " &amp; ")
            } catch (e$4) {
            }
            return d.title = b, m
        }, m.queues = [], m.busy = function (a) {
            typeof a != "undefined" ?
                m.busy.flag = a : typeof m.busy.flag == "undefined" && (m.busy.flag = !1);
            if (!m.busy.flag) {
                h(m.busy.timeout);
                var b = function () {
                    var a, c, d;
                    if (m.busy.flag) return;
                    for (a = m.queues.length - 1; a >= 0; --a) {
                        c = m.queues[a];
                        if (c.length === 0) continue;
                        d = c.shift(), m.fireQueueItem(d), m.busy.timeout = g(b, m.options.busyDelay)
                    }
                };
                m.busy.timeout = g(b, m.options.busyDelay)
            }
            return m.busy.flag
        }, m.busy.flag = !1, m.fireQueueItem = function (a) {
            return a.callback.apply(a.scope || m, a.args || [])
        }, m.pushQueue = function (a) {
            return m.queues[a.queue || 0] = m.queues[a.queue ||
            0] || [], m.queues[a.queue || 0].push(a), m
        }, m.queue = function (a, b) {
            return typeof a == "function" && (a = {callback: a}), typeof b != "undefined" && (a.queue = b), m.busy() ? m.pushQueue(a) : m.fireQueueItem(a), m
        }, m.clearQueue = function () {
            return m.busy.flag = !1, m.queues = [], m
        }, m.stateChanged = !1, m.doubleChecker = !1, m.doubleCheckComplete = function () {
            return m.stateChanged = !0, m.doubleCheckClear(), m
        }, m.doubleCheckClear = function () {
            return m.doubleChecker && (h(m.doubleChecker), m.doubleChecker = !1), m
        }, m.doubleCheck = function (a) {
            return m.stateChanged =
                !1, m.doubleCheckClear(), m.bugs.ieDoubleCheck && (m.doubleChecker = g(function () {
                return m.doubleCheckClear(), m.stateChanged || a(), !0
            }, m.options.doubleCheckInterval)), m
        }, m.safariStatePoll = function () {
            var b = m.extractState(d.location.href), c;
            if (!m.isLastSavedState(b)) c = b; else return;
            return c || (c = m.createStateObject()), m.Adapter.trigger(a, "popstate"), m
        }, m.back = function (a) {
            return a !== !1 && m.busy() ? (m.pushQueue({
                scope: m,
                callback: m.back,
                args: arguments,
                queue: a
            }), !1) : (m.busy(!0), m.doubleCheck(function () {
                m.back(!1)
            }),
                n.go(-1), !0)
        }, m.forward = function (a) {
            return a !== !1 && m.busy() ? (m.pushQueue({
                scope: m,
                callback: m.forward,
                args: arguments,
                queue: a
            }), !1) : (m.busy(!0), m.doubleCheck(function () {
                m.forward(!1)
            }), n.go(1), !0)
        }, m.go = function (a, b) {
            var c;
            if (a > 0) for (c = 1; c <= a; ++c) m.forward(b); else {
                if (!(a < 0)) throw new Error("History.go: History.go requires a positive or negative integer passed.");
                for (c = -1; c >= a; --c) m.back(b)
            }
            return m
        };
        if (m.emulated.pushState) {
            var o = function () {
            };
            m.pushState = m.pushState || o, m.replaceState = m.replaceState ||
                o
        } else m.onPopState = function (b, c) {
            var e = !1, f = !1, g, h;
            return m.doubleCheckComplete(), g = m.getHash(), g ? (h = m.extractState(g || d.location.href, !0), h ? m.replaceState(h.data, h.title, h.url, !1) : (m.Adapter.trigger(a, "anchorchange"), m.busy(!1)), m.expectedStateId = !1, !1) : (e = m.Adapter.extractEventData("state", b, c) || !1, e ? f = m.getStateById(e) : m.expectedStateId ? f = m.getStateById(m.expectedStateId) : f = m.extractState(d.location.href), f || (f = m.createStateObject(null, null, d.location.href)), m.expectedStateId = !1, m.isLastSavedState(f) ?
                (m.busy(!1), !1) : (m.storeState(f), m.saveState(f), m.setTitle(f), m.Adapter.trigger(a, "statechange"), m.busy(!1), !0))
        }, m.Adapter.bind(a, "popstate", m.onPopState), m.pushState = function (b, c, d, e) {
            if (m.getHashByUrl(d) && m.emulated.pushState) throw new Error("History.js does not support states with fragement-identifiers (hashes/anchors).");
            if (e !== !1 && m.busy()) return m.pushQueue({
                scope: m,
                callback: m.pushState,
                args: arguments,
                queue: e
            }), !1;
            m.busy(!0);
            var f = m.createStateObject(b, c, d);
            return m.isLastSavedState(f) ? m.busy(!1) :
                (m.storeState(f), m.expectedStateId = f.id, n.pushState(f.id, f.title, f.url), m.Adapter.trigger(a, "popstate")), !0
        }, m.replaceState = function (b, c, d, e) {
            if (m.getHashByUrl(d) && m.emulated.pushState) throw new Error("History.js does not support states with fragement-identifiers (hashes/anchors).");
            if (e !== !1 && m.busy()) return m.pushQueue({
                scope: m,
                callback: m.replaceState,
                args: arguments,
                queue: e
            }), !1;
            m.busy(!0);
            var f = m.createStateObject(b, c, d);
            return m.isLastSavedState(f) ? m.busy(!1) : (m.storeState(f), m.expectedStateId =
                f.id, n.replaceState(f.id, f.title, f.url), m.Adapter.trigger(a, "popstate")), !0
        };
        if (f) {
            try {
                m.store = k.parse(f.getItem("History.store")) || {}
            } catch (p) {
                m.store = {}
            }
            m.normalizeStore()
        } else m.store = {}, m.normalizeStore();
        m.Adapter.bind(a, "beforeunload", m.clearAllIntervals), m.Adapter.bind(a, "unload", m.clearAllIntervals), m.saveState(m.storeState(m.extractState(d.location.href, !0))), f && (m.onUnload = function () {
            var a, b;
            try {
                a = k.parse(f.getItem("History.store")) || {}
            } catch (c$5) {
                a = {}
            }
            a.idToState = a.idToState || {}, a.urlToId =
                a.urlToId || {}, a.stateToId = a.stateToId || {};
            for (b in m.idToState) {
                if (!m.idToState.hasOwnProperty(b)) continue;
                a.idToState[b] = m.idToState[b]
            }
            for (b in m.urlToId) {
                if (!m.urlToId.hasOwnProperty(b)) continue;
                a.urlToId[b] = m.urlToId[b]
            }
            for (b in m.stateToId) {
                if (!m.stateToId.hasOwnProperty(b)) continue;
                a.stateToId[b] = m.stateToId[b]
            }
            m.store = a, m.normalizeStore(), f.setItem("History.store", k.stringify(a))
        }, m.intervalList.push(i(m.onUnload, m.options.storeInterval)), m.Adapter.bind(a, "beforeunload", m.onUnload), m.Adapter.bind(a,
            "unload", m.onUnload));
        if (!m.emulated.pushState) {
            m.bugs.safariPoll && m.intervalList.push(i(m.safariStatePoll, m.options.safariPollInterval));
            if (e.vendor === "Apple Computer, Inc." || (e.appCodeName || "") === "Mozilla") m.Adapter.bind(a, "hashchange", function () {
                m.Adapter.trigger(a, "popstate")
            }), m.getHash() && m.Adapter.onDomLoad(function () {
                m.Adapter.trigger(a, "hashchange")
            })
        }
    }, m.init()
}(window);
eval(function (p, a, c, k, e, r) {
    e = function (c) {
        return (c < a ? "" : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36))
    };
    if (!"".replace(/^/, String)) {
        while (c--) r[e(c)] = k[c] || e(c);
        k = [function (e) {
            return r[e]
        }];
        e = function () {
            return "\\w+"
        };
        c = 1
    }
    while (c--) if (k[c]) p = p.replace(new RegExp("\\b" + e(c) + "\\b", "g"), k[c]);
    return p
}("(I($){8($.1R.1K)J;$.1R.1K=I(y,z){8(1i.V==0){1c(M,'5O 4C 6x 1o \"'+1i.3Y+'\".');J 1i}8(1i.V>1){J 1i.1P(I(){$(1i).1K(y,z)})}F A=1i,$19=1i[0];8(A.1q('4t')){F B=A.1A('6a');A.X('68',M)}Q{F B=O}A.44=I(o,b,c){o=4p($19,o);8(o.1c){H.1c=o.1c;1c(H,'6w \"1c\" 7v 7d 73 6R 3J 5B 6B 4v-1k.')}F e=['G','1m','T','17','1a','1b'];1o(F a=0,l=e.V;a<l;a++){o[e[a]]=4p($19,o[e[a]])}8(K o.1m=='14'){8(o.1m<=50)o.1m={'G':o.1m};Q o.1m={'1j':o.1m}}Q{8(K o.1m=='1l')o.1m={'1I':o.1m}}8(K o.G=='14')o.G={'P':o.G};Q 8(o.G=='1d')o.G={'P':o.G,'S':o.G,'1u':o.G};8(K o.G!='1k')o.G={};8(b)2y=$.26(M,{},$.1R.1K.4x,o);7=$.26(M,{},$.1R.1K.4x,o);8(K 7.G.12!='1k')7.G.12={};8(7.G.2K==0&&K c=='14'){7.G.2K=c}C.4A=(7.2L);C.2r=(7.2r=='4E'||7.2r=='1s')?'1a':'17';F f=[['S','3c','27','1u','5D','2Z','1s','32','1E',0,1,2,3],['1u','5D','2Z','S','3c','27','32','1s','3V',3,2,1,0]];F g=f[0].V,5G=(7.2r=='2U'||7.2r=='1s')?0:1;7.d={};1o(F d=0;d<g;d++){7.d[f[0][d]]=f[5G][d]}F h=A.11();1x(K 7.G.P){W'1k':7.G.12.2M=7.G.P.2M;7.G.12.2i=7.G.P.2i;7.G.P=O;18;W'1l':8(7.G.P=='1d'){7.G.12.1d=M}Q{7.G.12.2p=7.G.P}7.G.P=O;18;W'I':7.G.12.2p=7.G.P;7.G.P=O;18}8(K 7.G.1v=='1y'){7.G.1v=(h.1v(':2P').V>0)?':P':'*'}8(7[7.d['S']]=='T'){7[7.d['S']]=3C(h,7,'27')}8(4n(7[7.d['S']])&&!7.2L){7[7.d['S']]=3Z(3g($1D.3e(),7,'3c'),7[7.d['S']]);C.4A=M}8(7[7.d['1u']]=='T'){7[7.d['1u']]=3C(h,7,'2Z')}8(!7.G[7.d['S']]){8(7.2L){1c(M,'6k a '+7.d['S']+' 1o 5B G!');7.G[7.d['S']]=3C(h,7,'27')}Q{7.G[7.d['S']]=(5p(h,7,'27'))?'1d':h[7.d['27']](M)}}8(!7.G[7.d['1u']]){7.G[7.d['1u']]=(5p(h,7,'2Z'))?'1d':h[7.d['2Z']](M)}8(!7[7.d['1u']]){7[7.d['1u']]=7.G[7.d['1u']]}8(!7.G.P&&!7.2L){8(7.G[7.d['S']]=='1d'){7.G.12.1d=M}8(!7.G.12.1d){8(K 7[7.d['S']]=='14'){7.G.P=1O.35(7[7.d['S']]/7.G[7.d['S']])}Q{F i=3g($1D.3e(),7,'3c');7.G.P=1O.35(i/7.G[7.d['S']]);7[7.d['S']]=7.G.P*7.G[7.d['S']];8(!7.G.12.2p)7.1B=O}8(7.G.P=='6Z'||7.G.P<1){1c(M,'2b a 4q 14 3T P G: 6k 3J \"1d\".');7.G.12.1d=M}}}8(!7[7.d['S']]){7[7.d['S']]='1d';8(!7.2L&&7.G.1v=='*'&&!7.G.12.1d&&7.G[7.d['S']]!='1d'){7[7.d['S']]=7.G.P*7.G[7.d['S']];7.1B=O}}8(7.G.12.1d){7.3S=(7[7.d['S']]=='1d')?3g($1D.3e(),7,'3c'):7[7.d['S']];8(7.1B===O){7[7.d['S']]='1d'}7.G.P=2J(h,7,0)}Q 8(7.G.1v!='*'){7.G.12.4c=7.G.P;7.G.P=3R(h,7,0)}8(K 7.1B=='1y'){7.1B=(7[7.d['S']]=='1d')?O:'5r'}7.G.P=2N(7.G.P,7,7.G.12.2p,$19);7.G.12.2q=7.G.P;7.1t=O;8(7.2L){8(!7.G.12.2M)7.G.12.2M=7.G.P;8(!7.G.12.2i)7.G.12.2i=7.G.P;7.1B=O;7.1h=[0,0,0,0];F j=$1D.1W(':P');8(j)$1D.3f();F k=3Z(3g($1D.3e(),7,'3c'),7[7.d['S']]);8(K 7[7.d['S']]=='14'&&k<7[7.d['S']]){k=7[7.d['S']]}8(j)$1D.3j();F m=5k(1O.2O(k/7.G[7.d['S']]),7.G.12);8(m>h.V){m=h.V}F n=1O.35(k/m),5g=7[7.d['1u']],69=4n(5g);h.1P(I(){F a=$(1i),5e=n-66(a,7,'72');a[7.d['S']](5e);8(69){a[7.d['1u']](3Z(5e,5g))}});7.G.P=m;7.G[7.d['S']]=n;7[7.d['S']]=m*n}Q{7.1h=5T(7.1h);8(7.1B=='32')7.1B='1s';8(7.1B=='5a')7.1B='2U';1x(7.1B){W'5r':W'1s':W'2U':8(7[7.d['S']]!='1d'){F p=4l(3p(h,7),7);7.1t=M;7.1h[7.d[1]]=p[1];7.1h[7.d[3]]=p[0]}18;2z:7.1B=O;7.1t=(7.1h[0]==0&&7.1h[1]==0&&7.1h[2]==0&&7.1h[3]==0)?O:M;18}}8(K 7.2t=='1r'&&7.2t)7.2t='7D'+A.6L('6Q');8(K 7.G.3r!='14')7.G.3r=7.G.P;8(K 7.1m.1j!='14')7.1m.1j=5N;8(K 7.1m.G=='1y')7.1m.G=(7.G.12.1d||7.G.1v!='*')?'P':7.G.P;7.T=3w($19,7.T,'T');7.17=3w($19,7.17);7.1a=3w($19,7.1a);7.1b=3w($19,7.1b,'1b');7.T=$.26(M,{},7.1m,7.T);7.17=$.26(M,{},7.1m,7.17);7.1a=$.26(M,{},7.1m,7.1a);7.1b=$.26(M,{},7.1m,7.1b);8(K 7.1b.48!='1r')7.1b.48=O;8(K 7.1b.34!='I'&&7.1b.34!==O)7.1b.34=$.1R.1K.5M;8(K 7.T.1G!='1r')7.T.1G=M;8(K 7.T.56!='14')7.T.56=0;8(K 7.T.3W=='1y')7.T.3W=M;8(K 7.T.55!='1r')7.T.55=M;8(K 7.T.3q!='14')7.T.3q=(7.T.1j<10)?7l:7.T.1j*5;8(7.2j){7.2j=4Z(7.2j)}8(H.1c){1c(H,'3n S: '+7.S);1c(H,'3n 1u: '+7.1u);8(7.3S)1c(H,'71 '+7.d['S']+': '+7.3S);1c(H,'5A 76: '+7.G.S);1c(H,'5A 7i: '+7.G.1u);1c(H,'4i 3T G P: '+7.G.P);8(7.T.1G)1c(H,'4i 3T G 4Y 6A: '+7.T.G);8(7.17.Y)1c(H,'4i 3T G 4Y 4X: '+7.17.G);8(7.1a.Y)1c(H,'4i 3T G 4Y 5x: '+7.1a.G)}};A.5t=I(){A.1q('4t',M);F a={'4U':A.16('4U'),'4T':A.16('4T'),'3K':A.16('3K'),'32':A.16('32'),'2U':A.16('2U'),'5a':A.16('5a'),'1s':A.16('1s'),'S':A.16('S'),'1u':A.16('1u'),'4R':A.16('4R'),'1E':A.16('1E'),'3V':A.16('3V'),'4P':A.16('4P')};1x(a.3K){W'4N':F b='4N';18;W'5X':F b='5X';18;2z:F b='6S'}$1D.16(a).16({'6T':'2P','3K':b});A.1q('5V',a).16({'4U':'1s','4T':'4g','3K':'4N','32':0,'1s':0,'4R':0,'1E':0,'3V':0,'4P':0});8(7.1t){A.11().1P(I(){F m=2o($(1i).16(7.d['1E']));8(2s(m))m=0;$(1i).1q('1V',m)})}};A.5S=I(){A.4L();A.13(L('4J',H),I(e,a){e.1e();8(!C.22){8(7.T.Y){7.T.Y.31(2l('43',H))}}C.22=M;8(7.T.1G){7.T.1G=O;A.X(L('2X',H),a)}J M});A.13(L('4I',H),I(e){e.1e();8(C.1U){3P(R)}J M});A.13(L('2X',H),I(e,a,b){e.1e();1F=3d(1F);8(a&&C.1U){R.22=M;F c=2C()-R.2Q;R.1j-=c;8(R.1p)R.1p.1j-=c;8(R.1Q)R.1Q.1j-=c;3P(R,O)}8(!C.1Y&&!C.1U){8(b)1F.3v+=2C()-1F.2Q}8(!C.1Y){8(7.T.Y){7.T.Y.31(2l('6s',H))}}C.1Y=M;8(7.T.6d){F d=7.T.3q-1F.3v,3G=3F-1O.2O(d*3F/7.T.3q);7.T.6d.1z($19,3G,d)}J M});A.13(L('1G',H),I(e,b,c,d){e.1e();1F=3d(1F);F v=[b,c,d],t=['1l','14','1r'],a=2Y(v,t);F b=a[0],c=a[1],d=a[2];8(b!='17'&&b!='1a')b=C.2r;8(K c!='14')c=0;8(K d!='1r')d=O;8(d){C.22=O;7.T.1G=M}8(!7.T.1G){e.23();J 1c(H,'3n 43: 2b 2R.')}8(C.1Y){8(7.T.Y){7.T.Y.2v(2l('43',H));7.T.Y.2v(2l('6s',H))}}C.1Y=O;1F.2Q=2C();F f=7.T.3q+c;3x=f-1F.3v;3G=3F-1O.2O(3x*3F/f);1F.T=7a(I(){8(7.T.5Q){7.T.5Q.1z($19,3G,3x)}8(C.1U){A.X(L('1G',H),b)}Q{A.X(L(b,H),7.T)}},3x);8(7.T.5I){7.T.5I.1z($19,3G,3x)}J M});A.13(L('2H',H),I(e){e.1e();8(R.22){R.22=O;C.1Y=O;C.1U=M;R.2Q=2C();2f(R)}Q{A.X(L('1G',H))}J M});A.13(L('17',H)+' '+L('1a',H),I(e,b,f,g){e.1e();8(C.22||A.1W(':2P')){e.23();J 1c(H,'3n 43 6I 2P: 2b 2R.')}8(7.G.3r>=N.U){e.23();J 1c(H,'2b 5F G ('+N.U+', '+7.G.3r+' 5E): 2b 2R.')}F v=[b,f,g],t=['1k','14/1l','I'],a=2Y(v,t);F b=a[0],f=a[1],g=a[2];F h=e.4w.3U(H.3o.3B.V);8(K b!='1k'||b==2c)b=7[h];8(K g=='I')b.24=g;8(K f!='14'){8(7.G.1v!='*'){f='P'}Q{F i=[f,b.G,7[h].G];1o(F a=0,l=i.V;a<l;a++){8(K i[a]=='14'||i[a]=='5y'||i[a]=='P'){f=i[a];18}}}1x(f){W'5y':e.23();J A.1A(h+'7j',[b,g]);18;W'P':8(!7.G.12.1d&&7.G.1v=='*'){f=7.G.P}18}}8(R.22){A.X(L('2H',H));A.X(L('3k',H),[h,[b,f,g]]);e.23();J 1c(H,'3n 7o 2R.')}8(b.1j>0){8(C.1U){8(b.3k)A.X(L('3k',H),[h,[b,f,g]]);e.23();J 1c(H,'3n 7y 2R.')}}8(b.4u&&!b.4u.1z($19)){e.23();J 1c(H,'6y \"4u\" 6z O.')}1F.3v=0;A.X('6r'+h,[b,f]);8(7.2j){F s=7.2j,c=[b,f];1o(F j=0,l=s.V;j<l;j++){F d=h;8(!s[j][1])c[0]=s[j][0].1A('6c',h);8(!s[j][2])d=(d=='17')?'1a':'17';c[1]=f+s[j][3];s[j][0].X('6r'+d,c)}}J M});A.13(L('6K',H,O),I(e,f,g){e.1e();F h=A.11();8(!7.1N){8(N.Z==0){8(7.3h){A.X(L('1a',H),N.U-1)}J e.23()}}8(7.1t)1M(h,7);8(K g!='14'){8(7.G.12.1d){g=47(h,7,N.U-1)}Q 8(7.G.1v!='*'){F i=(K f.G=='14')?f.G:4V(A,7);g=6t(h,7,N.U-1,i)}Q{g=7.G.P}g=4b(g,7,f.G,$19)}8(!7.1N){8(N.U-g<N.Z){g=N.U-N.Z}}7.G.12.2q=7.G.P;8(7.G.12.1d){F j=2J(h,7,N.U-g);8(7.G.P+g<=j&&g<N.U){g++;j=2J(h,7,N.U-g)}7.G.P=2N(j,7,7.G.12.2p,$19)}Q 8(7.G.1v!='*'){F j=3R(h,7,N.U-g);7.G.P=2N(j,7,7.G.12.2p,$19)}8(7.1t)1M(h,7,M);8(g==0){e.23();J 1c(H,'0 G 3J 1m: 2b 2R.')}1c(H,'6m '+g+' G 4X.');N.Z+=g;1Z(N.Z>=N.U){N.Z-=N.U}8(!7.1N){8(N.Z==0&&f.4d)f.4d.1z($19);8(!7.3h)2T(7,N.Z,H)}A.11().1g(N.U-g,N.U).7g(A);8(N.U<7.G.P+g){A.11().1g(0,(7.G.P+g)-N.U).4f(M).3O(A)}F h=A.11(),2n=6l(h,7,g),1T=6b(h,7),28=h.1L(g-1),2d=2n.2I(),2x=1T.2I();8(7.1t)1M(h,7);8(7.1B){F p=4l(1T,7),k=p[0],2k=p[1]}Q{F k=0,2k=0}F l=(k<0)?7.1h[7.d[3]]:0;8(f.1H=='5z'&&7.G.P<g){F m=h.1g(7.G.12.2q,g),4m=7.G[7.d['S']];m.1P(I(){F a=$(1i);a.1q('4j',a.1W(':2P')).3f()});7.G[7.d['S']]='1d'}Q{F m=O}F n=36(h.1g(0,g),7,'S'),29=4a(2E(1T,7,M),7,!7.1t);8(m)7.G[7.d['S']]=4m;8(7.1t){1M(h,7,M);8(2k>=0){1M(2d,7,7.1h[7.d[1]])}1M(28,7,7.1h[7.d[3]])}8(7.1B){7.1h[7.d[1]]=2k;7.1h[7.d[3]]=k}F o={},1w=f.1j;8(f.1H=='4g')1w=0;Q 8(1w=='T')1w=7.1m.1j/7.1m.G*g;Q 8(1w<=0)1w=0;Q 8(1w<10)1w=n/1w;R=20(1w,f.1I);8(7[7.d['S']]=='1d'||7[7.d['1u']]=='1d'){R.1f.1n([$1D,29])}8(7.1t){F q=7.1h[7.d[3]];8(2x.4s(28).V){F r={};r[7.d['1E']]=28.1q('1V');8(k<0)28.16(r);Q R.1f.1n([28,r])}8(2x.4s(2d).V){F s={};s[7.d['1E']]=2d.1q('1V');R.1f.1n([2d,s])}8(2k>=0){F t={};t[7.d['1E']]=2x.1q('1V')+7.1h[7.d[1]];R.1f.1n([2x,t])}}Q{F q=0}o[7.d['1s']]=q;F u=[2n,1T,29,1w];8(f.2a)f.2a.3E($19,u);1X.2a=3z(1X.2a,$19,u);1x(f.1H){W'2u':W'2e':W'2G':W'2h':R.1p=20(R.1j,R.1I);R.1Q=20(R.1j,R.1I);R.1j=0;18}1x(f.1H){W'2e':W'2G':W'2h':F v=A.4f().3O($1D);18}1x(f.1H){W'2h':v.11().1g(0,g).1J();W'2e':W'2G':v.11().1g(7.G.P).1J();18}1x(f.1H){W'2u':R.1p.1f.1n([A,{'2g':0}]);18;W'2e':v.16({'2g':0});R.1p.1f.1n([A,{'S':'+=0'},I(){v.1J()}]);R.1Q.1f.1n([v,{'2g':1}]);18;W'2G':R=4y(R,A,v,7,M);18;W'2h':R=4z(R,A,v,7,M,g);18}F w=I(){F b=7.G.P+g-N.U;8(b>0){A.11().1g(N.U).1J();2n=A.11().1g(N.U-(g-b)).3X().6e(A.11().1g(0,b).3X())}8(m){m.1P(I(){F a=$(1i);8(!a.1q('4j'))a.3j()})}8(7.1t){F c=A.11().1L(7.G.P+g-1);c.16(7.d['1E'],c.1q('1V'))}R.1f=[];8(R.1p)R.1p=20(R.4B,R.1I);F d=I(){1x(f.1H){W'2u':W'2e':A.16('1v','');18}R.1Q=20(0,2c);C.1U=O;F a=[2n,1T,29];8(f.24)f.24.3E($19,a);1X.24=3z(1X.24,$19,a);8(1S.V){A.X(L(1S[0][0],H),1S[0][1]);1S.6p()}8(!C.1Y)A.X(L('1G',H))};1x(f.1H){W'2u':R.1p.1f.1n([A,{'2g':1},d]);2f(R.1p);18;W'2h':R.1p.1f.1n([A,{'S':'+=0'},d]);2f(R.1p);18;2z:d();18}};R.1f.1n([A,o,w]);C.1U=M;A.16(7.d['1s'],-(n-l));1F=3d(1F);2f(R);4D(7.2t,A.1A(L('3H',H)));A.X(L('2B',H),[O,29]);J M});A.13(L('6V',H,O),I(e,f,g){e.1e();F h=A.11();8(!7.1N){8(N.Z==7.G.P){8(7.3h){A.X(L('17',H),N.U-1)}J e.23()}}8(7.1t)1M(h,7);8(K g!='14'){8(7.G.1v!='*'){F i=(K f.G=='14')?f.G:4V(A,7);g=5w(h,7,0,i)}Q{g=7.G.P}g=4b(g,7,f.G,$19)}F j=(N.Z==0)?N.U:N.Z;8(!7.1N){8(7.G.12.1d){F k=2J(h,7,g),i=47(h,7,j-1)}Q{F k=7.G.P,i=7.G.P}8(g+k>j){g=j-i}}7.G.12.2q=7.G.P;8(7.G.12.1d){F k=4F(h,7,g,j);1Z(7.G.P-g>=k&&g<N.U){g++;k=4F(h,7,g,j)}7.G.P=2N(k,7,7.G.12.2p,$19)}Q 8(7.G.1v!='*'){F k=3R(h,7,g);7.G.P=2N(k,7,7.G.12.2p,$19)}8(7.1t)1M(h,7,M);8(g==0){e.23();J 1c(H,'0 G 3J 1m: 2b 2R.')}1c(H,'6m '+g+' G 5x.');N.Z-=g;1Z(N.Z<0){N.Z+=N.U}8(!7.1N){8(N.Z==7.G.P&&f.4d)f.4d.1z($19);8(!7.3h)2T(7,N.Z,H)}8(N.U<7.G.P+g){A.11().1g(0,(7.G.P+g)-N.U).4f(M).3O(A)}F h=A.11(),2n=4G(h,7),1T=4H(h,7,g),28=h.1L(g-1),2d=2n.2I(),2x=1T.2I();8(7.1t)1M(h,7);8(7.1B){F p=4l(1T,7),l=p[0],2k=p[1]}Q{F l=0,2k=0}8(f.1H=='5z'&&7.G.12.2q<g){F m=h.1g(7.G.12.2q,g),4m=7.G[7.d['S']];m.1P(I(){F a=$(1i);a.1q('4j',a.1W(':2P')).3f()});7.G[7.d['S']]='1d'}Q{F m=O}F n=36(h.1g(0,g),7,'S'),29=4a(2E(1T,7,M),7,!7.1t);8(m)7.G[7.d['S']]=4m;8(7.1B){8(7.1h[7.d[1]]<0){7.1h[7.d[1]]=0}}8(7.1t){1M(h,7,M);1M(2d,7,7.1h[7.d[1]])}8(7.1B){7.1h[7.d[1]]=2k;7.1h[7.d[3]]=l}F o={},1w=f.1j;8(f.1H=='4g')1w=0;Q 8(1w=='T')1w=7.1m.1j/7.1m.G*g;Q 8(1w<=0)1w=0;Q 8(1w<10)1w=n/1w;R=20(1w,f.1I);8(7[7.d['S']]=='1d'||7[7.d['1u']]=='1d'){R.1f.1n([$1D,29])}8(7.1t){F q=2x.1q('1V');8(2k>=0){q+=7.1h[7.d[1]]}2x.16(7.d['1E'],q);8(28.4s(2d).V){F r={};r[7.d['1E']]=2d.1q('1V');R.1f.1n([2d,r])}F s=28.1q('1V');8(l>=0){s+=7.1h[7.d[3]]}F t={};t[7.d['1E']]=s;R.1f.1n([28,t])}o[7.d['1s']]=-n;8(l<0){o[7.d['1s']]+=l}F u=[2n,1T,29,1w];8(f.2a)f.2a.3E($19,u);1X.2a=3z(1X.2a,$19,u);1x(f.1H){W'2u':W'2e':W'2G':W'2h':R.1p=20(R.1j,R.1I);R.1Q=20(R.1j,R.1I);R.1j=0;18}1x(f.1H){W'2e':W'2G':W'2h':F v=A.4f().3O($1D);18}1x(f.1H){W'2h':v.11().1g(7.G.12.2q).1J();18;W'2e':W'2G':v.11().1g(0,g).1J();v.11().1g(7.G.P).1J();18}1x(f.1H){W'2u':R.1p.1f.1n([A,{'2g':0}]);18;W'2e':v.16({'2g':0});R.1p.1f.1n([A,{'S':'+=0'},I(){v.1J()}]);R.1Q.1f.1n([v,{'2g':1}]);18;W'2G':R=4y(R,A,v,7,O);18;W'2h':R=4z(R,A,v,7,O,g);18}F w=I(){F b=7.G.P+g-N.U,5C=(7.1t)?7.1h[7.d[3]]:0;A.16(7.d['1s'],5C);8(b>0){A.11().1g(N.U).1J()}F c=A.11().1g(0,g).3O(A).2I();8(b>0){1T=3p(h,7)}8(m){m.1P(I(){F a=$(1i);8(!a.1q('4j'))a.3j()})}8(7.1t){8(N.U<7.G.P+g){F d=A.11().1L(7.G.P-1);d.16(7.d['1E'],d.1q('1V')+7.1h[7.d[3]])}c.16(7.d['1E'],c.1q('1V'))}R.1f=[];8(R.1p)R.1p=20(R.4B,R.1I);F e=I(){1x(f.1H){W'2u':W'2e':A.16('1v','');18}R.1Q=20(0,2c);C.1U=O;F a=[2n,1T,29];8(f.24)f.24.3E($19,a);1X.24=3z(1X.24,$19,a);8(1S.V){A.X(L(1S[0][0],H),1S[0][1]);1S.6p()}8(!C.1Y)A.X(L('1G',H))};1x(f.1H){W'2u':R.1p.1f.1n([A,{'2g':1},e]);2f(R.1p);18;W'2h':R.1p.1f.1n([A,{'S':'+=0'},e]);2f(R.1p);18;2z:e();18}};R.1f.1n([A,o,w]);C.1U=M;1F=3d(1F);2f(R);4D(7.2t,A.1A(L('3H',H)));A.X(L('2B',H),[O,29]);J M});A.13(L('2W',H),I(e,b,c,d,f,g,h){e.1e();F v=[b,c,d,f,g,h],t=['1l/14/1k','14','1r','1k','1l','I'],a=2Y(v,t);F f=a[3],g=a[4],h=a[5];b=3u(a[0],a[1],a[2],N,A);8(b==0)J;8(K f!='1k')f=O;8(C.1U){8(K f!='1k'||f.1j>0)J O}8(g!='17'&&g!='1a'){8(7.1N){8(b<=N.U/2)g='1a';Q g='17'}Q{8(N.Z==0||N.Z>b)g='1a';Q g='17'}}8(g=='17')b=N.U-b;A.X(L(g,H),[f,b,h]);J M});A.13(L('7h',H),I(e,a,b){e.1e();F c=A.1A(L('3Q',H));J A.1A(L('4K',H),[c-1,a,'17',b])});A.13(L('7k',H),I(e,a,b){e.1e();F c=A.1A(L('3Q',H));J A.1A(L('4K',H),[c+1,a,'1a',b])});A.13(L('4K',H),I(e,a,b,c,d){e.1e();8(K a!='14')a=A.1A(L('3Q',H));F f=7.1b.G||7.G.P,2i=1O.35(N.U/f)-1;8(a<0)a=2i;8(a>2i)a=0;J A.1A(L('2W',H),[a*f,0,M,b,c,d])});A.13(L('5J',H),I(e,s){e.1e();8(s)s=3u(s,0,M,N,A);Q s=0;s+=N.Z;8(s!=0){1Z(s>N.U)s-=N.U;A.7m(A.11().1g(s,N.U))}J M});A.13(L('2j',H),I(e,s){e.1e();8(s)s=4Z(s);Q 8(7.2j)s=7.2j;Q J 1c(H,'5O 7n 3J 2j.');F n=A.1A(L('3H',H)),x=M;1o(F j=0,l=s.V;j<l;j++){8(!s[j][0].1A(L('2W',H),[n,s[j][3],M])){x=O}}J x});A.13(L('3k',H),I(e,a,b){e.1e();8(K a=='I'){a.1z($19,1S)}Q 8(2V(a)){1S=a}Q 8(K a!='1y'){1S.1n([a,b])}J 1S});A.13(L('7w',H),I(e,b,c,d,f){e.1e();F v=[b,c,d,f],t=['1l/1k','1l/14/1k','1r','14'],a=2Y(v,t);F b=a[0],c=a[1],d=a[2],f=a[3];8(K b=='1k'&&K b.3b=='1y')b=$(b);8(K b=='1l')b=$(b);8(K b!='1k'||K b.3b=='1y'||b.V==0)J 1c(H,'2b a 4q 1k.');8(K c=='1y')c='4e';8(7.1t){b.1P(I(){F m=2o($(1i).16(7.d['1E']));8(2s(m))m=0;$(1i).1q('1V',m)})}F g=c,3N='3N';8(c=='4e'){8(d){8(N.Z==0){c=N.U-1;3N='61'}Q{c=N.Z;N.Z+=b.V}8(c<0)c=0}Q{c=N.U-1;3N='61'}}Q{c=3u(c,f,d,N,A)}8(g!='4e'&&!d){8(c<N.Z)N.Z+=b.V}8(N.Z>=N.U)N.Z-=N.U;F h=A.11().1L(c);8(h.V){h[3N](b)}Q{A.65(b)}N.U=A.11().V;F i=A.1A('4M');3M(7,N.U,H);2T(7,N.Z,H);A.X(L('4O',H));A.X(L('2B',H),[M,i]);J M});A.13(L('6D',H),I(e,b,c,d){e.1e();F v=[b,c,d],t=['1l/14/1k','1r','14'],a=2Y(v,t);F b=a[0],c=a[1],d=a[2];8(K b=='1y'||b=='4e'){A.11().2I().1J()}Q{b=3u(b,d,c,N,A);F f=A.11().1L(b);8(f.V){8(b<N.Z)N.Z-=f.V;f.1J()}}N.U=A.11().V;F g=A.1A('4M');3M(7,N.U,H);2T(7,N.Z,H);A.X(L('2B',H),[M,g]);J M});A.13(L('2a',H)+' '+L('24',H),I(e,a){e.1e();F b=e.4w.3U(H.3o.3B.V);8(2V(a))1X[b]=a;8(K a=='I')1X[b].1n(a);J 1X[b]});A.13(L('6a',H,O),I(e,a){e.1e();J A.1A(L('3H',H),a)});A.13(L('3H',H),I(e,a){e.1e();8(N.Z==0)F b=0;Q F b=N.U-N.Z;8(K a=='I')a.1z($19,b);J b});A.13(L('3Q',H),I(e,a){e.1e();F b=7.1b.G||7.G.P;F c=1O.2O(N.U/b-1);8(N.Z==0)F d=0;Q 8(N.Z<N.U%b)F d=0;Q 8(N.Z==b&&!7.1N)F d=c;Q F d=1O.6E((N.U-N.Z)/b);8(d<0)d=0;8(d>c)d=c;8(K a=='I')a.1z($19,d);J d});A.13(L('6G',H),I(e,a){e.1e();$i=3p(A.11(),7);8(K a=='I')a.1z($19,$i);J $i});A.13(L('1g',H),I(e,f,l,b){e.1e();F v=[f,l,b],t=['14','14','I'],a=2Y(v,t);f=(K a[0]=='14')?a[0]:0,l=(K a[1]=='14')?a[1]:N.U,b=a[2];f+=N.Z;l+=N.Z;1Z(f>N.U){f-=N.U}1Z(l>N.U){l-=N.U}1Z(f<0){f+=N.U}1Z(l<0){l+=N.U}F c=A.11();8(l>f){F d=c.1g(f,l)}Q{F d=c.1g(f,N.U).3X().6e(c.1g(0,l).3X())}8(K b=='I')b.1z($19,d);J d});A.13(L('1Y',H)+' '+L('22',H)+' '+L('1U',H),I(e,a){e.1e();F b=e.4w.3U(H.3o.3B.V);8(K a=='I')a.1z($19,C[b]);J C[b]});A.13(L('6c',H,O),I(e,a,b,c){e.1e();J A.1A(L('4v',H),[a,b,c])});A.13(L('4v',H),I(e,a,b,c){e.1e();F d=O;8(K a=='I'){a.1z($19,7)}Q 8(K a=='1k'){2y=$.26(M,{},2y,a);8(b!==O)d=M;Q 7=$.26(M,{},7,a)}Q 8(K a!='1y'){8(K b=='I'){F f=46('7.'+a);8(K f=='1y')f='';b.1z($19,f)}Q 8(K b!='1y'){8(K c!=='1r')c=M;46('2y.'+a+' = b');8(c!==O)d=M;Q 46('7.'+a+' = b')}Q{J 46('7.'+a)}}8(d){1M(A.11(),7);A.44(2y);A.4Q();F g=3L(A,7,O);A.X(L('2B',H),[M,g])}J 7});A.13(L('4O',H),I(e,a,b){e.1e();8(K a=='1y'||a.V==0)a=$('6M');Q 8(K a=='1l')a=$(a);8(K a!='1k')J 1c(H,'2b a 4q 1k.');8(K b!='1l'||b.V==0)b='a.6g';a.6O(b).1P(I(){F h=1i.6h||'';8(h.V>0&&A.11().6j($(h))!=-1){$(1i).21('4S').4S(I(e){e.25();A.X(L('2W',H),h)})}});J M});A.13(L('2B',H),I(e,b,c){e.1e();8(!7.1b.1C)J;8(b){F d=7.1b.G||7.G.P,l=1O.2O(N.U/d);8(7.1b.34){7.1b.1C.11().1J();7.1b.1C.1P(I(){1o(F a=0;a<l;a++){F i=A.11().1L(3u(a*d,0,M,N,A));$(1i).65(7.1b.34(a+1,i))}})}7.1b.1C.1P(I(){$(1i).11().21(7.1b.3i).1P(I(a){$(1i).13(7.1b.3i,I(e){e.25();A.X(L('2W',H),[a*d,0,M,7.1b])})})})}7.1b.1C.1P(I(){$(1i).11().2v(2l('5s',H)).1L(A.1A(L('3Q',H))).31(2l('5s',H))});J M});A.13(L('4M',H),I(e){F a=A.11(),3D=7.G.P;8(7.G.12.1d)3D=2J(a,7,0);Q 8(7.G.1v!='*')3D=3R(a,7,0);8(!7.1N&&N.Z!=0&&3D>N.Z){8(7.G.12.1d){F b=47(a,7,N.Z)-N.Z}Q 8(7.G.1v!='*'){F b=5u(a,7,N.Z)-N.Z}Q{b=7.G.P-N.Z}1c(H,'77 78-1N: 79 '+b+' G 4X.');A.X('17',b)}7.G.P=2N(3D,7,7.G.12.2p,$19);J 3L(A,7)});A.13(L('68',H,O),I(e,a){e.1e();A.X(L('5v',H),a);J M});A.13(L('5v',H),I(e,a){e.1e();1F=3d(1F);A.1q('4t',O);A.X(L('4I',H));8(a){A.X(L('5J',H))}8(7.1t){1M(A.11(),7)}A.16(A.1q('5V'));A.4L();A.4W();$1D.7f(A);J M})};A.4L=I(){A.21(L('',H));A.21(L('',H,O))};A.4Q=I(){A.4W();3M(7,N.U,H);2T(7,N.Z,H);8(7.T.2m){F c=3m(7.T.2m);$1D.13(L('4k',H,O),I(){A.X(L('2X',H),c)}).13(L('4h',H,O),I(){A.X(L('2H',H))})}8(7.T.Y){7.T.Y.13(L(7.T.3i,H,O),I(e){e.25();F a=O,c=2c;8(C.1Y){a='1G'}Q 8(7.T.3W){a='2X';c=3m(7.T.3W)}8(a){A.X(L(a,H),c)}})}8(7.17.Y){7.17.Y.13(L(7.17.3i,H,O),I(e){e.25();A.X(L('17',H))});8(7.17.2m){F c=3m(7.17.2m);7.17.Y.13(L('4k',H,O),I(){A.X(L('2X',H),c)}).13(L('4h',H,O),I(){A.X(L('2H',H))})}}8(7.1a.Y){7.1a.Y.13(L(7.1a.3i,H,O),I(e){e.25();A.X(L('1a',H))});8(7.1a.2m){F c=3m(7.1a.2m);7.1a.Y.13(L('4k',H,O),I(){A.X(L('2X',H),c)}).13(L('4h',H,O),I(){A.X(L('2H',H))})}}8($.1R.2A){8(7.17.2A){8(!C.51){C.51=M;$1D.2A(I(e,a){8(a>0){e.25();F b=52(7.17.2A);A.X(L('17',H),b)}})}}8(7.1a.2A){8(!C.53){C.53=M;$1D.2A(I(e,a){8(a<0){e.25();F b=52(7.1a.2A);A.X(L('1a',H),b)}})}}}8($.1R.3A){F d=(7.17.54)?I(){A.X(L('17',H))}:2c,3y=(7.1a.54)?I(){A.X(L('1a',H))}:2c;8(3y||3y){8(!C.3A){C.3A=M;F f={'7x':30,'7A':30,'7C':M};1x(7.2r){W'4E':W'5H':f.7N=3y;f.7O=d;18;2z:f.7Q=3y;f.6v=d}$1D.3A(f)}}}8(7.1b.1C){8(7.1b.2m){F c=3m(7.1b.2m);7.1b.1C.13(L('4k',H,O),I(){A.X(L('2X',H),c)}).13(L('4h',H,O),I(){A.X(L('2H',H))})}}8(7.17.2w||7.1a.2w){$(3I).13(L('5K',H,O,M,M),I(e){F k=e.5L;8(k==7.1a.2w){e.25();A.X(L('1a',H))}8(k==7.17.2w){e.25();A.X(L('17',H))}})}8(7.1b.48){$(3I).13(L('5K',H,O,M,M),I(e){F k=e.5L;8(k>=49&&k<58){k=(k-49)*7.G.P;8(k<=N.U){e.25();A.X(L('2W',H),[k,0,M,7.1b])}}})}8(7.T.1G){A.X(L('1G',H),7.T.56)}8(C.4A){$(3t).13(L('6C',H,O,M,M),I(e){A.X(L('4I',H));8(7.T.55&&!C.1Y){A.X(L('1G',H))}1M(A.11(),7);A.44(2y);F a=3L(A,7,O);A.X(L('2B',H),[M,a])})}};A.4W=I(){F a=L('',H),3s=L('',H,O);57=L('',H,O,M,M);$(3I).21(57);$(3t).21(57);$1D.21(3s);8(7.T.Y)7.T.Y.21(3s);8(7.17.Y)7.17.Y.21(3s);8(7.1a.Y)7.1a.Y.21(3s);8(7.1b.1C){7.1b.1C.21(3s);8(7.1b.34){7.1b.1C.11().1J()}}3M(7,'3f',H);2T(7,'2v',H)};F C={'2r':'1a','1Y':M,'1U':O,'22':O,'53':O,'51':O,'3A':O},N={'U':A.11().V,'Z':0},1F={'6F':2c,'T':2c,'3k':2c,'2Q':2C(),'3v':0},R={'22':O,'1j':0,'2Q':0,'1I':'','1f':[]},1X={'2a':[],'24':[]},1S=[],H=$.26(M,{},$.1R.1K.5P,z),7={},2y=y,$1D=A.6H('<'+H.59.4C+' 6J=\"'+H.59.5R+'\" />').3e();H.3Y=A.3Y;H.45=$.1R.1K.45++;A.44(2y,M,B);A.5t();A.5S();A.4Q();8(2V(7.G.2K)){F D=7.G.2K}Q{F D=[];8(7.G.2K!=0){D.1n(7.G.2K)}}8(7.2t){D.6N(5U(7.2t))}8(D.V>0){1o(F a=0,l=D.V;a<l;a++){F s=D[a];8(s==0){5b}8(s===M){s=3t.6P.6h;8(s.V<1){5b}}Q 8(s==='5W'){s=1O.35(1O.5W()*N.U)}8(A.1A(L('2W',H),[s,0,M,{1H:'4g'}])){18}}}F E=3L(A,7,O),5Y=3p(A.11(),7);8(7.5Z){7.5Z.1z($19,5Y,E)}A.X(L('2B',H),[M,E]);A.X(L('4O',H));J A};$.1R.1K.45=1;$.1R.1K.4x={'2j':O,'3h':M,'1N':M,'2L':O,'2r':'1s','G':{'2K':0},'1m':{'1I':'6U','1j':5N,'2m':O,'2A':O,'54':O,'3i':'4S','3k':O}};$.1R.1K.5P={'1c':O,'3o':{'3B':'','60':'6W'},'59':{'4C':'6X','5R':'6Y'},'5c':{}};$.1R.1K.5M=I(a,b){J'<a 70=\"#\"><62>'+a+'</62></a>'};I 20(d,e){J{1f:[],1j:d,4B:d,1I:e,2Q:2C()}}I 2f(s){8(K s.1p=='1k'){2f(s.1p)}1o(F a=0,l=s.1f.V;a<l;a++){F b=s.1f[a];8(!b)5b;8(b[3])b[0].4J();b[0].63(b[1],{64:b[2],1j:s.1j,1I:s.1I})}8(K s.1Q=='1k'){2f(s.1Q)}}I 3P(s,c){8(K c!='1r')c=M;8(K s.1p=='1k'){3P(s.1p,c)}1o(F a=0,l=s.1f.V;a<l;a++){F b=s.1f[a];b[0].4J(M);8(c){b[0].16(b[1]);8(K b[2]=='I')b[2]()}}8(K s.1Q=='1k'){3P(s.1Q,c)}}I 3d(t){8(t.T)74(t.T);J t}I 3z(b,t,c){8(b.V){1o(F a=0,l=b.V;a<l;a++){b[a].3E(t,c)}}J[]}I 75(a,c,x,d,f){F o={'1j':d,'1I':a.1I};8(K f=='I')o.64=f;c.63({2g:x},o)}I 4y(a,b,c,o,d){F e=2E(4G(b.11(),o),o,M)[0],5d=2E(c.11(),o,M)[0],41=(d)?-5d:e,2D={},3l={};2D[o.d['S']]=5d;2D[o.d['1s']]=41;3l[o.d['1s']]=0;a.1p.1f.1n([b,{'2g':1}]);a.1Q.1f.1n([c,3l,I(){$(1i).1J()}]);c.16(2D);J a}I 4z(a,b,c,o,d,n){F e=2E(4H(b.11(),o,n),o,M)[0],5f=2E(c.11(),o,M)[0],41=(d)?-5f:e,2D={},3l={};2D[o.d['S']]=5f;2D[o.d['1s']]=0;3l[o.d['1s']]=41;a.1Q.1f.1n([c,3l,I(){$(1i).1J()}]);c.16(2D);J a}I 3M(o,t,c){8(t=='3j'||t=='3f'){F f=t}Q 8(o.G.3r>=t){1c(c,'2b 5F G: 7b 7c ('+t+' G, '+o.G.3r+' 5E).');F f='3f'}Q{F f='3j'}F s=(f=='3j')?'2v':'31',h=2l('2P',c);8(o.T.Y)o.T.Y[f]()[s](h);8(o.17.Y)o.17.Y[f]()[s](h);8(o.1a.Y)o.1a.Y[f]()[s](h);8(o.1b.1C)o.1b.1C[f]()[s](h)}I 2T(o,f,c){8(o.1N||o.3h)J;F a=(f=='2v'||f=='31')?f:O,4o=2l('7e',c);8(o.T.Y&&a){o.T.Y[a](4o)}8(o.17.Y){F b=a||(f==0)?'31':'2v';o.17.Y[b](4o)}8(o.1a.Y){F b=a||(f==o.G.P)?'31':'2v';o.1a.Y[b](4o)}}I 4p(a,b){8(K b=='I')b=b.1z(a);8(K b=='1y')b={};J b}I 3w(a,b,c){8(K c!='1l')c='';b=4p(a,b);8(K b=='1l'){F d=5h(b);8(d==-1)b=$(b);Q b=d}8(c=='1b'){8(K b=='1r')b={'48':b};8(K b.3b!='1y')b={'1C':b};8(K b.1C=='I')b.1C=b.1C.1z(a);8(K b.1C=='1l')b.1C=$(b.1C);8(K b.G!='14')b.G=O}Q 8(c=='T'){8(K b.3b!='1y')b={'Y':b};8(K b=='1r')b={'1G':b};8(K b=='14')b={'3q':b};8(K b.Y=='I')b.Y=b.Y.1z(a);8(K b.Y=='1l')b.Y=$(b.Y)}Q{8(K b.3b!='1y')b={'Y':b};8(K b=='14')b={'2w':b};8(K b.Y=='I')b.Y=b.Y.1z(a);8(K b.Y=='1l')b.Y=$(b.Y);8(K b.2w=='1l')b.2w=5h(b.2w)}J b}I 3u(a,b,c,d,e){8(K a=='1l'){8(2s(a))a=$(a);Q a=2o(a)}8(K a=='1k'){8(K a.3b=='1y')a=$(a);a=e.11().6j(a);8(a==-1)a=0;8(K c!='1r')c=O}Q{8(K c!='1r')c=M}8(2s(a))a=0;Q a=2o(a);8(2s(b))b=0;Q b=2o(b);8(c){a+=d.Z}a+=b;8(d.U>0){1Z(a>=d.U){a-=d.U}1Z(a<0){a+=d.U}}J a}I 47(i,o,s){F t=0,x=0;1o(F a=s;a>=0;a--){F j=i.1L(a);t+=(j.1W(':P'))?j[o.d['27']](M):0;8(t>o.3S)J x;8(a==0)a=i.V;x++}}I 5u(i,o,s){J 5i(i,o.G.1v,o.G.12.4c,s)}I 6t(i,o,s,m){J 5i(i,o.G.1v,m,s)}I 5i(i,f,m,s){F t=0,x=0;1o(F a=s,l=i.V-1;a>=0;a--){x++;8(x==l)J x;F j=i.1L(a);8(j.1W(f)){t++;8(t==m)J x}8(a==0)a=i.V}}I 4V(a,o){J o.G.12.4c||a.11().1g(0,o.G.P).1v(o.G.1v).V}I 2J(i,o,s){F t=0,x=0;1o(F a=s,l=i.V-1;a<=l;a++){F j=i.1L(a);t+=(j.1W(':P'))?j[o.d['27']](M):0;8(t>o.3S)J x;x++;8(x==l)J x;8(a==l)a=-1}}I 4F(i,o,s,l){F v=2J(i,o,s);8(!o.1N){8(s+v>l)v=l-s}J v}I 3R(i,o,s){J 5j(i,o.G.1v,o.G.12.4c,s,o.1N)}I 5w(i,o,s,m){J 5j(i,o.G.1v,m+1,s,o.1N)-1}I 5j(i,f,m,s,c){F t=0,x=0;1o(F a=s,l=i.V-1;a<=l;a++){x++;8(x==l)J x;F j=i.1L(a);8(j.1W(f)){t++;8(t==m)J x}8(a==l)a=-1}}I 3p(i,o){J i.1g(0,o.G.P)}I 6l(i,o,n){J i.1g(n,o.G.12.2q+n)}I 6b(i,o){J i.1g(0,o.G.P)}I 4G(i,o){J i.1g(0,o.G.12.2q)}I 4H(i,o,n){J i.1g(n,o.G.P+n)}I 1M(i,o,m){F x=(K m=='1r')?m:O;8(K m!='14')m=0;i.1P(I(){F j=$(1i);F t=2o(j.16(o.d['1E']));8(2s(t))t=0;j.1q('6f',t);j.16(o.d['1E'],((x)?j.1q('6f'):m+j.1q('1V')))})}I 3L(a,o,p){F b=a.3e(),$i=a.11(),$v=3p($i,o),42=4a(2E($v,o,M),o,p);b.16(42);8(o.1t){F p=o.1h,r=p[o.d[1]];8(o.1B){8(r<0)r=0}F c=$v.2I();c.16(o.d['1E'],c.1q('1V')+r);a.16(o.d['32'],p[o.d[0]]);a.16(o.d['1s'],p[o.d[3]])}a.16(o.d['S'],42[o.d['S']]+(36($i,o,'S')*2));a.16(o.d['1u'],5l($i,o,'1u'));J 42}I 2E(i,o,a){F b=36(i,o,'S',a),6i=5l(i,o,'1u',a);J[b,6i]}I 5l(i,o,a,b){8(K b!='1r')b=O;8(K o[o.d[a]]=='14'&&b)J o[o.d[a]];8(K o.G[o.d[a]]=='14')J o.G[o.d[a]];F c=(a.5m().2S('S')>-1)?'27':'2Z';J 3C(i,o,c)}I 3C(i,o,b){F s=0;1o(F a=0,l=i.V;a<l;a++){F j=i.1L(a);F m=(j.1W(':P'))?j[o.d[b]](M):0;8(s<m)s=m}J s}I 3g(b,o,c){8(!b.1W(':P'))J 0;F d=b[o.d[c]](),5n=(o.d[c].5m().2S('S')>-1)?['7p','7q']:['7r','7s'];1o(F a=0,l=5n.V;a<l;a++){F m=2o(b.16(5n[a]));d-=(2s(m))?0:m}J d}I 36(i,o,b,c){8(K c!='1r')c=O;8(K o[o.d[b]]=='14'&&c)J o[o.d[b]];8(K o.G[o.d[b]]=='14')J o.G[o.d[b]]*i.V;F d=(b.5m().2S('S')>-1)?'27':'2Z',s=0;1o(F a=0,l=i.V;a<l;a++){F j=i.1L(a);s+=(j.1W(':P'))?j[o.d[d]](M):0}J s}I 5p(i,o,b){F s=O,v=O;1o(F a=0,l=i.V;a<l;a++){F j=i.1L(a);F c=(j.1W(':P'))?j[o.d[b]](M):0;8(s===O)s=c;Q 8(s!=c)v=M;8(s==0)v=M}J v}I 66(i,o,d){J i[o.d['7t'+d]](M)-3g(i,o,'7u'+d)}I 4n(x){J(K x=='1l'&&x.3U(-1)=='%')}I 3Z(s,o){8(4n(o)){o=o.5o(0,o.V-1);8(2s(o))J s;s*=o/3F}J s}I L(n,c,a,b,d){8(K a!='1r')a=M;8(K b!='1r')b=M;8(K d!='1r')d=O;8(a)n=c.3o.3B+n;8(b)n=n+'.'+c.3o.60;8(b&&d)n+=c.45;J n}I 2l(n,c){J(K c.5c[n]=='1l')?c.5c[n]:n}I 4a(a,o,p){8(K p!='1r')p=M;F b=(o.1t&&p)?o.1h:[0,0,0,0];F c={};c[o.d['S']]=a[0]+b[1]+b[3];c[o.d['1u']]=a[1]+b[0]+b[2];J c}I 2Y(c,d){F e=[];1o(F a=0,6n=c.V;a<6n;a++){1o(F b=0,6o=d.V;b<6o;b++){8(d[b].2S(K c[a])>-1&&K e[b]=='1y'){e[b]=c[a];18}}}J e}I 5T(p){8(K p=='1y')J[0,0,0,0];8(K p=='14')J[p,p,p,p];Q 8(K p=='1l')p=p.3a('7z').6q('').3a('7B').6q('').3a(' ');8(!2V(p)){J[0,0,0,0]}1o(F i=0;i<4;i++){p[i]=2o(p[i])}1x(p.V){W 0:J[0,0,0,0];W 1:J[p[0],p[0],p[0],p[0]];W 2:J[p[0],p[1],p[0],p[1]];W 3:J[p[0],p[1],p[2],p[1]];2z:J[p[0],p[1],p[2],p[3]]}}I 4l(a,o){F x=(K o[o.d['S']]=='14')?1O.2O(o[o.d['S']]-36(a,o,'S')):0;1x(o.1B){W'1s':J[0,x];W'2U':J[x,0];W'5r':2z:J[1O.2O(x/2),1O.35(x/2)]}}I 4b(x,o,a,b){F v=x;8(K a=='I'){v=a.1z(b,v)}Q 8(K a=='1l'){F p=a.3a('+'),m=a.3a('-');8(m.V>p.V){F c=M,5q=m[0],2F=m[1]}Q{F c=O,5q=p[0],2F=p[1]}1x(5q){W'7E':v=(x%2==1)?x-1:x;18;W'7F':v=(x%2==0)?x-1:x;18;2z:v=x;18}2F=2o(2F);8(!2s(2F)){8(c)2F=-2F;v+=2F}}8(K v!='14')v=1;8(v<1)v=1;J v}I 2N(x,o,a,b){J 5k(4b(x,o,a,b),o.G.12)}I 5k(v,i){8(K i.2M=='14'&&v<i.2M)v=i.2M;8(K i.2i=='14'&&v>i.2i)v=i.2i;8(v<1)v=1;J v}I 4Z(s){8(!2V(s))s=[[s]];8(!2V(s[0]))s=[s];1o(F j=0,l=s.V;j<l;j++){8(K s[j][0]=='1l')s[j][0]=$(s[j][0]);8(K s[j][1]!='1r')s[j][1]=M;8(K s[j][2]!='1r')s[j][2]=M;8(K s[j][3]!='14')s[j][3]=0}J s}I 5h(k){8(k=='2U')J 39;8(k=='1s')J 37;8(k=='4E')J 38;8(k=='5H')J 40;J-1}I 4D(n,v){8(n)3I.2t=n+'='+v+'; 7G=/'}I 5U(n){n+='=';F b=3I.2t.3a(';');1o(F a=0,l=b.V;a<l;a++){F c=b[a];1Z(c.7H(0)==' '){c=c.5o(1,c.V)}8(c.2S(n)==0){J c.5o(n.V,c.V)}}J 0}I 3m(p){8(p&&K p=='1l'){F i=(p.2S('7I')>-1)?M:O,r=(p.2S('2H')>-1)?M:O}Q{F i=r=O}J[i,r]}I 52(a){J(K a=='14')?a:2c}I 2V(a){J K(a)=='1k'&&(a 7J 7K)}I 2C(){J 7L 7M().2C()}I 1c(d,m){8(K d=='1k'){F s=' ('+d.3Y+')';d=d.1c}Q{F s=''}8(!d)J O;8(K m=='1l')m='1K'+s+': '+m;Q m=['1K'+s+':',m];8(3t.4r&&3t.4r.6u)3t.4r.6u(m);J O}$.1R.6g=I(o,c){J 1i.1K(o,c)};$.26($.1I,{'7P':I(t){F a=t*t;J t*(-a*t+4*a-6*t+4)},'7R':I(t){J t*(4*t*t-9*t+6)},'7S':I(t){F a=t*t;J t*(33*a*a-7T*a*t+7U*a-67*t+15)}})})(7V);",
    62, 492, "|||||||opts|if|||||||||||||||||||||||||||||||||var|items|conf|function|return|typeof|cf_e|true|itms|false|visible|else|scrl|width|auto|total|length|case|trigger|button|first||children|visibleConf|bind|number||css|prev|break|tt0|next|pagination|debug|variable|stopPropagation|anims|slice|padding|this|duration|object|string|scroll|push|for|pre|data|boolean|left|usePadding|height|filter|a_dur|switch|undefined|call|triggerHandler|align|container|wrp|marginRight|tmrs|play|fx|easing|remove|carouFredSel|eq|sz_resetMargin|circular|Math|each|post|fn|queu|c_new|isScrolling|cfs_origCssMargin|is|clbk|isPaused|while|sc_setScroll|unbind|isStopped|stopImmediatePropagation|onAfter|preventDefault|extend|outerWidth|l_cur|w_siz|onBefore|Not|null|l_old|crossfade|sc_startScroll|opacity|uncover|max|synchronise|pR|cf_c|pauseOnHover|c_old|parseInt|adjust|old|direction|isNaN|cookie|fade|removeClass|key|l_new|opts_orig|default|mousewheel|updatePageStatus|getTime|css_o|ms_getSizes|adj|cover|resume|last|gn_getVisibleItemsNext|start|responsive|min|cf_getItemsAdjust|ceil|hidden|startTime|scrolling|indexOf|nv_enableNavi|right|is_array|slideTo|pause|cf_sortParams|outerHeight||addClass|top||anchorBuilder|floor|ms_getTotalSize||||split|jquery|innerWidth|sc_clearTimers|parent|hide|ms_getTrueInnerSize|infinite|event|show|queue|ani_o|bt_pauseOnHoverConfig|Carousel|events|gi_getCurrentItems|pauseDuration|minimum|ns2|window|gn_getItemIndex|timePassed|go_getNaviObject|dur2|wN|sc_callCallbacks|touchwipe|prefix|ms_getTrueLargestSize|vI|apply|100|perc|currentPosition|document|to|position|sz_setSizes|nv_showNavi|before|appendTo|sc_stopScroll|currentPage|gn_getVisibleItemsNextFilter|maxDimention|of|substr|marginBottom|pauseOnEvent|get|selector|ms_getPercentage||cur_l|sz|stopped|_cfs_init|serialNumber|eval|gn_getVisibleItemsPrev|keys||cf_mapWrapperSizes|cf_getAdjust|org|onEnd|end|clone|none|mouseleave|Number|isHidden|mouseenter|cf_getAlignPadding|orgW|ms_isPercentage|di|go_getObject|valid|console|not|cfs_isCarousel|conditions|configuration|type|defaults|fx_cover|fx_uncover|upDateOnWindowResize|orgDuration|element|cf_setCookie|up|gn_getVisibleItemsNextTestCircular|gi_getOldItemsNext|gi_getNewItemsNext|finish|stop|slideToPage|_cfs_unbind_events|updateSizes|absolute|linkAnchors|marginLeft|_cfs_bind_buttons|marginTop|click|float|textAlign|gn_getVisibleOrg|_cfs_unbind_buttons|backward|scrolled|cf_getSynchArr||mousewheelPrev|bt_mousesheelNumber|mousewheelNext|wipe|pauseOnResize|delay|ns3||wrapper|bottom|continue|classnames|new_w|nw|old_w|seco|cf_getKeyCode|gn_getItemsPrevFilter|gn_getItemsNextFilter|cf_getItemAdjustMinMax|ms_getLargestSize|toLowerCase|arr|substring|ms_hasVariableSizes|sta|center|selected|_cfs_build|gn_getVisibleItemsPrevFilter|destroy|gn_getScrollItemsNextFilter|forward|page|directscroll|Item|the|new_m|innerHeight|needed|enough|dx|down|onPauseStart|jumpToStart|keyup|keyCode|pageAnchorBuilder|500|No|configs|onPauseEnd|classname|_cfs_bind_events|cf_getPadding|cf_readCookie|cfs_origCss|random|fixed|itm|onCreate|namespace|after|span|animate|complete|append|ms_getPaddingBorderMargin||_cfs_destroy|secp|_cfs_currentPosition|gi_getNewItemsPrev|_cfs_configuration|onPausePause|concat|cfs_tempCssMargin|caroufredsel|hash|s2|index|Set|gi_getOldItemsPrev|Scrolling|l1|l2|shift|join|_cfs_slide_|paused|gn_getScrollItemsPrevFilter|log|wipeRight|The|found|Callback|returned|automatically|second|resize|removeItem|round|timer|currentVisible|wrap|or|class|_cfs_slide_prev|attr|body|unshift|find|location|id|moved|relative|overflow|swing|_cfs_slide_next|cfs|div|caroufredsel_wrapper|Infinity|href|Available|Width|be|clearTimeout|fx_fade|widths|Preventing|non|sliding|setTimeout|hiding|navigation|should|disabled|replaceWith|prependTo|prevPage|heights|Page|nextPage|2500|prepend|carousel|resumed|paddingLeft|paddingRight|paddingTop|paddingBottom|outer|inner|option|insertItem|min_move_x|currently|px|min_move_y|em|preventDefaultEvents|caroufredsel_cookie_|even|odd|path|charAt|immediate|instanceof|Array|new|Date|wipeUp|wipeDown|quadratic|wipeLeft|cubic|elastic|106|126|jQuery".split("|"),
    0, {}));
(function (e, h, l) {
    function m(b) {
        return b
    }

    function n(b) {
        return decodeURIComponent(b.replace(p, " "))
    }

    var p = /\+/g, d = e.cookie = function (b, c, a) {
        if (c !== l) {
            a = e.extend({}, d.defaults, a);
            null === c && (a.expires = -1);
            if ("number" === typeof a.expires) {
                var f = a.expires, g = a.expires = new Date;
                g.setDate(g.getDate() + f)
            }
            c = d.json ? JSON.stringify(c) : String(c);
            return h.cookie = [encodeURIComponent(b), "=", d.raw ? c : encodeURIComponent(c), a.expires ? "; expires=" + a.expires.toUTCString() : "", a.path ? "; path=" + a.path : "", a.domain ? "; domain=" +
                a.domain : "", a.secure ? "; secure" : ""].join("")
        }
        c = d.raw ? m : n;
        a = h.cookie.split("; ");
        f = 0;
        for (g = a.length; f < g; f++) {
            var k = a[f].split("=");
            if (c(k.shift()) === b) return b = c(k.join("=")), d.json ? JSON.parse(b) : b
        }
        return null
    };
    d.defaults = {};
    e.removeCookie = function (b, c) {
        return null !== e.cookie(b) ? (e.cookie(b, null, c), !0) : !1
    }
})(jQuery, document);
/*
 jScrollPane - v2.0.23 - 2016-01-28
 http://jscrollpane.kelvinluck.com/

 Copyright (c) 2014 Kelvin Luck
 Dual licensed under the MIT or GPL licenses.
*/
(function (factory) {
    if (typeof define === "function" && define.amd) define(["jquery"], factory); else if (typeof exports === "object") module.exports = factory(require("jquery")); else factory(jQuery)
})(function ($) {
    $.fn.jScrollPane = function (settings) {
        function JScrollPane(elem, s) {
            var settings, jsp = this, pane, paneWidth, paneHeight, container, contentWidth, contentHeight,
                percentInViewH, percentInViewV, isScrollableV, isScrollableH, verticalDrag, dragMaxY,
                verticalDragPosition, horizontalDrag, dragMaxX, horizontalDragPosition, verticalBar,
                verticalTrack, scrollbarWidth, verticalTrackHeight, verticalDragHeight, arrowUp, arrowDown,
                horizontalBar, horizontalTrack, horizontalTrackWidth, horizontalDragWidth, arrowLeft, arrowRight,
                reinitialiseInterval, originalPadding, originalPaddingTotalWidth, previousContentWidth, wasAtTop = true,
                wasAtLeft = true, wasAtBottom = false, wasAtRight = false,
                originalElement = elem.clone(false, false).empty(),
                mwEvent = $.fn.mwheelIntent ? "mwheelIntent.jsp" : "mousewheel.jsp";
            if (elem.css("box-sizing") === "border-box") {
                originalPadding = 0;
                originalPaddingTotalWidth =
                    0
            } else {
                originalPadding = elem.css("paddingTop") + " " + elem.css("paddingRight") + " " + elem.css("paddingBottom") + " " + elem.css("paddingLeft");
                originalPaddingTotalWidth = (parseInt(elem.css("paddingLeft"), 10) || 0) + (parseInt(elem.css("paddingRight"), 10) || 0)
            }

            function initialise(s) {
                var isMaintainingPositon, lastContentX, lastContentY, hasContainingSpaceChanged, originalScrollTop,
                    originalScrollLeft, maintainAtBottom = false, maintainAtRight = false;
                settings = s;
                if (pane === undefined) {
                    originalScrollTop = elem.scrollTop();
                    originalScrollLeft =
                        elem.scrollLeft();
                    elem.css({overflow: "hidden", padding: 0});
                    paneWidth = elem.innerWidth() + originalPaddingTotalWidth;
                    paneHeight = elem.innerHeight();
                    elem.width(paneWidth);
                    pane = $('<div class="jspPane" />').css("padding", originalPadding).append(elem.children());
                    container = $('<div class="jspContainer" />').css({
                        "width": paneWidth + "px",
                        "height": paneHeight + "px"
                    }).append(pane).appendTo(elem)
                } else {
                    elem.css("width", "");
                    maintainAtBottom = settings.stickToBottom && isCloseToBottom();
                    maintainAtRight = settings.stickToRight &&
                        isCloseToRight();
                    hasContainingSpaceChanged = elem.innerWidth() + originalPaddingTotalWidth != paneWidth || elem.outerHeight() != paneHeight;
                    if (hasContainingSpaceChanged) {
                        paneWidth = elem.innerWidth() + originalPaddingTotalWidth;
                        paneHeight = elem.innerHeight();
                        container.css({width: paneWidth + "px", height: paneHeight + "px"})
                    }
                    if (!hasContainingSpaceChanged && previousContentWidth == contentWidth && pane.outerHeight() == contentHeight) {
                        elem.width(paneWidth);
                        return
                    }
                    previousContentWidth = contentWidth;
                    pane.css("width", "");
                    elem.width(paneWidth);
                    container.find(">.jspVerticalBar,>.jspHorizontalBar").remove().end()
                }
                pane.css("overflow", "auto");
                if (s.contentWidth) contentWidth = s.contentWidth; else contentWidth = pane[0].scrollWidth;
                contentHeight = pane[0].scrollHeight;
                pane.css("overflow", "");
                percentInViewH = contentWidth / paneWidth;
                percentInViewV = contentHeight / paneHeight;
                isScrollableV = percentInViewV > 1;
                isScrollableH = percentInViewH > 1;
                if (!(isScrollableH || isScrollableV)) {
                    elem.removeClass("jspScrollable");
                    pane.css({top: 0, left: 0, width: container.width() - originalPaddingTotalWidth});
                    removeMousewheel();
                    removeFocusHandler();
                    removeKeyboardNav();
                    removeClickOnTrack()
                } else {
                    elem.addClass("jspScrollable");
                    isMaintainingPositon = settings.maintainPosition && (verticalDragPosition || horizontalDragPosition);
                    if (isMaintainingPositon) {
                        lastContentX = contentPositionX();
                        lastContentY = contentPositionY()
                    }
                    initialiseVerticalScroll();
                    initialiseHorizontalScroll();
                    resizeScrollbars();
                    if (isMaintainingPositon) {
                        scrollToX(maintainAtRight ? contentWidth - paneWidth : lastContentX, false);
                        scrollToY(maintainAtBottom ? contentHeight -
                            paneHeight : lastContentY, false)
                    }
                    initFocusHandler();
                    initMousewheel();
                    initTouch();
                    if (settings.enableKeyboardNavigation) initKeyboardNav();
                    if (settings.clickOnTrack) initClickOnTrack();
                    observeHash();
                    if (settings.hijackInternalLinks) hijackInternalLinks()
                }
                if (settings.autoReinitialise && !reinitialiseInterval) reinitialiseInterval = setInterval(function () {
                    initialise(settings)
                }, settings.autoReinitialiseDelay); else if (!settings.autoReinitialise && reinitialiseInterval) clearInterval(reinitialiseInterval);
                originalScrollTop &&
                elem.scrollTop(0) && scrollToY(originalScrollTop, false);
                originalScrollLeft && elem.scrollLeft(0) && scrollToX(originalScrollLeft, false);
                elem.trigger("jsp-initialised", [isScrollableH || isScrollableV])
            }

            function initialiseVerticalScroll() {
                if (isScrollableV) {
                    container.append($('<div class="jspVerticalBar" />').append($('<div class="jspCap jspCapTop" />'), $('<div class="jspTrack" />').append($('<div class="jspDrag" />').append($('<div class="jspDragTop" />'), $('<div class="jspDragBottom" />'))), $('<div class="jspCap jspCapBottom" />')));
                    verticalBar = container.find(">.jspVerticalBar");
                    verticalTrack = verticalBar.find(">.jspTrack");
                    verticalDrag = verticalTrack.find(">.jspDrag");
                    if (settings.showArrows) {
                        arrowUp = $('<a class="jspArrow jspArrowUp" />').bind("mousedown.jsp", getArrowScroll(0, -1)).bind("click.jsp", nil);
                        arrowDown = $('<a class="jspArrow jspArrowDown" />').bind("mousedown.jsp", getArrowScroll(0, 1)).bind("click.jsp", nil);
                        if (settings.arrowScrollOnHover) {
                            arrowUp.bind("mouseover.jsp", getArrowScroll(0, -1, arrowUp));
                            arrowDown.bind("mouseover.jsp",
                                getArrowScroll(0, 1, arrowDown))
                        }
                        appendArrows(verticalTrack, settings.verticalArrowPositions, arrowUp, arrowDown)
                    }
                    verticalTrackHeight = paneHeight;
                    container.find(">.jspVerticalBar>.jspCap:visible,>.jspVerticalBar>.jspArrow").each(function () {
                        verticalTrackHeight -= $(this).outerHeight()
                    });
                    verticalDrag.hover(function () {
                        verticalDrag.addClass("jspHover")
                    }, function () {
                        verticalDrag.removeClass("jspHover")
                    }).bind("mousedown.jsp", function (e) {
                        $("html").bind("dragstart.jsp selectstart.jsp", nil);
                        verticalDrag.addClass("jspActive");
                        var startY = e.pageY - verticalDrag.position().top;
                        $("html").bind("mousemove.jsp", function (e) {
                            positionDragY(e.pageY - startY, false)
                        }).bind("mouseup.jsp mouseleave.jsp", cancelDrag);
                        return false
                    });
                    sizeVerticalScrollbar()
                }
            }

            function sizeVerticalScrollbar() {
                verticalTrack.height(verticalTrackHeight + "px");
                verticalDragPosition = 0;
                scrollbarWidth = settings.verticalGutter + verticalTrack.outerWidth();
                pane.width(paneWidth - scrollbarWidth - originalPaddingTotalWidth);
                try {
                    if (verticalBar.position().left === 0) pane.css("margin-left",
                        scrollbarWidth + "px")
                } catch (err) {
                }
            }

            function initialiseHorizontalScroll() {
                if (isScrollableH) {
                    container.append($('<div class="jspHorizontalBar" />').append($('<div class="jspCap jspCapLeft" />'), $('<div class="jspTrack" />').append($('<div class="jspDrag" />').append($('<div class="jspDragLeft" />'), $('<div class="jspDragRight" />'))), $('<div class="jspCap jspCapRight" />')));
                    horizontalBar = container.find(">.jspHorizontalBar");
                    horizontalTrack = horizontalBar.find(">.jspTrack");
                    horizontalDrag = horizontalTrack.find(">.jspDrag");
                    if (settings.showArrows) {
                        arrowLeft = $('<a class="jspArrow jspArrowLeft" />').bind("mousedown.jsp", getArrowScroll(-1, 0)).bind("click.jsp", nil);
                        arrowRight = $('<a class="jspArrow jspArrowRight" />').bind("mousedown.jsp", getArrowScroll(1, 0)).bind("click.jsp", nil);
                        if (settings.arrowScrollOnHover) {
                            arrowLeft.bind("mouseover.jsp", getArrowScroll(-1, 0, arrowLeft));
                            arrowRight.bind("mouseover.jsp", getArrowScroll(1, 0, arrowRight))
                        }
                        appendArrows(horizontalTrack, settings.horizontalArrowPositions, arrowLeft, arrowRight)
                    }
                    horizontalDrag.hover(function () {
                            horizontalDrag.addClass("jspHover")
                        },
                        function () {
                            horizontalDrag.removeClass("jspHover")
                        }).bind("mousedown.jsp", function (e) {
                        $("html").bind("dragstart.jsp selectstart.jsp", nil);
                        horizontalDrag.addClass("jspActive");
                        var startX = e.pageX - horizontalDrag.position().left;
                        $("html").bind("mousemove.jsp", function (e) {
                            positionDragX(e.pageX - startX, false)
                        }).bind("mouseup.jsp mouseleave.jsp", cancelDrag);
                        return false
                    });
                    horizontalTrackWidth = container.innerWidth();
                    sizeHorizontalScrollbar()
                }
            }

            function sizeHorizontalScrollbar() {
                container.find(">.jspHorizontalBar>.jspCap:visible,>.jspHorizontalBar>.jspArrow").each(function () {
                    horizontalTrackWidth -=
                        $(this).outerWidth()
                });
                horizontalTrack.width(horizontalTrackWidth + "px");
                horizontalDragPosition = 0
            }

            function resizeScrollbars() {
                if (isScrollableH && isScrollableV) {
                    var horizontalTrackHeight = horizontalTrack.outerHeight(),
                        verticalTrackWidth = verticalTrack.outerWidth();
                    verticalTrackHeight -= horizontalTrackHeight;
                    $(horizontalBar).find(">.jspCap:visible,>.jspArrow").each(function () {
                        horizontalTrackWidth += $(this).outerWidth()
                    });
                    horizontalTrackWidth -= verticalTrackWidth;
                    paneHeight -= verticalTrackWidth;
                    paneWidth -= horizontalTrackHeight;
                    horizontalTrack.parent().append($('<div class="jspCorner" />').css("width", horizontalTrackHeight + "px"));
                    sizeVerticalScrollbar();
                    sizeHorizontalScrollbar()
                }
                if (isScrollableH) pane.width(container.outerWidth() - originalPaddingTotalWidth + "px");
                contentHeight = pane.outerHeight();
                percentInViewV = contentHeight / paneHeight;
                if (isScrollableH) {
                    horizontalDragWidth = Math.ceil(1 / percentInViewH * horizontalTrackWidth);
                    if (horizontalDragWidth > settings.horizontalDragMaxWidth) horizontalDragWidth = settings.horizontalDragMaxWidth;
                    else if (horizontalDragWidth < settings.horizontalDragMinWidth) horizontalDragWidth = settings.horizontalDragMinWidth;
                    horizontalDrag.width(horizontalDragWidth + "px");
                    dragMaxX = horizontalTrackWidth - horizontalDragWidth;
                    _positionDragX(horizontalDragPosition)
                }
                if (isScrollableV) {
                    verticalDragHeight = Math.ceil(1 / percentInViewV * verticalTrackHeight);
                    if (verticalDragHeight > settings.verticalDragMaxHeight) verticalDragHeight = settings.verticalDragMaxHeight; else if (verticalDragHeight < settings.verticalDragMinHeight) verticalDragHeight =
                        settings.verticalDragMinHeight;
                    verticalDrag.height(verticalDragHeight + "px");
                    dragMaxY = verticalTrackHeight - verticalDragHeight;
                    _positionDragY(verticalDragPosition)
                }
            }

            function appendArrows(ele, p, a1, a2) {
                var p1 = "before", p2 = "after", aTemp;
                if (p == "os") p = /Mac/.test(navigator.platform) ? "after" : "split";
                if (p == p1) p2 = p; else if (p == p2) {
                    p1 = p;
                    aTemp = a1;
                    a1 = a2;
                    a2 = aTemp
                }
                ele[p1](a1)[p2](a2)
            }

            function getArrowScroll(dirX, dirY, ele) {
                return function () {
                    arrowScroll(dirX, dirY, this, ele);
                    this.blur();
                    return false
                }
            }

            function arrowScroll(dirX,
                                 dirY, arrow, ele) {
                arrow = $(arrow).addClass("jspActive");
                var eve, scrollTimeout, isFirst = true, doScroll = function () {
                    if (dirX !== 0) jsp.scrollByX(dirX * settings.arrowButtonSpeed);
                    if (dirY !== 0) jsp.scrollByY(dirY * settings.arrowButtonSpeed);
                    scrollTimeout = setTimeout(doScroll, isFirst ? settings.initialDelay : settings.arrowRepeatFreq);
                    isFirst = false
                };
                doScroll();
                eve = ele ? "mouseout.jsp" : "mouseup.jsp";
                ele = ele || $("html");
                ele.bind(eve, function () {
                    arrow.removeClass("jspActive");
                    scrollTimeout && clearTimeout(scrollTimeout);
                    scrollTimeout =
                        null;
                    ele.unbind(eve)
                })
            }

            function initClickOnTrack() {
                removeClickOnTrack();
                if (isScrollableV) verticalTrack.bind("mousedown.jsp", function (e) {
                    if (e.originalTarget === undefined || e.originalTarget == e.currentTarget) {
                        var clickedTrack = $(this), offset = clickedTrack.offset(),
                            direction = e.pageY - offset.top - verticalDragPosition, scrollTimeout, isFirst = true,
                            doScroll = function () {
                                var offset = clickedTrack.offset(), pos = e.pageY - offset.top - verticalDragHeight / 2,
                                    contentDragY = paneHeight * settings.scrollPagePercent,
                                    dragY = dragMaxY * contentDragY /
                                        (contentHeight - paneHeight);
                                if (direction < 0) if (verticalDragPosition - dragY > pos) jsp.scrollByY(-contentDragY); else positionDragY(pos); else if (direction > 0) if (verticalDragPosition + dragY < pos) jsp.scrollByY(contentDragY); else positionDragY(pos); else {
                                    cancelClick();
                                    return
                                }
                                scrollTimeout = setTimeout(doScroll, isFirst ? settings.initialDelay : settings.trackClickRepeatFreq);
                                isFirst = false
                            }, cancelClick = function () {
                                scrollTimeout && clearTimeout(scrollTimeout);
                                scrollTimeout = null;
                                $(document).unbind("mouseup.jsp", cancelClick)
                            };
                        doScroll();
                        $(document).bind("mouseup.jsp", cancelClick);
                        return false
                    }
                });
                if (isScrollableH) horizontalTrack.bind("mousedown.jsp", function (e) {
                    if (e.originalTarget === undefined || e.originalTarget == e.currentTarget) {
                        var clickedTrack = $(this), offset = clickedTrack.offset(),
                            direction = e.pageX - offset.left - horizontalDragPosition, scrollTimeout, isFirst = true,
                            doScroll = function () {
                                var offset = clickedTrack.offset(),
                                    pos = e.pageX - offset.left - horizontalDragWidth / 2,
                                    contentDragX = paneWidth * settings.scrollPagePercent, dragX = dragMaxX *
                                    contentDragX / (contentWidth - paneWidth);
                                if (direction < 0) if (horizontalDragPosition - dragX > pos) jsp.scrollByX(-contentDragX); else positionDragX(pos); else if (direction > 0) if (horizontalDragPosition + dragX < pos) jsp.scrollByX(contentDragX); else positionDragX(pos); else {
                                    cancelClick();
                                    return
                                }
                                scrollTimeout = setTimeout(doScroll, isFirst ? settings.initialDelay : settings.trackClickRepeatFreq);
                                isFirst = false
                            }, cancelClick = function () {
                                scrollTimeout && clearTimeout(scrollTimeout);
                                scrollTimeout = null;
                                $(document).unbind("mouseup.jsp",
                                    cancelClick)
                            };
                        doScroll();
                        $(document).bind("mouseup.jsp", cancelClick);
                        return false
                    }
                })
            }

            function removeClickOnTrack() {
                if (horizontalTrack) horizontalTrack.unbind("mousedown.jsp");
                if (verticalTrack) verticalTrack.unbind("mousedown.jsp")
            }

            function cancelDrag() {
                $("html").unbind("dragstart.jsp selectstart.jsp mousemove.jsp mouseup.jsp mouseleave.jsp");
                if (verticalDrag) verticalDrag.removeClass("jspActive");
                if (horizontalDrag) horizontalDrag.removeClass("jspActive")
            }

            function positionDragY(destY, animate) {
                if (!isScrollableV) return;
                if (destY < 0) destY = 0; else if (destY > dragMaxY) destY = dragMaxY;
                var willScrollYEvent = new $.Event("jsp-will-scroll-y");
                elem.trigger(willScrollYEvent, [destY]);
                if (willScrollYEvent.isDefaultPrevented()) return;
                var tmpVerticalDragPosition = destY || 0;
                var isAtTop = tmpVerticalDragPosition === 0, isAtBottom = tmpVerticalDragPosition == dragMaxY,
                    percentScrolled = destY / dragMaxY, destTop = -percentScrolled * (contentHeight - paneHeight);
                if (animate === undefined) animate = settings.animateScroll;
                if (animate) jsp.animate(verticalDrag, "top", destY,
                    _positionDragY, function () {
                        elem.trigger("jsp-user-scroll-y", [-destTop, isAtTop, isAtBottom])
                    }); else {
                    verticalDrag.css("top", destY);
                    _positionDragY(destY);
                    elem.trigger("jsp-user-scroll-y", [-destTop, isAtTop, isAtBottom])
                }
            }

            function _positionDragY(destY) {
                if (destY === undefined) destY = verticalDrag.position().top;
                container.scrollTop(0);
                verticalDragPosition = destY || 0;
                var isAtTop = verticalDragPosition === 0, isAtBottom = verticalDragPosition == dragMaxY,
                    percentScrolled = destY / dragMaxY, destTop = -percentScrolled * (contentHeight -
                    paneHeight);
                if (wasAtTop != isAtTop || wasAtBottom != isAtBottom) {
                    wasAtTop = isAtTop;
                    wasAtBottom = isAtBottom;
                    elem.trigger("jsp-arrow-change", [wasAtTop, wasAtBottom, wasAtLeft, wasAtRight])
                }
                updateVerticalArrows(isAtTop, isAtBottom);
                pane.css("top", destTop);
                elem.trigger("jsp-scroll-y", [-destTop, isAtTop, isAtBottom]).trigger("scroll")
            }

            function positionDragX(destX, animate) {
                if (!isScrollableH) return;
                if (destX < 0) destX = 0; else if (destX > dragMaxX) destX = dragMaxX;
                var willScrollXEvent = new $.Event("jsp-will-scroll-x");
                elem.trigger(willScrollXEvent,
                    [destX]);
                if (willScrollXEvent.isDefaultPrevented()) return;
                var tmpHorizontalDragPosition = destX || 0;
                var isAtLeft = tmpHorizontalDragPosition === 0, isAtRight = tmpHorizontalDragPosition == dragMaxX,
                    percentScrolled = destX / dragMaxX, destLeft = -percentScrolled * (contentWidth - paneWidth);
                if (animate === undefined) animate = settings.animateScroll;
                if (animate) jsp.animate(horizontalDrag, "left", destX, _positionDragX, function () {
                    elem.trigger("jsp-user-scroll-x", [-destLeft, isAtLeft, isAtRight])
                }); else {
                    horizontalDrag.css("left", destX);
                    _positionDragX(destX);
                    elem.trigger("jsp-user-scroll-x", [-destLeft, isAtLeft, isAtRight])
                }
            }

            function _positionDragX(destX) {
                if (destX === undefined) destX = horizontalDrag.position().left;
                container.scrollTop(0);
                horizontalDragPosition = destX || 0;
                var isAtLeft = horizontalDragPosition === 0, isAtRight = horizontalDragPosition == dragMaxX,
                    percentScrolled = destX / dragMaxX, destLeft = -percentScrolled * (contentWidth - paneWidth);
                if (wasAtLeft != isAtLeft || wasAtRight != isAtRight) {
                    wasAtLeft = isAtLeft;
                    wasAtRight = isAtRight;
                    elem.trigger("jsp-arrow-change",
                        [wasAtTop, wasAtBottom, wasAtLeft, wasAtRight])
                }
                updateHorizontalArrows(isAtLeft, isAtRight);
                pane.css("left", destLeft);
                elem.trigger("jsp-scroll-x", [-destLeft, isAtLeft, isAtRight]).trigger("scroll")
            }

            function updateVerticalArrows(isAtTop, isAtBottom) {
                if (settings.showArrows) {
                    arrowUp[isAtTop ? "addClass" : "removeClass"]("jspDisabled");
                    arrowDown[isAtBottom ? "addClass" : "removeClass"]("jspDisabled")
                }
            }

            function updateHorizontalArrows(isAtLeft, isAtRight) {
                if (settings.showArrows) {
                    arrowLeft[isAtLeft ? "addClass" : "removeClass"]("jspDisabled");
                    arrowRight[isAtRight ? "addClass" : "removeClass"]("jspDisabled")
                }
            }

            function scrollToY(destY, animate) {
                var percentScrolled = destY / (contentHeight - paneHeight);
                positionDragY(percentScrolled * dragMaxY, animate)
            }

            function scrollToX(destX, animate) {
                var percentScrolled = destX / (contentWidth - paneWidth);
                positionDragX(percentScrolled * dragMaxX, animate)
            }

            function scrollToElement(ele, stickToTop, animate) {
                var e, eleHeight, eleWidth, eleTop = 0, eleLeft = 0, viewportTop, viewportLeft, maxVisibleEleTop,
                    maxVisibleEleLeft, destY, destX;
                try {
                    e =
                        $(ele)
                } catch (err) {
                    return
                }
                eleHeight = e.outerHeight();
                eleWidth = e.outerWidth();
                container.scrollTop(0);
                container.scrollLeft(0);
                while (!e.is(".jspPane")) {
                    eleTop += e.position().top;
                    eleLeft += e.position().left;
                    e = e.offsetParent();
                    if (/^body|html$/i.test(e[0].nodeName)) return
                }
                viewportTop = contentPositionY();
                maxVisibleEleTop = viewportTop + paneHeight;
                if (eleTop < viewportTop || stickToTop) destY = eleTop - settings.horizontalGutter; else if (eleTop + eleHeight > maxVisibleEleTop) destY = eleTop - paneHeight + eleHeight + settings.horizontalGutter;
                if (!isNaN(destY)) scrollToY(destY, animate);
                viewportLeft = contentPositionX();
                maxVisibleEleLeft = viewportLeft + paneWidth;
                if (eleLeft < viewportLeft || stickToTop) destX = eleLeft - settings.horizontalGutter; else if (eleLeft + eleWidth > maxVisibleEleLeft) destX = eleLeft - paneWidth + eleWidth + settings.horizontalGutter;
                if (!isNaN(destX)) scrollToX(destX, animate)
            }

            function contentPositionX() {
                return -pane.position().left
            }

            function contentPositionY() {
                return -pane.position().top
            }

            function isCloseToBottom() {
                var scrollableHeight = contentHeight -
                    paneHeight;
                return scrollableHeight > 20 && scrollableHeight - contentPositionY() < 10
            }

            function isCloseToRight() {
                var scrollableWidth = contentWidth - paneWidth;
                return scrollableWidth > 20 && scrollableWidth - contentPositionX() < 10
            }

            function initMousewheel() {
                container.unbind(mwEvent).bind(mwEvent, function (event, delta, deltaX, deltaY) {
                    if (!horizontalDragPosition) horizontalDragPosition = 0;
                    if (!verticalDragPosition) verticalDragPosition = 0;
                    var dX = horizontalDragPosition, dY = verticalDragPosition,
                        factor = event.deltaFactor || settings.mouseWheelSpeed;
                    jsp.scrollBy(deltaX * factor, -deltaY * factor, false);
                    return dX == horizontalDragPosition && dY == verticalDragPosition
                })
            }

            function removeMousewheel() {
                container.unbind(mwEvent)
            }

            function nil() {
                return false
            }

            function initFocusHandler() {
                pane.find(":input,a").unbind("focus.jsp").bind("focus.jsp", function (e) {
                    scrollToElement(e.target, false)
                })
            }

            function removeFocusHandler() {
                pane.find(":input,a").unbind("focus.jsp")
            }

            function initKeyboardNav() {
                var keyDown, elementHasScrolled, validParents = [];
                isScrollableH && validParents.push(horizontalBar[0]);
                isScrollableV && validParents.push(verticalBar[0]);
                pane.bind("focus.jsp", function () {
                    elem.focus()
                });
                elem.attr("tabindex", 0).unbind("keydown.jsp keypress.jsp").bind("keydown.jsp", function (e) {
                    if (e.target !== this && !(validParents.length && $(e.target).closest(validParents).length)) return;
                    var dX = horizontalDragPosition, dY = verticalDragPosition;
                    switch (e.keyCode) {
                        case 40:
                        case 38:
                        case 34:
                        case 32:
                        case 33:
                        case 39:
                        case 37:
                            keyDown = e.keyCode;
                            keyDownHandler();
                            break;
                        case 35:
                            scrollToY(contentHeight - paneHeight);
                            keyDown = null;
                            break;
                        case 36:
                            scrollToY(0);
                            keyDown = null;
                            break
                    }
                    elementHasScrolled = e.keyCode == keyDown && dX != horizontalDragPosition || dY != verticalDragPosition;
                    return !elementHasScrolled
                }).bind("keypress.jsp", function (e) {
                    if (e.keyCode == keyDown) keyDownHandler();
                    if (e.target !== this && !(validParents.length && $(e.target).closest(validParents).length)) return;
                    return !elementHasScrolled
                });
                if (settings.hideFocus) {
                    elem.css("outline", "none");
                    if ("hideFocus" in container[0]) elem.attr("hideFocus", true)
                } else {
                    elem.css("outline", "");
                    if ("hideFocus" in
                        container[0]) elem.attr("hideFocus", false)
                }

                function keyDownHandler() {
                    var dX = horizontalDragPosition, dY = verticalDragPosition;
                    switch (keyDown) {
                        case 40:
                            jsp.scrollByY(settings.keyboardSpeed, false);
                            break;
                        case 38:
                            jsp.scrollByY(-settings.keyboardSpeed, false);
                            break;
                        case 34:
                        case 32:
                            jsp.scrollByY(paneHeight * settings.scrollPagePercent, false);
                            break;
                        case 33:
                            jsp.scrollByY(-paneHeight * settings.scrollPagePercent, false);
                            break;
                        case 39:
                            jsp.scrollByX(settings.keyboardSpeed, false);
                            break;
                        case 37:
                            jsp.scrollByX(-settings.keyboardSpeed,
                                false);
                            break
                    }
                    elementHasScrolled = dX != horizontalDragPosition || dY != verticalDragPosition;
                    return elementHasScrolled
                }
            }

            function removeKeyboardNav() {
                elem.attr("tabindex", "-1").removeAttr("tabindex").unbind("keydown.jsp keypress.jsp");
                pane.unbind(".jsp")
            }

            function observeHash() {
                if (location.hash && location.hash.length > 1) {
                    var e, retryInt, hash = escape(location.hash.substr(1));
                    try {
                        e = $("#" + hash + ', a[name="' + hash + '"]')
                    } catch (err) {
                        return
                    }
                    if (e.length && pane.find(hash)) if (container.scrollTop() === 0) retryInt = setInterval(function () {
                        if (container.scrollTop() >
                            0) {
                            scrollToElement(e, true);
                            $(document).scrollTop(container.position().top);
                            clearInterval(retryInt)
                        }
                    }, 50); else {
                        scrollToElement(e, true);
                        $(document).scrollTop(container.position().top)
                    }
                }
            }

            function hijackInternalLinks() {
                if ($(document.body).data("jspHijack")) return;
                $(document.body).data("jspHijack", true);
                $(document.body).delegate('a[href*="#"]', "click", function (event) {
                    var href = this.href.substr(0, this.href.indexOf("#")), locationHref = location.href, hash, element,
                        container, jsp, scrollTop, elementTop;
                    if (location.href.indexOf("#") !==
                        -1) locationHref = location.href.substr(0, location.href.indexOf("#"));
                    if (href !== locationHref) return;
                    hash = escape(this.href.substr(this.href.indexOf("#") + 1));
                    element;
                    try {
                        element = $("#" + hash + ', a[name="' + hash + '"]')
                    } catch (e) {
                        return
                    }
                    if (!element.length) return;
                    container = element.closest(".jspScrollable");
                    jsp = container.data("jsp");
                    jsp.scrollToElement(element, true);
                    if (container[0].scrollIntoView) {
                        scrollTop = $(window).scrollTop();
                        elementTop = element.offset().top;
                        if (elementTop < scrollTop || elementTop > scrollTop + $(window).height()) container[0].scrollIntoView()
                    }
                    event.preventDefault()
                })
            }

            function initTouch() {
                var startX, startY, touchStartX, touchStartY, moved, moving = false;
                container.unbind("touchstart.jsp touchmove.jsp touchend.jsp click.jsp-touchclick").bind("touchstart.jsp", function (e) {
                    var touch = e.originalEvent.touches[0];
                    startX = contentPositionX();
                    startY = contentPositionY();
                    touchStartX = touch.pageX;
                    touchStartY = touch.pageY;
                    moved = false;
                    moving = true
                }).bind("touchmove.jsp", function (ev) {
                    if (!moving) return;
                    var touchPos = ev.originalEvent.touches[0], dX = horizontalDragPosition, dY = verticalDragPosition;
                    jsp.scrollTo(startX + touchStartX - touchPos.pageX, startY + touchStartY - touchPos.pageY);
                    moved = moved || Math.abs(touchStartX - touchPos.pageX) > 5 || Math.abs(touchStartY - touchPos.pageY) > 5;
                    return dX == horizontalDragPosition && dY == verticalDragPosition
                }).bind("touchend.jsp", function (e) {
                    moving = false
                }).bind("click.jsp-touchclick", function (e) {
                    if (moved) {
                        moved = false;
                        return false
                    }
                })
            }

            function destroy() {
                var currentY = contentPositionY(), currentX = contentPositionX();
                elem.removeClass("jspScrollable").unbind(".jsp");
                pane.unbind(".jsp");
                elem.replaceWith(originalElement.append(pane.children()));
                originalElement.scrollTop(currentY);
                originalElement.scrollLeft(currentX);
                if (reinitialiseInterval) clearInterval(reinitialiseInterval)
            }

            $.extend(jsp, {
                reinitialise: function (s) {
                    s = $.extend({}, settings, s);
                    initialise(s)
                }, scrollToElement: function (ele, stickToTop, animate) {
                    scrollToElement(ele, stickToTop, animate)
                }, scrollTo: function (destX, destY, animate) {
                    scrollToX(destX, animate);
                    scrollToY(destY, animate)
                }, scrollToX: function (destX, animate) {
                    scrollToX(destX,
                        animate)
                }, scrollToY: function (destY, animate) {
                    scrollToY(destY, animate)
                }, scrollToPercentX: function (destPercentX, animate) {
                    scrollToX(destPercentX * (contentWidth - paneWidth), animate)
                }, scrollToPercentY: function (destPercentY, animate) {
                    scrollToY(destPercentY * (contentHeight - paneHeight), animate)
                }, scrollBy: function (deltaX, deltaY, animate) {
                    jsp.scrollByX(deltaX, animate);
                    jsp.scrollByY(deltaY, animate)
                }, scrollByX: function (deltaX, animate) {
                    var destX = contentPositionX() + Math[deltaX < 0 ? "floor" : "ceil"](deltaX), percentScrolled =
                        destX / (contentWidth - paneWidth);
                    positionDragX(percentScrolled * dragMaxX, animate)
                }, scrollByY: function (deltaY, animate) {
                    var destY = contentPositionY() + Math[deltaY < 0 ? "floor" : "ceil"](deltaY),
                        percentScrolled = destY / (contentHeight - paneHeight);
                    positionDragY(percentScrolled * dragMaxY, animate)
                }, positionDragX: function (x, animate) {
                    positionDragX(x, animate)
                }, positionDragY: function (y, animate) {
                    positionDragY(y, animate)
                }, animate: function (ele, prop, value, stepCallback, completeCallback) {
                    var params = {};
                    params[prop] = value;
                    ele.animate(params,
                        {
                            "duration": settings.animateDuration,
                            "easing": settings.animateEase,
                            "queue": false,
                            "step": stepCallback,
                            "complete": completeCallback
                        })
                }, getContentPositionX: function () {
                    return contentPositionX()
                }, getContentPositionY: function () {
                    return contentPositionY()
                }, getContentWidth: function () {
                    return contentWidth
                }, getContentHeight: function () {
                    return contentHeight
                }, getPercentScrolledX: function () {
                    return contentPositionX() / (contentWidth - paneWidth)
                }, getPercentScrolledY: function () {
                    return contentPositionY() / (contentHeight -
                        paneHeight)
                }, getIsScrollableH: function () {
                    return isScrollableH
                }, getIsScrollableV: function () {
                    return isScrollableV
                }, getContentPane: function () {
                    return pane
                }, scrollToBottom: function (animate) {
                    positionDragY(dragMaxY, animate)
                }, hijackInternalLinks: $.noop, destroy: function () {
                    destroy()
                }
            });
            initialise(s)
        }

        settings = $.extend({}, $.fn.jScrollPane.defaults, settings);
        $.each(["arrowButtonSpeed", "trackClickSpeed", "keyboardSpeed"], function () {
            settings[this] = settings[this] || settings.speed
        });
        return this.each(function () {
            var elem =
                $(this), jspApi = elem.data("jsp");
            if (jspApi) jspApi.reinitialise(settings); else {
                $("script", elem).filter('[type="text/javascript"],:not([type])').remove();
                jspApi = new JScrollPane(elem, settings);
                elem.data("jsp", jspApi)
            }
        })
    };
    $.fn.jScrollPane.defaults = {
        showArrows: false,
        maintainPosition: true,
        stickToBottom: false,
        stickToRight: false,
        clickOnTrack: true,
        autoReinitialise: false,
        autoReinitialiseDelay: 500,
        verticalDragMinHeight: 0,
        verticalDragMaxHeight: 99999,
        horizontalDragMinWidth: 0,
        horizontalDragMaxWidth: 99999,
        contentWidth: undefined,
        animateScroll: false,
        animateDuration: 300,
        animateEase: "linear",
        hijackInternalLinks: false,
        verticalGutter: 4,
        horizontalGutter: 4,
        mouseWheelSpeed: 3,
        arrowButtonSpeed: 0,
        arrowRepeatFreq: 50,
        arrowScrollOnHover: false,
        trackClickSpeed: 0,
        trackClickRepeatFreq: 70,
        verticalArrowPositions: "split",
        horizontalArrowPositions: "split",
        enableKeyboardNavigation: true,
        hideFocus: false,
        keyboardSpeed: 0,
        initialDelay: 300,
        speed: 30,
        scrollPagePercent: .8
    }
});
(function (b) {
    function A(a, c, f) {
        var d = this;
        return this.on("click.pjax", a, function (a) {
            var e = b.extend({}, p(c, f));
            e.container || (e.container = b(this).attr("data-pjax") || d);
            t(a, e)
        })
    }

    function t(a, c, f) {
        f = p(c, f);
        c = a.currentTarget;
        if ("A" !== c.tagName.toUpperCase()) throw"$.fn.pjax or $.pjax.click requires an anchor element";
        1 < a.which || (a.metaKey || a.ctrlKey || a.shiftKey || a.altKey) || (location.protocol !== c.protocol || location.host !== c.host || c.hash && c.href.replace(c.hash, "") === location.href.replace(location.hash, "") ||
            c.href === location.href + "#") || (c = {
            url: c.href,
            container: b(c).attr("data-pjax"),
            target: c,
            fragment: null
        }, e(b.extend({}, c, f)), a.preventDefault())
    }

    function B(a, c, f) {
        f = p(c, f);
        c = a.currentTarget;
        if ("FORM" !== c.tagName.toUpperCase()) throw"$.pjax.submit requires a form element";
        c = {
            type: c.method,
            url: c.action,
            data: b(c).serializeArray(),
            container: b(c).attr("data-pjax"),
            target: c,
            fragment: null
        };
        e(b.extend({}, c, f));
        a.preventDefault()
    }

    function e(a) {
        function c(a, c) {
            var d = b.Event(a, {relatedTarget: f});
            g.trigger(d, c);
            return !d.isDefaultPrevented()
        }

        a = b.extend(!0, {}, b.ajaxSettings, e.defaults, a);
        b.isFunction(a.url) && (a.url = a.url());
        var f = a.target, d = r(a.url).hash, g = a.context = u(a.container);
        a.data || (a.data = {});
        a.data._pjax = g.selector;
        var l;
        a.beforeSend = function (b, d) {
            "GET" !== d.type && (d.timeout = 0);
            b.setRequestHeader("X-PJAX", "true");
            b.setRequestHeader("X-PJAX-Container", g.selector);
            if (!c("pjax:beforeSend", [b, d])) return !1;
            0 < d.timeout && (l = setTimeout(function () {
                c("pjax:timeout", [b, a]) && b.abort("timeout")
            }, d.timeout), d.timeout = 0);
            a.requestUrl = r(d.url).href
        };
        a.complete = function (b, d) {
            l && clearTimeout(l);
            c("pjax:complete", [b, d, a]);
            c("pjax:end", [b, a])
        };
        a.error = function (b, d, e) {
            var f = v("", b, a);
            b = c("pjax:error", [b, d, e, a]);
            "GET" == a.type && ("abort" !== d && b) && s(f.url)
        };
        a.success = function (f, k, l) {
            var h = v(f, l, a);
            if (h.contents) {
                e.state = {
                    id: a.id || (new Date).getTime(),
                    url: h.url,
                    title: h.title,
                    container: g.selector,
                    fragment: a.fragment,
                    timeout: a.timeout
                };
                (a.push || a.replace) && window.history.replaceState(e.state, h.title, h.url);
                h.title && (document.title = h.title);
                g.html(h.contents);
                "number" === typeof a.scrollTo && b(window).scrollTop(a.scrollTo);
                (a.replace || a.push) && window._gaq && _gaq.push(["_trackPageview"]);
                if ("" !== d) {
                    var m = r(h.url);
                    m.hash = d;
                    e.state.url = m.href;
                    window.history.replaceState(e.state, h.title, m.href);
                    h = b(m.hash);
                    h.length && b(window).scrollTop(h.offset().top)
                }
                c("pjax:success", [f, k, l, a])
            } else s(h.url)
        };
        e.state || (e.state = {
            id: (new Date).getTime(),
            url: window.location.href,
            title: document.title,
            container: g.selector,
            fragment: a.fragment,
            timeout: a.timeout
        }, window.history.replaceState(e.state,
            document.title));
        var k = e.xhr;
        k && 4 > k.readyState && (k.onreadystatechange = b.noop, k.abort());
        e.options = a;
        k = e.xhr = b.ajax(a);
        0 < k.readyState && (a.push && !a.replace && (C(e.state.id, g.clone().contents()), window.history.pushState(null, "", w(a.requestUrl))), c("pjax:start", [k, a]), c("pjax:send", [k, a]));
        return e.xhr
    }

    function D(a, c) {
        return e(b.extend({url: window.location.href, push: !1, replace: !0, scrollTo: !1}, p(a, c)))
    }

    function s(a) {
        window.history.replaceState(null, "", "#");
        window.location.replace(a)
    }

    function x(a) {
        if ((a =
            a.state) && a.container) {
            var c = b(a.container);
            if (c.length) {
                var f = m[a.id];
                if (e.state) {
                    var d = e.state.id < a.id ? "forward" : "back", g = e.state.id, l = c.clone().contents(), k;
                    m[g] = l;
                    "forward" === d ? (l = n, k = q) : (l = q, k = n);
                    l.push(g);
                    (g = k.pop()) && delete m[g];
                    d = b.Event("pjax:popstate", {state: a, direction: d});
                    c.trigger(d);
                    d = {
                        id: a.id,
                        url: a.url,
                        container: c,
                        push: !1,
                        fragment: a.fragment,
                        timeout: a.timeout,
                        scrollTo: !1
                    };
                    f ? (c.trigger("pjax:start", [null, d]), a.title && (document.title = a.title), c.html(f), e.state = a, c.trigger("pjax:end",
                        [null, d])) : e(d)
                } else e.state = a
            } else s(location.href)
        }
    }

    function E(a) {
        var c = b.isFunction(a.url) ? a.url() : a.url, e = a.type ? a.type.toUpperCase() : "GET",
            d = b("<form>", {method: "GET" === e ? "GET" : "POST", action: c, style: "display:none"});
        "GET" !== e && "POST" !== e && d.append(b("<input>", {
            type: "hidden",
            name: "_method",
            value: e.toLowerCase()
        }));
        a = a.data;
        if ("string" === typeof a) b.each(a.split("&"), function (a, c) {
            var e = c.split("=");
            d.append(b("<input>", {type: "hidden", name: e[0], value: e[1]}))
        }); else if ("object" === typeof a) for (key in a) d.append(b("<input>",
            {type: "hidden", name: key, value: a[key]}));
        b(document.body).append(d);
        d.submit()
    }

    function w(a) {
        return a.replace(/\?_pjax=[^&]+&?/, "?").replace(/_pjax=[^&]+&?/, "").replace(/[\?&]$/, "")
    }

    function r(a) {
        var b = document.createElement("a");
        b.href = a;
        return b
    }

    function p(a, c) {
        a && c ? c.container = a : c = b.isPlainObject(a) ? a : {container: a};
        c.container && (c.container = u(c.container));
        return c
    }

    function u(a) {
        a = b(a);
        if (a.length) {
            if ("" !== a.selector && a.context === document) return a;
            if (a.attr("id")) return b("#" + a.attr("id"));
            throw"cant get selector for pjax container!";
        }
        throw"no pjax container for " + a.selector;
    }

    function v(a, c, e) {
        var d = {};
        d.url = w(c.getResponseHeader("X-PJAX-URL") || e.requestUrl);
        if (/<html/i.test(a)) {
            c = b(a.match(/<head[^>]*>([\s\S.]*)<\/head>/i)[0]);
            var g = b(a.match(/<body[^>]*>([\s\S.]*)<\/body>/i)[0])
        } else c = g = b(a);
        if (0 === g.length) return d;
        d.title = c.filter("title").add(c.find("title")).last().text();
        e.fragment ? (a = "body" === e.fragment ? g : g.filter(e.fragment).add(g.find(e.fragment)).first(), a.length && (d.contents = a.contents(), d.title || (d.title = a.attr("title") ||
            a.data("title")))) : /<html/i.test(a) || (d.contents = g);
        d.contents && (d.contents = d.contents.not("title"), d.contents.find("title").remove());
        d.title && (d.title = b.trim(d.title));
        return d
    }

    function C(a, b) {
        m[a] = b;
        for (n.push(a); q.length;) delete m[q.shift()];
        for (; n.length > e.defaults.maxCacheLength;) delete m[n.shift()]
    }

    function y() {
        b.fn.pjax = A;
        b.pjax = e;
        b.pjax.enable = b.noop;
        b.pjax.disable = z;
        b.pjax.click = t;
        b.pjax.submit = B;
        b.pjax.reload = D;
        b.pjax.defaults = {
            timeout: 6500, push: !0, replace: !1, type: "GET", dataType: "html",
            scrollTo: 0, maxCacheLength: 20
        };
        b(window).bind("popstate.pjax", x)
    }

    function z() {
        b.fn.pjax = function () {
            return this
        };
        b.pjax = E;
        b.pjax.enable = y;
        b.pjax.disable = b.noop;
        b.pjax.click = b.noop;
        b.pjax.submit = b.noop;
        b.pjax.reload = function () {
            window.location.reload()
        };
        b(window).unbind("popstate.pjax", x)
    }

    var m = {}, q = [], n = [];
    0 > b.inArray("state", b.event.props) && b.event.props.push("state");
    b.support.pjax = window.history && window.history.pushState && window.history.replaceState && !navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]|WebApps\/.+CFNetwork)/);
    b.support.pjax ? y() : z()
})(jQuery);
(function (window, $, undefined) {
    var support = {calc: false};
    $.fn.rrssb = function (options) {
        var settings = $.extend({
            description: undefined,
            emailAddress: undefined,
            emailBody: undefined,
            emailSubject: undefined,
            image: undefined,
            title: undefined,
            url: undefined
        }, options);
        settings.emailSubject = settings.emailSubject || settings.title;
        settings.emailBody = settings.emailBody || (settings.description ? settings.description : "") + (settings.url ? "\n\n" + settings.url : "");
        for (var key in settings) if (settings.hasOwnProperty(key) && settings[key] !==
            undefined) settings[key] = encodeString(settings[key]);
        if (settings.url !== undefined) {
            $(this).find(".rrssb-facebook a").attr("href", "https://www.facebook.com/sharer/sharer.php?u=" + settings.url);
            $(this).find(".rrssb-tumblr a").attr("href", "http://tumblr.com/share/link?url=" + settings.url + (settings.title !== undefined ? "&name=" + settings.title : "") + (settings.description !== undefined ? "&description=" + settings.description : ""));
            $(this).find(".rrssb-linkedin a").attr("href", "http://www.linkedin.com/shareArticle?mini=true&url=" +
                settings.url + (settings.title !== undefined ? "&title=" + settings.title : "") + (settings.description !== undefined ? "&summary=" + settings.description : ""));
            $(this).find(".rrssb-twitter a").attr("href", "https://twitter.com/intent/tweet?text=" + (settings.description !== undefined ? settings.description : "") + "%20" + settings.url);
            $(this).find(".rrssb-hackernews a").attr("href", "https://news.ycombinator.com/submitlink?u=" + settings.url + (settings.title !== undefined ? "&text=" + settings.title : ""));
            $(this).find(".rrssb-vk a").attr("href",
                "https://vk.com/share.php?url=" + settings.url);
            $(this).find(".rrssb-reddit a").attr("href", "http://www.reddit.com/submit?url=" + settings.url + (settings.description !== undefined ? "&text=" + settings.description : "") + (settings.title !== undefined ? "&title=" + settings.title : ""));
            $(this).find(".rrssb-googleplus a").attr("href", "https://plus.google.com/share?url=" + (settings.description !== undefined ? settings.description : "") + "%20" + settings.url);
            $(this).find(".rrssb-pinterest a").attr("href", "http://pinterest.com/pin/create/button/?url=" +
                settings.url + (settings.image !== undefined ? "&amp;media=" + settings.image : "") + (settings.description !== undefined ? "&description=" + settings.description : ""));
            $(this).find(".rrssb-pocket a").attr("href", "https://getpocket.com/save?url=" + settings.url);
            $(this).find(".rrssb-github a").attr("href", settings.url);
            $(this).find(".rrssb-print a").attr("href", "javascript:window.print()");
            $(this).find(".rrssb-whatsapp a").attr("href", "whatsapp://send?text=" + (settings.description !== undefined ? settings.description + "%20" :
                settings.title !== undefined ? settings.title + "%20" : "") + settings.url)
        }
        if (settings.emailAddress !== undefined || settings.emailSubject) $(this).find(".rrssb-email a").attr("href", "mailto:" + (settings.emailAddress ? settings.emailAddress : "") + "?" + (settings.emailSubject !== undefined ? "subject=" + settings.emailSubject : "") + (settings.emailBody !== undefined ? "&body=" + settings.emailBody : ""))
    };
    var detectCalcSupport = function () {
        var el = $("<div>");
        var calcProps = ["calc", "-webkit-calc", "-moz-calc"];
        $("body").append(el);
        for (var i =
            0; i < calcProps.length; i++) {
            el.css("width", calcProps[i] + "(1px)");
            if (el.width() === 1) {
                support.calc = calcProps[i];
                break
            }
        }
        el.remove()
    };
    var encodeString = function (string) {
        if (string !== undefined && string !== null && $.type(string) === "string") if (string.match(/%[0-9a-f]{2}/i) !== null) {
            string = decodeURIComponent(string);
            encodeString(string)
        } else return encodeURIComponent(string)
    };
    var setPercentBtns = function () {
        $(".rrssb-buttons").each(function (index) {
            var self = $(this);
            var buttons = $("li:visible", self);
            var numOfButtons = buttons.length;
            var initBtnWidth = 100 / numOfButtons;
            buttons.css("width", initBtnWidth + "%").attr("data-initwidth", initBtnWidth)
        })
    };
    var makeExtremityBtns = function () {
        $(".rrssb-buttons").each(function (index) {
            var self = $(this);
            var containerWidth = self.width();
            var buttonWidth = $("li", self).not(".small").eq(0).width();
            var buttonCountSmall = $("li.small", self).length;
            if (buttonWidth > 170 && buttonCountSmall < 1) {
                self.addClass("large-format");
                var fontSize = buttonWidth / 12 + "px";
                self.css("font-size", fontSize)
            } else {
                self.removeClass("large-format");
                self.css("font-size", "")
            }
            if (containerWidth < buttonCountSmall * 25) self.removeClass("small-format").addClass("tiny-format"); else self.removeClass("tiny-format")
        })
    };
    var backUpFromSmall = function () {
        $(".rrssb-buttons").each(function (index) {
            var self = $(this);
            var buttons = $("li", self);
            var smallButtons = buttons.filter(".small");
            var totalBtnSze = 0;
            var totalTxtSze = 0;
            var upCandidate = smallButtons.eq(0);
            var nextBackUp = parseFloat(upCandidate.attr("data-size")) + 55;
            var smallBtnCount = smallButtons.length;
            if (smallBtnCount ===
                buttons.length) {
                var btnCalc = smallBtnCount * 42;
                var containerWidth = self.width();
                if (btnCalc + nextBackUp < containerWidth) {
                    self.removeClass("small-format");
                    smallButtons.eq(0).removeClass("small");
                    sizeSmallBtns()
                }
            } else {
                buttons.not(".small").each(function (index) {
                    var button = $(this);
                    var txtWidth = parseFloat(button.attr("data-size")) + 55;
                    var btnWidth = parseFloat(button.width());
                    totalBtnSze = totalBtnSze + btnWidth;
                    totalTxtSze = totalTxtSze + txtWidth
                });
                var spaceLeft = totalBtnSze - totalTxtSze;
                if (nextBackUp < spaceLeft) {
                    upCandidate.removeClass("small");
                    sizeSmallBtns()
                }
            }
        })
    };
    var checkSize = function (init) {
        $(".rrssb-buttons").each(function (index) {
            var self = $(this);
            var buttons = $("li", self);
            $(buttons.get().reverse()).each(function (index, count) {
                var button = $(this);
                if (button.hasClass("small") === false) {
                    var txtWidth = parseFloat(button.attr("data-size")) + 55;
                    var btnWidth = parseFloat(button.width());
                    if (txtWidth > btnWidth) {
                        var btn2small = buttons.not(".small").last();
                        $(btn2small).addClass("small");
                        sizeSmallBtns()
                    }
                }
                if (!--count) backUpFromSmall()
            })
        });
        if (init === true) rrssbMagicLayout(sizeSmallBtns)
    };
    var sizeSmallBtns = function () {
        $(".rrssb-buttons").each(function (index) {
            var self = $(this);
            var regButtonCount;
            var regPercent;
            var pixelsOff;
            var magicWidth;
            var smallBtnFraction;
            var buttons = $("li", self);
            var smallButtons = buttons.filter(".small");
            var smallBtnCount = smallButtons.length;
            if (smallBtnCount > 0 && smallBtnCount !== buttons.length) {
                self.removeClass("small-format");
                smallButtons.css("width", "42px");
                pixelsOff = smallBtnCount * 42;
                regButtonCount = buttons.not(".small").length;
                regPercent = 100 / regButtonCount;
                smallBtnFraction =
                    pixelsOff / regButtonCount;
                if (support.calc === false) {
                    magicWidth = (self.innerWidth() - 1) / regButtonCount - smallBtnFraction;
                    magicWidth = Math.floor(magicWidth * 1E3) / 1E3;
                    magicWidth += "px"
                } else magicWidth = support.calc + "(" + regPercent + "% - " + smallBtnFraction + "px)";
                buttons.not(".small").css("width", magicWidth)
            } else if (smallBtnCount === buttons.length) {
                self.addClass("small-format");
                setPercentBtns()
            } else {
                self.removeClass("small-format");
                setPercentBtns()
            }
        });
        makeExtremityBtns()
    };
    var rrssbInit = function () {
        $(".rrssb-buttons").each(function (index) {
            $(this).addClass("rrssb-" +
                (index + 1))
        });
        detectCalcSupport();
        setPercentBtns();
        $(".rrssb-buttons li .rrssb-text").each(function (index) {
            var buttonTxt = $(this);
            var txtWdth = buttonTxt.width();
            buttonTxt.closest("li").attr("data-size", txtWdth)
        });
        checkSize(true)
    };
    var rrssbMagicLayout = function (callback) {
        $(".rrssb-buttons li.small").removeClass("small");
        checkSize();
        callback()
    };
    var popupCenter = function (url, title, w, h) {
        var dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : screen.left;
        var dualScreenTop = window.screenTop !== undefined ?
            window.screenTop : screen.top;
        var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
        var left = width / 2 - w / 2 + dualScreenLeft;
        var top = height / 3 - h / 3 + dualScreenTop;
        var newWindow = window.open(url, title, "scrollbars=yes, width=" + w + ", height=" + h + ", top=" + top + ", left=" + left);
        if (newWindow && newWindow.focus) newWindow.focus()
    };
    var waitForFinalEvent = function () {
        var timers = {};
        return function (callback, ms, uniqueId) {
            if (!uniqueId) uniqueId = "Don't call this twice without a uniqueId";
            if (timers[uniqueId]) clearTimeout(timers[uniqueId]);
            timers[uniqueId] = setTimeout(callback, ms)
        }
    }();
    $(function () {
        try {
            $(document).on("click", ".rrssb-buttons a.popup2", {}, function popUp(e) {
                var self = $(this);
                popupCenter(self.attr("href"), self.find(".rrssb-text").html(), 580, 470);
                e.preventDefault()
            })
        } catch (e) {
        }
        $(window).resize(function () {
            rrssbMagicLayout(sizeSmallBtns);
            waitForFinalEvent(function () {
                rrssbMagicLayout(sizeSmallBtns)
            }, 200, "finished resizing")
        });
        rrssbInit()
    });
    window.rrssbInit = rrssbInit
})(window, jQuery);
/*
 MIT
*/
var host = window.location.hostname;
var scroll_top;
var window_width;
var window_height;
$(window).resize(function () {
    window_width = $(window).width();
    window_height = $(window).height();
    headerToggleOpacity();
    playerToggleFixed()
});
$(window).scroll(function () {
    scroll_top = $(window).scrollTop();
    headerToggleOpacity();
    playerToggleFixed()
});

function showTopNotify(notify_string) {
    $("#top_error_notify .notify_content").html(notify_string ? notify_string : default_notify_string);
    $("#top_error_notify").fadeIn();
    setTimeout(function () {
        $("#top_error_notify").fadeOut()
    }, 5E3)
}

function showTopNotifyNotAutoClose(notify_string) {
    $("#top_error_notify .notify_content").html(notify_string ? notify_string : default_notify_string);
    $("#top_error_notify").fadeIn()
}

$(function () {
    function hidePlaylistPreloader() {
        $(".playlists-list-item").hide();
        $(".playlists-preloader").fadeOut();
        $(".playlists-list-item").fadeIn()
    }

    scroll_top = $(window).scrollTop();
    window_height = $(window).height();
    headerToggleOpacity();
    playerToggleFixed();
    $(".search .clear").unbind("click");
    $(".search .clear").click(function (e) {
        $(".search input.text").val("");
        e.preventDefault()
    });
    if (typeof $.prototype.song == "function") {
        $(".song").song();
        $("#player").song({plus: ".player-menu-plus"})
    }
    $("#close_alert_notify").on("click",
        function () {
            $("#top_error_notify").fadeOut();
            return false
        });
    if (typeof $.prototype.tooltip == "function") {
        $('.icon-que[data-tool="tooltip"]').tooltip({limit_width: 160});
        $('#plpop-playlists .plus[data-tool="tooltip"]').tooltip({add_class: "whsn"});
        $(".other_songs .song .mb-tooltip").tooltip({limit_width: 240, placement: "bottom"});
        $(".novelty_clmn  .song .mb-tooltip").tooltip({placement: "bottom", limit_width: 200});
        $(".song .mb-tooltip").tooltip({limit_width: 600, placement: "bottom"})
    }
    if (typeof $.prototype.tooltip ==
        "function") {
        $('*[data-tool="tooltip"]').tooltip({placement: "top"});
        $('*[data-tool="tooltip-bottom"]').tooltip({placement: "bottom"});
        $('*[data-tool="tooltip-left"]').tooltip({placement: "left"});
        $('*[data-tool="tooltip-right"]').tooltip({placement: "right"})
    }
    setVisitedSong();
    var $pane = $(".plpop-scroll-pane");
    var jScrollSettings = {showArrows: true};
    var api2;
    if (typeof $.prototype.jScrollPane == "function") {
        $pane.jScrollPane(jScrollSettings);
        api2 = $pane.data("jsp")
    }
    $(".playlist-rename input").unbind("focus");
    $(".playlist-rename input").focus(function () {
        var $this = $(this);
        var $div = $this.parents(".playlist-wrap:first");
        $div.addClass("renamed")
    });
    $(".playlist-wrap").unbind("hover");
    $(".playlist-wrap").hover(function () {
        var $this = $(this);
        if (!$this.hasClass("renamed")) {
            $(".playlist-wrap").removeClass("renamed");
            var $this2 = $(".playlist-rename input");
            var $div = $this2.parents(".playlist-wrap:first");
            $div.removeClass("renamed")
        }
    }, function () {
    });
    $(".popup-trigger").click(function (e) {
        var $this = $(this);
        var popupID =
            $this.attr("data-popup-id");
        if (popupID == "popup-radio" && $(this).find(".radio-city")) {
            var city = $(this).find(".radio-city").text();
            if (city == "" || city == "undefined") city = "/0"; else city = "-" + city;
            $("#radio-list-my").html('<div style="margin-top:77px;margin-bottom:77px;" class="progress-box"><img src="/themes/classic/assets/images/progress.gif"></div>');
            $("#radio-list-my").load("/ajax/radio" + city, function () {
                $.zvPlayer.radionInit()
            })
        }
        showPopup(popupID);
        e.preventDefault()
    });
    $(".popup .close, .overlay").click(function (e) {
        hidePopups();
        e.preventDefault()
    });
    $(".reg-pass-link").click(function (e) {
        var $this = $(this);
        var $regPassInput = $this.prev("input");
        var $marker = $("<span />").insertBefore($regPassInput);
        var val = $regPassInput.val();
        if ($this.hasClass("text")) {
            $regPassInput.detach().attr("type", "password").insertAfter($marker).val(val);
            $(this).removeClass("text")
        } else {
            $regPassInput.detach().attr("type", "text").insertAfter($marker).val(val);
            $(this).addClass("text")
        }
        $marker.remove();
        e.preventDefault()
    });
    $("#login_form .fp_link").click(function (e) {
        var $box =
            $(this).parents(".pop_box:first");
        var h1 = $box.height();
        $("#login_form").hide();
        $("#fp_form").show();
        var c = $("#fp_form").find("#second-captcha");
        c.attr("src", c.data("url"));
        var h2 = $box.height();
        animateHeight($box, h1, h2);
        e.preventDefault()
    });
    $("#fp_form .cancel_lnk").click(function (e) {
        var $box = $(this).parents(".pop_box:first");
        var h1 = $box.height();
        $("#login_form").show();
        $("#fp_form").hide();
        var h2 = $box.height();
        animateHeight($box, h1, h2);
        e.preventDefault()
    });
    $(":button, :submit", $("#report_bug_form")).click(function (e) {
        showPopup("popup-success");
        e.preventDefault()
    });
    if (typeof $.prototype.carouFredSel == "function" && $("#radio-carou").length) $("#radio-carou").carouFredSel({
        auto: {play: false},
        items: {start: 0, visible: 1},
        duration: 400,
        scroll: {items: 1, fx: "crossfade", duration: 400},
        prev: "#radio-carou-prev",
        next: "#radio-carou-next",
        pagination: "#radio-carou-pag"
    })
});

function saveSongIdCookie_old(songID) {
    var cookie = $.cookie("songidCookie");
    if (cookie) $.cookie("songidCookie", cookie + "," + songID); else $.cookie("songidCookie", songID)
}

function saveSongIdCookie(songID) {
    var ids = store.get("songidCookie");
    if (ids) {
        ids = ids.split(",");
        ids.push(songID);
        var unique = ids.filter(onlyUnique);
        store.set("songidCookie", unique.join(","))
    } else store.set("songidCookie", songID)
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index
}

function setVisitedSong() {
    var idArray = {};
    if (store.get("songidCookie")) idArray = store.get("songidCookie").split(",");
    for (var x = 0; x < idArray.length; x++) $('span[data-sid="' + idArray[x] + '"].download').addClass("visited").attr("data-original-title", "")
}

setInterval(function () {
    setVisitedSong()
}, 2E3);

function setVisitedSong_old() {
    var idArray = {};
    if ($.cookie("songidCookie")) idArray = $.cookie("songidCookie").split(",");
    for (var x = 0; x < idArray.length; x++) $('a[data-sid="' + idArray[x] + '"].download').addClass("visited").attr("data-original-title", "")
}

function animateCount($countBox, delta) {
    var h = $countBox.height();
    var html = $countBox.html();
    var $span = $("<span />").html(html);
    var num = parseInt(html);
    num = num + delta;
    var $newSpan = $("<span />").html(num);
    $countBox.html($span);
    $countBox.append($newSpan);
    $span.css({position: "relative", top: "0px"});
    $newSpan.css({position: "absolute", right: "0px", top: -h + "px"});
    $span.animate({top: h + 3 + "px"}, 600, function () {
    });
    $newSpan.animate({top: "0px"}, 600, function () {
        $countBox.html(num)
    })
}

function headerToggleOpacity() {
    if (scroll_top > 40) $("#header").addClass("opacity"); else $("#header").removeClass("opacity");
    $(window).trigger("scrollM")
}

function detectflash() {
    if (navigator.plugins != null && navigator.plugins.length > 0) return navigator.plugins["Shockwave Flash"] && true;
    if (~navigator.userAgent.toLowerCase().indexOf("webtv")) return true;
    if (~navigator.appVersion.indexOf("MSIE") && !~navigator.userAgent.indexOf("Opera")) try {
        return new ActiveXObject("ShockwaveFlash.ShockwaveFlash") && true
    } catch (e) {
    }
    return false
}

function playerToggleFixed() {
    var document_height = $(document).height();
    var footer_height = $("#footer").height();
    var rest = document_height - scroll_top - window_height;
    if (rest > footer_height) $("#player").addClass("fixed"); else $("#player").removeClass("fixed")
}

function showPopup(id) {
    hidePopups();
    var $pop = $("#" + id);
    var pop_height = $pop.outerHeight();
    var top = 30;
    var d = 10;
    if (is_brand == 1) d = 409;
    if ($(window).height() - 50 > pop_height) top = ($(window).height() - pop_height) / 2 + $(document).scrollTop() - d; else top = 30 + $(document).scrollTop();
    $pop.css({top: top + "px", visibility: "visible"}).fadeIn(300);
    $(".overlay").show();
    return false
}

function getRealDocHeight() {
    var D = document;
    return Math.max(D.body.scrollHeight, D.documentElement.scrollHeight, D.body.offsetHeight, D.documentElement.offsetHeight, D.body.clientHeight, D.documentElement.clientHeight)
}

function hidePopups() {
    $(".overlay").hide();
    $(".popup").fadeOut(0);
    $("#fp_form").hide()
}

function animateHeight($box, h1, h2) {
    $box.height(h1);
    $box.animate({height: h2}, 400, function () {
        $box.css("height", "auto")
    })
}

jQuery.cookie = function (key, value, options) {
    if (arguments.length > 1 && String(value) !== "[object Object]") {
        options = jQuery.extend({}, options);
        if (value === null || value === undefined) options.expires = -1;
        if (typeof options.expires === "number") {
            var days = options.expires, t = options.expires = new Date;
            t.setDate(t.getDate() + days)
        }
        value = String(value);
        return document.cookie = [encodeURIComponent(key), "=", options.raw ? value : encodeURIComponent(value), options.expires ? "; expires=" + options.expires.toUTCString() : "", options.path ? "; path=" +
            options.path : "", options.domain ? "; domain=" + options.domain : "", options.secure ? "; secure" : ""].join("")
    }
    options = value || {};
    var result, decode = options.raw ? function (s) {
        return s
    } : decodeURIComponent;
    return (result = (new RegExp("(?:^|; )" + encodeURIComponent(key) + "=([^;]*)")).exec(document.cookie)) ? decode(result[1]) : null
};
if (jQuery.browser.mozilla || jQuery.browser.opera) {
    document.removeEventListener("DOMContentLoaded", jQuery.ready, false);
    document.addEventListener("DOMContentLoaded", function () {
        jQuery.ready()
    }, false)
}
jQuery.event.remove(window, "load", jQuery.ready);
jQuery.event.add(window, "load", function () {
    jQuery.ready()
});
jQuery.extend({
    includeStates: {}, include: function (url, callback, dependency) {
        if (typeof callback != "function" && !dependency) {
            dependency = callback;
            callback = null
        }
        url = url.replace("\n", "");
        jQuery.includeStates[url] = false;
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.onload = function () {
            jQuery.includeStates[url] = true;
            if (callback) callback.call(script)
        };
        script.onreadystatechange = function () {
            if (this.readyState != "complete" && this.readyState != "loaded") return;
            jQuery.includeStates[url] =
                true;
            if (callback) callback.call(script)
        };
        script.src = url;
        if (dependency) {
            if (dependency.constructor != Array) dependency = [dependency];
            setTimeout(function () {
                var valid = true;
                $.each(dependency, function (k, v) {
                    if (!v()) {
                        valid = false;
                        return false
                    }
                });
                if (valid) document.getElementsByTagName("head")[0].appendChild(script); else setTimeout(arguments.callee, 10)
            }, 10)
        } else document.getElementsByTagName("head")[0].appendChild(script);
        return function () {
            return jQuery.includeStates[url]
        }
    }, readyOld: jQuery.ready, ready: function () {
        if (jQuery.isReady) return;
        imReady = true;
        $.each(jQuery.includeStates, function (url, state) {
            if (!state) return imReady = false
        });
        if (imReady) jQuery.readyOld.apply(jQuery, arguments); else setTimeout(arguments.callee, 10)
    }
});
!function ($) {
    var Tooltip = function (element, options) {
        this.init("tooltip", element, options)
    };
    Tooltip.prototype = {
        constructor: Tooltip, init: function (type, element, options) {
            var eventIn, eventOut;
            this.type = type;
            this.$element = $(element);
            this.options = this.getOptions(options);
            this.enabled = true;
            if (this.options.trigger == "click") this.$element.on("click." + this.type, this.options.selector, $.proxy(this.toggle, this)); else if (this.options.trigger != "manual") {
                eventIn = this.options.trigger == "hover" ? "mouseenter" : "focus";
                eventOut =
                    this.options.trigger == "hover" ? "mouseleave" : "blur";
                this.$element.on(eventIn + "." + this.type, this.options.selector, $.proxy(this.enter, this));
                this.$element.on(eventOut + "." + this.type, this.options.selector, $.proxy(this.leave, this))
            }
            this.options.selector ? this._options = $.extend({}, this.options, {
                trigger: "manual",
                selector: ""
            }) : this.fixTitle();
            var cl = this;
            this.$element.bind("mousemove mousedown", function (e) {
                if (e.which == 1) cl.show()
            })
        }, getOptions: function (options) {
            options = $.extend({}, $.fn[this.type].defaults, options,
                this.$element.data());
            if (options.delay && typeof options.delay == "number") options.delay = {
                show: options.delay,
                hide: options.delay
            };
            return options
        }, enter: function (e) {
            var self = $(e.currentTarget)[this.type](this._options).data(this.type);
            if (!self.options.delay || !self.options.delay.show) return self.show();
            clearTimeout(this.timeout);
            self.hoverState = "in";
            this.timeout = setTimeout(function () {
                if (self.hoverState == "in") self.show()
            }, self.options.delay.show)
        }, leave: function (e) {
            var self = $(e.currentTarget)[this.type](this._options).data(this.type);
            if (this.timeout) clearTimeout(this.timeout);
            if (!self.options.delay || !self.options.delay.hide) return self.hide();
            self.hoverState = "out";
            this.timeout = setTimeout(function () {
                if (self.hoverState == "out") self.hide()
            }, self.options.delay.hide)
        }, show: function () {
            var $tip, inside, pos, actualWidth, actualHeight, placement, tp;
            if (this.hasContent() && this.enabled) {
                $tip = this.tip();
                this.setContent();
                if (this.options.animation) $tip.addClass("fade");
                placement = typeof this.options.placement == "function" ? this.options.placement.call(this,
                    $tip[0], this.$element[0]) : this.options.placement;
                inside = /in/.test(placement);
                $tip.remove().css({top: 0, left: 0, display: "block"}).appendTo(inside ? this.$element : document.body);
                pos = this.getPosition(inside);
                actualWidth = $tip[0].offsetWidth;
                actualHeight = $tip[0].offsetHeight;
                if (actualWidth > this.options.limit_width) actualWidth = this.options.limit_width;
                switch (inside ? placement.split(" ")[1] : placement) {
                    case "bottom":
                        tp = {top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2};
                        break;
                    case "top":
                        tp = {
                            top: pos.top -
                            actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2
                        };
                        break;
                    case "left":
                        tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth};
                        break;
                    case "right":
                        tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width};
                        break
                }
                $tip.css(tp).css("max-width", this.options.limit_width + "px").addClass(placement).addClass("in")
            }
        }, setContent: function () {
            var $tip = this.tip(), title = this.getTitle();
            String.prototype.replaceAll2 = function (token, newToken, ignoreCase) {
                var str, i = -1, _token;
                if ((str = this.toString()) &&
                    typeof token === "string") {
                    _token = ignoreCase === true ? token.toLowerCase() : undefined;
                    while ((i = _token !== undefined ? str.toLowerCase().indexOf(_token, i >= 0 ? i + newToken.length : 0) : str.indexOf(token, i >= 0 ? i + newToken.length : 0)) !== -1) str = str.substring(0, i).concat(newToken).concat(str.substring(i + token.length))
                }
                return str
            };
            title = title.replaceAll2('\\"', '"');
            title = title.replaceAll2("\\'", "'");
            $tip.find(".tooltip-inner")[this.options.html ? "html" : "text"](title);
            $tip.removeClass("fade in top bottom left right")
        }, hide: function () {
            var that =
                this, $tip = this.tip();
            $tip.removeClass("in");

            function removeWithAnimation() {
                var timeout = setTimeout(function () {
                    $tip.off($.support.transition.end).remove()
                }, 500);
                $tip.one($.support.transition.end, function () {
                    clearTimeout(timeout);
                    $tip.remove()
                })
            }

            $.support.transition && this.$tip.hasClass("fade") ? removeWithAnimation() : $tip.remove();
            return this
        }, fixTitle: function () {
            var $e = this.$element;
            if ($e.attr("title") || typeof $e.attr("data-original-title") != "string") $e.attr("data-original-title", $e.attr("title") || "").removeAttr("title")
        },
        hasContent: function () {
            return this.getTitle()
        }, getPosition: function (inside) {
            return $.extend({}, inside ? {
                top: 0,
                left: 0
            } : this.$element.offset(), {width: this.$element[0].offsetWidth, height: this.$element[0].offsetHeight})
        }, getTitle: function () {
            var title, $e = this.$element, o = this.options;
            title = $e.attr("data-original-title") || (typeof o.title == "function" ? o.title.call($e[0]) : o.title);
            return title
        }, tip: function () {
            return this.$tip = this.$tip || $(this.options.template)
        }, validate: function () {
            if (!this.$element[0].parentNode) {
                this.hide();
                this.$element = null;
                this.options = null
            }
        }, enable: function () {
            this.enabled = true
        }, disable: function () {
            this.enabled = false
        }, toggleEnabled: function () {
            this.enabled = !this.enabled
        }, toggle: function () {
            this[this.tip().hasClass("in") ? "hide" : "show"]()
        }, destroy: function () {
            this.hide().$element.off("." + this.type).removeData(this.type)
        }
    };
    $.fn.tooltip = function (option) {
        return this.each(function () {
            var $this = $(this), data = $this.data("tooltip"), options = typeof option == "object" && option;
            if (!data) $this.data("tooltip", data = new Tooltip(this,
                options));
            if (typeof option == "string") data[option]()
        })
    };
    $.fn.tooltip.Constructor = Tooltip;
    $.fn.tooltip.defaults = {
        animation: true,
        placement: "top",
        selector: false,
        template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
        trigger: "hover",
        title: "",
        delay: 0,
        html: true,
        limit_width: 1E3
    }
}(window.jQuery);
!function (a, b, c, d) {
    var e = a(b);
    a.fn.lazyload = function (f) {
        function g() {
            var b = 0;
            i.each(function () {
                var c = a(this);
                if (!j.skip_invisible || c.is(":visible")) if (a.abovethetop(this, j) || a.leftofbegin(this, j)) ; else if (a.belowthefold(this, j) || a.rightoffold(this, j)) {
                    if (++b > j.failure_limit) return !1
                } else c.trigger("appear"), b = 0
            })
        }

        var h, i = this, j = {
            threshold: 0,
            failure_limit: 0,
            event: "scroll",
            effect: "show",
            container: b,
            data_attribute: "original",
            skip_invisible: !0,
            appear: null,
            load: null,
            placeholder: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC"
        };
        return f && (d !== f.failurelimit && (f.failure_limit = f.failurelimit, delete f.failurelimit), d !== f.effectspeed && (f.effect_speed = f.effectspeed, delete f.effectspeed), a.extend(j, f)), h = j.container === d || j.container === b ? e : a(j.container), 0 === j.event.indexOf("scroll") && h.bind(j.event, function () {
            return g()
        }), this.each(function () {
            var b = this, c = a(b);
            b.loaded = !1, (c.attr("src") === d || c.attr("src") === !1) && c.attr("src", j.placeholder), c.one("appear", function () {
                if (!this.loaded) {
                    if (j.appear) {
                        var d = i.length;
                        j.appear.call(b,
                            d, j)
                    }
                    a("<img />").bind("load", function () {
                        var d = c.data(j.data_attribute);
                        c.hide(), c.is("img") ? c.attr("src", d) : c.css("background-image", "url('" + d + "')"), c[j.effect](j.effect_speed), b.loaded = !0;
                        var e = a.grep(i, function (a) {
                            return !a.loaded
                        });
                        if (i = a(e), j.load) {
                            var f = i.length;
                            j.load.call(b, f, j)
                        }
                    }).attr("src", c.data(j.data_attribute))
                }
            }), 0 !== j.event.indexOf("scroll") && c.bind(j.event, function () {
                b.loaded || c.trigger("appear")
            })
        }), e.bind("resize", function () {
            g()
        }), /iphone|ipod|ipad.*os 5/gi.test(navigator.appVersion) &&
        e.bind("pageshow", function (b) {
            b.originalEvent && b.originalEvent.persisted && i.each(function () {
                a(this).trigger("appear")
            })
        }), a(c).ready(function () {
            g()
        }), this
    }, a.belowthefold = function (c, f) {
        var g;
        return g = f.container === d || f.container === b ? (b.innerHeight ? b.innerHeight : e.height()) + e.scrollTop() : a(f.container).offset().top + a(f.container).height(), g <= a(c).offset().top - f.threshold
    }, a.rightoffold = function (c, f) {
        var g;
        return g = f.container === d || f.container === b ? e.width() + e.scrollLeft() : a(f.container).offset().left +
            a(f.container).width(), g <= a(c).offset().left - f.threshold
    }, a.abovethetop = function (c, f) {
        var g;
        return g = f.container === d || f.container === b ? e.scrollTop() : a(f.container).offset().top, g >= a(c).offset().top + f.threshold + a(c).height()
    }, a.leftofbegin = function (c, f) {
        var g;
        return g = f.container === d || f.container === b ? e.scrollLeft() : a(f.container).offset().left, g >= a(c).offset().left + f.threshold + a(c).width()
    }, a.inviewport = function (b, c) {
        return !(a.rightoffold(b, c) || a.leftofbegin(b, c) || a.belowthefold(b, c) || a.abovethetop(b,
            c))
    }, a.extend(a.expr[":"], {
        "below-the-fold": function (b) {
            return a.belowthefold(b, {threshold: 0})
        }, "above-the-top": function (b) {
            return !a.belowthefold(b, {threshold: 0})
        }, "right-of-screen": function (b) {
            return a.rightoffold(b, {threshold: 0})
        }, "left-of-screen": function (b) {
            return !a.rightoffold(b, {threshold: 0})
        }, "in-viewport": function (b) {
            return a.inviewport(b, {threshold: 0})
        }, "above-the-fold": function (b) {
            return !a.belowthefold(b, {threshold: 0})
        }, "right-of-fold": function (b) {
            return a.rightoffold(b, {threshold: 0})
        },
        "left-of-fold": function (b) {
            return !a.rightoffold(b, {threshold: 0})
        }
    })
}(jQuery, window, document);
