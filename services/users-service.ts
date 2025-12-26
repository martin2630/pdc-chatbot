import { User } from "@/interfaces/user.interfaces";

interface GetUsersServiceParams {
  id?: number;
}

export const getUsersService = async (
  id?: GetUsersServiceParams
): Promise<User[]> => {
  let url = `https://jsonplaceholder.typicode.com/users`;
  if (id) {
    url = `https://jsonplaceholder.typicode.com/users/${id}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error obteniendo el usuario");
  const data = await res.json();
  return data;
};
