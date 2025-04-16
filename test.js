const songLogDB = require("./songLogDB");

async function main() {
    const db = new songLogDB();

    db.openDB();

    console.log(await db.getDDay());
    db.closeDB();
}

main();
