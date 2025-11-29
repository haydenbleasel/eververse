import {
  ClockIcon,
  MessageCircleIcon,
  TablePropertiesIcon,
} from "lucide-react";

export const emptyStates = {
  feature: {
    icon: TablePropertiesIcon,
    title: "Add your first feature",
    description:
      "Your team can create features, prioritize them, and track their progress. You can also connect user feedback to features to make informed decisions.",
    video: "https://www.youtube.com/watch?v=Uo3cL4nrGOk",
    href: "/features",
    cta: "Create a feature",
  },
  feedback: {
    icon: MessageCircleIcon,
    title: "Add your first piece of feedback",
    description:
      "Your team and users can submit feedback, identify actionable insights, and infuse the voice of the customer into every phase of the product lifecycle.",
    video: "https://www.youtube.com/watch?v=Uo3cL4nrGOk",
    href: "/feedback",
    cta: "Add feedback",
  },
  changelog: {
    icon: ClockIcon,
    title: "Add your first product update",
    description:
      "Keep your users informed about the latest changes to your product. You can create, edit, and delete updates to keep everyone in the loop.",
    video: "https://www.youtube.com/watch?v=Uo3cL4nrGOk",
    href: "/changelog/new",
    cta: "Add a product update",
  },
  initiative: {
    icon: TablePropertiesIcon,
    title: "Create your first initiative",
    description:
      "Initiatives are a way to organize your product development efforts. Create an initiative to get started.",
    video: "https://www.youtube.com/watch?v=Uo3cL4nrGOk",
    href: "/initiatives",
    cta: "Create an initiative",
  },
};
