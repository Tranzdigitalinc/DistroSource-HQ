import type { GamingProduct } from "@/lib/gaming/catalog/types"
import { LAUNCH_DATE, card, image } from "@/lib/gaming/catalog/media"

/** Server & Community subscriptions added in the second catalogue batch (product 27). */

export const COMMUNITY_CREATOR_PRODUCTS_2: GamingProduct[] = [
  /* ------------------------------------------------------------------ */
  {
    id: "gs-community-onboarding-playbook",
    slug: "community-onboarding-playbook",
    title: "Onboarding Playbook",
    platform: "community",
    category: "onboarding",
    tags: ["Onboarding", "Discord", "Membership"],
    frameworks: [],
    summary: "An onboarding system for game communities — welcome journey, rules quiz, mentor programme and week-one check-ins — with a new playbook every month.",
    description: [
      "Onboarding Playbook is a subscription that helps game communities turn new arrivals into regulars. It combines ready-to-use onboarding tools — a Discord welcome journey, a rules quiz, role selection, a mentor programme and week-one check-ins — with written playbooks that explain how to run each one and what to watch.",
      "It is for community teams who see people join, read a channel or two and leave. The journey walks each member from verification to their first event, the quiz makes sure the rules are read rather than scrolled past, and mentors are matched by game, time zone and language. A dashboard shows where people drop out, so staff fix the step that loses them instead of guessing.",
      "A new playbook, message pack or tool update is released every month while you are subscribed. If you cancel, updates stop and the licence to run the onboarding tools ends with the period you have paid for. Member data stays on your own host.",
    ],
    whatYouGet: [
      "Discord welcome journey from verification to first event",
      "Rules quiz with question banks and retry rules",
      "Role and interest selection menus",
      "Mentor programme with matching and check-ins",
      "Drop-off dashboard for each onboarding step",
      "Written playbooks with message templates",
      "A new playbook or tool update every month",
    ],
    features: [
      { title: "From join to regular", body: "Each step leads to the next, ending with the member's first event." },
      { title: "Rules actually read", body: "A short quiz replaces the rules channel nobody opens." },
      { title: "See the leak", body: "The dashboard shows which step loses people, so staff fix the right thing." },
    ],
    compatibility: ["Discord", "Node.js 20 or newer", "Any VPS or container host", "Optional links to FiveM and Minecraft whitelists"],
    requirements: ["A Discord server where you can add bots", "A host to run the onboarding bot"],
    license: [
      "Licensed for the communities you own or operate.",
      "You may edit the messages, quizzes and playbooks for those communities.",
      "Reselling, sharing or re-uploading the files is not permitted.",
      "The tools are licensed while your subscription is active.",
    ],
    installation: [
      "Download the onboarding bot and playbooks from your Gaming Library.",
      "Create a bot application in the Discord developer portal and add its token to the config.",
      "Start the bot with Docker or Node.js and open the setup dashboard.",
      "Choose your journey steps, write your quiz and invite your first mentors.",
    ],
    pricing: { kind: "subscription", monthly: 121, annual: Math.floor((121 * 9.6) / 5) * 5 },
    models: ["membership", "monthly-drop"],
    cadence: ["A new playbook or message pack every month", "Tool updates and fixes as they release", "Updates when Discord's API changes"],
    afterCancel: [
      "Access and updates continue until the end of the period you paid for.",
      "The licence to run the onboarding tools ends with the subscription.",
      "Member data stays on your own host.",
    ],
    eligibleResourceTypes: ["Welcome journeys", "Rules quizzes", "Mentor programmes", "Onboarding dashboards", "Playbooks and templates"],
    media: [
      image("community-onboarding-playbook", "cover", "Onboarding journey builder with seven steps from verification to first event", "Built interface — journey builder"),
      image("community-onboarding-playbook", "gallery-2", "Rules quiz in a community chat app with a question, answers and progress", "Built interface — rules quiz"),
      image("community-onboarding-playbook", "gallery-3", "Mentor programme board pairing new members with mentors and week-one check-ins", "Built interface — mentor board"),
    ],
    cardImage: card("community-onboarding-playbook", "Onboarding Playbook — journey builder preview"),
    availability: "on-sale",
    curation: 27,
    releasedAt: LAUNCH_DATE,
    updatedAt: LAUNCH_DATE,
    searchTerms: ["onboarding", "welcome", "new members", "rules quiz", "mentor", "retention", "discord bot", "verification"],
  },
]
