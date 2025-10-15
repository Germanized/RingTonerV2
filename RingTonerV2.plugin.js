const config = {
    "info": {
        "name": "RingTonerV2",
        "authors": [{
            "name": "Germanized"
        }],
        "version": "1.0.0",
        "description": "Allows you to change any of your ringtones to Halloween-themed ones, even if you don't have Discord Nitro.",
        "github": "https://github.com/Germanized/RingTonerV2",
        "github_raw": "https://raw.githubusercontent.com/Germanized/RingTonerV2/main/RingTonerV2.plugin.js"
    },
    "changelog": [{
        "title": "Initial Release",
        "items": [
            "This is the first release of the plugin."
        ]
    }],
    "main": "index.js"
};

module.exports = !global.ZeresPluginLibrary ? class {
    constructor() {
        this._config = config;
    }

    getName() {
        return config.info.name;
    }

    getAuthor() {
        return config.info.authors.map(a => a.name).join(", ");
    }

    getDescription() {
        return config.info.description;
    }

    getVersion() {
        return config.info.version;
    }

    load() {
        BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
            confirmText: "Download Now",
            cancelText: "Cancel",
            onConfirm: () => {
                require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                    if (error) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
                    await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                });
            }
        });
    }

    start() {}

    stop() {}
} : (([Plugin, Api]) => {
    const plugin = (Plugin, Library) => {
        const {
            Patcher,
            Settings,
            WebpackModules
        } = Library;
        const {
            SettingGroup,
            Dropdown
        } = Settings;
        const AudioResolver = WebpackModules.getByPrototypes("exports");

        return class RingTonerV2 extends Plugin {
            constructor() {
                super();
                this.defaultSettings = {
                    ringtone: "default"
                };
            }

            onStart() {
                this.patch();
            }



            onStop() {
                Patcher.unpatchAll();
            }

            getSettingsPanel() {
                const ringtones = [{
                    label: "Default",
                    value: "default"
                }, ...config.ringtones.map(r => ({
                    label: r.name,
                    value: r.url
                }))];

                return (
                    <SettingGroup>
                        <Dropdown
                            value={this.settings.ringtone}
                            options={ringtones}
                            onChange={(value) => {
                                this.settings.ringtone = value;
                                this.saveSettings();
                            }}
                        >
                            Ringtone
                        </Dropdown>
                    </SettingGroup>
                );
            }

            patch() {
                Patcher.before(AudioResolver.exports, "playSound", (_, [type, volume]) => {
                    if (this.settings.ringtone !== "default" && type === "ring") {
                        const audio = new Audio(this.settings.ringtone);
                        audio.volume = volume;
                        audio.play();
                        return false;
                    }
                });
            }
        };
    };

    return plugin(Plugin, Api);
})(global.ZeresPluginLibrary.buildPlugin(config));
