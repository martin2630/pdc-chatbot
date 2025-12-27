"use client";

import { UIMessage } from "ai";
import { motion } from "framer-motion";

import { User } from "@/interfaces/user.interfaces";

import { BotIcon, UserIcon } from "./icons";
import PagoLinea from "../predial/pago-linea";
import PaseDeCaja from "../predial/pase-de-caja";
import PredialDummy from "../predial/predial-dumy";
import { ListUsers } from "../users/list-users";
import { UserDetails } from "../users/user-details";

interface Props {
  chatId: string;
  role: string;
  parts: UIMessage["parts"];
  sendMessage?: (message: any) => void;
}

export const Message = ({ chatId, role, parts, sendMessage }: Props) => {
  const handleGeneratePaseDeCaja = (referenciaCodigo: string) => {
    if (sendMessage) {
      sendMessage({
        id: chatId,
        type: "tool-tool-pagoEnLinea",
        parts: [
          {
            type: "text",
            text: `Quiero generar el pase de caja: ${referenciaCodigo}`,
          },
        ],
      });
    }
  };
  const handlePagarEnLinea = (referenciaCodigo: string) => {
    if (sendMessage) {
      sendMessage({
        id: chatId,
        type: "tool-tool-pagoEnLinea",
        parts: [
          {
            type: "text",
            text: `Quiero generar el pago en linea: ${referenciaCodigo}`,
          },
        ],
      });
    }
  };

  const handleDescargarPaseCaja = ({
    pdfBase64,
    fileName,
  }: {
    pdfBase64: string;
    fileName: string;
  }) => {
    // 1️⃣ Base64 → bytes
    const byteCharacters = atob(pdfBase64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    // 2️⃣ Bytes → Blob PDF
    const pdfBlob = new Blob([byteArray], {
      type: "application/pdf",
    });

    // 3️⃣ Abrir o descargar
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // 👉 abrir en nueva pestaña
    window.open(pdfUrl, "_blank");

    // 👉 o forzar descarga
    // const a = document.createElement("a");
    // a.href = pdfUrl;
    // a.download = fileName;
    // a.click();
  };

  return (
    <motion.div
      className={`flex flex-row gap-4 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="size-[24px] border rounded-sm p-1 flex flex-col justify-center items-center shrink-0 text-zinc-500">
        {role === "assistant" ? <BotIcon /> : <UserIcon />}
      </div>

      <div className="flex flex-col gap-2 w-full">
        {role === "user" ? "Usuario: " : "Asistente de IA: "}

        {parts?.map((part, index) => {
          const partId =
            ("toolCallId" in part ? part.toolCallId : null) ||
            `${chatId}-part-${index}-${part.type}`;

          return (
            <div key={partId}>
              {/* texto normal */}
              {part.type === "text" ? <span>{part.text}</span> : null}

              {/* Tools functions */}

              {/* getUsers */}
              {/* {part.type === "tool-getUsers" ? (
                <ListUsers
                  charId={chatId}
                  users={part?.output as User[]}
                  sendMessage={sendMessage}
                />
              ) : null} */}

              {/* getUserById */}
              {/* {part.type === "tool-getUserById" ? (
                <UserDetails
                  user={part.output as User}
                  sendMessage={sendMessage}
                />
              ) : null} */}

              {/* getPredialDummy */}
              {part.type === "tool-getReferenceCode" ? (
                <PredialDummy
                  part={part}
                  onGeneratePaseDeCaja={handleGeneratePaseDeCaja}
                  onhandlePagarEnLinea={handlePagarEnLinea}
                />
              ) : null}

              {/* getPaseDeCaja */}
              {part.type === "tool-getPaseDeCaja"
                ? (() => {
                    const output = part.output as {
                      pdfBase64: string;
                      fileName: string;
                    };

                    return (
                      <PaseDeCaja
                        pdfBase64={output?.pdfBase64}
                        fileName={output?.fileName}
                        onDescargarPaseCaja={handleDescargarPaseCaja}
                      />
                    );
                  })()
                : null}

              {/* pagoEnLinea */}
              {part.type === "tool-pagoEnLinea" ? (
                <PagoLinea part={part.output as any} />
              ) : null}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
