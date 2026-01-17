
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getBusinessAdvice(businessName: string, recentSales: number, role: string) {
  try {
    const prompt = `Você é um consultor especialista para o mercado de beleza e estética. 
    Analise o negócio "${businessName}" que teve ${recentSales} vendas recentemente. 
    Dê 3 dicas práticas para aumentar o faturamento ou fidelizar clientes. Seja breve e encorajador.
    O usuário é um ${role}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text;
  } catch (error) {
    console.error("Erro ao consultar Gemini:", error);
    return "Não foi possível carregar as dicas de IA no momento. Continue o excelente trabalho!";
  }
}
