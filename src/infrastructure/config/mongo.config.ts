import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

export async function connectToDatabase() {
    const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27017/notify-db';
    try {
        await mongoose.connect(mongoURL);
        console.log('✅ Conectado ao MongoDB com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao conectar ao MongoDB:', error);
        process.exit(1);
    }
}