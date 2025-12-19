"use client";

import { User } from "@/interfaces/user.interfaces";

interface Props {
  user?: User;
  sendMessage?: (message: any) => void;
}

const SAMPLE: User = {
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
};

export function UserDetails({ user = SAMPLE }: Props) {
  return (
    <div className="rounded-lg bg-muted p-6 flex flex-col gap-6">
      {/* Header con nombre y username */}
      <div className="flex flex-col gap-2 border-b dark:border-zinc-700 pb-4">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="text-2xl font-semibold text-foreground">
              {user?.name || "Usuario"}
            </h3>
            <p className="text-sm text-muted-foreground">@{user?.username}</p>
          </div>
          <div className="flex items-center justify-center size-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-semibold text-lg">
            {user?.name?.charAt(0) || "U"}
          </div>
        </div>
      </div>

      {/* Información de contacto */}
      <div className="flex flex-col gap-4">
        <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Información de Contacto
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Email
            </div>
            <a
              href={`mailto:${user?.email}`}
              className="text-sm text-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors break-all"
            >
              {user?.email}
            </a>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Teléfono
            </div>
            <a
              href={`tel:${user?.phone?.replace(/\s/g, "")}`}
              className="text-sm text-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              {user?.phone}
            </a>
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Sitio Web
            </div>
            <a
              href={`https://${user?.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              {user?.website}
            </a>
          </div>
        </div>
      </div>

      {/* Dirección */}
      <div className="flex flex-col gap-4">
        <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Dirección
        </h4>
        <div className="flex flex-col gap-2 text-sm">
          <div className="text-foreground">
            {user?.address?.street} {user?.address?.suite}
          </div>
          <div className="text-muted-foreground">
            {user?.address?.city}, {user?.address?.zipcode}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Coordenadas: {user?.address?.geo?.lat}, {user?.address?.geo?.lng}
          </div>
        </div>
      </div>

      {/* Empresa */}
      <div className="flex flex-col gap-4">
        <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Empresa
        </h4>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium text-foreground">
              {user?.company?.name}
            </div>
            <div className="text-sm text-muted-foreground italic">
              {user?.company?.catchPhrase}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {user?.company?.bs}
            </div>
          </div>
        </div>
      </div>

      {/* ID del usuario */}
      <div className="flex flex-row items-center justify-between pt-4 border-t dark:border-zinc-700">
        <div className="text-xs text-muted-foreground">ID de Usuario</div>
        <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
          #{user?.id}
        </div>
      </div>
    </div>
  );
}
