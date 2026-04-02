// Google Calendar API configuration
// To set up: create a Google Cloud project, enable Calendar API,
// create an API key restricted to Calendar API
const CONFIG = {
  GOOGLE_API_KEY: '', // Add your API key here
  CALENDAR_ID: 'primary',
  REFRESH_INTERVAL: 60000, // Refresh events every 60 seconds
  TIMEZONE: 'America/Los_Angeles',

  // Day display range
  DAY_START_HOUR: 7,
  DAY_END_HOUR: 25, // 1 AM next day

  // Map Google Calendar color IDs to app categories
  // These match the colors we set up in your calendar
  COLOR_MAP: {
    '10': 'wellness',  // green - yoga
    '9': 'work',       // blue - Claude work
    '6': 'errand',     // orange - errands
    '5': 'koyo',       // yellow - Koyo time
    '3': 'music',      // purple - music
    '8': 'chores',     // gray - chores/home
  },

  // Icons for each category (toddler-friendly!)
  ICON_MAP: {
    'wellness': '🧘🏾',
    'work': '💻',
    'errand': '🚗',
    'koyo': '🧸',
    'music': '🎵',
    'chores': '🏠',
    'default': '📅',
  },

  // Keyword-based icon overrides (checked against event title)
  KEYWORD_ICONS: {
    'yoga': '🧘🏾',
    'preschool': '🏫',
    'pickup': '🚗',
    'drop off': '🚗',
    'grocery': '🛒',
    'post office': '📦',
    'dinner': '🍽️',
    'lunch': '🍽️',
    'bath': '🛁',
    'book': '📚',
    'bed': '🌙',
    'sleep': '🌙',
    'nap': '😴',
    'play': '🎮',
    'music': '🎵',
    'piano': '🎹',
    'guitar': '🎸',
    'birthday': '🎂',
    'park': '🌳',
    'walk': '🚶🏾',
    'clean': '🧹',
    'cook': '👩🏾‍🍳',
    'video': '🎬',
    'crochet': '🧶',
    'garden': '🌱',
  },

  // Sub-activities for Koyo time blocks
  // Add activities as chips inside matching events
  // Uses keyword matching against event titles
  ACTIVITIES: {
    'lunch': [
      { icon: '🥪', label: 'Eat lunch' },
      { icon: '📚', label: 'Read a book' },
    ],
    'koyo time': [
      { icon: '🧩', label: 'Puzzle' },
      { icon: '🎨', label: 'Art / coloring' },
      { icon: '🏃🏾', label: 'Active play' },
    ],
    'play': [
      { icon: '🧱', label: 'Build / blocks' },
      { icon: '🎭', label: 'Pretend play' },
      { icon: '🌳', label: 'Outside time' },
    ],
    'wind down': [
      { icon: '🛁', label: 'Bath' },
      { icon: '📖', label: 'Story time' },
      { icon: '🧸', label: 'Quiet play' },
    ],
    'dinner prep': [
      { icon: '👩🏾‍🍳', label: 'Cook together' },
      { icon: '🎨', label: 'Art / coloring' },
    ],
    'music practice': [
      { icon: '🎹', label: 'Piano' },
      { icon: '🥁', label: 'Drums' },
      { icon: '🎤', label: 'Singing' },
    ],
  }
};
