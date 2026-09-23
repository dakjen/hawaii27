'use client';
import { useState, useEffect, useCallback, Fragment } from 'react';
import {
  Home, MapPin, Mail, Calendar, Send, Wallet, Plane, Hotel, Lightbulb, Map,
  UtensilsCrossed, Bell, BellOff, Check, CheckCircle2, TriangleAlert, Sparkles,
  Heart, Users, Plus, Trash2, Clock, Smartphone, Waves, TreePalm, Mountain,
  Leaf, Sunset, Bus, ShoppingBasket, Car, Fish, Star, Coffee, Umbrella, Compass,
} from 'lucide-react';
import {
  ITINERARY, DESTINATIONS, AFFIRMATIONS,
  TRAVELERS, PARTIES, DEFAULT_THEME, itineraryFor,
  AWARDS, BOOKINGS, bookingsFor, bookingsOwnedBy, tripValue, pointsByProgram, awardCount, centsPerPoint, totals, money,
  sourcePoints, centsPerSourcePoint,
  SHARED_BUDGET, sharedFor, shareOf, lineTotal,
  TRIP_DAYS, TOGETHER_DAYS, DAY_GRID, staySegments,
} from '../lib/data';

const LUCIDE = {
  Home, MapPin, Mail, Calendar, Send, Wallet, Plane, Hotel, Lightbulb, Map,
  UtensilsCrossed, Bell, BellOff, Check, CheckCircle2, TriangleAlert, Sparkles,
  Heart, Users, Plus, Trash2, Clock, Smartphone, Waves, TreePalm, Mountain,
  Leaf, Sunset, Bus, ShoppingBasket, Car, Fish, Star, Coffee, Umbrella, Compass,
};

// Icons come from Lucide by name — no emoji anywhere in the UI.
function Icon({ name, size = 16, className }) {
  const C = LUCIDE[name] || Compass;
  return <C size={size} strokeWidth={2} className={className} aria-hidden="true" />;
}

function TitleIcon({ name, children }) {
  return (
    <div className="section-title">
      <Icon name={name} size={13} />
      <span>{children}</span>
    </div>
  );
}

const PIN_LENGTH = 4;
const AUTH_KEY = 'benstrip_auth_v1';

const TIMEZONES = {
  'Maui': 'Pacific/Honolulu',
  'Big Island': 'Pacific/Honolulu',
  'Kauai': 'Pacific/Honolulu',
  'Los Angeles': 'America/Los_Angeles',
  'Las Vegas': 'America/Los_Angeles',
  'New York': 'America/New_York',
  'Baltimore': 'America/New_York',
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
// All of these read one party's itinerary — passing no party means everyone,
// which is what admin sees.
function scopedItinerary(party) {
  return party ? itineraryFor(party) : ITINERARY;
}
function tripNotStarted(party) {
  const items = scopedItinerary(party);
  if (items.length === 0) return true;
  return getDaysUntil(items[0].date) > 0;
}
function getCurrentLocation(party) {
  const today = new Date(); today.setHours(0,0,0,0);
  for (const item of scopedItinerary(party)) {
    if (item.type === 'hotel') {
      const s = new Date(item.date+'T00:00:00'); s.setHours(0,0,0,0);
      const e = new Date(item.endDate+'T00:00:00'); e.setHours(0,0,0,0);
      if (today >= s && today < e) return item.location;
    }
  }
  return null;
}
function getNextItem(party) {
  const today = new Date(); today.setHours(0,0,0,0);
  for (const item of scopedItinerary(party)) {
    const d = new Date(item.date+'T00:00:00'); d.setHours(0,0,0,0);
    if (d >= today) return item;
  }
  return null;
}
function getDailyAffirmation() {
  const day = new Date().getDate() + new Date().getMonth() * 31;
  return AFFIRMATIONS[day % AFFIRMATIONS.length];
}
function getImminentFlight(party) {
  const now = Date.now();
  for (const item of scopedItinerary(party)) {
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

function Palm({ size = 100, className = '' }) {
  return (
    <svg
      viewBox="0 0 100 80"
      width={size}
      height={Math.round(size * 0.8)}
      className={`palm ${className}`}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M 50 30 Q 32 20, 18 24"/>
        <path d="M 50 30 Q 30 32, 14 42"/>
        <path d="M 50 30 Q 34 42, 26 58"/>
        <path d="M 50 30 Q 68 20, 82 24"/>
        <path d="M 50 30 Q 70 32, 86 42"/>
        <path d="M 50 30 Q 66 42, 74 58"/>
        <path d="M 47 30 Q 52 45, 48 62 Q 46 70, 44 72" strokeWidth="2.6"/>
      </g>
      <g fill="currentColor" opacity="0.5">
        <circle cx="26" cy="23" r="0.8"/>
        <circle cx="22" cy="34" r="0.8"/>
        <circle cx="30" cy="48" r="0.8"/>
        <circle cx="74" cy="23" r="0.8"/>
        <circle cx="78" cy="34" r="0.8"/>
        <circle cx="70" cy="48" r="0.8"/>
      </g>
      <circle cx="52" cy="33" r="2.2" fill="currentColor"/>
      <circle cx="47" cy="34" r="2" fill="currentColor"/>
    </svg>
  );
}
const FujiArt = Palm;

// ── Live clock for Ben's current city ─────────────────────────────────────────
function BenClock({ location, label = "Local time", party }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  const tz = location ? TIMEZONES[location] : null;
  const cityShort = location ? location.split(',')[0] : 'In transit';
  if (!tz) {
    const pending = tripNotStarted(party);
    return (
      <div className="ben-clock">
        <div className="ben-clock-label">{pending ? 'Hawaii 2027' : label}</div>
        <div className="ben-clock-time">
          <Icon name={pending ? 'Clock' : 'Plane'} size={16} />
          <span>{pending ? 'Trip pending…' : cityShort}</span>
        </div>
        {pending && scopedItinerary(party).length > 0 && (
          <div className="ben-clock-date">
            {getCountdown(getDaysUntil(scopedItinerary(party)[0].date))} until wheels up
          </div>
        )}
      </div>
    );
  }
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
        onSuccess(data.mode, data.travelerId);
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
      <div className="pin-sub">January 2027</div>
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
      <Icon name="Smartphone" size={13} /> To get note alerts on iPhone: tap Share → Add to Home Screen, then open from your home screen.
    </div>
  );
  if (state === 'unsupported') return null;
  if (state === 'granted') return <div className="notif-row notif-on"><Icon name="Bell" size={13} /> Note alerts are on</div>;
  if (state === 'denied') return <div className="notif-row notif-off"><Icon name="BellOff" size={13} /> Notifications blocked — enable in browser settings</div>;
  return (
    <>
      <button className="notif-cta" onClick={enable} disabled={state === 'working'}>
        {state === 'working' ? 'Setting up…' : <><Icon name="Bell" size={13} /> Turn on note alerts</>}
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
      <div className="nrt-alert-title"><Icon name="TriangleAlert" size={13} /> NARITA — not Haneda</div>
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
  const isNote = item.type === 'note';

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
        <div className={`itin-icon ${item.type}`}><Icon name={item.type==='flight'?'Plane':item.type==='dinner'?'UtensilsCrossed':item.type==='note'?'Users':'Hotel'} size={18} /></div>
        <div className="itin-info">
          <div className="itin-title">{item.title}</div>
          <div className="itin-sub">{item.subtitle}</div>
          {item.booked && (
            <div className="itin-booked"><Icon name="Check" size={10} /> Booked</div>
          )}
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
          {item.tip && <div className="itin-tip"><Icon name="Lightbulb" size={13} /> {item.tip}</div>}
          {item.link && <button className="itin-link" onClick={handleLink}><Icon name={item.type==='flight'?'Plane':item.type==='dinner'?'UtensilsCrossed':'Hotel'} size={14} /> {item.link.label}</button>}
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
          <a className="eat-map-btn" href={eat.maps} target="_blank" rel="noopener noreferrer"><Icon name="Map" size={14} /> Get Directions in Apple Maps</a>
        </div>
      )}
    </div>
  );
}

function DestBlock({ loc, data, isCurrent }) {
  return (
    <div>
      <TitleIcon name="MapPin">{isCurrent ? `You're in ${loc}` : loc}</TitleIcon>
      <div className="dest-card">
        <div className="dest-header">
          <div className="dest-emoji"><Icon name={data.icon} size={26} /></div>
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
          <div className="dest-tips-label"><Icon name="UtensilsCrossed" size={13} /> Where to eat</div>
          {data.eats.map((e,i)=><EatCard key={i} eat={e}/>)}
        </div>
      </div>
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
// Whole-trip scoreboard for the countdown period. Everyone sees the value;
// only the party footing the bill sees what it actually cost.
// Every booked thing on the trip, by party, with what it's worth in cash.
function TripBreakdown({ onClose }) {
  const travel = BOOKINGS.filter(b => b.type !== 'other');
  const t = totals(travel);
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-head">
          <TitleIcon name="Wallet">Whole trip value</TitleIcon>
          <button className="sheet-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="sheet-body">
          {[['flight', 'Flights', 'Plane'], ['hotel', 'Hotels', 'Hotel']].map(([type, label, icon]) => {
            const rows = travel.filter(b => b.type === type);
            if (!rows.length) return null;
            const sub = rows.reduce((n, b) => n + (b.cashValue ?? 0), 0);
            return (
              <div key={type} className="bk-group">
                <div className="bk-party">
                  <span><Icon name={icon} size={12} /> {label}</span>
                  <span>{money(sub)}</span>
                </div>
                {Object.values(PARTIES).map(pt => {
                  const mine = rows.filter(b => b.party === pt.id);
                  if (!mine.length) return null;
                  const psub = mine.reduce((n, b) => n + (b.cashValue ?? 0), 0);
                  return (
                    <div key={pt.id} className="bk-sub-group">
                      <div className="bk-who"><span>{pt.label}</span><span>{money(psub)}</span></div>
                      {mine.map(b => (
                        <div key={b.id} className="bk-row">
                          <div className="bk-what">
                            <div className="bk-title">{b.title}</div>
                            <div className="bk-sub">
                              {formatDate(b.date)}{b.endDate ? ` – ${formatDate(b.endDate)}` : ''}
                              {b.gifted ? ' · gifted' : ''}
                            </div>
                          </div>
                          <div className={`bk-val ${b.cashValue == null ? 'muted' : ''}`}>
                            {b.cashValue == null ? 'not priced' : money(b.cashValue)}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}
          <div className="bk-total">
            <div className="bk-row big"><span>Whole trip value</span><span>{money(t.cashValue)}</span></div>
            <div className="bk-row"><span>Spent in cash so far</span><span>{money(t.cash)}</span></div>
          </div>
          <div className="bk-note">Flights and hotels that are booked. Plans aren't counted until they're confirmed. Rental cars aren't included.</div>
        </div>
      </div>
    </div>
  );
}

function TripSoFar() {
  // Flights and hotels only — the cars are a running cost, not a booking to value.
  // Whole-group figures, so everyone sees them; it isn't anyone's individual bill.
  const [open, setOpen] = useState(false);
  const t = totals(BOOKINGS.filter(b => b.type !== 'other'));
  return (
    <>
      <div className="sofar tappable" onClick={() => setOpen(true)} role="button" tabIndex={0}>
        <div className="sofar-label">The whole trip, all three of you</div>
        <div className="sofar-big">{money(t.cashValue)}</div>
        <div className="sofar-sub">of travel booked, at what it would cost in cash · tap for every booking</div>
        <div className="sofar-spend">
          <div className="sofar-row"><span>Spent in cash so far</span><span>{money(t.cash)}</span></div>
        </div>
      </div>
      {open && <TripBreakdown onClose={() => setOpen(false)} />}
    </>
  );
}

function HomeTab({ currentLocation, nextItem, affirmation, recentNotes, party }) {
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

      {tripNotStarted(party) && <TripSoFar />}

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
          <TitleIcon name="Star">Today in {currentLocation.split(',')[0]}</TitleIcon>
          <div className="rec-card">
            {topTip && (
              <div className="rec-tip">
                <span className="rec-tip-icon">{topTip.icon}</span>
                <span>{topTip.text}</span>
              </div>
            )}
            {topEat && (
              <div className="rec-eat">
                <div className="rec-eat-label"><Icon name="UtensilsCrossed" size={13} /> Try tonight</div>
                <div className="rec-eat-name">{topEat.name}</div>
                <div className="rec-eat-vibe">{topEat.vibe.split('.')[0]}.</div>
                <a className="eat-map-btn" href={topEat.maps} target="_blank" rel="noopener noreferrer"><Icon name="Map" size={14} /> Open in Maps</a>
              </div>
            )}
          </div>
        </>
      )}

      {recentNotes.length > 0 && (
        <>
          <TitleIcon name="Mail">Latest from D</TitleIcon>
          <div className="notes-list">
            {recentNotes.slice(0, 2).map(n => (
              <div key={n.id} className="note-item">
                <div className="note-from"><Icon name="Sparkles" size={11} /> From Dakotah</div>
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
// ── Group plans ──────────────────────────────────────────────────────────────
// Things everyone is doing together. Admin creates them; travelers read them.
function PlanVotes({ plan, me, onVote }) {
  const votes = plan.votes || [];
  const mine = votes.find(v => v.voter === me);
  const yes = votes.filter(v => v.vote);
  const no = votes.filter(v => !v.vote);

  return (
    <div className="vote-box">
      <div className="vote-actions">
        <button
          className={`vote-btn yes ${mine?.vote === true ? 'on' : ''}`}
          onClick={() => onVote(plan, true)}
        >
          <Icon name="Check" size={13} /> Yes
        </button>
        <button
          className={`vote-btn no ${mine?.vote === false ? 'on' : ''}`}
          onClick={() => onVote(plan, false)}
        >
          No
        </button>
        <span className="vote-tally">
          {yes.length} yes · {no.length} no
        </span>
      </div>
      {votes.length > 0 && (
        <div className="vote-who">
          {votes.map(v => (
            <span key={v.voter} className={`vote-chip ${v.vote ? 'yes' : 'no'}`} title={authorLabel(v.voter)}>
              {authorInitials(v.voter)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Tab switches shouldn't wait on the network: keep the last fetch around and
// render it immediately while a fresh one loads behind it.
let plansCache = null;
let messagesCache = null;

function GroupPlans({ isAdmin, me }) {
  const [plans, setPlans] = useState(() => plansCache || []);
  const [loading, setLoading] = useState(() => plansCache === null);
  const [busy, setBusy] = useState(false);
  const ALL = Object.keys(PARTIES);
  const [form, setForm] = useState({
    title: '', day: TOGETHER_DAYS[0] || TRIP_DAYS[0],
    timeLabel: '', location: '', detail: '', link: '', kind: 'confirmed', parties: ALL,
  });
  const toggleParty = (id) => setForm(f => {
    const has = f.parties.includes(id);
    const next = has ? f.parties.filter(x => x !== id) : [...f.parties, id];
    return { ...f, parties: next.length ? next : f.parties }; // never empty
  });

  const load = useCallback(() => {
    fetch('/api/plans')
      .then(r => r.json())
      .then(d => { plansCache = d.plans || []; setPlans(plansCache); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);
  useEffect(() => { plansCache = plans; }, [plans]);

  const add = async () => {
    if (!form.title.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const { plan } = await res.json();
        setPlans(ps => [...ps, plan].sort((a, b) => String(a.day).localeCompare(String(b.day))));
        setForm(f => ({ ...f, title: '', timeLabel: '', location: '', detail: '', link: '', parties: ALL }));
      }
    } catch (_) {} finally { setBusy(false); }
  };

  const remove = async (plan) => {
    setPlans(ps => ps.filter(p => p.id !== plan.id));
    try { await fetch(`/api/plans/${plan.id}`, { method: 'DELETE' }); } catch (_) { load(); }
  };

  const vote = async (plan, value) => {
    // Optimistic — swap in your own vote, reconcile with the server after.
    setPlans(ps => ps.map(p => p.id !== plan.id ? p : {
      ...p,
      votes: [...(p.votes || []).filter(v => v.voter !== me), { voter: me, vote: value }],
    }));
    try {
      const res = await fetch(`/api/plans/${plan.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote: value }),
      });
      if (res.ok) {
        const { votes } = await res.json();
        setPlans(ps => ps.map(p => p.id === plan.id ? { ...p, votes } : p));
      }
    } catch (_) { load(); }
  };

  const byDay = {};
  for (const pl of plans) {
    const key = String(pl.day).slice(0, 10);
    (byDay[key] = byDay[key] || []).push(pl);
  }

  return (
    <div className="plans">
      <TitleIcon name="Users">Group plans</TitleIcon>

      {isAdmin && (
        <div className="plan-form">
          <div className="kind-toggle">
            <button
              className={`kind-btn ${form.kind === 'confirmed' ? 'on' : ''}`}
              onClick={() => setForm(f => ({ ...f, kind: 'confirmed' }))}
            >
              <Icon name="Check" size={12} /> It's happening
            </button>
            <button
              className={`kind-btn ${form.kind === 'vote' ? 'on' : ''}`}
              onClick={() => setForm(f => ({ ...f, kind: 'vote' }))}
            >
              <Icon name="Users" size={12} /> Put it to a vote
            </button>
          </div>
          <div className="who-row">
            <span className="who-label">For</span>
            {ALL.map(id => (
              <button
                key={id}
                className={`who-chip ${form.parties.includes(id) ? 'on' : ''}`}
                onClick={() => toggleParty(id)}
              >
                {PARTIES[id].short}
              </button>
            ))}
          </div>
          <input
            className="plan-input"
            placeholder={form.kind === 'vote' ? 'What should we do?' : form.parties.length === ALL.length ? 'What is everyone doing?' : 'What are they doing?'}
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          />
          <div className="plan-form-row">
            <select
              className="plan-select"
              value={form.day}
              onChange={e => setForm(f => ({ ...f, day: e.target.value }))}
            >
              {TRIP_DAYS.map(d => (
                <option key={d} value={d}>
                  {formatDate(d)}{TOGETHER_DAYS.includes(d) ? ' · everyone' : ''}
                </option>
              ))}
            </select>
            <input
              className="plan-input small"
              placeholder="Time"
              value={form.timeLabel}
              onChange={e => setForm(f => ({ ...f, timeLabel: e.target.value }))}
            />
          </div>
          <input
            className="plan-input"
            placeholder="Where"
            value={form.location}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
          />
          <input
            className="plan-input"
            placeholder={form.kind === 'vote' ? 'Anything they should know' : 'Reservation details, confirmation number…'}
            value={form.detail}
            onChange={e => setForm(f => ({ ...f, detail: e.target.value }))}
          />
          <input
            className="plan-input"
            placeholder="Link (website, menu, map)"
            inputMode="url"
            value={form.link}
            onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
          />
          <button className="plan-add" onClick={add} disabled={!form.title.trim() || busy}>
            <Icon name="Plus" size={14} /> {busy ? 'Adding…' : form.kind === 'vote' ? 'Ask everyone' : 'Add group plan'}
          </button>
        </div>
      )}

      {loading ? (
        <div className="money-empty">Loading…</div>
      ) : plans.length === 0 ? (
        <div className="money-empty">
          {isAdmin ? 'No group plans yet — add the first one.' : 'No group plans yet.'}
        </div>
      ) : (
        <div className="plan-list">
          {Object.entries(byDay).map(([day, dayPlans]) => (
            <div key={day} className="plan-day">
              <div className="plan-day-label">
                {formatDate(day)}
                {TOGETHER_DAYS.includes(day) && <span className="plan-everyone">everyone on Maui</span>}
              </div>
              {dayPlans.map(pl => (
                <div key={pl.id} className={`plan-item ${pl.kind === 'vote' ? 'proposal' : ''}`}>
                  <div className="plan-item-main">
                    <div className="plan-item-title">{pl.title}</div>
                    <div className="plan-item-sub">
                      {[pl.time_label, pl.location].filter(Boolean).join(' · ')}
                      {pl.parties && pl.parties.length > 0 && (
                        <span className="plan-for"> · {pl.parties.map(id => PARTIES[id]?.short || id).join(' + ')}</span>
                      )}
                    </div>
                    {pl.detail && <div className="plan-item-detail">{pl.detail}</div>}
                    {pl.link && (
                      <a className="plan-link" href={pl.link} target="_blank" rel="noopener noreferrer">
                        <Icon name="Map" size={13} /> See this place
                      </a>
                    )}
                    {pl.kind === 'vote' && <PlanVotes plan={pl} me={me} onVote={vote} />}
                  </div>
                  {isAdmin && (
                    <button className="plan-remove" onClick={() => remove(pl)} aria-label="Remove plan">
                      <Icon name="Trash2" size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Trip timeline ────────────────────────────────────────────────────────────
// One lane per party across the same day axis, so you can read who overlaps
// with whom at a glance. Consecutive days in one place collapse into a bar.
function laneSegments(partyId) {
  const segs = [];
  TRIP_DAYS.forEach((day, i) => {
    const cell = DAY_GRID[partyId]?.[day];
    if (!cell) return;
    const prev = segs[segs.length - 1];
    if (prev && prev.end === i - 1 && prev.where === cell.where && !cell.move && !prev.move) {
      prev.end = i;
    } else {
      segs.push({ start: i, end: i, where: cell.where, move: cell.move });
    }
  });
  return segs.map(sg => ({ ...sg, len: sg.end - sg.start + 1 }));
}

function TripTimeline({ only = 'all' }) {
  const today = new Date().toISOString().slice(0, 10);
  const parties = only === 'all' ? Object.values(PARTIES) : [PARTIES[only]].filter(Boolean);
  const cols = `repeat(${TRIP_DAYS.length}, minmax(0, 1fr))`;

  return (
    <div className="tl">
      <div className="tl-row">
        <div className="tl-label" />
        <div className="tl-track axis" style={{ gridTemplateColumns: cols }}>
          {TRIP_DAYS.map((d, i) => (
            <div key={d} className={`tl-tick ${d === today ? 'now' : ''}`} style={{ gridColumn: i + 1 }}>
              {Number(d.slice(8))}
            </div>
          ))}
        </div>
      </div>

      {parties.map(pt => (
        <Fragment key={pt.id}>
          <div className="tl-row">
            <div className="tl-label">{pt.short}</div>
            <div className="tl-track" style={{ gridTemplateColumns: cols }}>
              {TRIP_DAYS.map((d, i) => (
                <div
                  key={d}
                  className={`tl-cell ${TOGETHER_DAYS.includes(d) ? 'together' : ''}`}
                  style={{ gridColumn: i + 1, gridRow: 1 }}
                />
              ))}
              {laneSegments(pt.id).map(sg => (
                <div
                  key={sg.start}
                  className={`tl-seg ${sg.where === 'OGG' ? 'maui' : ''} ${sg.move ? 'move' : ''}`}
                  style={{ gridColumn: `${sg.start + 1} / span ${sg.len}`, gridRow: 1 }}
                  title={sg.move || sg.where}
                >
                  {sg.move && <Icon name="Plane" size={9} />}
                  <span className="tl-seg-label">{sg.where}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="tl-row stays">
            <div className="tl-label sub">stay</div>
            <div className="tl-track" style={{ gridTemplateColumns: cols }}>
              {staySegments(pt.id).map(sg => (
                <div
                  key={sg.id}
                  className={`tl-stay ${sg.booked ? 'booked' : 'plan'}`}
                  style={{ gridColumn: `${sg.start + 1} / span ${sg.len}`, gridRow: 1 }}
                  title={`${sg.label}${sg.booked ? '' : ' — not booked'}`}
                >
                  {sg.label}
                </div>
              ))}
            </div>
          </div>
        </Fragment>
      ))}

      <div className="timeline-key">
        <span><i className="key-dot together" /> Everyone on Maui {formatDate(TOGETHER_DAYS[0])}–{formatDate(TOGETHER_DAYS[TOGETHER_DAYS.length - 1])}</span>
      </div>
    </div>
  );
}

function NowTab({ currentLocation, isAdmin, party }) {
  const here = currentLocation && DESTINATIONS[currentLocation];
  if (!here) {
    return (
      <div style={{padding:'2rem 1.2rem'}}>
        <BenClock location={null} label="You're" party={party} />
        <div className="no-notes" style={{marginTop:'1rem'}}>
          {tripNotStarted(party)
            ? 'You haven\'t left yet. The Trip tab has your full timeline.'
            : "You're between cities right now. Check Itinerary for what's next."}
        </div>
        <GroupPlans isAdmin={isAdmin} me={isAdmin ? 'admin' : party} />
      </div>
    );
  }
  return (
    <>
      <div style={{padding:'0.6rem 1.2rem 0'}}>
        <BenClock location={currentLocation} label="Local time" party={party} />
      </div>
      <DestBlock loc={currentLocation} data={here} isCurrent={true}/>
      <GroupPlans isAdmin={isAdmin} me={isAdmin ? 'admin' : party} />
    </>
  );
}

// Shared thread — everyone signed in can post, and posting notifies the others.
function authorLabel(author) {
  const t = TRAVELERS[author];
  if (t) return PARTIES[t.party]?.label || t.displayName;
  return author === 'admin' ? 'Admin' : author;
}

function authorInitials(author) {
  const t = TRAVELERS[author];
  if (t) return PARTIES[t.party]?.initials || t.displayName[0];
  return author === 'admin' ? 'D' : (author || '?')[0].toUpperCase();
}

function Avatar({ author, title }) {
  return (
    <span className="avatar" title={title || authorLabel(author)} aria-label={authorLabel(author)}>
      {authorInitials(author)}
    </span>
  );
}

function MessagesTab({ me }) {
  const [messages, setMessages] = useState(() => messagesCache || []);
  const [loading, setLoading] = useState(() => messagesCache === null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    fetch('/api/messages')
      .then(r => r.json())
      .then(d => { messagesCache = d.messages || []; setMessages(messagesCache); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { messagesCache = messages; }, [messages]);

  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, [load]);

  const send = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true); setError('');
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      if (res.ok) {
        const { message } = await res.json();
        setMessages(ms => [...ms, message]);
        setDraft('');
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d?.error || `Error ${res.status}`);
      }
    } catch (_) {
      setError('Network error — try again.');
    } finally { setSending(false); }
  };

  const groups = {};
  for (const m of messages) {
    const day = new Date(m.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    (groups[day] = groups[day] || []).push(m);
  }

  return (
    <>
      <TitleIcon name="Mail">Messages</TitleIcon>

      {loading ? (
        <div className="money-empty">Loading…</div>
      ) : messages.length === 0 ? (
        <div className="money-empty">No messages yet — say something.</div>
      ) : (
        Object.entries(groups).map(([day, dayMsgs]) => (
          <div key={day}>
            <div className="msg-day">{day}</div>
            <div className="notes-list">
              {dayMsgs.map(m => (
                <div key={m.id} className={`msg-row ${m.author === me ? 'mine' : ''}`}>
                  <Avatar author={m.author} title={m.author === me ? 'You' : undefined} />
                  <div className="msg">
                    <div className="msg-body">{m.body}</div>
                    <div className="msg-time">
                      {new Date(m.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <div className="msg-compose">
        <textarea
          className="sender-input sender-textarea"
          placeholder="Message everyone…"
          value={draft}
          onChange={e => setDraft(e.target.value)}
        />
        {error && <div className="pin-error" style={{ marginTop: 0 }}>{error}</div>}
        <button className="sender-submit" onClick={send} disabled={sending || !draft.trim()}>
          <Icon name="Send" size={14} /> {sending ? 'Sending…' : 'Send to everyone'}
        </button>
      </div>
    </>
  );
}


function ItineraryTab({ party = null, isAdmin = false }) {
  // Organisers and admin can flip between parties. Everyone else gets the
  // whole-group graphic but only their own list underneath.
  const canSwitch = isAdmin || (party && PARTIES[party]?.seesAll);
  const [sel, setSel] = useState(party || 'all');
  const listParty = canSwitch ? sel : party;
  const items = listParty === 'all' || !listParty ? ITINERARY : itineraryFor(listParty);
  const order = party ? [party, ...Object.keys(PARTIES).filter(id => id !== party)] : Object.keys(PARTIES);

  return (
    <>
      <TitleIcon name="Calendar">Trip timeline</TitleIcon>
      {canSwitch && (
        <div className="party-filter">
          {order.map(id => (
            <button key={id} className={`party-chip ${sel === id ? 'on' : ''}`} onClick={() => setSel(id)}>
              {PARTIES[id].short}{id === party ? <span className="chip-you">you</span> : null}
            </button>
          ))}
          <button className={`party-chip ${sel === 'all' ? 'on' : ''}`} onClick={() => setSel('all')}>
            All
          </button>
        </div>
      )}
      <TripTimeline only={canSwitch ? sel : 'all'} />
      <TitleIcon name="Compass">
        {listParty && listParty !== 'all' ? `${PARTIES[listParty].label} — itinerary` : 'Full itinerary'}
      </TitleIcon>
      <div className="itinerary-list">
        {items.map(item => <ItinCard key={item.id} item={item}/>)}
      </div>
    </>
  );
}

// ── Money ─────────────────────────────────────────────────────────────────────
function fmtPoints(n) { return n.toLocaleString('en-US'); }

function BookingCard({ booking }) {
  const [open, setOpen] = useState(false);
  const awards = awardCount(booking);
  const cpp = centsPerPoint(booking);
  const cppAll = centsPerPoint(booking, true);
  const cppSrc = centsPerSourcePoint(booking);
  const saved = booking.cashValue - booking.cash;

  return (
    <div className={`money-card ${open ? 'open' : ''}`} onClick={() => setOpen(o => !o)}>
      <div className="money-card-top">
        <div className="money-card-info">
          <div className="money-card-title">{booking.title}</div>
          <div className="money-card-sub">
            {booking.guests ? `${booking.guests} · ` : ''}
            {formatDate(booking.date)}{booking.endDate ? ` – ${formatDate(booking.endDate)}` : ''}
          </div>
        </div>
        <div className="money-card-cost">
          {booking.cash > 0 && <div className="money-card-cash">{money(booking.cash)}</div>}
          {booking.points > 0 && (
            <div className={booking.cash > 0 ? 'money-card-points' : 'money-card-cash'}>
              {fmtPoints(booking.points)} pts
            </div>
          )}
          {awards > 0 && <div className="money-card-award">+ {awards} free night</div>}
        </div>
      </div>

      {open && (
        <div className="money-detail" onClick={e => e.stopPropagation()}>
          {booking.room && <div className="money-detail-room">{booking.room}</div>}
          <div className="money-rows">
            {booking.cash > 0 && (
              <div className="money-row"><span>Out of pocket</span><span>{money(booking.cash)}</span></div>
            )}
            {booking.pointsPerNight && (
              <div className="money-row">
                <span>Per night</span>
                <span>{fmtPoints(booking.pointsPerNight)} pts × {booking.nights}</span>
              </div>
            )}
            {booking.points > 0 && (
              <div className="money-row"><span>Points used</span><span>{fmtPoints(booking.points)} {booking.program || 'pts'}</span></div>
            )}
            {sourcePoints(booking) !== null && (
              <div className="money-row">
                <span>Transferred from</span>
                <span>
                  {fmtPoints(sourcePoints(booking))} {booking.transfer.program}
                  {booking.transfer.bonus ? ` · ${Math.round(booking.transfer.bonus * 100)}% bonus` : ''}
                </span>
              </div>
            )}
            {(booking.awards || []).map((a, i) => (
              <div key={i} className="money-row">
                <span>{AWARDS[a.type]?.label || 'Award night'}{(a.count || 1) > 1 ? ` ×${a.count}` : ''}</span>
                <span>worth {fmtPoints((AWARDS[a.type]?.pointsValue || 0) * (a.count || 1))} pts</span>
              </div>
            ))}
            {booking.cashValue != null && (
              <div className="money-row total"><span>Cash rate would've been</span><span>{money(booking.cashValue)}</span></div>
            )}
          </div>

          {booking.cashValue != null ? (
            <div className="money-verdict">
              <div className="money-verdict-big">Saved {money(saved)}</div>
              {cpp !== null && (
                <div className="money-verdict-sub">
                  {cpp.toFixed(1)}¢ per {booking.program || 'point'}
                  {cppAll !== null && awards > 0 && ` · ${cppAll.toFixed(1)}¢ once you price the free night at its full value`}
                  {cppSrc !== null && (
                    <> · <strong>{cppSrc.toFixed(2)}¢ per {booking.transfer.program} point</strong>, which is what you actually spent</>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="money-verdict">
              <div className="money-verdict-sub">
                Add the cash rate for these dates and this'll score the redemption.
              </div>
            </div>
          )}

          {booking.gifted && <div className="money-gift"><Icon name="Sparkles" size={13} /> Gifted — no points or cash of yours went into this</div>}
          {booking.paidBy && booking.paidBy !== booking.party && (
            <div className="money-gift"><Icon name="Users" size={13} /> {PARTIES[booking.party]?.label}'s room, paid for by {PARTIES[booking.paidBy]?.label}</div>
          )}
          {booking.note && <div className="money-note">{booking.note}</div>}
          {booking.conf && <div className="itin-conf">Conf: <span>{booking.conf}</span></div>}
          {AWARDS[booking.awards?.[0]?.type]?.note && (
            <div className="money-tip"><Icon name="Lightbulb" size={13} /> {AWARDS[booking.awards[0].type].note}</div>
          )}
        </div>
      )}
    </div>
  );
}

function MoneyTotals({ bookings }) {
  const t = totals(bookings);
  return (
    <div className="money-totals">
      <div className="money-stat">
        <div className="money-stat-value">{money(t.cash)}</div>
        <div className="money-stat-label">Cash</div>
      </div>
      <div className="money-stat">
        <div className="money-stat-value">{fmtPoints(t.points)}</div>
        <div className="money-stat-label">Points</div>
      </div>
      <div className="money-stat">
        <div className="money-stat-value">{t.awards}</div>
        <div className="money-stat-label">Free {t.awards === 1 ? 'night' : 'nights'}</div>
      </div>
    </div>
  );
}

function MoneyBlock({ label, bookings, emptyText }) {
  return (
    <div className="money-block">
      <div className="section-title">{label}</div>
      {bookings.length === 0 ? (
        <div className="money-empty">{emptyText}</div>
      ) : (
        <>
          <MoneyTotals bookings={bookings} />
          <div className="money-list">
            {bookings.map(b => <BookingCard key={b.id} booking={b} />)}
          </div>
        </>
      )}
    </div>
  );
}

// Travelers see only their own party's spend; admin sees everyone's.
// What a trip is worth, for parties who aren't footing the bill.
function ValueTab({ party }) {
  const items = bookingsOwnedBy(party).filter(b => b.cashValue != null);
  const total = tripValue(items);
  const unpriced = bookingsOwnedBy(party).filter(b => b.cashValue == null);
  const pts = pointsByProgram(bookingsOwnedBy(party));

  return (
    <>
      <TitleIcon name="Wallet">Value of your trip</TitleIcon>
      <div className="value-hero">
        <div className="value-big">{money(total)}</div>
        <div className="value-sub">what the booked parts would cost at cash rates</div>
        {pts.length > 0 && (
          <div className="value-points">
            <div className="value-points-label">Booked with</div>
            {pts.map(pp => (
              <div key={pp.program} className="value-points-row">
                <span>{pp.program.includes('Award') ? `${pp.points} × ` : fmtPoints(pp.points)}</span>
                <span>{pp.program}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="money-empty">Nothing priced yet.</div>
      ) : (
        <div className="money-list">
          {items.map(b => (
            <div key={b.id} className="money-card static">
              <div className="money-card-top">
                <div className="money-card-info">
                  <div className="money-card-title">{b.title}</div>
                  <div className="money-card-sub">
                    {formatDate(b.date)}{b.endDate ? ` – ${formatDate(b.endDate)}` : ''}
                    {b.room ? ` · ${b.room}` : ''}
                  </div>
                </div>
                <div className="money-card-cost">
                  <div className="money-card-cash">{money(b.cashValue)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {unpriced.length > 0 && (
        <div className="money-note" style={{ margin: '0.8rem 1.2rem 0' }}>
          Not yet priced: {unpriced.map(b => b.title).join(', ')}.
        </div>
      )}
    </>
  );
}

function MoneyTab({ travelerId, isAdmin }) {
  const myParty = travelerId ? TRAVELERS[travelerId]?.party : null;
  if (!isAdmin && myParty && PARTIES[myParty]?.money === 'value') {
    return <ValueTab party={myParty} />;
  }
  const parties = isAdmin
    ? Object.values(PARTIES)
    : [PARTIES[myParty]].filter(Boolean);
  const scope = parties.flatMap(pt => bookingsFor(pt.id));
  const t = totals(scope);
  const shared = isAdmin ? SHARED_BUDGET : (myParty ? sharedFor(myParty) : []);

  return (
    <>
      <TitleIcon name="Wallet">
        {isAdmin ? 'Trip spend — everyone' : 'Your spend'}
      </TitleIcon>
      <MoneyTotals bookings={scope} />
      {scope.length > 0 && (
        <div className="money-grand">
          {fmtPoints(t.points)} points{t.awards > 0 ? ` + ${t.awards} free night` : ''} and {money(t.cash)} out of pocket
        </div>
      )}

      {isAdmin ? (
        parties.map(pt => (
          <MoneyBlock
            key={pt.id}
            label={pt.label}
            bookings={bookingsFor(pt.id)}
            emptyText="Nothing booked yet."
          />
        ))
      ) : scope.length === 0 ? (
        <div className="money-empty">Nothing booked under your name yet.</div>
      ) : (
        <div className="money-list">
          {scope.map(b => <BookingCard key={b.id} booking={b} />)}
        </div>
      )}

      {shared.length > 0 && (
        <div className="money-block">
          <div className="section-title">
            Shared costs · {money(shared.reduce((n, b) => n + (isAdmin ? lineTotal(b) : shareOf(b)), 0))}
          </div>
          <div className="money-list">
            {shared.map(b => (
              <div key={b.id || b.label} className="money-card static">
                <div className="money-card-top">
                  <div className="money-card-info">
                    <div className="money-card-title">{b.label}</div>
                    <div className="money-card-sub">
                      {b.note}
                      {b.parties && ` ${b.parties.map(id => PARTIES[id].label).join(' and ')} each cover one.`}
                    </div>
                  </div>
                  <div className="money-card-cost">
                    <div className="money-card-cash">{money(isAdmin ? lineTotal(b) : shareOf(b))}</div>
                    <div className="money-card-points">{isAdmin ? `${money(shareOf(b))} each` : 'yours'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
            <span className="bottom-nav-icon"><Icon strokeWidth={2.2} /></span>
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
  { id: 'notes', Icon: Mail, label: 'Messages' },
  { id: 'itinerary', Icon: Calendar, label: 'Trip' },
  { id: 'money', Icon: Wallet, label: 'Money' },
];

// ── Ben App ───────────────────────────────────────────────────────────────────
function TripApp({ onSignOut, travelerId }) {
  const [tab, setTab] = useState('home');
  const theme = TRAVELERS[travelerId]?.theme || DEFAULT_THEME;
  const party = TRAVELERS[travelerId]?.party || null;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    return () => { document.documentElement.dataset.theme = DEFAULT_THEME; };
  }, [theme]);

  const [notes, setNotes] = useState([]);
  const currentLocation = getCurrentLocation(party);
  const nextItem = getNextItem(party);
  const affirmation = getDailyAffirmation();

  useEffect(() => {
    fetch('/api/notes').then(r=>r.json()).then(d => setNotes(d.notes || [])).catch(()=>{});
    // Warm the tabs that hit the database so opening them is instant.
    fetch('/api/plans').then(r=>r.json()).then(d => { plansCache = d.plans || []; }).catch(()=>{});
    fetch('/api/messages').then(r=>r.json()).then(d => { messagesCache = d.messages || []; }).catch(()=>{});
  }, []);

  // Mark notes read when Notes tab is opened
  useEffect(() => {
  }, [tab]);

  return (
    <div className="app with-bottom-nav">
      <div className="header">
        <div className="header-left" style={{display:'flex',alignItems:'center',gap:'0.6rem'}}>
          <Palm size={36} />
          <div><h1>HAWAII 27</h1><p>January 2027</p></div>
        </div>
        <button className="header-signout" onClick={onSignOut}>Sign out</button>
      </div>

      <div className="tab-content">
        {tab === 'home' && <HomeTab currentLocation={currentLocation} nextItem={nextItem} affirmation={affirmation} recentNotes={notes} party={party} />}
        {tab === 'now' && <NowTab currentLocation={currentLocation} party={party} />}
        {tab === 'notes' && <MessagesTab me={travelerId} />}
        {tab === 'itinerary' && <ItineraryTab party={party} />}
        {tab === 'money' && <MoneyTab travelerId={travelerId} />}
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
      <div className="sender-success"><Icon name="CheckCircle2" size={16} /> Note sent to Ben!<br/><br/>
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
        {status==='sending'?'Sending...':<><Icon name="Send" size={14} /> Send Note</>}
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
        body: JSON.stringify({ message: 'Dakotah wishes you well! Have a safe flight', password }),
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
      <div className="wish-well-label"><Icon name="Plane" size={14} /> {flightLine}</div>
      <div className="wish-well-when">{when}</div>
      {status === 'sent' ? (
        <div className="wish-well-sent"><Icon name="Heart" size={14} /> Wishes sent!</div>
      ) : (
        <button className="wish-well-btn" onClick={send} disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : status === 'error' ? 'Try again' : <><Icon name="Heart" size={14} /> Wish him well</>}
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
      <TitleIcon name="Mail">Write him a note</TitleIcon>
      <div style={{padding:'0 1.2rem'}}>
        <SendForm password={password} />
      </div>
    </>
  );
}

const SENDER_TABS = [
  { id: 'home', Icon: Mail, label: 'Messages' },
  { id: 'now', Icon: MapPin, label: 'Now' },
  { id: 'itinerary', Icon: Calendar, label: 'Trip' },
  { id: 'money', Icon: Wallet, label: 'Money' },
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
          <Palm size={36} />
          <div><h1>SEND A NOTE</h1><p>January 2027</p></div>
        </div>
        <button className="header-signout" onClick={signOut}>Sign out</button>
      </div>

      <div className="tab-content">
        {tab === 'home' && <MessagesTab me="admin" />}
        {tab === 'now' && (
          <>
            <div style={{padding:'0.6rem 1.2rem 0'}}>
              <WishWellButton password={password} />
            </div>
            <NowTab currentLocation={currentLocation} isAdmin />
          </>
        )}
        {tab === 'itinerary' && <ItineraryTab isAdmin />}
        {tab === 'money' && <MoneyTab isAdmin />}
      </div>

      <BottomNav tab={tab} setTab={setTab} tabs={SENDER_TABS} />
    </div>
  );
}

// ── Keep the installed app current ───────────────────────────────────────────
// iOS home-screen apps resume the old page rather than reloading. Whenever the
// app comes back to the foreground, ask the server which build it's on and
// reload if a newer one has been deployed.
function useAutoRefresh() {
  useEffect(() => {
    const mine = process.env.NEXT_PUBLIC_BUILD_ID;
    if (!mine) return;
    let checking = false;
    const check = async () => {
      if (checking || document.visibilityState !== 'visible') return;
      checking = true;
      try {
        const r = await fetch('/api/version', { cache: 'no-store' });
        const { id } = await r.json();
        if (id && id !== 'unknown' && id !== mine) window.location.reload();
      } catch (_) {} finally { checking = false; }
    };
    document.addEventListener('visibilitychange', check);
    const t = setInterval(check, 5 * 60_000);
    check();
    return () => { document.removeEventListener('visibilitychange', check); clearInterval(t); };
  }, []);
}

// ── Root with cookie-backed auth ─────────────────────────────────────────────
export default function Page() {
  useAutoRefresh();
  const [hydrated, setHydrated] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [mode, setMode] = useState('traveler');
  const [travelerId, setTravelerId] = useState(null);

  useEffect(() => {
    // Clean up any stale auth state from older client builds
    try {
      localStorage.removeItem('benstrip_auth_v1');
      sessionStorage.removeItem('benstrip_auth_v1');
    } catch (_) {}
    fetch('/api/auth/me')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data?.authed && data.mode) {
          setMode(data.mode);
          setTravelerId(data.travelerId || null);
          setAuthed(true);
        }
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  const handleAuth = (m, tid) => { setMode(m); setTravelerId(tid || null); setAuthed(true); };

  const signOut = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch (_) {}
    setAuthed(false);
  };

  // Paint something immediately rather than a blank page while the cookie is checked.
  if (!hydrated) {
    return (
      <div className="pin-screen splash">
        <Palm size={140} />
        <div className="pin-title">HAWAII 27</div>
        <div className="pin-sub">January 2027</div>
      </div>
    );
  }
  if (!authed) return <PinScreen onSuccess={handleAuth}/>;
  if (mode === 'sender') return <SenderPage onSignOut={signOut}/>;
  return <TripApp onSignOut={signOut} travelerId={travelerId}/>;
}
