// main.js - handles Google login, logout, and generate example action

let loggingIn = false;

// Google login callback
window.handleCredentialResponse = async (response) => {
  if (loggingIn) return; // prevent double-callback issues
  loggingIn = true;

  try {
    const res = await fetch("/auth/google", {
      method: "POST",
      credentials: "include",  // <-- REQUIRED for Flask session cookie
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: response.credential })
    });

    if (res.ok) {
      // Give browser time to persist cookie
      await new Promise(r => setTimeout(r, 50));
      location.reload();
    } else {
      const data = await res.json().catch(() => ({}));
      alert("Login failed: " + (data.error || "Unknown error"));
      loggingIn = false; // allow retry
    }
  } catch (err) {
    console.error(err);
    alert("Network error during login");
    loggingIn = false;
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await fetch("/logout", { method: "POST", credentials: "include" });
      location.reload();
    });
  }

  const generateBtn = document.getElementById("generateBtn");
  if (generateBtn) {
    generateBtn.addEventListener("click", async () => {
      const res = await fetch("/generate_example", {
        method: "POST",
        credentials: "include"
      });
      if (res.ok) {
        alert("Generated example file!");
        location.href = "/files";
      } else {
        alert("Failed to generate file");
      }
    });
  }
});
