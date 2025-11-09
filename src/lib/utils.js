import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ENGINE_URL } from "./constants";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export async function makeRequest(method = "POST", url = "/", data = {}, callback = () => {}) {
  let response;

  const headers = {
    "Content-Type": "application/json; charset=UTF-8",
  };

  // Додаємо токен для авторизованих запитів
  if (!url.includes("/login") && !url.includes("/register")) {
    const token = localStorage.getItem("auth_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    response = await fetch(ENGINE_URL + url, {
      method: method.toUpperCase(),
      headers,
      credentials: "include",
      body: method.toUpperCase() === "GET" ? undefined : JSON.stringify(data),
    });
  } catch (error) {
    callback({ status: "error", message: JSON.stringify(error) });
    return;
  }

  if (response.ok) {
    const d = await response.json();
    callback(d);
  } else {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        status: "error",
        message: response.statusText,
        http_status: response.status,
      };
    }
    if (!errorData.message) {
      errorData.message = response.statusText || "Невідома помилка";
    }
    callback(errorData);
  }
}
