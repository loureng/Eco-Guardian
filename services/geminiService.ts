
import { GoogleGenAI, Type, Schema, Content } from "@google/genai";
import { Plant, SunTolerance, ChatMessage, UserProfile } from "../types";
import { PLANT_IDENTIFICATION_PROMPT, PLANT_DETAILS_PROMPT } from "../constants";

const getGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("Chave de API não encontrada");
  return new GoogleGenAI({ apiKey });
};

const plantSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    scientificName: { type: Type.STRING },
    commonName: { type: Type.STRING },
    category: { type: Type.STRING, description: "Categoria geral como 'Suculenta', 'Samambaia', 'Tropical', 'Erva'" },
    description: { type: Type.STRING, description: "Resumo curto e interessante sobre a planta" },
    origin: { type: Type.STRING, description: "País ou região de origem" },
    careTips: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Lista de 3 dicas específicas de cuidado" 
    },
    wateringFrequencyDays: { type: Type.NUMBER },
    sunTolerance: { 
      type: Type.STRING, 
      enum: ["Sombra", "Meia-sombra", "Sol Pleno"] 
    },
    minTemp: { type: Type.NUMBER },
    maxTemp: { type: Type.NUMBER },
    fertilizer: { type: Type.STRING, description: "Tipo de adubo ou nutrientes" },
    soil: { type: Type.STRING, description: "Tipo de solo e drenagem" },
    environmentTips: { type: Type.STRING, description: "Dicas de ventilação, chuva e localização" }
  },
  required: ["scientificName", "commonName", "wateringFrequencyDays", "sunTolerance", "minTemp", "maxTemp"],
};

const sanitizeString = (val: any): string => {
  if (val === null || val === undefined) return "";
  if (typeof val === 'string') return val.trim();
  if (typeof val === 'number') return String(val);
  return ""; 
};

const sanitizeNumber = (val: any, defaultVal: number): number => {
  const num = Number(val);
  return isNaN(num) ? defaultVal : num;
};

const sanitizeArray = (val: any): string[] => {
  if (Array.isArray(val)) return val.map(v => sanitizeString(v));
  return [];
};

export const identifyPlant = async (base64Image: string): Promise<Partial<Plant>> => {
  try {
    const ai = getGeminiClient();
    
    // Clean base64 string if it contains metadata
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    // Using Standard Flash for Vision tasks
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
          { text: PLANT_IDENTIFICATION_PROMPT }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: plantSchema,
        temperature: 0.2, 
      }
    });

    const text = response.text;
    if (!text) throw new Error("Sem resposta do Gemini");

    const data = JSON.parse(text);

    return {
      scientificName: sanitizeString(data.scientificName),
      commonName: sanitizeString(data.commonName),
      category: sanitizeString(data.category) || "Geral",
      description: sanitizeString(data.description),
      origin: sanitizeString(data.origin),
      careTips: sanitizeArray(data.careTips),
      wateringFrequencyDays: sanitizeNumber(data.wateringFrequencyDays, 7),
      sunTolerance: (Object.values(SunTolerance).includes(data.sunTolerance) ? data.sunTolerance : SunTolerance.PARTIAL) as SunTolerance,
      minTemp: sanitizeNumber(data.minTemp, 10),
      maxTemp: sanitizeNumber(data.maxTemp, 30),
      fertilizer: sanitizeString(data.fertilizer),
      soil: sanitizeString(data.soil),
      environmentTips: sanitizeString(data.environmentTips),
      wateringHistory: []
    };

  } catch (error) {
    console.error("Erro na identificação Gemini:", error);
    throw error;
  }
};

export const getPlantDetailsByName = async (name: string): Promise<Partial<Plant>> => {
  try {
    const ai = getGeminiClient();
    const prompt = PLANT_DETAILS_PROMPT.replace("{{NAME}}", name);

    // Using Flash Lite for faster text response
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: plantSchema,
        temperature: 0.3, 
      }
    });

    const text = response.text;
    if (!text) throw new Error("Sem resposta do Gemini");

    const data = JSON.parse(text);

    return {
      scientificName: sanitizeString(data.scientificName),
      commonName: sanitizeString(data.commonName),
      category: sanitizeString(data.category) || "Geral",
      description: sanitizeString(data.description),
      origin: sanitizeString(data.origin),
      careTips: sanitizeArray(data.careTips),
      wateringFrequencyDays: sanitizeNumber(data.wateringFrequencyDays, 7),
      sunTolerance: (Object.values(SunTolerance).includes(data.sunTolerance) ? data.sunTolerance : SunTolerance.PARTIAL) as SunTolerance,
      minTemp: sanitizeNumber(data.minTemp, 10),
      maxTemp: sanitizeNumber(data.maxTemp, 30),
      fertilizer: sanitizeString(data.fertilizer),
      soil: sanitizeString(data.soil),
      environmentTips: sanitizeString(data.environmentTips),
      wateringHistory: []
    };
  } catch (error) {
    console.error("Erro na busca por nome Gemini:", error);
    throw error;
  }
};

export const generatePlantImage = async (plantName: string): Promise<string | null> => {
  try {
    const ai = getGeminiClient();
    const prompt = `A professional, high-quality, photorealistic close-up photo of a ${plantName} plant in a modern pot. Bright natural lighting, soft shadows, blurred living room background. 4k resolution.`;

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });

    const base64String = response.generatedImages?.[0]?.image?.imageBytes;
    if (base64String) {
      return `data:image/jpeg;base64,${base64String}`;
    }
    return null;
  } catch (error) {
    console.error("Erro ao gerar imagem da planta:", error);
    return null;
  }
};

// --- Chatbot Logic ---

export const sendChatMessage = async (
  history: ChatMessage[], 
  newMessage: string, 
  userProfile: UserProfile | null
): Promise<{ text: string, groundingChunks?: any[] }> => {
  try {
    const ai = getGeminiClient();
    
    // Construct System Instruction with Context
    let systemInstruction = "Você é o EcoGuardian, um especialista amigável em plantas. Responda em Português do Brasil.";
    
    if (userProfile) {
      const plantNames = userProfile.plants.map(p => p.commonName).join(", ");
      systemInstruction += `\nO usuário vive em: ${userProfile.dwellingType || 'Casa/Apartamento'}.`;
      systemInstruction += `\nLocalização: ${userProfile.location?.city || 'Desconhecida'}.`;
      if (plantNames) {
        systemInstruction += `\nPlantas do usuário: ${plantNames}.`;
      } else {
        systemInstruction += `\nO usuário ainda não tem plantas cadastradas.`;
      }
      systemInstruction += `\nSe o usuário perguntar "onde comprar" ou lojas, use o Google Maps. Para cuidados gerais ou novidades, use o Google Search.`;
    }

    // Configuração das ferramentas
    const config: any = {
      systemInstruction: systemInstruction,
      tools: [{ googleSearch: {} }, { googleMaps: {} }],
    };

    // Adiciona localização para Grounding se disponível
    if (userProfile?.location) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: userProfile.location.latitude,
            longitude: userProfile.location.longitude
          }
        }
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Utilizando Flash para suporte a Tools (Maps/Search)
      contents: [
        ...history.filter(h => h.role !== 'model').map(h => ({
           role: 'user',
           parts: [{ text: h.text }]
        })),
        { role: 'user', parts: [{ text: newMessage }] }
      ],
      config: config
    });

    // Extract Grounding Data
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return {
      text: response.text || "Desculpe, não consegui processar sua resposta.",
      groundingChunks
    };

  } catch (error) {
    console.error("Chat error:", error);
    return { text: "Ocorreu um erro ao conectar com o assistente inteligente." };
  }
};
