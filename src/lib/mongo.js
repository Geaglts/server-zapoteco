import mongoose from "mongoose";
import { config } from "../config";

export default mongoose
    .connect(config.isDev ? config.localMongoUri : config.prodMongoUri, {
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
