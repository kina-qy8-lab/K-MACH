const DataImporter = ({ onImport }) => {
  const [text, setText] = useState("");

  const handleImport = () => {
    const rows = text.trim().split("\n");
    const data = [];
    rows.forEach((row, idx) => {
      const cols = row.split(",").map(c => c.trim());
      if (cols.length >= 4) {
        const first = (cols[0] || "").toLowerCase();
        if (idx === 0 && (first.includes("email") || cols[0] === "メールアドレス")) return;
        const classId = parseInt(cols[1]);
        const studentNumber = parseInt(cols[2]);
        if (!isNaN(classId) && !isNaN(studentNumber)) {
          data.push({
            id: cols[0], email: cols[0], classId: classId, studentNumber: studentNumber,
            name: cols[3], category: cols[4] || "", theme: cols[5] || "", role: cols[6] || "student"
          });
        }
      }
    });
    if (data.length === 0) { alert("データが見つかりませんでした。フォーマットを確認してください。"); return; }
    onImport(data);
    setText("");
  };

  return (
    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 mt-4">
      <h3 className="font-bold text-gray-300 mb-2 flex items-center gap-2"><window.Upload size={16} /> 生徒データ一括登録 (CSV)</h3>
      <p className="text-xs text-gray-500 mb-2">Format: email, class, number, name, categoryID, theme, role</p>
      <textarea className="w-full h-32 bg-gray-900 text-xs font-mono text-green-400 p-2 rounded border border-gray-600 mb-2" placeholder="student1@example.com, 1, 1, 山田太郎, NAT_MAT, 研究テーマ, student" value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={handleImport} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-xs font-bold w-full">登録を実行 (上書き更新)</button>
    </div>
  );
};

const TeacherPanel = ({ phase, studentCount, handleMatching, handlePublish, reset, onExport, onImportData, students, onDeleteStudent, onDeleteAll, isDemoMode, setIsDemoMode, onGenerateDemo, onSelectStudent }) => {
  const updatePhase = async (newPhase) => { await window.db.collection("system").doc("config").set({ phase: newPhase }, { merge: true }); };

  return (
    <div className="bg-gray-900 text-white p-4 shadow-inner">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <div><h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Control Panel</h2><div className="text-2xl font-bold flex items-center gap-3"><span>登録者数: {studentCount}名</span></div></div>
          <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-lg border border-gray-700">
            <button onClick={() => setIsDemoMode(!isDemoMode)} className="flex items-center gap-2 text-xs font-bold px-2">{isDemoMode ? <window.ToggleRight size={24} className="text-green-400" /> : <window.ToggleLeft size={24} className="text-gray-500" />} Demo Mode</button>
            {isDemoMode && phase === window.PHASE.INPUT && (<button onClick={onGenerateDemo} className="bg-gray-700 hover:bg-gray-600 text-xs px-3 py-1 rounded border border-gray-600 flex items-center gap-1"><window.Database size={12} /> +50 Mock</button>)}
          </div>
          <div className="flex gap-2">
            {phase === window.PHASE.INPUT && (<button onClick={() => updatePhase(window.PHASE.CHECK)} className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition flex items-center gap-2">入力締切 → チェックへ <window.ArrowRight size={18} /></button>)}
            {phase === window.PHASE.CHECK && (<><button onClick={() => updatePhase(window.PHASE.INPUT)} className="bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-xl font-bold transition flex items-center gap-2"><window.ArrowLeft size={18} /> 戻る</button><button onClick={handleMatching} className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition flex items-center gap-2"><window.Layers size={18} /> マッチング実行</button></>)}
            {phase === window.PHASE.MATCHING && (<><button onClick={() => updatePhase(window.PHASE.CHECK)} className="bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-xl font-bold transition flex items-center gap-2"><window.ArrowLeft size={18} /> 戻る</button><button onClick={handleMatching} className="bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-xl font-bold transition flex items-center gap-2"><window.RefreshCw size={18} /> 再生成</button><button onClick={handlePublish} className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition flex items-center gap-2"><window.Star size={18} fill="white" /> 公開する</button></>)}
            {phase === window.PHASE.PUBLISH && (<><button onClick={() => updatePhase(window.PHASE.MATCHING)} className="bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-xl font-bold transition flex items-center gap-2"><window.ArrowLeft size={18} /> 戻る</button><button onClick={onExport} className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-bold shadow-lg transition flex items-center gap-2"><window.Download size={18} /> CSV出力</button><div className="flex flex-col gap-1"><button onClick={reset} className="border border-red-500/50 text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg font-bold text-xs transition">リセット</button><button onClick={onDeleteAll} className="bg-red-900/30 text-red-500 hover:bg-red-900/50 px-4 py-1 rounded-lg font-bold text-[10px] transition border border-red-900">全データ削除</button></div></>)}
          </div>
        </div>
        {phase === window.PHASE.INPUT && <window.DataImporter onImport={onImportData} />}
        {(phase === window.PHASE.INPUT || phase === window.PHASE.CHECK) && <window.RosterStatus students={students} onSelectStudent={onSelectStudent} phase={phase} />}
      </div>
    </div>
  );
};

window.DataImporter = DataImporter;
window.TeacherPanel = TeacherPanel;
