
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form");
    const input = document.getElementById("inp");
    const msgs = document.getElementById("msgs");

    if (!form || !input || !msgs) {
        console.error("Chatbot elements not found.");
        return;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const text = input.value.trim();
        if (!text) return;

        msgs.innerHTML += `<div><b>You:</b> ${text}</div>`;
        input.value = "";

        try {
            const res = await fetch("/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text })
            });

            const data = await res.json();
            msgs.innerHTML += `<div><b>Bot:</b> ${data.reply}</div>`;
            msgs.scrollTop = msgs.scrollHeight;

        } catch (err) {
            msgs.innerHTML += `<div><b>Error:</b> Could not reach server.</div>`;
        }
    });
});
