const baseTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{{siteDescription}}">
    <title>{{pageTitle}}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <a href="/">{{navTitle}}</a>
        {{navigation}}
    </header>

    <main>
        {{content}}
    </main>

    <footer>
        <p>&copy; {{siteTitle}} 2024</p>
    </footer>

    <script src="script.js"><\/script>
</body>
</html>
`;

const navTemplate = `
<nav>
{{navItems}}
</nav>
`;

const navItemTemplate = `<a href="{{navPath}}">{{navLabel}}</a>`;

const templates = {
  hero: `<section>
<div>
    <h1>{{heading}}</h1>
    <p>{{subheading}}</p>
    <a href="{{ctaLink}}">{{ctaText}}</a>
</div>
</section>`,
  features: `<section>
<div>
    <h3>{{title}}</h3>
    <div class="features">
        {{items}}
    </div>
</div>
</section>`,
  features_item: `<div>
<span>{{icon}}</span>
<h4>{{heading}}</h4>
<p>{{description}}</p>
</div>`,
  team_members: `<section>
<h3>{{title}}</h3>
<div class="team-members">
    {{members}}
</div>
</section>`,
  team_members_item: `<div>
<img src="{{image}}" alt="{{name}}">
<h4>{{name}}</h4>
<p>{{role}}</p>
<p>{{bio}}</p>
</div>`,
  call_to_action: `<section>
<div>
    <h3>{{heading}}</h3>
    <p>{{subheading}}</p>
    <a href="{{ctaLink}}">{{ctaText}}</a>
</div>
</section>`,
  text_block: `<section>
<h3>{{title}}</h3>
<p>{{content}}</p>
</section>`,
  about: `<section class="about">
<h2>{{title}}</h2>
<p>{{content}}</p>
</section>`,
  contact: `<section class="contact">
<h2>{{title}}</h2>
<p>{{content}}</p>
<form>
    <label for="name">Name:</label>
    <input type="text" id="name" name="name">
    <label for="email">Email:</label>
    <input type="email" id="email" name="email">
    <label for="message">Message:</label>
    <textarea id="message" name="message"></textarea>
    <button type="submit">Send</button>
</form>
</section>`,
  "styles.css": `
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
}
`,
  "script.js": `
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
});
`,
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

  siteFiles["styles.css"] = templates["styles.css"];
  siteFiles["script.js"] = templates["script.js"];
  return siteFiles;
}
