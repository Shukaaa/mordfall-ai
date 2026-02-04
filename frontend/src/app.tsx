import { useState, useEffect } from 'preact/hooks';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import InfoPanel from './components/InfoPanel';
import { ApiService } from './services/api';

type Message = {
  role: 'user' | 'assistant' | 'system' | string;
  content: string;
  time: string;
  coreInformations?: string[];
};

export function App() {
  const [activeCaseId, setActiveCaseId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [updateCounter, setUpdateCounter] = useState(0);
  
  const loadHistory = async (id: string | number) => {
    try {
      const data = await ApiService.getHistory(String(id));
      setMessages(data as Message[]);
    } catch (error) {
      console.error('Fehler beim Laden der Nachrichten:', error);
    }
  };
  
  useEffect(() => {
    if (activeCaseId != null) {
      loadHistory(activeCaseId);
    } else {
      setMessages([]);
    }
  }, [activeCaseId]);
  
  return (
      <div className="flex h-screen bg-zinc-900 text-zinc-100 overflow-hidden">
        <Sidebar
            onSelectCase={(id: string) => setActiveCaseId(id)}
            activeId={activeCaseId}
        />
        
        <main className="flex-1 flex flex-col border-x border-zinc-800">
          {activeCaseId != null ? (
              <ChatWindow
                  caseId={activeCaseId}
                  messages={messages}
                  onNewMessage={(newMsg: Message) => {
                    setMessages(prev => [...prev, newMsg]);
                    if (newMsg.role === 'assistant') {
                      setUpdateCounter(c => c + 1);
                    }
                  }}
              />
          ) : (
              <div className="flex-1 flex items-center justify-center text-zinc-500 italic">
                Wähle einen Fall aus der Liste links, um die Ermittlung zu starten.
              </div>
          )}
        </main>
        
        {activeCaseId != null && (
            <InfoPanel caseId={activeCaseId} lastUpdateTrigger={updateCounter} />
        )}
      </div>
  );
}
