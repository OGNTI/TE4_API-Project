import mongoose from "mongoose";

try {
    await mongoose.connect('mongodb+srv://oliverGranudden:2M8CNI1B5bRuEcEs@bunmymongo.dzh0b.mongodb.net/Company?retryWrites=true&w=majority&appName=BunMyMongo')
    const db = mongoose.connection.db;
    if (db) {
        const collections = await db.listCollections().toArray()
        collections
            ?.map((collection) => collection.name)
            .forEach(async (collectionName) => {
                await db.collection(collectionName).deleteMany({});
            })
        console.log("Done")
        // await mongoose.disconnect()
        // causing 'error: connection establishment was cancelled'
    }
} catch (e) {
    console.log("No Connection")
}