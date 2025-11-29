"use client";

import schema from "@atlaskit/adf-schema/dist/json-schema/v1/full.json";
import Editor from "@monaco-editor/react";
import { convertToAdf } from "@repo/editor/lib/jira";
import Ajv from "ajv-draft-04";

// @ts-expect-error no types
import betterAjvErrors from "better-ajv-errors";
import { useEffect, useState } from "react";

const example = {
  version: 1,
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Hello ",
        },
        {
          type: "text",
          text: "world",
          marks: [
            {
              type: "strong",
            },
          ],
        },
      ],
    },
  ],
};

const ajv = new Ajv({ allErrors: true });

export const Validator = () => {
  const [source, setSource] = useState(JSON.stringify(example, null, 2));
  const [adf, setAdf] = useState(convertToAdf(example));
  const [adfError, setAdfError] = useState<Error | null>(null);
  const [validationErrors, setValidationErrors] = useState<string>("");

  useEffect(() => {
    console.log("Converting");
    try {
      const parsedSource = JSON.parse(source);

      const newAdf = {
        version: 1,
        ...convertToAdf(parsedSource),
      };

      setAdf(newAdf);
      setAdfError(null);
    } catch (error) {
      setAdfError(error as Error);
    }
  }, [source]);

  useEffect(() => {
    console.log("Validating");
    const validate = ajv.compile(schema);
    const isValid = validate(adf);

    if (!isValid && validate.errors) {
      const betterErrors = betterAjvErrors(schema, adf, validate.errors, {
        indent: 2,
      });

      setValidationErrors(betterErrors);
    } else {
      setValidationErrors("");
    }
  }, [adf]);

  return (
    <div className="grid h-screen grid-rows-2 bg-backdrop">
      <main className="mx-4 grid h-full grid-cols-2 gap-4">
        <Editor
          className="my-4 overflow-hidden rounded-lg border bg-background"
          height="100%"
          language="json"
          onChange={(value) => setSource(value ?? "")}
          options={{
            wordWrap: "on",
            minimap: { enabled: false },
          }}
          theme="vs-dark"
          value={source}
        />
        {adfError ? (
          <div>{adfError.message}</div>
        ) : (
          <Editor
            className="my-4 overflow-hidden rounded-lg border bg-background"
            height="100%"
            language="json"
            options={{
              wordWrap: "on",
              minimap: { enabled: false },
              readOnly: true,
            }}
            theme="vs-dark"
            value={JSON.stringify(adf, null, 2)}
          />
        )}
      </main>
      <div className="m-4 flex flex-col gap-4 overflow-auto whitespace-pre rounded-lg border bg-background p-4 font-mono text-foreground">
        {validationErrors}
      </div>
    </div>
  );
};
