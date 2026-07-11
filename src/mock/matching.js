// Ported from server/lib/matching.js — student <-> opportunity scoring.

const W_SKILLS = 40;
const W_DOMAIN = 20;
const W_MODE = 15;
const W_DEGREE = 10;
const W_YEAR = 10;
const W_LOCATION = 5;

function norm(s) {
  return (s || "").trim().toLowerCase();
}

export function scorePair(student, opp) {
  const studentSkills = new Set((student.skills || []).map(norm).filter(Boolean));
  const oppSkills = new Set((opp.skills_required || []).map(norm).filter(Boolean));
  const studentDomains = new Set((student.domains || []).map(norm).filter(Boolean));
  const reasons = [];

  let skillScore = 0;
  if (oppSkills.size) {
    const matched = [...studentSkills].filter((s) => oppSkills.has(s));
    skillScore = Math.round(W_SKILLS * (matched.length / oppSkills.size));
    if (matched.length) reasons.push(`${matched.length}/${oppSkills.size} skills matched`);
  }

  const domainNorm = norm(opp.domain);
  const domainScore = domainNorm && studentDomains.has(domainNorm) ? W_DOMAIN : 0;
  if (domainScore) reasons.push(`Domain ${opp.domain} ✓`);

  const prefMode = norm(student.work_mode_pref);
  const oppMode = norm(opp.mode);
  const modeScore = prefMode && oppMode && prefMode === oppMode ? W_MODE : 0;
  if (modeScore) reasons.push(`${opp.mode} ✓`);

  const studentDegree = norm(student.degree);
  const eligibleDegrees = new Set((opp.eligibility_degrees || []).map(norm).filter(Boolean));
  const degreeScore = !eligibleDegrees.size || eligibleDegrees.has(studentDegree) ? W_DEGREE : 0;
  if (degreeScore && eligibleDegrees.size) reasons.push("Degree eligible");

  const studentYear = student.year_of_study;
  const eligibleYears = opp.eligibility_years || [];
  const yearScore = !eligibleYears.length || (studentYear && eligibleYears.includes(studentYear)) ? W_YEAR : 0;

  const studentCity = norm(student.city);
  const oppCity = norm(opp.city);
  let locScore = 0;
  if (oppMode === "remote") locScore = W_LOCATION;
  else if (studentCity && oppCity && studentCity === oppCity) {
    locScore = W_LOCATION;
    reasons.push(`${opp.city} ✓`);
  }

  return { score: skillScore + domainScore + modeScore + degreeScore + yearScore + locScore, reasons };
}

export function studentSummary(student, result, extra = {}) {
  return {
    id: student.id,
    user_id: student.user_id,
    full_name: student.full_name,
    email: student.email,
    college_name_raw: student.college_name_raw,
    degree: student.degree,
    department: student.department,
    year_of_study: student.year_of_study,
    city: student.city,
    skills: student.skills || [],
    domains: student.domains || [],
    photo_url: student.photo_url,
    match_score: result.score,
    match_reasons: result.reasons,
    ...extra,
  };
}
