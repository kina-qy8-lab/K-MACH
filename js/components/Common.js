const LoginScreen = ({ onLogin }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
      <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
        <window.Sparkles size={32} className="text-white" />
      </div>
      <h1 className="text-2xl font-black text-gray-800 mb-2">K-MATCH</h1>
      <p className="text-gray-500 mb-8">Googleアカウントでログインしてください。<br />登録済みのユーザーのみ利用可能です。</p>
      <button onClick={onLogin} className="w-full bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition">
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" /> Googleでログイン
      </button>
    </div>
  </div>
);

const RosterStatus = ({ students, onSelectStudent, phase }) => {
  return (
    <div className="mt-8 bg-gray-800 rounded-2xl p-6 border border-gray-700 overflow-x-auto">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        <window.Users size={16} /> Class Roster Status <span className="text-xs normal-case text-gray-500 ml-2">(緑色の番号クリックで詳細・削除)</span>
      </h3>
      <div className="flex gap-4 min-w-max pb-4">
        {window.CLASS_LIST.map(cls => (
          <div key={cls} className="bg-gray-900/50 rounded-xl p-3 border border-gray-700 w-32 flex-shrink-0">
            <div className="text-center font-bold text-gray-300 mb-2 border-b border-gray-700 pb-1">{cls}組</div>
            <div className="grid grid-cols-4 gap-1">
              {window.STUDENT_NUMBERS.map(num => {
                const student = students.find(s => s.classId === cls && s.studentNumber === num);
                const isRegistered = !!student;
                let isSubmitted = false;
                if (phase === window.PHASE.INPUT) {
                  isSubmitted = student && (student.comment || (student.topics && student.topics.length > 0));
                } else if (phase === window.PHASE.CHECK) {
                  isSubmitted = student && student.votes && Object.keys(student.votes).length >= 30;
                }
                return (
                  <button
                    key={num}
                    onClick={() => isRegistered ? onSelectStudent(student) : null}
                    className={`aspect-square flex items-center justify-center text-[9px] font-bold rounded-sm transition-all ${!isRegistered ? "bg-gray-800 text-gray-600 cursor-default" :
                      isSubmitted ? "bg-green-500 text-white shadow-[0_0_8px_rgba(34,197,94,0.6)] scale-105 hover:bg-green-400" :
                        "bg-yellow-600 text-white hover:bg-yellow-500"
                      }`}
                    title={isRegistered ? `${student.name} (${student.email})` : "未登録"}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-4 mt-2 text-xs text-gray-500">
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-800 rounded-sm"></div> 未登録</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-600 rounded-sm"></div> 途中/登録のみ</div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-sm shadow-[0_0_5px_rgba(34,197,94,0.6)]"></div>
          {phase === window.PHASE.CHECK ? "30件完了" : "入力完了"}
        </div>
      </div>
    </div>
  );
};

window.LoginScreen = LoginScreen;
window.RosterStatus = RosterStatus;
