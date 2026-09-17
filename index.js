(() => {
  // NOTE: this sandbox does not provide a real require(). @vendetta/* modules
  // and React come in as nested properties on the `vendetta` object the
  // loader hands to this file.
  var { findByProps } = vendetta.metro;
  var { ReactNative, React } = vendetta.metro.common;
  var { before } = vendetta.patcher;
  var vstorage = vendetta.plugin.storage;
  var { useProxy } = vendetta.storage;
  var { Forms } = vendetta.ui.components;
  var { FormSwitchRow, FormInput, FormSection, FormDivider } = Forms;

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
    const Messages = findByProps("sendMessage", "editMessage");
    if (!Messages) {
      console.log("[MessageCornice] could not find the message-sending module - Discord's internals may have changed");
      return;
    }
    unpatch = before("sendMessage", Messages, (args) => {
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
    useProxy(vstorage);
    return React.createElement(ReactNative.ScrollView, { style: { flex: 1 } }, React.createElement(FormSection, { title: "MessageCornice" }, React.createElement(
      FormSwitchRow,
      {
        label: "Enabled",
        subLabel: "Wrap outgoing messages in the cornice border",
        value: vstorage.enabled,
        onValueChange: (v) => vstorage.enabled = v
      }
    ), React.createElement(FormDivider, null), React.createElement(
      FormInput,
      {
        title: "Emoji",
        value: vstorage.emoji,
        onChange: (v) => vstorage.emoji = v
      }
    ), React.createElement(
      FormInput,
      {
        title: "Minimum width (emoji units)",
        value: String(vstorage.minWidth),
        keyboardType: "numeric",
        onChange: (v) => vstorage.minWidth = Number(v) || 1
      }
    ), React.createElement(
      FormInput,
      {
        title: "Pad character",
        value: vstorage.padSide,
        onChange: (v) => vstorage.padSide = v
      }
    ), React.createElement(
      FormInput,
      {
        title: 'Border style ("box" or "ends")',
        value: vstorage.borderStyle,
        onChange: (v) => vstorage.borderStyle = v === "ends" ? "ends" : "box"
      }
    ), React.createElement(FormDivider, null), React.createElement(
      FormSwitchRow,
      {
        label: "Debug logging",
        subLabel: "Log what the plugin is doing to the console",
        value: vstorage.debugLogging,
        onValueChange: (v) => vstorage.debugLogging = v
      }
    )));
  };

  return { onLoad, onUnload, settings };
})();
