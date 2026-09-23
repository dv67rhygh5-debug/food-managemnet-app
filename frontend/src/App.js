function RestaurantTools({ t, logs }) { const exportReport = () => { const csv = "Item,Category,Quantity kg,Cost impact\n" + logs.map((x) => `${x.item},${x.category},${x.qty},${x.cost}`).join("\n"); const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); const a = document.createElement("a"); a.href = url; a.download = "fedd-monthly-report.csv"; a.click(); URL.revokeObjectURL(url); toast.success("Monthly report exported"); }; return <div className="tools-grid"><div className="tool-card"><div className="section-kicker">{t.reporting.toUpperCase()}</div><h3>{t.shareProgress}</h3><p>{t.exportSummary}</p><button data-testid="export-report-button" className="secondary-btn" onClick={exportReport} disabled={!logs.length}>{t.exportCsv} <ArrowRight size={14} /></button></div><div className="tool-card referral-card"><div className="section-kicker">{t.referSave.toUpperCase()}</div><h3>{t.giveMonthGetMonth}</h3><p>{t.referText}</p><button data-testid="referral-button" className="secondary-btn" onClick={() => { toast.success("Referral link ready to share"); }}>{t.copyReferral} <ArrowRight size={14} /></button></div></div>; }
function InventoryWatch({ t }) {
  const [items, setItems] = useState([]);
  const [ordered, setOrdered] = useState({});
  const [draft, setDraft] = useState("");
  const updateMin = (name, value) => setItems(items.map((x) => x.name === name ? { ...x, min: Number(value) } : x));
  const reorder = (item) => { setOrdered({ ...ordered, [item.name]: true }); toast.success(`${item.name} added to reorder list`); };
  const addItem = (e) => { e.preventDefault(); if (!draft.trim()) return; setItems([...items, { name: draft.trim(), current: 0, min: 0, unit: "kg" }]); setDraft(""); };
  return <div className="inventory-panel data-panel"><div className="panel-head"><div><h3>{t.inventoryTitle}</h3><span>{t.inventorySub}</span></div>{items.length > 0 && <span className="expiry-count"><Bell size={14} /> {items.filter((x) => x.current < x.min && !ordered[x.name]).length} {t.invAlerts}</span>}</div>{items.length ? <div className="inventory-table"><div className="inventory-head"><span>{t.invItem}</span><span>{t.invCurrent}</span><span>{t.invMinimum}</span><span>{t.invAction}</span></div>{items.map((item) => { const low = item.current < item.min && !ordered[item.name]; return <div className={`inventory-row ${low ? "low" : ""}`} key={item.name}><b>{item.name}</b><span>{item.current} {item.unit}</span><label><input data-testid={`minimum-threshold-${item.name.toLowerCase().replaceAll(" ", "-")}`} type="number" min="0" value={item.min} onChange={(e) => updateMin(item.name, e.target.value)} /> {item.unit}</label>{ordered[item.name] ? <span className="reorder-done"><Check size={14} /> {t.invRequested}</span> : low ? <button data-testid={`reorder-${item.name.toLowerCase().replaceAll(" ", "-")}-button`} className="reorder-btn" onClick={() => reorder(item)}><Bell size={14} /> {t.invReorder} {item.name}</button> : <span className="stock-ok"><Check size={14} /> {t.invStockHealthy}</span>}</div>; })}</div> : <EmptyState icon={Bell} title={t.invEmptyTitle} text={t.invEmptyText} />}<form className="inventory-add" onSubmit={addItem}><input data-testid="inventory-add-input" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={t.invAddPlaceholder} /><button type="submit" className="secondary-btn" data-testid="inventory-add-button">{t.invAddButton}</button></form></div>;
}
function ExpiryWatch({ t }) {
  return <div className="expiry-panel data-panel"><div className="panel-head"><div><h3>{t.expiryTitle}</h3><span>{t.expirySub}</span></div></div><EmptyState icon={Clock3} title={t.expiryEmptyTitle} text={t.expiryEmptyText} /></div>;
}
function WastePlaybook({ t, logs = [] }) { const counts = logs.reduce((acc, x) => ({ ...acc, [x.item]: (acc[x.item] || 0) + Number(x.qty) }), {}); const topEntry = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]; if (!topEntry) return <div className="playbook-panel playbook-empty"><EmptyState icon={Sparkles} title={t.playbookEmptyTitle} text={t.playbookEmptyText} /></div>; const topItem = topEntry; const reduction = Math.max(10, Math.min(25, Math.round(topItem[1] / 2))); return <div className="playbook-panel"><div className="playbook-copy"><div className="section-kicker">{t.playbookKicker}</div><h3>{t.playbookReduceBy} {topItem[0]} {t.playbookPrepBy}{reduction}%.</h3><p>{t.playbookHistoryPrefix} {topItem[1]} {t.playbookHistorySuffix} {topItem[0]} {t.playbookSurplusSuffix}</p><button data-testid="playbook-create-button" className="secondary-btn" onClick={() => toast.success(`Prep checklist created for ${topItem[0]}`)}>{t.playbookCreateChecklist} <ArrowRight size={15} /></button></div><div className="playbook-steps"><div><span>1</span><b>{t.playbookStep1}</b><small>−{reduction}% {topItem[0]}</small></div><div><span>2</span><b>{t.playbookStep2}</b><small>{t.playbookStep2Sub}</small></div><div><span>3</span><b>{t.playbookStep3}</b><small>{t.playbookStep3Sub}</small></div></div></div>; }
function ImpactFacts({ t }) { return <section className="facts-section"><div className="section-kicker">{t.factsKicker}</div><h2>{t.factsTitle1}<br /><span>{t.factsTitleSpan}</span></h2><div className="facts-grid">{t.factsItems.map(([stat, desc, source]) => <div key={stat}><strong>{stat}</strong><p>{desc}</p><small>{source}</small></div>)}</div></section>; }
function NgoMapPage({ t, listings }) { return <><Header eyebrow={t.ngoMapEyebrow} title={t.ngoMapTitle} sub={t.ngoMapSub} /><div className="map-toolbar"><span><MapPin size={15} /> {listings.length} {t.liveOpportunities}</span></div>{listings.length ? <div className="map-list">{listings.map((x) => <div key={x.id}><b>{x.restaurant}</b><span>{x.item} · {x.quantity}</span><button data-testid={`map-pickup-${x.id}-button`} className="primary-btn" onClick={() => toast.success(`${x.item} pickup route saved`)}>{t.planPickup} <ArrowRight size={14} /></button></div>)}</div> : <EmptyState icon={PackageOpen} title={t.noLiveListings} text={t.newOppsAppearHere} />}</>; }
import { useEffect, useMemo, useState } from "react";
import "@/App.css";
import { Toaster, toast } from "sonner";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { AlertTriangle, ArrowLeft, ArrowRight, BarChart3, Bell, Check, ChevronDown, ChevronRight, CircleDollarSign, ClipboardList, Clock3, Leaf, LogOut, MapPin, Menu, Moon, PackageOpen, Plus, Search, ShieldCheck, Sparkles, Sun, Trash2, TrendingDown, Users, X, Zap } from "lucide-react";
import { api, getToken, setToken, clearToken, timeToIso } from "./lib/api";

function mapLogFromApi(row) {
  // `notes` is our own client-written "category · reason · foodType · ..." string (see addLog) —
  // the category is always written first, so it can be recovered for the category breakdown chart
  // without a schema change.
  const notes = row.notes || "";
  const category = notes.split(" · ")[0] || "Other";
  return { id: row.id, item: row.food_type, category, qty: row.quantity_kg, cost: Math.round(Number(row.quantity_kg) * 96), createdAt: row.created_at, date: new Date(row.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }), reason: notes, listed: false, storage: row.storage, pickupTime: row.pickup_time, packaging: row.packaging, photoUrl: row.photo_url };
}
function mapListingFromApi(row) {
  return { id: row.id, item: row.food_type, quantity: `${row.quantity_kg} kg`, restaurant: row.profiles?.org_name || "Restaurant", deadline: row.pickup_window || "Flexible", dietary: "—", storage: "—", priority: "Medium", status: row.status === "available" ? "Listed" : row.status, logId: row.log_id };
}
function getGreeting(lang) {
  const istHour = Number(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata", hour: "2-digit", hour12: false }));
  if (lang === "hi") return istHour < 12 ? "सुप्रभात" : istHour < 17 ? "नमस्कार" : "शुभ संध्या";
  return istHour < 12 ? "Good morning" : istHour < 17 ? "Good afternoon" : "Good evening";
}
function initials(name) {
  if (!name) return "";
  return name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}
function mapClaimFromApi(row) {
  const listing = row.marketplace_listings || {};
  return { id: row.id, claimId: row.id, item: listing.food_type, quantity: `${listing.quantity_kg ?? "?"} kg`, restaurant: listing.profiles?.org_name || "Restaurant", status: row.status };
}

const categoryColors = ["#127c6d", "#e4a11b", "#78a99a", "#d5b783", "#8a6fd6", "#c96a4f"];

const copy = {
  en: {
    overview: "Overview", log: "Log surplus", market: "Marketplace", billing: "Billing", sub: "Here’s what your kitchen is telling you this week.", wasted: "Total food wasted", impact: "Cost impact estimate", top: "Top wasted item", trend: "Avg per entry", updated: "Live · updated 2 min ago", week: "This week", month: "This month", recent: "Recent logs", viewAll: "View all", add: "Log food waste", recommendations: "Recommendations", marketTitle: "Surplus marketplace", claim: "Claim food", claims: "My claims", liveListings: "Live listings", mapDistance: "Map & distance", verificationStatus: "Verification status", filterAll: "All", filterHigh: "High priority", filterVeg: "Vegetarian", filterCold: "Refrigerated", inventoryTitle: "Inventory reorder watch", inventorySub: "Set minimums before a stock gap affects service", expiryTitle: "Expiry watch", expirySub: "Protect margin before food goes out of date", reporting: "Reporting", referSave: "Refer & save", currentPlan: "Current plan",
    // Landing
    navHow: "How it works", navPricing: "Pricing", navAbout: "About", heroEyebrow: "Data-led kitchen intelligence", heroTitle1: "Turn food waste", heroTitleEm: "into savings.", heroSub: "Fedd gives restaurants the visibility to understand waste, act on patterns, and keep more money on every plate.", startTrial: "Start free trial", joinNgo: "Join as NGO", loopKicker: "THE LOOP", loopTitle1: "Less waste is a", loopTitleSpan: "measurable advantage.",
    loopSteps: [["01", "Log what leaves the kitchen", "Record surplus in seconds — from paneer tikka to prep scraps."], ["02", "Spot the expensive patterns", "See the days, dishes, and decisions quietly eating your margin."], ["03", "Make your next shift smarter", "Get a clear action to take before the next service begins."]],
    pricingKicker: "SIMPLE PLANS", pricingTitle1: "Start small.", pricingTitleSpan: "See the difference.", basicLabel: "BASIC", basicDesc: "For a clearer daily view of your kitchen.", chooseBasic: "Choose Basic",
    basicFeatures: ["Summary dashboard", "Waste logging", "Marketplace access"],
    proLabel: "MOST POPULAR · PRO", proDesc: "For operators ready to turn insight into action.",
    proFeatures: ["Everything in Basic", "Recommendations engine", "Full trend analytics"],
    factsKicker: "FACTS FOR BETTER SERVICE", factsTitle1: "Small shifts create", factsTitleSpan: "measurable change.",
    factsItems: [["1/3", "of food produced globally is lost or wasted.", "UNEP Food Waste Index · sourced"], ["₹25k Cr", "estimated annual food-waste cost across Indian restaurants.", "Industry estimate · clearly labelled"]],
    aboutBackHome: "Back to home", logInBtn: "Log in", signInAs: "Sign in as", founderTitle: "Founder, Fedd", founderTagline: "Building a data-driven path from food waste to food rescue.", aboutMissionLine: "Less waste. More reach. One dashboard at a time.", aboutCta: "See how it works", bySubscribingText: "By subscribing, you agree to our", trustKicker: "YOUR DATA, YOUR DECISIONS", trustLine: "Simple tools for more thoughtful kitchens.", termsLink: "Terms & conditions", footerTagline: "Waste less. Know more.",
    // Portal-wide
    dashboardEyebrow: "RESTAURANT / OVERVIEW", wasteByDay: "Waste by day", last7Days: "Last 7 days", wasteByCategory: "Waste by category", whereMargin: "Where your margin is going", noEntriesWeek: "No entries logged this week yet", peakDaySuffix: "is your peak waste day", noEntriesYet: "No entries yet", logSomeCategory: "Log some surplus to see your category breakdown.", totalSurplusSuffix: "of total surplus", reviewProductionPlan: "Review production plan", logFewEntries: "Log a few entries to unlock this", onceLogged: "Once you've logged some surplus, we'll surface your biggest source of waste here.", biggestSource: "your single largest source of surplus. Trim your next prep batch and top up only as orders come in.", kgLoggedSoFar: "kg of", soFarPrefix: "You've logged", reducePrepPrefix: "Reduce", prepSuffix: "prep", loggedSuffix: "kg logged", logAnEntry: "Log an entry to see this", statusListed: "Listed", statusLogged: "Logged", entryWord: "entry", entriesWord: "entries", loggedWord: "logged", estimatedAtRate: "Estimated at ₹96/kg", pctOfTotal: "of total", proPlan: "Pro plan", verifiedPartnerPlan: "Verified partner", logOut: "Log out", restaurantPortal: "Restaurant portal", ngoPortal: "NGO portal", adminPortal: "Admin portal", viewLocation: "View location",
    // Auth
    goodToSeeYou: "Good to see you.", loginSub: "Log in to continue where your kitchen left off.", emailAddress: "Email address", password: "Password", enterDashboard: "Enter dashboard", signingIn: "Signing in…", newHere: "New here?", welcomeBack: "WELCOME BACK",
    signUp: "SIGN UP", iAmA: "I am a...", roleRestaurant: "Restaurant", roleNgo: "NGO", roleAdmin: "Admin", restaurantNamePh: "e.g. Green Tiffin Co.", ngoNamePh: "e.g. Robin Hood Army", adminNamePh: "e.g. Priya Rao", restaurantNameLabel: "Restaurant name", ngoNameLabel: "Organisation name", city: "City", contactPerson: "Contact person", fullName: "Full name", adminInviteCode: "Admin invite code", locationLink: "Location link (Google Maps)", locationHint: "Helps NGOs plan the shortest pickup route.", ngoNote: "Applications are reviewed by the Fedd team. Verified NGOs typically hear back within 48 hours.", adminNote: "Admin access requires a valid invite code from the Fedd team.", submitting: "Submitting…", submitVerification: "Submit for verification", createAdminAccess: "Create admin access", ngoDesc: "Verified NGOs can claim surplus food from restaurants in your city.", adminDesc: "Admin access is limited to Fedd team members with a valid invite code.", restaurantDesc: "Sign up in under a minute — no card needed for the free trial.", ngoHeadline: "Rescue surplus, feed more.", adminHeadline: "Command the platform.", restaurantHeadline: "Turn waste into savings.",
    // LogPage
    logEyebrow: "RESTAURANT / DATA ENTRY", logSub: "Capture the moment surplus happens. The more you log, the sharper your insights become.", section1Title: "What was surplus?", section1Sub: "General food details used to calculate cost impact.", foodItemLabel: "Food item *", foodItemPh: "e.g. Paneer tikka", categoryLabel: "Category", quantityLabel: "Quantity *", quantityHint: "Used to estimate cost impact", reasonLabel: "Reason for surplus", section2Title: "Freshness tracking", section2Sub: "Track use-by dates so your team can act before food becomes waste.", useByLabel: "Use-by date", freshnessLabel: "Freshness status", section3Title: "Safety & pickup details", section3Sub: "Keep this information distinct — never auto-marked as safe.", storageLabel: "Storage condition", foodTypeLabel: "Food type", pickupUntilLabel: "Safe pickup until", packagingLabel: "Packaging status", photoLabel: "Surplus photo", attachedPrefix: "Attached:", takesMinute: "Takes less than a minute", saveEntry: "Save entry",
    categoryOptions: [["Mains", "Mains"], ["Bakery", "Bakery"], ["Grains", "Grains"], ["Desserts", "Desserts"]],
    reasonOptions: [["Overproduction", "Overproduction"], ["Cancelled order", "Cancelled order"], ["Event overestimate", "Event overestimate"], ["Quality issue", "Quality issue"]],
    freshnessOptions: [["Fresh", "Fresh"], ["Use soon", "Use soon"], ["Out of date", "Out of date"], ["Discarded", "Discarded"]],
    storageOptions: [["Refrigerated", "Refrigerated"], ["Ambient", "Ambient"], ["Frozen", "Frozen"]],
    foodTypeOptions: [["Vegetarian", "Vegetarian"], ["Non-vegetarian", "Non-vegetarian"], ["Vegan", "Vegan"]],
    packagingOptions: [["Sealed & labelled", "Sealed & labelled"], ["Container ready", "Container ready"], ["Needs packaging", "Needs packaging"]],
    // MarketPage / BillingPage
    marketEyebrow: "RESTAURANT / SECONDARY", marketSub: "Give good food a second route — when your kitchen can’t use it all.", listSurplusBtn: "List surplus", activeListings: "Active listings", avgPickupTime: "Avg. pickup time", collectedSuccess: "Collected successfully", pickupByLabel: "Pickup by", editListing: "Edit listing",
    billingEyebrow: "RESTAURANT / ACCOUNT", billingTitle: "Your plan", billingSub: "A simple plan for a more thoughtful kitchen.", currentStatus: "CURRENT STATUS", statusActive: "Active", statusPending: "Pending verification", statusInactive: "Inactive", planPrefix: "Plan:", noPlanYet: "No plan selected yet", choosePrefix: "Choose", selected: "Selected", payByQr: "PAY BY QR", scanToPay: "Scan to pay, then confirm below", upiIdLabel: "UPI ID:", paymentRefLabel: "Payment reference / UTR number", paymentRefPh: "e.g. UPI txn ID", submitPayment: "I've paid — submit for verification",
    // NGO
    ngoClaimsEyebrow: "NGO / MY CLAIMS", ngoClaimsTitle: "My claims", ngoClaimsSub: "Keep your rescue runs clear and on time.", activeClaims: "active claims", claimed: "Claimed", pickedUp: "Picked up", confirmPickupBtn: "Confirm pickup", noClaimsYet: "No claims yet", claimWhenReady: "Claim a listing when your team is ready to rescue it.", ngoMapEyebrow: "NGO / MAP VIEW", ngoMapTitle: "Nearby rescue map", ngoMapSub: "Judge distance and travel time before committing a pickup.", liveOpportunities: "live opportunities in your area", planPickup: "Plan pickup", ngoVerifyEyebrow: "NGO / VERIFICATION", ngoVerifySub: "Your partner standing with Fedd.", verifiedPartner: "Verified partner", pendingVerification: "Pending verification", verifiedText: "is approved to claim surplus food from verified restaurants.", pendingVerifyText: "An admin is reviewing your application. You’ll be able to claim listings once approved.", active: "Active", awaitingApproval: "Awaiting approval", yourOrg: "Your organisation", ngoFeedEyebrow: "NGO / LIVE FEED", rescueOppsTitle: "Rescue opportunities", rescueOppsSub: "Good food, ready for a second table.", myClaimsBadge: "My claims", noLiveListings: "No live listings", newOppsAppearHere: "New rescue opportunities will appear here.", priority: "priority",
    // Admin
    adminQueueEyebrow: "ADMIN / OPERATIONS", verifyQueueTitle: "Verification queue", verifyQueueSub: "Review NGOs waiting to join the network.", pending: "pending", approve: "Approve", queueClear: "Queue is clear", allReviewed: "All partner applications have been reviewed.", adminPaymentsEyebrow: "ADMIN / BILLING", pendingPaymentsTitle: "Pending payments", pendingPaymentsSub: "Verify QR payments submitted by restaurants.", refLabel: "Ref:", noPendingPayments: "No pending payments", paymentsAppearHere: "Payment submissions will appear here for verification.", adminSubsEyebrow: "ADMIN / REVENUE", subscribersTitle: "Subscribers", subscribersSub: "Your active restaurant network.", searchRestaurants: "Search restaurants", restaurantCol: "Restaurant", planCol: "Plan", statusCol: "Status", noSubscribersYet: "No subscribers yet", restaurantsAppearHere: "Restaurants that submit a payment will show up here.", adminRescuesEyebrow: "ADMIN / IMPACT", rescuesTitle: "Rescues", rescuesSub: "Completed pickups across the network.", itemCol: "Item", quantityCol: "Quantity", noRescuesYet: "No rescues yet", pickupsAppearHere: "Completed pickups will show up here.", adminOverviewEyebrow: "ADMIN / PLATFORM", platformOverview: "Platform overview", platformPulse: "A live pulse across the Fedd network.", pendingVerifications: "Pending verifications", ngosAwaiting: "NGOs awaiting review", rescuesFacilitated: "Rescues facilitated", completedPickups: "Completed pickups", activeSubscribers: "Active subscribers", ofTotal: "of", total: "total", pendingPayments: "Pending payments", awaitingVerification: "awaiting verification",
    // Restaurant tools / inventory / expiry / playbook
    shareProgress: "Share the progress", exportSummary: "Export a clean monthly summary for your investors, auditors, or CSR report.", exportCsv: "Export CSV report", giveMonthGetMonth: "Give a month, get a month", referText: "Invite another restaurant and both teams get one month of Pro free.", copyReferral: "Copy referral link",
    invAlerts: "alerts", invItem: "Item", invCurrent: "Current", invMinimum: "Minimum", invAction: "Action", invRequested: "Requested", invReorder: "Reorder", invStockHealthy: "Stock healthy", invEmptyTitle: "No items yet", invEmptyText: "Add an item below to start tracking your reorder minimums.", invAddPlaceholder: "e.g. Basmati rice", invAddButton: "Add item", expiryEmptyTitle: "Nothing expiring", expiryEmptyText: "Items nearing their use-by date will show up here once you're logging surplus.", playbookEmptyTitle: "No recommendation yet", playbookEmptyText: "Log a few entries and we'll surface your biggest source of waste here.",
    
    playbookKicker: "COMPUTED NEXT BEST ACTION", playbookReduceBy: "Reduce", playbookPrepBy: "prep by ~", playbookHistoryPrefix: "Your logged history shows", playbookHistorySuffix: "kg of", playbookSurplusSuffix: "surplus. Start with a smaller first batch, then top up only when orders arrive.", playbookCreateChecklist: "Create prep checklist", playbookStep1: "Reduce first batch", playbookStep2: "Set a service check", playbookStep2Sub: "Review covers vs prep", playbookStep3: "Redirect surplus", playbookStep3Sub: "List safe leftovers",
  },
  hi: {
    overview: "अवलोकन", log: "अधिशेष दर्ज करें", market: "मार्केटप्लेस", billing: "बिलिंग", sub: "इस सप्ताह आपकी रसोई की कहानी यहाँ है।", wasted: "कुल भोजन बर्बादी", impact: "लागत प्रभाव अनुमान", top: "सबसे अधिक बर्बाद", trend: "प्रति प्रविष्टि औसत", updated: "लाइव · 2 मिनट पहले अपडेट", week: "इस सप्ताह", month: "इस महीने", recent: "हाल की प्रविष्टियाँ", viewAll: "सभी देखें", add: "भोजन बर्बादी दर्ज करें", recommendations: "सुझाव", marketTitle: "अधिशेष मार्केटप्लेस", claim: "भोजन लें", claims: "मेरे दावे", liveListings: "लाइव सूचियाँ", mapDistance: "मानचित्र और दूरी", verificationStatus: "सत्यापन स्थिति", filterAll: "सभी", filterHigh: "उच्च प्राथमिकता", filterVeg: "शाकाहारी", filterCold: "रेफ्रिजरेटेड", inventoryTitle: "इन्वेंटरी रीऑर्डर वॉच", inventorySub: "स्टॉक कम होने से पहले न्यूनतम स्तर तय करें", expiryTitle: "समाप्ति निगरानी", expirySub: "भोजन खराब होने से पहले मार्जिन बचाएं", reporting: "रिपोर्टिंग", referSave: "रेफ़र और बचत", currentPlan: "वर्तमान योजना",
    navHow: "यह कैसे काम करता है", navPricing: "मूल्य निर्धारण", navAbout: "हमारे बारे में", heroEyebrow: "डेटा-आधारित रसोई इंटेलिजेंस", heroTitle1: "भोजन की बर्बादी को", heroTitleEm: "बचत में बदलें।", heroSub: "Fedd रेस्तरां को बर्बादी समझने, पैटर्न पर कार्रवाई करने और हर थाली से अधिक पैसा बचाने की स्पष्टता देता है।", startTrial: "मुफ़्त ट्रायल शुरू करें", joinNgo: "NGO के रूप में जुड़ें", loopKicker: "प्रक्रिया", loopTitle1: "कम बर्बादी एक", loopTitleSpan: "मापने योग्य लाभ है।",
    loopSteps: [["01", "रसोई से जो कुछ भी निकलता है उसे दर्ज करें", "सेकंडों में अधिशेष दर्ज करें — पनीर टिक्का से लेकर तैयारी के टुकड़ों तक।"], ["02", "महंगे पैटर्न पहचानें", "वे दिन, व्यंजन और निर्णय देखें जो चुपचाप आपका मार्जिन खा रहे हैं।"], ["03", "अपनी अगली शिफ्ट को समझदार बनाएं", "अगली सेवा शुरू होने से पहले एक स्पष्ट कार्रवाई पाएं।"]],
    pricingKicker: "सरल योजनाएं", pricingTitle1: "छोटे से शुरू करें।", pricingTitleSpan: "फर्क देखें।", basicLabel: "बेसिक", basicDesc: "आपकी रसोई के स्पष्ट दैनिक दृश्य के लिए।", chooseBasic: "बेसिक चुनें",
    basicFeatures: ["सारांश डैशबोर्ड", "बर्बादी लॉगिंग", "मार्केटप्लेस एक्सेस"],
    proLabel: "सबसे लोकप्रिय · प्रो", proDesc: "जानकारी को कार्रवाई में बदलने के लिए तैयार ऑपरेटरों के लिए।",
    proFeatures: ["बेसिक में सब कुछ", "सुझाव इंजन", "पूर्ण रुझान विश्लेषण"],
    factsKicker: "बेहतर सेवा के लिए तथ्य", factsTitle1: "छोटे बदलाव", factsTitleSpan: "मापने योग्य परिवर्तन लाते हैं।",
    factsItems: [["1/3", "विश्व स्तर पर उत्पादित भोजन का हिस्सा बर्बाद हो जाता है।", "UNEP फूड वेस्ट इंडेक्स · स्रोत सहित"], ["₹25k करोड़", "भारतीय रेस्तरां में अनुमानित वार्षिक खाद्य-अपशिष्ट लागत।", "उद्योग अनुमान · स्पष्ट रूप से लेबल किया गया"]],
    aboutBackHome: "होम पर वापस जाएं", logInBtn: "लॉग इन करें", signInAs: "इस रूप में साइन इन करें", founderTitle: "संस्थापक, Fedd", founderTagline: "भोजन की बर्बादी से भोजन बचाव तक का एक डेटा-आधारित रास्ता बनाना।", aboutMissionLine: "कम बर्बादी। अधिक पहुंच। एक समय में एक डैशबोर्ड।", aboutCta: "यह कैसे काम करता है देखें", bySubscribingText: "सदस्यता लेकर, आप हमारी सहमति देते हैं", trustKicker: "आपका डेटा, आपके निर्णय", trustLine: "अधिक विचारशील रसोई के लिए सरल उपकरण।", termsLink: "नियम व शर्तें", footerTagline: "कम बर्बादी। अधिक जानकारी।",
    dashboardEyebrow: "रेस्तरां / अवलोकन", wasteByDay: "दिन के अनुसार बर्बादी", last7Days: "पिछले 7 दिन", wasteByCategory: "श्रेणी के अनुसार बर्बादी", whereMargin: "आपका मार्जिन कहाँ जा रहा है", noEntriesWeek: "इस सप्ताह अभी तक कोई प्रविष्टि दर्ज नहीं हुई", peakDaySuffix: "आपका सबसे अधिक बर्बादी वाला दिन है", noEntriesYet: "अभी तक कोई प्रविष्टि नहीं", logSomeCategory: "श्रेणी विश्लेषण देखने के लिए कुछ अधिशेष दर्ज करें।", totalSurplusSuffix: "कुल अधिशेष का", reviewProductionPlan: "उत्पादन योजना की समीक्षा करें", logFewEntries: "इसे अनलॉक करने के लिए कुछ प्रविष्टियाँ दर्ज करें", onceLogged: "एक बार जब आप कुछ अधिशेष दर्ज कर लेंगे, तो हम यहाँ आपकी सबसे बड़ी बर्बादी दिखाएंगे।", biggestSource: "आपकी अधिशेष का सबसे बड़ा स्रोत है। अपना अगला तैयारी बैच घटाएं और केवल ऑर्डर आने पर ही बढ़ाएं।", kgLoggedSoFar: "किलो", soFarPrefix: "आपने अब तक", reducePrepPrefix: "घटाएं", prepSuffix: "की तैयारी", loggedSuffix: "किलो दर्ज", logAnEntry: "इसे देखने के लिए एक प्रविष्टि दर्ज करें", statusListed: "सूचीबद्ध", statusLogged: "दर्ज", entryWord: "प्रविष्टि", entriesWord: "प्रविष्टियाँ", loggedWord: "दर्ज", estimatedAtRate: "₹96/किलो पर अनुमानित", pctOfTotal: "कुल का", proPlan: "प्रो योजना", verifiedPartnerPlan: "सत्यापित भागीदार", logOut: "लॉग आउट", restaurantPortal: "रेस्तरां पोर्टल", ngoPortal: "NGO पोर्टल", adminPortal: "एडमिन पोर्टल", viewLocation: "स्थान देखें",
    goodToSeeYou: "आपको देखकर अच्छा लगा।", loginSub: "अपनी रसोई जहाँ छोड़ी थी वहीं से जारी रखने के लिए लॉग इन करें।", emailAddress: "ईमेल पता", password: "पासवर्ड", enterDashboard: "डैशबोर्ड खोलें", signingIn: "लॉग इन हो रहा है…", newHere: "नए हैं?", welcomeBack: "वापसी पर स्वागत है",
    signUp: "साइन अप", iAmA: "मैं हूँ...", roleRestaurant: "रेस्तरां", roleNgo: "NGO", roleAdmin: "एडमिन", restaurantNamePh: "उदा. ग्रीन टिफिन कंपनी", ngoNamePh: "उदा. रॉबिन हुड आर्मी", adminNamePh: "उदा. प्रिया राव", restaurantNameLabel: "रेस्तरां का नाम", ngoNameLabel: "संगठन का नाम", city: "शहर", contactPerson: "संपर्क व्यक्ति", fullName: "पूरा नाम", adminInviteCode: "एडमिन आमंत्रण कोड", locationLink: "स्थान लिंक (Google मानचित्र)", locationHint: "NGO को सबसे छोटा पिकअप मार्ग तय करने में मदद करता है।", ngoNote: "आवेदनों की समीक्षा Fedd टीम द्वारा की जाती है। सत्यापित NGO को आमतौर पर 48 घंटों के भीतर जवाब मिल जाता है।", adminNote: "एडमिन एक्सेस के लिए Fedd टीम से मान्य आमंत्रण कोड आवश्यक है।", submitting: "सबमिट हो रहा है…", submitVerification: "सत्यापन के लिए सबमिट करें", createAdminAccess: "एडमिन एक्सेस बनाएं", ngoDesc: "सत्यापित NGO आपके शहर के रेस्तरां से अधिशेष भोजन का दावा कर सकते हैं।", adminDesc: "एडमिन एक्सेस केवल मान्य आमंत्रण कोड वाले Fedd टीम सदस्यों तक सीमित है।", restaurantDesc: "एक मिनट से भी कम समय में साइन अप करें — मुफ़्त ट्रायल के लिए कार्ड की आवश्यकता नहीं।", ngoHeadline: "अधिशेष बचाएं, अधिक लोगों को खिलाएं।", adminHeadline: "प्लेटफ़ॉर्म को नियंत्रित करें।", restaurantHeadline: "बर्बादी को बचत में बदलें।",
    logEyebrow: "रेस्तरां / डेटा एंट्री", logSub: "जिस पल अधिशेष होता है उसे दर्ज करें। जितना अधिक आप दर्ज करेंगे, आपकी जानकारी उतनी ही स्पष्ट होगी।", section1Title: "क्या अधिशेष था?", section1Sub: "लागत प्रभाव की गणना के लिए सामान्य भोजन विवरण।", foodItemLabel: "खाद्य पदार्थ *", foodItemPh: "उदा. पनीर टिक्का", categoryLabel: "श्रेणी", quantityLabel: "मात्रा *", quantityHint: "लागत प्रभाव का अनुमान लगाने के लिए उपयोग किया जाता है", reasonLabel: "अधिशेष का कारण", section2Title: "ताज़गी निगरानी", section2Sub: "उपयोग-तिथि को ट्रैक करें ताकि आपकी टीम भोजन बर्बाद होने से पहले कार्रवाई कर सके।", useByLabel: "उपयोग-तिथि", freshnessLabel: "ताज़गी स्थिति", section3Title: "सुरक्षा और पिकअप विवरण", section3Sub: "इस जानकारी को अलग रखें — कभी भी स्वतः सुरक्षित के रूप में चिह्नित न करें।", storageLabel: "भंडारण स्थिति", foodTypeLabel: "भोजन प्रकार", pickupUntilLabel: "सुरक्षित पिकअप तक", packagingLabel: "पैकेजिंग स्थिति", photoLabel: "अधिशेष फोटो", attachedPrefix: "संलग्न:", takesMinute: "एक मिनट से भी कम समय लगता है", saveEntry: "प्रविष्टि सहेजें",
    categoryOptions: [["Mains", "मुख्य व्यंजन"], ["Bakery", "बेकरी"], ["Grains", "अनाज"], ["Desserts", "मिठाई"]],
    reasonOptions: [["Overproduction", "अधिक उत्पादन"], ["Cancelled order", "रद्द किया गया ऑर्डर"], ["Event overestimate", "इवेंट का अधिक अनुमान"], ["Quality issue", "गुणवत्ता समस्या"]],
    freshnessOptions: [["Fresh", "ताज़ा"], ["Use soon", "जल्द उपयोग करें"], ["Out of date", "समयसीमा समाप्त"], ["Discarded", "त्याग दिया गया"]],
    storageOptions: [["Refrigerated", "रेफ्रिजरेटेड"], ["Ambient", "सामान्य तापमान"], ["Frozen", "फ्रोज़न"]],
    foodTypeOptions: [["Vegetarian", "शाकाहारी"], ["Non-vegetarian", "मांसाहारी"], ["Vegan", "वीगन"]],
    packagingOptions: [["Sealed & labelled", "सील और लेबल किया गया"], ["Container ready", "कंटेनर तैयार"], ["Needs packaging", "पैकेजिंग आवश्यक"]],
    marketEyebrow: "रेस्तरां / द्वितीयक", marketSub: "अच्छे भोजन को दूसरा रास्ता दें — जब आपकी रसोई इसका पूरा उपयोग न कर सके।", listSurplusBtn: "अधिशेष सूचीबद्ध करें", activeListings: "सक्रिय सूचियाँ", avgPickupTime: "औसत पिकअप समय", collectedSuccess: "सफलतापूर्वक एकत्रित", pickupByLabel: "इस समय तक पिकअप करें", editListing: "सूची संपादित करें",
    billingEyebrow: "रेस्तरां / खाता", billingTitle: "आपकी योजना", billingSub: "अधिक विचारशील रसोई के लिए एक सरल योजना।", currentStatus: "वर्तमान स्थिति", statusActive: "सक्रिय", statusPending: "सत्यापन लंबित", statusInactive: "निष्क्रिय", planPrefix: "योजना:", noPlanYet: "अभी तक कोई योजना नहीं चुनी गई", choosePrefix: "चुनें", selected: "चयनित", payByQr: "QR से भुगतान करें", scanToPay: "भुगतान के लिए स्कैन करें, फिर नीचे पुष्टि करें", upiIdLabel: "UPI आईडी:", paymentRefLabel: "भुगतान संदर्भ / UTR नंबर", paymentRefPh: "उदा. UPI लेनदेन आईडी", submitPayment: "भुगतान कर दिया — सत्यापन के लिए सबमिट करें",
    ngoClaimsEyebrow: "NGO / मेरे दावे", ngoClaimsTitle: "मेरे दावे", ngoClaimsSub: "अपनी बचाव यात्राओं को स्पष्ट और समय पर रखें।", activeClaims: "सक्रिय दावे", claimed: "दावा किया गया", pickedUp: "उठा लिया गया", confirmPickupBtn: "पिकअप की पुष्टि करें", noClaimsYet: "अभी तक कोई दावा नहीं", claimWhenReady: "जब आपकी टीम बचाव के लिए तैयार हो तो सूची का दावा करें।", ngoMapEyebrow: "NGO / मानचित्र दृश्य", ngoMapTitle: "आस-पास का बचाव मानचित्र", ngoMapSub: "पिकअप शुरू करने से पहले दूरी और यात्रा समय का आकलन करें।", liveOpportunities: "आपके क्षेत्र में लाइव अवसर", planPickup: "पिकअप की योजना बनाएं", ngoVerifyEyebrow: "NGO / सत्यापन", ngoVerifySub: "Fedd के साथ आपकी भागीदार स्थिति।", verifiedPartner: "सत्यापित भागीदार", pendingVerification: "सत्यापन लंबित", verifiedText: "सत्यापित रेस्तरां से अधिशेष भोजन का दावा करने के लिए अनुमोदित है।", pendingVerifyText: "एक एडमिन आपके आवेदन की समीक्षा कर रहा है। स्वीकृत होने पर आप सूचियों का दावा कर पाएंगे।", active: "सक्रिय", awaitingApproval: "अनुमोदन की प्रतीक्षा में", yourOrg: "आपका संगठन", ngoFeedEyebrow: "NGO / लाइव फीड", rescueOppsTitle: "बचाव के अवसर", rescueOppsSub: "अच्छा भोजन, दूसरी थाली के लिए तैयार।", myClaimsBadge: "मेरे दावे", noLiveListings: "कोई लाइव सूची नहीं", newOppsAppearHere: "नए बचाव अवसर यहाँ दिखाई देंगे।", priority: "प्राथमिकता",
    adminQueueEyebrow: "एडमिन / संचालन", verifyQueueTitle: "सत्यापन कतार", verifyQueueSub: "नेटवर्क में शामिल होने की प्रतीक्षा कर रहे NGO की समीक्षा करें।", pending: "लंबित", approve: "स्वीकृत करें", queueClear: "कतार साफ़ है", allReviewed: "सभी भागीदार आवेदनों की समीक्षा हो चुकी है।", adminPaymentsEyebrow: "एडमिन / बिलिंग", pendingPaymentsTitle: "लंबित भुगतान", pendingPaymentsSub: "रेस्तरां द्वारा सबमिट किए गए QR भुगतान सत्यापित करें।", refLabel: "संदर्भ:", noPendingPayments: "कोई लंबित भुगतान नहीं", paymentsAppearHere: "भुगतान सबमिशन सत्यापन के लिए यहाँ दिखाई देंगे।", adminSubsEyebrow: "एडमिन / राजस्व", subscribersTitle: "सब्सक्राइबर", subscribersSub: "आपका सक्रिय रेस्तरां नेटवर्क।", searchRestaurants: "रेस्तरां खोजें", restaurantCol: "रेस्तरां", planCol: "योजना", statusCol: "स्थिति", noSubscribersYet: "अभी तक कोई सब्सक्राइबर नहीं", restaurantsAppearHere: "भुगतान सबमिट करने वाले रेस्तरां यहाँ दिखाई देंगे।", adminRescuesEyebrow: "एडमिन / प्रभाव", rescuesTitle: "बचाव", rescuesSub: "नेटवर्क में पूर्ण किए गए पिकअप।", itemCol: "वस्तु", quantityCol: "मात्रा", noRescuesYet: "अभी तक कोई बचाव नहीं", pickupsAppearHere: "पूर्ण किए गए पिकअप यहाँ दिखाई देंगे।", adminOverviewEyebrow: "एडमिन / प्लेटफ़ॉर्म", platformOverview: "प्लेटफ़ॉर्म अवलोकन", platformPulse: "Fedd नेटवर्क में एक लाइव झलक।", pendingVerifications: "लंबित सत्यापन", ngosAwaiting: "समीक्षा की प्रतीक्षा में NGO", rescuesFacilitated: "सुगम बचाव", completedPickups: "पूर्ण पिकअप", activeSubscribers: "सक्रिय सब्सक्राइबर", ofTotal: "में से", total: "कुल", pendingPayments: "लंबित भुगतान", awaitingVerification: "सत्यापन की प्रतीक्षा में",
    shareProgress: "प्रगति साझा करें", exportSummary: "अपने निवेशकों, ऑडिटरों या CSR रिपोर्ट के लिए एक स्पष्ट मासिक सारांश निर्यात करें।", exportCsv: "CSV रिपोर्ट निर्यात करें", giveMonthGetMonth: "एक महीना दें, एक महीना पाएं", referText: "किसी अन्य रेस्तरां को आमंत्रित करें और दोनों टीमों को प्रो का एक महीना मुफ़्त मिलता है।", copyReferral: "रेफरल लिंक कॉपी करें",
    invAlerts: "अलर्ट", invItem: "वस्तु", invCurrent: "वर्तमान", invMinimum: "न्यूनतम", invAction: "कार्रवाई", invRequested: "अनुरोधित", invReorder: "पुनः ऑर्डर करें", invStockHealthy: "स्टॉक स्वस्थ है", invEmptyTitle: "अभी तक कोई वस्तु नहीं", invEmptyText: "अपनी पुनः ऑर्डर सीमाएं ट्रैक करना शुरू करने के लिए नीचे एक वस्तु जोड़ें।", invAddPlaceholder: "उदा. बासमती चावल", invAddButton: "वस्तु जोड़ें", expiryEmptyTitle: "कुछ भी समाप्त नहीं हो रहा", expiryEmptyText: "अधिशेष दर्ज करने के बाद समाप्ति तिथि के करीब आइटम यहाँ दिखाई देंगे।", playbookEmptyTitle: "अभी तक कोई सुझाव नहीं", playbookEmptyText: "कुछ प्रविष्टियाँ दर्ज करें और हम यहाँ आपकी सबसे बड़ी बर्बादी दिखाएंगे।",
    
    playbookKicker: "गणना की गई अगली सर्वश्रेष्ठ कार्रवाई", playbookReduceBy: "घटाएं", playbookPrepBy: "तैयारी लगभग ~", playbookHistoryPrefix: "आपका दर्ज इतिहास दिखाता है", playbookHistorySuffix: "किलो", playbookSurplusSuffix: "अधिशेष। एक छोटे पहले बैच से शुरू करें, फिर ऑर्डर आने पर ही बढ़ाएं।", playbookCreateChecklist: "तैयारी चेकलिस्ट बनाएं", playbookStep1: "पहला बैच घटाएं", playbookStep2: "सेवा जांच सेट करें", playbookStep2Sub: "कवर बनाम तैयारी की समीक्षा करें", playbookStep3: "अधिशेष पुनर्निर्देशित करें", playbookStep3Sub: "सुरक्षित बचा हुआ भोजन सूचीबद्ध करें",
  },
};

function App() {
  const [role, setRole] = useState("landing");
  const [page, setPage] = useState("overview");
  const [dark, setDark] = useState(() => localStorage.getItem("fedd-theme") === "dark");
  const [lang, setLang] = useState(() => localStorage.getItem("fedd-lang") || "en");
  const [mobileNav, setMobileNav] = useState(false);
  const [logs, setLogs] = useState([]);
  const [claims, setClaims] = useState([]);
  const [listings, setListings] = useState([]);
  const [orgs, setOrgs] = useState(() => JSON.parse(localStorage.getItem("fedd-orgs") || "null") || {});
  const [orgMeta, setOrgMeta] = useState(() => JSON.parse(localStorage.getItem("fedd-orgmeta") || "null") || {});
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [loginRole, setLoginRole] = useState("restaurant");
  const [signupRole, setSignupRole] = useState(null);
  const [showAbout, setShowAbout] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [form, setForm] = useState({ item: "", category: "Mains", qty: "", reason: "Overproduction", useBy: "", expiryStatus: "Fresh", storage: "Refrigerated", foodType: "Vegetarian", pickupTime: "20:30", packaging: "Sealed & labelled", photo: "", photoFile: null });
  const t = copy[lang];
  useEffect(() => { document.body.className = dark ? "dark" : ""; localStorage.setItem("fedd-theme", dark ? "dark" : "light"); }, [dark]);
  useEffect(() => { localStorage.setItem("fedd-lang", lang); }, [lang]);
  useEffect(() => { localStorage.setItem("fedd-orgs", JSON.stringify(orgs)); localStorage.setItem("fedd-orgmeta", JSON.stringify(orgMeta)); }, [orgs, orgMeta]);

  const openPortal = (nextRole) => { setRole(nextRole); setPage(nextRole === "restaurant" ? "overview" : nextRole === "ngo" ? "listings" : "admin-overview"); setShowLogin(false); setSignupRole(null); };

  const applyProfile = (profile) => {
    setOrgs((o) => ({ ...o, [profile.role]: profile.org_name }));
    setOrgMeta((m) => ({ ...m, [profile.role]: { ...(m[profile.role] || {}), city: profile.city || "" } }));
  };

  // Restore a session after a page refresh (Vercel serves a static build, so nothing else keeps you logged in).
  useEffect(() => {
    const token = getToken();
    if (!token) { setAuthLoading(false); return; }
    api.auth.me().then((profile) => {
      setSession({ token, profile });
      applyProfile(profile);
      openPortal(profile.role);
    }).catch(() => clearToken()).finally(() => setAuthLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!session || role !== "restaurant") return;
    api.logs.list().then((rows) => setLogs(rows.map(mapLogFromApi))).catch((err) => toast.error(err.message));
  }, [session, role]);

  useEffect(() => {
    if (!session || (role !== "restaurant" && role !== "ngo")) return;
    api.marketplace.listListings().then((rows) => setListings(rows.map(mapListingFromApi))).catch((err) => toast.error(err.message));
  }, [session, role]);

  useEffect(() => {
    if (!session || role !== "ngo") return;
    api.claims.list().then((rows) => setClaims(rows.map(mapClaimFromApi))).catch((err) => toast.error(err.message));
  }, [session, role]);

  const listedLogIds = useMemo(() => new Set(listings.map((x) => x.logId).filter(Boolean)), [listings]);
  const logsWithStatus = useMemo(() => logs.map((l) => ({ ...l, listed: listedLogIds.has(l.id) })), [logs, listedLogIds]);
  const totalKg = logs.reduce((a, b) => a + Number(b.qty), 0);

  const nav = role === "restaurant" ? [{ id: "overview", label: t.overview, icon: BarChart3 }, { id: "log", label: t.log, icon: ClipboardList }, { id: "market", label: t.market, icon: PackageOpen }, { id: "billing", label: t.billing, icon: CircleDollarSign }] : role === "ngo" ? [{ id: "listings", label: t.liveListings, icon: PackageOpen }, { id: "map", label: t.mapDistance, icon: MapPin }, { id: "claims", label: t.claims, icon: Check }, { id: "verification", label: t.verificationStatus, icon: ShieldCheck }] : [{ id: "admin-overview", label: t.overview, icon: BarChart3 }, { id: "queue", label: t.verificationStatus, icon: ShieldCheck }, { id: "subscribers", label: t.subscribersTitle, icon: Users }, { id: "payments", label: t.pendingPayments, icon: CircleDollarSign }, { id: "rescues", label: t.rescuesTitle, icon: PackageOpen }];

  const addLog = async (e) => {
    e.preventDefault();
    if (!form.item || !form.qty) return toast.error("Add an item and quantity first");
    const notes = [form.category, form.reason, form.foodType, form.useBy && `use by ${form.useBy}`, form.expiryStatus].filter(Boolean).join(" · ");
    try {
      const created = await api.logs.create({ food_type: form.item, quantity_kg: Number(form.qty), storage: form.storage, pickup_time: timeToIso(form.pickupTime), packaging: form.packaging, notes });
      if (form.photoFile) await api.logs.uploadPhoto(created.id, form.photoFile).catch(() => toast.error("Log saved, but the photo upload failed"));
      setLogs((prev) => [mapLogFromApi(created), ...prev]);
      setForm({ item: "", category: "Mains", qty: "", reason: "Overproduction", useBy: "", expiryStatus: "Fresh", storage: "Refrigerated", foodType: "Vegetarian", pickupTime: "20:30", packaging: "Sealed & labelled", photo: "", photoFile: null });
      toast.success("Waste entry logged — dashboard updated");
      setPage("overview");
    } catch (err) { toast.error(err.message || "Could not save the log"); }
  };

  const listSurplus = async () => {
    const target = logsWithStatus.find((l) => !l.listed);
    if (!target) return toast.error("No unlisted surplus to list — log something first");
    try {
      const created = await api.marketplace.createListing({ log_id: target.id, pickup_window: target.pickupTime ? new Date(target.pickupTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined });
      setListings((prev) => [mapListingFromApi(created), ...prev]);
      toast.success(`${target.item} listed on the marketplace`);
    } catch (err) { toast.error(err.message || "Could not create the listing"); }
  };

  const claim = async (item) => {
    try {
      const created = await api.claims.create(item.id);
      setClaims((prev) => [...prev, { ...item, claimId: created.id, status: created.status }]);
      setListings((prev) => prev.filter((x) => x.id !== item.id));
      toast.success(`${item.item} added to My Claims`);
    } catch (err) { toast.error(err.message || "Could not claim this listing"); }
  };

  const confirmPickup = async (claimId) => {
    try {
      await api.claims.updateStatus(claimId, "picked_up");
      setClaims((prev) => prev.map((c) => (c.claimId === claimId ? { ...c, status: "picked_up" } : c)));
      toast.success("Pickup confirmed");
    } catch (err) { toast.error(err.message || "Could not confirm pickup"); }
  };

  const handleLogin = async (email, password) => {
    const result = await api.auth.login(email, password);
    setToken(result.access_token);
    const profile = await api.auth.me();
    setSession({ token: result.access_token, profile });
    applyProfile(profile);
    openPortal(profile.role);
  };

  const handleSignup = async (r, payload) => {
    await api.auth.signup({ email: payload.email, password: payload.password, role: r, org_name: payload.orgName, city: payload.city, phone: payload.contact, admin_invite_code: payload.adminCode });
    await handleLogin(payload.email, payload.password);
  };

  const logout = () => { clearToken(); setSession(null); setLogs([]); setListings([]); setClaims([]); setRole("landing"); };

  if (authLoading) return null;
  if (showAbout) return <AboutPage t={t} dark={dark} onBack={() => setShowAbout(false)} onHome={() => setShowAbout(false)} />;
  if (showTerms) return <TermsPage t={t} dark={dark} onBack={() => setShowTerms(false)} />;
  if (role === "landing") return <Landing showLogin={(r) => { setLoginRole(typeof r === "string" ? r : "restaurant"); setShowLogin(true); }} hideLogin={() => setShowLogin(false)} showSignup={(r) => { setShowLogin(false); setSignupRole(r); }} hideSignup={() => setSignupRole(null)} onSignup={handleSignup} onLogin={handleLogin} signup={signupRole} dark={dark} setDark={setDark} lang={lang} setLang={setLang} login={showLogin} loginRole={loginRole} showAboutPage={() => setShowAbout(true)} showTermsPage={() => setShowTerms(true)} />;
  return <div className={`shell ${dark ? "theme-dark" : ""}`}><Toaster richColors position="bottom-right" /><aside className={mobileNav ? "sidebar open" : "sidebar"}><div className="brand"><span className="brand-mark"><Leaf size={18} /></span><span>Fedd</span></div><div className="workspace"><span className="workspace-dot" />{orgs[role] || "Fedd"}<ChevronRight size={14} /></div><nav>{nav.map(({ id, label, icon: Icon }) => <button key={id} data-testid={`nav-${id}`} className={page === id ? "active" : ""} onClick={() => { setPage(id); setMobileNav(false); }}><Icon size={17} />{label}</button>)}</nav><div className="side-foot"><div className="plan-mini"><span>{t.currentPlan}</span><strong>{role === "restaurant" ? t.proPlan : t.verifiedPartnerPlan}</strong><div className="progress"><i /></div></div><button data-testid="logout-button" className="logout" onClick={logout}><LogOut size={16} /> {t.logOut}</button></div></aside><main className="main"><header className="topbar"><button data-testid="mobile-menu-button" className="icon-btn mobile-menu" aria-label="Open navigation" onClick={() => setMobileNav(!mobileNav)}><Menu size={20} /></button><div className="crumb"><span>{role === "restaurant" ? t.restaurantPortal : role === "ngo" ? t.ngoPortal : t.adminPortal}</span><ChevronRight size={14} /><strong>{nav.find((x) => x.id === page)?.label}</strong></div><div className="top-actions">{orgMeta[role]?.location && <a data-testid="topbar-location-link" className="location-pill" href={orgMeta[role].location} target="_blank" rel="noreferrer"><MapPin size={13} /> {orgMeta[role].city || t.viewLocation}</a>}<button data-testid="language-toggle" className="toggle" onClick={() => setLang(lang === "en" ? "hi" : "en")}>{lang === "en" ? "EN" : "हि"}</button><button data-testid="theme-toggle" className="icon-btn" aria-label="Toggle theme" onClick={() => setDark(!dark)}>{dark ? <Sun size={17} /> : <Moon size={17} />}</button><button data-testid="notifications-button" className="icon-btn" aria-label="Notifications" onClick={() => toast.info("You're all caught up — no new alerts")}><Bell size={17} /><i className="notify-dot" /></button><div className="avatar">{initials(orgs[role])}</div></div></header><div className="content">{role === "restaurant" && <RestaurantPage page={page} t={t} logs={logsWithStatus} totalKg={totalKg} addLog={addLog} form={form} setForm={setForm} listings={listings} dark={dark} setPage={setPage} orgMeta={orgMeta.restaurant} orgName={orgs.restaurant} lang={lang} onListSurplus={listSurplus} onShowTerms={() => setShowTerms(true)} />} {role === "ngo" && <NgoPage t={t} page={page} listings={listings} claims={claims} claim={claim} confirmPickup={confirmPickup} verified={session?.profile?.verified} orgName={orgs.ngo} />} {role === "admin" && <AdminPage t={t} page={page} />}</div></main></div>;
}

function Landing({ showLogin, hideLogin, showSignup, hideSignup, onSignup, onLogin, signup, dark, setDark, lang, setLang, login, loginRole, showAboutPage, showTermsPage }) {
  const t = copy[lang];
  const [signInOpen, setSignInOpen] = useState(false);
  const pickSignIn = (role) => { setSignInOpen(false); showLogin(role); };
  return <div className={`landing ${dark ? "theme-dark" : ""}`}><Toaster richColors position="bottom-right" /><header className="landing-nav"><div className="brand"><span className="brand-mark"><Leaf size={18} /></span><span>Fedd</span></div><div className="landing-links"><a href="#how">{t.navHow}</a><a href="#pricing">{t.navPricing}</a><button data-testid="landing-about-nav" className="text-button nav-link" onClick={showAboutPage}>{t.navAbout}</button><button data-testid="landing-language-toggle" className="toggle" onClick={() => setLang(lang === "en" ? "hi" : "en")}>{lang === "en" ? "EN / हि" : "हि / EN"}</button><button data-testid="landing-theme-toggle" className="icon-btn" onClick={() => setDark(!dark)}>{dark ? <Sun size={17} /> : <Moon size={17} />}</button><div className="signin-menu"><button data-testid="landing-signin-toggle" className="text-button" onClick={() => setSignInOpen((o) => !o)}>{t.signInAs} <ChevronDown size={14} /></button>{signInOpen && <><div className="signin-menu-backdrop" onClick={() => setSignInOpen(false)} /><div className="signin-menu-panel"><button data-testid="signin-as-restaurant" onClick={() => pickSignIn("restaurant")}>{t.roleRestaurant}</button><button data-testid="signin-as-ngo" onClick={() => pickSignIn("ngo")}>{t.roleNgo}</button><button data-testid="signin-as-admin" onClick={() => pickSignIn("admin")}>{t.roleAdmin}</button></div></>}</div></div></header><section className="hero hero-solo"><div className="hero-copy"><div className="eyebrow"><span className="pulse" /> {t.heroEyebrow}</div><h1>{t.heroTitle1}<br /><em>{t.heroTitleEm}</em></h1><p>{t.heroSub}</p><div className="hero-actions"><button data-testid="hero-trial-button" className="primary-btn" onClick={() => showSignup("restaurant")}>{t.startTrial} <ArrowRight size={17} /></button><button data-testid="hero-ngo-button" className="secondary-btn" onClick={() => showSignup("ngo")}>{t.joinNgo}</button></div></div></section><section id="how" className="loop-section"><div className="section-kicker">{t.loopKicker}</div><h2>{t.loopTitle1}<br /><span>{t.loopTitleSpan}</span></h2><div className="loop-grid">{t.loopSteps.map(([n, h, p]) => <div className="loop-item" key={n}><span className="loop-num">{n}</span><h3>{h}</h3><p>{p}</p><ArrowRight size={18} /></div>)}</div></section><section id="pricing" className="pricing-section"><div><div className="section-kicker">{t.pricingKicker}</div><h2>{t.pricingTitle1}<br /><span>{t.pricingTitleSpan}</span></h2></div><div className="pricing-grid"><div className="price-ticket"><span className="plan-label">{t.basicLabel}</span><strong>₹999 <small>/ month</small></strong><p>{t.basicDesc}</p><button data-testid="basic-plan-button" onClick={() => showSignup("restaurant")} className="secondary-btn">{t.chooseBasic} <ArrowRight size={15} /></button><ul>{t.basicFeatures.map((f) => <li key={f}><Check size={15} />{f}</li>)}</ul></div><div className="price-ticket featured"><span className="plan-label">{t.proLabel}</span><strong>₹2,499 <small>/ month</small></strong><p>{t.proDesc}</p><button data-testid="pro-plan-button" onClick={() => showSignup("restaurant")} className="primary-btn">{t.startTrial} <ArrowRight size={15} /></button><ul>{t.proFeatures.map((f) => <li key={f}><Check size={15} />{f}</li>)}</ul></div></div></section><ImpactFacts t={t} /><AboutSection t={t} showTermsPage={showTermsPage} /><footer className="landing-footer"><div className="brand"><span className="brand-mark"><Leaf size={18} /></span><span>Fedd</span></div><span>{t.footerTagline}</span><div className="footer-roles"><button data-testid="footer-login" onClick={showLogin}>{t.logInBtn}</button><button data-testid="footer-about-link" onClick={showAboutPage}>{t.navAbout}</button><button data-testid="footer-terms-link" onClick={showTermsPage}>{t.termsLink}</button></div></footer>{login && <LoginModal t={t} close={hideLogin} onLogin={onLogin} showSignup={showSignup} role={loginRole} />}{signup && <SignupModal t={t} role={signup} close={hideSignup} onSignup={onSignup} />}</div>;
}

function AboutSection({ t, showTermsPage }) { return <section className="trust-band"><span>{t.trustKicker}</span><b>{t.trustLine}</b><button data-testid="terms-button" className="text-button" onClick={showTermsPage}>{t.termsLink} <ArrowRight size={15} /></button></section>; }

function AboutPage({ t, dark, onBack, onHome }) {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return <div className={`landing about-page ${dark ? "theme-dark" : ""}`}>
    <div className="about-page-inner">
      <button data-testid="about-back-link" className="text-button about-back" onClick={onBack}><ArrowLeft size={15} /> {t.aboutBackHome}</button>
      <div className="founder-hero">
        <div className="founder-avatar">YA</div>
        <h1>Yajas Arora</h1>
        <div className="founder-role">{t.founderTitle}</div>
        <p className="founder-tagline">{t.founderTagline}</p>
      </div>
      <div className="founder-story">
        <p>I'm Yajas Arora, the founder of Fedd.</p>
        <p>I've always been someone who takes food seriously — not just eating it, but really caring about where it comes from and where it ends up. So somewhere along the way, I started noticing something a lot of people walk past without a second thought: how much food gets thrown away every single day at restaurants. Trays scraped into bins. Trolleys of untouched food wheeled out the back door. Perfectly good meals treated as garbage before they ever reached someone who actually needed them.</p>
        <blockquote className="pull-quote">It genuinely hurt to watch.</blockquote>
        <p>Not in an abstract, "this is a global problem" way — in a very specific, standing-in-that-kitchen way. Because on one side of that door was food being wasted, and I knew that on the other side of the city, there were people and organizations who could have used every last bit of it.</p>
        <p>That gap — between surplus and need — felt like something technology should be able to close. Not through guilt or charity alone, but through data: helping restaurants actually see their waste, understand why it happens, and do something about it before food is thrown away at all. And where prevention isn't enough, connecting that surplus directly to NGOs who can get it to people who need it, quickly and safely.</p>
        <blockquote className="pull-quote">Solving food waste properly means doing both — reducing it at the source, and making sure whatever's left over finds its way to someone's plate instead of a landfill.</blockquote>
        <p>That's what Fedd is. It's not just a rescue app, and it's not just an analytics tool — it's both, because that's what the problem actually requires.</p>
        <p>This started as something I built because I couldn't stop thinking about the problem. It's grown into a platform I hope helps restaurants save money, helps NGOs reach more people, and moves the needle — even a little — on food sustainability.</p>
      </div>
      <div className="founder-closing">
        <p className="mission-line">{t.aboutMissionLine}</p>
        <button data-testid="about-cta-button" className="primary-btn" onClick={onHome}>{t.aboutCta} <ArrowRight size={16} /></button>
      </div>
    </div>
  </div>;
}

const TERMS_LAST_UPDATED = "22 September 2026";
const TERMS_SECTIONS = [
  { id: "introduction", title: "1. Introduction", paragraphs: ["Welcome to Fedd. These Terms & Conditions describe how the platform is intended to work for the three groups who use it: restaurants, NGO partners, and administrators. By using this platform (in its current demo/prototype form), you're agreeing to these terms as they're written here — understanding that this is a project in progress, not a finished commercial product."] },
  { id: "definitions", title: "2. Definitions", list: true, paragraphs: ["“Platform” refers to Fedd, including its website, dashboard, and marketplace features.", "“Restaurant” refers to any food business account using the platform to log waste and list surplus food.", "“NGO Partner” refers to any verified non-profit organization account using the platform to browse and claim surplus food listings.", "“Listing” refers to a surplus food item a restaurant has made available for pickup.", "“Subscription” refers to a restaurant's paid Basic or Pro plan.", "“Rescue Event” refers to a completed pickup of a claimed listing by an NGO Partner."] },
  { id: "who-can-use", title: "3. Who Can Use This Platform", paragraphs: ["Restaurant accounts are intended for genuine food businesses that want to track and reduce food waste.", "NGO accounts are intended for organizations engaged in food redistribution to people in need, and are subject to a verification step by an admin before they can claim listings.", "You agree to provide accurate information when creating an account. We reserve the right to suspend accounts that appear to use false or misleading information."] },
  { id: "restaurant-terms", title: "4. Restaurant Terms", paragraphs: ["Restaurants are responsible for the accuracy of the information they log — item name, quantity, category, storage condition, and safe pickup window.", "Restaurants choose which subscription tier (Basic ₹100/month or Pro ₹200/month) fits their needs. Subscription tiers unlock different levels of dashboard insight, as described on the pricing page.", "Restaurants remain responsible for ensuring that any food listed on the marketplace is genuinely safe to collect and consume at the time it is listed. Fedd is a platform that connects restaurants and NGOs — it does not inspect, handle, or guarantee the safety of any food item.", "Subscriptions renew automatically each month unless cancelled. Cancelling a subscription stops future billing but does not retroactively refund the current billing period."] },
  { id: "ngo-terms", title: "5. NGO Partner Terms", paragraphs: ["NGO accounts must complete a verification step before they can claim listings. Verification status is reviewed by platform administrators.", "Once an NGO claims a listing, it is expected to arrive within the stated pickup window and handle the collected food responsibly, distributing it to its intended beneficiaries.", "NGOs agree not to resell any food obtained through the platform.", "Repeated no-shows or mishandling of claimed listings may result in an NGO's verification being revoked."] },
  { id: "marketplace", title: "6. The Marketplace", paragraphs: ["Fedd acts only as a connector between restaurants and NGOs. We are not a party to the actual handover of food, and we do not take responsibility for what happens after a listing is claimed and picked up.", "There is no guarantee that any given listing will be claimed before its pickup window expires. Unclaimed listings automatically expire and are logged for reporting purposes.", "We reserve the right to remove any listing that appears to violate these terms or common-sense food safety expectations."] },
  { id: "payments", title: "7. Payments", paragraphs: ["All subscription payments are processed in Indian Rupees (₹).", "Referral credits (a free month for both the referrer and the new sign-up) are applied automatically when a valid referral code is used at sign-up, and may be changed or discontinued at any time.", "We may change subscription pricing in the future; existing subscribers will be notified before any price change takes effect."] },
  { id: "your-data", title: "8. Your Data", paragraphs: ["We collect the data you provide directly: waste logs, inventory records, listings, ratings, and any photos you choose to upload.", "This data is used to power your own dashboard (KPIs, recommendations, benchmarking) and, in aggregated/anonymized form, to compute category averages shown to other restaurants for benchmarking purposes. Your individual data is never shown to another restaurant.", "You can request deletion of your account and associated data at any time by contacting us."] },
  { id: "ratings", title: "9. Ratings", paragraphs: ["Both restaurants and NGOs may rate each other after a completed rescue event.", "Ratings should reflect a genuine, good-faith account of the interaction. Fraudulent, retaliatory, or abusive ratings may be removed."] },
  { id: "prohibited", title: "10. Things You Agree Not to Do", list: true, paragraphs: ["List food you know to be unsafe, spoiled, or inaccurately described.", "Create fake accounts or falsely represent your organization's identity.", "Use contact information obtained through the platform for unrelated marketing or spam.", "Attempt to disrupt, reverse-engineer, or interfere with the platform's normal operation."] },
  { id: "limitation", title: "11. Limitation of Responsibility", paragraphs: ["Fedd is provided as a tool to help reduce and redistribute food waste. We do not accept responsibility for illness, loss, or disputes arising from the physical condition of food once it has been listed, claimed, or collected. This platform is a coordination tool — the people actually handling the food are responsible for its safety."] },
  { id: "ending", title: "12. Ending Your Account", paragraphs: ["You may close your account at any time.", "We may suspend or terminate accounts that violate these terms, provide false information, or misuse the platform.", "Upon termination, active listings tied to your account will be removed."] },
  { id: "changes", title: "13. Changes to These Terms", paragraphs: ["We may update these terms as the platform develops. Continued use of the platform after changes are posted means you accept the updated terms."] },
  { id: "contact", title: "14. Contact Us", paragraphs: ["Questions about these terms can be sent to:", "Phone: +91 1800-123-456", "Email: feddsupport@gmail.com"] },
];

function TermsPage({ t, dark, onBack }) {
  const [tocOpen, setTocOpen] = useState(false);
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const goTo = (id) => { setTocOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  return <div className={`landing terms-page ${dark ? "theme-dark" : ""}`}>
    <div className="terms-page-inner">
      <button data-testid="terms-back-link" className="text-button about-back" onClick={onBack}><ArrowLeft size={15} /> {t.aboutBackHome}</button>
      <h1>Terms & Conditions</h1>
      <p className="terms-updated">Last updated: {TERMS_LAST_UPDATED}</p>

      <div className="terms-warning">
        <AlertTriangle size={20} />
        <div><b>Important note:</b> This document is a draft written for demonstration and academic-project purposes only. It is not a legally binding agreement, has not been reviewed by a lawyer, and should not be treated as enforceable terms of service. Before this platform is used commercially or by real restaurants/NGOs handling real transactions, this page must be replaced with terms drafted and reviewed by a qualified legal professional.</div>
      </div>

      <details className="terms-toc-mobile">
        <summary>Jump to a section</summary>
        <nav>{TERMS_SECTIONS.map((s) => <button key={s.id} onClick={() => goTo(s.id)}>{s.title}</button>)}</nav>
      </details>

      <div className="terms-layout">
        <div className="terms-toc-desktop">
          <nav className="terms-toc-sticky">
            <div className="terms-toc-label">On this page</div>
            {TERMS_SECTIONS.map((s) => <button key={s.id} onClick={() => goTo(s.id)}>{s.title}</button>)}
          </nav>
        </div>
        <div className="terms-body">
          {TERMS_SECTIONS.map((s) => <section id={s.id} key={s.id} className="terms-section">
            <h2>{s.title}</h2>
            {s.list
              ? <ul>{s.paragraphs.map((p, i) => <li key={i}>{p}</li>)}</ul>
              : s.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </section>)}
          <p className="terms-closing-note">Again — this is a placeholder document written for a student/demo project. It is not a substitute for real legal terms drafted by a qualified professional, and should not be relied upon for any live platform handling real users, real payments, or real food safety concerns.</p>
        </div>
      </div>
    </div>
  </div>;
}

function LoginModal({ t, onLogin, close, showSignup, role }) {
  const isAdmin = role === "admin";
  const isNgo = role === "ngo";
  const emailPh = isNgo ? "hello@ngo.org" : isAdmin ? "you@fedd.in" : "you@restaurant.com";
  const roleLabel = isNgo ? t.roleNgo : isAdmin ? t.roleAdmin : t.roleRestaurant;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submit = async () => { if (!email || !password) return toast.error("Enter your email and password"); setSubmitting(true); try { await onLogin(email, password); } catch (err) { toast.error(err.message || "Login failed"); } finally { setSubmitting(false); } };
  return <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) close(); }}><div className="login-modal"><button data-testid="close-login-button" className="modal-close" aria-label="Close login" onClick={close}><X size={18} /></button><div className="section-kicker">{t.welcomeBack} · {roleLabel}</div><h2>{t.goodToSeeYou}</h2><p>{t.loginSub}</p><label>{t.emailAddress}<input data-testid="login-email-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={emailPh} /></label><label>{t.password}<input data-testid="login-password-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></label><button data-testid="login-submit-button" className="primary-btn full" disabled={submitting} onClick={submit}>{submitting ? t.signingIn : t.enterDashboard} <ArrowRight size={16} /></button>{!isAdmin && <div className="signup-line"><span>{t.newHere}</span><button data-testid="login-signup-link" onClick={() => showSignup && showSignup(role)}>{t.signUp}</button></div>}</div></div>;
}

function SignupModal({ t, role: initialRole, close, onSignup }) {
  const [role, setRole] = useState(initialRole || "restaurant");
  const isNgo = role === "ngo";
  const isAdmin = role === "admin";
  const [form, setForm] = useState({ orgName: "", city: "", contact: "", email: "", password: "", location: "", adminCode: "" });
  const [submitting, setSubmitting] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!form.orgName || !form.email || !form.password) return toast.error("Add your name, email, and a password");
    if (isAdmin && !form.adminCode) return toast.error("Admin invite code is required");
    if (form.location && !/^https?:\/\//i.test(form.location)) return toast.error("Location link should start with http:// or https://");
    setSubmitting(true);
    try {
      await onSignup(role, form);
      toast.success(isNgo ? `${form.orgName} submitted for verification` : isAdmin ? `Admin access granted — welcome ${form.orgName}` : `${form.orgName} — account created`);
    } catch (err) {
      toast.error(err.message || "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };
  return <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
    <div className="login-modal signup-modal">
      <button data-testid="close-signup-button" className="modal-close" aria-label="Close signup" onClick={close}><X size={18} /></button>
      <div className="section-kicker">{t.signUp}</div>
      <h2>{isNgo ? t.ngoHeadline : isAdmin ? t.adminHeadline : t.restaurantHeadline}</h2>
      <p>{isNgo ? t.ngoDesc : isAdmin ? t.adminDesc : t.restaurantDesc}</p>
      <form onSubmit={submit}>
        <label>{t.iAmA}<select data-testid="signup-role-select" value={role} onChange={(e) => setRole(e.target.value)}><option value="restaurant">{t.roleRestaurant}</option><option value="ngo">{t.roleNgo}</option><option value="admin">{t.roleAdmin}</option></select></label>
        <label>{isAdmin ? t.fullName : isNgo ? t.ngoNameLabel : t.restaurantNameLabel}<input data-testid="signup-org-input" value={form.orgName} onChange={(e) => setForm({ ...form, orgName: e.target.value })} placeholder={isAdmin ? t.adminNamePh : isNgo ? t.ngoNamePh : t.restaurantNamePh} required /></label>
        {!isAdmin && <label>{t.city}<input data-testid="signup-city-input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Mumbai" /></label>}
        {!isAdmin && <label>{t.contactPerson}<input data-testid="signup-contact-input" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder={t.fullName} /></label>}
        <label>{t.emailAddress}<input data-testid="signup-email-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={isNgo ? "hello@ngo.org" : isAdmin ? "you@fedd.in" : "you@restaurant.com"} required /></label>
        <label>{t.password}<input data-testid="signup-password-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" /></label>
        {isAdmin && <label>{t.adminInviteCode}<input data-testid="signup-admincode-input" value={form.adminCode} onChange={(e) => setForm({ ...form, adminCode: e.target.value })} placeholder="FD-ADMIN-XXXX" required /></label>}
        {!isAdmin && <label>{t.locationLink}<input data-testid="signup-location-input" type="url" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="https://maps.google.com/…" /><small>{t.locationHint}</small></label>}
        {isNgo && <p className="signup-note"><ShieldCheck size={13} /> {t.ngoNote}</p>}
        {isAdmin && <p className="signup-note"><ShieldCheck size={13} /> {t.adminNote}</p>}
        <button data-testid="signup-submit-button" type="submit" className="primary-btn full" disabled={submitting}>{submitting ? t.submitting : (isNgo ? t.submitVerification : isAdmin ? t.createAdminAccess : t.startTrial)} <ArrowRight size={16} /></button>
      </form>
    </div>
  </div>;
}

function RestaurantPage({ page, t, logs, totalKg, addLog, form, setForm, listings, dark, setPage, orgMeta, orgName, lang, onListSurplus, onShowTerms }) { if (page === "log") return <LogPage t={t} addLog={addLog} form={form} setForm={setForm} />; if (page === "market") return <MarketPage t={t} listings={listings} onListSurplus={onListSurplus} />; if (page === "billing") return <BillingPage t={t} onShowTerms={onShowTerms} />; return <Dashboard t={t} logs={logs} totalKg={totalKg} dark={dark} setPage={setPage} orgMeta={orgMeta} orgName={orgName} lang={lang} />; }
function Header({ eyebrow, title, sub, action }) { return <div className="page-header"><div><div className="section-kicker">{eyebrow}</div><h1 data-testid="page-title">{title}</h1><p>{sub}</p></div>{action}</div>; }
function Dashboard({ t, logs, totalKg, dark, setPage, orgMeta, orgName, lang }) {
  const greeting = getGreeting(lang);
  const [range, setRange] = useState("week");
  const location = orgMeta?.city ? `${orgMeta.city}` : "Andheri West";

  const itemTotals = useMemo(() => logs.reduce((acc, l) => ({ ...acc, [l.item]: (acc[l.item] || 0) + Number(l.qty) }), {}), [logs]);
  const topItem = useMemo(() => Object.entries(itemTotals).sort((a, b) => b[1] - a[1])[0] || null, [itemTotals]);

  const weekChartData = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      const dayKey = d.toDateString();
      const waste = logs.filter((l) => l.createdAt && new Date(l.createdAt).toDateString() === dayKey).reduce((a, b) => a + Number(b.qty), 0);
      return { day: d.toLocaleDateString("en-US", { weekday: "short" }), waste: Math.round(waste * 10) / 10 };
    });
  }, [logs]);
  const peakDay = useMemo(() => weekChartData.reduce((max, x) => (x.waste > max.waste ? x : max), weekChartData[0]), [weekChartData]);

  const categoryChartData = useMemo(() => {
    const totals = logs.reduce((acc, l) => { const cat = l.category || "Other"; acc[cat] = (acc[cat] || 0) + Number(l.qty); return acc; }, {});
    const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    const sum = entries.reduce((a, [, v]) => a + v, 0) || 1;
    return entries.map(([name, value], i) => ({ name, value: Math.round((value / sum) * 100), color: categoryColors[i % categoryColors.length] }));
  }, [logs]);

  const avgPerLog = logs.length ? (totalKg / logs.length).toFixed(1) : "0";
  const stat = useMemo(() => [
    { label: t.wasted, value: `${totalKg} kg`, note: `${logs.length} ${logs.length === 1 ? t.entryWord : t.entriesWord} ${t.loggedWord}`, icon: Trash2, tone: "amber" },
    { label: t.impact, value: `₹${(logs.reduce((a, b) => a + b.cost, 0) / 1000).toFixed(1)}k`, note: t.estimatedAtRate, icon: CircleDollarSign, tone: "green" },
    { label: t.top, value: topItem ? topItem[0] : "—", note: topItem ? `${topItem[1]} ${t.loggedSuffix}` : t.logAnEntry, icon: Zap, tone: "teal" },
    { label: t.trend, value: `${avgPerLog} kg`, note: topItem ? `${topItem[0]} ${Math.round((topItem[1] / totalKg) * 100) || 0}% ${t.pctOfTotal}` : "—", icon: TrendingDown, tone: "blue" },
  ], [logs, t, totalKg, topItem, avgPerLog]);

  return <><Header eyebrow={t.dashboardEyebrow} title={orgName ? `${greeting}, ${orgName}` : greeting} sub={t.sub} action={<button data-testid="dashboard-log-button" className="primary-btn" onClick={() => setPage("log")}><Plus size={17} /> {t.add}</button>} /><div className="live-strip"><span className="pulse" /> {t.updated}<span className="strip-location">Kitchen · {location}{orgMeta?.location && <> · <a data-testid="dashboard-location-link" href={orgMeta.location} target="_blank" rel="noreferrer">Map</a></>}</span></div><div className="stat-grid">{stat.map(({ label, value, note, icon: Icon, tone }) => <div className={`stat-card tone-${tone}`} key={label}><div className="stat-top"><span>{label}</span><Icon size={18} /></div><strong data-testid={`kpi-${tone}`}>{value}</strong><small>{note}</small></div>)}</div><div className="chart-grid"><div className="data-panel"><div className="panel-head"><div><h3>{t.wasteByDay}</h3><span>{t.last7Days}</span></div><div className="segmented"><button data-testid="chart-week-toggle" className={range === "week" ? "selected" : ""} onClick={() => setRange("week")}>{t.week}</button><button data-testid="chart-month-toggle" className={range === "month" ? "selected" : ""} onClick={() => setRange("month")}>{t.month}</button></div></div><div className="chart"><ResponsiveContainer width="100%" height={220}><AreaChart data={weekChartData}><defs><linearGradient id="fillWaste" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={dark ? "#55c9ae" : "#127c6d"} stopOpacity={.3} /><stop offset="100%" stopColor={dark ? "#55c9ae" : "#127c6d"} stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke={dark ? "#294039" : "#e7ebe7"} /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: dark ? "#9eb7ae" : "#708078", fontSize: 12 }} /><YAxis hide /><Tooltip contentStyle={{ background: dark ? "#17241f" : "#fff", border: "0", borderRadius: 3 }} /><Area type="monotone" dataKey="waste" stroke={dark ? "#55c9ae" : "#127c6d"} strokeWidth={3} fill="url(#fillWaste)" /></AreaChart></ResponsiveContainer></div><div className="chart-callout">{peakDay && peakDay.waste > 0 ? <><span><TrendingDown size={15} /> {peakDay.day} {t.peakDaySuffix}</span><b>{peakDay.waste} kg</b></> : <span>{t.noEntriesWeek}</span>}</div></div><div className="data-panel"><div className="panel-head"><div><h3>{t.wasteByCategory}</h3><span>{t.whereMargin}</span></div></div>{categoryChartData.length ? <><div className="category-chart"><ResponsiveContainer width="48%" height={170}><BarChart data={categoryChartData} layout="vertical"><XAxis type="number" hide /><YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: dark ? "#c6d6d0" : "#45564e", fontSize: 12 }} /><Bar dataKey="value" radius={[0, 2, 2, 0]}>{categoryChartData.map((x) => <rect key={x.name} fill={x.color} />)}</Bar></BarChart></ResponsiveContainer><div className="category-legend">{categoryChartData.map((x) => <div key={x.name}><span style={{ background: x.color }} /> <b>{x.value}%</b> {x.name}</div>)}</div></div><div className="insight-note"><Sparkles size={15} /> <span data-testid="category-insight">{categoryChartData[0].name} {categoryChartData[0].value}% {t.totalSurplusSuffix}</span></div></> : <EmptyState icon={Sparkles} title={t.noEntriesYet} text={t.logSomeCategory} />}</div></div><div className="bottom-grid"><div className="data-panel table-panel"><div className="panel-head"><div><h3>{t.recent}</h3><span>{logs.length} entries</span></div><button data-testid="view-all-logs-button" className="link-btn" onClick={() => toast.info(`Showing all ${logs.length} entries in the log detail view`)}>{t.viewAll} <ArrowRight size={14} /></button></div><div className="log-table">{logs.slice(0, 4).map((log) => <div className="log-row" key={log.id}><div className="food-icon"><Leaf size={15} /></div><div className="log-name"><b>{log.item}</b><small>{log.reason || "—"}</small></div><strong>{log.qty} kg</strong><span className="log-date">{log.date}</span><span className={log.listed ? "status listed" : "status logged"}>{log.listed ? t.statusListed : t.statusLogged}</span></div>)}</div></div><div className="recommend-panel"><div className="recommend-head"><span className="icon-square"><Sparkles size={17} /></span><span>{t.recommendations}</span></div>{topItem ? <><h3>{t.reducePrepPrefix} {topItem[0]} {t.prepSuffix}</h3><p>{t.soFarPrefix} {topItem[1]} {t.kgLoggedSoFar} {topItem[0]} — {t.biggestSource}</p></> : <><h3>{t.logFewEntries}</h3><p>{t.onceLogged}</p></>}<button data-testid="recommendation-action" className="secondary-btn" onClick={() => toast.success("Production plan review added to your shift list")}>{t.reviewProductionPlan} <ArrowRight size={15} /></button></div></div><ExpiryWatch t={t} logs={logs} /><InventoryWatch t={t} /><RestaurantTools t={t} logs={logs} /><WastePlaybook t={t} logs={logs} /></>;
}

function LogPage({ t, addLog, form, setForm }) { return <><Header eyebrow={t.logEyebrow} title={t.log} sub={t.logSub} /><form className="log-form" onSubmit={addLog}><div className="form-section"><div className="form-section-title"><span>01</span><div><h3>{t.section1Title}</h3><p>{t.section1Sub}</p></div></div><div className="form-grid"><label>{t.foodItemLabel}<input data-testid="food-item-input" value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} placeholder={t.foodItemPh} /></label><label>{t.categoryLabel}<select data-testid="food-category-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{t.categoryOptions.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label><label>{t.quantityLabel}<div className="input-unit"><input data-testid="food-quantity-input" type="number" min="1" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} placeholder="0" /><span>kg</span></div><small>{t.quantityHint}</small></label><label>{t.reasonLabel}<select data-testid="surplus-reason-select" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}>{t.reasonOptions.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label></div></div><div className="form-section expiry-form-section"><div className="form-section-title"><span>02</span><div><h3>{t.section2Title}</h3><p>{t.section2Sub}</p></div><Clock3 size={20} /></div><div className="form-grid"><label>{t.useByLabel}<input data-testid="use-by-date-input" type="date" value={form.useBy} onChange={(e) => setForm({ ...form, useBy: e.target.value })} /></label><label>{t.freshnessLabel}<select data-testid="freshness-status-select" value={form.expiryStatus} onChange={(e) => setForm({ ...form, expiryStatus: e.target.value })}>{t.freshnessOptions.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label></div></div><div className="form-section safety"><div className="form-section-title"><span>03</span><div><h3>{t.section3Title}</h3><p>{t.section3Sub}</p></div><ShieldCheck size={20} /></div><div className="form-grid"><label>{t.storageLabel}<select data-testid="storage-condition-select" value={form.storage} onChange={(e) => setForm({ ...form, storage: e.target.value })}>{t.storageOptions.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label><label>{t.foodTypeLabel}<select data-testid="food-type-select" value={form.foodType} onChange={(e) => setForm({ ...form, foodType: e.target.value })}>{t.foodTypeOptions.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label><label>{t.pickupUntilLabel}<input data-testid="pickup-time-input" type="time" value={form.pickupTime} onChange={(e) => setForm({ ...form, pickupTime: e.target.value })} /></label><label>{t.packagingLabel}<select data-testid="packaging-status-select" value={form.packaging} onChange={(e) => setForm({ ...form, packaging: e.target.value })}>{t.packagingOptions.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label><label>{t.photoLabel}<input data-testid="surplus-photo-input" type="file" accept="image/*" onChange={(e) => setForm({ ...form, photo: e.target.files[0]?.name || "", photoFile: e.target.files[0] || null })} />{form.photo && <small>{t.attachedPrefix} {form.photo}</small>}</label></div></div><div className="form-footer"><span><Clock3 size={15} /> {t.takesMinute}</span><button data-testid="submit-waste-log-button" className="primary-btn" type="submit">{t.saveEntry} <Check size={16} /></button></div></form></>; }
function MarketPage({ t, listings, onListSurplus }) { return <><Header eyebrow={t.marketEyebrow} title={t.marketTitle} sub={t.marketSub} action={<button data-testid="market-list-surplus-button" className="primary-btn" onClick={onListSurplus}><Plus size={17} /> {t.listSurplusBtn}</button>} /><div className="market-summary"><div><PackageOpen size={19} /><b>{listings.length}</b><span>{t.activeListings}</span></div><div><Clock3 size={19} /><b>2h 14m</b><span>{t.avgPickupTime}</span></div><div><Check size={19} /><b>86%</b><span>{t.collectedSuccess}</span></div></div><div className="listing-grid">{listings.map((x) => <div className="listing-card" key={x.id}><div className="listing-top"><span className="status listed">{x.status}</span><span className={`priority ${x.priority.toLowerCase()}`}>{x.priority} {t.priority}</span></div><h3>{x.item}</h3><p>{x.quantity} · {x.dietary}</p><div className="listing-meta"><span><Clock3 size={14} /> {t.pickupByLabel} {x.deadline}</span><span><PackageOpen size={14} /> {x.storage}</span></div><div className="listing-foot"><span>{x.restaurant}</span><button data-testid={`market-listing-${x.id}-button`} className="secondary-btn" onClick={() => toast.info(`${x.item} listing editor opened`)}>{t.editListing} <ChevronRight size={14} /></button></div></div>)}</div></>; }
function BillingPage({ t, onShowTerms }) {
  const [plans, setPlans] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("basic");
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    api.billing.plans().then(setPlans).catch((err) => toast.error(err.message));
    api.billing.me().then(setSubscription).catch((err) => toast.error(err.message));
  }, []);
  const submit = async (e) => {
    e.preventDefault();
    if (!reference) return toast.error("Add a payment reference (UTR/txn note) so it can be verified");
    setSubmitting(true);
    try {
      const updated = await api.billing.submit(selectedPlan, reference);
      setSubscription(updated);
      toast.success("Payment submitted — an admin will verify it shortly");
    } catch (err) {
      toast.error(err.message || "Could not submit payment");
    } finally {
      setSubmitting(false);
    }
  };
  const status = subscription?.status || "inactive";
  return <>
    <Header eyebrow={t.billingEyebrow} title={t.billingTitle} sub={t.billingSub} />
    <div className="billing-hero">
      <div>
        <span className="plan-label">{t.currentStatus}</span>
        <h2 data-testid="billing-status">{status === "active" ? t.statusActive : status === "pending_verification" ? t.statusPending : t.statusInactive}</h2>
        <p>{subscription?.plan ? `${t.planPrefix} ${subscription.plan}` : t.noPlanYet}</p>
      </div>
    </div>
    <div className="billing-plans">
      {(plans?.plans || []).map((p) => <div key={p.id} className={selectedPlan === p.id ? "selected-plan" : ""}>
        <span className="plan-label">{p.name.toUpperCase()}</span>
        <h3>₹{p.price_inr} <small>/ month</small></h3>
        <button data-testid={`select-plan-${p.id}`} className="secondary-btn" onClick={() => setSelectedPlan(p.id)} disabled={selectedPlan === p.id}>{selectedPlan === p.id ? <><Check size={14} /> {t.selected}</> : `${t.choosePrefix} ${p.name}`}</button>
      </div>)}
    </div>
    <p className="terms-subscribe-note">{t.bySubscribingText} <button data-testid="billing-terms-link" className="text-button inline" onClick={onShowTerms}>{t.termsLink}</button></p>
    <div className="tool-card">
      <div className="section-kicker">{t.payByQr}</div>
      <h3>{t.scanToPay}</h3>
      {plans?.qr_code_image_url && <img src={plans.qr_code_image_url} alt="Payment QR code" style={{ maxWidth: 220, borderRadius: 8, margin: "12px 0" }} />}
      {plans?.upi_id && <p>{t.upiIdLabel} <b>{plans.upi_id}</b></p>}
      <form onSubmit={submit} className="log-form">
        <label>{t.paymentRefLabel}<input data-testid="payment-reference-input" value={reference} onChange={(e) => setReference(e.target.value)} placeholder={t.paymentRefPh} /></label>
        <button data-testid="submit-payment-button" className="primary-btn" type="submit" disabled={submitting}>{submitting ? t.submitting : t.submitPayment}</button>
      </form>
    </div>
  </>;
}
function NgoPage({ t, page, listings, claims, claim, confirmPickup, verified, orgName }) { if (page === "claims") return <><Header eyebrow={t.ngoClaimsEyebrow} title={t.ngoClaimsTitle} sub={t.ngoClaimsSub} /><div className="claims-count"><b>{claims.length}</b><span>{t.activeClaims}</span></div>{claims.length ? <div className="listing-grid">{claims.map((x) => <div className="listing-card" key={x.id}><span className={`status ${x.status === "picked_up" ? "verified" : "claimed"}`}>{x.status === "picked_up" ? t.pickedUp : t.claimed}</span><h3>{x.item}</h3><p>{x.quantity} · {x.restaurant}</p>{x.status !== "picked_up" && <button data-testid={`confirm-pickup-${x.id}-button`} className="claim-ready pickup-confirm" onClick={() => confirmPickup(x.claimId)}><Check size={16} /> {t.confirmPickupBtn}</button>}</div>)}</div> : <EmptyState icon={PackageOpen} title={t.noClaimsYet} text={t.claimWhenReady} />}</>; if (page === "map") return <NgoMapPage t={t} listings={listings} />; if (page === "verification") return <><Header eyebrow={t.ngoVerifyEyebrow} title={t.verificationStatus} sub={t.ngoVerifySub} /><div className="verify-card"><div className="verified-icon"><ShieldCheck /></div><h2>{verified ? t.verifiedPartner : t.pendingVerification}</h2><p>{verified ? `${orgName || t.yourOrg} ${t.verifiedText}` : t.pendingVerifyText}</p><span className={`status ${verified ? "verified" : "pending"}`}><Check size={14} /> {verified ? t.active : t.awaitingApproval}</span></div></>; return <><Header eyebrow={t.ngoFeedEyebrow} title={t.rescueOppsTitle} sub={t.rescueOppsSub} action={<div className="claim-badge"><b>{claims.length}</b> {t.myClaimsBadge}</div>} /><div className="filter-row"><button data-testid="ngo-filter-all" className="filter active">{t.filterAll} <span>{listings.length}</span></button><button data-testid="ngo-filter-high" className="filter">{t.filterHigh}</button><button data-testid="ngo-filter-veg" className="filter">{t.filterVeg}</button><button data-testid="ngo-filter-cold" className="filter">{t.filterCold}</button></div>{listings.length ? <div className="listing-grid">{listings.map((x) => <div className="listing-card rescue" key={x.id}><div className="listing-top"><span className={`priority ${x.priority.toLowerCase()}`}>{x.priority} {t.priority}</span></div><div className="rescue-title"><div className="food-icon large"><Leaf size={19} /></div><div><h3>{x.item}</h3><p>{x.quantity}</p></div></div><div className="listing-meta"><span><Clock3 size={14} /> {t.pickupByLabel} {x.deadline}</span></div><div className="listing-foot"><span>{x.restaurant}</span><button data-testid={`claim-food-${x.id}-button`} className="primary-btn" onClick={() => claim(x)}>{t.claim} <ArrowRight size={15} /></button></div></div>)}</div> : <EmptyState icon={PackageOpen} title={t.noLiveListings} text={t.newOppsAppearHere} />}</>; }
function AdminPage({ t, page }) {
  const [queue, setQueue] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [rescues, setRescues] = useState([]);
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadQueue = () => api.admin.verificationQueue().then(setQueue).catch((err) => toast.error(err.message));
  const loadSubscribers = () => api.admin.subscribers().then(setSubscribers).catch((err) => toast.error(err.message));
  const loadRescues = () => api.admin.rescues().then(setRescues).catch((err) => toast.error(err.message));
  const loadPayments = () => api.billing.pending().then(setPayments).catch((err) => toast.error(err.message));

  useEffect(() => {
    setLoading(true);
    Promise.all([loadQueue(), loadSubscribers(), loadRescues(), loadPayments()]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const approve = async (row) => { try { await api.admin.decideVerification(row.id, true); toast.success(`${row.org_name} approved`); loadQueue(); } catch (err) { toast.error(err.message || "Could not approve"); } };
  const reject = async (row) => { try { await api.admin.decideVerification(row.id, false); toast.success(`${row.org_name} rejected`); loadQueue(); } catch (err) { toast.error(err.message || "Could not reject"); } };
  const decidePayment = async (row, approveIt) => { try { await api.billing.decide(row.id, approveIt); toast.success(approveIt ? "Payment approved" : "Payment rejected"); loadPayments(); } catch (err) { toast.error(err.message || "Could not update payment"); } };

  if (page === "queue") return <><Header eyebrow={t.adminQueueEyebrow} title={t.verifyQueueTitle} sub={t.verifyQueueSub} action={<span className="claim-badge"><b>{queue.length}</b> {t.pending}</span>} /><div className="queue-list">{queue.map((x, i) => <div className="queue-row" key={x.id}><div className="avatar soft">{(x.org_name || "??").slice(0, 2)}</div><div><b>{x.org_name} · NGO</b><small>{x.city || "—"}</small></div><span className="status pending">{t.pending}</span><div className="queue-actions"><button data-testid={`approve-${i}-button`} className="approve" onClick={() => approve(x)}><Check size={15} /> {t.approve}</button><button data-testid={`reject-${i}-button`} className="reject" onClick={() => reject(x)}><X size={15} /></button></div></div>)}</div>{!loading && queue.length === 0 && <EmptyState icon={Check} title={t.queueClear} text={t.allReviewed} />}</>;

  if (page === "payments") return <><Header eyebrow={t.adminPaymentsEyebrow} title={t.pendingPaymentsTitle} sub={t.pendingPaymentsSub} action={<span className="claim-badge"><b>{payments.length}</b> {t.pending}</span>} /><div className="queue-list">{payments.map((x, i) => <div className="queue-row" key={x.id}><div className="avatar soft">{(x.profiles?.org_name || "??").slice(0, 2)}</div><div><b>{x.profiles?.org_name} · {x.plan}</b><small>{t.refLabel} {x.payment_note}</small></div><span className="status pending">{t.pending}</span><div className="queue-actions"><button data-testid={`approve-payment-${i}-button`} className="approve" onClick={() => decidePayment(x, true)}><Check size={15} /> {t.approve}</button><button data-testid={`reject-payment-${i}-button`} className="reject" onClick={() => decidePayment(x, false)}><X size={15} /></button></div></div>)}</div>{!loading && payments.length === 0 && <EmptyState icon={Check} title={t.noPendingPayments} text={t.paymentsAppearHere} />}</>;

  if (page === "subscribers") return <><Header eyebrow={t.adminSubsEyebrow} title={t.subscribersTitle} sub={t.subscribersSub} action={<div className="search-box"><Search size={16} /><input data-testid="subscriber-search-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchRestaurants} /></div>} /><div className="data-panel admin-table"><div className="admin-table-head"><span>{t.restaurantCol}</span><span>{t.planCol}</span><span>{t.statusCol}</span></div>{subscribers.filter((x) => (x.profiles?.org_name || "").toLowerCase().includes(search.toLowerCase())).map((x) => <div className="admin-table-row" key={x.id}><b>{x.profiles?.org_name}</b><span>{x.plan}</span><span className={`status ${x.status === "active" ? "verified" : ""}`}>{x.status}</span></div>)}</div>{!loading && subscribers.length === 0 && <EmptyState icon={Users} title={t.noSubscribersYet} text={t.restaurantsAppearHere} />}</>;

  if (page === "rescues") return <><Header eyebrow={t.adminRescuesEyebrow} title={t.rescuesTitle} sub={t.rescuesSub} /><div className="data-panel admin-table"><div className="admin-table-head"><span>{t.itemCol}</span><span>{t.quantityCol}</span><span>{t.statusCol}</span></div>{rescues.map((x) => <div className="admin-table-row" key={x.id}><b>{x.marketplace_listings?.food_type}</b><span>{x.marketplace_listings?.quantity_kg} kg</span><span className="status verified">{t.pickedUp}</span></div>)}</div>{!loading && rescues.length === 0 && <EmptyState icon={PackageOpen} title={t.noRescuesYet} text={t.pickupsAppearHere} />}</>;

  return <><Header eyebrow={t.adminOverviewEyebrow} title={t.platformOverview} sub={t.platformPulse} /><div className="stat-grid admin-stats"><div className="stat-card tone-green"><div className="stat-top"><span>{t.pendingVerifications}</span><Trash2 size={18} /></div><strong data-testid="admin-waste-kpi">{queue.length}</strong><small>{t.ngosAwaiting}</small></div><div className="stat-card tone-teal"><div className="stat-top"><span>{t.rescuesFacilitated}</span><PackageOpen size={18} /></div><strong data-testid="admin-rescue-kpi">{rescues.length}</strong><small>{t.completedPickups}</small></div><div className="stat-card tone-blue"><div className="stat-top"><span>{t.activeSubscribers}</span><Users size={18} /></div><strong data-testid="admin-subscriber-kpi">{subscribers.filter((x) => x.status === "active").length}</strong><small>{t.ofTotal} {subscribers.length} {t.total}</small></div><div className="stat-card tone-amber"><div className="stat-top"><span>{t.pendingPayments}</span><CircleDollarSign size={18} /></div><strong data-testid="admin-mrr-kpi">{payments.length}</strong><small>{t.awaitingVerification}</small></div></div></>;
}
function EmptyState({ icon: Icon, title, text }) { return <div className="empty-state"><Icon size={30} /><h3>{title}</h3><p>{text}</p></div>; }
export default App;
