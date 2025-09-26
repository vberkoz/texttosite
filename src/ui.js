import { getSites, removeSite } from "./db.js";

export function createDownloadButton(siteName, fileData) {
  const button = document.createElement("button");
  button.textContent = "Download ZIP";
  button.onclick = async () => {
    const zip = new JSZip();
    for (const [fileName, content] of Object.entries(fileData)) {
      zip.file(fileName, content);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${siteName}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return button;
}

export async function displaySavedSites() {
  const sitesList = document.getElementById("sites_list");
  sitesList.innerHTML = "";
  const sites = await getSites();
  if (sites.length === 0) {
    sitesList.innerHTML = "<p>No sites saved yet.</p>";
    return;
  }

  sites.forEach((site) => {
    const li = document.createElement("li");
    li.className = "site-item";
    li.innerHTML = `<span>${site.name}</span>`;

    const buttonGroup = document.createElement("div");
    buttonGroup.className = "button-group";

    const viewButton = document.createElement("button");
    viewButton.textContent = "View";
    viewButton.onclick = () => displaySite(site.data);

    const downloadButton = createDownloadButton(site.name, site.data);

    buttonGroup.appendChild(viewButton);
    buttonGroup.appendChild(downloadButton);

    li.appendChild(buttonGroup);
    sitesList.appendChild(li);

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.style.backgroundColor = "#e74c3c"; // Optional: Style the remove button red
    removeButton.onclick = async () => {
      if (confirm(`Are you sure you want to remove the site "${site.name}"?`)) {
        await removeSite(site.name);
        await displaySavedSites(); // Refresh the list
      }
    };

    buttonGroup.appendChild(viewButton);
    buttonGroup.appendChild(downloadButton);
    buttonGroup.appendChild(removeButton); // Add the new remove button

    li.appendChild(buttonGroup);
    sitesList.appendChild(li);
  });
}

export function displaySite(siteFiles) {
  const iframe = document.getElementById("site_iframe");
  const displayDiv = document.getElementById("site_display");
  displayDiv.style.display = "block";

  function loadPage(fileName) {
    const iframeDoc = iframe.contentDocument;
    iframeDoc.open();
    iframeDoc.write(siteFiles[fileName]);
    iframeDoc.close();

    // Re-inject CSS
    const styleTag = iframeDoc.createElement("style");
    styleTag.textContent = siteFiles["styles.css"];
    iframeDoc.head.appendChild(styleTag);

    // Intercept link clicks INSIDE the iframe
    iframeDoc.addEventListener("click", (event) => {
      const target = event.target.closest("a");
      if (target) {
        const href = target.getAttribute("href");
        if (href) {
          event.preventDefault();

          let targetFile;

          // Handle different href formats
          if (href === "/" || href === "/index.html" || href === "index.html") {
            targetFile = "index.html";
          } else {
            // Remove leading slash if present
            targetFile = href.startsWith("/") ? href.substring(1) : href;
          }

          // Check if the file exists in siteFiles
          if (siteFiles[targetFile]) {
            loadPage(targetFile);
          } else {
            console.warn(`File not found: ${targetFile}`);
          }
        }
      }
    });

    // Re-inject JS
    const scriptTag = iframeDoc.createElement("script");
    scriptTag.textContent = siteFiles["script.js"];
    iframeDoc.body.appendChild(scriptTag);
  }

  // Add the new function call here
  iframe.onload = function () {
    try {
      const iframeBody = iframe.contentWindow.document.body;
      const contentHeight = iframeBody.scrollHeight + 1;
      iframe.style.height = contentHeight + "px";
    } catch (e) {
      console.error("Could not set iframe height:", e);
      iframe.style.height = "600px"; // Fallback
    }
  };

  // Initial load of the index.html page
  loadPage("index.html");
}
