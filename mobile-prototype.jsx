import { useState, useEffect, useRef } from "react";

const DS = {
  white: "#FFFFFF", black: "#1C2024",
  n2: "#F5F5F7", n3: "#F0F0F3", n4: "#E8E8EC", n5: "#E0E1E6",
  n7: "#A9AAB4", n8: "#90A0B2", n9: "#8B8D98", n10: "#80838D", n11: "#454950", n12: "#1C2024",
  a9: "#005BE2", a3: "#EBF3FF",
  red: "#E5484D", green: "#10B981",
  rSm: 4, rMd: 6, rLg: 10, rXl: 14, r2xl: 20,
  sans: "'Inter', -apple-system, sans-serif",
  display: "'Space Grotesk', 'Inter', sans-serif",
};

const STATUS = {
  pending:      { label: "Pending",    dot: "#F59E0B", text: "#92400E", bg: "#FFFBEB" },
  approved:     { label: "Approved",   dot: "#10B981", text: "#065F46", bg: "#ECFDF5" },
  flagged:      { label: "Flagged",    dot: "#EF4444", text: "#991B1B", bg: "#FEF2F2" },
  "wire-ready": { label: "Wire ready", dot: "#6366F1", text: "#3730A3", bg: "#EEF2FF" },
  completed:    { label: "Completed",  dot: "#6B7280", text: "#374151", bg: "#F9FAFB" },
};

const DECISIONS = [
  {
    id: "CAPCAL-1", title: "Capital call for $500k for eco companies",
    fund: "Greentech Opportunities Fund III, L.P.", entity: "Real Estate Holding LLC",
    gp: "Meridian Capital Partners", amount: 500000, commitment: 5000000,
    callNumber: 7, totalCalls: 12, drawnBefore: 0.42, drawnAfter: 0.52,
    dueDate: "2026-05-30", createdDate: "2026-05-08", status: "approved",
    approvals: [
      { id: "ap-1", role: "Investment lead", name: "Anastasiya Mudryk", initials: "AM", color: "#0D9488", status: "approved", timestamp: "3:59 PM" },
      { id: "ap-2", role: "CFO",             name: "Marcus Klein",      initials: "MK", color: "#0F766E", status: "pending" },
      { id: "ap-3", role: "Compliance",      name: "Maya Mehta",        initials: "MM", color: "#2563EB", status: "pending" },
    ],
    matchedInvestmentId: "INV-2024-014", matchedInvestmentName: "Greentech Opp. Fund III",
    matchConfidence: 98, priorCallsDrawn: 6,
    pdfName: "Meridian_CapCall_07_RE-Holding.pdf", pdfPages: 4, pdfSizeKb: 218,
    wireInstructions: { beneficiary: "Meridian Capital Partners III LP", bank: "First Republic Bank, NY", aba: "021000128", account: "···· 4419", swift: "FRBKUS00", reference: "CAPCAL-1 / RE Holding LLC" },
    activityLog: [
      { time: "3:59 PM", actor: "Anastasiya Mudryk", action: "Approved · Default Approval" },
      { time: "3:58 PM", actor: "Fojo Assistant",    action: "Matched to INV-2024-014 · 98% confidence", isAI: true },
      { time: "3:57 PM", actor: "Anastasiya Mudryk", action: "Set due date to May 30, 2026" },
      { time: "3:55 PM", actor: "Anastasiya Mudryk", action: "Created from Meridian_CapCall_07.pdf" },
    ],
  },
  {
    id: "CAPCAL-2", title: "Capital call — Q2 drawdown for infrastructure",
    fund: "Whitmore Real Assets Fund III, L.P.", entity: "Thornton Family Trust",
    gp: "Whitmore Capital Group", amount: 875000, commitment: 8750000,
    callNumber: 3, totalCalls: 8, drawnBefore: 0.22, drawnAfter: 0.32,
    dueDate: "2026-06-15", createdDate: "2026-05-10", status: "pending",
    approvals: [
      { id: "ap-4", role: "Investment lead", name: "Anastasiya Mudryk", initials: "AM", color: "#0D9488", status: "pending" },
      { id: "ap-5", role: "CFO",             name: "Marcus Klein",      initials: "MK", color: "#0F766E", status: "pending" },
    ],
    matchedInvestmentId: "INV-2023-007", matchedInvestmentName: "Whitmore Real Assets III",
    matchConfidence: 94, priorCallsDrawn: 2,
    pdfName: "Whitmore_CapCall_03_ThorntonTrust.pdf", pdfPages: 3, pdfSizeKb: 184,
    wireInstructions: { beneficiary: "Whitmore Real Assets Fund III LP", bank: "JPMorgan Chase, NY", aba: "021000021", account: "···· 7732", swift: "CHASUS33", reference: "CAPCAL-2 / Thornton Family Trust" },
    activityLog: [
      { time: "9:12 AM", actor: "Fojo Assistant",    action: "Matched to INV-2023-007 · 94% confidence", isAI: true },
      { time: "9:10 AM", actor: "Anastasiya Mudryk", action: "Created from Whitmore_CapCall_03.pdf" },
    ],
  },
];

function fmt(v) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(2)}M`;
  if (v >= 1000)    return `$${(v / 1000).toFixed(0)}K`;
  return `$${v.toLocaleString()}`;
}
function daysUntil(iso) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StatusBadge({ status }) {
  const s = STATUS[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, borderRadius: 9999, padding: "3px 10px", background: s.bg, color: s.text, fontSize: 11, fontWeight: 700 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

function Avatar({ initials, color, size = 32 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600, fontSize: size * 0.33, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function DrawnBar({ before, after }) {
  return (
    <div style={{ height: 5, borderRadius: 9999, background: DS.n3, overflow: "hidden", display: "flex" }}>
      <div style={{ width: `${before * 100}%`, background: DS.a9 }} />
      <div style={{ width: `${(after - before) * 100}%`, background: "#93C5FD" }} />
    </div>
  );
}

function Card({ children, style, onClick }) {
  const [pressed, setPressed] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseDown={() => onClick && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        background: DS.white, border: `1px solid ${DS.n4}`, borderRadius: DS.rXl,
        overflow: "hidden", transform: pressed ? "scale(0.98)" : "scale(1)",
        transition: "transform .1s", cursor: onClick ? "pointer" : "default", ...style,
      }}
    >{children}</div>
  );
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: DS.n9, marginBottom: 8 }}>{children}</div>;
}

function StatusBar() {
  return (
    <div style={{ height: 50, background: DS.white, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0 }}>
      <span style={{ fontSize: 15, fontWeight: 700, fontFamily: DS.sans, color: DS.black }}>9:41</span>
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
          <rect x="0" y="5" width="3" height="7" rx="1" fill={DS.n9} opacity=".3" />
          <rect x="4.5" y="3" width="3" height="9" rx="1" fill={DS.n9} opacity=".6" />
          <rect x="9" y="1" width="3" height="11" rx="1" fill={DS.n9} />
          <rect x="13.5" y="0" width="3" height="12" rx="1" fill={DS.n9} />
        </svg>
        <svg width="16" height="11" viewBox="0 0 16 11" fill={DS.n9}>
          <path d="M8 2C5.6 2 3.4 3 1.8 4.6L0 2.8C2.1 1 4.9 0 8 0s5.9 1 8 2.8L14.2 4.6C12.6 3 10.4 2 8 2z" opacity=".3" />
          <path d="M8 5.2C6.4 5.2 5 5.8 3.8 6.8L2 5C3.6 3.6 5.7 2.8 8 2.8s4.4.8 6 2.2L12.2 6.8C11 5.8 9.6 5.2 8 5.2z" opacity=".6" />
          <path d="M8 8.4c-1 0-1.8.4-2.4 1L8 11.4l2.4-2C9.8 8.8 9 8.4 8 8.4z" />
        </svg>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <div style={{ width: 23, height: 11, borderRadius: 3, border: `1.5px solid ${DS.n11}`, padding: "1.5px 2px", display: "flex", alignItems: "center" }}>
            <div style={{ width: "75%", height: "100%", background: DS.green, borderRadius: 1 }} />
          </div>
          <div style={{ width: 2, height: 5, background: DS.n11, borderRadius: 1, opacity: .4 }} />
        </div>
      </div>
    </div>
  );
}

function BottomNav({ screen, setScreen }) {
  const tabs = [
    { id: "home",      label: "Home",      icon: (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? DS.a9 : DS.n8} strokeWidth="1.8"><path d="M3 12L12 3l9 9" /><path d="M9 21V12h6v9" /><path d="M3 12v9h18V12" /></svg> },
    { id: "decisions", label: "Decisions", icon: (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? DS.a9 : DS.n8} strokeWidth="1.8"><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg> },
    { id: "documents", label: "Documents", icon: (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? DS.a9 : DS.n8} strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /></svg> },
    { id: "tasks",     label: "Tasks",     icon: (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? DS.a9 : DS.n8} strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 12l2 2 4-4" /></svg> },
    { id: "more",      label: "More",      icon: (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? DS.a9 : DS.n8} strokeWidth="1.8"><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></svg> },
  ];
  const pendingCount = DECISIONS.filter(d => d.status === "pending").length;
  return (
    <div style={{ height: 80, background: DS.white, borderTop: `1px solid ${DS.n4}`, display: "flex", flexShrink: 0 }}>
      {tabs.map(t => {
        const active = screen === t.id || (t.id === "decisions" && screen === "detail");
        return (
          <button key={t.id} onClick={() => setScreen(t.id)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 3, border: "none", background: "transparent", cursor: "pointer",
            borderTop: active ? `2px solid ${DS.a9}` : "2px solid transparent",
            paddingBottom: 16,
          }}>
            <div style={{ position: "relative" }}>
              {t.icon(active)}
              {t.id === "decisions" && pendingCount > 0 && (
                <div style={{ position: "absolute", top: -4, right: -6, width: 14, height: 14, borderRadius: "50%", background: DS.red, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#fff", fontWeight: 700 }}>
                  {pendingCount}
                </div>
              )}
            </div>
            <span style={{ fontSize: 10, fontWeight: 600, color: active ? DS.a9 : DS.n8, fontFamily: DS.sans }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function DecisionsScreen({ onOpen }) {
  const [filter, setFilter] = useState("All");
  const [showUpload, setShowUpload] = useState(false);
  const chips = ["All", "Due soon", "Pending", "High value", "Wire ready"];
  const total = DECISIONS.reduce((s, d) => s + d.amount, 0);
  const pending = DECISIONS.filter(d => d.status === "pending").reduce((s, d) => s + d.amount, 0);
  const nextDue = DECISIONS.map(d => d.dueDate).sort()[0];
  const days = daysUntil(nextDue);

  const filtered = DECISIONS.filter(d => {
    if (filter === "All")        return true;
    if (filter === "Pending")    return d.status === "pending";
    if (filter === "Due soon")   return daysUntil(d.dueDate) <= 21;
    if (filter === "High value") return d.amount >= 500000;
    if (filter === "Wire ready") return d.status === "wire-ready";
    return true;
  });

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: DS.n2, position: "relative" }}>
      {/* header */}
      <div style={{ background: DS.white, padding: "14px 20px 12px", borderBottom: `1px solid ${DS.n4}`, flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: DS.n9, marginBottom: 2 }}>Investment Workflow</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: DS.black, fontFamily: DS.display }}>Decisions</div>
          </div>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#0D9488", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>AM</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* KPI strip */}
        <div style={{ display: "flex", gap: 10, padding: "12px 16px 8px" }}>
          {[
            { top: "Total pipeline",     val: fmt(total),   sub: `${DECISIONS.length} decisions`, subColor: DS.n9 },
            { top: "Awaiting approval",  val: fmt(pending), sub: "1 decision",                    subColor: "#D97706" },
            { top: "Next due",           val: "May 30",     sub: `${days} days`,                  subColor: days <= 14 ? "#D97706" : DS.n9 },
          ].map((k, i) => (
            <div key={i} style={{ flex: 1, background: DS.white, border: `1px solid ${DS.n4}`, borderRadius: DS.rXl, padding: "10px 12px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: DS.n9, marginBottom: 3 }}>{k.top}</div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: DS.display, color: DS.black, letterSpacing: "-.02em" }}>{k.val}</div>
              <div style={{ fontSize: 10, fontWeight: 500, color: k.subColor, marginTop: 2 }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* chips */}
        <div style={{ display: "flex", gap: 8, padding: "0 16px 10px", overflowX: "auto" }}>
          {chips.map(ch => {
            const active = filter === ch;
            const warn = (ch === "Pending" || ch === "Due soon") && !active;
            return (
              <button key={ch} onClick={() => setFilter(ch)} style={{
                flexShrink: 0, borderRadius: 9999, padding: "6px 14px", fontSize: 12, fontWeight: 600,
                border:      active ? `1px solid ${DS.a9}` : warn ? `1px solid #FDE68A` : `1px solid ${DS.n5}`,
                background:  active ? DS.a3 : warn ? "#FFFBEB" : DS.white,
                color:       active ? DS.a9 : warn ? "#92400E" : DS.n10,
                cursor: "pointer", fontFamily: DS.sans,
              }}>{ch}</button>
            );
          })}
        </div>

        {/* cards */}
        <div style={{ padding: "0 16px 100px" }}>
          {filtered.map(d => {
            const dDays = daysUntil(d.dueDate);
            const s = STATUS[d.status];
            return (
              <div key={d.id} onClick={() => onOpen(d.id)} style={{
                background: DS.white, border: `1px solid ${DS.n4}`, borderRadius: DS.rXl,
                overflow: "hidden", marginBottom: 12, cursor: "pointer", transition: "transform .1s",
              }}>
                <div style={{ height: 4, background: s.dot }} />
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <StatusBadge status={d.status} />
                    <span style={{ fontSize: 11, fontFamily: "monospace", color: DS.n8 }}>#{d.callNumber} of {d.totalCalls}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: DS.black, lineHeight: 1.3, marginBottom: 2 }}>{d.title}</div>
                  <div style={{ fontSize: 11, color: DS.n9, marginBottom: 12 }}>{d.fund}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 }}>
                    <div style={{ fontSize: 24, fontWeight: 700, fontFamily: DS.display, color: DS.black, letterSpacing: "-.02em" }}>{fmt(d.amount)}</div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: dDays <= 14 ? "#D97706" : DS.n11 }}>{fmtDate(d.dueDate)}</div>
                      <div style={{ fontSize: 10, color: dDays <= 14 ? "#D97706" : DS.n9 }}>{dDays} days</div>
                    </div>
                  </div>
                  <DrawnBar before={d.drawnBefore} after={d.drawnAfter} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                    <span style={{ fontSize: 10, color: DS.n9 }}>Drawn {Math.round(d.drawnBefore * 100)}% → {Math.round(d.drawnAfter * 100)}%</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ display: "flex" }}>
                        {d.approvals.slice(0, 3).map((a, i) => (
                          <div key={a.id} style={{ width: 18, height: 18, borderRadius: "50%", background: a.color, border: `2px solid ${DS.white}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, color: "#fff", fontWeight: 700, marginLeft: i > 0 ? -6 : 0 }}>{a.initials[0]}</div>
                        ))}
                      </div>
                      <span style={{ fontSize: 10, color: DS.n9 }}>{d.approvals.filter(a => a.status === "approved").length}/{d.approvals.length} approvals</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: DS.n9, fontSize: 14 }}>No decisions match</div>
          )}
        </div>
      </div>

      {/* FAB */}
      <button onClick={() => setShowUpload(true)} style={{
        position: "absolute", bottom: 96, right: 20,
        width: 52, height: 52, borderRadius: "50%", background: DS.a9, border: "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", boxShadow: "0 4px 16px rgba(0,91,226,.35)",
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
      </button>

      {showUpload && <UploadSheet onClose={() => setShowUpload(false)} />}
    </div>
  );
}

function UploadSheet({ onClose }) {
  const [phase, setPhase] = useState("drop");
  const [visible, setVisible] = useState(0);
  const timers = useRef([]);
  const fields = [
    { label: "Fund / GP",       val: "Greentech Opp. Fund III, L.P.",     conf: 99 },
    { label: "Limited partner", val: "Real Estate Holding LLC",            conf: 98 },
    { label: "Amount called",   val: "$500,000.00 USD",                    conf: 99 },
    { label: "Call #",          val: "Call #07 of 12",                     conf: 95 },
    { label: "Due date",        val: "May 30, 2026 · 5:00 PM ET",          conf: 97 },
    { label: "Wire",            val: "First Republic · ABA 021000128",     conf: 96 },
  ];

  useEffect(() => {
    if (phase === "extracting") {
      fields.forEach((_, i) => {
        const t = setTimeout(() => setVisible(v => v + 1), 400 + i * 450);
        timers.current.push(t);
      });
    }
    return () => timers.current.forEach(clearTimeout);
  }, [phase]);

  const allDone = visible >= fields.length;

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", zIndex: 50 }}>
      <div onClick={onClose} style={{ flex: 1, background: "rgba(0,0,0,.4)" }} />
      <div style={{ background: DS.white, borderRadius: "22px 22px 0 0", boxShadow: "0 -4px 24px rgba(0,0,0,.12)" }}>
        <div style={{ width: 36, height: 4, borderRadius: 9999, background: DS.n4, margin: "10px auto 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px 10px" }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: DS.black }}>New capital call</div>
            <div style={{ fontSize: 12, color: DS.n9, marginTop: 1 }}>Upload a PDF notice from the GP</div>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: "50%", background: DS.n3, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={DS.n9} strokeWidth="1.8"><line x1="1" y1="1" x2="11" y2="11" /><line x1="11" y1="1" x2="1" y2="11" /></svg>
          </button>
        </div>

        <div style={{ padding: "0 16px 32px" }}>
          {phase === "drop" && (
            <div>
              <div onClick={() => setPhase("extracting")} style={{
                border: `2px dashed ${DS.n5}`, borderRadius: DS.rXl, background: DS.n2,
                padding: "32px 20px", textAlign: "center", cursor: "pointer", marginBottom: 14,
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={DS.n7} strokeWidth="1.6" style={{ margin: "0 auto 10px", display: "block" }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                <div style={{ fontSize: 14, fontWeight: 600, color: DS.n11, marginBottom: 4 }}>Drop a PDF or tap to browse</div>
                <div style={{ fontSize: 11, color: DS.n9 }}>PDF only · max 50 MB</div>
              </div>
              <div style={{ fontSize: 12, color: DS.n9, textAlign: "center", marginBottom: 10 }}>— or select from Thornton Documents —</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {["Meridian_CapCall_07.pdf", "Whitmore_CapCall_03.pdf", "GP_Notice_2026.pdf"].map((f, i) => (
                  <div key={i} onClick={() => setPhase("extracting")} style={{ cursor: "pointer", textAlign: "center" }}>
                    <div style={{ background: DS.n2, border: `1px solid ${DS.n4}`, borderRadius: DS.rLg, padding: "10px 8px 6px", marginBottom: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ width: 36, height: 46, background: "#fff", border: `1px solid ${DS.n4}`, borderRadius: 4, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: 4, position: "relative" }}>
                        <div style={{ position: "absolute", top: 0, right: 0, background: DS.red, borderRadius: "0 4px 0 4px", padding: "1px 3px", fontSize: 7, color: "#fff", fontWeight: 700 }}>PDF</div>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: i === 0 ? "#7C3AED" : i === 1 ? "#059669" : "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", fontWeight: 700 }}>$</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 9, color: DS.n9, lineHeight: 1.3 }}>{f.slice(0, 14)}…</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {phase === "extracting" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: DS.n2, borderRadius: DS.rLg, marginBottom: 14 }}>
                <div style={{ width: 30, height: 36, background: "#fff", border: `1px solid ${DS.n4}`, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: 0, right: 0, background: DS.red, borderRadius: "0 3px 0 3px", padding: "1px 3px", fontSize: 6, color: "#fff", fontWeight: 700 }}>PDF</div>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={DS.n9} strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: DS.black }}>Meridian_CapCall_07_RE-Holding.pdf</div>
                  <div style={{ fontSize: 10, color: DS.n9 }}>{allDone ? "Extraction complete" : "Fojo is reading…"}</div>
                </div>
              </div>

              <div style={{ border: `1px solid ${DS.n4}`, borderRadius: DS.rXl, overflow: "hidden", marginBottom: 14 }}>
                <div style={{ padding: "10px 14px", background: DS.n2, borderBottom: `1px solid ${DS.n4}`, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: DS.black }}>Fojo extraction</span>
                  <span style={{ fontSize: 10, background: "#F3E8FF", color: "#6D28D9", borderRadius: 9999, padding: "2px 8px", fontWeight: 600 }}>AI</span>
                </div>
                {fields.slice(0, visible).map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", borderBottom: i < visible - 1 ? `1px solid ${DS.n4}` : "none" }}>
                    <div style={{ fontSize: 11, color: DS.n9, width: 100, flexShrink: 0 }}>{f.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#7C3AED", flex: 1 }}>{f.val}</div>
                    <div style={{ fontSize: 10, color: DS.n8 }}>{f.conf}%</div>
                  </div>
                ))}
                {visible < fields.length && (
                  <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${DS.a9}`, borderTopColor: "transparent", animation: "spin 0.6s linear infinite" }} />
                    <span style={{ fontSize: 11, color: DS.n9 }}>Extracting…</span>
                  </div>
                )}
              </div>

              {allDone && (
                <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: DS.rLg, padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>✓</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#065F46" }}>Matched to investment · 98%</div>
                    <div style={{ fontSize: 11, color: "#059669" }}>INV-2024-014 · Greentech Opp. Fund III</div>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={onClose} style={{ flex: 1, padding: 11, borderRadius: DS.rLg, border: `1px solid ${DS.n5}`, background: "transparent", fontSize: 14, fontWeight: 600, color: DS.n11, cursor: "pointer" }}>Cancel</button>
                <button onClick={onClose} disabled={!allDone} style={{ flex: 2, padding: 11, borderRadius: DS.rLg, border: "none", background: allDone ? DS.a9 : DS.n5, color: allDone ? "#fff" : DS.n9, fontSize: 14, fontWeight: 600, cursor: allDone ? "pointer" : "not-allowed", transition: "background .2s" }}>
                  Create record →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

function DetailScreen({ id, onBack }) {
  const decision = DECISIONS.find(d => d.id === id);
  const [tab, setTab] = useState("overview");
  const [approvals, setApprovals] = useState(decision.approvals);
  const [localStatus, setLocalStatus] = useState(decision.status);

  const approve = (apId) => {
    setApprovals(prev => prev.map(a =>
      a.id === apId
        ? { ...a, status: "approved", timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
        : a
    ));
  };

  const allApproved = approvals.every(a => a.status === "approved");

  const verifyFields = [
    { label: "Fund / GP",      extracted: decision.fund,                                    onFile: decision.fund,       conf: 99 },
    { label: "Limited partner",extracted: decision.entity,                                  onFile: decision.entity,     conf: 98 },
    { label: "Amount",         extracted: fmt(decision.amount) + " USD",                    onFile: fmt(decision.amount), conf: 99 },
    { label: "Call number",    extracted: `Call #0${decision.callNumber}`,                  onFile: `${decision.priorCallsDrawn} of ${decision.totalCalls} prior`, conf: 95 },
    { label: "Deadline",       extracted: fmtDate(decision.dueDate) + " · 5:00 PM ET",     onFile: `T+${daysUntil(decision.dueDate)} days · LPA window`, conf: 97 },
    { label: "Wire",           extracted: `${decision.wireInstructions.bank.split(",")[0]} · ABA ${decision.wireInstructions.aba}`, onFile: "On file · unchanged", conf: 96 },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: DS.n2 }}>
      {/* top nav */}
      <div style={{ background: DS.white, borderBottom: `1px solid ${DS.n4}`, padding: "0 16px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 4, border: "none", background: "transparent", cursor: "pointer", color: DS.n10, fontSize: 14, fontWeight: 600, padding: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={DS.a9} strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          Decisions
        </button>
        <div style={{ fontSize: 14, fontWeight: 700, color: DS.black, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {decision.id}
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={DS.n9} strokeWidth="1.8"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={DS.n9} strokeWidth="1.8"><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></svg>
        </div>
      </div>

      {/* meta strip */}
      <div style={{ background: DS.n2, borderBottom: `1px solid ${DS.n4}`, padding: "8px 16px", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", flexShrink: 0 }}>
        <StatusBadge status={localStatus} />
        <span style={{ color: DS.n7, fontSize: 11 }}>·</span>
        <span style={{ fontSize: 11, fontFamily: "monospace", color: DS.n8 }}>{decision.id}</span>
        <span style={{ color: DS.n7, fontSize: 11 }}>·</span>
        <span style={{ fontSize: 11, color: DS.n9 }}>Call #{decision.callNumber} of {decision.totalCalls}</span>
        <span style={{ color: DS.n7, fontSize: 11 }}>·</span>
        <span style={{ fontSize: 11, color: DS.n9 }}>Created {fmtDate(decision.createdDate)}</span>
      </div>

      {/* tab bar */}
      <div style={{ background: DS.white, borderBottom: `1px solid ${DS.n4}`, display: "flex", padding: "0 16px", flexShrink: 0 }}>
        {["overview", "verify", "activity"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "12px 16px 10px", border: "none", background: "transparent",
            fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: DS.sans,
            color: tab === t ? DS.a9 : DS.n10,
            borderBottom: tab === t ? `2px solid ${DS.a9}` : "2px solid transparent",
          }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === "verify" && (
              <span style={{ marginLeft: 5, background: "#ECFDF5", color: "#065F46", borderRadius: 9999, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>6/6</span>
            )}
          </button>
        ))}
      </div>

      {/* tab content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 24px" }}>

        {tab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* numbers */}
            <Card>
              <div style={{ padding: "14px 16px" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: DS.black, marginBottom: 14 }}>The numbers</div>
                {[
                  { lbl: "Amount called",   val: fmt(decision.amount),          sub: `${Math.round((decision.drawnAfter - decision.drawnBefore) * 100)}% of ${fmt(decision.commitment)} commitment` },
                  { lbl: "Funding deadline", val: fmtDate(decision.dueDate),    sub: `${daysUntil(decision.dueDate)} days · 5:00 PM ET` },
                ].map((r, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: DS.n9, marginBottom: 3 }}>{r.lbl}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, fontFamily: DS.display, color: DS.black, letterSpacing: "-.02em" }}>{r.val}</div>
                    <div style={{ fontSize: 11, color: DS.n9, marginTop: 1 }}>{r.sub}</div>
                  </div>
                ))}
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: DS.n9, marginBottom: 6 }}>Drawn after this call</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: DS.n9, marginBottom: 4 }}>
                  <span>{Math.round(decision.drawnBefore * 100)}% before</span>
                  <span style={{ fontWeight: 600, color: DS.a9 }}>{Math.round(decision.drawnAfter * 100)}% after</span>
                </div>
                <DrawnBar before={decision.drawnBefore} after={decision.drawnAfter} />
              </div>
            </Card>

            {/* approvals */}
            <Card>
              <div style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: DS.black }}>Approval workflow</div>
                  <div style={{ fontSize: 11, color: DS.n9 }}>{approvals.filter(a => a.status === "approved").length} of {approvals.length}</div>
                </div>
                {approvals.map((a, i) => (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 10, paddingBottom: 10, borderBottom: i < approvals.length - 1 ? `1px solid ${DS.n4}` : "none" }}>
                    <Avatar initials={a.initials} color={a.color} size={32} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: DS.black }}>{a.name}</div>
                      <div style={{ fontSize: 11, color: DS.n9 }}>{a.role}</div>
                    </div>
                    {a.status === "approved"
                      ? <span style={{ fontSize: 11, fontWeight: 600, background: "#ECFDF5", color: "#065F46", borderRadius: 9999, padding: "3px 10px" }}>✓ {a.timestamp}</span>
                      : allApproved
                        ? <span style={{ fontSize: 11, fontWeight: 600, background: "#ECFDF5", color: "#065F46", borderRadius: 9999, padding: "3px 10px" }}>✓ Just now</span>
                        : <button onClick={() => approve(a.id)} style={{ fontSize: 12, fontWeight: 600, color: DS.a9, background: DS.a3, border: `1px solid ${DS.a9}`, borderRadius: DS.rMd, padding: "5px 10px", cursor: "pointer" }}>Approve →</button>
                    }
                  </div>
                ))}
              </div>
            </Card>

            {/* match */}
            <Card>
              <div style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: DS.black }}>Matched investment</div>
                  <span style={{ fontSize: 11, fontWeight: 700, background: "#F3E8FF", color: "#6D28D9", borderRadius: 9999, padding: "3px 10px" }}>{decision.matchConfidence}%</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: DS.rMd, background: DS.n12, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15, fontWeight: 700, flexShrink: 0 }}>G</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: DS.black }}>{decision.matchedInvestmentName}</div>
                    <div style={{ fontSize: 11, color: DS.n9 }}>{decision.matchedInvestmentId} · {decision.priorCallsDrawn} of {decision.totalCalls} prior calls drawn</div>
                  </div>
                </div>
                <div style={{ marginTop: 10, fontSize: 11, fontWeight: 600, color: DS.a9 }}>Open record →</div>
              </div>
            </Card>
          </div>
        )}

        {tab === "verify" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* PDF mock */}
            <Card>
              <div style={{ padding: "12px 14px 10px", borderBottom: `1px solid ${DS.n4}`, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 34, background: "#fff", border: `1px solid ${DS.n4}`, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
                  <div style={{ position: "absolute", top: 0, right: 0, background: DS.red, borderRadius: "0 3px 0 3px", padding: "1px 3px", fontSize: 6, color: "#fff", fontWeight: 700 }}>PDF</div>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={DS.n8} strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: DS.black }}>{decision.pdfName}</div>
                  <div style={{ fontSize: 11, color: DS.n9 }}>{decision.pdfPages} pages · {decision.pdfSizeKb} KB</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: DS.a9 }}>View ↗</span>
              </div>
              <div style={{ padding: "12px 14px", background: "#FAFAF8", fontFamily: "Georgia, serif", fontSize: 11, lineHeight: 1.8, maxHeight: 200, overflowY: "auto" }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", borderBottom: `1px solid ${DS.n4}`, paddingBottom: 6, marginBottom: 8, color: DS.n11 }}>Meridian Capital Partners · 545 Madison Ave · New York, NY 10022</div>
                <div style={{ fontSize: 10, color: DS.n9, marginBottom: 6 }}>CAPITAL CALL NOTICE · CALL #07</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: DS.black, marginBottom: 4 }}>{decision.fund}</div>
                <div style={{ fontSize: 11, color: DS.n11, marginBottom: 8 }}>To: {decision.entity}</div>
                <div style={{ background: "#fff", border: `1px solid ${DS.n4}`, borderRadius: 4, padding: "8px 10px", marginBottom: 8 }}>
                  <div style={{ fontSize: 9, color: DS.n9, textTransform: "uppercase" }}>Capital Contribution Due</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: DS.black }}>{fmt(decision.amount)} USD</div>
                  <div style={{ fontSize: 9, color: DS.n9 }}>{Math.round((decision.drawnAfter - decision.drawnBefore) * 100)}% of ${(decision.commitment / 1000000).toFixed(0)}M commitment</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
                  <div><div style={{ fontSize: 9, color: DS.n9 }}>NOTICE DATE</div><div style={{ fontSize: 11 }}>{fmtDate(decision.createdDate)}</div></div>
                  <div><div style={{ fontSize: 9, color: DS.n9 }}>FUNDING DEADLINE</div><div style={{ fontSize: 11 }}>{fmtDate(decision.dueDate)}</div></div>
                </div>
                <div style={{ fontSize: 9, color: DS.n9, fontWeight: 700, marginBottom: 4 }}>WIRE INSTRUCTIONS</div>
                {Object.entries(decision.wireInstructions).map(([k, v]) => (
                  <div key={k} style={{ fontSize: 10, color: DS.n11 }}><span style={{ color: DS.n9 }}>{k.charAt(0).toUpperCase() + k.slice(1)}:</span> {v}</div>
                ))}
              </div>
            </Card>

            {/* fields */}
            <Card>
              <div style={{ padding: "12px 14px 10px", borderBottom: `1px solid ${DS.n4}`, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: DS.black }}>Field verification</span>
                <span style={{ fontSize: 10, background: "#ECFDF5", color: "#065F46", borderRadius: 9999, padding: "2px 8px", fontWeight: 700 }}>6 / 6 match</span>
                <span style={{ marginLeft: "auto", fontSize: 10, background: "#F3E8FF", color: "#6D28D9", borderRadius: 9999, padding: "2px 8px", fontWeight: 600 }}>Fojo AI</span>
              </div>
              {verifyFields.map((f, i) => (
                <div key={i} style={{ padding: "10px 14px", borderBottom: i < verifyFields.length - 1 ? `1px solid ${DS.n4}` : "none" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: DS.n9, marginBottom: 3 }}>{f.label}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#7C3AED" }}>{f.extracted}</div>
                    <span style={{ fontSize: 10, fontWeight: 700, background: "#ECFDF5", color: "#065F46", borderRadius: 9999, padding: "2px 8px", flexShrink: 0, marginLeft: 8 }}>✓ MATCH</span>
                  </div>
                  <div style={{ fontSize: 10, color: DS.n8, marginTop: 1 }}>On file: {f.onFile} · {f.conf}%</div>
                </div>
              ))}
            </Card>

            {/* action footer */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {localStatus === "completed" ? (
                <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: DS.rXl, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>✓</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#065F46" }}>Wire executed</div>
                    <div style={{ fontSize: 11, color: "#059669" }}>{fmt(decision.amount)} sent to {decision.wireInstructions.beneficiary}</div>
                  </div>
                </div>
              ) : localStatus === "wire-ready" ? (
                <button onClick={() => setLocalStatus("completed")} style={{ width: "100%", padding: "13px", borderRadius: DS.rXl, border: "none", background: "#4F46E5", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#818CF8", animation: "pulse 1.5s infinite" }} />
                  Execute wire →
                </button>
              ) : (
                <>
                  <button onClick={() => setLocalStatus("wire-ready")} style={{ width: "100%", padding: "13px", borderRadius: DS.rXl, border: "none", background: DS.a9, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                    Confirm &amp; schedule wire →
                  </button>
                  <button style={{ width: "100%", padding: "12px", borderRadius: DS.rXl, border: `1px solid ${DS.n5}`, background: "transparent", fontSize: 14, fontWeight: 600, color: DS.n11, cursor: "pointer" }}>
                    Flag for review
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {tab === "activity" && (
          <div>
            <SectionLabel>Activity log</SectionLabel>
            <Card style={{ marginBottom: 20 }}>
              {decision.activityLog.map((e, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "12px 14px", borderBottom: i < decision.activityLog.length - 1 ? `1px solid ${DS.n4}` : "none" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: e.isAI ? "#F3E8FF" : "#E0F2FE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>
                      {e.isAI
                        ? <span style={{ fontSize: 14 }}>🤖</span>
                        : <span style={{ fontSize: 11, fontWeight: 700, color: "#0369A1" }}>{e.actor.split(" ").map(w => w[0]).join("").slice(0, 2)}</span>
                      }
                    </div>
                    {i < decision.activityLog.length - 1 && <div style={{ width: 1, flex: 1, minHeight: 16, background: DS.n4, marginTop: 2 }} />}
                  </div>
                  <div style={{ flex: 1, paddingBottom: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: DS.black }}>{e.actor}</span>
                      {e.isAI && <span style={{ fontSize: 10, background: "#F3E8FF", color: "#6D28D9", borderRadius: 9999, padding: "1px 6px", fontWeight: 600 }}>AI</span>}
                    </div>
                    <div style={{ fontSize: 11, color: DS.n9, marginBottom: 2 }}>{e.action}</div>
                    <div style={{ fontSize: 10, color: DS.n8 }}>{e.time}</div>
                  </div>
                </div>
              ))}
            </Card>

            <SectionLabel>Call history — {decision.matchedInvestmentName}</SectionLabel>
            <Card>
              <div style={{ padding: "0 14px" }}>
                {[...Array(Math.min(decision.callNumber, 4))].map((_, i) => {
                  const isCurrent = i === Math.min(decision.callNumber, 4) - 1;
                  const num = isCurrent ? decision.callNumber : i + 1;
                  return (
                    <div key={i} style={{
                      display: "grid", gridTemplateColumns: "32px 1fr 60px 72px", gap: 8, alignItems: "center",
                      padding: "9px 0", borderBottom: i < Math.min(decision.callNumber, 4) - 1 ? `1px solid ${DS.n4}` : "none",
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: isCurrent ? DS.a9 : DS.n9 }}>#{num}</div>
                      <div style={{ fontSize: 11, color: DS.n9 }}>{isCurrent ? "May 2026" : num === 1 ? "Mar 2022" : num === 2 ? "Sep 2022" : "Jun 2023"}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: DS.black }}>{fmt(isCurrent ? decision.amount : decision.amount * 0.85 + num * 8000)}</div>
                      <StatusBadge status={isCurrent ? localStatus : "completed"} />
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("decisions");
  const [detailId, setDetailId] = useState(null);

  const openDetail = (id) => { setDetailId(id); setScreen("detail"); };
  const goBack = () => { setScreen("decisions"); setDetailId(null); };
  const navSetScreen = (s) => { if (s !== "detail") setDetailId(null); setScreen(s); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent }
        body { background: #E0E1E6; min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: 'Inter', -apple-system, sans-serif }
        ::-webkit-scrollbar { display: none }
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: .4 } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
        {/* iPhone frame */}
        <div style={{
          width: 420, position: "relative",
          background: "#2a2a2a", borderRadius: 56, padding: "10px",
          boxShadow: "0 0 0 1px #111, 0 0 0 2px #3a3a3a, 0 0 0 3px #222, 0 32px 80px rgba(0,0,0,.55), inset 0 0 0 1px #444",
        }}>
          {/* side buttons */}
          <div style={{ position: "absolute", left: -3, top: 130, width: 4, height: 34, background: "#444", borderRadius: "3px 0 0 3px" }} />
          <div style={{ position: "absolute", left: -3, top: 178, width: 4, height: 68, background: "#444", borderRadius: "3px 0 0 3px" }} />
          <div style={{ position: "absolute", left: -3, top: 258, width: 4, height: 68, background: "#444", borderRadius: "3px 0 0 3px" }} />
          <div style={{ position: "absolute", right: -3, top: 178, width: 4, height: 90, background: "#444", borderRadius: "0 3px 3px 0" }} />

          {/* screen */}
          <div style={{ background: DS.white, borderRadius: 48, overflow: "hidden", position: "relative" }}>
            {/* dynamic island */}
            <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", width: 118, height: 34, background: "#000", borderRadius: 22, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#111", border: "1.5px solid #2a2a2a" }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0a1a0a", border: "1px solid #1a3a1a" }} />
            </div>

            <div style={{ width: "100%", height: 860, display: "flex", flexDirection: "column", fontFamily: DS.sans }}>
              <StatusBar />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {screen === "decisions" && <DecisionsScreen onOpen={openDetail} />}
                {screen === "detail" && detailId && <DetailScreen id={detailId} onBack={goBack} />}
                {screen === "home" && (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, color: DS.n9 }}>
                    <div style={{ fontSize: 32 }}>🏠</div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>Home screen</div>
                    <button onClick={() => setScreen("decisions")} style={{ fontSize: 12, color: DS.a9, background: "none", border: "none", cursor: "pointer" }}>Go to Decisions →</button>
                  </div>
                )}
                {(screen === "documents" || screen === "tasks" || screen === "more") && (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, color: DS.n9 }}>
                    <div style={{ fontSize: 32 }}>{screen === "documents" ? "📄" : screen === "tasks" ? "✅" : "⋯"}</div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{screen.charAt(0).toUpperCase() + screen.slice(1)}</div>
                    <button onClick={() => setScreen("decisions")} style={{ fontSize: 12, color: DS.a9, background: "none", border: "none", cursor: "pointer" }}>Go to Decisions →</button>
                  </div>
                )}
              </div>
              <BottomNav screen={screen} setScreen={navSetScreen} />
              {/* home indicator */}
              <div style={{ height: 8, display: "flex", alignItems: "center", justifyContent: "center", background: DS.white }}>
                <div style={{ width: 130, height: 5, borderRadius: 9999, background: DS.n4 }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
