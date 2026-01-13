import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, Send, Sparkles, TrendingUp, Package, BarChart3, Zap, Bot, History, X, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

const suggestions = [
  { icon: TrendingUp, text: "Why is Product X ranking higher this week?" },
  { icon: Package, text: "Which products need inventory attention?" },
  { icon: BarChart3, text: "Explain the recommendation algorithm" },
  { icon: Zap, text: "What are the top performing categories?" },
];

const AskAI = () => {
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>(() => {
    const stored = localStorage.getItem('resights_chat_history');
    return stored ? JSON.parse(stored) : [];
  });
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasProcessedQuery = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle query from navigation state (e.g., from Item Inspector)
  useEffect(() => {
    const state = location.state as { query?: string } | null;
    if (state?.query && !hasProcessedQuery.current) {
      hasProcessedQuery.current = true;
      // Clear the state to prevent re-processing
      window.history.replaceState({}, document.title);
      // Trigger the query
      setTimeout(() => {
        handleSend(state.query);
      }, 100);
    }
  }, [location.state]);

  useEffect(() => {
    if (messages.length > 0 && currentSessionId) {
      const updatedHistory = chatHistory.map((session) =>
        session.id === currentSessionId
          ? { ...session, messages, title: messages[0]?.content.slice(0, 30) + '...' }
          : session
      );
      setChatHistory(updatedHistory);
      localStorage.setItem('resights_chat_history', JSON.stringify(updatedHistory));
    }
  }, [messages, currentSessionId]);

  const startNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
    };
    setChatHistory((prev) => {
      const updated = [newSession, ...prev];
      localStorage.setItem('resights_chat_history', JSON.stringify(updated));
      return updated;
    });
    setCurrentSessionId(newSession.id);
    setMessages([]);
    setIsHistoryOpen(false);
  };

  const loadSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setIsHistoryOpen(false);
  };

  const deleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = chatHistory.filter((s) => s.id !== sessionId);
    setChatHistory(updated);
    localStorage.setItem('resights_chat_history', JSON.stringify(updated));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setMessages([]);
    }
  };

  const handleSend = async (text?: string) => {
    const messageText = text || inputValue;
    if (!messageText.trim()) return;

    // Start a new session if none exists
    if (!currentSessionId) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: messageText.slice(0, 30) + '...',
        messages: [],
        createdAt: new Date(),
      };
      setChatHistory((prev) => {
        const updated = [newSession, ...prev];
        localStorage.setItem('resights_chat_history', JSON.stringify(updated));
        return updated;
      });
      setCurrentSessionId(newSession.id);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Based on your question about "${messageText.slice(0, 50)}${messageText.length > 50 ? '...' : ''}", here's my analysis:\n\nThe recommendation engine considers multiple factors including purchase history, popularity trends, and seasonal patterns. I've analyzed the current data and can provide insights on how these factors interact to influence rankings and visibility.\n\nKey observations:\n• Product performance metrics show positive trends\n• Seasonal factors are currently neutral\n• Inventory levels are within optimal range\n\nWould you like me to dive deeper into any specific aspect?`,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-88px)] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Ask AI</h1>
              <p className="text-sm text-muted-foreground">Get intelligent insights about your recommendations</p>
            </div>
          </div>
          
          {/* History Button */}
          <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <History className="w-4 h-4" />
                History
              </Button>
            </SheetTrigger>
            <SheetContent className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center justify-between">
                  Chat History
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <Button onClick={startNewChat} className="w-full mb-4 gap-2">
                  <MessageSquare className="w-4 h-4" />
                  New Chat
                </Button>
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <div className="space-y-2 pr-4">
                    {chatHistory.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No chat history yet
                      </p>
                    ) : (
                      chatHistory.map((session) => (
                        <div
                          key={session.id}
                          onClick={() => loadSession(session)}
                          className={cn(
                            'p-3 rounded-lg cursor-pointer transition-colors group',
                            'hover:bg-secondary',
                            currentSessionId === session.id && 'bg-secondary'
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{session.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(session.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => deleteSession(session.id, e)}
                            >
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Chat Container - Full Width */}
        <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl overflow-hidden min-h-0">
          {messages.length === 0 ? (
            /* Empty State with Suggestions - No scrollbar needed */
            <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-hidden">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-6">
                <MessageSquare className="w-10 h-10 text-accent" />
              </div>
              <h2 className="text-2xl font-bold mb-2">How can I help you today?</h2>
              <p className="text-muted-foreground text-center mb-8 max-w-lg">
                Ask questions about product performance, recommendations, inventory insights, or get detailed analytics explanations.
              </p>
              
              {/* Suggestion Cards - Grid Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className="flex items-center gap-4 p-5 bg-secondary/50 hover:bg-secondary rounded-xl text-left transition-all group border border-transparent hover:border-accent/20 hover:shadow-md dark:hover:bg-secondary/80"
                  >
                    <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center flex-shrink-0 group-hover:bg-accent/10 transition-colors">
                      <suggestion.icon className="w-6 h-6 text-accent" />
                    </div>
                    <span className="text-sm font-medium group-hover:text-accent transition-colors">
                      {suggestion.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages Area */
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-6 space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-4',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-accent-foreground" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'max-w-[75%] rounded-2xl px-5 py-4',
                        message.role === 'user'
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-secondary'
                      )}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-accent">ReSights AI</span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold">You</span>
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-4 justify-start">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-accent-foreground animate-pulse" />
                    </div>
                    <div className="bg-secondary rounded-2xl px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-background/50 flex-shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-3 max-w-4xl mx-auto"
            >
              <Input
                placeholder="Ask anything about your recommendations..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 h-14 rounded-xl text-base px-5 border-2 focus-visible:border-accent"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="lg"
                className="h-14 w-14 rounded-xl"
                disabled={!inputValue.trim() || isLoading}
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground text-center mt-3">
              ReSights AI can help you understand product rankings, performance metrics, and optimization strategies.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AskAI;
