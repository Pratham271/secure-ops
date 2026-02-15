'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  description?: string;
}

export function ProcessingClient({ userId }: { userId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const repoParam = searchParams.get('repo');

  const [steps, setSteps] = useState<ProcessingStep[]>([
    {
      id: 'connect',
      label: 'Connecting to MCP Servers',
      status: 'active',
      description: 'Establishing connections to incident feed and GitHub ticketing...',
    },
    {
      id: 'fetch',
      label: 'Fetching Incidents',
      status: 'pending',
      description: 'Retrieving recent incidents from monitoring systems...',
    },
    {
      id: 'triage',
      label: 'AI Triage Analysis',
      status: 'pending',
      description: 'Groq Llama 3.3 70B analyzing incident severity and impact...',
    },
    {
      id: 'tickets',
      label: 'Creating GitHub Tickets',
      status: 'pending',
      description: 'Automatically creating issues for critical incidents...',
    },
    {
      id: 'complete',
      label: 'Processing Complete',
      status: 'pending',
      description: 'Finalizing and redirecting to dashboard...',
    },
  ]);

  const [currentStep, setCurrentStep] = useState(0);
  const [incidentsProcessed, setIncidentsProcessed] = useState(0);
  const [ticketsCreated, setTicketsCreated] = useState(0);

  useEffect(() => {
    // Start the agent
    startAgent();

    // Simulate progress for demo
    const progressTimer = simulateProgress();

    return () => clearInterval(progressTimer);
  }, []);

  const startAgent = async () => {
    try {
      const response = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoFullName: repoParam,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start agent');
      }

      const data = await response.json();
      console.log('Agent started:', data);
    } catch (error) {
      console.error('Error starting agent:', error);
      updateStepStatus(0, 'error');
    }
  };

  const simulateProgress = () => {
    let step = 0;
    const timer = setInterval(() => {
      if (step < steps.length) {
        updateStepStatus(step, 'completed');
        step++;
        if (step < steps.length) {
          updateStepStatus(step, 'active');
          setCurrentStep(step);

          // Update metrics
          if (step === 2) {
            setIncidentsProcessed(5);
          }
          if (step === 3) {
            setTicketsCreated(3);
          }
        } else {
          // All steps complete, redirect
          setTimeout(() => {
            const redirectTo = repoParam
              ? `/dashboard/${repoParam}`
              : '/repos';
            router.push(redirectTo);
          }, 1500);
        }
      }
    }, 3000); // Each step takes 3 seconds

    return timer;
  };

  const updateStepStatus = (
    stepIndex: number,
    status: 'pending' | 'active' | 'completed' | 'error'
  ) => {
    setSteps((prev) =>
      prev.map((step, idx) =>
        idx === stepIndex ? { ...step, status } : step
      )
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-sidebar-primary rounded-full flex items-center justify-center mx-auto mb-6 relative">
          <div className="absolute inset-0 rounded-full animate-ping bg-primary opacity-20" />
          <svg
            className="w-10 h-10 text-primary-foreground animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Processing Incidents
        </h1>
        <p className="text-muted-foreground">
          AI agent is analyzing your incidents and creating tickets...
        </p>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            {incidentsProcessed}
          </div>
          <div className="text-sm text-muted-foreground">
            Incidents Analyzed
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-500 mb-2">
            {ticketsCreated}
          </div>
          <div className="text-sm text-muted-foreground">
            Tickets Created
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-card border border-border rounded-xl p-8">
        <div className="space-y-6">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0">
                {step.status === 'completed' ? (
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                ) : step.status === 'active' ? (
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full animate-ping bg-primary opacity-20" />
                    <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
                  </div>
                ) : step.status === 'error' ? (
                  <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3
                    className={`font-semibold ${
                      step.status === 'completed'
                        ? 'text-green-500'
                        : step.status === 'active'
                        ? 'text-primary'
                        : step.status === 'error'
                        ? 'text-red-500'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </h3>
                  {step.status === 'active' && (
                    <span className="text-xs text-primary animate-pulse">
                      In progress...
                    </span>
                  )}
                </div>
                {step.description && (
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                )}

                {/* Progress bar for active step */}
                {step.status === 'active' && (
                  <div className="mt-3 w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-primary rounded-full animate-progress-bar" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 flex items-start gap-3">
        <svg
          className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
          />
        </svg>
        <div className="flex-1">
          <p className="text-sm text-primary font-medium mb-1">
            Secure Processing
          </p>
          <p className="text-xs text-primary/80">
            All incident data is processed through our dual-LLM security
            quarantine to prevent prompt injection attacks.
          </p>
        </div>
      </div>
    </div>
  );
}
