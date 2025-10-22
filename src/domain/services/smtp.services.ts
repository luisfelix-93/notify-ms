import { decrypt, encrypt } from "../../infrastructure/lib/crypto";
import nodemailer from 'nodemailer';
import { ISmtpConfig, SmtpConfigModel } from "../models/smtp.model";

export async function saveConfig(data: Omit<ISmtpConfig, 'pass'> & { pass: string}) {
    const { configId = 'default', host, port, secure, user, pass} = data;

    const config = await SmtpConfigModel.findByIdAndUpdate(
        { configId },
        { host, port, secure, user, pass: encrypt(pass) },
        { new: true, upsert: true },
    );

    return config;
}

export async function getConfig(configId: string = 'default'): Promise<ISmtpConfig | null> {
    const config = await SmtpConfigModel.findOne({ configId });
    if (config) {
        config.pass = decrypt(config.pass);
    }
    return config;
}

export async function sendTestEmail(configId: string, recipientEmail: string) {
    const config = await getConfig(configId);
    if (!config) {
        throw new Error('Configuração SMTP não encontrada.');
    }

    const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: { user: config.user, pass: config.pass },
    });

    await transporter.sendMail({
        from: `"${config.user}" <${config.user}>`,
        to: recipientEmail,
        subject: '✅ Teste de Conexão SMTP',
        text: 'A sua configuração SMTP está a funcionar corretamente!',
    });
}