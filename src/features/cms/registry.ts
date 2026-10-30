export const pageIds = ["global", "home", "buy", "rent", "import", "sell", "about", "contact", "policy"] as const;

export type PageId = (typeof pageIds)[number];
export type Locale = "en" | "fr";

type TextField = {
  type: "text" | "paragraph" | "button";
  default: string;
  maxLength: number;
};

type ListItem = string | { title: string; body?: string; cta?: string; category?: string };

type ListField = {
  type: "list";
  default: readonly ListItem[];
  maxLength: number;
};

type Field = TextField | ListField;

type Branch = { [key: string]: Field | Branch };

function limit(length: number) {
  return Math.ceil((length * 1.3) / 5) * 5;
}

function text(value: string, type: TextField["type"] = "text"): TextField {
  return { type, default: value, maxLength: limit(value.length) };
}

function list<const T extends readonly ListItem[]>(items: T) {
  const longest = items.reduce((max, item) => {
    const length = typeof item === "string" ? item.length : `${item.title}${item.body ?? ""}${item.cta ?? ""}`.length;
    return Math.max(max, length);
  }, 0);
  return { type: "list" as const, default: items, maxLength: limit(longest) };
}

export const registry = {
  global: {
    footer: {
      title: text("More than cars. A simpler way to move."),
      body: text(
        "Buy your next car, rent one for your plans, or get the support you need to buy and sell with confidence.",
        "paragraph",
      ),
      copyright: text("© 2026 — Copyright. All rights reserved."),
      explore_links: list(["Auction assistance", "Buy", "Sell", "Rent"]),
    },
    menu: {
      items: list(["Home", "buy", "importation request", "sell", "rent", "about", "contact us"]),
      tagline_title: text("Your next ride starts here."),
      tagline_body: text("Buy or rent a car in Ghana, or get help buying from Copart.", "paragraph"),
    },
  },
  home: {
    hero: {
      title: text("Your next ride starts here."),
      subtitle: text("Buy or rent a car in Ghana, or get help buying from Copart.", "paragraph"),
    },
    import: {
      title: text("Import cars, SUVs, pickups & more."),
      body: text(
        "Whatever kind of vehicle you're looking for, Ride Out can help you source and import it. Tell us what you need and we'll help you explore your options.",
        "paragraph",
      ),
      primary_cta: text("Start an import request", "button"),
      secondary_cta: text("View our Policy", "button"),
    },
    search: {
      title: text("Find your next ride"),
      view_all_cta: text("View all cars", "button"),
    },
    services: {
      title: text("Our Services"),
      body: text(
        "Whether you're looking to rent a car, buy one through Copart, or sell the one you already own, Ride-Out gives you a simpler way to make your next move.",
        "paragraph",
      ),
      items: list([
        { title: "Buy through Copart", body: "Get help buying, shipping and repairs", cta: "Help me find a car" },
        { title: "Sell your car", body: "Submit your car and connect with buyers" },
        { title: "Rent a car", body: "Explore rental cars and request dates you need", cta: "Explore Rentals" },
      ]),
    },
    how_it_works: {
      title: text("How Ride Out works"),
      subtitle: text("Getting your next vehicle starts with three simple steps.", "paragraph"),
      steps: list([
        { title: "Tell us what you're looking for" },
        {
          title: "We'll help you find your car",
          body: "We work with you to identify a suitable vehicle and coordinate the purchase and import process.",
        },
        {
          title: "Get ready for the road",
          body: "Follow the next steps toward receiving your vehicle, with optional repair support for vehicles imported through Ride-Out.",
        },
      ]),
    },
    cta: {
      title: text("Ready for your next move?"),
      body: text(
        "Whether you're looking to rent a car, buy one through Copart, or sell the one you already own, Ride-Out gives you a simpler way to make your next move.",
        "paragraph",
      ),
      button: text("Explore our fleet", "button"),
    },
  },
  about: {
    hero: {
      title: text("More than cars. A simpler way to move."),
      body: text(
        "From finding the right car to getting it where you need it, Ride-Out brings the essential parts of your automotive journey together in one place.",
        "paragraph",
      ),
      cta: text("Get to know Ride-Out", "button"),
    },
    vision: {
      title: text("A better automotive experience, for everyone."),
      body: text(
        "We envision a world where accessing the right vehicle and the services around it is simpler, more connected, and more accessible.",
        "paragraph",
      ),
      stats: list(["500+ Delivered", "5+ Experienced", "1000+ Trusted", "100+ On the road"]),
    },
    story: {
      eyebrow: text("Our Story"),
      title: text("The road to the right car shouldn't be complicated."),
    },
    what_we_do: {
      title: text("What we do"),
      subtitle: text("One destination. Multiple ways to move."),
      items: list([
        { title: "Rent a Car" },
        {
          title: "Buy & Sell",
          body: "Discover vehicles that fit your needs or take the next step toward selling your car through Ride-Out.",
        },
        { title: "Import & Auction Assistance" },
        { title: "Repairs & Buying Guidance" },
      ]),
    },
    why_choose_us: {
      title: text("Why Choose Us"),
      body: text(
        "We're committed to providing the best vehicle rental experience through innovation, quality, and exceptional customer service.",
        "paragraph",
      ),
      items: list(["A clearer way forward", "Support when it matters", "Choices that fit you"]),
    },
  },
  buy: {
    hero: {
      title: text("Find a car that's right for you."),
      body: text(
        "Browse available cars from Ride-Out and private sellers. Search by make, model, budget, and more to find your next ride.",
        "paragraph",
      ),
    },
    still_looking: {
      title: text("Still looking for something specific?"),
      body: text("Tell us what you're looking for and we'll help you explore your options.", "paragraph"),
      cta: text("Help me find a car", "button"),
    },
  },
  rent: {
    hero: {
      title: text("A ride for your plans."),
      body: text(
        "Explore available rental cars and find one that fits your dates, plans, and budget.",
        "paragraph",
      ),
    },
  },
  sell: {
    hero: {
      title: text("Ready to sell your car? Let's make it simple."),
      body: text(
        "Connect your vehicle with potential buyers through Ride-Out. Share a few details about your car, and we'll help you take the next step.",
        "paragraph",
      ),
      cta: text("Sell Your Car", "button"),
    },
  },
  import: {
    hero: {
      title: text("Import cars, SUVs, pickups & more."),
      body: text(
        "Find, purchase, and import your preferred vehicle with Ride-Out. Tell us what you're looking for, and we'll help you navigate the process from sourcing to importation.",
        "paragraph",
      ),
    },
    form_intro: {
      title: text("Let's find your next car."),
      body: text(
        "Tell us a little about the vehicle you're looking for. We'll use your answers to understand your needs and determine the next steps.",
        "paragraph",
      ),
    },
    faqs: {
      title: text("Frequently asked questions"),
      subtitle: text("A few things to know before getting started.", "paragraph"),
      items: list([{ title: "How does Ride-Out work?", category: "Getting started" }]),
      cta_title: text("Still have questions?"),
      cta: text("Contact our team", "button"),
    },
  },
  contact: {
    hero: {
      title: text("We're here to help you move forward."),
      body: text(
        "Have a question about buying, selling, renting, or importing a vehicle? Reach out to our team, and let's help you find the right way forward.",
        "paragraph",
      ),
      cta: text("Get in touch with us", "button"),
    },
    talk: {
      title: text("Talk to us."),
      body: text("Choose your preferred way to reach us, or send us a message using the form.", "paragraph"),
    },
  },
  policy: {
    title: text("Client Policy"),
    intro: text(
      "Everything you need to know before starting your vehicle importation journey with Ride Out.",
      "paragraph",
    ),
  },
} satisfies Record<PageId, Branch>;

export type Registry = typeof registry;

type ResolvedField<T> = T extends TextField ? string : T extends ListField ? T["default"] : never;

export type Resolved<T> = {
  [K in keyof T]: T[K] extends Field ? ResolvedField<T[K]> : T[K] extends Branch ? Resolved<T[K]> : never;
};

export function isField(value: unknown): value is Field {
  return value != null && typeof value === "object" && "type" in value && "default" in value;
}

export function pageDefaults<P extends PageId>(page: P): Resolved<Registry[P]> {
  return resolveBranch(registry[page]) as Resolved<Registry[P]>;
}

function resolveBranch(branch: Branch): Record<string, unknown> {
  const resolved: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(branch)) {
    resolved[key] = isField(value) ? value.default : resolveBranch(value);
  }
  return resolved;
}
