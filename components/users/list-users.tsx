"use client";

import { User } from "@/interfaces/user.interfaces";

const SAMPLE_USERS: any[] = [
  {
    id: 1,
    name: "Leanne Graham",
    username: "Bret",
    email: "Sincere@april.biz",
    address: {
      street: "Kulas Light",
      suite: "Apt. 556",
      city: "Gwenborough",
      zipcode: "92998-3874",
      geo: {
        lat: "-37.3159",
        lng: "81.1496",
      },
    },
    phone: "1-770-736-8031 x56442",
    website: "hildegard.org",
    company: {
      name: "Romaguera-Crona",
      catchPhrase: "Multi-layered client-server neural-net",
      bs: "harness real-time e-markets",
    },
  },
  {
    id: 2,
    name: "Ervin Howell",
    username: "Antonette",
    email: "Shanna@melissa.tv",
    address: {
      street: "Victor Plains",
      suite: "Suite 879",
      city: "Wisokyburgh",
      zipcode: "90566-7771",
      geo: {
        lat: "-43.9509",
        lng: "-34.4618",
      },
    },
    phone: "010-692-6593 x09125",
    website: "anastasia.net",
    company: {
      name: "Deckow-Crist",
      catchPhrase: "Proactive didactic contingency",
      bs: "synergize scalable supply-chains",
    },
  },
];

interface Props {
  charId: string;
  users?: User[];
  sendMessage?: (message: any) => void;
}

export function ListUsers({ users = SAMPLE_USERS, sendMessage }: Props) {
  const append = async (message: { role: string; content: string }) => {
    // Si usamos sendMessage del prop, automáticamente incluye todos los mensajes
    // Si usamos el hook, también debería incluirlos automáticamente
    if (sendMessage) {
      await sendMessage(message);
    }
  };

  return (
    <div className="rounded-lg bg-muted px-4 py-1.5 flex flex-col">
      {users?.map((user) => (
        <div
          key={`user-${user.id || user.email}`}
          className="cursor-pointer flex flex-row border-b dark:border-zinc-700 py-2 last-of-type:border-none group"
          onClick={() => {
            append({
              role: "user",
              content: `Quiero ver el detalle del usuario con id: ${user.id}`,
            });
          }}
        >
          <div className="flex flex-col w-full gap-0.5 justify-between">
            <div className="flex flex-row gap-0.5 text-base sm:text-base font-medium group-hover:underline">
              <div className="text">
                {user?.name || user?.username || "Usuario sin nombre"}
              </div>
            </div>
            <div className="text w-fit hidden sm:flex text-sm text-muted-foreground flex-row gap-2">
              <div>{user?.email || ""}</div>
            </div>
            <div className="text sm:hidden text-xs sm:text-sm text-muted-foreground flex flex-row gap-2">
              {user?.address?.city || ""}
            </div>
          </div>

          <div className="flex flex-col gap-0.5 justify-between">
            <div className="flex flex-row gap-2">
              <div className="text-base sm:text-base">{user?.phone || ""}</div>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground flex flex-row">
              <div>{user?.address?.city || ""}</div>
              {user?.address?.city && user?.address?.zipcode && <div>–</div>}
              <div>{user?.address?.zipcode || ""}</div>
            </div>
          </div>

          <div className="flex flex-col w-32 items-end gap-0.5">
            <div className="flex flex-row gap-2">
              <div className="text-base sm:text-base text-emerald-600 dark:text-emerald-500">
                ID: {user?.id || "N/A"}
              </div>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground flex flex-row">
              {user?.company?.name || ""}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
