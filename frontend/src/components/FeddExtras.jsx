import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Bot, Download, FileText, HandHeart, Leaf, Lock, MapPin, Pencil, Save, Search, Send, ShieldCheck, Sparkles, Trash2, Truck, Users, X } from "lucide-react";
import { api } from "../lib/api";

// Copy for the screens in this file, merged over App.js's `copy` so `t` stays one object.
export const extraCopy = {
  en: {
    // Landing — NGO section
    ngoKicker: "FOR NGO PARTNERS",
    ngoTitle1: "Good food, ready for pickup.",
    ngoTitleSpan: "Free for NGOs, always.",
    ngoBenefits: [
      ["Verified surplus near you", "See fresh surplus from restaurants in your city the moment it's listed — item, quantity, food type and pickup window, all up front.", "pin"],
      ["Claim in one tap, plan the run", "Claim a listing before anyone else, then track every pickup from claimed to collected so your volunteers always know where to go.", "truck"],
      ["Proof of your impact", "Every completed rescue adds to your record of kilograms rescued and meals served — numbers you can share with donors and CSR partners.", "heart"],
    ],
    ngoCta: "Join as NGO",
    adminFooterLink: "Admin",
    adminCreateLine: "Have an admin invite code?",
    adminCreateLink: "Create admin account",
    // Pricing — what each plan unlocks
    basicFeatures: ["Monthly food report", "One-click CSV export", "Donation & impact summary"],
    proFeatures: ["Everything in Basic", "AI kitchen assistant", "Smart prep recommendations"],
    subscriptionPromoKicker: "UPGRADE",
    subscriptionPromoTitle: "Unlock your food report",
    subscriptionPromoText: "Basic (₹100/month) adds a monthly food report with CSV export. Pro (₹200/month) adds an AI kitchen assistant.",
    // Restaurant nav
    reportsNav: "Food report",
    assistantNav: "AI assistant",
    freePlan: "Free",
    basicPlanName: "Basic plan",
    proPlanName: "Pro plan",
    // Locked state
    lockedKicker: "PAID FEATURE",
    lockedReportsTitle: "Your food report is part of Basic",
    lockedReportsText: "Subscribe to Basic (₹100/month) to get a monthly food report, a CSV export of every log, and a summary of what you've donated.",
    lockedAssistantTitle: "The AI assistant is part of Pro",
    lockedAssistantText: "Upgrade to Pro (₹200/month) to ask an AI assistant about your own waste data and get prep recommendations.",
    pendingNote: "Your payment is being verified — this unlocks as soon as an admin approves it.",
    seePlans: "See plans",
    // Reports
    reportsEyebrow: "RESTAURANT / REPORT",
    reportsTitle: "Food report",
    reportsSub: "What left your kitchen, what it cost, and how much reached people instead of the bin.",
    thisMonth: "This month",
    allTime: "All time",
    rLogged: "Food logged",
    rEntries: "entries",
    rCost: "Estimated cost",
    rCostNote: "at ₹96 / kg",
    rDonated: "Donated to NGOs",
    rDonatedNote: "picked up by NGOs",
    rMeals: "Meals provided",
    rMealsNote: "≈ 400 g per meal",
    topItems: "Top items",
    byCategory: "By category",
    itemCol: "Item",
    kgCol: "kg",
    shareCol: "Share",
    downloadCsv: "Download CSV",
    csvDone: "Report downloaded",
    noReportData: "Nothing logged in this period yet",
    noReportDataText: "Log surplus and your report fills in automatically.",
    // Assistant
    assistantEyebrow: "RESTAURANT / PRO",
    assistantTitle: "AI kitchen assistant",
    assistantSub: "Ask about your own waste data — it reads your recent logs before answering.",
    assistantPlaceholder: "e.g. What should I prep less of this week?",
    assistantSuggestions: ["What am I wasting the most?", "How can I cut rice waste?", "When should I list surplus for NGOs?"],
    assistantHello: "Hi! I've read your recent logs. Ask me anything about your kitchen's surplus.",
    thinking: "Thinking…",
    send: "Send",
    // Admin
    adminRestaurantsNav: "Restaurants",
    adminNgosNav: "NGOs",
    adminLogsNav: "Food logs",
    adminClaimsNav: "Pickups",
    impactTitle: "Platform impact",
    impactLogged: "Food logged",
    impactDonated: "Food donated",
    impactMeals: "Meals provided",
    impactCo2: "CO₂e avoided",
    impactNote: "Estimates: 400 g per meal, 2.5 kg CO₂e per kg of food",
    mRestaurantsEyebrow: "ADMIN / RESTAURANTS",
    mRestaurantsTitle: "Restaurants",
    mRestaurantsSub: "Every restaurant on Fedd — edit details, plans and subscriptions.",
    mNgosEyebrow: "ADMIN / NGOS",
    mNgosTitle: "NGOs",
    mNgosSub: "Every NGO partner — edit details and verification.",
    mLogsEyebrow: "ADMIN / FOOD",
    mLogsTitle: "Food logs",
    mLogsSub: "Every surplus entry across all restaurants. Fix mistakes or remove bad entries.",
    mClaimsEyebrow: "ADMIN / PICKUPS",
    mClaimsTitle: "Pickups",
    mClaimsSub: "Food sent from restaurants to NGOs — change a pickup's status or remove it.",
    search: "Search…",
    colName: "Name",
    colEmail: "Email",
    colCity: "City",
    colPhone: "Phone",
    colLogged: "Logged kg",
    colDonated: "Donated kg",
    colPlan: "Plan",
    colStatus: "Status",
    colExpires: "Expires",
    colVerified: "Verified",
    colClaims: "Pickups",
    colRescued: "Rescued kg",
    colDate: "Date",
    colRestaurant: "Restaurant",
    colNgo: "NGO",
    colItem: "Item",
    colKg: "kg",
    colNotes: "Notes",
    colActions: "",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    del: "Delete",
    yes: "Yes",
    no: "No",
    saved: "Saved",
    deleted: "Deleted",
    confirmDeleteOrg: "Delete this account and everything it owns? This can't be undone.",
    confirmDeleteRow: "Delete this entry? This can't be undone.",
    nothingHere: "Nothing here yet",
    nothingHereText: "Rows appear here as soon as they exist.",
    statusNames: { inactive: "No plan", pending_verification: "Pending", active: "Active", rejected: "Rejected", expired: "Expired" },
    claimStatusNames: { pending: "Claimed", confirmed: "Confirmed", picked_up: "Picked up", cancelled: "Cancelled" },
  },
  hi: {
    ngoKicker: "NGO भागीदारों के लिए",
    ngoTitle1: "अच्छा भोजन, पिकअप के लिए तैयार।",
    ngoTitleSpan: "NGO के लिए हमेशा मुफ़्त।",
    ngoBenefits: [
      ["आपके पास सत्यापित अधिशेष", "जैसे ही आपके शहर के रेस्तरां अधिशेष भोजन सूचीबद्ध करें, उसे देखें — वस्तु, मात्रा, भोजन का प्रकार और पिकअप समय, सब पहले से।", "pin"],
      ["एक टैप में दावा, पिकअप की योजना", "किसी और से पहले लिस्टिंग का दावा करें और हर पिकअप को दावे से संग्रह तक ट्रैक करें, ताकि आपके स्वयंसेवक हमेशा जानें कहाँ जाना है।", "truck"],
      ["आपके प्रभाव का प्रमाण", "हर पूरा बचाव आपके रिकॉर्ड में जुड़ता है — कितने किलो भोजन बचाया और कितने भोजन परोसे — जो आप दानदाताओं और CSR भागीदारों के साथ साझा कर सकते हैं।", "heart"],
    ],
    ngoCta: "NGO के रूप में जुड़ें",
    adminFooterLink: "एडमिन",
    adminCreateLine: "क्या आपके पास एडमिन आमंत्रण कोड है?",
    adminCreateLink: "एडमिन खाता बनाएं",
    basicFeatures: ["मासिक भोजन रिपोर्ट", "एक-क्लिक CSV निर्यात", "दान और प्रभाव सारांश"],
    proFeatures: ["बेसिक में सब कुछ", "AI किचन सहायक", "स्मार्ट तैयारी सुझाव"],
    subscriptionPromoKicker: "अपग्रेड",
    subscriptionPromoTitle: "अपनी भोजन रिपोर्ट अनलॉक करें",
    subscriptionPromoText: "बेसिक (₹100/माह) में CSV निर्यात के साथ मासिक भोजन रिपोर्ट मिलती है। प्रो (₹200/माह) में AI किचन सहायक भी मिलता है।",
    reportsNav: "भोजन रिपोर्ट",
    assistantNav: "AI सहायक",
    freePlan: "मुफ़्त",
    basicPlanName: "बेसिक योजना",
    proPlanName: "प्रो योजना",
    lockedKicker: "सशुल्क सुविधा",
    lockedReportsTitle: "आपकी भोजन रिपोर्ट बेसिक योजना में है",
    lockedReportsText: "मासिक भोजन रिपोर्ट, हर लॉग का CSV निर्यात और आपके दान का सारांश पाने के लिए बेसिक (₹100/माह) लें।",
    lockedAssistantTitle: "AI सहायक प्रो योजना में है",
    lockedAssistantText: "अपने बर्बादी डेटा के बारे में AI सहायक से पूछने और तैयारी सुझाव पाने के लिए प्रो (₹200/माह) में अपग्रेड करें।",
    pendingNote: "आपके भुगतान की जाँच हो रही है — एडमिन की मंज़ूरी मिलते ही यह अनलॉक हो जाएगा।",
    seePlans: "योजनाएं देखें",
    reportsEyebrow: "रेस्तरां / रिपोर्ट",
    reportsTitle: "भोजन रिपोर्ट",
    reportsSub: "आपकी रसोई से क्या निकला, उसकी लागत क्या थी, और कितना कूड़े के बजाय लोगों तक पहुँचा।",
    thisMonth: "इस महीने",
    allTime: "अब तक",
    rLogged: "दर्ज भोजन",
    rEntries: "प्रविष्टियाँ",
    rCost: "अनुमानित लागत",
    rCostNote: "₹96 / किलो पर",
    rDonated: "NGO को दान",
    rDonatedNote: "NGO द्वारा उठाया गया",
    rMeals: "भोजन प्रदान किए",
    rMealsNote: "≈ 400 ग्राम प्रति भोजन",
    topItems: "शीर्ष वस्तुएं",
    byCategory: "श्रेणी के अनुसार",
    itemCol: "वस्तु",
    kgCol: "किलो",
    shareCol: "हिस्सा",
    downloadCsv: "CSV डाउनलोड करें",
    csvDone: "रिपोर्ट डाउनलोड हो गई",
    noReportData: "इस अवधि में अभी कुछ दर्ज नहीं हुआ",
    noReportDataText: "अधिशेष दर्ज करें और आपकी रिपोर्ट अपने आप भर जाएगी।",
    assistantEyebrow: "रेस्तरां / प्रो",
    assistantTitle: "AI किचन सहायक",
    assistantSub: "अपने बर्बादी डेटा के बारे में पूछें — यह जवाब देने से पहले आपके हाल के लॉग पढ़ता है।",
    assistantPlaceholder: "जैसे: इस हफ्ते मुझे क्या कम बनाना चाहिए?",
    assistantSuggestions: ["मैं सबसे ज़्यादा क्या बर्बाद कर रहा हूँ?", "चावल की बर्बादी कैसे कम करूँ?", "NGO के लिए अधिशेष कब सूचीबद्ध करूँ?"],
    assistantHello: "नमस्ते! मैंने आपके हाल के लॉग पढ़ लिए हैं। अपनी रसोई के अधिशेष के बारे में कुछ भी पूछें।",
    thinking: "सोच रहा है…",
    send: "भेजें",
    adminRestaurantsNav: "रेस्तरां",
    adminNgosNav: "NGO",
    adminLogsNav: "भोजन लॉग",
    adminClaimsNav: "पिकअप",
    impactTitle: "प्लेटफ़ॉर्म का प्रभाव",
    impactLogged: "दर्ज भोजन",
    impactDonated: "दान किया भोजन",
    impactMeals: "भोजन प्रदान किए",
    impactCo2: "CO₂e बचाया",
    impactNote: "अनुमान: 400 ग्राम प्रति भोजन, 2.5 किलो CO₂e प्रति किलो भोजन",
    mRestaurantsEyebrow: "एडमिन / रेस्तरां",
    mRestaurantsTitle: "रेस्तरां",
    mRestaurantsSub: "Fedd पर हर रेस्तरां — विवरण, योजनाएं और सदस्यताएं संपादित करें।",
    mNgosEyebrow: "एडमिन / NGO",
    mNgosTitle: "NGO",
    mNgosSub: "हर NGO भागीदार — विवरण और सत्यापन संपादित करें।",
    mLogsEyebrow: "एडमिन / भोजन",
    mLogsTitle: "भोजन लॉग",
    mLogsSub: "सभी रेस्तरां की हर अधिशेष प्रविष्टि। गलतियाँ ठीक करें या गलत प्रविष्टियाँ हटाएं।",
    mClaimsEyebrow: "एडमिन / पिकअप",
    mClaimsTitle: "पिकअप",
    mClaimsSub: "रेस्तरां से NGO को भेजा गया भोजन — पिकअप की स्थिति बदलें या उसे हटाएं।",
    search: "खोजें…",
    colName: "नाम",
    colEmail: "ईमेल",
    colCity: "शहर",
    colPhone: "फ़ोन",
    colLogged: "दर्ज किलो",
    colDonated: "दान किलो",
    colPlan: "योजना",
    colStatus: "स्थिति",
    colExpires: "समाप्ति",
    colVerified: "सत्यापित",
    colClaims: "पिकअप",
    colRescued: "बचाया किलो",
    colDate: "तारीख",
    colRestaurant: "रेस्तरां",
    colNgo: "NGO",
    colItem: "वस्तु",
    colKg: "किलो",
    colNotes: "नोट्स",
    colActions: "",
    edit: "संपादित करें",
    save: "सहेजें",
    cancel: "रद्द करें",
    del: "हटाएं",
    yes: "हाँ",
    no: "नहीं",
    saved: "सहेजा गया",
    deleted: "हटाया गया",
    confirmDeleteOrg: "यह खाता और इसका सारा डेटा हटाएं? इसे वापस नहीं लाया जा सकता।",
    confirmDeleteRow: "यह प्रविष्टि हटाएं? इसे वापस नहीं लाया जा सकता।",
    nothingHere: "अभी यहाँ कुछ नहीं है",
    nothingHereText: "पंक्तियाँ बनते ही यहाँ दिखेंगी।",
    statusNames: { inactive: "कोई योजना नहीं", pending_verification: "लंबित", active: "सक्रिय", rejected: "अस्वीकृत", expired: "समाप्त" },
    claimStatusNames: { pending: "दावा किया", confirmed: "पुष्टि हुई", picked_up: "उठाया गया", cancelled: "रद्द" },
  },
};

const COST_PER_KG = 96;
const MEALS_PER_KG = 2.5;

function PageHeader({ eyebrow, title, sub, action }) {
  return <div className="page-header"><div><div className="section-kicker">{eyebrow}</div><h1 data-testid="page-title">{title}</h1><p>{sub}</p></div>{action}</div>;
}

function Empty({ icon: Icon, title, text }) {
  return <div className="empty-state"><Icon size={30} /><h3>{title}</h3><p>{text}</p></div>;
}

const round1 = (n) => Math.round(n * 10) / 10;
const kgOf = (listing) => parseFloat(listing.quantity) || 0;

/* ---------------- Landing: how Fedd helps NGOs ---------------- */

const NGO_ICONS = { pin: MapPin, truck: Truck, heart: HandHeart };

export function NgoBenefits({ t, onJoin }) {
  return <section id="ngos" className="loop-section ngo-section">
    <div className="section-kicker">{t.ngoKicker}</div>
    <h2>{t.ngoTitle1}<br /><span>{t.ngoTitleSpan}</span></h2>
    <div className="ngo-grid">{t.ngoBenefits.map(([title, text, icon]) => { const Icon = NGO_ICONS[icon]; return <div className="ngo-card" key={title}><span className="ngo-icon"><Icon size={20} /></span><h3>{title}</h3><p>{text}</p></div>; })}</div>
    <button data-testid="ngo-section-join-button" className="secondary-btn ngo-cta" onClick={onJoin}>{t.ngoCta} <ArrowRight size={16} /></button>
  </section>;
}

/* ---------------- Restaurant: plan helpers ---------------- */

export function activePlanOf(subscription) {
  return subscription?.status === "active" ? subscription.plan : null;
}

export function planLabel(t, subscription) {
  const plan = activePlanOf(subscription);
  return plan === "pro" ? t.proPlanName : plan === "basic" ? t.basicPlanName : t.freePlan;
}

function LockedFeature({ t, title, text, subscription, setPage }) {
  return <div className="locked-card">
    <span className="locked-icon"><Lock size={22} /></span>
    <div className="section-kicker">{t.lockedKicker}</div>
    <h2>{title}</h2>
    <p>{text}</p>
    {subscription?.status === "pending_verification" && <p className="locked-pending">{t.pendingNote}</p>}
    <button data-testid="locked-see-plans-button" className="primary-btn" onClick={() => setPage("billing")}>{t.seePlans} <ArrowRight size={16} /></button>
  </div>;
}

/* ---------------- Restaurant: food report (Basic + Pro) ---------------- */

export function ReportsPage({ t, logs, listings, subscription, setPage }) {
  const [period, setPeriod] = useState("month");
  const inPeriod = (iso) => {
    if (period === "all") return true;
    const d = new Date(iso), now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  };
  const periodLogs = useMemo(() => logs.filter((l) => l.createdAt && inPeriod(l.createdAt)), [logs, period]); // eslint-disable-line react-hooks/exhaustive-deps
  const donatedLogIds = useMemo(() => new Set(listings.filter((x) => x.status === "completed").map((x) => x.logId)), [listings]);
  const totalKg = round1(periodLogs.reduce((a, l) => a + Number(l.qty), 0));
  const donatedKg = round1(periodLogs.filter((l) => donatedLogIds.has(l.id)).reduce((a, l) => a + Number(l.qty), 0));
  const groupBy = (key) => Object.entries(periodLogs.reduce((acc, l) => ({ ...acc, [l[key]]: (acc[l[key]] || 0) + Number(l.qty) }), {})).sort((a, b) => b[1] - a[1]);
  const topItems = groupBy("item").slice(0, 6);
  const categories = groupBy("category");

  if (!activePlanOf(subscription)) return <><PageHeader eyebrow={t.reportsEyebrow} title={t.reportsTitle} sub={t.reportsSub} /><LockedFeature t={t} title={t.lockedReportsTitle} text={t.lockedReportsText} subscription={subscription} setPage={setPage} /></>;

  const downloadCsv = () => {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = periodLogs.map((l) => [new Date(l.createdAt).toISOString().slice(0, 10), l.item, l.category, l.qty, Math.round(Number(l.qty) * COST_PER_KG), donatedLogIds.has(l.id) ? "Donated" : l.listed ? "Listed" : "Logged", l.reason].map(esc).join(","));
    const csv = ["Date,Item,Category,Quantity kg,Estimated cost INR,Status,Notes", ...rows].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `fedd-food-report-${period === "month" ? new Date().toISOString().slice(0, 7) : "all-time"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t.csvDone);
  };

  const stats = [
    [t.rLogged, `${totalKg} kg`, `${periodLogs.length} ${t.rEntries}`, "tone-amber"],
    [t.rCost, `₹${Math.round(totalKg * COST_PER_KG).toLocaleString("en-IN")}`, t.rCostNote, "tone-green"],
    [t.rDonated, `${donatedKg} kg`, t.rDonatedNote, "tone-teal"],
    [t.rMeals, `${Math.round(donatedKg * MEALS_PER_KG)}`, t.rMealsNote, "tone-blue"],
  ];
  const shareTable = (rows) => <div className="report-table">{rows.map(([name, kg]) => <div key={name}><b>{name}</b><span>{round1(kg)} kg</span><i style={{ width: `${Math.round((kg / (totalKg || 1)) * 100)}%` }} /></div>)}</div>;

  return <>
    <PageHeader eyebrow={t.reportsEyebrow} title={t.reportsTitle} sub={t.reportsSub} action={<button data-testid="report-csv-button" className="primary-btn" onClick={downloadCsv} disabled={!periodLogs.length}><Download size={16} /> {t.downloadCsv}</button>} />
    <div className="segmented report-period"><button data-testid="report-month-toggle" className={period === "month" ? "selected" : ""} onClick={() => setPeriod("month")}>{t.thisMonth}</button><button data-testid="report-all-toggle" className={period === "all" ? "selected" : ""} onClick={() => setPeriod("all")}>{t.allTime}</button></div>
    <div className="stat-grid">{stats.map(([label, value, note, tone]) => <div className={`stat-card ${tone}`} key={label}><div className="stat-top"><span>{label}</span><FileText size={18} /></div><strong>{value}</strong><small>{note}</small></div>)}</div>
    {periodLogs.length ? <div className="chart-grid">
      <div className="data-panel"><div className="panel-head"><div><h3>{t.topItems}</h3></div></div>{shareTable(topItems)}</div>
      <div className="data-panel"><div className="panel-head"><div><h3>{t.byCategory}</h3></div></div>{shareTable(categories)}</div>
    </div> : <Empty icon={FileText} title={t.noReportData} text={t.noReportDataText} />}
  </>;
}

/* ---------------- Restaurant: AI assistant (Pro) ---------------- */

export function AssistantPage({ t, subscription, setPage, children }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [messages, sending]);

  if (activePlanOf(subscription) !== "pro") return <><PageHeader eyebrow={t.assistantEyebrow} title={t.assistantTitle} sub={t.assistantSub} /><LockedFeature t={t} title={t.lockedAssistantTitle} text={t.lockedAssistantText} subscription={subscription} setPage={setPage} /></>;

  const ask = async (text) => {
    const question = (text ?? draft).trim();
    if (!question || sending) return;
    const next = [...messages, { role: "user", content: question }];
    setMessages(next);
    setDraft("");
    setSending(true);
    try {
      const { reply } = await api.ai.assistant(next);
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (err) {
      toast.error(err.message || "The assistant couldn't answer");
      setMessages(messages);
      setDraft(question);
    } finally {
      setSending(false);
    }
  };

  return <>
    <PageHeader eyebrow={t.assistantEyebrow} title={t.assistantTitle} sub={t.assistantSub} />
    <div className="data-panel assistant-panel">
      <div className="assistant-log">
        <div className="assistant-msg bot"><Bot size={15} /><p>{t.assistantHello}</p></div>
        {messages.map((m, i) => <div key={i} className={`assistant-msg ${m.role === "user" ? "me" : "bot"}`}>{m.role === "assistant" && <Bot size={15} />}<p>{m.content}</p></div>)}
        {sending && <div className="assistant-msg bot"><Bot size={15} /><p className="assistant-thinking">{t.thinking}</p></div>}
        <div ref={endRef} />
      </div>
      {!messages.length && <div className="assistant-suggestions">{t.assistantSuggestions.map((s) => <button key={s} className="filter" onClick={() => ask(s)}>{s}</button>)}</div>}
      <form className="assistant-input" onSubmit={(e) => { e.preventDefault(); ask(); }}>
        <input data-testid="assistant-input" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={t.assistantPlaceholder} maxLength={1000} />
        <button data-testid="assistant-send-button" className="primary-btn" type="submit" disabled={sending || !draft.trim()}><Send size={15} /> {t.send}</button>
      </form>
    </div>
    {children}
  </>;
}

/* ---------------- Admin: impact numbers on the overview ---------------- */

export function AdminImpact({ t }) {
  const [impact, setImpact] = useState(null);
  useEffect(() => { api.admin.impact().then(setImpact).catch((err) => toast.error(err.message)); }, []);
  const cards = [
    [t.impactLogged, impact && `${impact.logged_kg} kg`, Leaf, "tone-amber"],
    [t.impactDonated, impact && `${impact.donated_kg} kg`, HandHeart, "tone-green"],
    [t.impactMeals, impact && impact.meals.toLocaleString("en-IN"), Users, "tone-teal"],
    [t.impactCo2, impact && `${impact.co2e_kg} kg`, Sparkles, "tone-blue"],
  ];
  return <div className="admin-impact">
    <div className="panel-head"><div><h3>{t.impactTitle}</h3><span>{t.impactNote}</span></div></div>
    <div className="stat-grid">{cards.map(([label, value, Icon, tone]) => <div className={`stat-card ${tone}`} key={label}><div className="stat-top"><span>{label}</span><Icon size={18} /></div><strong>{value ?? "—"}</strong></div>)}</div>
  </div>;
}

/* ---------------- Admin: editable tables ---------------- */

const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");
const subStatus = (sub) => {
  if (!sub) return "inactive";
  if (sub.status === "active" && sub.current_period_end && new Date(sub.current_period_end) <= new Date()) return "expired";
  return sub.status;
};

function RowActions({ t, editing, onEdit, onSave, onCancel, onDelete, busy }) {
  return <td className="manage-actions">{editing
    ? <><button data-testid="row-save-button" className="approve" onClick={onSave} disabled={busy}><Save size={13} /> {t.save}</button><button className="icon-only" aria-label={t.cancel} onClick={onCancel}><X size={14} /></button></>
    : <>{onEdit && <button data-testid="row-edit-button" className="icon-only" aria-label={t.edit} title={t.edit} onClick={onEdit}><Pencil size={14} /></button>}<button data-testid="row-delete-button" className="icon-only danger" aria-label={t.del} title={t.del} onClick={onDelete} disabled={busy}><Trash2 size={14} /></button></>}</td>;
}

const cell = (editing, value, onChange, props = {}) => editing ? <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...props} /> : (value === "" || value == null ? "—" : value);

const MANAGE_PAGES = {
  "admin-restaurants": { load: () => api.admin.organizations("restaurant"), eyebrow: "mRestaurantsEyebrow", title: "mRestaurantsTitle", sub: "mRestaurantsSub", text: (r) => `${r.org_name} ${r.email} ${r.city}` },
  "admin-ngos": { load: () => api.admin.organizations("ngo"), eyebrow: "mNgosEyebrow", title: "mNgosTitle", sub: "mNgosSub", text: (r) => `${r.org_name} ${r.email} ${r.city}` },
  "admin-logs": { load: () => api.admin.logs(), eyebrow: "mLogsEyebrow", title: "mLogsTitle", sub: "mLogsSub", text: (r) => `${r.food_type} ${r.restaurant_name} ${r.notes}` },
  "admin-claims": { load: () => api.admin.claims(), eyebrow: "mClaimsEyebrow", title: "mClaimsTitle", sub: "mClaimsSub", text: (r) => `${r.marketplace_listings?.food_type} ${r.restaurant_name} ${r.ngo_name}` },
};

export const ADMIN_MANAGE_PAGES = Object.keys(MANAGE_PAGES);

export function AdminManage({ t, page }) {
  const config = MANAGE_PAGES[page];
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [draft, setDraft] = useState({});
  const [busy, setBusy] = useState(false);

  const reload = () => config.load().then(setRows).catch((err) => toast.error(err.message)).finally(() => setLoading(false));
  useEffect(() => { setLoading(true); setRows([]); setEditId(null); setSearch(""); reload(); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const startEdit = (row, fields) => { setEditId(row.id); setDraft(fields); };
  const set = (key) => (value) => setDraft((d) => ({ ...d, [key]: value }));
  const run = async (fn, message) => {
    setBusy(true);
    try { await fn(); toast.success(message); setEditId(null); await reload(); } catch (err) { toast.error(err.message || "Something went wrong"); } finally { setBusy(false); }
  };
  const remove = (fn, confirmText) => { if (window.confirm(confirmText)) run(fn, t.deleted); };

  const visible = rows.filter((r) => config.text(r).toLowerCase().includes(search.toLowerCase()));
  const statusOptions = ["inactive", "pending_verification", "active", "rejected"];

  let head, body;
  if (page === "admin-restaurants") {
    head = [t.colName, t.colEmail, t.colCity, t.colPhone, t.colLogged, t.colDonated, t.colPlan, t.colStatus, t.colExpires, t.colActions];
    body = visible.map((r) => {
      const editing = editId === r.id;
      const sub = r.subscription;
      const status = subStatus(sub);
      const save = () => run(async () => {
        await api.admin.updateProfile(r.id, { org_name: draft.org_name, city: draft.city, phone: draft.phone });
        if (draft.plan !== (sub?.plan || "basic") || draft.status !== (sub?.status || "inactive") || draft.expires !== (sub?.current_period_end || "").slice(0, 10)) {
          await api.admin.setSubscription(r.id, { plan: draft.plan, status: draft.status, current_period_end: draft.expires ? new Date(`${draft.expires}T23:59:59`).toISOString() : null });
        }
      }, t.saved);
      return <tr key={r.id}>
        <td><b>{cell(editing, editing ? draft.org_name : r.org_name, set("org_name"))}</b></td>
        <td className="muted">{r.email || "—"}</td>
        <td>{cell(editing, editing ? draft.city : r.city, set("city"))}</td>
        <td>{cell(editing, editing ? draft.phone : r.phone, set("phone"))}</td>
        <td className="num">{r.logged_kg}</td>
        <td className="num">{r.donated_kg}</td>
        <td>{editing ? <select value={draft.plan} onChange={(e) => set("plan")(e.target.value)}><option value="basic">Basic</option><option value="pro">Pro</option></select> : sub ? sub.plan : "—"}</td>
        <td>{editing ? <select value={draft.status} onChange={(e) => set("status")(e.target.value)}>{statusOptions.map((s) => <option key={s} value={s}>{t.statusNames[s]}</option>)}</select> : <span className={`status ${status === "active" ? "verified" : status === "pending_verification" ? "pending" : "logged"}`}>{t.statusNames[status]}</span>}</td>
        <td>{editing ? <input type="date" value={draft.expires} onChange={(e) => set("expires")(e.target.value)} /> : fmtDate(sub?.current_period_end)}</td>
        <RowActions t={t} busy={busy} editing={editing} onCancel={() => setEditId(null)} onSave={save}
          onEdit={() => startEdit(r, { org_name: r.org_name, city: r.city || "", phone: r.phone || "", plan: sub?.plan || "basic", status: sub?.status || "inactive", expires: (sub?.current_period_end || "").slice(0, 10) })}
          onDelete={() => remove(() => api.admin.deleteProfile(r.id), t.confirmDeleteOrg)} />
      </tr>;
    });
  } else if (page === "admin-ngos") {
    head = [t.colName, t.colEmail, t.colCity, t.colPhone, t.colVerified, t.colClaims, t.colRescued, t.colActions];
    body = visible.map((r) => {
      const editing = editId === r.id;
      const save = () => run(() => api.admin.updateProfile(r.id, { org_name: draft.org_name, city: draft.city, phone: draft.phone, verified: draft.verified }), t.saved);
      return <tr key={r.id}>
        <td><b>{cell(editing, editing ? draft.org_name : r.org_name, set("org_name"))}</b></td>
        <td className="muted">{r.email || "—"}</td>
        <td>{cell(editing, editing ? draft.city : r.city, set("city"))}</td>
        <td>{cell(editing, editing ? draft.phone : r.phone, set("phone"))}</td>
        <td>{editing ? <select value={draft.verified ? "yes" : "no"} onChange={(e) => set("verified")(e.target.value === "yes")}><option value="yes">{t.yes}</option><option value="no">{t.no}</option></select> : <span className={`status ${r.verified ? "verified" : "pending"}`}>{r.verified ? <><ShieldCheck size={11} /> {t.yes}</> : t.no}</span>}</td>
        <td className="num">{r.claims_count}</td>
        <td className="num">{r.rescued_kg}</td>
        <RowActions t={t} busy={busy} editing={editing} onCancel={() => setEditId(null)} onSave={save}
          onEdit={() => startEdit(r, { org_name: r.org_name, city: r.city || "", phone: r.phone || "", verified: r.verified })}
          onDelete={() => remove(() => api.admin.deleteProfile(r.id), t.confirmDeleteOrg)} />
      </tr>;
    });
  } else if (page === "admin-logs") {
    head = [t.colDate, t.colRestaurant, t.colItem, t.colKg, t.colNotes, t.colActions];
    body = visible.map((r) => {
      const editing = editId === r.id;
      const save = () => {
        const qty = Number(draft.quantity_kg);
        if (!draft.food_type.trim() || !(qty > 0)) return toast.error("Add an item name and a quantity above 0");
        run(() => api.admin.updateLog(r.id, { food_type: draft.food_type.trim(), quantity_kg: qty, notes: draft.notes }), t.saved);
      };
      return <tr key={r.id}>
        <td className="muted">{fmtDate(r.created_at)}</td>
        <td>{r.restaurant_name || "—"}</td>
        <td><b>{cell(editing, editing ? draft.food_type : r.food_type, set("food_type"))}</b></td>
        <td className="num">{cell(editing, editing ? draft.quantity_kg : r.quantity_kg, set("quantity_kg"), { type: "number", min: "0", step: "0.1" })}</td>
        <td className="muted wide">{cell(editing, editing ? draft.notes : r.notes, set("notes"))}</td>
        <RowActions t={t} busy={busy} editing={editing} onCancel={() => setEditId(null)} onSave={save}
          onEdit={() => startEdit(r, { food_type: r.food_type, quantity_kg: r.quantity_kg, notes: r.notes || "" })}
          onDelete={() => remove(() => api.admin.deleteLog(r.id), t.confirmDeleteRow)} />
      </tr>;
    });
  } else {
    head = [t.colDate, t.colItem, t.colKg, t.colRestaurant, t.colNgo, t.colStatus, t.colActions];
    body = visible.map((r) => <tr key={r.id}>
      <td className="muted">{fmtDate(r.created_at)}</td>
      <td><b>{r.marketplace_listings?.food_type || "—"}</b></td>
      <td className="num">{r.marketplace_listings?.quantity_kg ?? "—"}</td>
      <td>{r.restaurant_name || "—"}</td>
      <td>{r.ngo_name || "—"}</td>
      <td><select data-testid="claim-status-select" value={r.status} disabled={busy} onChange={(e) => run(() => api.admin.updateClaim(r.id, e.target.value), t.saved)}>{Object.entries(t.claimStatusNames).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></td>
      <RowActions t={t} busy={busy} editing={false} onDelete={() => remove(() => api.admin.deleteClaim(r.id), t.confirmDeleteRow)} />
    </tr>);
  }

  return <>
    <PageHeader eyebrow={t[config.eyebrow]} title={t[config.title]} sub={t[config.sub]} action={<div className="search-box"><Search size={16} /><input data-testid="manage-search-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.search} /></div>} />
    {!loading && !rows.length ? <Empty icon={page === "admin-ngos" ? HandHeart : page === "admin-restaurants" ? Users : Leaf} title={t.nothingHere} text={t.nothingHereText} /> : <div className="data-panel manage-table-wrap">
      <table className="manage-table"><thead><tr>{head.map((h, i) => <th key={i}>{h}</th>)}</tr></thead><tbody>{body}</tbody></table>
    </div>}
  </>;
}
