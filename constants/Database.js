import * as SQLite from "expo-sqlite";

// Open or create the database
const db = SQLite.openDatabase("feelio.db");

// Function to initialize the database (create + migrate tables)
const initializeDatabase = () => {
  db.transaction((tx) => {
    // Create table if it doesn't exist
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS diary (
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
      );`
    );
    // Non-destructive migrations: add new columns if they don't exist
    const newColumns = [
      "ALTER TABLE diary ADD COLUMN mood TEXT",
      "ALTER TABLE diary ADD COLUMN weather_icon TEXT",
      "ALTER TABLE diary ADD COLUMN weather_temp REAL",
      "ALTER TABLE diary ADD COLUMN weather_city TEXT",
      "ALTER TABLE diary ADD COLUMN tags TEXT",
      "ALTER TABLE diary ADD COLUMN images TEXT",
    ];
    newColumns.forEach((sql) => {
      tx.executeSql(sql, [], () => { }, () => { }); // Ignore error if column already exists
    });
  });
};

// Insert a new diary entry
const insertDiary = (
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
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO diary (title, content, year, month, day, hour, minute, monthname, timestamp, mood, weather_icon, weather_temp, weather_city, tags, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [title, content, year, month, day, hour, minute, monthname, timestamp, mood, weather_icon, weather_temp, weather_city, tags, images],
        (_, results) => resolve(results),
        (_, error) => reject(error)
      );
    });
  });
};

// Update a diary entry
const updateDiary = (id, title, content, mood = null, images = null) => {
  const tags = extractTags(content);
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE diary SET title=?, content=?, mood=?, tags=?, images=? WHERE id=?",
        [title, content, mood, tags, images, id],
        (_, results) => resolve(results),
        (_, error) => reject(error)
      );
    });
  });
};

// Get all diaries filtered by year and month
const getAllDiaries = (year, month) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM diary WHERE year=? AND monthname=? ORDER BY id DESC",
        [year, month],
        (_, results) => {
          const rows = results.rows;
          const diaries = [];
          for (let i = 0; i < rows.length; i++) {
            diaries.push(rows.item(i));
          }
          resolve(diaries);
        },
        (_, error) => reject(error)
      );
    });
  });
};

// Get a single diary by id
const getDiary = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM diary WHERE id=?",
        [id],
        (_, results) => {
          const rows = results.rows;
          const diaries = [];
          for (let i = 0; i < rows.length; i++) {
            diaries.push(rows.item(i));
          }
          resolve(diaries);
        },
        (_, error) => reject(error)
      );
    });
  });
};

// Delete a diary by id
const deleteDiaryById = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM diary WHERE id = ?",
        [id],
        (_, results) => resolve(results),
        (_, error) => reject(error)
      );
    });
  });
};

// Search diaries by title or content
const searchDiaries = (query) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM diary WHERE title LIKE ? OR content LIKE ? ORDER BY id DESC",
        [`%${query}%`, `%${query}%`],
        (_, results) => {
          const rows = results.rows;
          const diaries = [];
          for (let i = 0; i < rows.length; i++) {
            diaries.push(rows.item(i));
          }
          resolve(diaries);
        },
        (_, error) => reject(error)
      );
    });
  });
};

// Get last 7 days of entries for mood chart
const getRecentDiaries = (days = 7) => {
  const cutoff = Math.floor(Date.now() / 1000) - days * 86400;
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM diary WHERE timestamp >= ? ORDER BY timestamp ASC",
        [cutoff],
        (_, results) => {
          const rows = results.rows;
          const diaries = [];
          for (let i = 0; i < rows.length; i++) {
            diaries.push(rows.item(i));
          }
          resolve(diaries);
        },
        (_, error) => reject(error)
      );
    });
  });
};

// Get all diaries for export
const getAllDiariesForExport = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM diary ORDER BY id DESC",
        [],
        (_, results) => {
          const rows = results.rows;
          const diaries = [];
          for (let i = 0; i < rows.length; i++) {
            diaries.push(rows.item(i));
          }
          resolve(diaries);
        },
        (_, error) => reject(error)
      );
    });
  });
};

// Clear a table
const clearTable = (tableName) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `DELETE FROM ${tableName}`,
        [],
        (_, results) => resolve(results),
        (_, error) => reject(error)
      );
    });
  });
};

// Extract #tags from content
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
