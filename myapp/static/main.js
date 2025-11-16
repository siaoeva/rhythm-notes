// main.js - handles Google login, logout, and generate example action

// Google login callback
window.handleCredentialResponse = async (response) => {
  try {
    const res = await fetch("/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: response.credential })
    });
    if (res.ok) {
      location.reload();
    } else {
      const data = await res.json();
      alert("Login failed: " + (data.error || JSON.stringify(data)));
    }
  } catch (err) {
    console.error(err);
    alert("Network error during login");
  }
};

// Logout button
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await fetch("/logout", { method: "POST" });
      location.reload();
    });
  }

  const generateBtn = document.getElementById("generateBtn");
  if (generateBtn) {
    generateBtn.addEventListener("click", async () => {
      const res = await fetch("/generate_example", { method: "POST" });
      if (res.ok) {
        alert("Generated example file!");
        location.href = "/files";
      } else {
        alert("Failed to generate file");
      }
    });
  }
});
