// UMD版のReactはグローバル変数 `React` として利用可能
window.useState = React.useState;
window.useEffect = React.useEffect;
window.useMemo = React.useMemo;
window.useRef = React.useRef;

// Lucideアイコンの展開
// unpkgのlucide-reactは `lucide` または `lucideReact` というグローバル変数を作成します
// バージョンによって異なる場合があるため、チェックして展開します
const Icons = window.lucideReact || window.lucide;

if (Icons) {
  const iconList = [
    "Users", "Layers", "Settings", "RefreshCw", "Star", "Heart", "ArrowRight", "ArrowLeft",
    "CheckCircle", "X", "Zap", "Award", "Smile", "Sparkles", "ThumbsUp", "Lock", "Unlock",
    "Edit3", "Lightbulb", "Download", "LogOut", "Upload", "Database", "AlertCircle", "Eye",
    "Trash2", "ToggleLeft", "ToggleRight", "BarChart2", "Move"
  ];

  iconList.forEach(name => {
    if (Icons[name]) {
      window[name] = Icons[name];
    }
  });
} else {
  console.error("Lucide Icons not loaded properly");
}
