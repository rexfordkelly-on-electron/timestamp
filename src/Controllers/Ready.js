const Electron = require('electron');
const Path = require('path');

class Ready
{
    /**
     * This class will be instantiated when Electron has finished
     * initialization and is ready to create browser windows.
     *
     * @param {App} app The app instance.
     * @return {Ready}
     */
    constructor(app)
    {
        // Remember app instance
        this.app = app;

        // Hide dock icon
        Electron.app.dock.hide();

        // Set path to views directory
        this.app.viewsDir = 'file://' + Path.normalize(`${__dirname}/../Views`);

        // Create tray
        this.app.tray = new (require('../Components/Tray'))(app);

        // Create clock
        this.app.clock = new (require('../Components/Clock'))(app);

        // Create preferences
        this.app.preferences = new (require('../Components/Preferences'))(app);

        // Create calendar
        this.app.calendar = new (require('../Components/Calendar'))(app);

        // Initialize tray related things
        this.initTray();

        // Synchronize preferences with several components
        this.app.preferences.onChange = (data) => this.preferencesChanged(data);
    }

    /**
     * Initialize everything that belongs to the tray.
     */
    initTray()
    {
        // Hook clock tick with tray label
        this.app.clock.onTick = (clock) => {
            this.app.tray.label = clock.toString();
        }

        // Show calendar when clicking on tray icon
        this.app.tray.onClick = (e, bounds) => {
            this.app.calendar.setPosition(bounds.x, bounds.y);

            if (this.app.calendar.isVisible()) {
                this.app.calendar.hide();
            } else {
                this.app.calendar.show();
            }
        };

        // Glue tray menu items with app components
        this.app.tray.onPreferencesClicked = () => this.app.preferences.show();
        this.app.tray.onQuitClicked = () => Electron.app.quit();
    }

    /**
     * Handle change of preferences.
     *
     * @param {object} data New preferences.
     */
    preferencesChanged(data)
    {
        // We have a new clock format
        if (data.clockFormat !== this.app.clock.format) {
            this.app.clock.format = data.clockFormat;
        }
    }
}

module.exports = Ready;