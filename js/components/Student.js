const ModernInputForm = ({ currentUser, onSave }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({ classId: 1, studentNumber: 1, name: "", category: "", theme: "", topics: [], approaches: [], skills: [], comment: "" });

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({ ...prev, ...currentUser }));
      if (currentUser.comment) setIsSubmitted(true);
    }
  }, [currentUser]);

  const handleSubmit = () => { onSave(formData); setIsSubmitted(true); };

  const toggleSelection = (field, value) => {
    setFormData(prev => {
      const current = prev[field] || [];
      if (current.includes(value)) return { ...prev, [field]: current.filter(v => v !== value) };
      if (field === "topics" && current.length >= 5) return prev;
      return { ...prev, [field]: [...current, value] };
    });
  };

  const currentCategory = window.getCategoryMeta(formData.category);
  const isCategoryLocked = !!currentUser.category;
  const isThemeLocked = !!currentUser.theme;
  const sectionTitleClass = "text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b-2 border-gray-100 pb-2";

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <div className="bg-blue-50 p-6 rounded-full mb-6 animate-pulse"><window.CheckCircle size={64} className="text-blue-500" /></div>
        <h2 className="text-3xl font-black text-gray-800 mb-2">登録完了！</h2>
        <p className="text-gray-500 mb-8">先生からの合図があるまで、このままお待ちください。</p>
        <button onClick={() => setIsSubmitted(false)} className="flex items-center gap-2 text-gray-400 hover:text-gray-600 font-bold transition">
          <window.Edit3 size={16} /> 修正する
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 pb-24">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-gray-800 mb-2">My Profile</h2>
        <p className="text-gray-500">あなたの「得意」や「興味」を教えてください</p>
      </div>

      <div className="space-y-8">
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-gray-100 px-3 py-1 rounded-bl-xl text-xs text-gray-500 font-bold flex items-center gap-1"><window.Lock size={10} /> 固定情報</div>
          <div className="flex gap-4 mb-4">
            <div className="w-1/3">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Class</label>
              <div className="w-full p-3 bg-gray-100 rounded-xl font-bold text-gray-700">{formData.classId}組</div>
            </div>
            <div className="w-1/3">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">No.</label>
              <div className="w-full p-3 bg-gray-100 rounded-xl font-bold text-gray-700">{formData.studentNumber}番</div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Name</label>
            <div className="w-full text-xl font-bold border-b-2 border-gray-200 py-1 bg-transparent text-gray-800">{formData.name}</div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex justify-between">
              Category {isCategoryLocked ? <window.Lock size={12} /> : <window.Unlock size={12} className="text-green-500" />}
            </label>
            {isCategoryLocked ? (
              <div className={`p-3 rounded-xl bg-gradient-to-r ${currentCategory.color} text-white shadow-sm`}>
                <div className="text-[10px] opacity-80">{currentCategory.group}</div>
                <div className="font-bold">{currentCategory.name}</div>
              </div>
            ) : (
              <select className="w-full p-3 bg-gray-50 rounded-xl font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/50" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                <option value="">カテゴリーを選択してください</option>
                {window.CATEGORIES.map(c => (<option key={c.id} value={c.id}>{c.group} : {c.name}</option>))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex justify-between">
              Research Theme {isThemeLocked ? <window.Lock size={12} /> : <window.Unlock size={12} className="text-green-500" />}
            </label>
            {isThemeLocked ? (
              <div className="w-full p-3 bg-gray-100 rounded-xl font-bold text-gray-700 text-sm leading-snug">{formData.theme}</div>
            ) : (
              <textarea className="w-full p-3 bg-gray-50 rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-sm" rows="2"
                value={formData.theme} onChange={(e) => setFormData({ ...formData, theme: e.target.value })} placeholder="現在考えている探究のテーマを入力" />
            )}
          </div>
        </section>

        <section>
          <label className={sectionTitleClass}>
            <window.Sparkles size={20} className="text-purple-500" /> トピックカードを選択（最大5つ）
            <span className="ml-auto text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-full">{(formData.topics || []).length}/5</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {window.TOPIC_TAGS.map(t => (
              <button key={t.id} onClick={() => toggleSelection("topics", t.id)}
                className={`text-xs px-4 py-2 rounded-lg border font-bold transition-all duration-200 ${(formData.topics || []).includes(t.id) ? window.getTagStyle(t.id, true) : window.getTagStyle(t.id, false)}`}>
                {t.name}
              </button>
            ))}
          </div>
        </section>

        <section>
          <label className={sectionTitleClass}><window.Settings size={20} className="text-green-500" /> アプローチ（複数可）</label>
          <div className="flex flex-wrap gap-2">
            {window.APPROACH_TAGS.map(a => (
              <button key={a.id} onClick={() => toggleSelection("approaches", a.id)}
                className={`text-xs px-4 py-2 rounded-lg border font-bold transition-all duration-200 flex items-center gap-2 ${(formData.approaches || []).includes(a.id) ? "bg-green-600 border-green-600 text-white shadow-md transform scale-105" : "bg-white border-gray-200 text-gray-600 hover:border-green-300 hover:bg-gray-50"}`}>
                <span>{a.icon}</span><span>{a.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <label className={sectionTitleClass}><window.Zap size={20} className="text-orange-500" /> スキル（複数可）</label>
          <div className="flex flex-wrap gap-2">
            {window.SKILLS.map(s => (
              <button key={s} onClick={() => toggleSelection("skills", s)}
                className={`text-xs px-4 py-2 rounded-lg border font-bold transition-all duration-200 ${(formData.skills || []).includes(s) ? "bg-purple-600 border-purple-600 text-white shadow-md transform scale-105" : "bg-white border-gray-200 text-gray-600 hover:border-purple-300 hover:bg-gray-50"}`}>
                {s}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <label className={sectionTitleClass}><window.Smile size={20} className="text-pink-500" /> ひとこと</label>
          <textarea className="w-full p-4 bg-gray-50 rounded-2xl text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20" rows="3"
            value={formData.comment} onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            placeholder="特にやりたいこと、こんな人（やる気やスキル）を募集！などを記述。" />
        </section>

        <button onClick={handleSubmit} className="w-full bg-gray-900 text-white font-bold text-lg py-4 rounded-2xl shadow-xl hover:bg-gray-800 hover:scale-[1.02] transition-all">
          プロフィール登録完了
        </button>
      </div>
    </div>
  );
};

const CardStack = ({ currentUser, students, onVote }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(null);
  const [selections, setSelections] = useState({ direction: false, skill: false, love: false });
  const [candidates, setCandidates] = useState([]);
  const initializedRef = useRef(false);

  const currentStudent = candidates[currentIndex];

  useEffect(() => { setSelections({ direction: false, skill: false, love: false }); }, [currentIndex]);

  useEffect(() => {
    if (!currentUser || !students) return;
    if (initializedRef.current) return;
    initializedRef.current = true;

    const votedIds = Object.keys(currentUser.votes || {});
    const baseCandidates = students.filter(s => s.id !== currentUser.id && !votedIds.includes(s.id));

    const scored = baseCandidates.map(student => {
      let score = 0;
      if (student.category && student.category === currentUser.category) score += 3;
      const cTopics = student.topics || [];
      const myTopics = currentUser.topics || [];
      score += cTopics.filter(t => myTopics.includes(t)).length * 5;
      const cApps = student.approaches || [];
      const myApps = currentUser.approaches || [];
      score += cApps.filter(a => myApps.includes(a)).length * 2;
      return { ...student, affinityScore: score };
    });

    scored.sort((a, b) => b.affinityScore - a.affinityScore);
    const remainingCount = Math.max(0, 30 - votedIds.length);
    const topSlice = Math.min(remainingCount, scored.length);
    setCandidates(scored.slice(0, topSlice));
    setCurrentIndex(0);
  }, [students, currentUser?.id]);

  const toggleSelection = (type) => setSelections(prev => ({ ...prev, [type]: !prev[type] }));
  const hasSelection = useMemo(() => Object.values(selections).some(v => v), [selections]);

  const handleSwipe = (dir) => {
    if (!currentStudent || direction || (dir === "right" && !hasSelection)) return;
    setDirection(dir);
    const voteData = dir === "right" ? selections : { skipped: true };
    onVote(currentStudent.id, voteData);
    setTimeout(() => { setDirection(null); setCurrentIndex(prev => prev + 1); }, 400);
  };

  if (currentIndex >= candidates.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6">
        <div className="bg-green-100 p-6 rounded-full mb-6 animate-bounce"><window.CheckCircle size={64} className="text-green-600" /></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">チェック完了！</h2>
        <p className="text-gray-500">先生のマッチング開始をお待ちください。</p>
      </div>
    );
  }

  const categoryData = window.getCategoryMeta(currentStudent?.category);
  let cardClass = "absolute inset-0 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col transition-all duration-500 ease-out";
  if (direction === "left") cardClass += " transform -translate-x-[150%] -rotate-12 opacity-0";
  else if (direction === "right") cardClass += " transform translate-x-[150%] rotate-12 opacity-0";

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] p-4 overflow-hidden relative">
      <div className="w-full max-w-md aspect-[3/4] relative">
        {currentIndex + 1 < candidates.length && (
          <div className="absolute top-4 left-4 right-4 bottom-4 bg-gray-50 rounded-3xl border border-gray-200 shadow-sm -z-10 transform scale-95 opacity-50"></div>
        )}
        <div className={cardClass}>
          <div className={`h-32 bg-gradient-to-br ${categoryData.color} p-6 flex flex-col justify-end text-white relative`}>
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold">ID: {String(currentStudent.id).slice(-4)}</div>
            <div className="absolute top-4 left-4 bg-black/20 backdrop-blur px-2 py-1 rounded text-[10px] font-mono">Match: {currentStudent.affinityScore}pt</div>
            <div className="font-bold text-sm opacity-90">{categoryData.group}</div>
            <div className="text-2xl font-black leading-none shadow-black/10 drop-shadow-md">{categoryData.name}</div>
          </div>
          <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto pb-32">
            {currentStudent.theme && (
              <div className="mb-2">
                <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2 border-b border-gray-100 pb-1"><window.Lightbulb size={16} className="text-yellow-500" /> 今考えている題材</h4>
                <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100 font-bold text-gray-800 leading-snug shadow-sm">{currentStudent.theme}</div>
              </div>
            )}
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2 border-b border-gray-100 pb-1"><window.Sparkles size={16} className="text-purple-500" /> トピック</h4>
              <div className="flex flex-wrap gap-2">
                {currentStudent.topics?.map(tid => <span key={tid} className={`px-2 py-1 rounded-lg text-xs font-bold border ${window.getTagStyle(tid, false)}`}>{window.TOPIC_TAGS.find(t => t.id === tid)?.name}</span>)}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2 border-b border-gray-100 pb-1"><window.Settings size={16} className="text-green-500" /> アプローチ</h4>
              <div className="flex flex-wrap gap-2">
                {currentStudent.approaches?.map(aid => {
                  const a = window.APPROACH_TAGS.find(t => t.id === aid);
                  return a ? <div key={aid} className="bg-green-50 text-green-700 px-2 py-1 rounded-lg text-xs font-bold border border-green-100 flex items-center gap-1"><span>{a.icon}</span><span>{a.name}</span></div> : null;
                })}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2 border-b border-gray-100 pb-1"><window.Zap size={16} className="text-orange-500" /> スキル</h4>
              <div className="flex flex-wrap gap-2">
                {currentStudent.skills?.map(s => <span key={s} className="bg-purple-50 text-purple-700 px-2 py-1 rounded-lg text-xs font-bold border border-purple-100">{s}</span>)}
              </div>
            </div>
            <div className="mt-2">
              <div className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2 border-b border-gray-100 pb-1"><window.Smile size={16} className="text-pink-500" /> ひとこと</div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative"><p className="text-sm text-gray-600 italic">"{currentStudent.comment}"</p></div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t p-4 pb-6 flex gap-2 justify-center">
            <button onClick={() => handleSwipe("left")} className="flex-1 py-3 rounded-xl flex flex-col items-center transition border-2 border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200"><window.X size={20} /><span className="text-[10px] font-bold mt-1">スキップ</span></button>
            <button onClick={() => toggleSelection("direction")} className={`flex-1 py-3 rounded-xl flex flex-col items-center transition border-2 ${selections.direction ? "bg-green-50 border-green-500 text-green-700" : "bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100"}`}><window.CheckCircle size={20} className={selections.direction ? "fill-current" : ""} /><span className="text-[10px] font-bold mt-1">方向性</span></button>
            <button onClick={() => toggleSelection("skill")} className={`flex-1 py-3 rounded-xl flex flex-col items-center transition border-2 ${selections.skill ? "bg-blue-50 border-blue-500 text-blue-700" : "bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100"}`}><window.Zap size={20} className={selections.skill ? "fill-current" : ""} /><span className="text-[10px] font-bold mt-1">スキル</span></button>
            <button onClick={() => toggleSelection("love")} className={`flex-1 py-3 rounded-xl flex flex-col items-center transition border-2 ${selections.love ? "bg-pink-50 border-pink-500 text-pink-700" : "bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100"}`}><window.Heart size={20} className={selections.love ? "fill-current" : ""} /><span className="text-[10px] font-bold mt-1">組みたい</span></button>
            <button onClick={() => handleSwipe("right")} disabled={!hasSelection} className={`flex-1 py-3 rounded-xl flex flex-col items-center transition border-2 ${hasSelection ? "bg-blue-600 text-white border-blue-600" : "bg-gray-200 text-gray-400 border-gray-200"}`}><window.ThumbsUp size={20} /><span className="text-[10px] font-bold mt-1">送信</span></button>
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-400 mt-4 font-mono">{currentIndex + 1} / {candidates.length} Cards</div>
    </div>
  );
};

const ModernResultView = ({ currentUser, students, groups, isPublished }) => {
  const [selectedMember, setSelectedMember] = useState(null);

  if (!isPublished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <h2 className="text-3xl font-black text-gray-800 mb-2">Analyzing...</h2>
        <p className="text-gray-500">先生が最適なチームを構成中です。<br />しばらくお待ちください。</p>
      </div>
    );
  }

  const myGroupIndex = groups.findIndex(g => (g.members ? g.members.includes(currentUser.id) : g.includes(currentUser.id)));
  const myGroupData = groups[myGroupIndex];
  const myGroupMemberIds = myGroupData ? (myGroupData.members || myGroupData) : [];
  const myGroupMembers = myGroupMemberIds.map(id => students.find(s => s.id === id)).filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6 pt-12 relative">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-block bg-yellow-400 text-yellow-900 font-black text-xs px-3 py-1 rounded-full uppercase tracking-widest mb-4 shadow-lg transform -rotate-2">Team Matched!</div>
          {myGroupIndex !== -1 && <h1 className="text-5xl font-black text-blue-600 mb-2 tracking-tight drop-shadow-sm">TEAM {myGroupIndex + 1}</h1>}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">あなたのチーム</h2>
        </div>
        <div className="grid gap-4">
          {myGroupMembers.map((member) => {
            const isMe = member.id === currentUser.id;
            const cat = window.getCategoryMeta(member.category);
            return (
              <div key={member.id} onClick={() => setSelectedMember(member)} className="bg-white rounded-2xl p-4 shadow-xl border border-gray-100 flex items-center gap-4 transform hover:scale-[1.02] transition duration-300 cursor-pointer hover:bg-gray-50">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white font-bold text-xl shadow-md`}>{member.name.charAt(0)}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">{member.name}{isMe && <span className="bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded-full">YOU</span>}</h3>
                    <div className="text-xs font-bold text-gray-400">{cat.name}</div>
                  </div>
                  <div className="flex gap-2 mb-1"><span className="bg-gray-50 text-gray-500 px-2 py-0.5 rounded text-[10px] font-bold">{member.classId}組 {member.studentNumber}番</span></div>
                  <div className="flex flex-wrap gap-1">{member.skills?.slice(0, 3).map(s => <span key={s} className="bg-purple-50 text-purple-700 px-2 py-1 rounded-lg text-xs font-bold border border-purple-100">{s}</span>)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedMember(null)}>
          <div className="bg-white text-gray-800 p-0 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const cat = window.getCategoryMeta(selectedMember.category);
              return (
                <>
                  <div className={`h-24 bg-gradient-to-br ${cat.color} p-6 flex flex-col justify-end text-white relative`}>
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold">ID: {String(selectedMember.id).slice(-4)}</div>
                    <div className="font-bold text-sm opacity-90">{cat.group}</div>
                    <div className="text-xl font-black leading-none shadow-black/10 drop-shadow-md">{cat.name}</div>
                  </div>
                  <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <h3 className="text-xl font-bold mb-1">{selectedMember.name}<span className="text-sm text-gray-500 font-normal ml-2">{selectedMember.classId}組 {selectedMember.studentNumber}番</span></h3>
                    {selectedMember.theme && (<div className="mb-4 mt-4"><h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><window.Lightbulb size={12} /> 今考えている題材</h4><div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 font-bold text-gray-800 text-sm">{selectedMember.theme}</div></div>)}
                    <div className="space-y-4 mt-4">
                      <div><h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><window.Sparkles size={12} /> トピック</h4><div className="flex flex-wrap gap-1">{selectedMember.topics?.map(tid => <span key={tid} className={`px-2 py-1 rounded-md text-xs font-bold border ${window.getTagStyle(tid, false)}`}>{window.TOPIC_TAGS.find(t => t.id === tid)?.name}</span>)}</div></div>
                      <div><h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><window.Settings size={12} /> アプローチ</h4><div className="flex flex-wrap gap-1">{selectedMember.approaches?.map(aid => { const a = window.APPROACH_TAGS.find(t => t.id === aid); return a ? <span key={aid} className="bg-green-50 text-green-700 px-2 py-1 rounded-md text-xs font-bold border border-green-100">{a.icon} {a.name}</span> : null; })}</div></div>
                      <div><h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><window.Zap size={12} /> スキル</h4><div className="flex flex-wrap gap-1">{selectedMember.skills?.map(s => <span key={s} className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-xs font-bold border border-purple-100">{s}</span>)}</div></div>
                      <div><h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><window.Smile size={12} /> ひとこと</h4><div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-sm text-gray-600 italic">"{selectedMember.comment}"</div></div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-gray-100 bg-gray-50 text-center"><button onClick={() => setSelectedMember(null)} className="bg-gray-800 text-white px-8 py-2 rounded-full font-bold text-sm hover:bg-gray-700 transition">閉じる</button></div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

window.ModernInputForm = ModernInputForm;
window.CardStack = CardStack;
window.ModernResultView = ModernResultView;
