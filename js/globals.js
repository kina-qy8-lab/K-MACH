import React, { useState, useEffect, useMemo, useRef } from "react";
import * as LucideIcons from "lucide-react";

// Reactの機能をグローバル変数として公開（他のファイルから使えるようにする）
window.React = React;
window.useState = useState;
window.useEffect = useEffect;
window.useMemo = useMemo;
window.useRef = useRef;

// Lucideアイコンをグローバルに展開
// 必要なアイコンを全てwindowオブジェクトに登録
const iconList = [
  "Users", "Layers", "Settings", "RefreshCw", "Star", "Heart", "ArrowRight", "ArrowLeft",
  "CheckCircle", "X", "Zap", "Award", "Smile", "Sparkles", "ThumbsUp", "Lock", "Unlock",
  "Edit3", "Lightbulb", "Download", "LogOut", "Upload", "Database", "AlertCircle", "Eye",
  "Trash2", "ToggleLeft", "ToggleRight", "BarChart2", "Move"
];

iconList.forEach(name => {
  if (LucideIcons[name]) {
    window[name] = LucideIcons[name];
  } else {
    console.warn(`Icon ${name} not found in lucide-react`);
  }
});
