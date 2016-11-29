$(document).ready(function () {
    $.support.cors = true;

    //Adobe Premier Pro keyboard shorcut config
    var keyboadShortcutConfig = new AMVE.AdobePremierProShortcutConfig();

    //Avid keyboard shorcut config
    //keyboadShortcutConfig = new amp.AvidShortcutConfig();

    // Custom keyboard shorcut config
    /*keyboadShortcutConfig = new amp.KeyboardShortcutConfig();
    keyboadShortcutConfig.playPauseShortcut = 'space';
    keyboadShortcutConfig.markInShortcut = 'i';
    keyboadShortcutConfig.markOutShortcut = 'o';
    keyboadShortcutConfig.goToInShortcut = 'shift+i';
    keyboadShortcutConfig.goToOutShortcut = 'shift+o';
    keyboadShortcutConfig.clearInShortcut = 'ctrl+shift+i';
    keyboadShortcutConfig.clearOutShortcut = 'ctrl+shift+o';
    keyboadShortcutConfig.clearBothShortcut = 'ctrl+shift+x';
    keyboadShortcutConfig.playInToOutShortcut = 'ctrl+shift+space';
    keyboadShortcutConfig.playToOutShortcut = 'ctrl+space';
    keyboadShortcutConfig.ffwdShortcut = 'ctrl+right';
    keyboadShortcutConfig.rwdShortcut = 'ctrl+left';
    keyboadShortcutConfig.backOneFrameShortcut = 'left';
    keyboadShortcutConfig.backFiveFramesShortcut = 'shift+left';
    keyboadShortcutConfig.backOneSecondShortcut = 'alt+shift+left';
    keyboadShortcutConfig.backOneGopShortcut = 'ctrl+shift+left';
    keyboadShortcutConfig.fwdOneFrameShortcut = 'right';
    keyboadShortcutConfig.fwdFiveFramesShortcut = 'shift+right';
    keyboadShortcutConfig.fwdOneSecondShortcut = 'alt+shift+right';
    keyboadShortcutConfig.fwdOneGopShortcut = 'ctrl+shift+right';
    keyboadShortcutConfig.markInOneFrameShortcut = 'alt+,';
    keyboadShortcutConfig.markInFiveFramesShortcut = 'alt+shift+,';
    keyboadShortcutConfig.markOutOneFrameShortcut = 'alt+.';
    keyboadShortcutConfig.markOutFiveFramesShortcut = 'alt+shift+.';
    keyboadShortcutConfig.undoShortcut = 'ctrl+z';
    keyboadShortcutConfig.redoShortcut = 'ctrl+y';
    keyboadShortcutConfig.exportShortcut = 's';
    keyboadShortcutConfig.changeModeVirtualShortcut = 'shift+v';
    keyboadShortcutConfig.changeModeRenderedShortcut = 'shift+r';
    keyboadShortcutConfig.changeModeTrimShortcut = 'shift+t';*/

    var apiKey = '60AF2D24-38C2-4F0F-A7A6-79CE27355165';

    var viewModel = {
        assets: ko.observableArray([]),
        selectedAssetId: ko.observable(),
        clipJobs: ko.observableArray([])
    };

    function formatTime(time) {
        var hs = Math.floor(time * 100) % 100,
        s = Math.floor(time % 60),
        m = Math.floor(time / 60) % 60,
        h = Math.floor(time / 3600) % 3600;

        var returnVal  = '';

        returnVal = returnVal + (h < 10 ? ('0' + h) : ('' + h));
        returnVal = returnVal + ':' + (m < 10 ? ('0' + m) : ('' + m));
        returnVal = returnVal + ':' + (s < 10 ? ('0' + s) : ('' + s));

        return returnVal;
    }

    var bindingsApplied = false;
    function applyBindings() {
        if (!bindingsApplied) {
            bindingsApplied = true;
            ko.applyBindings(viewModel);
            setInterval(refreshJobs, 1000);
        }
    }

    function clearAMVEArtifacts() {
        var xhr = $.ajax({
            type: 'GET',
            url: '/api/AMS/clearAMVEArtifacts',
            contentType: 'application/json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + apiKey);
            }
        });

        xhr.done(function (data) {
            return;
        });

        xhr.fail(function (xhr) {
            var x = xhr;
        });

        return xhr;
    }

    function loadAssets() {
        var xhr = $.ajax({
            type: 'GET',
            dataType: 'json',
            url: '/api/AMS/getEditableAssets',
            contentType: 'application/json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + apiKey);
            }
        });

        xhr.done(function (data) {
            if (data && data.forEach) {
                data.forEach(function (assetData) {
                    var asset = ko.mapping.fromJS(assetData);
                    viewModel.assets().push(asset);
                });
                viewModel.assets(viewModel.assets());
            }
        });

        xhr.fail(function (xhr) {
            var x = xhr;
        });

        return xhr;
    }

    function getSelectedAsset() {
        if(viewModel.selectedAssetId() && viewModel.assets()) {
            var result = $.grep(viewModel.assets(), function (e) { return e.id() === viewModel.selectedAssetId(); });
            if (result && result.length > 0) {
                return result[0];
            }
        }
        return null;
    }

    function refreshJobs() {
        if (viewModel.clipJobs().length > 0) {
            var xhrs = [];
            viewModel.clipJobs().forEach(function (clipJob) {
                var xhr = $.ajax({
                    type: 'POST',
                    data: JSON.stringify(ko.mapping.toJS(clipJob)),
                    dataType: 'json',
                    url: '/api/AMS/refreshJob',
                    contentType: 'application/json',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + apiKey);
                    }
                });

                xhr.done(function (data) {
                    if (data) {
                        clipJob.jobState(data.jobState);
                        clipJob.jobRunProgress(data.jobRunProgress);
                        clipJob.jobRunDuration(data.jobRunDuration);
                        clipJob.jobEndTime(data.jobEndTime);
                        viewModel.clipJobs(viewModel.clipJobs());
                    }
                });

                xhr.fail(function (xhr) {
                    var x = xhr;
                });

                xhrs.push(xhr);
            });

            $.when.apply($, xhrs).done(function () {
                $('#jobsDisplay')[0].style.display = 'block';
            });
        } else {
            $('#jobsDisplay')[0].style.display = 'none';
        }
    }

    function createClip(clipData) {
        $('#jobsDisplaySpinner')[0].style.display = 'block';
        var selectedAsset = getSelectedAsset();
        if (selectedAsset && selectedAsset.id()) {
            var clipJob = {
                created: new Date().toUTCString(),
                title: clipData.title,
                description: clipData.description,
                sourceAssetId: selectedAsset.id(),
                clipStart: formatTime(clipData.markIn),
                clipEnd: formatTime(clipData.markOut),
                thumbnail: clipData.thumbnail
            };

            var xhr = $.ajax({
                type: 'POST',
                data: JSON.stringify(clipJob),
                dataType: 'json',
                url: '/api/AMS/createClip',
                contentType: 'application/json',
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + apiKey);
                }
            });

            xhr.done(function (data) {
                if (data) {
                    var model = ko.mapping.fromJS(data);
                    model.deleteJob = function(place) {
                        self.places.remove(place)
                    }
                    viewModel.clipJobs().push(model);
                }
            });

            xhr.fail(function (xhr) {
                var x = xhr;
            });

            xhr.always(function (xhr) {
                $('#jobsDisplaySpinner')[0].style.display = 'none';
            });
        }
    }

    function onClipdataCallback(clipData) {
        if (clipData) {
            var dataTxt = 'data.src: ' + clipData.src +
                '\ndata.markin: ' + clipData.markIn +
                '\ndata.markout: ' + clipData.markOut +
                '\ndata.title: ' + clipData.title +
                '\ndata.description: ' + clipData.description +
                '\ndata.thumbnail: ' + (clipData.thumbnail ? clipData.thumbnail.dataUrl : null);
            alert(dataTxt);
            createClip(clipData);
        }
    }

    var myOptions = {
        'nativeControlsForTouch': false,
        autoplay: true,
        controls: true,
        poster: '',
        plugins: {
            AMVE: { containerId: 'amve', customMetadataContainerId: 'custommetadata', clipdataCallback: onClipdataCallback, keyboardShortcutConfig: keyboadShortcutConfig }
        }
    };

    var myPlayer = amp('vid1', myOptions);

    $('#urlEntrySubmitBtn').click(function () {
        var url = undefined;
        var urlEntry = document.getElementById('urlEntryTxt');
        if (urlEntry && urlEntry.value && urlEntry.value.length > 0 && urlEntry.value.indexOf('http') === 0) {
            url = urlEntry.value;
        } else {
            var selectedAsset = getSelectedAsset();
            if (selectedAsset && selectedAsset.dashUri()) {
                url = selectedAsset.dashUri();
            }
        }

        if (url) {
            myPlayer.src([{ src: url, type: 'application/dash+xml' }, ]);
            $('#amveContainer')[0].style.display = 'block';
        }
    });

    function init() {
        $('#mainSpinner')[0].style.display = 'block';
        clearAMVEArtifacts().then(function () {
            loadAssets().then(function () {
                applyBindings();
                $('#mainSpinner')[0].style.display = 'none';
                $('#urlEntryContainer')[0].style.display = 'block';
            })
        });
    }

    init();
});