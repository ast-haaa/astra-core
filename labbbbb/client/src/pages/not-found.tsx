import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-xl border-0">
        <CardContent className="pt-12 pb-12 text-center space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-4">
            <AlertCircle className="h-10 w-10 text-amber-600" />
          </div>
          
          <h1 className="text-4xl font-display font-bold text-gray-900">404</h1>
          <p className="text-lg text-gray-600 font-medium">Page Not Found</p>
          <p className="text-sm text-gray-500">The page you are looking for does not exist or has been moved.</p>

          <div className="pt-6">
            <Link href="/">
              <span className="inline-flex items-center justify-center rounded-xl text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-12 px-8 py-2 cursor-pointer">
                Return to Dashboard
              </span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
