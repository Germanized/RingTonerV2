/**
 * @name RingTonerV2
 * @author Germanized
 * @description Allows you to change your ringtones to custom holiday-themed ones, even if you don't have Discord Nitro.
 * @version 1.3.0
 * @source https://github.com/Germanized/RingTonerV2
 * @updateUrl https://raw.githubusercontent.com/Germanized/RingTonerV2/main/RingTonerV2.plugin.js
 */

const config = {
    "info": {
        "name": "RingTonerV2",
        "authors": [{
            "name": "Germanized"
        }],
        "version": "1.3.0",
        "description": "Allows you to change your ringtones to custom holiday-themed ones, even if you don't have Discord Nitro.",
        "github": "https://github.com/Germanized/RingTonerV2",
        "github_raw": "https://raw.githubusercontent.com/Germanized/RingTonerV2/main/RingTonerV2.plugin.js"
    },
    "changelog": [{
        "title": "Modernization & Fixes",
        "type": "fixed",
        "items": [
            "The settings menu now uses a modern, native-looking Discord UI.",
            "Fixed a critical bug where custom ringtones would not play for incoming calls.",
            "Improved patching logic for better stability."
        ]
    }],
    "ringtones": [{
        "category": "Halloween",
        "name": "Halloween 2020",
        "url": "https://raw.githubusercontent.com/Germanized/RingTonerV2/main/ringtones/Discord_Halloween_Ringtone_2020.mp3"
    }, {
        "category": "Halloween",
        "name": "Spooky 2022 V1",
        "url": "https://raw.githubusercontent.com/Germanized/RingTonerV2/main/ringtones/Discord_Spooky_Ringtone_2022_V1.mp3"
    }, {
        "category": "Halloween",
        "name": "Spooky 2022 V2",
        "url": "https://raw.githubusercontent.com/Germanized/RingTonerV2/main/ringtones/Discord_Spooky_Ringtone_2022_V2.mp3"
    }, {
        "category": "Halloween",
        "name": "Spooky 2023",
        "url": "https://raw.githubusercontent.com/Germanized/RingTonerV2/main/ringtones/Discord_Spooky_Ringtone_2023.mp3"
    }, {
        "category": "Halloween",
        "name": "Halloween 2024",
        "url": "https://raw.githubusercontent.com/Germanized/RingTonerV2/main/ringtones/Discord_Halloween_Ringtone_2024.mp3"
    }, {
        "category": "Christmas",
        "name": "Christmas Past 2023",
        "url": "https://raw.githubusercontent.com/Germanized/RingTonerV2/main/ringtones/Discord_Christmas_Past_2023.mp3"
    }, {
        "category": "Christmas",
        "name": "Xmas 2024",
        "url": "https://raw.githubusercontent.com/Germanized/RingTonerV2/main/ringtones/Discord_Xmas_2024.mp3"
    }, {
        "category": "Miscellaneous",
        "name": "Rare Ringtone",
        "url": "https://raw.githubusercontent.com/Germanized/RingTonerV2/main/ringtones/Discord_Rare_Ringtone.mp3"
    }]
};

module.exports = class RingTonerV2 {
    constructor() {
        this.settings = {};
        this.audio = null;
        this.soundIDs = ["ring", "call_calling", "call_ringing", "call_ringing_beat"];
    }

    getName() { return config.info.name; }
    getAuthor() { return config.info.authors.map(a => a.name).join(", "); }
    getDescription() { return config.info.description; }
    getVersion() { return config.info.version; }

    load() {
        this.settings = BdApi.Data.load(this.getName(), "settings") || { ringtone: "default" };
    }

    start() {
        this.patch();
    }

    stop() {
        BdApi.Patcher.unpatchAll(this.getName());
        if (this.audio) {
            this.audio.pause();
            this.audio.src = "";
            this.audio = null;
        }
    }

    patch() {
        const AudioModule = BdApi.Webpack.getModule(m => m.exports?.createSound);
        if (AudioModule) {
            BdApi.Patcher.after(this.getName(), AudioModule.exports, "createSound", (_, [type], res) => {
                if (this.settings.ringtone !== "default" && this.soundIDs.includes(type)) {
                    res.src = this.settings.ringtone;
                    this.audio = res;
                }
            });
        }
    }

    getSettingsPanel() {
        const Select = BdApi.Webpack.getModule(m => m.SingleSelect && !m.ClearableSingleSelect);
        const {
            React
        } = BdApi;

        const options = [{
            label: "Default",
            value: "default"
        }];

        const groupedRingtones = config.ringtones.reduce((acc, r) => {
            if (!acc[r.category]) acc[r.category] = [];
            acc[r.category].push({
                label: r.name,
                value: r.url
            });
            return acc;
        }, {});

        for (const category in groupedRingtones) {
            options.push({
                label: category,
                options: groupedRingtones[category]
            });
        }

        const SettingsPanel = (props) => {
            const [currentRingtone, setRingtone] = React.useState(this.settings.ringtone);
            return React.createElement("div", {
                    style: {
                        padding: "10px"
                    }
                },
                React.createElement("h3", {
                    style: {
                        color: "var(--header-primary)",
                        marginBottom: "10px"
                    }
                }, "Select a Ringtone"),
                React.createElement(Select.SingleSelect, {
                    value: currentRingtone,
                    options: options,
                    onChange: (value) => {
                        this.settings.ringtone = value;
                        BdApi.Data.save(this.getName(), "settings", this.settings);
                        setRingtone(value);
                    }
                })
            );
        };

        return React.createElement(SettingsPanel);
    }
};