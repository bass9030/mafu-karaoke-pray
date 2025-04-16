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

/**
 * @typedef {Object} songInfo
 * @property {TYPE} type
 * @property {number} songId
 * @property {string} title
 * @property {string} singer
 * @property {string} composer
 * @property {string} writer
 * @property {Date} publishDate
 */

// TJ
/**
 *
 * @returns {Promise<songInfo[]>}
 */
async function getNewSongTJ() {
    let date = new Date();
    let res = await fetch(
        `https://www.tjmedia.com/legacy/api/newSongOfMonth?searchYm=${date.getFullYear()}${(
            date.getMonth() + 1
        )
            .toString()
            .padStart(2, "0")}`
    );
    let result = await res.json();
    return result.resultData.items.map((e) => {
        return {
            type: TYPE.TJ,
            songId: e.pro,
            title: e.indexTitle,
            singer: e.indexSong,
            composer: e.com,
            writer: e.word,
            publishDate: new Date(e.publishdate),
        };
    });
}

// KY
function getValueFromXML(xml, key) {
    return xml.split(`${key}="`)[1].split('"')[0].trim();
}

/**
 * @returns {Promise<songInfo[]>}
 */
async function getNewSongKY() {
    let date = new Date();
    let res = await fetch(`http://my.kysing.kr/player/xml/new_ky.asp`, {
        method: "POST",
        headers: {
            Cookie: "ASPSESSIONIDASACAATQ=OGAJOFOCCEHJIOOGFGEAHIFJ",
        },
        body: `s_date=${date.getFullYear()}${(date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}`,
    });
    let data = await res.text();

    let parsed = data.match(
        /<Item\sSongId="[0-9]+"\sTitle=".+"\sSinger=".+"\sAuthor=".+"\sLyricsAuthor=".+"\sWebKaraYn="(True|False)"\s\/>/g
    );
    let result = [];
    const keys = {
        SongId: "songId",
        Title: "title",
        Singer: "singer",
        Author: "composer",
        LyricsAuthor: "writer",
    };
    for (let i of parsed) {
        /**
         * @type {songInfo}
         */
        let d = {};
        d.type = TYPE.KY;
        for (let key of Object.keys(keys))
            d[keys[key]] = getValueFromXML(i, key);
        result.push(d);
    }

    return result;
}

module.exports = {
    TYPE,
    getNewSongKY,
    getNewSongTJ,
};
