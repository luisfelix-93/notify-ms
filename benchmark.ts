import { Queue } from 'bullmq';
import { io } from 'socket.io-client';

const aplicationUrl = 'http://localhost:4004';
const totalMessages = 1000;
const notificationQueueName = 'notification-queue';

const redisConnection = {
    host: 'localhost',
    port: 6379
};

const notificationQueue = new Queue(notificationQueueName, { connection: redisConnection });

async function runBenchmark() {
    const socket = io(aplicationUrl);
    let receivedMessages = 0;

    socket.on('connect', () => {
        console.log('[Benchmark] Conectado ao servidor WebSocket.');
    });

    socket.on('push-notification', (data) => {
        receivedMessages++;
        if (receivedMessages === totalMessages) {
            const endTime = Date.now();
            const totalTime = (endTime - startTime) / 1000;
            console.log(`[Benchmark] Todas as ${totalMessages} notificações foram recebidas.`);
            console.log(`[Benchmark] Tempo total: ${totalTime} segundos.`);
            console.log(`[Benchmark] Vazão: ${totalMessages / totalTime} notificações por segundo.`);
            socket.disconnect();
            process.exit(0);
        }
    });

    console.log(`[Benchmark] Enviando ${totalMessages} mensagens para a fila...`);
    const startTime = Date.now();

    for (let i = 0; i < totalMessages; i++) {
        await notificationQueue.add('notification-job', {
            testId: `test-${i}`,
            message: `Notificação de conclusão do teste ${i}`
        });
    }

    console.log('[Benchmark] Todas as mensagens foram enviadas para a fila.');
}

runBenchmark();
