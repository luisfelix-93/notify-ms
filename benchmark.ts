import { Queue } from 'bullmq';
import { io } from 'socket.io-client';

const aplicationUrl = 'http://localhost:4004';
const totalMessages = 10;
const notificationQueueName = 'notification-queue';
const alertQueueName = 'alert-queue';

const redisConnection = {
    host: 'localhost',
    port: 6379
};

const notificationQueue = new Queue(notificationQueueName, { connection: redisConnection });
const alertQueue = new Queue(alertQueueName, { connection: redisConnection });

async function runBenchmark() {
    const socket = io(aplicationUrl);
    let receivedMessages = 0;
    const expectedMessages = totalMessages / 2;

    socket.on('connect', () => {
        console.log('[Benchmark] Conectado ao servidor WebSocket.');
    });

    socket.on('push-notification', (data) => {
        receivedMessages++;
        if (receivedMessages === expectedMessages) {
            const endTime = Date.now();
            const totalTime = (endTime - startTime) / 1000;
            console.log(`[Benchmark] Todas as ${expectedMessages} notificações foram recebidas.`);
            console.log(`[Benchmark] Tempo total: ${totalTime} segundos.`);
            console.log(`[Benchmark] Vazão: ${expectedMessages / totalTime} notificações por segundo.`);
            socket.disconnect();
            process.exit(0);
        }
    });

    console.log(`[Benchmark] Enviando ${totalMessages} mensagens para as filas...`);
    const startTime = Date.now();

    for (let i = 0; i < totalMessages; i++) {
        if (i % 2 === 0) {
            await notificationQueue.add('notification-job', {
                testId: `test-${i}`,
                message: `Notificação de conclusão do teste ${i}`
            });
        } else {
            await alertQueue.add('alert-job', {
                recipientEmail: 'test@test.com',
                endpointName: 'test-endpoint',
                endpointUrl: 'http://test.com',
                metric: 'latency',
                value: 100,
                threshold: 80
            });
        }
    }

    console.log('[Benchmark] Todas as mensagens foram enviadas para as filas.');
}

runBenchmark();