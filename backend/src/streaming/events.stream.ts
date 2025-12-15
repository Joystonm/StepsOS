import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';

export class EventsStream extends EventEmitter {
  private clients: Set<any> = new Set();

  addClient(client: any) {
    this.clients.add(client);
    logger.info('Client connected to events stream');
  }

  removeClient(client: any) {
    this.clients.delete(client);
    logger.info('Client disconnected from events stream');
  }

  emit(event: string, data: any) {
    const payload = {
      event,
      data,
      timestamp: new Date().toISOString()
    };

    // Broadcast to all connected clients
    this.clients.forEach(client => {
      try {
        client.send(JSON.stringify(payload));
      } catch (error) {
        logger.error(`Failed to send event to client: ${error}`);
        this.clients.delete(client);
      }
    });

    return super.emit(event, data);
  }
}

export const eventsStream = new EventsStream();
