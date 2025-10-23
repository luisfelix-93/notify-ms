import { Document, model, Model, Schema } from "mongoose";


export interface ISmtpConfig extends Document {
    configId: string;
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
}

const SmtpConfigSchema = new Schema({
    configId: { type: String, required: true, unique: true, default: 'default' },
    host: {type: String, required: true },
    port: { type: Number, required: true },
    secure: { type: Boolean, default: true },
    user: { type: String, required: true },
    pass: { type: String, required: true }
});

export const SmtpConfigModel: Model<ISmtpConfig> = model<ISmtpConfig>('SmtoConfig', SmtpConfigSchema);