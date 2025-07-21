import amql from "amqplib";
let channel: amql.Channel;

export const connectRabbitMQ = async () => {
  try {
    const conn = await amql.connect({
      protocol: "amqp",
      hostname: process.env.RABBITMQ_HOST,
      port: 5672,
      username: process.env.RABBITMQ_USERNAME,
      password: process.env.RABBITMQ_PASSWORD,
    });

    channel = await conn.createChannel();
    console.log("RabbitMQ Connected");
  } catch (error) {
    console.error(`Failed to connect to RabbitMQ: ${error}`);
  }
};

export const publishToQueue = async (queueName: string, message: string) => {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized");
  }
  try {
    await channel.assertQueue(queueName, { durable: true });
    await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
    console.log(`Message sent to queue: ${queueName}`);
  } catch (error) {
    console.error(`Error sending message to queue: ${error}`);
  }
};
