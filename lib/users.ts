import API_URL, { getAuthHeaders } from "./api"

export async function getUserProfile(userId: number) {

  const res = await fetch(`${API_URL}/users/${userId}`, {
    headers: getAuthHeaders()
  })

  if (!res.ok) throw new Error("Erro ao buscar usuário")

  return res.json()
}

export async function deleteAccount(userId: number) {

  const res = await fetch(`${API_URL}/users/${userId}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  })

  if (!res.ok) throw new Error("Erro ao excluir conta")

  return true
}

export async function updateUserProfile(userId: number, data: { phone?: string; aboutMe?: string }) {
  const res = await fetch(`${API_URL}/users/${userId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })

  if (!res.ok) throw new Error("Erro ao atualizar o perfil")

  return res.json()
}