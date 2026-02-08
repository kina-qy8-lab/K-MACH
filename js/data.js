window.CATEGORIES = [
  // 自然科学分野
  { id: "NAT_MAT", group: "自然科学分野", name: "物質・材料", color: "from-blue-500 to-cyan-400" },
  { id: "NAT_BIO", group: "自然科学分野", name: "生命・生物", color: "from-green-500 to-emerald-400" },
  { id: "NAT_EAR", group: "自然科学分野", name: "地球・環境", color: "from-teal-500 to-green-400" },
  { id: "NAT_PHY", group: "自然科学分野", name: "物理・工学", color: "from-indigo-500 to-blue-400" },
  { id: "NAT_INF", group: "自然科学分野", name: "数理・情報", color: "from-violet-500 to-purple-400" },

  // 社会科学分野
  { id: "SOC_ECO", group: "社会科学分野", name: "経済・産業", color: "from-orange-500 to-amber-400" },
  { id: "SOC_PUB", group: "社会科学分野", name: "政策・行政・公共", color: "from-red-500 to-rose-400" },
  { id: "SOC_EDU", group: "社会科学分野", name: "教育・心理", color: "from-pink-500 to-rose-400" },
  { id: "SOC_SOC", group: "社会科学分野", name: "社会・文化", color: "from-fuchsia-500 to-pink-400" },
  { id: "SOC_INT", group: "社会科学分野", name: "国際・地理", color: "from-yellow-500 to-orange-400" },

  // 人文科学分野
  { id: "HUM_HIS", group: "人文科学分野", name: "歴史・地域史", color: "from-amber-600 to-yellow-500" },
  { id: "HUM_LNG", group: "人文科学分野", name: "言語・コミュニケーション", color: "from-cyan-600 to-blue-500" },
  { id: "HUM_LIT", group: "人文科学分野", name: "文学・物語", color: "from-emerald-600 to-teal-500" },
  { id: "HUM_PHL", group: "人文科学分野", name: "哲学・倫理", color: "from-indigo-600 to-violet-500" },
  { id: "HUM_ART", group: "人文科学分野", name: "芸術・デザイン", color: "from-rose-600 to-pink-500" }
];

window.EMPTY_CATEGORY_META = { id: "", group: "", name: "", color: "from-gray-400 to-gray-300" };
window.getCategoryMeta = (catId) => window.CATEGORIES.find(c => c.id === catId) || window.EMPTY_CATEGORY_META;

window.TOPIC_TAGS = [
  { id: "T01", name: "力学（身体の動き/スポーツ科学）" }, { id: "T02", name: "力学（構造/滑空/浮力）" },
  { id: "T03", name: "地震・防災" }, { id: "T04", name: "建築" }, { id: "T05", name: "紙飛行機" },
  { id: "T06", name: "スポーツ（フォーム/動作/戦術）" }, { id: "T07", name: "スポーツ（ケガ/道具）" },
  { id: "T08", name: "モータースポーツ" }, { id: "T09", name: "音・色" },
  { id: "T10", name: "物質（成分/効果/材料）" }, { id: "T11", name: "薬" },
  { id: "T12", name: "化粧品" }, { id: "T13", name: "環境（光害/CO2）" },
  { id: "T14", name: "食品（成分/分析）" }, { id: "T15", name: "植物（生育/土壌）" },
  { id: "T16", name: "生物（昆虫/微生物/外来種）" }, { id: "T17", name: "微生物（発酵/培養）" },
  { id: "T18", name: "タンパク質酵素" }, { id: "T19", name: "宇宙・天文" },
  { id: "T20", name: "天気" }, { id: "T21", name: "海" }, { id: "T22", name: "ヒートアイランド" },
  { id: "T23", name: "定義・法則・数式" }, { id: "T24", name: "解析（画像/音声/動画）" },
  { id: "T25", name: "シミュレーション" }, { id: "T26", name: "統計・データ" },
  { id: "T27", name: "教育×ICT" }, { id: "T28", name: "AI・生成AI" },
  { id: "T29", name: "株・為替" }, { id: "T30", name: "SDGs" }, { id: "T31", name: "安全保障" }, { id: "T32", name: "国際情勢" },
  { id: "T33", name: "文化と社会" }, { id: "T34", name: "法律・校則" }, { id: "T35", name: "地域の特色" },
  { id: "T36", name: "経済活動" }, { id: "T37", name: "環境と満足度" }, { id: "T38", name: "映画・芸術" },
  { id: "T39", name: "価格と価値" }, { id: "T40", name: "効率化" }, { id: "T41", name: "行動心理" },
  { id: "T42", name: "観光" }, { id: "T43", name: "認知バイアス" }, { id: "T44", name: "マーケティング" },
  { id: "T45", name: "子ども" }, { id: "T46", name: "SNS・ネット" }, { id: "T47", name: "メディア" },
  { id: "T48", name: "嘘・フェイク" },
  { id: "T49", name: "学習効果" }, { id: "T50", name: "色彩心理" },
  { id: "T51", name: "睡眠・健康" }, { id: "T52", name: "ストレス" }, { id: "T53", name: "モチベーション" },
  { id: "T54", name: "デザイン" }, { id: "T55", name: "写真・映像" }, { id: "T56", name: "歴史・背景" },
  { id: "T57", name: "言語・方言" }
];

window.APPROACH_TAGS = [
  { id: "A01", name: "文献調査", icon: "📚" }, { id: "A02", name: "公開データ", icon: "📊" },
  { id: "A03", name: "アンケート", icon: "📝" }, { id: "A04", name: "インタビュー", icon: "🎤" },
  { id: "A05", name: "行動観察", icon: "👀" }, { id: "A06", name: "実験", icon: "⚗️" },
  { id: "A07", name: "計測", icon: "⏱️" }, { id: "A08", name: "画像動画解析", icon: "🎥" },
  { id: "A09", name: "テキスト分析", icon: "💬" }, { id: "A10", name: "統計解析", icon: "📈" },
  { id: "A11", name: "開発", icon: "💻" }, { id: "A12", name: "シミュレーション", icon: "🎮" },
  { id: "A13", name: "モノづくり", icon: "🛠️" }
];

window.SKILLS = ["データ分析", "統計処理", "プログラミング", "英語文献読解", "実験手技", "工作・DIY", "デザイン", "動画編集", "リーダーシップ", "プレゼン"];

window.CAT_NEIGHBORS = {
  NAT_PHY: ["NAT_INF", "NAT_MAT"], NAT_INF: ["NAT_PHY"], NAT_MAT: ["NAT_PHY", "NAT_EAR"], NAT_BIO: ["NAT_EAR"], NAT_EAR: ["NAT_BIO", "NAT_MAT"],
  SOC_ECO: ["SOC_PUB", "SOC_SOC"], SOC_PUB: ["SOC_ECO", "SOC_INT"], SOC_SOC: ["SOC_EDU", "SOC_ECO"], SOC_EDU: ["SOC_SOC"], SOC_INT: ["SOC_PUB"],
  HUM_LNG: ["HUM_LIT"], HUM_LIT: ["HUM_LNG", "HUM_ART"], HUM_ART: ["HUM_LIT"], HUM_HIS: ["HUM_PHL"], HUM_PHL: ["HUM_HIS"]
};

window.MOCK_THEMES = ["未利用魚を活用した新商品開発", "学校内のプラゴミ削減", "AI古文解読アプリ", "伝統工芸のリブランディング", "植物由来代替肉の研究", "避難経路シミュレーション"];
window.PHASE = { INPUT: "INPUT", CHECK: "CHECK", MATCHING: "MATCHING", PUBLISH: "PUBLISH" };
window.CLASS_LIST = Array.from({ length: 9 }, (_, i) => i + 1);
window.STUDENT_NUMBERS = Array.from({ length: 40 }, (_, i) => i + 1);

window.getTagStyle = (id, isSelected = false) => {
  const num = parseInt(id.substring(1));
  if (num <= 28) return isSelected ? "bg-blue-600 border-blue-600 text-white" : "bg-blue-50 border-blue-300 text-blue-800 hover:bg-blue-100";
  if (num <= 48) return isSelected ? "bg-orange-500 border-orange-500 text-white" : "bg-orange-50 border-orange-300 text-orange-800 hover:bg-orange-100";
  return isSelected ? "bg-rose-500 border-rose-500 text-white" : "bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100";
};
