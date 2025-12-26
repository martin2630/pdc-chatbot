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
import { generarPaseCajaPDF } from "@/utils/generarPaseCajaPDF";
import { pagoenLineaXml2Json } from "@/utils/pagoenLineaXml2Json";
import { paseCajaXml2Json } from "@/utils/paseCajaXml2Json";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

    const chat = await getChatById({ id });
    // const initialMessages = Array.isArray(chat?.messages) ? chat.messages : [];
    // const convertedInitialMessages = convertToModelMessages(initialMessages);

    const result = streamText({
      model: geminiProModel,
      stopWhen: stepCountIs(5),
      system: `
        Eres un asistente virtual para pago del predial para la ciudad de Playa del Carmen.
        Reglas generales:
        - Tono amigable, directo y respetuoso.
        - Respuestas breves y claras de una linea o máximo dos.
        - Nunca des información innecesaria.
        - Después de cada llamada a un tool, NO generes ningún texto adicional. El resultado del tool se muestra automáticamente.
        - ESPECIALMENTE para getPaseDeCaja y pagoEnLinea: NO generes ningún mensaje después de ejecutarlos. Termina inmediatamente.
        - Hoy es ${new Date().toLocaleDateString()}.

        Flujo de usuarios:
        - Si el usuario pregunta por usuarios (sin mencionar un id específico):
          - DEBES llamar a la función getUsers sin argumentos.

        Detalle de usuario:
        - Si el mensaje del usuario contiene "id:" seguido de un número:
          - DEBES extraer el número que aparece después de "id:"
          - DEBES llamar inmediatamente a getUserById pasando ese número como parámetro "id"
          - DESPUÉS de ejecutar getUserById.
          - REGLA ABSOLUTA: Después de llamar a getUserById no des más información.

        Flujo de clima:
        - Si el usuario pregunta por clima o tiempo:
          - Llama inmediatamente a getWeather con:
            latitude: 20.6296
            longitude: -87.0739

        Flujo de predial:
        - Pide primero RFC.
        - Si no tiene RFC, explica brevemente cómo obtenerlo.
        - Luego pide clave catastral.
        - Si no tiene clave catastral, responde:
          "No se puede pagar el predial sin la clave catastral. Acude a nuestras oficinas para obtenerla."
        - Teniendo el RFC y la clave catastral, ejecuta getPredialDummy.
        No des información adicional, solo ejecuta la función.

        Flujo de pase de caja:
        - Si se elige generar un pase de caja, ejecuta getPaseDeCaja:
          REGLA CRÍTICA Y ABSOLUTA: 
          - Después de ejecutar getPaseDeCaja, NO generes NINGÚN texto adicional.
          - NO digas "Tu pase de caja ha sido generado"
          - NO digas "Puedes descargarlo"
          - NO generes ningún mensaje de confirmación.
          - NO agregues ningún texto después de la ejecución del tool.
          - El resultado del tool se mostrará automáticamente al usuario, NO necesitas explicarlo.
          - Después de ejecutar getPaseDeCaja, termina inmediatamente sin generar ningún texto.
 "
        Flujo de pago en linea:
        - Si el usuario pregunta por pago en linea:
          - Llama inmediatamente a pagoEnLinea:
          IMPORTANTE: 
          - No regrese nada más, solo ejecuta la función. 
          - NO regreses "Tu pago en línea ha sido generado. Puedes realizarlo a través de este enlace: [Pagar en línea](link). ¡Gracias! Si necesitas más ayuda, no dudes en decirlo."
      `,
      messages: modelMessages,
      tools: {
        getWeather: tool({
          description: "Da el clima para Playa del Carmen.",
          inputSchema: z.object({
            latitude: z.number(),
            longitude: z.number(),
          }),
          execute: async ({
            latitude,
            longitude,
          }: {
            latitude: number;
            longitude: number;
          }) => {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`;
            console.log("url", url);
            const res = await fetch(url);
            if (!res.ok) throw new Error("Error obteniendo el clima");
            const data = await res.json();
            console.log("data", data);
            return await res.json();
          },
        } as any),
        getUsers: tool({
          description:
            "Obtiene la lista de usuarios desde JSONPlaceholder. IMPORTANTE: Si el mensaje del usuario menciona un número después de 'id' o pide información de un usuario específico, DEBES pasar ese número como parámetro 'id'. Si el usuario solo pide la lista de usuarios sin mencionar un id específico, no pases ningún parámetro.",
          inputSchema: z.object({}),
          execute: async () => {
            const url = `https://jsonplaceholder.typicode.com/users`;

            const res = await fetch(url);
            if (!res.ok) throw new Error("Error obteniendo los usuarios");
            const data = await res.json();
            return data;
          },
        } as any),
        getUserById: tool({
          description:
            "Obtiene un usuario específico. USA ESTA FUNCIÓN cuando el mensaje del usuario contenga 'id:' seguido de un número. Extrae el número del mensaje y pásalo como parámetro 'id'.",
          inputSchema: z.object({
            id: z
              .number()
              .describe(
                "El número ID del usuario que aparece después de 'id:' en el mensaje del usuario. Ejemplo: si el mensaje dice 'id: 5', pasa 5 aquí."
              ),
          }),
          execute: async ({ id }: { id: number }) => {
            const url = `https://jsonplaceholder.typicode.com/users/${id}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("Error obteniendo el usuario");
            const data = await res.json();
            console.log("data", data);
            return data;
          },
        } as any),
        getPredial: tool({
          description:
            "Consulta el predial de Playa del Carmen. Necesita RFC y clave catastral.",
          inputSchema: z.object({
            rfc: z.string(),
            claveCatastral: z.string(),
          }),
          execute: async ({ rfc, claveCatastral }) => {
            const claveAcceso = "1234567890123456789";
            const soapBody = `
              <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cat="Catastro">
                <soapenv:Header/>
                <soapenv:Body>
                  <cat:CreaPasePredialPlayaWS.Execute>
                    <cat:Prediocvecatastral>${claveCatastral}</cat:Prediocvecatastral>
                    <cat:Rfcpersona>${rfc}</cat:Rfcpersona>
                    <cat:Claveacceso>${claveAcceso}</cat:Claveacceso>
                  </cat:CreaPasePredialPlayaWS.Execute>
                </soapenv:Body>
              </soapenv:Envelope>
            `;
            const res = await fetch(
              "http://201.98.122.130/Catastro/acreapasepredialplayaws.aspx",
              {
                method: "POST",
                headers: { "Content-Type": "text/xml; charset=utf-8" },
                body: soapBody,
              }
            );
            const result = await res.text();
            return result;
          },
        }),
        getPredialDummy: tool({
          description:
            "Consulta el predial de Playa del Carmen. Necesita RFC y clave catastral. IMPORTANTE: No regrese nada más, solo ejecuta la función.",
          inputSchema: z.object({
            rfc: z.string(),
            claveCatastral: z.string(),
          }),
          execute: async ({ rfc, claveCatastral }) => {
            console.log("rfc", rfc);
            console.log("claveCatastral", claveCatastral);
            return {
              codeReference: "42-18-3039141",
            };
          },
        }),
        getPaseDeCaja: tool({
          description:
            "Consulta el pase para pagar a caja. Necesita la referencia de codigo. IMPORTANTE: Después de ejecutar esta función, NO generes ningún mensaje de texto adicional. El resultado se mostrará automáticamente al usuario con botones para ver y descargar el documento.",
          inputSchema: z.object({
            referenciaCodigo: z.string(),
          }),
          execute: async ({
            referenciaCodigo,
          }: {
            referenciaCodigo: string;
          }) => {
            const soapBody = `
              <Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">
                <Body>
                  <WSConsultaPasesCaja.Execute xmlns="Tlania">
                    <Referenciacodigo>${referenciaCodigo}</Referenciacodigo>
                  </WSConsultaPasesCaja.Execute>
                </Body>
              </Envelope>
            `;
            const res = await fetch(
              "http://201.98.122.130/Tlania/aWSConsultaPasesCaja.aspx",
              {
                method: "POST",
                headers: { "Content-Type": "text/xml; charset=utf-8" },
                body: soapBody,
              }
            );
            const response = await res.text();
            const data = paseCajaXml2Json(response);

            if (!data) {
              throw new Error("No se pudo generar el pase de caja");
            }

            const pdfBase64 = await generarPaseCajaPDF(data);

            console.log("data", data);

            return {
              fileName: `pase_caja_${data.solicitudId}.pdf`,
              pdfBase64,
            };
          },
        }),
        pagoEnLinea: tool({
          description: "Pagar en linea",
          inputSchema: z.object({
            referenciaCodigo: z.string(),
          }),
          execute: async ({ referenciaCodigo }) => {
            const claveAcceso = "1234567890123456789";
            const soapBody = `
              <Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">
                  <Body>
                      <daoGeneraIntenciondecobroGlobal xmlns="http://tempuri.org/">
                          <parStrPaseCaja>${referenciaCodigo}</parStrPaseCaja>
                          <parStrTokenValidate>${claveAcceso}</parStrTokenValidate>
                      </daoGeneraIntenciondecobroGlobal>
                  </Body>
              </Envelope>
            `;
            const res = await fetch(
              "http://tesoreria.playadelcarmen.gob.mx:8081/wsSIGEM/coatl/IServiceUrlIntenciondePagoGlobal.svc",
              {
                method: "POST",
                headers: {
                  "Content-Type": "text/xml; charset=utf-8",
                  SOAPAction:
                    "http://tempuri.org/IIServiceUrlIntenciondePagoGlobal/daoGeneraIntenciondecobroGlobal",
                },
                body: soapBody,
              }
            );

            const response = await res.text();
            const data = pagoenLineaXml2Json(response);

            if (!data) {
              throw new Error("No se pudo procesar la respuesta del servicio");
            }

            // Retornar los datos parseados
            return {
              error: false,
              link: data.urlIntencionCobro || data.link,
              codigoError: data.codigoError,
              mensajeError: data.mensajeError,
              folioPaseCaja: data.folioPaseCaja,
              grupoTramiteId: data.grupoTramiteId,
              solicitudId: data.solicitudId,
              tramiteId: data.tramiteId,
              urlIntencionCobro: data.urlIntencionCobro,
            };
          },
        }),
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
