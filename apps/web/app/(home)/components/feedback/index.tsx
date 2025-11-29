import { Container } from "@repo/design-system/components/container";
import type { HTMLAttributes } from "react";
import { Card } from "@/app/(home)/components/card";
import { FeatureHero } from "@/components/feature-hero";
import { features } from "@/lib/features";
import { MediaFeedbackGraphic } from "./components/media-feedback-graphic";
import { SentimentGraphic } from "./components/sentiment-graphic";
import { SummarizeGraphic } from "./components/summarize-graphic";
import { TranscriptionGraphic } from "./components/transcription-graphic";

type FeedbackProperties = HTMLAttributes<HTMLDivElement>;

export const Feedback = (properties: FeedbackProperties) => (
  <section {...properties}>
    <Container className="flex flex-col gap-8 border-x px-4 pt-16 pb-4">
      <FeatureHero {...features.feedback} />
      <div className="grid gap-4 md:grid-cols-6">
        <Card
          className="h-full md:col-span-3"
          description="Eververse summarizes feedback, extracting pain points, recommendations and desired outcomes, to help clarify what your customers want."
          feature="AI Feedback Summarization"
          title="Understand the voice of the customer"
        >
          <SummarizeGraphic />
        </Card>
        {/* <Card
    className="h-full md:col-span-3"
    feature="AI Triage and Tagging"
    title="Stop processing feedback manually"
    description="Eververse automatically tags phrases and insights in feedback into key categories, so you can focus on what matters."
    badge="Coming soon"
  >
    <TagsGraphic />
  </Card> */}
        <Card
          className="h-full md:col-span-3"
          description="Source feedback from popular support tools and use automated sentiment analysis to understand how your customers feel."
          feature="AI Sentiment Analysis"
          title="Empathize with your customers"
        >
          <SentimentGraphic />
        </Card>
        <Card
          className="h-full md:col-span-3"
          description="Eververse can process video and audio feedback, so you can understand your customers in their own words."
          feature="Video and Audio Feedback"
          title="Drop anything into Eververse"
        >
          <MediaFeedbackGraphic />
        </Card>
        <Card
          className="h-full md:col-span-3"
          description="Eververse transcribes audio and video feedback, so you can triage it alongside your text feedback."
          feature="AI Transcription"
          title="Understand feedback in any format"
        >
          <TranscriptionGraphic />
        </Card>
      </div>
    </Container>
  </section>
);
