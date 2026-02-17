const button = document.getElementById("hello-button");
const result = document.getElementById("result");

if (button && result) {
  button.addEventListener("click", async () => {
    result.textContent = "Envoi de la requête...";

    try {
      const response = await fetch("/hello", { method: "POST" });
      const text = await response.text();
      result.textContent = `Réponse ESP32: ${text}`;
    } catch (error) {
      result.textContent = "Erreur réseau vers l'ESP32.";
      console.error(error);
    }
  });
}
