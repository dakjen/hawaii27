'use client';
import { useState, useEffect, useCallback } from 'react';
import { Home, MapPin, Mail, Calendar, Send } from 'lucide-react';
import { ITINERARY, DESTINATIONS, AFFIRMATIONS } from '../lib/data';

const PIN_LENGTH = 4;
const AUTH_KEY = 'benstrip_auth_v1';

const TIMEZONES = {
  'Honolulu, Hawaii': 'Pacific/Honolulu',
  'Tokyo, Japan': 'Asia/Tokyo',
  'Taipei, Taiwan': 'Asia/Taipei',
  'Osaka, Japan': 'Asia/Tokyo',
};

function formatDate(d) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month:'short', day:'numeric' });
}
function getDaysUntil(dateStr) {
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(dateStr + 'T00:00:00'); target.setHours(0,0,0,0);
  return Math.round((target - today) / 86400000);
}
function getCountdown(days) {
  if (days < 0) return 'Past';
  if (days === 0) return 'TODAY';
  if (days === 1) return 'TOMORROW';
  return `${days} days`;
}
function getCurrentLocation() {
  const today = new Date(); today.setHours(0,0,0,0);
  for (const item of ITINERARY) {
    if (item.type === 'hotel') {
      const s = new Date(item.date+'T00:00:00'); s.setHours(0,0,0,0);
      const e = new Date(item.endDate+'T00:00:00'); e.setHours(0,0,0,0);
      if (today >= s && today < e) return item.location;
    }
  }
  return null;
}
function getNextItem() {
  const today = new Date(); today.setHours(0,0,0,0);
  for (const item of ITINERARY) {
    const d = new Date(item.date+'T00:00:00'); d.setHours(0,0,0,0);
    if (d >= today) return item;
  }
  return null;
}
function getDailyAffirmation() {
  const day = new Date().getDate() + new Date().getMonth() * 31;
  return AFFIRMATIONS[day % AFFIRMATIONS.length];
}
function getImminentFlight() {
  const now = Date.now();
  for (const item of ITINERARY) {
    if (item.type !== 'flight' || !item.departureUtc) continue;
    const dep = new Date(item.departureUtc).getTime();
    const minsUntil = (dep - now) / 60_000;
    if (minsUntil > -30 && minsUntil <= 120) return { item, minsUntil: Math.round(minsUntil) };
  }
  return null;
}
// NRT departure: May 22, 2026
function getNrtAlert() {
  const nrtFlight = ITINERARY.find(i => i.type === 'flight' && i.title.includes('Narita'));
  if (!nrtFlight) return null;
  const days = getDaysUntil(nrtFlight.date);
  if (days < 0 || days > 3) return null;
  return { days, item: nrtFlight };
}

function FujiArt({ size = 100 }) {
  return <img src="/fuji.svg" alt="Mount Fuji" width={size} height={Math.round(size*0.8)} style={{ display:'block' }}/>;
}

// ── Live clock for Ben's current city ─────────────────────────────────────────
function BenClock({ location, label = "Local time" }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  const tz = location ? TIMEZONES[location] : null;
  const cityShort = location ? location.split(',')[0] : 'In transit';
  if (!tz) return (
    <div className="ben-clock">
      <div className="ben-clock-label">{label}</div>
      <div className="ben-clock-time">{cityShort} ✈️</div>
    </div>
  );
  const time = now.toLocaleTimeString('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' });
  const date = now.toLocaleDateString('en-US', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric' });
  return (
    <div className="ben-clock">
      <div className="ben-clock-label">{label} · {cityShort}</div>
      <div className="ben-clock-time">{time}</div>
      <div className="ben-clock-date">{date}</div>
    </div>
  );
}

// ── PIN Screen ────────────────────────────────────────────────────────────────
function PinScreen({ onSuccess }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const affirmation = getDailyAffirmation();

  const verify = useCallback(async (p) => {
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: p }),
      });
      if (res.ok) {
        const data = await res.json();
        onSuccess(data.mode);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) setError('Wrong PIN — try again.');
      else if (res.status === 429) setError('Slow down — try again.');
      else setError(data?.error ? `${res.status}: ${data.error}` : `Error ${res.status}`);
      setPin('');
    } catch (_) {
      setError('Network error.'); setPin('');
    } finally { setBusy(false); }
  }, [onSuccess]);

  const handleDigit = useCallback((d) => {
    if (pin.length >= PIN_LENGTH || busy) return;
    const next = pin + d; setPin(next); setError('');
    if (next.length === PIN_LENGTH) setTimeout(() => verify(next), 150);
  }, [pin, verify, busy]);

  const digits = ['1','2','3','4','5','6','7','8','9','','0','del'];

  return (
    <div className="pin-screen">
      <FujiArt size={140} />
      <div className="pin-title">HAWAII 27</div>
      <div className="pin-sub">Summer 2027</div>
      <div className="pin-affirmation">"{affirmation}"</div>

      <div className="pin-dots">
        {[0,1,2,3].map(i => (
          <div key={i} className={`pin-dot ${pin.length > i ? 'filled':''}`} />
        ))}
      </div>

      <div className="pin-pad">
        {digits.map((d,i) => (
          d==='' ? <div key={i} className="pin-btn empty"/> :
          d==='del' ? <button key={i} className="pin-btn del" onClick={()=>setPin(p=>p.slice(0,-1))}>⌫</button> :
          <button key={i} className="pin-btn" onClick={()=>handleDigit(d)}>{d}</button>
        ))}
      </div>
      {error && <div className="pin-error">{error}</div>}
    </div>
  );
}

// ── Push Notification Toggle ──────────────────────────────────────────────────
function urlBase64ToUint8Array(base64String) {
  // Strip everything that isn't base64url alphabet (handles whitespace, BOM,
  // zero-width chars, accidental quotes, etc).
  const cleaned = (base64String || '').replace(/[^A-Za-z0-9_-]/g, '');
  if (!cleaned) throw new Error('VAPID key missing or empty after cleanup');
  const padding = '='.repeat((4 - cleaned.length % 4) % 4);
  const base64 = (cleaned + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}

function NotificationToggle() {
  const [state, setState] = useState('checking');
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent || '') ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isStandalone = window.matchMedia?.('(display-mode: standalone)')?.matches ||
      window.navigator.standalone === true;
    if (isIos && !isStandalone) { setState('ios-needs-install'); return; }
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !vapidKey) {
      setState('unsupported'); return;
    }
    if (Notification.permission === 'denied') { setState('denied'); return; }
    navigator.serviceWorker.register('/sw.js').then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setState(sub ? 'granted' : 'prompt');
    }).catch(() => setState('unsupported'));
  }, [vapidKey]);

  const [errMsg, setErrMsg] = useState('');
  const enable = async () => {
    setState('working'); setErrMsg('');
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { setState(perm === 'denied' ? 'denied' : 'prompt'); return; }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ? `${res.status}: ${data.error}` : `Subscribe failed (${res.status})`);
      }
      setState('granted');
    } catch (e) {
      const k = (vapidKey || '');
      const keyInfo = `key len=${k.length} starts=${k.slice(0,4)} ends=${k.slice(-4)}`;
      setErrMsg(`${e?.message || 'Subscribe failed'} (${keyInfo})`);
      setState('prompt');
    }
  };

  if (state === 'checking') return null;
  if (state === 'ios-needs-install') return (
    <div className="notif-row notif-off" style={{lineHeight:1.4}}>
      📱 To get note alerts on iPhone: tap Share → Add to Home Screen, then open from your home screen.
    </div>
  );
  if (state === 'unsupported') return null;
  if (state === 'granted') return <div className="notif-row notif-on">🔔 Note alerts are on</div>;
  if (state === 'denied') return <div className="notif-row notif-off">🔕 Notifications blocked — enable in browser settings</div>;
  return (
    <>
      <button className="notif-cta" onClick={enable} disabled={state === 'working'}>
        {state === 'working' ? 'Setting up…' : '🔔 Turn on note alerts'}
      </button>
      {errMsg && <div className="notif-row notif-off" style={{fontSize:'0.65rem'}}>{errMsg}</div>}
    </>
  );
}

// ── NRT Alert Banner ─────────────────────────────────────────────────────────
function NrtAlert({ alert }) {
  if (!alert) return null;
  const when = alert.days === 0 ? 'TODAY' : alert.days === 1 ? 'TOMORROW' : `in ${alert.days} days`;
  return (
    <div className="nrt-alert">
      <div className="nrt-alert-title">⚠️ NARITA — not Haneda</div>
      <div className="nrt-alert-body">
        Your Tokyo → Taipei flight {when} departs from <b>NRT (Narita)</b>, not HND.
        Allow extra time — Narita is ~60–90 min from central Tokyo.
      </div>
    </div>
  );
}

// ── Itinerary Card ────────────────────────────────────────────────────────────
function ItinCard({ item }) {
  const [open, setOpen] = useState(false);
  const days = getDaysUntil(item.date);
  const isPast = days < 0 && (!item.endDate || getDaysUntil(item.endDate) < 0);
  const isActive = item.endDate ? (days <= 0 && getDaysUntil(item.endDate) > 0) : days === 0;
  const isNrt = item.type === 'flight' && item.title.includes('Narita');

  const handleLink = () => {
    if (!item.link) return;
    const {url, fallback} = item.link;
    if (url.startsWith('http')) { window.open(url,'_blank'); return; }
    window.location.href = url;
    if (fallback) setTimeout(()=>window.open(fallback,'_blank'), 1500);
  };

  return (
    <div className={`itin-card ${open?'active':''} ${isPast?'past':''} ${isActive?'current':''} ${isNrt?'nrt':''}`} onClick={()=>setOpen(o=>!o)}>
      <div className="itin-card-top">
        <div className={`itin-icon ${item.type}`}>{item.type==='flight'?'✈️':'🏨'}</div>
        <div className="itin-info">
          <div className="itin-title">{item.title}</div>
          <div className="itin-sub">{item.subtitle}</div>
          {isNrt && <div className="itin-nrt-tag">⚠️ NARITA airport</div>}
        </div>
        <div>
          <div className="itin-date">{formatDate(item.date)}</div>
          {!isPast && <div className={`itin-countdown ${isActive?'active-label':''}`}>{isActive?'● NOW':getCountdown(days)}</div>}
        </div>
      </div>
      {open && (
        <div className="itin-detail" onClick={e=>e.stopPropagation()}>
          <div className="itin-detail-text">{item.detail}</div>
          {item.conf && <div className="itin-conf">Conf: <span>{item.conf}</span></div>}
          {item.tip && <div className="itin-tip">💡 {item.tip}</div>}
          {item.link && <button className="itin-link" onClick={handleLink}>{item.type==='flight'?'✈️':'🏨'} {item.link.label}</button>}
        </div>
      )}
    </div>
  );
}

function EatCard({ eat }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`eat-card ${open?'open':''}`} onClick={()=>setOpen(o=>!o)}>
      <div className="eat-top">
        <div>
          <div className="eat-name">{eat.name}</div>
          <div className="eat-price">{eat.price}</div>
        </div>
        <div className="eat-chevron">{open?'▲':'▼'}</div>
      </div>
      {open && (
        <div className="eat-detail" onClick={e=>e.stopPropagation()}>
          <div className="eat-vibe">{eat.vibe}</div>
          <div className="eat-order">Order: <span>{eat.order}</span></div>
          <a className="eat-map-btn" href={eat.maps} target="_blank" rel="noopener noreferrer">🗺️ Get Directions in Apple Maps</a>
        </div>
      )}
    </div>
  );
}

function DestBlock({ loc, data, isCurrent }) {
  return (
    <div>
      <div className="section-title">{isCurrent ? `📍 You're in ${loc}` : `📌 ${loc}`}</div>
      <div className="dest-card">
        <div className="dest-header">
          <div className="dest-emoji">{data.emoji}</div>
          <div className="dest-name">{loc}</div>
          <div className="dest-tagline">{data.tagline}</div>
        </div>
        <div className="dest-facts">
          <div className="dest-facts-label">Did you know</div>
          {data.facts.map((f,i)=><div key={i} className="dest-fact">{f}</div>)}
        </div>
        <div className="dest-tips">
          <div className="dest-tips-label">Things to do</div>
          {data.tips.map((t,i)=>(
            <div key={i} className="dest-tip-item">
              <span className="dest-tip-icon">{t.icon}</span><span>{t.text}</span>
            </div>
          ))}
        </div>
        <div className="dest-eats">
          <div className="dest-tips-label">🍜 Where to eat</div>
          {data.eats.map((e,i)=><EatCard key={i} eat={e}/>)}
        </div>
      </div>
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
function HomeTab({ currentLocation, nextItem, affirmation, recentNotes }) {
  const here = currentLocation && DESTINATIONS[currentLocation];
  const topEat = here?.eats?.[0];
  const topTip = here?.tips?.[0];
  const nrt = getNrtAlert();
  return (
    <>
      <div style={{padding:'0.8rem 1.2rem 0'}}>
        <NotificationToggle />
      </div>

      <NrtAlert alert={nrt} />

      {nextItem && (
        <div className="next-up">
          <div className="next-up-label">Next Up</div>
          <div className="next-up-title">{nextItem.title}</div>
          <div className="next-up-detail">{nextItem.subtitle}</div>
          <div className="next-up-countdown">{getCountdown(getDaysUntil(nextItem.date))}</div>
        </div>
      )}

      <div className="affirmation-card">
        <div className="affirmation-label">Today's vibe</div>
        <div className="affirmation-text">"{affirmation}"</div>
      </div>

      {here && (
        <>
          <div className="section-title">⭐ Today in {currentLocation.split(',')[0]}</div>
          <div className="rec-card">
            {topTip && (
              <div className="rec-tip">
                <span className="rec-tip-icon">{topTip.icon}</span>
                <span>{topTip.text}</span>
              </div>
            )}
            {topEat && (
              <div className="rec-eat">
                <div className="rec-eat-label">🍜 Try tonight</div>
                <div className="rec-eat-name">{topEat.name}</div>
                <div className="rec-eat-vibe">{topEat.vibe.split('.')[0]}.</div>
                <a className="eat-map-btn" href={topEat.maps} target="_blank" rel="noopener noreferrer">🗺️ Open in Maps</a>
              </div>
            )}
          </div>
        </>
      )}

      {recentNotes.length > 0 && (
        <>
          <div className="section-title">📬 Latest from D</div>
          <div className="notes-list">
            {recentNotes.slice(0, 2).map(n => (
              <div key={n.id} className="note-item">
                <div className="note-from">From Dakotah ✨</div>
                <div className="note-msg">{n.message}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

// ── Shopping List ─────────────────────────────────────────────────────────────
const SHOPPING_CITIES = ['Anywhere', 'Tokyo', 'Osaka', 'Taipei'];

function ShoppingList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [city, setCity] = useState('Anywhere');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch('/api/shopping')
      .then(r => r.ok ? r.json() : { items: [] })
      .then(d => setItems(d.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const add = async () => {
    if (!name.trim() || adding) return;
    setAdding(true);
    try {
      const res = await fetch('/api/shopping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), city }),
      });
      if (res.ok) {
        const { item } = await res.json();
        setItems(prev => [item, ...prev]);
        setName('');
      }
    } finally { setAdding(false); }
  };

  const toggle = async (item) => {
    const newDone = !item.done;
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, done: newDone } : i));
    fetch(`/api/shopping/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: newDone }),
    }).catch(() => {});
  };

  const remove = async (item) => {
    setItems(prev => prev.filter(i => i.id !== item.id));
    fetch(`/api/shopping/${item.id}`, { method: 'DELETE' }).catch(() => {});
  };

  // Group by city
  const groups = SHOPPING_CITIES.reduce((acc, c) => { acc[c] = []; return acc; }, {});
  for (const it of items) {
    const k = SHOPPING_CITIES.includes(it.city) ? it.city : 'Anywhere';
    groups[k].push(it);
  }

  return (
    <div className="shop-block">
      <div className="section-title">🛍️ Things to buy</div>

      <div className="shop-add">
        <input
          className="shop-input"
          type="text"
          placeholder="Add an item…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
        />
        <select
          className="shop-select"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          {SHOPPING_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="shop-add-btn" onClick={add} disabled={!name.trim() || adding}>
          +
        </button>
      </div>

      {loading ? (
        <div className="no-notes" style={{padding:'1rem 1.2rem'}}>Loading…</div>
      ) : items.length === 0 ? (
        <div className="no-notes" style={{padding:'1rem 1.2rem'}}>Nothing on the list yet.</div>
      ) : (
        <div className="shop-groups">
          {SHOPPING_CITIES.map(c => groups[c].length === 0 ? null : (
            <div key={c} className="shop-group">
              <div className="shop-group-label">{c === 'Anywhere' ? '🌍 Anywhere' : c === 'Tokyo' ? '🗼 Tokyo' : c === 'Osaka' ? '🏯 Osaka' : '🏙️ Taipei'}</div>
              {groups[c].map(item => (
                <div key={item.id} className={`shop-item ${item.done ? 'done' : ''}`}>
                  <button className="shop-check" onClick={() => toggle(item)} aria-label="toggle">
                    {item.done ? '✓' : ''}
                  </button>
                  <span className="shop-name">{item.name}</span>
                  <button className="shop-x" onClick={() => remove(item)} aria-label="remove">×</button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NowTab({ currentLocation }) {
  const here = currentLocation && DESTINATIONS[currentLocation];
  if (!here) {
    return (
      <div style={{padding:'2rem 1.2rem'}}>
        <BenClock location={null} label="You're" />
        <div className="no-notes" style={{marginTop:'1rem'}}>
          ✈️ You're between cities right now. Check Itinerary for what's next.
        </div>
        <ShoppingList />
      </div>
    );
  }
  return (
    <>
      <div style={{padding:'0.6rem 1.2rem 0'}}>
        <BenClock location={currentLocation} label="Local time" />
      </div>
      <DestBlock loc={currentLocation} data={here} isCurrent={true}/>
      <ShoppingList />
    </>
  );
}

function NotesTab({ notes }) {
  if (notes.length === 0) {
    return <div className="no-notes" style={{marginTop:'2rem'}}>No notes yet — check back soon!</div>;
  }
  // Group by date
  const groups = {};
  for (const n of notes) {
    const day = new Date(n.created_at).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });
    (groups[day] = groups[day] || []).push(n);
  }
  return (
    <>
      {Object.entries(groups).map(([day, dayNotes]) => (
        <div key={day}>
          <div className="section-title">{day}</div>
          <div className="notes-list">
            {dayNotes.map(n => (
              <div key={n.id} className="note-item">
                <div className="note-from">From Dakotah ✨</div>
                <div className="note-msg">{n.message}</div>
                <div className="note-time">{new Date(n.created_at).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

function ItineraryTab() {
  return (
    <>
      <div className="section-title">🗓 Full Itinerary</div>
      <div className="itinerary-list">
        {ITINERARY.map(item => <ItinCard key={item.id} item={item}/>)}
      </div>
    </>
  );
}

function BottomNav({ tab, setTab, tabs }) {
  return (
    <nav className="bottom-nav">
      {tabs.map(t => {
        const Icon = t.Icon;
        return (
          <button key={t.id} className={`bottom-nav-btn ${tab===t.id?'active':''}`} onClick={()=>setTab(t.id)}>
            <span className="bottom-nav-icon"><Icon strokeWidth={2} /></span>
            <span className="bottom-nav-label">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

const BEN_TABS = [
  { id: 'home', Icon: Home, label: 'Home' },
  { id: 'now', Icon: MapPin, label: 'Now' },
  { id: 'notes', Icon: Mail, label: 'Notes' },
  { id: 'itinerary', Icon: Calendar, label: 'Trip' },
];

// ── Ben App ───────────────────────────────────────────────────────────────────
function TripApp({ onSignOut }) {
  const [tab, setTab] = useState('home');
  const [notes, setNotes] = useState([]);
  const currentLocation = getCurrentLocation();
  const nextItem = getNextItem();
  const affirmation = getDailyAffirmation();

  useEffect(() => {
    fetch('/api/notes').then(r=>r.json()).then(d => setNotes(d.notes || [])).catch(()=>{});
  }, []);

  // Mark notes read when Notes tab is opened
  useEffect(() => {
    if (tab === 'notes' && notes.some(n => !n.read)) {
      fetch('/api/notes', { method: 'POST' }).catch(()=>{});
    }
  }, [tab, notes]);

  return (
    <div className="app with-bottom-nav">
      <div className="header">
        <div className="header-left" style={{display:'flex',alignItems:'center',gap:'0.6rem'}}>
          <img src="/fuji.svg" alt="Fuji" width={36} height={29} style={{opacity:0.9}}/>
          <div><h1>HAWAII 27</h1><p>Summer 2027</p></div>
        </div>
        <button className="header-signout" onClick={onSignOut}>Sign out</button>
      </div>

      <div className="tab-content">
        {tab === 'home' && <HomeTab currentLocation={currentLocation} nextItem={nextItem} affirmation={affirmation} recentNotes={notes} />}
        {tab === 'now' && <NowTab currentLocation={currentLocation} />}
        {tab === 'notes' && <NotesTab notes={notes} />}
        {tab === 'itinerary' && <ItineraryTab />}
      </div>

      <BottomNav tab={tab} setTab={setTab} tabs={BEN_TABS} />
    </div>
  );
}

// ── Sender Password Gate ──────────────────────────────────────────────────────
const SENDER_PWD_KEY = 'benstrip_sender_pwd_v1';

function PasswordGate({ onSuccess }) {
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e?.preventDefault?.();
    if (!pwd || busy) return;
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      });
      if (res.ok) { onSuccess(pwd); return; }
      setError(res.status === 401 ? 'Wrong password — try again.' : `Error ${res.status}`);
      setPwd('');
    } catch (_) {
      setError('Network error — try again.');
    } finally { setBusy(false); }
  };

  return (
    <div className="pin-screen">
      <FujiArt size={120} />
      <div className="pin-title">SEND A NOTE</div>
      <div className="pin-sub">Enter password</div>
      <form onSubmit={submit} className="pwd-form">
        <input
          className="pwd-input"
          type="password"
          autoFocus
          autoComplete="current-password"
          placeholder="Password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
        />
        <button className="pwd-submit" type="submit" disabled={!pwd || busy}>
          {busy ? 'Checking…' : 'Unlock →'}
        </button>
      </form>
      {error && <div className="pin-error">{error}</div>}
    </div>
  );
}

// ── Send form (separate component so re-renders don't steal input focus) ─────
function SendForm({ password }) {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const send = async () => {
    if (!message.trim()) return;
    setStatus('sending'); setErrorMsg('');
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { setStatus('sent'); setMessage(''); return; }
      setStatus('error');
      setErrorMsg(
        res.status === 401 ? 'Password rejected — sign out and back in.' :
        res.status === 429 ? 'Slow down — try again in a sec.' :
        data?.error || `Error ${res.status}`
      );
    } catch (_) {
      setStatus('error'); setErrorMsg('Network error — check connection.');
    }
  };

  if (status === 'sent') {
    return (
      <div className="sender-success">✅ Note sent to Ben!<br/><br/>
        <button className="sender-submit" style={{width:'100%'}} onClick={()=>setStatus('idle')}>Send Another</button>
      </div>
    );
  }
  return (
    <div className="sender-form">
      <textarea
        className="sender-input sender-textarea"
        placeholder="Write Ben a note..."
        value={message}
        onChange={(e)=>setMessage(e.target.value)}
      />
      {status==='error' && <div style={{color:'#ff6b6b',fontSize:'0.8rem'}}>{errorMsg || 'Send failed.'}</div>}
      <button className="sender-submit" onClick={send} disabled={status==='sending'||!message.trim()}>
        {status==='sending'?'Sending...':'Send Note ✈️'}
      </button>
    </div>
  );
}

// ── Wish-well button (Sender, shown within 2hr of any takeoff) ───────────────
function WishWellButton({ password }) {
  const [imminent, setImminent] = useState(() => getImminentFlight());
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    const id = setInterval(() => setImminent(getImminentFlight()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!imminent) return null;

  const send = async () => {
    setStatus('sending');
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Dakotah wishes you well! Have a safe flight 😘', password }),
      });
      setStatus(res.ok ? 'sent' : 'error');
    } catch (_) { setStatus('error'); }
  };

  const flightLine = imminent.item.title;
  const when = imminent.minsUntil <= 0
    ? 'taking off now'
    : imminent.minsUntil < 60
      ? `takes off in ~${imminent.minsUntil} min`
      : `takes off in ~${Math.round(imminent.minsUntil/60*10)/10} hr`;

  return (
    <div className="wish-well">
      <div className="wish-well-label">✈️ {flightLine}</div>
      <div className="wish-well-when">{when}</div>
      {status === 'sent' ? (
        <div className="wish-well-sent">💕 Wishes sent!</div>
      ) : (
        <button className="wish-well-btn" onClick={send} disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : status === 'error' ? 'Try again' : '💕 Wish him well 😘'}
        </button>
      )}
    </div>
  );
}

// ── Sender Home tab content (top-level so input keeps focus) ─────────────────
function SenderHomeTab({ currentLocation, nextItem, password }) {
  return (
    <>
      <div style={{padding:'0.6rem 1.2rem 0'}}>
        <BenClock location={currentLocation} label="Local time" />
      </div>
      {nextItem && (
        <div className="next-up">
          <div className="next-up-label">Next Up</div>
          <div className="next-up-title">{nextItem.title}</div>
          <div className="next-up-detail">{nextItem.subtitle}</div>
          <div className="next-up-countdown">{getCountdown(getDaysUntil(nextItem.date))}</div>
        </div>
      )}
      <div className="section-title">💌 Write him a note</div>
      <div style={{padding:'0 1.2rem'}}>
        <SendForm password={password} />
      </div>
    </>
  );
}

const SENDER_TABS = [
  { id: 'home', Icon: Send, label: 'Send' },
  { id: 'now', Icon: MapPin, label: 'Now' },
  { id: 'itinerary', Icon: Calendar, label: 'Trip' },
];

// ── Sender Page ─────────────────────────────────────────────────────
function SenderPage({ onSignOut }) {
  const [password, setPassword] = useState(null);
  const [tab, setTab] = useState('home');
  const currentLocation = getCurrentLocation();
  const nextItem = getNextItem();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SENDER_PWD_KEY);
      if (saved) setPassword(saved);
    } catch (_) {}
  }, []);

  const handleVerified = (pwd) => {
    setPassword(pwd);
    try { localStorage.setItem(SENDER_PWD_KEY, pwd); } catch (_) {}
  };

  const signOut = () => {
    try { localStorage.removeItem(SENDER_PWD_KEY); } catch (_) {}
    setPassword(null);
    onSignOut();
  };

  if (!password) return <PasswordGate onSuccess={handleVerified} />;

  return (
    <div className="app with-bottom-nav">
      <div className="header">
        <div className="header-left" style={{display:'flex',alignItems:'center',gap:'0.6rem'}}>
          <img src="/fuji.svg" alt="Fuji" width={36} height={29} style={{opacity:0.9}}/>
          <div><h1>SEND A NOTE</h1><p>Summer 2027</p></div>
        </div>
        <button className="header-signout" onClick={signOut}>Sign out</button>
      </div>

      <div className="tab-content">
        {tab === 'home' && <SenderHomeTab currentLocation={currentLocation} nextItem={nextItem} password={password} />}
        {tab === 'now' && (
          <>
            <div style={{padding:'0.6rem 1.2rem 0'}}>
              <WishWellButton password={password} />
            </div>
            <NowTab currentLocation={currentLocation} />
          </>
        )}
        {tab === 'itinerary' && <ItineraryTab />}
      </div>

      <BottomNav tab={tab} setTab={setTab} tabs={SENDER_TABS} />
    </div>
  );
}

// ── Root with cookie-backed auth ─────────────────────────────────────────────
export default function Page() {
  const [hydrated, setHydrated] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [mode, setMode] = useState('traveler');

  useEffect(() => {
    // Clean up any stale auth state from older client builds
    try {
      localStorage.removeItem('benstrip_auth_v1');
      sessionStorage.removeItem('benstrip_auth_v1');
    } catch (_) {}
    fetch('/api/auth/me')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data?.authed && data.mode) { setMode(data.mode); setAuthed(true); }
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  const handleAuth = (m) => { setMode(m); setAuthed(true); };

  const signOut = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch (_) {}
    setAuthed(false);
  };

  if (!hydrated) return null;
  if (!authed) return <PinScreen onSuccess={handleAuth}/>;
  if (mode === 'sender') return <SenderPage onSignOut={signOut}/>;
  return <TripApp onSignOut={signOut}/>;
}
