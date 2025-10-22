import { EmailNotificationPayload, IEmailNotificationService } from "../../domain/services/INotificationService";
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import { getConfig } from "../../domain/services/smtp.services";
dotenv.config();

export class EmailNotificationService implements IEmailNotificationService {

    constructor() { }

    async send(payload: EmailNotificationPayload): Promise<void> {
        
        console.log(`[EmailService] Enviando alerta por e-mail para ${payload.recipientEmail}`);
        const configId = payload.configId || 'default';
        const config = await getConfig(configId);
        if (!config) {
            throw new Error(`Configuração SMTP com ID '${configId}' não encontrada.`);
        }

        const transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: { user: config.user, pass: config.pass },
        });

        const mailOptions = {
            from: `Sistema de Monitoramento" <${process.env.EMAIL_USER}}>`,
            to: payload.recipientEmail,
            subject: `🚨 Alerta: Problema no endpoint ${payload.endpointName}`,
            html: `
                    <h1>Alerta de Performance</h1>
                    <p>O endpoint <strong>${payload.endpointName}</strong> (${payload.endpointUrl}) ultrapassou um limite de monitoramento.</p>
                    <ul>
                        <li><strong>Métrica:</strong> ${payload.metric}</li>
                        <li><strong>Valor Registrado:</strong> ${payload.value}</li>
                        <li><strong>Limite Definido:</strong> ${payload.threshold}</li>
                    </ul>
                    <p>Por favor, verifique o status do serviço.</p>
                `,
        }

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EmailService] E-mail enviado: ${info.messageId}`);
        console.log(`[EmailService] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
}