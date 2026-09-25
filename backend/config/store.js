import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial in-memory data
let store = {
  users: [],
  skills: [],
  learningGoals: [],
  roadmaps: [],
  userProgress: [],
  mcqs: [],
  codingChallenges: [],
  connections: [],
  messages: [],
  practiceTasks: [],
  sessions: [],
  ratings: [],
  notifications: [],
  credits: [],
  badges: [],
  emailLogs: [],
  assessments: [],
  assessmentResults: [],
  otps: []
};

// Load saved data if exists
if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    store = { ...store, ...JSON.parse(raw) };
  } catch (err) {
    console.warn('Could not read existing store.json, starting fresh');
  }
}

export const saveStore = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error persisting store:', err);
  }
};

export const getStore = () => store;

export const resetStore = (initialData) => {
  store = { ...initialData };
  saveStore();
  return store;
};

export default {
  getStore,
  saveStore,
  resetStore
};
