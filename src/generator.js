import baseTemplate from "./templates/monotype/base.html";
import navTemplate from "./templates/monotype/nav.html";
import navItemTemplate from "./templates/monotype/nav_item.html";

import aboutSectionTemplate from "./templates/monotype/sections/about.html";
import callToActionTemplate from "./templates/monotype/sections/call_to_action.html";
import contactSectionTemplate from "./templates/monotype/sections/contact.html";
import featuresItemTemplate from "./templates/monotype/sections/features_item.html";
import featuresTemplate from "./templates/monotype/sections/features.html";
import heroTemplate from "./templates/monotype/sections/hero.html";
import teamMembersItemTemplate from "./templates/monotype/sections/team_members_item.html";
import teamMemberTemplate from "./templates/monotype/sections/team_members.html";
import textBlockTemplate from "./templates/monotype/sections/text_block.html";

const templates = {
  hero: heroTemplate,
  features: featuresTemplate,
  features_item: featuresItemTemplate,
  team_members: teamMemberTemplate,
  team_members_item: teamMembersItemTemplate,
  text_block: textBlockTemplate,
  about: aboutSectionTemplate,
  call_to_action: callToActionTemplate,
  contact: contactSectionTemplate,
  styles: `
body {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-family: 'Roboto Mono', monospace;
  font-size: medium;
  background-color: #f4f4f4;
  color: #333;
  max-width: 64rem;
  margin: 0 auto;
  height: 100vh;
}

nav {
  display: flex;
  gap: 1rem;
}

header, footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3rem 0;
}

main {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 4rem;
}

.team-members, .features {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
}`,
  script: `
document.addEventListener('DOMContentLoaded', () => {
  const ctaButton = document.querySelector('.hero-content .cta-button');

  if (ctaButton) {
    ctaButton.addEventListener('click', (event) => {
      // Prevent the default link behavior
      event.preventDefault();

      // Example of adding interactivity: a simple alert
      alert('You clicked the "Learn More" button! Redirecting to about page.');

      // In a real application, you might do something more complex here
      // For instance, you could fade in a modal or an FAQ section.
      setTimeout(() => {
        window.location.href = event.target.href;
      }, 1000); 
    });
  }
});`,
};

export function generateHTML(siteData) {
  const siteFiles = {};

  const navItemsHtml = siteData.pages
    .filter((page) => page.path !== "/index.html")
    .map((page) =>
      navItemTemplate
        .replace(/{{navPath}}/g, page.path)
        .replace(/{{navLabel}}/g, page.navLabel)
    )
    .join("");
  const navHtml = navTemplate.replace(/{{navItems}}/g, navItemsHtml);

  for (const page of siteData.pages) {
    let pageContent = "";
    for (const section of page.sections) {
      let sectionTemplate = templates[section.type];
      if (!sectionTemplate) {
        console.error(`Template not found for section type: ${section.type}`);
        continue;
      }

      for (const key in section.data) {
        if (Array.isArray(section.data[key])) {
          const itemTemplate = templates[`${section.type}_item`];
          if (!itemTemplate) continue;
          const itemsHtml = section.data[key]
            .map((item) => {
              let itemHtml = itemTemplate;
              for (const itemKey in item) {
                itemHtml = itemHtml.replace(
                  new RegExp(`{{${itemKey}}}`, "g"),
                  item[itemKey]
                );
              }
              return itemHtml;
            })
            .join("");
          sectionTemplate = sectionTemplate.replace(
            new RegExp(`{{${key}}}`, "g"),
            itemsHtml
          );
        } else {
          sectionTemplate = sectionTemplate.replace(
            new RegExp(`{{${key}}}`, "g"),
            section.data[key]
          );
        }
      }
      pageContent += sectionTemplate;
    }

    const finalHtml = baseTemplate
      .replace(/{{pageTitle}}/g, page.pageTitle)
      .replace(/{{siteDescription}}/g, siteData.siteMetadata.description)
      .replace(/{{siteTitle}}/g, siteData.siteMetadata.title)
      .replace(/{{content}}/g, pageContent)
      .replace(/{{navTitle}}/g, siteData.siteMetadata.navTitle)
      .replace(/{{navigation}}/g, navHtml);

    siteFiles[page.fileName] = finalHtml;
  }

  siteFiles["styles.css"] = templates["styles"];
  siteFiles["script.js"] = templates["script"];
  return siteFiles;
}
