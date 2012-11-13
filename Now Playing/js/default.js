(function () {
    "use strict";

    var render_screen = function (images) {
        $(images).each(function (key, entry) {
            $('#cover' + key).attr("src", entry.image500);
            $('#link' + key).attr("href", "http://musicbrainz.org/release/" + entry.mbid);
        });
    };

    var refresh = function () {
        var request = $.getJSON("http://relatedmusic.org/json.php?max=5");

        request.done(function (data, status, xhr) {
            render_screen(data.results);
            tile(data.results);
        });
        request.fail(function (xhr, status, error) {
            $('#main').text("An error occured: " + status + error);
        });
    };

    var tile = function (images) {
        var notifications = Windows.UI.Notifications;

        var wide = notifications.TileTemplateType.TileWideImageCollection;
        var wide_xml = notifications.TileUpdateManager.getTemplateContent(wide);
        var wide_str = wide_xml.getXml();
        var wide_images = wide_xml.getElementsByTagName("image");

        var binding = wide_xml.getElementsByTagName("binding");
        binding[0].setAttribute("branding", "none");

        wide_images[0].setAttribute("src", images[0].image250);
        /*                
                wide_images[1].setAttribute("src", images[1].image250);
                wide_images[2].setAttribute("src", images[2].image250);
                wide_images[3].setAttribute("src", images[3].image250);
                wide_images[4].setAttribute("src", images[4].image250);
        */

        var narrow = notifications.TileTemplateType.TileSquareImage;
        var narrow_xml = notifications.TileUpdateManager.getTemplateContent(narrow);
        var narrow_str = narrow_xml.getXml();
        var narrow_images = narrow_xml.getElementsByTagName("image");
        narrow_images[0].setAttribute("src", images[0].image250);
        
        var node = wide_xml.importNode(narrow_xml.getElementsByTagName("binding").item(0), true);
        wide_xml.getElementsByTagName("visual").item(0).appendChild(node);

        var tileNotification = new notifications.TileNotification(wide_xml);
        var currentTime = new Date();
        tileNotification.expirationTime = new Date(currentTime.getTime() + 30 * 60 * 1000);
        notifications.TileUpdateManager.createTileUpdaterForApplication().update(tileNotification);
    };
    
    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
                refresh();
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
                refresh();
            }
            args.setPromise(WinJS.UI.processAll());
        }
    };

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
    };

    app.start();
})();
