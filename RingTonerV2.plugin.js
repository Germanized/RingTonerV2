/**
 * @name RingTonerV2
 * @author Germanized
 * @description Allows you to change your ringtones to custom holiday-themed ones, even if you don't have Discord Nitro.
 * @version 1.2.0
 * @source https://github.com/Germanized/RingTonerV2
 * @updateUrl https://raw.githubusercontent.com/Germanized/RingTonerV2/main/RingTonerV2.plugin.js
 */

const config = {
    "info": {
        "name": "RingTonerV2",
        "authors": [{
            "name": "Germanized"
        }],
        "version": "1.2.0",
        "description": "Allows you to change your ringtones to custom holiday-themed ones, even if you don't have Discord Nitro.",
        "github": "https://github.com/Germanized/RingTonerV2",
        "github_raw": "https://raw.githubusercontent.com/Germanized/RingTonerV2/main/RingTonerV2.plugin.js"
    },
    "changelog": [{
        "title": "Complete Rewrite!",
        "type": "improved",
        "items": [
            "The plugin has been rewritten from the ground up to be more stable.",
            "Removed dependency on ZeresPluginLibrary, so it should now load for all users without issues."
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
        this.audioModule = null;
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
    }

    patch() {
        const AudioResolver = BdApi.Webpack.getModule(m => m.exports?.playSound);
        if (AudioResolver) {
            BdApi.Patcher.instead(this.getName(), AudioResolver.exports, "playSound", (_, [type, volume], original) => {
                if (this.settings.ringtone !== "default" && type === "ring") {
                    const audio = new Audio(this.settings.ringtone);
                    audio.volume = volume;
                    audio.play().catch(e => console.error(`${this.getName()}: Could not play audio.`, e));
                } else {
                    return original(type, volume);
                }
            });
        }
    }

    getSettingsPanel() {
        const panel = document.createElement("div");
        panel.style.padding = "10px";

        const label = document.createElement("h3");
        label.textContent = "Select a Ringtone";
        panel.appendChild(label);

        const select = document.createElement("select");
        select.style.width = "100%";
        select.onchange = () => {
            this.settings.ringtone = select.value;
            BdApi.Data.save(this.getName(), "settings", this.settings);
        };

        const ringtones = [{
            category: "Default",
            name: "Default",
            url: "default"
        }, ...config.ringtones];

        const groupedRingtones = ringtones.reduce((acc, r) => {
            if (!acc[r.category]) acc[r.category] = [];
            acc[r.category].push(r);
            return acc;
        }, {});

        for (const category in groupedRingtones) {
            const optgroup = document.createElement("optgroup");
            optgroup.label = category;
            for (const ringtone of groupedRingtones[category]) {
                const option = document.createElement("option");
                option.value = ringtone.url;
                option.textContent = ringtone.name;
                if (this.settings.ringtone === ringtone.url) {
                    option.selected = true;
                }
                optgroup.appendChild(option);
            }
            select.appendChild(optgroup);
        }

        panel.appendChild(select);
        return panel;
    }
};
