function onClipdataCallback(clipData) {
    if (clipData) {
        var dataTxt = 'data.src: ' + clipData.src +
            '\ndata.markin: ' + clipData.markIn +
            '\ndata.markout: ' + clipData.markOut +
            '\ndata.title: ' + clipData.title +
            '\ndata.description: ' + clipData.description +
            '\ndata.thumbnail: ' + (clipData.thumbnail ? clipData.thumbnail.dataUrl : null);
        alert(dataTxt);
    }
}

$(document).ready(function () {
    var that = this;
    var videos = [
    {
        title: 'VOD DASH - Azure Media Services Overview',
        type: 'application/dash+xml',
        url: 'http://amssamples.streaming.mediaservices.windows.net/91492735-c523-432b-ba01-faba6c2206a2/AzureMediaServicesPromo.ism/manifest(format=mpd-time-csf)'
    },
    {
        title: 'VOD DASH - Hololens Demo',
        type: 'application/dash+xml',
        url: 'http://nimbuspm.origin.mediaservices.windows.net/aed33834-ec2d-4788-88b5-a4505b3d032c/Microsoft%27s%20HoloLens%20Live%20Demonstration.ism/manifest(format=mpd-time-csf)'
    },
    {
        title: 'Live DASH - Smooth Ingest',
        type: 'application/dash+xml',
        url: 'http://b028.wpc.azureedge.net/80B028/Samples/a38e6323-95e9-4f1f-9b38-75eba91704e4/5f2ce531-d508-49fb-8152-647eba422aec.ism/manifest(format=mpd-time-csf)'
    }];

    if ($('#selectSource')) {
        $('#selectSource').empty();
        var selectSource = $('#selectSource')[0];
        var index = 0;
        videos.forEach(function (video) {
            var option = document.createElement('option');
            option.innerText = video.title;
            $(option).data('video', video);
            if (index === 0) {
                $(option).prop('selected', true);
            }
            selectSource.appendChild(option);
            index++;
        });

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
    }

    $('#config-save').click(function () {
        var url = undefined;
        var urlEntry = $('adaptive-url')[0];
        if (urlEntry && urlEntry.value && urlEntry.value.length > 0 && urlEntry.value.indexOf('http') === 0) {
            video = { title: 'Manually Entered URL', url: urlEntry.value, type: 'application/dash+xml' };
        } else {
            var selected = $("#selectSource option:selected");
            if (selected && myPlayer) {
                var video = selected.data('video');
            }
        }

        if (video) {
            myPlayer.src([{ src: video.url, type: video.type }, ]);
            $('#adaptive-url')[0].value = video.url;
            $('#videoContainer')[0].style.display = 'block';
        }
    });
});