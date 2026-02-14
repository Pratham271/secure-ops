import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Join SecureOps<span className="text-primary">AI</span>
          </h1>
          <p className="text-muted-foreground">
            Start automating your incident response today
          </p>
        </div>

        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-card border border-border shadow-lg",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton: "bg-card border border-border text-foreground hover:bg-accent",
              formButtonPrimary: "bg-primary text-primary-foreground hover:opacity-90",
              footerActionLink: "text-primary hover:text-primary/80",
              formFieldInput: "bg-input border-border text-foreground",
              formFieldLabel: "text-foreground",
              identityPreviewText: "text-foreground",
              identityPreviewEditButton: "text-primary",
            },
          }}
        />
      </div>
    </div>
  );
}
