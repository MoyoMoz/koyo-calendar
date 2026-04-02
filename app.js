// Koyo's Day — Visual Calendar Display

let events = [];

// --- Clock & Greeting ---

function updateClock() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  document.getElementById('clock').textContent = `${displayHours}:${minutes} ${ampm}`;

  // Update greeting based on time of day
  let greeting;
  if (hours < 12) greeting = "Good Morning!";
  else if (hours < 17) greeting = "Good Afternoon!";
  else greeting = "Good Evening!";

  document.getElementById('greeting').textContent = greeting;
}

// --- Mini Analog Clock SVG ---

function makeClockSVG(date) {
  const hours = date.getHours() % 12;
  const minutes = date.getMinutes();

  // Angles (12 o'clock = 0 degrees, clockwise)
  const minuteAngle = (minutes / 60) * 360;
  const hourAngle = (hours / 12) * 360 + (minutes / 60) * 30;

  // Convert angle to line endpoint (center = 22, radius varies)
  const toXY = (angle, len) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: (22 + Math.cos(rad) * len).toFixed(1),
      y: (22 + Math.sin(rad) * len).toFixed(1),
    };
  };

  const hourEnd = toXY(hourAngle, 10);
  const minEnd = toXY(minuteAngle, 14);

  // Hour tick marks
  let ticks = '';
  for (let i = 0; i < 12; i++) {
    const angle = i * 30;
    const outer = toXY(angle, 19);
    const inner = toXY(angle, i % 3 === 0 ? 15 : 17);
    ticks += `<line x1="${inner.x}" y1="${inner.y}" x2="${outer.x}" y2="${outer.y}" class="clock-tick"/>`;
  }

  return `<svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
    <circle cx="22" cy="22" r="20" class="clock-face"/>
    ${ticks}
    <line x1="22" y1="22" x2="${hourEnd.x}" y2="${hourEnd.y}" class="clock-hour-hand"/>
    <line x1="22" y1="22" x2="${minEnd.x}" y2="${minEnd.y}" class="clock-minute-hand"/>
    <circle cx="22" cy="22" r="2" class="clock-center"/>
  </svg>`;
}

// --- Google Calendar API ---

async function fetchEvents() {
  if (!CONFIG.GOOGLE_API_KEY) {
    showDemoEvents();
    return;
  }

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(CONFIG.DAY_START_HOUR, 0, 0, 0);

  const endOfDay = new Date(now);
  if (CONFIG.DAY_END_HOUR >= 24) {
    endOfDay.setDate(endOfDay.getDate() + 1);
    endOfDay.setHours(CONFIG.DAY_END_HOUR - 24, 0, 0, 0);
  } else {
    endOfDay.setHours(CONFIG.DAY_END_HOUR, 0, 0, 0);
  }

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CONFIG.CALENDAR_ID)}/events?` +
    `key=${CONFIG.GOOGLE_API_KEY}` +
    `&timeMin=${startOfDay.toISOString()}` +
    `&timeMax=${endOfDay.toISOString()}` +
    `&singleEvents=true` +
    `&orderBy=startTime` +
    `&timeZone=${CONFIG.TIMEZONE}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error('Calendar API error:', data.error);
      showDemoEvents();
      return;
    }

    events = (data.items || [])
      .filter(e => e.start && e.start.dateTime) // skip all-day events
      .map(e => ({
        id: e.id,
        title: e.summary || 'Untitled',
        start: new Date(e.start.dateTime),
        end: new Date(e.end.dateTime),
        colorId: e.colorId,
      }));

    renderTimeline();
  } catch (err) {
    console.error('Failed to fetch events:', err);
    showDemoEvents();
  }
}

// --- Demo events (when no API key is set) ---

function showDemoEvents() {
  const now = new Date();
  const today = (h, m = 0) => {
    const d = new Date(now);
    d.setHours(h, m, 0, 0);
    return d;
  };

  events = [
    { title: 'Drop off Koyo at preschool', start: today(8, 30), end: today(9, 30), colorId: '6' },
    { title: 'Grocery store + post office', start: today(9, 30), end: today(10), colorId: '6' },
    { title: 'Yoga', start: today(10), end: today(11), colorId: '10' },
    { title: 'Work with Claude — video editing', start: today(11), end: today(12, 15), colorId: '9' },
    { title: 'Leave for preschool pickup', start: today(12, 30), end: today(13), colorId: '6' },
    { title: 'Lunch + Koyo time', start: today(13), end: today(14, 30), colorId: '5' },
    { title: 'Koyo naps — chores', start: today(14, 30), end: today(16), colorId: '8' },
    { title: 'Koyo time + dinner prep', start: today(16), end: today(17, 30), colorId: '5' },
    { title: 'Dinner', start: today(17, 30), end: today(18), colorId: '8' },
    { title: 'Music practice with Koyo', start: today(18), end: today(18, 30), colorId: '3' },
    { title: 'Play / activity time with Koyo', start: today(18, 30), end: today(20), colorId: '5' },
    { title: 'Wind down — bath, books, chill', start: today(20), end: today(21, 30), colorId: '5' },
    { title: 'Bedtime routine', start: today(21, 30), end: today(22), colorId: '5' },
    { title: 'Work with Claude — livingearth.com', start: today(23), end: today(24, 30), colorId: '9' },
  ];

  renderTimeline();
}

// --- Determine event category ---

function getCategory(event) {
  return CONFIG.COLOR_MAP[event.colorId] || 'default';
}

function getIcon(event) {
  const title = event.title.toLowerCase();

  // Check keyword icons first (more specific)
  for (const [keyword, icon] of Object.entries(CONFIG.KEYWORD_ICONS)) {
    if (title.includes(keyword)) return icon;
  }

  // Fall back to color-based category icon
  const category = getCategory(event);
  return CONFIG.ICON_MAP[category] || CONFIG.ICON_MAP['default'];
}

// --- Keyword class for per-event colors ---

function getKeywordClass(event) {
  const title = event.title.toLowerCase();
  const keywords = [
    'preschool', 'grocery', 'post-office', 'yoga', 'video',
    'dinner', 'nap', 'clean', 'cook', 'bath', 'book', 'bed', 'living'
  ];
  // Check with spaces too (post office → post-office)
  const titleNormalized = title.replace(/\s+/g, '-');
  for (const kw of keywords) {
    if (title.includes(kw.replace('-', ' ')) || titleNormalized.includes(kw)) {
      return `event-keyword-${kw}`;
    }
  }
  return '';
}

// --- Sub-activities ---

function getActivities(event) {
  const title = event.title.toLowerCase();
  for (const [keyword, activities] of Object.entries(CONFIG.ACTIVITIES)) {
    if (title.includes(keyword)) return activities;
  }
  return [];
}

// --- Format time ---

function formatTime(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  if (minutes === 0) return `${hours} ${ampm}`;
  return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

function formatDuration(start, end) {
  const mins = Math.round((end - start) / 60000);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

// --- Render ---

function renderTimeline() {
  const timeline = document.getElementById('timeline');
  const now = new Date();

  // Remove old now-marker
  const oldMarker = timeline.querySelector('.now-marker');
  if (oldMarker) oldMarker.remove();

  // Clear events but keep the ::before pseudo-element
  timeline.querySelectorAll('.event, .free-time').forEach(el => el.remove());

  if (events.length === 0) {
    timeline.innerHTML = '<div style="text-align:center;padding:40px;opacity:0.5;font-size:1.3rem;">No events today</div>';
    return;
  }

  events.forEach((event, i) => {
    const el = document.createElement('div');
    const category = getCategory(event);
    const icon = getIcon(event);

    // Determine if past, current, or future
    let status;
    if (now >= event.end) status = 'past';
    else if (now >= event.start) status = 'current';
    else status = 'future';

    // Track which Koyo event this is for color rotation
    let koyoClass = '';
    if (category === 'koyo') {
      const koyoIndex = events.slice(0, i).filter(e => getCategory(e) === 'koyo').length;
      koyoClass = `koyo-${koyoIndex % 6}`;
    }

    // Keyword-specific color override (skip for Koyo events — they keep purple/red)
    const keywordClass = category === 'koyo' ? '' : getKeywordClass(event);

    el.className = `event event-${category} ${status} ${koyoClass} ${keywordClass}`;

    // Progress bar for current event
    let progressHTML = '';
    if (status === 'current') {
      const elapsed = now - event.start;
      const total = event.end - event.start;
      const pct = Math.min(100, (elapsed / total) * 100);
      progressHTML = `<div class="event-duration-bar" style="width:${pct}%"></div>`;
    }

    // Sub-activities
    const activities = getActivities(event);
    let activitiesHTML = '';
    if (activities.length > 0) {
      const chips = activities.map(a =>
        `<span class="activity-chip"><span class="chip-icon">${a.icon}</span>${a.label}</span>`
      ).join('');
      activitiesHTML = `<div class="event-activities">${chips}</div>`;
    }

    // Mini analog clock showing start time
    const clockHTML = makeClockSVG(event.start);

    // Koyo badge on all his events
    const koyoBadge = category === 'koyo' ? '<span class="koyo-badge">KOYO</span>' : '';

    el.innerHTML = `
      <div class="event-clock">${clockHTML}</div>
      <div class="event-icon">${icon}</div>
      <div class="event-details">
        <div class="event-name">${koyoBadge}${event.title}</div>
        ${activitiesHTML}
      </div>
      <div class="event-time-right">
        <div class="event-time-start">${formatTime(event.start)}</div>
        <div class="event-time-end">to ${formatTime(event.end)}</div>
        <div class="event-time-duration">${formatDuration(event.start, event.end)}</div>
      </div>
      ${progressHTML}
    `;

    timeline.appendChild(el);
  });

  // Position now marker
  positionNowMarker();
}

function positionNowMarker() {
  const timeline = document.getElementById('timeline');
  const now = new Date();
  const eventEls = timeline.querySelectorAll('.event');

  // Remove existing marker
  let marker = timeline.querySelector('.now-marker');
  if (!marker) {
    marker = document.createElement('div');
    marker.className = 'now-marker';
    marker.textContent = '▶';
    timeline.appendChild(marker);
  }

  // Find where "now" falls
  let markerTop = 0;

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const el = eventEls[i];
    if (!el) continue;

    if (now < event.start) {
      // Now is before this event
      markerTop = el.offsetTop - 4;
      break;
    } else if (now >= event.start && now < event.end) {
      // Now is during this event
      const progress = (now - event.start) / (event.end - event.start);
      markerTop = el.offsetTop + (el.offsetHeight * progress);
      break;
    } else if (i === events.length - 1) {
      // Past the last event
      markerTop = el.offsetTop + el.offsetHeight;
    }
  }

  marker.style.top = markerTop + 'px';
}

// --- Init ---

function init() {
  updateClock();
  fetchEvents();

  // Update clock every second
  setInterval(updateClock, 1000);

  // Reposition now marker every minute
  setInterval(() => {
    positionNowMarker();
    // Re-render to update past/current/future states
    renderTimeline();
  }, 60000);

  // Refresh events from calendar periodically
  setInterval(fetchEvents, CONFIG.REFRESH_INTERVAL);
}

init();
