const Twitter = require("./createTweet");
const { getNewSongKY, getNewSongTJ, TYPE } = require("./getKaraokeNewSong");
const sendWebhook = require("./sendWebhook");
const songLogDB = require("./songLogDB");
const Tweet = new Twitter(process.env.X_CT0_TOKEN, process.env.X_AUTH_TOKEN);

async function checkNewSong() {
    const db = new songLogDB();

    try {
        db.openDB();
        await db.initializeTable();

        let date = new Date();
        if (await db.isSent(date)) return;

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

        /**
         * @type {import('./getKaraokeNewSong').songInfo[]}
         */
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
            console.log(`신곡 ${needNotify.length}개 발견`);
            Tweet.createTweet(
                "신곡 떴나????\n\n" +
                    needNotify
                        .map((e) => {
                            return `[${e.type === TYPE.TJ ? "TJ" : "금영"} | ${
                                e.songId
                            }] ${e.title} (가수: ${e.singer}, 작곡: ${
                                e.composer
                            }, 작사: ${e.writer})`;
                        })
                        .join("\n") +
                    "\n#まふまふ #마후마후 #노래방 #신곡 #TJ #금영"
            );
        } else {
            console.log("신곡 없음");
            let dday = await db.getDDay();
            Tweet.createTweet(
                `마후마후 신곡 노래방 등록 기원 ${dday}일차\n` +
                    `#まふまふ #마후마후 #노래방 #신곡 #TJ #금영`
            );
        }

        db.setSent(date);
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

function interval() {
    let date = new Date();
    if (date.getHours() == 0 && date.getMinutes() == 0) {
        checkNewSong();
    }
    setTimeout(interval, 1000 * 60);
}

checkNewSong();
interval();

Buffer.byteLength("asdf", "");
