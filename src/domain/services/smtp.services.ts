import { SmtpConfigModel, ISmtpConfig } from '../models/smtp.model';
import { encrypt, decrypt } from '../../infrastructure/lib/crypto';
import nodemailer from 'nodemailer';

export async function saveConfig(data: Omit<ISmtpConfig, 'pass'> & { pass: string }) {
    const { configId = 'default', host, port, secure, user, pass } = data;
    const encryptedPass = encrypt(pass);

    const updatePayload = {
        $set: {
            host,
            port,
            secure,
            user,
            pass: encryptedPass
        }
    };

    try {
        const config = await SmtpConfigModel.findOneAndUpdate(
            { configId },      // Query: Encontre pelo configId
            updatePayload,     // Update: Use $set para atualizar os campos
            { new: true, upsert: true } // Options: Retorne o novo doc, crie se não existir
        );
        console.log("Configuração SMTP guardada/atualizada:", config);
        return config;
    } catch (error) {
        console.error("Erro detalhado ao guardar config SMTP:", error);
        throw error; // Re-lança o erro para ser capturado pelo controller
    }
}

export async function getConfig(configId: string = 'default'): Promise<ISmtpConfig | null> {
    const config = await SmtpConfigModel.findOne({ configId });
    if (config) {
        config.pass = decrypt(config.pass); // Desencripta para uso
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