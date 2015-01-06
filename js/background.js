/**
 * Author:  Alessandro Polidori
 * Contact: alessandro.polidori@gmail.com
 * Description: display NethServer total installation number
 */

/**
 * Contains all extension functions.
 *
 * @class NethServerPhoneHome
 */
var NethServerPhoneHome = (function () {

    /**
     * Url to open when click the icon.
     *
     * @property URL_PHONE_HOME
     * @type string
     * @readOnly
     * @default "http://www.nethserver.org/phone-home/widget_map.html"
     */
    var URL_PHONE_HOME = 'http://www.nethserver.org/phone-home/widget_map.html';

    /**
     * If debug is activated.
     *
     * @property debug
     * @type boolean
     * @default false
     */
    var debug = false;

    /**
     * Interval time to update the installation counter.
     *
     * @property intervalPolling
     * @type number
     * @default 1 hour
     */
    var intervalPolling = 3600000;

    /**
     * Interval time to update the installation counter when some error occurs.
     *
     * @property intervalPolling
     * @type number
     * @default 5 seconds
     */
    var errorIntervalPolling = 5000;

    /**
     * Timeout identifier.
     *
     * @property idTimeoutUpdate
     * @type number
     */
    var idTimeoutUpdate;

    /**
     * Initialize.
     *
     * @method init
     */
    function init() {
        try {
            chrome.browserAction.setBadgeText({ text: '...' });

            chrome.browserAction.onClicked.addListener(function () {
                chrome.tabs.create({ url: URL_PHONE_HOME });
            });
            if (debug) { console.log('initialized'); }

        } catch (err) {
            console.error(err.stack);
        }
    }

    /**
     * Start the update of the installation counter.
     *
     * @method start
     */
    function start() {
        try {
            updateBadge();
            if (debug) { console.log('updating started'); }

        } catch (err) {
            console.error(err.stack);
        }
    }

    /**
     * Stop the update of the installation counter.
     *
     * @method stop
     */
    function stop() {
        try {
            clearTimeout(idTimeoutUpdate);
            idTimeoutUpdate = undefined;
            if (debug) { console.log('updating stopped'); }

        } catch (err) {
            console.error(err.stack);
        }
    }

    /**
     * Restart the update of the installation counter.
     *
     * @method restart
     */
    function restart() {
        try {
            stop();
            start();
        } catch (err) {
            console.error(err.stack);
        }
    }

    /**
     * Set debug modality to on or off.
     *
     * @method setDebug
     * @param {boolean} value True to activate console debug
     */
    function setDebug(value) {
        try {
            debug = value;
        } catch (err) {
            console.error(err.stack);
        }
    }

    /**
     * Change the update interval polling and restart the update service.
     *
     * @method setIntervalPolling
     * @param {number} value The interval time in milliseconds
     */
    function setIntervalPolling(value) {
        try {
            intervalPolling = value;
            if (idTimeoutUpdate) { restart(); }
        } catch (err) {
            console.error(err.stack);
        }
    }

    /**
     * Returns the timeout id.
     *
     * @method getIdTimeoutUpdate
     * @return {number} The timeout id.
     */
    function getIdTimeoutUpdate() {
        try {
            return idTimeoutUpdate;
        } catch (err) {
            console.error(err.stack);
        }
    }

    /**
     * Returns the url of NethServer Phone Home service.
     *
     * @method getUrlPhoneHome
     * @return {string} The NethServer Phone Home url.
     */
    function getUrlPhoneHome() {
        try {
            return URL_PHONE_HOME;
        } catch (err) {
            console.error(err.stack);
        }
    }

    /**
     * Gets the total NethServer installation number and update the graphic display.
     *
     * @method updateBadge
     * @private
     */
    function updateBadge() {
        try {
            if (debug) { console.log('update badge'); }
            getNethServerInstallations(function (value) {
                try {
                    setTimeout(function () { chrome.browserAction.setBadgeText({ text: value.toString() }); }, 2000);
                } catch (err) {
                    console.error(err.stack);
                    chrome.browserAction.setBadgeText({ text: '?' });
                }
            });
        } catch (err) {
            console.error(err.stack);
            chrome.browserAction.setBadgeText({ text: '?' });
        }
    }

    /**
     * Gets the total number of NethServer installations worldwide.
     *
     * @method getNethServerInstallations
     * @param {function} cb The Callback function to call on ajax completion
     * @private
     */
    function getNethServerInstallations(cb) {
        try {
            chrome.browserAction.setBadgeText({ text: 'XHR' });
            $.ajax({
                url:   'http://www.nethserver.org/phone-home/index.php?',
                type:  'POST',
                data:  'method=get_info',
                cache: false

            }).done(function (data, textStatus, jqXHR) {
                try {
                    var i;
                    var tot  = 0;
                    var data = JSON.parse(JSON.parse(data));

                    for (i = 0; i < data.nethservers.length; i++) {
                        tot += parseInt(data.nethservers[i].num_installation);
                    }
                    cb(tot);
                    idTimeoutUpdate = setTimeout(updateBadge, intervalPolling);

                } catch (err) {
                    console.error(err.stack);
                    cb('?');
                }

            }).fail(function (jqHXR, textStatus, errorThrown) {
                try {
                    console.error(textStatus);
                    cb('...');
                    idTimeoutUpdate = setTimeout(updateBadge, errorIntervalPolling);

                } catch (err) {
                    console.error(err.stack);
                    cb('?');
                }
            });
        } catch (err) {
            console.error(err.stack);
            cb('?');
        }
    }

    return {
        init:               init,
        stop:               stop,
        start:              start,
        restart:            restart,
        setDebug:           setDebug,
        getUrlPhoneHome:    getUrlPhoneHome,
        getIdTimeoutUpdate: getIdTimeoutUpdate,
        setIntervalPolling: setIntervalPolling
    };

})();

NethServerPhoneHome.init();
NethServerPhoneHome.start();