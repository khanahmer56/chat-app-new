import amqp from "amqplib";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();
export const startSendOtpConsumer = async () => {
    try {
        const conn = await amqp.connect({
            protocol: "amqp",
            hostname: process.env.RABBITMQ_HOST,
            port: 5672,
            username: process.env.RABBITMQ_USERNAME,
            password: process.env.RABBITMQ_PASSWORD,
        });
        const channel = await conn.createChannel();
        await channel.assertQueue("send-otp", { durable: true });
        console.log("Mail Service Consumer Started, listening for otp emals");
        await channel.consume("send-otp", async (msg) => {
            if (msg) {
                try {
                    const { to, subject, body } = JSON.parse(msg.content.toString());
                    const transporter = nodemailer.createTransport({
                        host: "smtp.gmail.com",
                        port: 465,
                        secure: true,
                        auth: {
                            user: process.env.MAIL_USERNAME,
                            pass: process.env.MAIL_PASSWORD,
                        },
                    });
                    await transporter.sendMail({
                        from: "Chat app",
                        to,
                        subject,
                        text: body,
                    });
                    console.log(`Mail sent to ${to}`);
                    channel.ack(msg);
                }
                catch (error) {
                    console.log("failed to send email", error);
                }
            }
        }, { noAck: false });
    }
    catch (error) {
        console.error(`Failed to connect to RabbitMQ: ${error}`);
    }
};
