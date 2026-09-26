const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";


// -----------------------------
// Authentication
// -----------------------------

export async function signup(data: {
  name: string;
  email: string;
  password: string;
  organization_name: string;
}) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error("Backend error:", result);

    const detail =
      typeof result.detail === "string"
        ? result.detail
        : JSON.stringify(result.detail);

    throw new Error(detail || "Registration failed");
  }

  return result;
}


export async function login(data: {
  email: string;
  password: string;
}) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error("Backend error:", result);

    const detail =
      typeof result.detail === "string"
        ? result.detail
        : JSON.stringify(result.detail);

    throw new Error(detail || "Login failed");
  }

  return result;
}


// -----------------------------
// User
// -----------------------------

export async function getProfile() {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof result.detail === "string"
        ? result.detail
        : "Failed to get profile"
    );
  }

  return result;
}


// -----------------------------
// Documents
// -----------------------------

export async function getDocuments() {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/documents`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof result.detail === "string"
        ? result.detail
        : "Failed to get documents"
    );
  }

  return result;
}


export async function uploadDocument(file: File) {
  const token = localStorage.getItem("access_token");

  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(`${API_URL}/documents/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof result.detail === "string"
        ? result.detail
        : "Failed to upload document"
    );
  }

  return result;
}

export async function askQuestion(data: {
  question: string;
  document_id: number;
  top_k?: number;
}) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      question: data.question,
      document_id: data.document_id,
      top_k: data.top_k ?? 5,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof result.detail === "string"
        ? result.detail
        : "Failed to get AI response"
    );
  }

  return result;
}

export async function getAdminAnalytics(days: number = 30) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/admin/analytics?days=${days}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof result.detail === "string"
        ? result.detail
        : "Failed to load analytics"
    );
  }

  return result;
}

export async function getAdminInsights(days = 30) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/admin/insights?days=${days}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    console.error("AI Insights API Error:", {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });

    throw new Error(
      `Failed to load AI insights (${response.status}): ${errorText}`
    );
  }

  return response.json();
}

export async function createEmployee(data: {
  name: string;
  email: string;
  password: string;
}) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/users/employees`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof result.detail === "string"
        ? result.detail
        : "Failed to create employee"
    );
  }

  return result;
}

export async function getEmployees() {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/users/employees`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof result.detail === "string"
        ? result.detail
        : "Failed to fetch employees"
    );
  }

  return result;
}