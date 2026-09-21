/**
 * Policy Gate —— 把 Computer Use 的确认策略编码成代码门槛。
 * 纯函数、无副作用，可脱离 cua 运行时单测。
 */

export const DEFAULT_ALLOWED_APPS = [
  "Calendar",
  "Calculator",
  "TextEdit",
  "NetEaseMusic",
  "Figma",
  "Google Chrome",
  "Codex In-app Browser",
];

/** 目标元素文案命中这些模式时，一律先停下确认（对齐 Computer Use 确认策略） */
export const SENSITIVE_LABEL_PATTERNS = [
  { id: "delete", re: /删除|移除|清空|delete|remove/i },
  { id: "send", re: /发送|提交|发布|回复|send|submit|post|reply/i },
  { id: "payment", re: /支付|付款|购买|下单|充值|订阅|开通|pay|purchase|buy|subscribe|checkout/i },
  { id: "auth", re: /授权|权限|登录|密码|验证码|authorize|permission|sign in|login|password|captcha/i },
  { id: "share", re: /上传|分享|导出|upload|share|export/i },
  { id: "install", re: /安装|install/i },
  { id: "settings", re: /系统设置|偏好设置|安全设置|system settings|security settings/i },
];

export const DEFAULT_THRESHOLDS = {
  doneProbability: 0.9, // 完成概率 ≥ 此值 → 结束
  riskConfirm: 0.2, // 风险概率 ≥ 此值 → 停下确认
  minConfidence: 0.5, // 目标置信度 < 此值 → 升级（重试/看图/问人）
  lowRiskMinConfidence: 0.4, // 零副作用 App（计算器/日历/文本编辑）放宽到 0.4
  stopConfidence: 0.3, // 目标置信度 < 此值 → 直接停
};

/** 零副作用、可随时重来的 App：置信度门槛可放宽（安全仍由 risk/敏感词把关） */
export const LOW_RISK_APPS = ["Calculator", "Calendar", "TextEdit", "Figma"];

export function matchSensitive(label = "") {
  const text = String(label);
  return SENSITIVE_LABEL_PATTERNS.find((p) => p.re.test(text)) ?? null;
}

/**
 * @param {object} input
 * @param {object} input.decision  normalizeDecision 的输出
 * @param {string} input.app
 * @param {string[]} [input.allowedApps]
 * @param {number} [input.step]
 * @param {number} [input.maxSteps]
 * @param {object} [input.thresholds]
 * @param {boolean} [input.dryRun]
 * @returns {{verdict:"proceed"|"done"|"confirm"|"escalate"|"stop", kind?:string, reasons:string[]}}
 */
export function evaluatePolicy({
  decision,
  app,
  allowedApps = DEFAULT_ALLOWED_APPS,
  step = 1,
  maxSteps = 30,
  thresholds = DEFAULT_THRESHOLDS,
  dryRun = false,
}) {
  const t = { ...DEFAULT_THRESHOLDS, ...thresholds };
  const fmt = (n) => (typeof n === "number" ? n.toFixed(2) : "n/a");

  if (step > maxSteps) {
    return { verdict: "stop", kind: "budget", reasons: [`step ${step} 超过上限 ${maxSteps}`] };
  }
  if (typeof decision?.done === "number" && decision.done >= t.doneProbability) {
    return { verdict: "done", reasons: [`完成概率 ${fmt(decision.done)}`] };
  }

  const reasons = [];
  if (!allowedApps.includes(app)) reasons.push(`App「${app}」不在白名单`);
  const sensitive = matchSensitive(decision?.targetLabel);
  if (sensitive) reasons.push(`目标疑似「${sensitive.id}」类敏感操作：${decision.targetLabel}`);
  if (typeof decision?.risk === "number" && decision.risk >= t.riskConfirm) {
    reasons.push(`Jev 风险判定 ${fmt(decision.risk)} ≥ ${t.riskConfirm}`);
  }
  if (decision?.action === "ask_user") reasons.push("Jev 判断需要用户介入");
  if (reasons.length) return { verdict: "confirm", kind: "sensitive", reasons, dryRun };

  if (![decision?.confidence, decision?.risk, decision?.done].every(n => Number.isFinite(n) && n >= 0 && n <= 1)) {
    return { verdict: "escalate", kind: "invalid_decision", reasons: ["决策概率缺失或超出 0–1"] };
  }
  if (typeof decision?.confidence === "number" && decision.confidence < t.stopConfidence) {
    return { verdict: "stop", kind: "low_confidence", reasons: [`目标置信度 ${fmt(decision.confidence)} < ${t.stopConfidence}`] };
  }
  const minConfidence = LOW_RISK_APPS.includes(app) ? t.lowRiskMinConfidence : t.minConfidence;
  if (typeof decision?.confidence === "number" && decision.confidence < minConfidence) {
    return {
      verdict: "escalate",
      kind: "low_confidence",
      reasons: [`目标置信度 ${fmt(decision.confidence)} < ${minConfidence}`],
      minConfidence,
    };
  }
  if (decision?.targetIndex == null && decision?.action !== "wait") {
    return { verdict: "escalate", kind: "no_target", reasons: ["没有选出目标元素"] };
  }

  return { verdict: "proceed", reasons: [] };
}
