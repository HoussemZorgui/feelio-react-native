import * as SQLite from "expo-sqlite";

// Open the database synchronously
const db = SQLite.openDatabaseSync("feelio.db");

/**
 * Initialize the database:
 * - Create the table if it doesn't exist
 * - Run non-destructive migrations (ALTER TABLE)
 */
const initializeDatabase = () => {
  try {
    // 1. Create table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS diary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        content TEXT,
        year INTEGER,
        month INTEGER,
        day INTEGER,
        hour INTEGER,
        minute INTEGER,
        monthname TEXT,
        timestamp TEXT,
        mood TEXT,
        weather_icon TEXT,
        weather_temp REAL,
        weather_city TEXT,
        tags TEXT,
        images TEXT
      );
    `);

    // 2. Non-destructive migrations (add columns if not present)
    // The new API doesn't support 'transaction' in the same way, 
    // but we can just run individual execSync calls.
    const columns = [
      "mood TEXT",
      "weather_icon TEXT",
      "weather_temp REAL",
      "weather_city TEXT",
      "tags TEXT",
      "images TEXT"
    ];

    columns.forEach(col => {
      try {
        db.execSync(`ALTER TABLE diary ADD COLUMN ${col};`);
      } catch (e) {
        // Silently fail if column already exists
      }
    });
  } catch (error) {
    console.error("Database initialization failed:", error);
  }
};

/**
 * Insert a new diary entry
 */
const insertDiary = async (
  title,
  content,
  year,
  month,
  day,
  hour,
  minute,
  monthname,
  timestamp,
  mood = null,
  weather_icon = null,
  weather_temp = null,
  weather_city = null,
  images = null
) => {
  const tags = extractTags(content);
  try {
    const result = await db.runAsync(
      "INSERT INTO diary (title, content, year, month, day, hour, minute, monthname, timestamp, mood, weather_icon, weather_temp, weather_city, tags, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [title, content, year, month, day, hour, minute, monthname, timestamp, mood, weather_icon, weather_temp, weather_city, tags, images]
    );
    return result;
  } catch (error) {
    console.error("Insert failed:", error);
    throw error;
  }
};

/**
 * Update a diary entry
 */
const updateDiary = async (id, title, content, mood = null, images = null) => {
  const tags = extractTags(content);
  try {
    const result = await db.runAsync(
      "UPDATE diary SET title=?, content=?, mood=?, tags=?, images=? WHERE id=?",
      [title, content, mood, tags, images, id]
    );
    return result;
  } catch (error) {
    console.error("Update failed:", error);
    throw error;
  }
};

/**
 * Get all diaries filtered by year and month
 */
const getAllDiaries = async (year, month) => {
  try {
    const results = await db.getAllAsync(
      "SELECT * FROM diary WHERE year=? AND monthname=? ORDER BY id DESC",
      [year, month]
    );
    return results;
  } catch (error) {
    console.error("Get all diaries failed:", error);
    throw error;
  }
};

/**
 * Get a single diary by id
 */
const getDiary = async (id) => {
  try {
    const results = await db.getAllAsync("SELECT * FROM diary WHERE id=?", [id]);
    return results;
  } catch (error) {
    console.error("Get diary failed:", error);
    throw error;
  }
};

/**
 * Delete a diary by id
 */
const deleteDiaryById = async (id) => {
  try {
    const result = await db.runAsync("DELETE FROM diary WHERE id = ?", [id]);
    return result;
  } catch (error) {
    console.error("Delete failed:", error);
    throw error;
  }
};

/**
 * Search diaries by title or content
 */
const searchDiaries = async (query) => {
  try {
    const results = await db.getAllAsync(
      "SELECT * FROM diary WHERE title LIKE ? OR content LIKE ? ORDER BY id DESC",
      [`%${query}%`, `%${query}%`]
    );
    return results;
  } catch (error) {
    console.error("Search failed:", error);
    throw error;
  }
};

/**
 * Get last 7 days of entries for mood chart
 */
const getRecentDiaries = async (days = 7) => {
  const cutoff = Math.floor(Date.now() / 1000) - days * 86400;
  try {
    const results = await db.getAllAsync(
      "SELECT * FROM diary WHERE timestamp >= ? ORDER BY timestamp ASC",
      [cutoff]
    );
    return results;
  } catch (error) {
    console.error("Get recent diaries failed:", error);
    throw error;
  }
};

/**
 * Get all diaries for export
 */
const getAllDiariesForExport = async () => {
  try {
    const results = await db.getAllAsync("SELECT * FROM diary ORDER BY id DESC");
    return results;
  } catch (error) {
    console.error("Export fetch failed:", error);
    throw error;
  }
};

/**
 * Clear a table
 */
const clearTable = async (tableName) => {
  try {
    const result = await db.runAsync(`DELETE FROM ${tableName}`);
    return result;
  } catch (error) {
    console.error("Clear table failed:", error);
    throw error;
  }
};

/**
 * Extract #tags from content
 */
const extractTags = (content) => {
  if (!content) return null;
  const matches = content.match(/#\w+/g);
  if (!matches) return null;
  return [...new Set(matches)].join(",");
};

export {
  initializeDatabase,
  insertDiary,
  getAllDiaries,
  deleteDiaryById,
  clearTable,
  getDiary,
  updateDiary,
  searchDiaries,
  getRecentDiaries,
  getAllDiariesForExport,
  extractTags,
};
