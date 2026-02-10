import { useState } from "react";
import { useLanguage } from "../LanguageContext";
import { type HerbBox } from "../mockData";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

interface ChatbotProps {
  currentBox?: HerbBox | null;
}

interface Message {
  id: string;
  type: "user" | "bot";
  text: string;
}

export function Chatbot({ currentBox }: ChatbotProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const getQuestions = () => {
    const questions = [];
    
    if (currentBox) {
      if (currentBox.status === "SAFE") {
        questions.push({ key: "safe", text: t("chatbotQuestion_safe") });
      }
      if (currentBox.status === "RECALLED") {
        questions.push({ key: "recall", text: t("chatbotQuestion_recall") });
      }
      if (currentBox.herbName === "Tulsi") {
        questions.push({ key: "tulsi", text: t("chatbotQuestion_tulsi") });
      }
    } else {
      questions.push({ key: "safe", text: t("chatbotQuestion_safe") });
      questions.push({ key: "tulsi", text: t("chatbotQuestion_tulsi") });
    }

    return questions;
  };

  const handleQuestion = (key: string, questionText: string) => {
    const newUserMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      text: questionText,
    };

    let answerKey = `chatbotAnswer_${key}`;
    const answer = t(answerKey);

    const newBotMessage: Message = {
      id: `bot-${Date.now()}`,
      type: "bot",
      text: answer,
    };

    setMessages((prev) => [...prev, newUserMessage, newBotMessage]);
  };

  const questions = getQuestions();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        data-testid="button-chatbot-trigger"
        className={`
          fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg
          bg-emerald-500 hover:bg-emerald-400 transition-all duration-300
          flex items-center justify-center
          ${isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"}
        `}
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>

      <div
        className={`
          fixed bottom-6 right-6 z-50 w-[calc(100%-3rem)] max-w-sm
          bg-white dark:bg-slate-900/95 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl
          transition-all duration-300 origin-bottom-right
          ${isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"}
        `}
        data-testid="panel-chatbot"
      >
        <div className="flex items-center justify-between gap-4 p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            </div>
            <span className="font-semibold text-slate-900 dark:text-slate-50">{t("chatbotTitle")}</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            data-testid="button-close-chatbot"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="h-64 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Bot className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t("chatbotWelcome")}
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2 ${msg.type === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                  ${msg.type === "user" ? "bg-slate-200 dark:bg-slate-700" : "bg-emerald-500/10"}
                `}>
                  {msg.type === "user" ? (
                    <User className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                  ) : (
                    <Bot className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                  )}
                </div>
                <div 
                  className={`
                    max-w-[80%] rounded-2xl px-3 py-2 text-sm
                    ${msg.type === "user" 
                      ? "bg-emerald-500 text-white rounded-tr-sm" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-sm"
                    }
                  `}
                  data-testid={`message-${msg.type}-${msg.id}`}
                >
                  {msg.text}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{t("quickQuestions")}</p>
          <div className="flex flex-wrap gap-2">
            {questions.map((q) => (
              <button
                key={q.key}
                onClick={() => handleQuestion(q.key, q.text)}
                data-testid={`button-question-${q.key}`}
                className="inline-flex items-center rounded-full border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-emerald-500/50 transition"
              >
                {q.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
