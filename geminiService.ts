
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateCharacterBackstory(name: string, role: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Crie uma biografia curta e impactante para um personagem de quadrinhos chamado "${name}", cujo papel é "${role}". Foque em motivações e mistérios. Responda em Português.`
  });
  return response.text;
}

export async function suggestCharacterTraits(name: string, role: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Sugira 4 características físicas ou psicológicas marcantes (tópicos) para o personagem "${name}" (${role}). Retorne em formato JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["category", "description"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
}

export async function suggestLocationDescription(name: string, type: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Descreva detalhadamente a atmosfera, clima e aparência visual de um local de quadrinhos chamado "${name}", que é do tipo "${type}". Responda com um parágrafo rico em detalhes sensoriais em Português.`
  });
  return response.text;
}

export async function helpWithDialogue(speaker: string, sceneContext: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `O personagem "${speaker}" está em: "${sceneContext}". Escreva um diálogo curto e potente para esta cena. Responda em Português.`
  });
  return response.text;
}
