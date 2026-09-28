import API_URL, { getAuthHeaders } from "./api";

export async function createApplication(jobId: number, freelancerId: number) {
  const url = `${API_URL}/applications?freelancerId=${freelancerId}`;
  
  const res = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ jobId }),
  });

  if (!res.ok) {
    const responseText = await res.text();
    console.error(`Erro na requisição POST ${url} [HTTP ${res.status}]:`, responseText);

    let errorMsg = "";
    try {
      const errorJson = JSON.parse(responseText);
      errorMsg = errorJson.message || errorJson.error;
    } catch {
      errorMsg = responseText;
    }

    throw new Error(errorMsg || `Erro ao processar candidatura (HTTP ${res.status}).`);
  }

  return res.json();
}

export async function getMyApplications(freelancerId: number) {
  if (!freelancerId || isNaN(freelancerId)) return [];
  try {
    const res = await fetch(`${API_URL}/applications/freelancer/${freelancerId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.content || []);
  } catch (error) {
    return [];
  }
}

export async function getApplicationsByJob(jobId: number) {
  try {
    const res = await fetch(`${API_URL}/applications/job/${jobId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.content || []);
  } catch (error) {
    console.error("Erro ao buscar candidatos:", error);
    return [];
  }
}

export async function updateApplicationStatus(applicationId: number, status: 'ACCEPTED' | 'REFUSED') {
  const res = await fetch(`${API_URL}/applications/${applicationId}/status?status=${status}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Erro ao atualizar status");
  }

  return res.json();
}