export function hrefForLabel(label: string) {
  const routes: Record<string, string> = {
    home: "/",
    buy: "/buy",
    "importation request": "/import",
    "auction assistance": "/import",
    sell: "/sell",
    rent: "/rent",
    about: "/about",
    "contact us": "/contact",
  };
  return routes[label.trim().toLowerCase()] ?? "/";
}
