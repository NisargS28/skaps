export async function login(email: string, password: string) {
  const response = await fetch("http://localhost:8000/api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    let errorMessage = "Invalid email or password";
    try {
      const data = await response.json();
      if (data.detail) {
        errorMessage = data.detail;
      }
    } catch (e) {
      // Ignore json parsing errors for error responses
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
