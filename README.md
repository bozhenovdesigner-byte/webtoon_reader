# webtoon_reader
# Webtoon Platform — Agent Instructions

## 1. Project Overview

This repository contains a small, static-first webtoon publishing and reading platform.

The platform is designed for a non-programmer content manager.

The main workflow is:

1. The artist creates episode images.
2. The content manager places the images into an episode folder.
3. Optional metadata is added using plain text files.
4. The content manager pushes changes to GitHub.
5. GitHub Actions validates the content, generates data, builds the site, and deploys it to GitHub Pages.

The platform must prioritize content and reading experience over complex UI.

---

## 2. Core Product Principles

### Content first

The story is the primary product.

The interface must not distract from reading.

### Mobile first

The primary reading experience is a smartphone.

Desktop support is required, but mobile layout and usability have priority.

### Simple publishing

The content manager is not a programmer.

Do not require manual editing of:

- HTML;
- JSON;
- JavaScript;
- generated indexes;
- route files;
- episode lists.

### Static-first architecture

The first version must work on GitHub Pages.

Do not introduce a backend unless it is clearly necessary.

### Future-proof content model

The platform must support multiple stories in the future.

Do not hardcode a single story into the application architecture.

---

## 3. Current Scope

### Required for v1

- One or more stories.
- Story title.
- Story description.
- Story cover.
- Episode list.
- Episode title.
- Episode description.
- Episode cover.
- Ordered episode images.
- Vertical reader.
- Previous/next episode navigation.
- Story navigation.
- Mobile-first responsive layout.
- Local reading progress.
- Automatic content discovery.
- Automatic metadata generation.
- Content validation.
- GitHub Pages deployment.

### Not required for v1

Do not implement:

- user accounts;
- authentication;
- comments;
- likes;
- subscriptions;
- ratings;
- social feed;
- payments;
- advertising;
- analytics dashboard;
- online image upload;
- complex admin panel;
- backend database.

These may be considered in future versions.

---

## 4. Content Is the Source of Truth

The `content/` directory is the source of truth.

Generated files must never be manually edited.

The application must discover content from the filesystem during the build process.

Do not require the content manager to maintain JSON files manually.

---

## 5. Content Structure

The preferred content structure is:

```text
content/
└── stories/
    └── story-001/
        ├── title.txt
        ├── description.txt
        ├── cover.jpg
        └── episodes/
            ├── 001 - Встреча/
            │   ├── title.txt
            │   ├── description.txt
            │   ├── cover.jpg
            │   └── images/
            │       ├── 001.jpg
            │       ├── 002.jpg
            │       └── 003.jpg
            │
            └── 002 - Следы/
                ├── title.txt
                ├── description.txt
                ├── cover.jpg
                └── images/
                    ├── 001.jpg
                    ├── 002.jpg
                    └── 003.jpg
```

### Metadata rules

`title.txt` contains only the title.

Example:

```text
Следы
```

`description.txt` contains only the description.

Example:

```text
Герои находят странный след в лесу.
```

Do not use JSON as the primary editing interface.

---

## 6. Naming Rules

### Story directory

Use a stable story identifier.

Example:

```text
story-001
```

### Episode directory

The episode directory name must begin with a numeric episode number.

Example:

```text
001 - Встреча
002 - Следы
003 - Тайна
```

The number determines episode order.

The remaining text is the default episode title.

If `title.txt` exists, its contents override the default title.

### Image files

Images must begin with a numeric sequence number.

Example:

```text
001.jpg
002.jpg
003.jpg
```

The numeric prefix determines reading order.

Do not rely on filesystem order.

---

## 7. Metadata Priority

Use the following priority:

### Episode title

1. `title.txt`
2. Title parsed from directory name
3. Fallback: `Эпизод N`

### Episode description

1. `description.txt`
2. Empty description

### Episode cover

1. `cover.jpg`
2. `cover.png`
3. First episode image
4. No cover

### Story title

1. `title.txt`
2. Story directory name

### Story description

1. `description.txt`
2. Empty description

### Publication date

Use the Git commit date or build metadata if available.

Do not require manual date entry for v1.

---

## 8. Image Requirements

The preferred working export size is:

```text
1600 × 2000 px
```

This is a recommendation, not a strict requirement.

The build system should accept reasonable variations in image dimensions.

Supported formats:

- JPG;
- JPEG;
- PNG.

Preferred color space:

```text
sRGB
```

Images must be displayed in the correct sequence.

The reader must not crop or distort the artwork.

Use responsive width and preserve the original aspect ratio.

---

## 9. Image Optimization

Image optimization may be performed during the build process.

The original content files must remain unchanged.

If optimized images are generated, store them in a generated directory.

Example:

```text
content/
    original images

generated/
    optimized images
```

Do not require the content manager to manually optimize images.

Do not introduce a complex image pipeline unless it is necessary.

---

## 10. Reader Requirements

The reader is the most important part of the application.

### Required behavior

- Vertical scrolling.
- Images displayed in sequence.
- No horizontal scrolling.
- No unnecessary gaps between images.
- Responsive width.
- Preserved aspect ratio.
- Previous episode button.
- Next episode button.
- Return to story button.
- Episode title and description.
- Loading state for images.
- Useful error state if an image is missing.

### Desktop behavior

On wide screens, limit the reader width to a comfortable reading width.

Do not stretch artwork across the entire viewport.

---

## 11. Mobile-first UI

The UI must be designed for touch interaction.

Use:

- readable typography;
- comfortable tap targets;
- simple navigation;
- minimal controls;
- responsive layout;
- accessible contrast.

Avoid:

- tiny buttons;
- hover-dependent interactions;
- unnecessary animations;
- complex menus;
- excessive decorative UI.

---

## 12. Reading Progress

For v1, reading progress may be stored in `localStorage`.

The application may store:

- last opened story;
- last opened episode;
- last reading position.

Do not require authentication.

Do not introduce a backend for reading progress.

---

## 13. Architecture

Prefer a simple static architecture.

Recommended initial stack:

- HTML;
- CSS;
- JavaScript;
- Node.js build scripts;
- GitHub Actions;
- GitHub Pages.

Do not introduce React, Next.js, a database, or a backend unless there is a clear technical reason.

If a framework is introduced, explain why it is necessary.

---

## 14. Suggested Directory Structure

```text
webtoon-platform/
│
├── index.html
│
├── pages/
│   ├── story.html
│   └── episode.html
│
├── css/
│   ├── variables.css
│   ├── global.css
│   ├── layout.css
│   ├── components.css
│   └── reader.css
│
├── js/
│   ├── app.js
│   ├── router.js
│   ├── reader.js
│   ├── navigation.js
│   └── storage.js
│
├── content/
│   └── stories/
│
├── generated/
│
├── assets/
│   ├── icons/
│   └── fonts/
│
├── scripts/
│   ├── build.js
│   ├── validate-content.js
│   ├── generate-data.js
│   └── optimize-images.js
│
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── AGENTS.md
└── README.md
```

This structure is a starting point, not a reason to create unnecessary files.

Keep the project simple.

---

## 15. Build Process

The build process should:

1. Scan the `content/` directory.
2. Discover stories.
3. Discover episodes.
4. Parse titles and descriptions.
5. Discover episode images.
6. Sort images numerically.
7. Validate content.
8. Generate structured data.
9. Generate or prepare optimized images.
10. Build the static site.
11. Deploy to GitHub Pages.

The content manager should only need to add files to `content/`.

---

## 16. Validation

Validation errors must be understandable to a non-programmer.

Examples:

```text
Episode "003 - Тайна" has no images directory.
```

```text
Episode "004 - Следы" contains duplicate image numbers.
```

```text
Episode "005 - Встреча" contains an unsupported file format.
```

```text
Story "story-001" has no title.txt.
```

Where possible, validation should warn instead of failing for optional metadata.

Missing required content should fail the build with a clear message.

---

## 17. Error Handling

The application must handle:

- missing images;
- missing descriptions;
- missing covers;
- empty episode folders;
- invalid filenames;
- unsupported image formats;
- invalid episode numbers.

Do not silently produce broken pages.

---

## 18. Development Rules

### Before coding

Inspect the repository structure.

Do not assume files exist.

Do not overwrite existing work without checking it.

### During coding

Prefer small, understandable changes.

Do not introduce unnecessary dependencies.

Do not create a complex architecture for hypothetical future requirements.

Do not manually edit generated files.

### After coding

Run validation.

Test the build.

Test the reader on mobile viewport sizes.

Check that adding a new episode works without code changes.

---

## 19. Definition of Done

A feature is complete only when:

- it works on GitHub Pages;
- it works on mobile;
- it does not require manual JSON editing;
- it does not require manual HTML editing;
- it does not break existing episodes;
- it has understandable error handling;
- it follows the content-first principle.

---

## 20. Important Product Decision

The platform is not a social network.

It is a simple, beautiful, reliable webtoon reader with a content-driven publishing workflow.

When choosing between a more complex feature and a simpler implementation, prefer the simpler implementation unless the complex feature is necessary for the current user experience.
