import { InMemoryDbService } from 'angular-in-memory-web-api';
import { ChatDB } from './chat-db';

export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    return { 
      'contacts': ChatDB.contacts,
      'chat-collections': ChatDB.chatCollection,
      'chat-user': ChatDB.user
    }
  }
}