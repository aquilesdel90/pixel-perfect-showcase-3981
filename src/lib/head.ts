export const pageHead = (title: string, description: string) => () => ({
  meta: [
    { title: `${title} — SM Platform` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} — SM Platform` },
    { property: "og:description", content: description },
  ],
});
