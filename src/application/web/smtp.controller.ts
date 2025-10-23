import { Request, Response } from 'express';
import * as smtpService from '../../domain/services/smtp.services';

export async function handleSaveConfig(req: Request, res: Response) {
    try {
        const config = await smtpService.saveConfig(req.body);
        res.status(200).json({ message: 'Configuração guardada com sucesso!', id: config.configId });
    } catch (error) {
        res.status(500).json({ message: 'Falha ao guardar a configuração.' , error});
    }
}

export async function handleGetConfig(req: Request, res: Response) {
    try {
        const config = await smtpService.getConfig('default'); // Simplificando para uma config global
        if (!config) return res.status(404).json({ error: 'Configuração não encontrada.' });
        
        // Não devolver a palavra-passe na API GET
        const { pass, ...safeConfig } = config.toObject();
        res.status(200).json(safeConfig);
    } catch (error) {
        res.status(500).json({ message: 'Falha ao obter a configuração.', error });
    }
}

export async function handleTestConfig(req: Request, res: Response) {
    try {
        const { recipientEmail } = req.body;
        if (!recipientEmail) {
            return res.status(400).json({ error: 'O e-mail do destinatário é obrigatório.' });
        }
        await smtpService.sendTestEmail('default', recipientEmail);
        res.status(200).json({ message: `E-mail de teste enviado com sucesso para ${recipientEmail}.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Falha ao enviar o e-mail de teste. Verifique as credenciais e a configuração.',  error });
    }
}