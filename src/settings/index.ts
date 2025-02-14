import { App, Setting, PluginSettingTab } from "obsidian";
import SoloToolkitPlugin from "../main";

export type ViewType = "dice" | "deck" | "oracle" | "word";

export interface SoloToolkitSettings {
  defaultView: ViewType;
  customTableRoot: string;
  customDeckRoot: string;
  disableDefaultWords: boolean;
  deckJokers: boolean;
  deckTarot: boolean; // obsolete
  deckClipboard: boolean;
  inlineCounters: boolean;
  oracleLanguage: string;
}

export const DEFAULT_SETTINGS: SoloToolkitSettings = {
  defaultView: "dice",
  customTableRoot: "Tables",
  customDeckRoot: "Decks",
  disableDefaultWords: false,
  deckJokers: false,
  deckTarot: true,
  deckClipboard: false,
  inlineCounters: false,
  oracleLanguage: "en",
};

export class SoloToolkitSettingTab extends PluginSettingTab {
  plugin: SoloToolkitPlugin;

  constructor(app: App, plugin: SoloToolkitPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Default sidebar view")
      .addDropdown((dropdown) => {
        dropdown
          .addOption("dice", "Dice")
          .addOption("deck", "Deck")
          .addOption("oracle", "Oracle")
          .addOption("word", "Ideas");
        dropdown.setValue(this.plugin.settings.defaultView || "dice");
        dropdown.onChange(async (value: ViewType) => {
          this.plugin.settings.defaultView = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Custom tables folder")
      .setDesc("Additional random tables can be added in this folder")
      .addText((text) =>
        text
          .setPlaceholder("Tables")
          .setValue(this.plugin.settings.customTableRoot)
          .onChange(async (value) => {
            this.plugin.settings.customTableRoot = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Custom decks folder")
      .setDesc("Additional decks can be added in subfolders in this folder")
      .addText((text) =>
        text
          .setPlaceholder("Decks")
          .setValue(this.plugin.settings.customDeckRoot)
          .onChange(async (value) => {
            this.plugin.settings.customDeckRoot = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Hide default random generators")
      .setDesc(
        "Make sure to add your own custom tables to the folder specified in the above option"
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.disableDefaultWords)
          .onChange(async (value) => {
            this.plugin.settings.disableDefaultWords = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Add 2 jokers to standard deck")
      .setDesc("Don't forget to shuffle after changing this")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.deckJokers)
          .onChange(async (value) => {
            this.plugin.settings.deckJokers = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Enable "click to copy" on cards')
      .setDesc(
        'Experimental: this will create image copies in your "new attachments" folder at the moment'
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.deckClipboard)
          .onChange(async (value) => {
            this.plugin.settings.deckClipboard = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Enable inline elements")
      .setDesc(
        "Typing `1` will render a dynamic counter, typing `1/5` will render a progress tracker, typing ` ` will render a tab stop"
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.inlineCounters)
          .onChange(async (value) => {
            this.plugin.settings.inlineCounters = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Yes/no oracle language")
      .addDropdown((dropdown) => {
        dropdown
          .addOption("en", "English")
          .addOption("zh", "Chinese")
          .addOption("fr", "French")
          .addOption("de", "German")
          .addOption("hi", "Hindi")
          .addOption("ja", "Japanese")
          .addOption("pt", "Portuguese")
          .addOption("es", "Spanish");
        dropdown.setValue(this.plugin.settings.oracleLanguage || "en");
        dropdown.onChange(async (value: ViewType) => {
          this.plugin.settings.oracleLanguage = value;
          await this.plugin.saveSettings();
        });
      });
  }
}
