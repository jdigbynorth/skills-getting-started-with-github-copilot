document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");


  
  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Create participants list HTML
        const participantsList = `
          <ul class="participants-list" style="list-style-type: disc; margin-left: 1.5em; padding-left: 0;">
            ${
              details.participants.length
                ? details.participants.map(p => `<li style="display: list-item; margin-bottom: 0.25em; white-space: pre-line;">${p}</li>`).join("")
                : `<li class="participants-none" style="display: list-item;">No participants yet.</li>`
            }
          </ul>
        `;

        // Add unregister form
        const unregisterForm = `
          <form class="unregister-form" data-activity="${name}" style="margin-top: 0.5em;">
            <input type="email" name="unregister-email" placeholder="Your email to unregister" required style="width: 70%; padding: 0.25em;"/>
            <button type="submit" style="padding: 0.25em 0.5em;">Unregister</button>
          </form>
        `;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <strong>Participants:</strong>
            ${participantsList}
          </div>
          ${unregisterForm}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Add event listeners for unregister forms
      document.querySelectorAll(".unregister-form").forEach(form => {
        form.addEventListener("submit", async (event) => {
          event.preventDefault();
          const activity = form.getAttribute("data-activity");
          const email = form.querySelector('input[name="unregister-email"]').value;

          try {
            const response = await fetch(
              `/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`,
              {
                method: "POST",
              }
            );
            const result = await response.json();

            if (response.ok) {
              messageDiv.textContent = result.message;
              messageDiv.className = "success";
              form.reset();
              fetchActivities(); // Refresh list
            } else {
              messageDiv.textContent = result.detail || "An error occurred";
              messageDiv.className = "error";
            }
            messageDiv.classList.remove("hidden");
            setTimeout(() => {
              messageDiv.classList.add("hidden");
            }, 5000);
          } catch (error) {
            messageDiv.textContent = "Failed to unregister. Please try again.";
            messageDiv.className = "error";
            messageDiv.classList.remove("hidden");
            console.error("Error unregistering:", error);
          }
        });
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
