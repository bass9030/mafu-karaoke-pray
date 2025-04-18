const sqlite3 = require("sqlite3");
/**
 * @enum {{
 * TJ: 0,
 * KY: 1
 * }} TYPE
 */
const TYPE = {
    TJ: 0,
    KY: 1,
};
class songLogDB {
    constructor() {
        this.db = null;
    }

    openDB() {
        this.db = new sqlite3.Database("./db/songlog.db");
    }

    async initializeTable() {
        return new Promise((resolve, reject) => {
            this.db.exec(
                "CREATE TABLE IF NOT EXISTS songLog (type INTEGER, songId INTEGER, CONSTRAINT song_id_type_grpup_pk PRIMARY KEY(type, songId));",
                (err) => {
                    if (!!err) {
                        reject(err);
                        return;
                    }
                    this.db
                        .exec(
                            "CREATE TABLE IF NOT EXISTS startDate (id INTEGER PRIMARY KEY, date INTEGER);"
                        )
                        .run(
                            "INSERT INTO startDate VALUES (1, ?)",
                            new Date().getTime(),
                            (_, err) => {
                                if (!!err) {
                                    reject(err);
                                    return;
                                } else resolve();
                            }
                        );
                }
            );
        });
    }

    /**
     *
     * @param {import('./getKaraokeNewSong.js').songInfo} songInfo
     */
    async addSong(songInfo) {
        return new Promise((resolve, reject) => {
            this.db
                .prepare("INSERT INTO songLog VALUES (?, ?)")
                .run(songInfo.type, songInfo.songId, (_, err) => {
                    if (!!err) reject(err);
                    else resolve();
                })
                .finalize();
        });
    }

    /**
     *
     * @param {import('./getKaraokeNewSong.js').songInfo} songInfo
     * @returns {Promise<songInfo[]>}
     */
    async getSong(songInfo) {
        return new Promise((resolve, reject) => {
            this.db
                .prepare("SELECT * FROM songLog WHERE type = ? AND songId = ?;")
                .all(songInfo.type, songInfo.songId, (err, row) => {
                    if (!!err) reject(err);
                    else resolve(row);
                })
                .finalize();
        });
    }

    /**
     *
     * @returns {Promise<number>}
     */
    async getDDay() {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM startDate;", (err, row) => {
                if (!!err) reject(err);
                else
                    resolve(
                        Math.floor(
                            (new Date().getTime() - row["date"]) /
                                (86400 * 1000)
                        ) + 1
                    );
            });
        });
    }

    /**
     *
     * @param {Date} date
     * @returns {Promise<>}
     */
    async setDDay(date) {
        return new Promise((resolve, reject) => {
            this.db.run(
                "UPDATE startDate SET date = ? WHERE id = 1;",
                date.getTime(),
                (_, err) => {
                    if (!!err) reject(err);
                    else resolve();
                }
            );
        });
    }

    closeDB() {
        if (this.db === null) return;
        this.db.close();
        this.db = null;
    }
}

module.exports = songLogDB;
