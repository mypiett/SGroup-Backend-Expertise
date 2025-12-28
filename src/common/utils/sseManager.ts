import { Response } from 'express';

interface SSEClient {
  id: string;
  userId: string;
  response: Response;
}

class SSEManager {
  private clients: Map<string, SSEClient> = new Map();

  addClient(clientId: string, userId: string, res: Response): void {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    res.write(`data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`);

    const client: SSEClient = {
      id: clientId,
      userId,
      response: res,
    };

    this.clients.set(clientId, client);

    // Remove client on close
    res.on('close', () => {
      this.removeClient(clientId);
    });
  }

  removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      this.clients.delete(clientId);
      console.log(`SSE client disconnected: ${clientId}`);
    }
  }

  sendToUser(userId: string, data: any): void {
    this.clients.forEach((client) => {
      if (client.userId === userId) {
        this.sendEvent(client.response, 'notification', data);
      }
    });
  }

  sendToUsers(userIds: string[], data: any): void {
    userIds.forEach((userId) => {
      this.sendToUser(userId, data);
    });
  }

  private sendEvent(res: Response, eventType: string, data: any): void {
    try {
      res.write(`event: ${eventType}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      console.error('Error sending SSE event:', error);
    }
  }

  getClientCount(): number {
    return this.clients.size;
  }

  getUserClientCount(userId: string): number {
    let count = 0;
    this.clients.forEach((client) => {
      if (client.userId === userId) {
        count++;
      }
    });
    return count;
  }

  sendHeartbeat(): void {
    this.clients.forEach((client) => {
      try {
        client.response.write(`: heartbeat\n\n`);
      } catch (error) {
        this.removeClient(client.id);
        console.error('Error sending heartbeat:', error);
      }
    });
  }
}

export const sseManager = new SSEManager();

setInterval(() => {
  sseManager.sendHeartbeat();
}, 30000);
