import { Bot as Grammy, InlineKeyboard } from "../deps.ts";

const env = Deno.env.toObject();

export type Channel = {
  chatId: string | number;
  threadId?: string | number;
}

export class Bot {
  private _channels: Channel[] = [];
  private _instance: Grammy;

  constructor(token: string = env["TOKEN"], channel: string = "") {
    if (!token) {
      throw new Error("No token provided");
    } else {
      this._instance = new Grammy(token);
    }

    if (channel) {
      this._channels.push({ chatId: channel });
    }

    if (env["WEBHOOK"]) {
      this._channels.push({ chatId: env["WEBHOOK"]!, threadId: env["THREAD_ID"] || undefined});
    }
  }

  public addChannel(channel: Channel) {
    this._channels.push(channel);
  }

  /**
   * Send a message to a channel
   * @param channel Channel to send notification
   * @param message Message to deliver to the channel
   * @param link Some link to attach to the message
   * @returns void
   */
  public async send(channel: Channel, message: string, link?: string) {
    let others = {
      parse_mode: "HTML",
    };

    if (channel.threadId) {
      others.message_thread_id = channel.threadId;
    }

    if (!link) {
      return await this._instance.api.sendMessage(channel.chatId, message, others);
    } else {
      return await this._instance.api.sendMessage(channel.chatId, message, {
        ...others,
        reply_markup: new InlineKeyboard().url("View it on GitHub", link),
      });
    }
  }

  /**
   * Send a message to all channels
   * @param message Message to deliver to the channel
   * @param link Some link to attach to the message
   */
  public async push(message: string, link = "") {
    for (const channel of this._channels) {
      await this.send(channel, message, link);
    }
  }
}

export default new Bot();
