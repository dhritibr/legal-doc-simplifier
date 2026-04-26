const DANGER_KEYWORDS = [
  'forfeit', 'forfeiture', 'non-refundable', 'waive all rights',
  'unlimited liability', 'indemnify', 'indemnification',
  'irrevocable', 'perpetual license', 'sole discretion',
  'terminate without notice', 'without cause', 'no recourse',
  'penalty', 'liquidated damages', 'automatic renewal',
  'unilaterally', 'without consent', 'personal guarantee',
  'seize', 'confiscate', 'blacklist'
];

const WARNING_KEYWORDS = [
  'subject to change', 'may be modified', 'at our discretion',
  'reasonable notice', 'best efforts', 'as is',
  'no warranty', 'disclaim', 'limitation of liability',
  'arbitration', 'jurisdiction', 'governing law',
  'confidential', 'non-compete', 'exclusivity',
  'assignment', 'sublicense', 'right to audit'
];

const escalateRisk = (clause) => {
  const textToCheck = (clause.original + ' ' + clause.simplified).toLowerCase();

  const hasDanger  = DANGER_KEYWORDS.some(kw => textToCheck.includes(kw.toLowerCase()));
  const hasWarning = WARNING_KEYWORDS.some(kw => textToCheck.includes(kw.toLowerCase()));

  if (clause.riskLevel === 'danger') return clause;

  if (hasDanger) {
    return {
      ...clause,
      riskLevel: 'danger',
      riskReason: clause.riskReason ||
        'This clause contains terms that are potentially exploitative or heavily one-sided.'
    };
  }

  if (hasWarning && clause.riskLevel === 'safe') {
    return {
      ...clause,
      riskLevel: 'warning',
      riskReason: clause.riskReason ||
        'This clause needs careful attention before signing.'
    };
  }

  return clause;
};

const tagRisks = (clauses) => clauses.map(escalateRisk);

module.exports = { tagRisks };