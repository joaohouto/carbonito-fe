"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowRight, Loader2, User2, Leaf } from "lucide-react"; // Importando Leaf para o logo

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
}

// Novo componente para a animação de digitação
const TypingDots = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 300); // Muda a cada 300ms
    return () => clearInterval(interval);
  }, []);

  return <span>{dots}</span>;
};

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_URL = "https://carbonito-api.fly.dev/query";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: input.trim(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");

    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: userMessage.text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erro na resposta da API");
      }

      const data = await response.json();
      const botResponseText = data.answer;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: botResponseText,
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error: unknown) {
      // Corrigido: 'any' para 'unknown'
      console.error("Erro ao enviar mensagem para a API:", error);
      let errorMessageText =
        "Desculpe, houve um erro desconhecido ao processar sua solicitação.";

      if (error instanceof Error) {
        errorMessageText = `Desculpe, houve um erro ao processar sua solicitação: ${error.message}. Por favor, tente novamente.`;
      } else if (typeof error === "string") {
        errorMessageText = `Desculpe, houve um erro ao processar sua solicitação: ${error}. Por favor, tente novamente.`;
      }

      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        sender: "bot",
        text: errorMessageText,
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Cabeçalho Fixo */}
      <header className="flex h-16 items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <Leaf className="h-6 w-6 text-lime-600" /> Carbonito
        </h1>
      </header>

      {/* Separator sob o cabeçalho (opcional, para visual) */}
      <Separator className="bg-gray-200 dark:bg-gray-700" />

      {/* Área de Mensagens - Conteúdo principal que rola */}
      <main className="flex-1 overflow-y-auto p-4 max-w-3xl mx-auto w-full">
        <div className="space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-16rem)] text-gray-500 dark:text-gray-400 text-center px-4">
              <p className="text-lg font-medium text-balance">
                Olá! Sou o <b>Carbonito</b>, seu especialista em legislação
                ambiental, Pantanal e mercado de carbono.
              </p>
              <p className="text-md mt-4">Como posso te ajudar hoje?</p>
              <div className="mt-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p className="border p-2 rounded-md bg-gray-100 dark:bg-gray-700">
                  O que é carbono e por que estão pagando por isso?
                </p>
                <p className="border p-2 rounded-md bg-gray-100 dark:bg-gray-700">
                  Sou produtor, e agora? Posso entrar nesse mercado?
                </p>
                <p className="border p-2 rounded-md bg-gray-100 dark:bg-gray-700">
                  O Pantanal vale mais preservado?
                </p>
              </div>

              <p className="text-sm mt-8 text-red-500 dark:text-red-400 font-medium">
                🚨
                <br /> O Carbonito pode errar em suas respostas, pois às vezes
                acaba a água do seu tereré. Por isso, é bom checar as respostas
                em outra fonte.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-4 ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.sender === "bot" && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage
                      src="/carbonito-avatar.png"
                      alt="Carbonito Avatar"
                    />
                    <AvatarFallback className="bg-lime-800 text-white">
                      <Leaf />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] p-4 rounded-xl shadow-sm ${
                    message.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white prose dark:prose-invert"
                  }`}
                >
                  {message.sender === "user" ? (
                    <p className="text-base leading-relaxed">{message.text}</p>
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.text}
                    </ReactMarkdown>
                  )}
                </div>
                {message.sender === "user" && (
                  <Avatar className="size-8 flex-shrink-0">
                    <AvatarImage src="/user-avatar.png" alt="User Avatar" />
                    <AvatarFallback className="bg-muted text-muted-foreground border">
                      <User2 className="size-4" /> {/* Ícone User2 do Lucide */}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start items-center mt-2 pl-2">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage
                  src="/carbonito-avatar.png"
                  alt="Carbonito Avatar"
                />
                <AvatarFallback className="bg-lime-800 text-white text-xs">
                  <Leaf className="size-4" />
                </AvatarFallback>
              </Avatar>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Carbonito está digitando
                <TypingDots />
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Área de Input Fixa na parte inferior */}
      <div className="flex flex-col items-center relative w-full border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 md:py-6">
          <div className="relative flex items-center w-full">
            <Textarea
              placeholder="Pergunte ao Carbonito..."
              className="min-h-[60px] max-h-[200px] flex-1 resize-none overflow-y-auto p-4 pr-16 rounded-xl border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 shadow-md"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || input.trim() === ""}
              size="icon"
              className="absolute right-4 bottom-3 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5 text-white" />
              ) : (
                <ArrowRight className="h-5 w-5 text-white" />
              )}
            </Button>
          </div>
        </div>

        <span className="text-xs text-muted-foreground text-center px-4 pb-4">
          O Carbonito pode cometer erros. Por isso, é bom checar as respostas.
        </span>
      </div>
    </div>
  );
}
