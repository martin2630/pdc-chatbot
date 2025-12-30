import {
  convertToModelMessages,
  UIMessage,
  streamText,
  stepCountIs,
  tool,
} from "ai";
import { headers } from "next/headers";
import { z } from "zod";

import { geminiProModel } from "@/ai";
import { auth } from "@/app/(auth)/auth";
import { deleteChatById, getChatById, saveChat } from "@/db/queries";
import { getPagoEnLineaService } from "@/services/pago-en-linea-service";
import { getPaseCajaService } from "@/services/pase-caja-service";
import { getPredialService } from "@/services/predial-service";
import { generarPaseCajaPDF } from "@/utils/generarPaseCajaPDF";
import { pagoenLineaXml2Json } from "@/utils/pagoenLineaXml2Json";
import { paseCajaXml2Json } from "@/utils/paseCajaXml2Json";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

let lastCodeReference: string | null = null;

interface ChatRequest {
  id: string;
  messages: UIMessage[];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || !body.messages) {
      return new Response(
        JSON.stringify({ error: "No se encontraron mensajes en la solicitud" }),
        { status: 400 }
      );
    }

    const { id, messages } = body as ChatRequest;

    console.log("id ========>", id);

    const session = await auth();
    if (!session) return new Response("Unauthorized", { status: 401 });

    const modelMessages = convertToModelMessages(messages ?? []);

    // const chat = await getChatById({ id });
    // const initialMessages = Array.isArray(chat?.messages) ? chat.messages : [];
    // const convertedInitialMessages = convertToModelMessages(initialMessages);

    const result = streamText({
      model: geminiProModel,
      stopWhen: stepCountIs(5),
      system: `
        Eres un asistente virtual para el pago del predial de Playa del Carmen.

        TONO:
        - Amigable, claro y directo.
        - No inventes información.
        - Nunca salgas del tema predial.
        
        Reglas generales:
        - Tono amigable, claro y directo.
        - Respuestas breves y claras de una linea o máximo dos.
        - Nunca des información que no sea referente al predial.
        - NO ejecutes herramientas/funciones a menos que el usuario lo solicite EXPLÍCITAMENTE.
        - Para saludos simples como "hola", "buenos días", solo responde con un saludo amigable y pregunta en qué puedes ayudar.
        - REGLA CRÍTICA: Después de ejecutar CUALQUIER tool (especialmente getReferenceCode, getPaseDeCaja, pagoEnLinea), TERMINA INMEDIATAMENTE. NO generes texto adicional. NO expliques. NO confirmes. El resultado se muestra automáticamente.
        - Hoy es ${new Date().toLocaleDateString()}.

        FLUJO OBLIGATORIO (CRÍTICO):

        1. Para cualquier trámite de predial, SIEMPRE necesitas:
          - Primero solicitar RFC. Si no tiene RFC, explica brevemente cómo obtenerlo.
          - Al ingresar el RFC, luego solicitar Clave catastral. Si no tiene clave catastral, responde:
            "No se puede pagar el predial sin la clave catastral. Acude a nuestras oficinas para obtenerla."

        2. NO ejecutes ninguna consulta sin ambos datos.

        3. Cuando tengas RFC y clave catastral:
          - Ejecuta "getReferenceCode" y TERMINA INMEDIATAMENTE.
          - REGLAS ABSOLUTAS Y CRÍTICAS DESPUÉS DE EJECUTAR getReferenceCode:
            * NO generes NINGÚN texto.
            * NO digas "Aquí tienes tu código de referencia".
            * NO digas "Si deseas proceder con el pase de caja".
            * NO hagas preguntas al usuario.
            * NO proporciones información adicional.
            * TERMINA INMEDIATAMENTE después de ejecutar la función.
            * El resultado se mostrará automáticamente con botones.
          - NO ejecutes getPaseDeCaja ni pagoEnLinea automáticamente.
          - Estas funciones solo se ejecutan cuando el usuario hace clic en los botones correspondientes.

        PASE DE CAJA:
        - getPaseDeCaja SOLO se ejecuta si el usuario lo solicita explícitamente.
        - Después de ejecutar getPaseDeCaja, NO generes NINGÚN texto adicional.
        - NO digas "Tu pase de caja ha sido generado"
        - NO digas "Puedes descargarlo"
        - NO generes ningún mensaje de confirmación.
        - El resultado del tool se mostrará automáticamente al usuario.

        PAGO EN LÍNEA:
        - pagoEnLinea SOLO se ejecuta si el usuario lo solicita explícitamente.
        - Después de ejecutar pagoEnLinea, NO generes ningún mensaje adicional.
        - NO digas "Tu pago en línea ha sido realizado"
        - NO digas "Puedes descargarlo"
        - NO generes ningún mensaje de confirmación.
        - El resultado del tool se mostrará automáticamente al usuario.

        // Eres un asistente virtual para pago del predial para la ciudad de Playa del Carmen.

        // Reglas generales:
        // - Tono amigable, directo y respetuoso.
        // - Respuestas breves y claras de una linea o máximo dos.
        // - Nunca des información que no sea referente al predial.
        // - NO ejecutes herramientas/funciones a menos que el usuario lo solicite EXPLÍCITAMENTE.
        // - Para saludos simples como "hola", "buenos días", solo responde con un saludo amigable y pregunta en qué puedes ayudar.
        // - Después de cada llamada a un tool, NO generes ningún texto adicional. El resultado del tool se muestra automáticamente.
        // - ESPECIALMENTE para getPaseDeCaja y pagoEnLinea: NO generes ningún mensaje después de ejecutarlos. Termina inmediatamente.
        // - Hoy es ${new Date().toLocaleDateString()}.

        // Flujo de pago predial:
        // - Pide primero RFC.
        // - Si no tiene RFC, explica brevemente cómo obtenerlo.
        // - Luego pide clave catastral.
        // - Si no tiene clave catastral, responde:
        //   "No se puede pagar el predial sin la clave catastral. Acude a nuestras oficinas para obtenerla."
        // - Teniendo el RFC y la clave catastral, ejecuta getReferenceCode.
        // - REGLA CRÍTICA: Después de ejecutar getReferenceCode, NO ejecutes automáticamente getPaseDeCaja ni pagoEnLinea.
        // - Después de ejecutar getReferenceCode, el resultado se mostrará con botones que el usuario puede usar.
        // - NO ejecutes getPaseDeCaja a menos que el usuario explícitamente lo solicite.
        // - NO ejecutes pagoEnLinea a menos que el usuario explícitamente lo solicite.

        // Flujo de pase de caja:
        // - getPaseDeCaja SOLO debe ejecutarse cuando el usuario explícitamente lo solicite o haga clic en el botón correspondiente.
        // - REGLA ABSOLUTA: NO ejecutes getPaseDeCaja automáticamente después de getReferenceCode.
        // - Después de ejecutar getPaseDeCaja, NO generes NINGÚN texto adicional.
        // - NO digas "Tu pase de caja ha sido generado"
        // - NO digas "Puedes descargarlo"
        // - NO generes ningún mensaje de confirmación.
        // - El resultado del tool se mostrará automáticamente al usuario.

        // Flujo de pago en linea:
        // - pagoEnLinea SOLO debe ejecutarse cuando el usuario explícitamente lo solicite o haga clic en el botón correspondiente.
        // - REGLA ABSOLUTA: NO ejecutes pagoEnLinea automáticamente después de getReferenceCode.
        // - Después de ejecutar pagoEnLinea, NO generes ningún mensaje adicional.
        // - El resultado del tool se mostrará automáticamente al usuario.
      `,
      messages: modelMessages,
      tools: {
        getReferenceCode: tool({
          description: `Consulta el predial de Playa del Carmen. 
            Necesita RFC y clave catastral. 
            CRÍTICO: Después de ejecutar esta función, NO generes NINGÚN texto. 
            TERMINA INMEDIATAMENTE. 
            El resultado se mostrará automáticamente con botones. 
            NO digas nada más.
            Si no viene el dato codeReference, el campo errorDescription puede darte contexto del error.
          `,
          inputSchema: z.object({
            rfc: z.string(),
            claveCatastral: z.string(),
          }),
          execute: async ({ rfc, claveCatastral }) => {
            try {
              console.log("getReferenceCode try");
              const result = await getPredialService({ rfc, claveCatastral });
              lastCodeReference = result?.codeReference ?? null;

              if (!lastCodeReference) {
                throw new Error("Primero debes consultar el predial.");
              }
              const data = await getPaseCajaService(lastCodeReference);
              return data;
            } catch (error) {
              console.log("getReferenceCode catch");
              console.error("Error al obtener predial:", error);
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : "Error desconocido al obtener el predial";
              throw new Error(
                `No se pudo consultar el predial: ${errorMessage}. Por favor, verifica el RFC y la clave catastral proporcionados e intenta nuevamente.`
              );
            }
          },
        }),
        getPaseDeCaja: tool({
          description:
            "Consulta el pase para pagar a caja. Esta función SOLO debe ejecutarse cuando el usuario explícitamente lo solicite o haga clic en el botón correspondiente. NO ejecutes esta función automáticamente después de getReferenceCode. Usa internamente el codeReference guardado de la última consulta de predial. Después de ejecutar esta función, NO generes ningún mensaje de texto adicional. El resultado se mostrará automáticamente al usuario con botones para ver y descargar el documento.",
          inputSchema: z.object({}),
          execute: async () => {
            try {
              if (!lastCodeReference) {
                throw new Error("Primero debes consultar el predial.");
              }
              const data = await getPaseCajaService(lastCodeReference);
              return data;
            } catch (error) {
              console.error("Error al obtener pase de caja:", error);
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : "Error desconocido al obtener el pase de caja";
              throw new Error(
                `No se pudo generar el pase de caja: ${errorMessage}. Por favor, verifica la referencia proporcionada e intenta nuevamente.`
              );
            }
          },
        }),
        pagoEnLinea: tool({
          description:
            "Pagar en linea. Esta función SOLO debe ejecutarse cuando el usuario explícitamente lo solicite o haga clic en el botón correspondiente. NO ejecutes esta función automáticamente después de getReferenceCode. Usa internamente el codeReference guardado de la última consulta de predial. Después de ejecutar esta función, NO generes ningún mensaje de texto adicional. El resultado se mostrará automáticamente al usuario con botones para ver y descargar el documento.",
          inputSchema: z.object({}),
          execute: async () => {
            try {
              if (!lastCodeReference) {
                throw new Error("Primero debes consultar el predial.");
              }
              const data = await getPagoEnLineaService(lastCodeReference);
              return data;
            } catch (error) {
              console.error("Error al obtener pago en línea:", error);
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : "Error desconocido al obtener el pago en línea";
              throw new Error(
                `No se pudo generar el pago en línea: ${errorMessage}. Por favor, verifica la referencia proporcionada e intenta nuevamente.`
              );
            }
          },
        }),
        // consultarEstadoDeCuenta: tool({
        //   description:
        //     "Consulta el estado de cuenta del predial. Esta función SOLO debe ejecutarse cuando el usuario explícitamente lo solicite o haga clic en el botón correspondiente. NO ejecutes esta función automáticamente después de getReferenceCode. Usa internamente el codeReference guardado de la última consulta de predial. Después de ejecutar esta función, NO generes ningún mensaje adicional.",
        //   inputSchema: z.object({
        //     rfc: z.string(),
        //     claveCatastral: z.string(),
        //   }),
        //   execute: async () => {
        //     try {
        //       const data = await getEstadoDeCuentaService(lastCodeReference);
        //       return data;
        //     } catch (error) {
        //       console.error("Error al obtener estado de cuenta:", error);
        //       const errorMessage =
        //         error instanceof Error
        //           ? error.message
        //           : "Error desconocido al obtener el estado de cuenta";
        //       throw new Error(
        //         `No se pudo obtener el estado de cuenta: ${errorMessage}. Por favor, verifica la referencia proporcionada e intenta nuevamente.`
        //       );
        //     }
        //   },
        // }),
      },
      onFinish: async (event) => {
        if (session.user && session.user.id) {
          const assistantMessage = {
            id: `msg-${Date.now()}-${Math.random()}`,
            role: "assistant" as const,
            parts: [
              {
                type: "text",
                text: event.text || "",
              },
            ],
          };
          const allMessages = [...messages, assistantMessage];
          await saveChat({
            id,
            messages: allMessages,
            userId: session.user.id,
          });
        }
      },
      experimental_telemetry: { isEnabled: true, functionId: "stream-text" },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error en la API de chat:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process request",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  // Await headers() first to fix Next.js 15 compatibility
  await headers();
  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
