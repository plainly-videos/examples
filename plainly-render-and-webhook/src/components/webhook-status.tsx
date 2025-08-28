"use client";

import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader } from "./ui/card";

interface ConfigStatus {
  webhookUrl: string | null;
  webhookEndpoint: string | null;
  isConfigured: boolean;
}

export default function WebhookStatus() {
  const [status, setStatus] = useState<ConfigStatus | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then(setStatus)
      .catch(console.error);
  }, []);

  if (!status) return null;

  return (
    <Card className="w-full max-w-sm min-w-full lg:min-w-3xl">
      <CardHeader className="flex items-center gap-2">
        Webhook Status:
        <Badge variant={status.isConfigured ? "default" : "destructive"}>
          {status.isConfigured ? "Configured" : "Not Configured"}
        </Badge>
      </CardHeader>
      <CardContent>
        {status.isConfigured && status.webhookEndpoint && (
          <div className="text-sm">
            <p className="max-w-prose">
              Endpoint:{" "}
              <code className="p-2 text-muted-foreground bg-background rounded">
                {status.webhookEndpoint}
              </code>
            </p>
          </div>
        )}
        {!status.isConfigured && (
          <p className="text-sm">
            Run{" "}
            <code className="p-2 text-muted-foreground bg-background rounded">
              pnpm dev:full
            </code>{" "}
            to automatically configure webhooks
          </p>
        )}
      </CardContent>
    </Card>
  );
}
