import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FEATURES } from "../data/features";
import MarkdownIt from "markdown-it";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronLeft, ExternalLink } from "lucide-react";

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

export function FeatureInfo() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const feature = FEATURES.find((f) => f.id === id);

  if (!feature) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Feature not found</CardTitle>
            <CardDescription>
              The requested feature information could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate(-1)}
              variant="secondary"
              className="mt-4"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="flex items-center"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Card className={cn("border-t-4", feature.heroColor || "border-primary")}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl">{feature.title}</CardTitle>
            {feature.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          <CardDescription className="text-lg">{feature.short}</CardDescription>
        </CardHeader>
      </Card>

      {feature.sections.map((section, idx) => (
        <Card key={idx} className="overflow-hidden">
          <CardHeader>
            <CardTitle>{section.heading}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="prose prose-slate dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: md.render(section.body) }}
            />

            {section.bullets && (
              <ul className="list-disc pl-5 space-y-2">
                {section.bullets.map((bullet, i) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>
            )}

            {section.demoSteps && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Demo Steps</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  {section.demoSteps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {section.apis && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">API Reference</h3>
                <div className="space-y-2">
                  {section.apis.map((api, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg font-mono text-sm"
                    >
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {api.method}
                      </span>{" "}
                      <span className="text-slate-600 dark:text-slate-300">
                        {api.path}
                      </span>
                      <p className="mt-1 font-sans text-slate-600 dark:text-slate-400">
                        {api.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {section.faqs && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">FAQs</h3>
                <Accordion type="single" collapsible className="w-full">
                  {section.faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`faq-${i}`}>
                      <AccordionTrigger>{faq.q}</AccordionTrigger>
                      <AccordionContent>{faq.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Button onClick={() => navigate(-1)} variant="outline">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button>
              Try Demo
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
