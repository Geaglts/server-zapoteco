import mongoose from "mongoose";

const palabraUri = process.env.MONGODB_PALABRA_URI;

export default mongoose
    .connect(palabraUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
    })
    .then(() => {
        console.log("db status (conectado): ╰( ͡° ͜ʖ ͡° )つ──☆*:・ﾟ");
    })
    .catch((e) => {
        console.log("db status (no conectado): ( ཀ ʖ̯ ཀ)");
    });
