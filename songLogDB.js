const sqlite3 = require("better-sqlite3");
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
        this.db = sqlite3("./db/songlog.db");
    }

    async initializeTable() {
        await this.db.exec(
            "CREATE TABLE IF NOT EXISTS songLog (type INTEGER, songId INTEGER, CONSTRAINT song_id_type_grpup_pk PRIMARY KEY(type, songId));"
        );
        await this.db.exec(
            "CREATE TABLE IF NOT EXISTS tweetLog (year INTEGER, month INTEGER, date INTEGER, CONSTRAINT song_id_type_grpup_pk PRIMARY KEY(year, month, date));"
        );
        await this.db.exec(
            "CREATE TABLE IF NOT EXISTS startDate (id INTEGER PRIMARY KEY, date INTEGER);"
        );
        try {
            await this.db
                .prepare("INSERT INTO startDate VALUES (1, ?)")
                .run(new Date().getTime());
        } catch {}
    }

    /**
     *
     * @param {import('./getKaraokeNewSong.js').songInfo} songInfo
     */
    async addSong(songInfo) {
        await this.db
            .prepare("INSERT INTO songLog VALUES (?, ?)")
            .run(songInfo.type, songInfo.songId);
    }

    /**
     *
     * @param {import('./getKaraokeNewSong.js').songInfo} songInfo
     * @returns {Promise<songInfo[]>}
     */
    async getSong(songInfo) {
        return await this.db
            .prepare("SELECT * FROM songLog WHERE type = ? AND songId = ?;")
            .all(songInfo.type, songInfo.songId);
    }

    /**
     *
     * @returns {Promise<number>}
     */
    async getDDay() {
        let row = await this.db.prepare("SELECT * FROM startDate;").get();
        return (
            Math.floor((new Date().getTime() - row["date"]) / (86400 * 1000)) +
            1
        );
    }

    /**
     *
     * @param {Date} date
     * @returns
     */
    async setSent(date) {
        try {
            await this.db
                .prepare("INSERT INTO tweetLog VALUES (?, ?, ?);")
                .run(date.getFullYear(), date.getMonth() + 1, date.getDate());
        } catch {}
    }

    async isSent(date) {
        return (
            (
                await this.db
                    .prepare(
                        "SELECT * FROM tweetLog WHERE year = ? AND month = ? AND date = ?;"
                    )
                    .get(
                        date.getFullYear(),
                        date.getMonth() + 1,
                        date.getDate()
                    )
            )?.length > 0
        );
    }

    /**
     *
     * @param {Date} date
     * @returns {Promise<>}
     */
    async setDDay(date) {
        await this.db
            .prepare("UPDATE startDate SET date = ? WHERE id = 1;")
            .run(date.getTime());
    }

    closeDB() {
        if (this.db === null) return;
        this.db.close();
        this.db = null;
    }
}

module.exports = songLogDB;
