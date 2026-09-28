import API_URL, { getAuthHeaders } from "./api";

export async function getAllJobs() {
  const res = await fetch(`${API_URL}/jobs/open`, { 
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Erro ao buscar jobs: ${res.status}`);
  return res.json();
}

export async function getMyJobs() {
  const userId = localStorage.getItem("userId");
  if (!userId) throw new Error("Usuário não logado");

  const res = await fetch(`${API_URL}/jobs/employer/${userId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erro ao buscar meus jobs: ${res.status} - ${text}`);
  }
  return res.json();
}

export async function createJob(title: string, description: string, budget: number) {
  const userId = localStorage.getItem("userId");
  if (!userId) throw new Error("Usuário não logado");

  const res = await fetch(`${API_URL}/jobs?employerId=${userId}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ title, description, budget }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || "Erro ao criar job");
  }

  return res.json();
}

export async function updateJobStatus(jobId: number, status: string) {
  const url = `${API_URL}/jobs/${jobId}/status?status=${status}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ao atualizar status do job`);
  }
  return res.json();
}

export async function deleteJob(jobId: number) {
  const res = await fetch(`${API_URL}/jobs/${jobId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Erro ao deletar job: ${res.status}`);
}

export async function getById(id: number) {
  const res = await fetch(`${API_URL}/jobs/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao buscar detalhes do job");
  return res.json();
}