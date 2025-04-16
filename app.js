const Twitter = require("./createTweet");
const { getNewSongKY, getNewSongTJ, TYPE } = require("./getKaraokeNewSong");
const songLogDB = require("./songLogDB");
const Tweet = new Twitter(process.env.X_CT0_TOKEN, process.env.X_AUTH_TOKEN);

async function checkNewSong() {
    const db = new songLogDB();

    try {
        db.openDB();
        await db.initializeTable();

        let tjNew = await getNewSongTJ();
        let kyNew = await getNewSongKY();
        let mergeNew = tjNew.concat(kyNew);

        let mafuNewSong = [];
        const keyword = ["mafumafu", "まふまふ"];
        for (let e of mergeNew) {
            if (
                keyword.includes(e.composer.toLowerCase()) ||
                keyword.includes(e.singer.toLowerCase()) ||
                keyword.includes(e.writer.toLowerCase())
            ) {
                mafuNewSong.push(e);
            }
        }

        let needNotify = [];

        if (mafuNewSong.length > 0) {
            for (let e of mafuNewSong) {
                try {
                    let dbResult = await db.getSong(e);
                    if (dbResult.length > 0) continue;
                    needNotify.push(e);
                    await db.addSong(e);
                } catch (e) {
                    console.error(e);
                    continue;
                }
            }
        }
        if (needNotify.length > 0) {
            console.log(needNotify);
            // Tweet.createTweet("");
        } else {
            let dday = await db.getDDay();
            console.log(`마후 신곡 노래방 등록 기원 ${dday}일차...`);
        }
    } catch (e) {
        console.error(e);
        sendWebhook(
            process.env.DISCORD_WEBHOOK_URL,
            `[${new Date()}] Karaoke new song query fail.\n` +
                `debug infomation:\n` +
                `\`\`\`\n${e}\n\`\`\``
        );
    } finally {
        db.closeDB();
    }
}

checkNewSong();
