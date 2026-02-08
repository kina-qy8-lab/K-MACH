// Reactの機能をグローバルに展開
window.useState = React.useState;
window.useEffect = React.useEffect;
window.useMemo = React.useMemo;
window.useRef = React.useRef;

// Lucide Reactアイコンの展開
// UMD版のlucide-reactは window.lucideReact に格納されることが多い
const Icons = window.lucideReact;
window.Users = Icons.Users;
window.Layers = Icons.Layers;
window.Settings = Icons.Settings;
window.RefreshCw = Icons.RefreshCw;
window.Star = Icons.Star;
window.Heart = Icons.Heart;
window.ArrowRight = Icons.ArrowRight;
window.ArrowLeft = Icons.ArrowLeft;
window.CheckCircle = Icons.CheckCircle;
window.X = Icons.X;
window.Zap = Icons.Zap;
window.Award = Icons.Award;
window.Smile = Icons.Smile;
window.Sparkles = Icons.Sparkles;
window.ThumbsUp = Icons.ThumbsUp;
window.Lock = Icons.Lock;
window.Unlock = Icons.Unlock;
window.Edit3 = Icons.Edit3;
window.Lightbulb = Icons.Lightbulb;
window.Download = Icons.Download;
window.LogOut = Icons.LogOut;
window.Upload = Icons.Upload;
window.Database = Icons.Database;
window.AlertCircle = Icons.AlertCircle;
window.Eye = Icons.Eye;
window.Trash2 = Icons.Trash2;
window.ToggleLeft = Icons.ToggleLeft;
window.ToggleRight = Icons.ToggleRight;
window.BarChart2 = Icons.BarChart2;
window.Move = Icons.Move;
