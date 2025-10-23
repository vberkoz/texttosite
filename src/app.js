// src/app.js

import "./styles.css";
import promptContent from "./system_prompt.txt";

import { openDB, saveSite } from "./db.js";
import { generateHTML } from "./generator.js";
import { displaySavedSites, displaySite } from "./ui.js";

const API_URL = "https://ubg2r7jv12.execute-api.us-east-1.amazonaws.com/api/";

function updateButtonState() {
  const promptInput = document.getElementById("prompt_input");
  const generateButton = document.getElementById("generate_button");
  generateButton.disabled = promptInput.value.trim() === "";
}

async function handleGeneration() {
  const promptInput = document.getElementById("prompt_input");
  const generateButton = document.getElementById("generate_button");
  const sendIcon = document.getElementById("send_icon");
  const spinner = document.getElementById("spinner");

  generateButton.disabled = true;
  sendIcon.style.display = "none";
  spinner.style.display = "block";

  const userPrompt = promptInput.value;
  const systemPrompt = promptContent;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: userPrompt,
        system: systemPrompt,
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.statusText}`);
    let data = await response.json();

    const jsonContent = JSON.parse(data.output);
    console.log(jsonContent);

    const siteName = jsonContent.siteMetadata.title || `Site-${new Date().getTime()}`;

    const siteFiles = generateHTML(jsonContent);

    await saveSite(siteName, siteFiles);
    await displaySavedSites();

    displaySite(siteFiles);

  } catch (error) {
    console.error("Error:", error);
    alert("Failed to generate site. Please check the console for details.");
  } finally {
    sendIcon.style.display = "block";
    spinner.style.display = "none";
    updateButtonState(); 
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.getAttribute('data-tab');

      tabButtons.forEach(btn => btn.classList.remove('active'));

      button.classList.add('active');

      tabContents.forEach(content => content.classList.remove('active'));

      const activeContent = document.getElementById(tabId);
      if (activeContent) {
        activeContent.classList.add('active');
      }
    });
  });
  
  const promptInput = document.getElementById("prompt_input");
  document.getElementById("current_year").textContent = new Date().getFullYear();
  
  updateButtonState(); 
  promptInput.addEventListener("input", updateButtonState);

  document
    .getElementById("generate_button")
    .addEventListener("click", handleGeneration);

  const script = document.createElement("script");
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
  document.body.appendChild(script);

  try {
    await openDB();
    await displaySavedSites();
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
});
