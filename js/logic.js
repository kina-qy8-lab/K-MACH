const FIELD_MISMATCH_PENALTY = 999999;
const CAT_MISSING_PENALTY = 0;

const W = {
  MUTUAL_LOVE: 900, ONE_LOVE: 160,
  MUTUAL_DIR: 320, ONE_DIR: 55,
  MUTUAL_SKILL: 220, ONE_SKILL: 35,
  TOPIC_MATCH: 12, APPROACH_MATCH: 6,
  CAT_SAME_BONUS: 260, CAT_NEAR_BONUS: 160, FIELD_SAME_BONUS: 20, CAT_DIST_PENALTY: 120,
  SKILL_OVERLAP_PENALTY: 3, TEAM_UNIQUE_SKILL_BONUS: 4,
  BOTH_SKIPPED_PENALTY: 20
};

const getField = (catId) => {
  if (!catId) return "UNK";
  if (catId.startsWith("NAT_")) return "NAT";
  if (catId.startsWith("SOC_")) return "SOC";
  if (catId.startsWith("HUM_")) return "HUM";
  return "UNK";
};

const isNeighborCat = (c1, c2) => {
  if (!c1 || !c2) return false;
  const n1 = window.CAT_NEIGHBORS[c1] || [];
  const n2 = window.CAT_NEIGHBORS[c2] || [];
  return n1.includes(c2) || n2.includes(c1);
};

const categoryDistance = (c1, c2) => {
  if (!c1 || !c2) return 0;
  if (c1 === c2) return 0;
  if (isNeighborCat(c1, c2)) return 1;
  const f1 = getField(c1), f2 = getField(c2);
  if (f1 !== "UNK" && f2 !== "UNK" && f1 === f2) return 2;
  return 3;
};

const isSameField = (c1, c2) => {
  const f1 = getField(c1);
  const f2 = getField(c2);
  if (f1 === "UNK" || f2 === "UNK") return true;
  return f1 === f2;
};

// グローバル公開関数
window.isSameField = isSameField;
window.categoryDistance = categoryDistance;

const categoryAffinityScore = (c1, c2) => {
  if (!c1 || !c2) return 0;
  const dist = categoryDistance(c1, c2);
  if (dist === 0) return W.CAT_SAME_BONUS;
  if (dist === 1) return W.CAT_NEAR_BONUS;
  if (dist === 2) return W.FIELD_SAME_BONUS - (W.CAT_DIST_PENALTY * 2);
  return -FIELD_MISMATCH_PENALTY;
};

const commonCount = (a = [], b = []) => {
  const setB = new Set(b);
  let c = 0;
  a.forEach(x => { if (setB.has(x)) c++; });
  return c;
};

const pairScoreUndirected = (s1, s2, votes) => {
  let score = 0;
  score += categoryAffinityScore(s1.category, s2.category);
  score += commonCount(s1.topics || [], s2.topics || []) * W.TOPIC_MATCH;
  score += commonCount(s1.approaches || [], s2.approaches || []) * W.APPROACH_MATCH;
  const commonSkills = commonCount(s1.skills || [], s2.skills || []);
  score -= commonSkills * W.SKILL_OVERLAP_PENALTY;

  const v12 = votes?.[s1.id]?.[s2.id] || {};
  const v21 = votes?.[s2.id]?.[s1.id] || {};

  if (v12.love && v21.love) score += W.MUTUAL_LOVE;
  else if (v12.love || v21.love) score += W.ONE_LOVE;

  if (v12.direction && v21.direction) score += W.MUTUAL_DIR;
  else if (v12.direction || v21.direction) score += W.ONE_DIR;

  if (v12.skill && v21.skill) score += W.MUTUAL_SKILL;
  else if (v12.skill || v21.skill) score += W.ONE_SKILL;

  if (v12.skipped && v21.skipped) score -= W.BOTH_SKIPPED_PENALTY;
  return score;
};

window.calculateTeamMetrics = (groupMembers, allStudents, votes) => {
  if (!groupMembers || groupMembers.length < 2) {
    return {
      score: 0, purity: 0, avgCatDistance: 0, crossFieldPairs: 0, mutualPairs: 0,
      connection: 0, interest: 0, diversity: 0, uniqueSkillsCount: 0, uniqueCategoriesCount: 0
    };
  }

  const cats = groupMembers.map(m => m.category).filter(Boolean);
  const counts = {};
  cats.forEach(c => counts[c] = (counts[c] || 0) + 1);
  const maxCat = Object.values(counts).reduce((a, b) => Math.max(a, b), 0);
  const knownCount = cats.length;
  const purity = knownCount ? (maxCat / knownCount) : 1;
  const uniqueCategoriesCount = Object.keys(counts).length;

  let distSum = 0, pairCount = 0, crossFieldPairs = 0;
  let connection = 0, interest = 0, mutualPairs = 0;

  for (let i = 0; i < groupMembers.length; i++) {
    for (let j = i + 1; j < groupMembers.length; j++) {
      const s1 = groupMembers[i];
      const s2 = groupMembers[j];
      const dist = categoryDistance(s1.category, s2.category);
      distSum += dist;
      pairCount++;
      if (dist === 3) crossFieldPairs++;

      const v12 = votes?.[s1.id]?.[s2.id] || {};
      const v21 = votes?.[s2.id]?.[s1.id] || {};

      if (v12.love && v21.love) { connection += W.MUTUAL_LOVE; mutualPairs++; }
      else if (v12.love || v21.love) connection += W.ONE_LOVE;

      if (v12.direction && v21.direction) interest += W.MUTUAL_DIR;
      else if (v12.direction || v21.direction) interest += W.ONE_DIR;

      if (v12.skill && v21.skill) interest += W.MUTUAL_SKILL;
      else if (v12.skill || v21.skill) interest += W.ONE_SKILL;

      interest += commonCount(s1.topics || [], s2.topics || []) * W.TOPIC_MATCH;
      interest += commonCount(s1.approaches || [], s2.approaches || []) * W.APPROACH_MATCH;
    }
  }

  const avgCatDistance = pairCount ? (distSum / pairCount) : 0;
  const skillSet = new Set();
  groupMembers.forEach(s => (s.skills || []).forEach(sk => skillSet.add(sk)));
  const uniqueSkillsCount = skillSet.size;
  const diversity = uniqueSkillsCount * W.TEAM_UNIQUE_SKILL_BONUS;

  let raw = 0;
  raw += purity * 520;
  raw += (1 - Math.min(1, avgCatDistance / 3)) * 310;
  raw += (connection / 10);
  raw += (interest / 10);
  raw += diversity;
  raw -= Math.max(0, uniqueCategoriesCount - 1) * 120;
  raw -= crossFieldPairs * 420;

  let score = Math.max(0, Math.min(100, Math.round(raw / 10)));

  return {
    score, purity: Math.round(purity * 100) / 100, avgCatDistance: Math.round(avgCatDistance * 100) / 100,
    crossFieldPairs, mutualPairs, connection: Math.round(connection), interest: Math.round(interest),
    diversity: Math.round(diversity), uniqueSkillsCount, uniqueCategoriesCount
  };
};

window.runWeightedMatchingAlgorithm = (students, votes) => {
  if (!students || students.length === 0) return [];
  const target = students.filter(s => s.role !== "teacher" && s.role !== "admin");
  const ids = target.map(s => s.id);
  const byId = Object.fromEntries(target.map(s => [s.id, s]));

  const MIN_SIZE = 3, MAX_SIZE = 5, IDEAL_SIZE = 4;
  const catCounts = {};
  target.forEach(s => { const c = s.category || "__MISSING__"; catCounts[c] = (catCounts[c] || 0) + 1; });
  const RARE_THRESHOLD = 3;
  const isRareCat = (catId) => { const c = catId || "__MISSING__"; return (catCounts[c] || 0) <= RARE_THRESHOLD; };

  const INIT_MAX_UNIQUE_CATS = 2;
  const INIT_MIN_PURITY = 0.50;
  const UNIQUE_CAT_PENALTY = 180;
  const PURITY_BONUS = 260;

  const groupCategoryStats = (group) => {
    const counts = {};
    let missing = 0;
    group.forEach(id => {
      const c = byId[id]?.category;
      if (!c) { missing++; return; }
      counts[c] = (counts[c] || 0) + 1;
    });
    const uniq = Object.keys(counts).length;
    const max = Object.values(counts).reduce((a, b) => Math.max(a, b), 0) || 0;
    const knownCount = Object.values(counts).reduce((a, b) => a + b, 0) || 0;
    const purity = knownCount ? (max / knownCount) : 1;
    let dom = null, domCnt = -1;
    Object.entries(counts).forEach(([k, v]) => { if (v > domCnt) { domCnt = v; dom = k; } });
    return { uniqCats: uniq, purity, dominantCat: dom, missing };
  };

  const wouldViolateInitCohesion = (group, candId) => {
    const next = [...group, candId];
    const candCat = byId[candId]?.category;
    for (const mid of group) { if (!isSameField(byId[mid]?.category, candCat)) return true; }
    const st = groupCategoryStats(next);
    if (st.uniqCats > INIT_MAX_UNIQUE_CATS) return true;
    const rareInGroup = group.some(id => isRareCat(byId[id]?.category));
    const rareCand = isRareCat(candCat);
    const minPur = (rareInGroup || rareCand) ? 0.40 : INIT_MIN_PURITY;
    if (next.length >= 3 && st.purity < minPur) return true;
    return false;
  };

  const ps = {};
  for (let i = 0; i < ids.length; i++) {
    const a = ids[i];
    ps[a] = ps[a] || {};
    for (let j = i + 1; j < ids.length; j++) {
      const b = ids[j];
      const sc = pairScoreUndirected(byId[a], byId[b], votes);
      ps[a][b] = sc; ps[b] = ps[b] || {}; ps[b][a] = sc;
    }
  }

  const fitScore = (candId, group) => { let sum = 0; group.forEach(m => { sum += (ps[candId]?.[m] || 0); }); return sum; };

  const teamCohesionPenalty = (group) => {
    let penalty = 0;
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const s1 = byId[group[i]], s2 = byId[group[j]];
        const dist = categoryDistance(s1.category, s2.category);
        if (dist === 3) penalty += FIELD_MISMATCH_PENALTY; else penalty += dist * 140;
      }
    }
    const st = groupCategoryStats(group);
    penalty += Math.max(0, st.uniqCats - 1) * UNIQUE_CAT_PENALTY;
    penalty -= st.purity * PURITY_BONUS * group.length;
    penalty += st.missing * CAT_MISSING_PENALTY;
    const unique = new Set();
    group.forEach(id => (byId[id].skills || []).forEach(sk => unique.add(sk)));
    penalty -= unique.size * W.TEAM_UNIQUE_SKILL_BONUS;
    return penalty;
  };

  const teamObjective = (group) => {
    let sum = 0;
    for (let i = 0; i < group.length; i++) for (let j = i + 1; j < group.length; j++) sum += (ps[group[i]]?.[group[j]] || 0);
    return sum - teamCohesionPenalty(group);
  };

  const totalObjective = (groups) => groups.reduce((acc, g) => acc + teamObjective(g), 0);

  const unassigned = new Set(ids);
  const groups = [];

  const pickSeed = () => {
    let best = null, bestScore = -Infinity;
    for (const id of unassigned) {
      const s = byId[id], cat = s.category;
      let deg = 0;
      for (const id2 of unassigned) {
        if (id2 === id) continue;
        const d = categoryDistance(cat, byId[id2].category);
        if (d === 3) continue;
        if (d <= 1) deg += 2; else if (d === 2) deg += 1;
      }
      const vcnt = s.votes ? Object.keys(s.votes).length : 0;
      const rareBonus = isRareCat(cat) ? 1200 : 0;
      const sc = rareBonus + deg * 10 + Math.min(vcnt, 30);
      if (sc > bestScore) { bestScore = sc; best = id; }
    }
    return best;
  };

  const pickBestPartner = (seedId) => {
    let best = null, bestSc = -Infinity;
    const seedCat = byId[seedId]?.category;
    const consider = (id2, bonus = 0) => {
      if (!isSameField(seedCat, byId[id2].category)) return;
      const sc = (ps[seedId]?.[id2] || -Infinity) + bonus;
      if (sc > bestSc) { bestSc = sc; best = id2; }
    };
    if (isRareCat(seedCat)) {
      for (const id2 of unassigned) { if (id2 !== seedId && (byId[id2].category || "") === seedCat && !wouldViolateInitCohesion([seedId], id2)) consider(id2, 500); }
      if (best) return best;
      for (const id2 of unassigned) { if (id2 !== seedId && categoryDistance(seedCat, byId[id2].category) === 1 && !wouldViolateInitCohesion([seedId], id2)) consider(id2, 250); }
      if (best) return best;
      for (const id2 of unassigned) { if (id2 !== seedId && categoryDistance(seedCat, byId[id2].category) === 2 && !wouldViolateInitCohesion([seedId], id2)) consider(id2, 50); }
      if (best) return best;
    }
    for (const id2 of unassigned) { if (id2 !== seedId && categoryDistance(seedCat, byId[id2].category) <= 1 && !wouldViolateInitCohesion([seedId], id2)) consider(id2, 150); }
    if (best) return best;
    for (const id2 of unassigned) { if (id2 !== seedId && categoryDistance(seedCat, byId[id2].category) <= 2 && !wouldViolateInitCohesion([seedId], id2)) consider(id2, 30); }
    if (best) return best;
    for (const id2 of unassigned) { if (id2 !== seedId && categoryDistance(seedCat, byId[id2].category) !== 3) consider(id2, 0); }
    if (best) return best;
    for (const id2 of unassigned) { if (id2 !== seedId) consider(id2, 0); }
    return best;
  };

  while (unassigned.size > 0) {
    const seed = pickSeed(); if (!seed) break;
    unassigned.delete(seed);
    const partner = pickBestPartner(seed);
    const group = [seed];
    if (partner) { group.push(partner); unassigned.delete(partner); }

    while (group.length < IDEAL_SIZE && unassigned.size > 0) {
      let bestCand = null, bestFit = -Infinity;
      for (const cand of unassigned) {
        if (!isSameField(byId[group[0]].category, byId[cand].category)) continue;
        let sum = 0; group.forEach(m => sum += categoryDistance(byId[cand].category, byId[m].category));
        const avgDist = sum / group.length;
        if (avgDist >= 2.5) continue;
        if (wouldViolateInitCohesion(group, cand)) continue;
        const st = groupCategoryStats(group);
        if (categoryDistance(st.dominantCat || byId[group[0]]?.category, byId[cand].category) > 1) continue;
        const sc = fitScore(cand, group);
        if (sc > bestFit) { bestFit = sc; bestCand = cand; }
      }
      if (!bestCand) {
        for (const cand of unassigned) {
          if (!isSameField(byId[group[0]].category, byId[cand].category)) continue;
          let sum = 0; group.forEach(m => sum += categoryDistance(byId[cand].category, byId[m].category));
          if (sum / group.length >= 2.8) continue;
          if (wouldViolateInitCohesion(group, cand)) continue;
          const st = groupCategoryStats(group);
          const dDom = categoryDistance(st.dominantCat || byId[group[0]]?.category, byId[cand].category);
          const rareInGroup = group.some(id => isRareCat(byId[id]?.category));
          const rareCand = isRareCat(byId[cand].category);
          if (dDom > 2) continue;
          if (dDom === 2 && !(rareInGroup || rareCand)) continue;
          const sc = fitScore(cand, group);
          if (sc > bestFit) { bestFit = sc; bestCand = cand; }
        }
      }
      if (!bestCand) {
        for (const cand of unassigned) {
          if (!isSameField(byId[group[0]].category, byId[cand].category)) continue;
          if (wouldViolateInitCohesion(group, cand)) continue;
          const sc = fitScore(cand, group);
          if (sc > bestFit) { bestFit = sc; bestCand = cand; }
        }
      }
      if (!bestCand) break;
      group.push(bestCand); unassigned.delete(bestCand);
    }
    groups.push(group);
  }

  let pool = [];
  for (let i = groups.length - 1; i >= 0; i--) { if (groups[i].length < MIN_SIZE) { pool.push(...groups[i]); groups.splice(i, 1); } }
  for (const pid of pool) {
    let bestIdx = -1, best = -Infinity;
    for (let i = 0; i < groups.length; i++) {
      if (groups[i].length >= MAX_SIZE) continue;
      const candCat = byId[pid]?.category;
      if (groups[i].some(mid => !isSameField(byId[mid]?.category, candCat))) continue;
      const st = groupCategoryStats(groups[i]);
      const counts = {}; [...groups[i], pid].forEach(id => { const c = byId[id]?.category; if(c) counts[c] = (counts[c]||0)+1; });
      const nextUniq = Object.keys(counts).length;
      const uniqPenalty = Math.max(0, nextUniq - st.uniqCats) * UNIQUE_CAT_PENALTY;
      const sc = fitScore(pid, groups[i]) - teamCohesionPenalty([...groups[i], pid]) - uniqPenalty;
      if (sc > best) { best = sc; bestIdx = i; }
    }
    if (bestIdx >= 0) groups[bestIdx].push(pid); else groups.push([pid]);
  }

  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i].length < MIN_SIZE) {
      const small = groups.splice(i, 1)[0];
      let bestIdx = -1, best = -Infinity;
      for (let j = 0; j < groups.length; j++) {
        if (groups[j].length + small.length > MAX_SIZE) continue;
        const canMerge = [...groups[j], ...small].every(id1 => [...groups[j], ...small].every(id2 => isSameField(byId[id1]?.category, byId[id2]?.category)));
        if (!canMerge) continue;
        const merged = [...groups[j], ...small];
        const sc = teamObjective(merged);
        if (sc > best) { best = sc; bestIdx = j; }
      }
      if (bestIdx >= 0) groups[bestIdx].push(...small); else groups.push(small);
    }
  }

  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i].length > MAX_SIZE) {
      const g = groups.splice(i, 1)[0];
      while (g.length > MAX_SIZE) groups.push(g.splice(0, IDEAL_SIZE));
      if (g.length) groups.push(g);
    }
  }

  let bestGroups = groups.map(g => [...g]);
  let bestObj = totalObjective(bestGroups);
  const MAX_IT_COUNT = 6500;
  const randInt = (n) => Math.floor(Math.random() * n);

  for (let it = 0; it < MAX_IT_COUNT; it++) {
    const op = Math.random() < 0.65 ? 0 : 1;
    const gA = randInt(bestGroups.length);
    let gB = randInt(bestGroups.length);
    if (bestGroups.length > 1) while (gB === gA) gB = randInt(bestGroups.length);
    const A = bestGroups[gA], B = bestGroups[gB];
    if (!A || !B || A.length === 0 || B.length === 0) continue;
    let newGroups = bestGroups.map(g => [...g]);

    if (op === 0) {
      const i = randInt(A.length), j = randInt(B.length);
      const aId = A[i], bId = B[j];
      const catA = byId[aId]?.category, catB = byId[bId]?.category;
      const conflictA = B.some(mid => mid !== bId && !isSameField(byId[mid]?.category, catA));
      const conflictB = A.some(mid => mid !== aId && !isSameField(byId[mid]?.category, catB));
      if (conflictA || conflictB) continue;
      newGroups[gA][i] = bId; newGroups[gB][j] = aId;
    } else {
      if (A.length <= MIN_SIZE || B.length >= MAX_SIZE) continue;
      const i = randInt(A.length);
      const aId = A[i];
      const catA = byId[aId]?.category;
      if (B.some(mid => !isSameField(byId[mid]?.category, catA))) continue;
      newGroups[gA].splice(i, 1); newGroups[gB].push(aId);
      if (newGroups[gA].length < MIN_SIZE) continue;
    }
    newGroups = newGroups.filter(g => g.length > 0);
    if (newGroups.some(g => g.length < MIN_SIZE || g.length > MAX_SIZE)) continue;
    const obj = totalObjective(newGroups);
    if (obj > bestObj) { bestObj = obj; bestGroups = newGroups; }
  }
  return bestGroups;
};

window.generateMockStudents = (count) => {
  const mocks = [];
  const lastNames = ["佐藤", "鈴木", "高橋", "田中", "渡辺", "伊藤", "山本", "中村", "小林", "加藤", "吉田", "山田", "佐々木", "山口", "松本", "井上", "木村", "林", "斎藤", "清水"];
  const firstNames = ["蓮", "陽翔", "湊", "結菜", "陽葵", "莉子", "大翔", "悠真", "結衣", "楓", "春斗", "芽依", "碧", "朝陽", "詩", "紬", "咲良", "蒼", "樹", "美月"];
  for (let i = 0; i < count; i++) {
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const cat = window.CATEGORIES[Math.floor(Math.random() * window.CATEGORIES.length)];
    const theme = window.MOCK_THEMES[Math.floor(Math.random() * window.MOCK_THEMES.length)];
    const topics = [];
    const numTopics = Math.random() > 0.7 ? 2 : 1;
    for (let j = 0; j < numTopics; j++) topics.push(window.TOPIC_TAGS[Math.floor(Math.random() * window.TOPIC_TAGS.length)].id);
    const apps = [];
    const numApps = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < numApps; j++) apps.push(window.APPROACH_TAGS[Math.floor(Math.random() * window.APPROACH_TAGS.length)].id);
    const sks = [];
    const numSkills = Math.floor(Math.random() * 3) + 2;
    while (sks.length < numSkills) {
      const s = window.SKILLS[Math.floor(Math.random() * window.SKILLS.length)];
      if (!sks.includes(s)) sks.push(s);
    }
    mocks.push({
      id: `student_${Date.now()}_${i}`,
      name: `${ln} ${fn}`,
      classId: Math.floor(Math.random() * 9) + 1,
      studentNumber: Math.floor(Math.random() * 40) + 1,
      category: cat.id, theme,
      topics: [...new Set(topics)], approaches: [...new Set(apps)], skills: sks,
      comment: "良いチームを作りたいです！よろしくお願いします！",
      timestamp: Date.now(), role: "student"
    });
  }
  return mocks;
};
