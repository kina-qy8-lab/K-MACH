const App = () => {
  const [user, setUser] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [students, setStudents] = useState([]);
  const [phase, setPhase] = useState(window.PHASE.INPUT);
  const [groups, setGroups] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [moveTargetGroup, setMoveTargetGroup] = useState("");
  const [pendingVotes, setPendingVotes] = useState({});
  const [pendingLoaded, setPendingLoaded] = useState(false);
  const [isFlushingVotes, setIsFlushingVotes] = useState(false);

  const NEW_TEAM_VALUE = "__NEW_TEAM__";

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("Auto reloading...");
      window.location.reload();
    }, 3600000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = window.auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setCurrentUserData(null);
      return;
    }
    const unsubUser = window.db.collection("users").doc(user.email).onSnapshot((docSnap) => {
      if (docSnap.exists) {
        setCurrentUserData(docSnap.data());
      } else {
        setErrorMsg("このアカウントは登録されていません。管理者に問い合わせてください。");
        window.auth.signOut();
      }
    }, (error) => {
      console.error("User listener error:", error);
    });
    return () => unsubUser();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsubSystem = window.db.collection("system").doc("config").onSnapshot((docSnap) => {
      if (docSnap.exists) setPhase(docSnap.data().phase || window.PHASE.INPUT);
    });
    const unsubStudents = window.db.collection("users").onSnapshot((snapshot) => {
      const loadedStudents = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(u => u.role !== "teacher" && u.role !== "admin");
      setStudents(loadedStudents);
    });
    const unsubGroups = window.db.collection("system").doc("groups").onSnapshot((docSnap) => {
      if (docSnap.exists) {
        const rawList = docSnap.data().list || [];
        const formattedGroups = rawList.map(item => Array.isArray(item) ? { members: item, metrics: {} } : item);
        setGroups(formattedGroups);
      } else {
        setGroups([]);
      }
    });
    return () => { unsubSystem(); unsubStudents(); unsubGroups(); };
  }, [user]);

  useEffect(() => {
    if (!user) { setPendingVotes({}); setPendingLoaded(false); return; }
    setPendingLoaded(false);
    try {
      const key = `kmatch_pendingVotes_${user.email}`;
      const raw = localStorage.getItem(key);
      setPendingVotes(raw ? (JSON.parse(raw) || {}) : {});
    } catch (e) {
      setPendingVotes({});
    } finally {
      setPendingLoaded(true);
    }
  }, [user?.email]);

  const handleLogin = async () => {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      await window.auth.signInWithPopup(provider);
      setErrorMsg("");
    } catch (error) {
      console.error(error);
      if (error.code === "auth/unauthorized-domain") setErrorMsg(`【設定エラー】このドメイン (${window.location.hostname}) はFirebaseで許可されていません。Firebaseコンソールの Authentication > 設定 > 承認済みドメイン にこのドメインを追加してください。`);
      else if (error.code === "auth/api-key-not-valid" || String(error.message).includes("api-key-not-valid")) setErrorMsg("【設定エラー】APIキーが正しくありません。index.html内の firebaseConfig を、Firebaseコンソールからコピーした本物の値に書き換えてください。");
      else if (error.code === "auth/popup-closed-by-user") setErrorMsg("ログイン操作がキャンセルされました。");
      else setErrorMsg("ログインに失敗しました: " + error.message);
    }
  };

  const handleLogout = () => window.auth.signOut();

  const handleSaveProfile = async (data) => {
    if (!user) return;
    if (currentUserData.role === "teacher" || currentUserData.role === "admin") {
      alert("【確認】管理者のため、データは保存されません（プレビューモード）");
      return;
    }
    await window.db.collection("users").doc(user.email).update({ ...data, updatedAt: new Date() });
  };

  const handleVote = async (targetId, selections) => {
    if (!user) return;
    if (currentUserData.role === "teacher" || currentUserData.role === "admin") { console.log("Teacher vote ignored"); return; }
    setPendingVotes(prev => {
      const next = { ...(prev || {}), [targetId]: selections };
      try {
        const key = `kmatch_pendingVotes_${user.email}`;
        localStorage.setItem(key, JSON.stringify(next));
      } catch (e) { }
      return next;
    });
  };

  useEffect(() => {
    if (!user || !currentUserData) return;
    if (phase !== window.PHASE.CHECK) return;
    if (currentUserData.role === "teacher" || currentUserData.role === "admin") return;
    if (isFlushingVotes) return;
    const baseCount = Object.keys(currentUserData.votes || {}).length;
    const pendingCount = Object.keys(pendingVotes || {}).length;
    if (pendingCount === 0) return;
    if (baseCount + pendingCount < 30) return;
    (async () => {
      setIsFlushingVotes(true);
      try {
        const userRef = window.db.collection("users").doc(user.email);
        await userRef.set({ votes: pendingVotes, updatedAt: new Date() }, { merge: true });
        setPendingVotes({});
        try {
          const key = `kmatch_pendingVotes_${user.email}`;
          localStorage.removeItem(key);
        } catch (e) { }
      } catch (e) {
        console.error("Flush votes error:", e);
        alert("投票データのまとめ保存に失敗しました。通信状況を確認して再度お試しください。");
      } finally {
        setIsFlushingVotes(false);
      }
    })();
  }, [pendingVotes, phase, user, currentUserData, isFlushingVotes]);

  const handleGenerateMock = () => {
    const mocks = window.generateMockStudents(50);
    const batch = window.db.batch();
    mocks.forEach(data => {
      const ref = window.db.collection("users").doc(`mock_${data.id}`);
      batch.set(ref, { ...data, email: `mock_${data.id}@example.com` });
    });
    batch.commit().then(() => alert("デモデータ50件を追加しました"));
  };

  const handleImportData = async (dataList) => {
    const batch = window.db.batch();
    dataList.forEach(data => {
      const ref = window.db.collection("users").doc(data.email);
      batch.set(ref, data, { merge: true });
    });
    await batch.commit();
    alert(`${dataList.length}件のデータを登録しました。既存の生徒入力データは保持されます。`);
  };

  const handleDeleteStudent = async (studentId) => {
    if (!confirm("本当にこの生徒を削除しますか？この操作は取り消せません。")) return;
    await window.db.collection("users").doc(studentId).delete();
  };

  const handleDeleteAll = async () => {
    if (!confirm("【警告】全生徒データを削除しますか？\nCSVによる再登録が必要になります。\n本当によろしいですか？")) return;
    if (!confirm("最終確認：本当に削除しますか？")) return;
    const batch = window.db.batch();
    students.forEach(s => { batch.delete(window.db.collection("users").doc(s.id)); });
    await batch.commit();
    alert("全データを削除しました。");
  };

  const handleUpdateCategory = async (studentId, newCategory) => {
    await window.db.collection("users").doc(studentId).update({ category: newCategory });
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, category: newCategory } : s));
  };

  const handleMoveStudent = async (studentId, targetGroupIdx) => {
    if (targetGroupIdx === "") return;
    let idx = null;
    const newGroups = [...groups].map(g => Array.isArray(g)
      ? [...g]
      : ({ ...g, members: [...(g.members || [])], metrics: { ...(g.metrics || {}) } })
    );
    if (targetGroupIdx === NEW_TEAM_VALUE) {
      newGroups.push({ members: [], metrics: {} });
      idx = newGroups.length - 1;
    } else {
      idx = parseInt(targetGroupIdx);
    }
    if (isNaN(idx) || idx < 0 || idx >= newGroups.length) return;
    const targetGroup = (newGroups[idx].members || newGroups[idx]);
    const student = students.find(s => s.id === studentId);
    const isCompatible = targetGroup.every(mid => {
      const m = students.find(s => s.id === mid);
      return window.isSameField(m?.category, student?.category);
    });
    if (!isCompatible && !confirm("【警告】移動先のチームとは「分野」が異なります！\n基本ルールでは禁止されていますが、強制的に移動しますか？")) {
      return;
    }
    newGroups.forEach(g => {
      if (Array.isArray(g)) {
        const i = g.indexOf(studentId);
        if (i !== -1) g.splice(i, 1);
      } else {
        const i = (g.members || []).indexOf(studentId);
        if (i !== -1) g.members.splice(i, 1);
      }
    });
    if (Array.isArray(newGroups[idx])) newGroups[idx].push(studentId);
    else newGroups[idx].members.push(studentId);
    const allVotes = {};
    students.forEach(s => { if (s.votes) allVotes[s.id] = s.votes; });
    const updatedFirestoreData = newGroups.map(g => {
      const members = Array.isArray(g) ? g : g.members;
      const memberObjs = members.map(mid => students.find(s => s.id === mid)).filter(Boolean);
      const metrics = window.calculateTeamMetrics(memberObjs, students, allVotes);
      return { members, metrics };
    });
    await window.db.collection("system").doc("groups").set({ list: updatedFirestoreData });
    setMoveTargetGroup("");
    setSelectedStudent(null);
    alert("移動完了。チームスコアを再計算しました。");
  };

  const handleMatching = async () => {
    await window.db.collection("system").doc("config").set({ phase: window.PHASE.MATCHING }, { merge: true });
    const allVotes = {};
    students.forEach(s => { if (s.votes) allVotes[s.id] = s.votes; });
    const result = window.runWeightedMatchingAlgorithm(students, allVotes);
    const firestoreData = result.map(group => {
      const members = group;
      const memberObjs = members.map(mid => students.find(s => s.id === mid)).filter(Boolean);
      const metrics = window.calculateTeamMetrics(memberObjs, students, allVotes);
      return { members, metrics };
    });
    await window.db.collection("system").doc("groups").set({ list: firestoreData });
  };

  const handlePublish = async () => { await window.db.collection("system").doc("config").set({ phase: window.PHASE.PUBLISH }, { merge: true }); };

  const handleReset = async () => {
    if (!confirm("本当にリセットしますか？")) return;
    await window.db.collection("system").doc("config").set({ phase: window.PHASE.INPUT }, { merge: true });
    await window.db.collection("system").doc("groups").set({ list: [] });
  };

  const handleExportCSV = () => {
    const studentHeaders = ["Team ID", "Class", "Number", "Name", "Email", "Category", "Theme", "Topics", "Approaches", "Skills", "Comment"];
    const teamHeaders = ["", "", "Team ID (List)", "Member Emails", "Team Score", "Mutual Pairs", "Connection Score", "Interest Score", "Diversity Score"];
    const studentRows = [];
    const teamRows = [];
    groups.forEach((groupData, groupIdx) => {
      const teamName = `TEAM ${groupIdx + 1}`;
      const groupMembers = groupData.members || groupData;
      const metrics = groupData.metrics || {};
      const teamEmails = groupMembers.map(sid => {
        const s = students.find(st => st.id === sid);
        return s ? s.email : "";
      }).filter(e => e).join(", ");
      teamRows.push([
        teamName, `"${teamEmails}"`, metrics.score || 0, metrics.mutualPairs || 0, metrics.connection || 0, metrics.interest || 0, metrics.diversity || 0
      ]);
      groupMembers.forEach(studentId => {
        const student = students.find(s => s.id === studentId);
        if (student) {
          const catName = window.CATEGORIES.find(c => c.id === student.category)?.name || "";
          const topicNames = (student.topics || []).map(tid => window.TOPIC_TAGS.find(t => t.id === tid)?.name).join("|");
          const approachNames = (student.approaches || []).map(aid => window.APPROACH_TAGS.find(a => a.id === aid)?.name).join("|");
          const skillNames = (student.skills || []).join("|");
          studentRows.push([
            teamName, student.classId, student.studentNumber, student.name, student.email, catName, `"${student.theme || ""}"`, `"${topicNames}"`, `"${approachNames}"`, `"${skillNames}"`, `"${student.comment || ""}"`
          ]);
        }
      });
    });
    const maxRows = Math.max(studentRows.length, teamRows.length);
    const combinedRows = [];
    combinedRows.push([...studentHeaders, ...teamHeaders].join(","));
    for (let i = 0; i < maxRows; i++) {
      const left = studentRows[i] ? studentRows[i].join(",") : new Array(studentHeaders.length).fill("").join(",");
      const rightData = teamRows[i] ? teamRows[i].join(",") : ",";
      const right = teamRows[i] ? `, ,${rightData}` : ", , , , , , ,";
      combinedRows.push(`${left}${right}`);
    }
    const csvContent = combinedRows.join("\n");
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "teams_and_emails.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) return <window.LoginScreen onLogin={handleLogin} />;
  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200 text-center">
          <AlertCircle className="mx-auto mb-2" />{errorMsg}
        </div>
      </div>
    );
  }
  if (!currentUserData) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const isTeacher = currentUserData.role === "teacher" || currentUserData.role === "admin";
  const mergedVotesForCheck = { ...(currentUserData.votes || {}), ...(pendingVotes || {}) };
  const currentUserForCheck = (phase === window.PHASE.CHECK)
    ? ({ ...currentUserData, votes: mergedVotesForCheck })
    : currentUserData;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 selection:bg-blue-200">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-blue-500 to-purple-500 text-white p-2 rounded-xl shadow-lg"><Sparkles size={20} fill="white" /></div>
            <div><h1 className="font-bold text-gray-800 leading-tight">K-MATCH</h1></div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-3 py-1 bg-gray-100 rounded-full text-gray-600">{phase}</span>
            <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600"><LogOut size={20} /></button>
          </div>
        </div>
      </header>

      {isTeacher && (
        <window.TeacherPanel
          phase={phase} students={students} studentCount={students.length} handleMatching={handleMatching} handlePublish={handlePublish} onExport={handleExportCSV} reset={handleReset} onImportData={handleImportData} onDeleteStudent={handleDeleteStudent} onDeleteAll={handleDeleteAll} isDemoMode={isDemoMode} setIsDemoMode={setIsDemoMode} onGenerateDemo={handleGenerateMock} onSelectStudent={setSelectedStudent}
        />
      )}

      <main>
        {((!isTeacher) || (isTeacher && phase !== window.PHASE.MATCHING && phase !== window.PHASE.PUBLISH)) && (
          <div className={isTeacher ? "border-4 border-green-500 rounded-xl m-4 relative overflow-hidden bg-gray-100" : ""}>
            {isTeacher && (<div className="absolute top-0 left-0 bg-green-500 text-white px-3 py-1 text-xs font-bold rounded-br-xl z-50 flex items-center gap-1"><Eye size={12} /> 生徒画面プレビュー (操作無効)</div>)}
            {phase === window.PHASE.INPUT && <window.ModernInputForm currentUser={currentUserData} onSave={handleSaveProfile} />}
            {phase === window.PHASE.CHECK && ((!pendingLoaded && !isTeacher) ? <div className="min-h-[60vh] flex items-center justify-center text-gray-500">Loading...</div> : <window.CardStack currentUser={currentUserForCheck} students={students} onVote={handleVote} />)}
          </div>
        )}

        {!isTeacher && (phase === window.PHASE.MATCHING || phase === window.PHASE.PUBLISH) && (
          <window.ModernResultView currentUser={currentUserData} students={students} groups={groups} isPublished={phase === window.PHASE.PUBLISH} />
        )}

        {isTeacher && (phase === window.PHASE.MATCHING || phase === window.PHASE.PUBLISH) && (
          <div className="max-w-6xl mx-auto p-8 border-t border-gray-200 mt-8">
            <h3 className="font-black text-2xl mb-6 text-gray-800">全チーム一覧 (管理者用)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((groupData, idx) => {
                const group = groupData.members || groupData;
                const metrics = groupData.metrics || {};
                return (
                  <div key={idx} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-gray-100 px-3 py-1 rounded-bl-xl text-xs font-bold text-gray-500 flex items-center gap-2"><span>Score: {metrics.score}</span>{metrics.mutualPairs > 0 && <span className="text-pink-500 flex items-center gap-0.5"><Heart size={10} fill="currentColor" />{metrics.mutualPairs}</span>}</div>
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100"><h4 className="font-bold text-gray-700">TEAM {idx + 1}</h4><span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-md">{group.length} Members</span></div>
                    <ul className="space-y-3">{group.map(sid => { const s = students.find(st => st.id === sid); const cat = window.getCategoryMeta(s?.category); return (<li key={sid} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 rounded transition" onClick={() => setSelectedStudent(s)}><div className={`w-8 h-8 rounded-full bg-gradient-to-br ${cat?.color} flex items-center justify-center text-white text-xs font-bold`}>{s?.name?.charAt(0) || "?"}</div><div><div className="font-bold text-sm text-gray-800">{s?.name}</div><div className="text-[10px] text-gray-400">{cat?.name}</div></div></li>); })}</ul>
                    <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between text-[10px] text-gray-400"><div title="結束力">Con: {metrics.connection}</div><div title="共通関心">Int: {metrics.interest}</div><div title="多様性">Div: {metrics.diversity}</div><div title="カテゴリ純度 (dominant/size)">Pur: {metrics.purity}</div><div title="カテゴリ距離平均 (0が理想)">d̄: {metrics.avgCatDistance}</div>{metrics.crossFieldPairs > 0 && <div title="別分野ペア数" className="text-red-500 font-bold">XField: {metrics.crossFieldPairs}</div>}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedStudent(null)}>
          <div className="bg-white text-gray-800 p-6 rounded-2xl shadow-xl max-w-sm w-full overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-2">{selectedStudent.classId}組 {selectedStudent.studentNumber}番</h3>
            <div className="text-xl font-bold mb-4">{selectedStudent.name}</div>
            <div className="text-sm text-gray-500 mb-4 font-mono bg-gray-100 p-2 rounded">{selectedStudent.email}</div>
            <div className="text-sm mb-6 space-y-2">
              <div><strong>カテゴリー:</strong>{isTeacher ? (<select className="ml-2 border border-gray-300 rounded p-1 text-xs" value={selectedStudent.category || ""} onChange={(e) => handleUpdateCategory(selectedStudent.id, e.target.value)}><option value="">（空欄）</option>{window.CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.group} : {c.name}</option>)}</select>) : (<span className="ml-2">{window.CATEGORIES.find(c => c.id === selectedStudent.category)?.name || selectedStudent.category}</span>)}</div>
              <p><strong>テーマ:</strong> {selectedStudent.theme}</p>
              <div className="bg-gray-50 p-2 rounded text-xs text-gray-600 mt-2"><div className="mb-1 font-bold">Topics:</div><div className="flex flex-wrap gap-1 mb-2">{selectedStudent.topics?.map(tid => <span key={tid} className="bg-white border px-1 rounded">{window.TOPIC_TAGS.find(t => t.id === tid)?.name}</span>)}</div><div className="mb-1 font-bold">Skills:</div><div className="flex flex-wrap gap-1">{selectedStudent.skills?.map(s => <span key={s} className="bg-white border px-1 rounded">{s}</span>)}</div></div>
              {phase === window.PHASE.CHECK && (<p className="mt-2 pt-2 border-t text-green-600 font-bold">チェック進捗: {selectedStudent.votes ? Object.keys(selectedStudent.votes).length : 0} / 30 件</p>)}
            </div>
            {isTeacher && (phase === window.PHASE.MATCHING || phase === window.PHASE.PUBLISH) && (
              <div className="mb-6 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <label className="block text-xs font-bold text-blue-700 mb-1 flex items-center gap-1"><Move size={12} /> チーム移動調整</label>
                <div className="flex gap-2">
                  <select className="flex-1 text-xs border border-gray-300 rounded p-2" value={moveTargetGroup} onChange={(e) => setMoveTargetGroup(e.target.value)}><option value="">移動先を選択...</option><option value={NEW_TEAM_VALUE}>＋ 新しいTEAMを作成して移動</option>{groups.map((g, idx) => { const mems = g.members || g; return <option key={idx} value={idx}>TEAM {idx + 1} ({mems.length}名)</option>; })}</select>
                  <button onClick={() => handleMoveStudent(selectedStudent.id, moveTargetGroup)} disabled={moveTargetGroup === ""} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded disabled:opacity-50">移動</button>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              {(phase === window.PHASE.INPUT || phase === window.PHASE.CHECK) && (<button onClick={() => { handleDeleteStudent(selectedStudent.id); setSelectedStudent(null); }} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"><Trash2 size={18} /> 登録抹消</button>)}
              <button onClick={() => setSelectedStudent(null)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-bold">閉じる</button>
            </div>
          </div>
        </div>
      )}

      <footer className="py-6 text-center text-gray-300 text-xs font-bold uppercase tracking-widest">
        Quest Learning Matcher v2.0
      </footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
