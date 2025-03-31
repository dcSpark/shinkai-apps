import { create } from 'zustand';

type WebSocketConnection = {
  inboxId: string;
  refCount: number;
};

type WebSocketStore = {
  connections: WebSocketConnection[];
  addConnection: (inboxId: string) => void;
  removeConnection: (inboxId: string) => void;
  hasConnection: (inboxId: string) => boolean;
  getRefCount: (inboxId: string) => number;
};

export const useWebSocketStore = create<WebSocketStore>((set, get) => ({
  connections: [],
  
  addConnection: (inboxId: string) => {
    if (!inboxId) return;
    
    set((state) => {
      const existingConnection = state.connections.find(
        (conn) => conn.inboxId === inboxId
      );
      
      if (existingConnection) {
        return {
          connections: state.connections.map((conn) =>
            conn.inboxId === inboxId
              ? { ...conn, refCount: conn.refCount + 1 }
              : conn
          ),
        };
      } else {
        return {
          connections: [...state.connections, { inboxId, refCount: 1 }],
        };
      }
    });
  },
  
  removeConnection: (inboxId: string) => {
    if (!inboxId) return;
    
    set((state) => {
      const existingConnection = state.connections.find(
        (conn) => conn.inboxId === inboxId
      );
      
      if (existingConnection && existingConnection.refCount > 1) {
        return {
          connections: state.connections.map((conn) =>
            conn.inboxId === inboxId
              ? { ...conn, refCount: conn.refCount - 1 }
              : conn
          ),
        };
      } else {
        return {
          connections: state.connections.filter(
            (conn) => conn.inboxId !== inboxId
          ),
        };
      }
    });
  },
  
  hasConnection: (inboxId: string) => {
    if (!inboxId) return false;
    return get().connections.some((conn) => conn.inboxId === inboxId);
  },
  
  getRefCount: (inboxId: string) => {
    if (!inboxId) return 0;
    const connection = get().connections.find(
      (conn) => conn.inboxId === inboxId
    );
    return connection ? connection.refCount : 0;
  },
}));
