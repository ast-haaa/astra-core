import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Mic, MicOff, Volume2, X, Loader, Languages } from "lucide-react";
import { useAuth, type Language } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const roleSpecificSuggestionsKeys: Record<string, string[]> = {
  Farmer: ["howAppWorks", "howAddBox", "whatRecall", "whyTriphalaRecalled", "howRespondAlerts"],
  "Lab Tester": ["howAddHerb", "howUploadReport", "whatRecalledMean", "labTestingWork", "whenRecallBatch"],
  Consumer: ["isSafe", "whatTraceability", "whyRecalled", "whatTriphala", "trustProduct"],
};

const suggestionLabels: Record<string, Record<string, string>> = {
  EN: { quickQuestions: "Quick Questions", placeholder: "Ask me anything..." },
  HI: { quickQuestions: "तेज़ सवाल", placeholder: "कुछ भी पूछें..." },
  MR: { quickQuestions: "द्रुत प्रश्न", placeholder: "कुछ भी विचारा..." },
  GU: { quickQuestions: "ઝડપી પ્રશ્નો", placeholder: "કઈ પણ પૂછો..." },
  PA: { quickQuestions: "ਤੇਜ਼ ਸਵਾਲ", placeholder: "ਕੁਝ ਵੀ ਪੁੱਛੋ..." },
};

const knowledgeBase: Record<string, Record<string, string>> = {
  EN: {
    howAppWorks: "HerbTrace is an IoT-enabled herb storage monitoring system. It tracks temperature and humidity in real-time to ensure your herbs maintain quality. The app shows your storage boxes, alerts you to any issues, and helps you manage your herb inventory safely.",
    howAddBox: "To add a box: 1) Tap 'Add New Storage Box' from the home page. 2) Scan or enter the Box ID. 3) Select the herb type and storage location. 4) Set expected temperature and humidity ranges. 5) Tap 'Register & Activate Box' to complete.",
    whatRecall: "A recall is when a box of herbs is removed from active monitoring due to unsafe conditions. This happens when temperature/humidity issues persist despite multiple attempts to fix them. A recalled box must be physically inspected and restored before resuming use.",
    whyTriphalaRecalled: "Triphala may be recalled if moisture levels exceed safe thresholds, causing mold or contamination risk. Proper storage at 20-25°C and 40-60% humidity prevents recalls.",
    howRespondAlerts: "When you receive an alert: 1) Check the alert details to understand the issue. 2) For high temperature: Turn on Peltier cooling. 3) For low humidity: Turn on Peltier cooling. 4) For sensor issues: Check the device connection. 5) Mark as resolved once fixed.",
    howAddHerb: "To add a new herb: 1) Go to your storage box details. 2) Tap 'Add New Herb'. 3) Enter herb name and scientific name. 4) Select category (leaf, root, powder, mix). 5) Set expected storage conditions. 6) Save the herb profile.",
    howUploadReport: "Lab test uploads help verify herb quality. Include moisture content, microbial count, and purity analysis. Upload reports through your storage box profile to maintain compliance records.",
    whatRecalledMean: "Recalled means the batch failed quality or safety standards and is removed from the supply chain. For herbs, this typically means moisture, contamination, or storage condition failures.",
    labTestingWork: "Lab testing measures herb quality through: moisture content analysis, microbial testing, pesticide screening, and identity verification. Results ensure the product meets safety standards.",
    whenRecallBatch: "Recall a batch when: repeated temperature/humidity failures occur despite corrections, contamination is detected, or lab tests show quality issues. The app will suggest recall when fix attempts fail multiple times.",
    isSafe: "HerbTrace ensures product safety through continuous monitoring, quality testing, and traceability. You can verify any product's journey from storage to sale using the product ID.",
    whatTraceability: "Traceability lets you see the complete journey of an herb: where it was stored, temperature and humidity history, lab test results, and when it was packaged. This ensures complete transparency.",
    whyRecalled: "Products are recalled when safety concerns arise. HerbTrace helps prevent this by monitoring storage conditions and alerting when issues occur, ensuring herbs reach you in perfect condition.",
    whatTriphala: "Triphala is a traditional Ayurvedic blend of three fruits: Amalaki, Bibhitaki, and Haritaki. Used for digestive health and immunity. Requires storage at 20-25°C and 40-60% humidity to maintain potency.",
    trustProduct: "Trust HerbTrace products because: they're continuously monitored, all storage conditions are recorded, lab testing verifies quality, and complete traceability shows the product's journey.",
    assistantIntro: "Hi! I'm your HerbTrace Smart Assistant. I can help you understand the app, answer questions about herbs, explain lab testing, and guide you through storage best practices. Ask me anything!",
  },
  HI: {
    howAppWorks: "हर्बट्रेस एक IoT-सक्षम जड़ी-बूटी भंडारण निगरानी प्रणाली है। यह रीयल-टाइम में तापमान और आर्द्रता को ट्रैक करता है ताकि आपकी जड़ी-बूटियाँ गुणवत्ता बनाए रखें। ऐप आपके भंडारण बॉक्स दिखाता है, किसी भी समस्या के लिए आपको सतर्क करता है।",
    howAddBox: "बॉक्स जोड़ने के लिए: 1) होम पेज से 'नया स्टोरेज बॉक्स जोड़ें' टैप करें। 2) बॉक्स आईडी स्कैन या दर्ज करें। 3) जड़ी-बूटी प्रकार चुनें। 4) अपेक्षित तापमान और आर्द्रता सेट करें। 5) पूरा करने के लिए 'रजिस्टर करें' टैप करें।",
    whatRecall: "रिकॉल तब होता है जब कोई बॉक्स असुरक्षित स्थितियों के कारण सक्रिय निगरानी से हटा दिया जाता है। यह तब होता है जब तापमान/आर्द्रता समस्याएं कई सुधार प्रयासों के बाद भी रहती हैं।",
    whyTriphalaRecalled: "त्रिफला को रिकॉल किया जा सकता है यदि नमी की मात्रा सुरक्षित सीमा से अधिक हो। 20-25°C और 40-60% आर्द्रता पर उचित भंडारण रिकॉल को रोकता है।",
    howRespondAlerts: "अलर्ट प्राप्त होने पर: 1) अलर्ट विवरण जांचें। 2) उच्च तापमान के लिए: पेल्टियर कूलिंग चालू करें। 3) कम आर्द्रता के लिए: पेल्टियर कूलिंग चालू करें। 4) ठीक होने पर 'समाधान' चिह्नित करें।",
    howAddHerb: "नई जड़ी-बूटी जोड़ने के लिए: 1) अपने बॉक्स विवरण पर जाएं। 2) 'नई जड़ी-बूटी जोड़ें' टैप करें। 3) नाम दर्ज करें। 4) श्रेणी चुनें। 5) भंडारण शर्तें सेट करें। 6) सहेजें।",
    howUploadReport: "लैब परीक्षण रिपोर्ट जड़ी-बूटी की गुणवत्ता सत्यापित करती हैं। नमी सामग्री, सूक्ष्मजीव गणना, और शुद्धता विश्लेषण शामिल करें।",
    whatRecalledMean: "रिकॉल का अर्थ है बैच गुणवत्ता या सुरक्षा मानदंडों में विफल हुआ और आपूर्ति श्रृंखला से हटाया गया।",
    labTestingWork: "लैब परीक्षण जड़ी-बूटी की गुणवत्ता को मापता है: नमी विश्लेषण, सूक्ष्मजीव परीक्षण, कीटनाशक स्क्रीनिंग, और पहचान सत्यापन।",
    whenRecallBatch: "जब दोहराई गई विफलताएं हों, या प्रदूषण पता चले, या लैब परीक्षण गुणवत्ता समस्याएं दिखाएं तो बैच को रिकॉल करें।",
    isSafe: "हर्बट्रेस निरंतर निगरानी, गुणवत्ता परीक्षण, और पूर्ण पता लगाने योग्यता के माध्यम से सुरक्षा सुनिश्चित करता है।",
    whatTraceability: "ट्रेसेबिलिटी आपको जड़ी-बूटी की पूरी यात्रा दिखाती है: भंडारण स्थान, तापमान इतिहास, परीक्षण परिणाम, पैकेजिंग समय।",
    whyRecalled: "जब सुरक्षा चिंताएं उत्पन्न हों तो उत्पादों को रिकॉल किया जाता है। हर्बट्रेस निगरानी करके इसे रोकने में मदद करता है।",
    whatTriphala: "त्रिफला तीन फलों का एक पारंपरिक आयुर्वेदिक मिश्रण है। पाचन स्वास्थ्य के लिए उपयोग किया जाता है। 20-25°C और 40-60% आर्द्रता पर भंडारण आवश्यक है।",
    trustProduct: "हर्बट्रेस उत्पादों पर विश्वास करें क्योंकि: वे निरंतर निगरानी में हैं, सभी स्थितियां दर्ज हैं, परीक्षण गुणवत्ता सत्यापित करते हैं, और पूरी यात्रा स्पष्ट है।",
    assistantIntro: "नमस्ते! मैं हर्बट्रेस स्मार्ट सहायक हूं। मैं आपको ऐप समझने, जड़ी-बूटियों के बारे में सवालों का जवाब देने, और भंडारण में मदद कर सकता हूं।",
  },
  MR: {
    howAppWorks: "हर्बट्रेस हे IoT-सक्षम औषधी भंडारण निरीक्षण प्रणाली आहे.",
    howAddBox: "बॉक्स जोडण्यासाठी: 1) होमवरून 'नवीन स्टोरेज बॉक्स जोडा' टॅप करा.",
    whatRecall: "रिकॉल हे तेव्हा होते जेव्हा बॉक्स असुरक्षित परिस्थितीत काढून टाकला जाते.",
    whyTriphalaRecalled: "त्रिफळा रिकॉल होऊ शकते जर आर्द्रता जास्त असेल.",
    howRespondAlerts: "अलर्ट आल्यास: 1) अलर्ट तपशील तपासा.",
    howAddHerb: "नवीन औषध जोडण्यासाठी: 1) तुमचे बॉक्स तपशील उघडा.",
    howUploadReport: "लॅब रिपोर्ट औषधीची गुणवत्ता सत्यापित करतात.",
    whatRecalledMean: "रिकॉल म्हणजे बॅच गुणवत्ता परीक्षेत अपयशस्वी झाला.",
    labTestingWork: "लॅब परीक्षण औषधीची गुणवत्ता मापते.",
    whenRecallBatch: "जेव्हा पुनरावृत्ती समस्या येत असतील तेव्हा रिकॉल करा.",
    isSafe: "हर्बट्रेस निरंतर निरीक्षण करते.",
    whatTraceability: "पता लगावन्यता तुम्हाला औषधीची संपूर्ण यात्रा दाखवते.",
    whyRecalled: "जेव्हा सुरक्षा समस्या येत असतील तेव्हा उत्पादन रिकॉल होतात.",
    whatTriphala: "त्रिफळा हे तीन फळांचे पारंपरिक आयुर्वेदिक मिश्रण आहे.",
    trustProduct: "हर्बट्रेस उत्पादनांवर विश्वास ठेवा.",
    assistantIntro: "नमस्कार! मी हर्बट्रेस स्मार्ट सहायक आहे.",
  },
  GU: {
    howAppWorks: "હર્બટ્રેસ IoT-સક્ષમ જડીબુટ્ટી ગોદામ નિરીક્ષણ પ્રણાલી છે.",
    howAddBox: "બોક્સ ઉમેરવા માટે: 1) હોમ પેજ પર 'નવું ગોદામ બોક્સ ઉમેરો' ટૅપ કરો.",
    whatRecall: "રિકૉલ ત્યારે થાય છે જ્યારે બોક્સ અસુરક્ષિત સ્થિતિ કારણે દૂર કરવામાં આવે.",
    whyTriphalaRecalled: "ત્રિફળ રિકૉલ થઈ શકે જો ભેજ વધુ હોય.",
    howRespondAlerts: "સતર્કતા આવે તો: 1) સતર્કતા વિગતો તપાસો.",
    howAddHerb: "નવી જડીબુટ્ટી ઉમેરવા માટે: 1) તમારો બોક્સ વિગતો ખોલો.",
    howUploadReport: "લૅબ રિપોર્ટ જડીબુટ્ટીની ગુણવત્તા ચકાસે છે.",
    whatRecalledMean: "રિકૉલ એટલે બેચ ગુણવત્તા પરીક્ષામાં નિષ્ફળ હોય.",
    labTestingWork: "લૅબ પરીક્ષણ જડીબુટ્ટીની ગુણવત્તા માપે છે.",
    whenRecallBatch: "જ્યારે પુનરાવર્તિત સમસ્યાઓ આવે ત્યારે બેચ રિકૉલ કરો.",
    isSafe: "હર્બટ્રેસ સતત નિરીક્ષણ કરે છે.",
    whatTraceability: "ટ્રેસેબિલિટી તમને જડીબુટ્ટીની સંપૂર્ણ યાત્રા બતાવે છે.",
    whyRecalled: "જ્યારે સુરક્ષા ચિંતાઓ આવે ત્યારે ઉત્પાદો રિકૉલ કરવામાં આવે છે.",
    whatTriphala: "ત્રિફળ ત્રણ ફળોનું પરંપરાગત આયુર્વેદિક મિશ્રણ છે.",
    trustProduct: "હર્બટ્રેસ ઉત્પાદોમાં વિશ્વાસ રાખો.",
    assistantIntro: "નમસ્તે! હું હર્બટ્રેસ સ્માર્ટ સહાયક છું.",
  },
  PA: {
    howAppWorks: "HerbTrace ਇਕ IoT-ਸਮਰਥ ਜੜੀ-ਬੂਟੀ ਸਟੋਰੇਜ ਨਿਗਰਾਨੀ ਪ੍ਰਣਾਲੀ ਹੈ।",
    howAddBox: "ਬਾਕਸ ਜੋੜਨ ਲਈ: 1) ਮੁੱਖ ਪੰਨੇ ਤੋਂ 'ਨਵੀਂ ਸਟੋਰੇਜ ਬਾਕਸ ਜੋੜੋ' ਟੈਪ ਕਰੋ।",
    whatRecall: "ਵਾਪਸੀ ਉਦੋਂ ਹੁੰਦੀ ਹੈ ਜਦੋਂ ਕੋਈ ਬਾਕਸ ਅਸੁਰੱਖਿਆ ਸ਼ਰਤਾਂ ਦੇ ਕਾਰਨ ਹਟਾ ਦਿੱਤਾ ਜਾਂਦਾ ਹੈ।",
    whyTriphalaRecalled: "ਤ੍ਰਿਫਲਾ ਵਾਪਸ ਹੋ ਸਕਦਾ ਹੈ ਜੇ ਨਮੀ ਬਹੁਤ ਜ਼ਿਆਦਾ ਹੋ।",
    howRespondAlerts: "ਜਦੋਂ ਸਚੇਤ ਆਵੇ: 1) ਸਚੇਤ ਵਿਸਥਾਰ ਦੇਖੋ।",
    howAddHerb: "ਨਵੀ ਜੜੀ-ਬੂਟੀ ਜੋੜਨ ਲਈ: 1) ਆਪਣਾ ਬਾਕਸ ਵਿਸਥਾਰ ਖੋਲੋ।",
    howUploadReport: "ਲੈਬ ਰਿਪੋਰਟ ਜੜੀ-ਬੂਟੀ ਦੀ ਗੁਣਵਤਾ ਦੀ ਪੁਸ਼ਟੀ ਕਰਦੇ ਹਨ।",
    whatRecalledMean: "ਵਾਪਸੀ ਦਾ ਅਰਥ ਹੈ ਬੈਚ ਗੁਣਵਤਾ ਵਿੱਚ ਵਿਫਲ ਹਯ।",
    labTestingWork: "ਲੈਬ ਟੈਸਟਿੰਗ ਜੜੀ-ਬੂਟੀ ਦੀ ਗੁਣਵਤਾ ਮਾਪਦਾ ਹੈ।",
    whenRecallBatch: "ਜਦੋਂ ਦੁਹਰਾਈ ਸਮੱਸਿਆ ਆਵੇ ਤਾਂ ਵਾਪਸ ਕਰੋ।",
    isSafe: "HerbTrace ਲਗਾਤਾਰ ਨਿਗਰਾਨੀ ਕਰਦਾ ਹੈ।",
    whatTraceability: "ਪ੍ਰਬੰਧਨਯੋਗਤਾ ਤੁਹਾਨੂੰ ਜੜੀ-ਬੂਟੀ ਦੀ ਪੂਰੀ ਯਾਤਰਾ ਦਿਖਾਉਂਦੀ ਹੈ।",
    whyRecalled: "ਜਦੋਂ ਸੁਰੱਖਿਆ ਚਿੰਤਾ ਆਵੇ ਤਾਂ ਉਤਪਾਦ ਵਾਪਸ ਹੁੰਦੇ ਹਨ।",
    whatTriphala: "ਤ੍ਰਿਫਲਾ ਤਿੰਨ ਫਲਾਂ ਦਾ ਪ੍ਰਾਚੀਨ ਆਯੁਰਵੈਦਿਕ ਮਿਸ਼ਰਣ ਹੈ।",
    trustProduct: "HerbTrace ਉਤਪਾਦਾਂ 'ਤੇ ਭਰੋਸਾ ਕਰੋ।",
    assistantIntro: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ HerbTrace ਸਮਾਰਟ ਸਹਾਇਕ ਹਾਂ।",
  },
};

const getLanguageCode = (language: string): "EN" | "HI" | "MR" | "GU" | "PA" => {
  const map: Record<string, "EN" | "HI" | "MR" | "GU" | "PA"> = {
    EN: "EN",
    HI: "HI",
    MR: "MR",
    GU: "GU",
    PA: "PA",
  };
  return map[language] || "EN";
};

export default function SmartAssistant() {
  const { farmer, language, setLanguage } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: knowledgeBase[getLanguageCode(language)]["assistantIntro"],
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(messages.length === 1);
  const [bottomOffset, setBottomOffset] = useState(24);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatbotRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const recognitionRef = useRef<any>(null);

  const languages = [
    { code: "EN" as Language, name: "English" },
    { code: "HI" as Language, name: "हिंदी" },
    { code: "MR" as Language, name: "मराठी" },
    { code: "GU" as Language, name: "ગુજરાતી" },
    { code: "PA" as Language, name: "ਪੰਜਾਬੀ" },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const detectBottomNavAndAdjustPosition = () => {
      const bottomNav = document.querySelector('nav[class*="fixed bottom-0"]');
      const viewportHeight = window.innerHeight;
      let newBottomOffset = 24;

      if (bottomNav) {
        const navRect = bottomNav.getBoundingClientRect();
        const navHeight = navRect.height;
        const spaceNeeded = navHeight + 16;
        newBottomOffset = spaceNeeded;
      }

      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        newBottomOffset = Math.max(newBottomOffset, 80);
      }

      setBottomOffset(newBottomOffset);
    };

    detectBottomNavAndAdjustPosition();
    const resizeObserver = new ResizeObserver(detectBottomNavAndAdjustPosition);
    const bottomNav = document.querySelector('nav[class*="fixed bottom-0"]');
    if (bottomNav) {
      resizeObserver.observe(bottomNav);
    }

    window.addEventListener("resize", detectBottomNavAndAdjustPosition);
    return () => {
      window.removeEventListener("resize", detectBottomNavAndAdjustPosition);
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setInput(transcript);
      };
    }
  }, []);

  const getAnswer = (question: string): string => {
    const langCode = getLanguageCode(language);
    const kb = knowledgeBase[langCode];
    const questionLower = question.toLowerCase();

    for (const [key, value] of Object.entries(kb)) {
      if (questionLower.includes(key.replace(/([A-Z])/g, " $1").toLowerCase())) {
        return value;
      }
    }

    if (questionLower.includes("how") || questionLower.includes("what") || questionLower.includes("when") || questionLower.includes("why")) {
      return kb.howAppWorks;
    }

    return kb.howAppWorks;
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setShowSuggestions(false);
    setIsLoading(true);

    setTimeout(() => {
      const answer = getAnswer(input);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 500);
  };

  const handleVoiceOutput = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const langMap: Record<string, string> = {
        EN: "en-US",
        HI: "hi-IN",
        MR: "mr-IN",
        GU: "gu-IN",
        PA: "pa-IN",
      };
      utterance.lang = langMap[getLanguageCode(language)] || "en-US";
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
  };

  const userRole = farmer?.role || "Farmer";
  const langCode = getLanguageCode(language);
  const suggestionKeys = roleSpecificSuggestionsKeys[userRole] || roleSpecificSuggestionsKeys.Farmer;
  const suggestions = suggestionKeys.map((key) => ({
    question: knowledgeBase[langCode][key] || knowledgeBase.EN[key] || "",
    key,
  }));

  const buttonBottomOffset = bottomOffset;
  const chatbotBottomOffset = isOpen ? bottomOffset + 56 + 16 : bottomOffset;

  return (
    <>
      <motion.button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          bottom: `${buttonBottomOffset}px`,
        }}
        className="fixed right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover-elevate z-[60]"
        whileTap={{ scale: 0.95 }}
        data-testid="button-open-chatbot"
      >
        <MessageCircle size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatbotRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{
              bottom: `${chatbotBottomOffset}px`,
            }}
            className="fixed right-6 w-96 max-w-[calc(100vw-2rem)] h-[30rem] bg-background border border-border rounded-2xl shadow-lg flex flex-col z-[60] overflow-hidden"
          >
            <div className="flex items-center justify-between p-3 bg-primary text-primary-foreground">
              <h3 className="font-semibold text-sm">Assistant</h3>
              <div className="flex items-center gap-2 relative">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="p-1 hover-elevate rounded-lg flex-shrink-0"
                  data-testid="button-language-selector-chatbot"
                >
                  <Languages size={20} />
                </button>
                {showLanguageMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute right-0 top-10 bg-card border border-border rounded-lg shadow-lg z-[70] w-40 overflow-hidden"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setShowLanguageMenu(false);
                          setMessages([
                            {
                              id: "1",
                              role: "assistant",
                              content: knowledgeBase[lang.code]["assistantIntro"],
                              timestamp: new Date(),
                            },
                          ]);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover-elevate ${
                          language === lang.code
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground"
                        }`}
                        data-testid={`button-lang-chatbot-${lang.code}`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </motion.div>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover-elevate rounded-lg flex-shrink-0"
                  data-testid="button-close-chatbot"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <Card className={`max-w-xs p-3 ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-2xl" : "bg-muted text-foreground rounded-2xl"}`}>
                    <p className="text-sm">{msg.content}</p>
                    {msg.role === "assistant" && (
                      <button
                        onClick={() => handleVoiceOutput(msg.content)}
                        className="mt-2 p-1 hover-elevate"
                        data-testid="button-voice-output"
                      >
                        <Volume2 size={16} />
                      </button>
                    )}
                  </Card>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <Loader size={20} className="animate-spin text-muted-foreground" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-border space-y-2">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder={suggestionLabels[langCode]?.placeholder || "Ask me anything..."}
                  className="flex-1"
                  data-testid="input-chatbot"
                />
                <Button
                  onClick={() => {
                    if (isListening) {
                      recognitionRef.current?.stop();
                    } else {
                      recognitionRef.current?.start();
                    }
                  }}
                  size="icon"
                  variant="outline"
                  className="flex-shrink-0"
                  data-testid="button-voice-input"
                >
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </Button>
                <Button onClick={handleSendMessage} size="icon" className="flex-shrink-0" data-testid="button-send-message">
                  <Send size={20} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
