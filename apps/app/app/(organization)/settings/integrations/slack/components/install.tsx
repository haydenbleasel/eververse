import { Prose } from "@repo/design-system/components/prose";
import { StackCard } from "@repo/design-system/components/stack-card";
import Image from "next/image";
import { SlackInstallationForm } from "./install-form";

export const InstallSlack = () => (
  <>
    <div className="grid gap-2">
      <h1 className="m-0 font-semibold text-4xl tracking-tight">
        Install Slack
      </h1>
      <p className="mt-2 mb-0 text-muted-foreground">
        Follow the steps below to integrate Slack with Eververse. This assumes
        you already have a Slack account. If you don&apos;t, head to the{" "}
        <a
          className="text-primary underline"
          href="https://slack.com/get-started"
          rel="noreferrer"
          target="_blank"
        >
          Slack signup page
        </a>
        .
      </p>
    </div>
    <StackCard title="1. Add Incoming WebHooks">
      <Prose className="max-w-none">
        <p>
          To get started, you need to create a new Incoming WebHooks. Go to the{" "}
          <a
            href="https://eververse.slack.com/marketplace/new/A0F7XDUAZ-incoming-webhooks"
            rel="noreferrer"
            target="_blank"
          >
            Incoming WebHooks
          </a>{" "}
          app in the Slack App Directory and click "Add to Slack".
        </p>
      </Prose>
    </StackCard>
    <StackCard title="2. Choose your channel">
      <Prose className="max-w-none">
        <p>
          Select the channel you want to send notifications to. You can also
          create a new channel.
        </p>
        <p>Then, hit "Add Incoming WebHooks integration".</p>
      </Prose>
    </StackCard>
    <StackCard title="3. Add a name and icon">
      <Prose className="max-w-none">
        <p>
          Scroll down to "Customize Name" and rename "incoming-webhook" to
          Eververse.
        </p>

        <p>Here is an icon you can use for the "Customize Icon" section:</p>

        <Image
          alt="Eververse icon"
          height={192}
          src="/apple-icon.png"
          unoptimized
          width={192}
        />
      </Prose>
    </StackCard>
    <StackCard title="4. Copy the Webhook URL">
      <Prose className="max-w-none">
        <p>
          Scroll back up to the "Webhook URL" section at the top. Copy and paste
          your newly provided Webhook URL into the field below.
        </p>

        <SlackInstallationForm />
      </Prose>
    </StackCard>
  </>
);
