(() => {
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });

  // index.tsx
  var import_metro = __require("@vendetta/metro");
  var import_common = __require("@vendetta/metro/common");
  var import_patcher = __require("@vendetta/patcher");
  var import_plugin = __require("@vendetta/plugin");
  var import_storage = __require("@vendetta/storage");
  var import_components = __require("@vendetta/ui/components");
  var { FormSwitchRow, FormInput, FormSection, FormDivider } = import_components.Forms;
  var vstorage = import_plugin.storage;
  function log(...args) {
    if (vstorage.debugLogging) console.log("[MessageCornice]", ...args);
  }
  function visualLength(str) {
    return [...str.replace(/<a?:\w+:\d+>/g, "\0")].length;
  }
  function buildEndsOnly(text) {
    const emoji = vstorage.emoji || "\u{1F525}";
    return `${emoji}${text}${emoji}`;
  }
  function buildFullBox(text) {
    const emoji = vstorage.emoji || "\u{1F525}";
    const pad = vstorage.padSide || " ";
    const minWidth = Math.max(1, vstorage.minWidth || 1);
    const lines = text.split("\n");
    const innerWidth = Math.max(minWidth, ...lines.map(visualLength));
    const border = emoji.repeat(innerWidth + 2);
    const body = lines.map((line) => {
      const padding = pad.repeat(Math.max(0, innerWidth - visualLength(line)));
      return `${emoji}${line}${padding}${emoji}`;
    });
    return [border, ...body, border].join("\n");
  }
  function buildCornice(text) {
    const style = vstorage.borderStyle === "ends" ? "ends" : "box";
    const result = style === "ends" ? buildEndsOnly(text) : buildFullBox(text);
    log("built cornice:", result);
    return result;
  }
  var unpatch;
  function onLoad() {
    vstorage.enabled ??= true;
    vstorage.emoji ??= "\u{1F525}";
    vstorage.minWidth ??= 12;
    vstorage.padSide ??= " ";
    vstorage.borderStyle ??= "box";
    vstorage.debugLogging ??= false;
    console.log("[MessageCornice] onLoad called, enabled =", vstorage.enabled);
    const Messages = (0, import_metro.findByProps)("sendMessage", "editMessage");
    if (!Messages) {
      console.log("[MessageCornice] could not find the message-sending module - Discord's internals may have changed");
      return;
    }
    unpatch = (0, import_patcher.before)("sendMessage", Messages, (args) => {
      const msg = args[1];
      console.log(
        "[MessageCornice] sendMessage patch fired, enabled =",
        vstorage.enabled,
        "content =",
        msg?.content
      );
      if (!vstorage.enabled) {
        console.log("[MessageCornice] skipped: 'enabled' setting is OFF");
        return;
      }
      if (!msg?.content?.trim()) {
        console.log("[MessageCornice] skipped: empty/whitespace-only message");
        return;
      }
      msg.content = buildCornice(msg.content);
    });
  }
  function onUnload() {
    unpatch?.();
  }
  var settings = () => {
    (0, import_storage.useProxy)(vstorage);
    return /* @__PURE__ */ React.createElement(import_common.ReactNative.ScrollView, { style: { flex: 1 } }, /* @__PURE__ */ React.createElement(FormSection, { title: "MessageCornice" }, /* @__PURE__ */ React.createElement(
      FormSwitchRow,
      {
        label: "Enabled",
        subLabel: "Wrap outgoing messages in the cornice border",
        value: vstorage.enabled,
        onValueChange: (v) => vstorage.enabled = v
      }
    ), /* @__PURE__ */ React.createElement(FormDivider, null), /* @__PURE__ */ React.createElement(
      FormInput,
      {
        title: "Emoji",
        value: vstorage.emoji,
        onChange: (v) => vstorage.emoji = v
      }
    ), /* @__PURE__ */ React.createElement(
      FormInput,
      {
        title: "Minimum width (emoji units)",
        value: String(vstorage.minWidth),
        keyboardType: "numeric",
        onChange: (v) => vstorage.minWidth = Number(v) || 1
      }
    ), /* @__PURE__ */ React.createElement(
      FormInput,
      {
        title: "Pad character",
        value: vstorage.padSide,
        onChange: (v) => vstorage.padSide = v
      }
    ), /* @__PURE__ */ React.createElement(
      FormInput,
      {
        title: 'Border style ("box" or "ends")',
        value: vstorage.borderStyle,
        onChange: (v) => vstorage.borderStyle = v === "ends" ? "ends" : "box"
      }
    ), /* @__PURE__ */ React.createElement(FormDivider, null), /* @__PURE__ */ React.createElement(
      FormSwitchRow,
      {
        label: "Debug logging",
        subLabel: "Log what the plugin is doing to the console",
        value: vstorage.debugLogging,
        onValueChange: (v) => vstorage.debugLogging = v
      }
    )));
  };
})();
