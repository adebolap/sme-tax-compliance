import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/navbar";
import { InvoiceList } from "@/components/invoices/invoice-list";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Invoice } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const totalInvoiceAmount = invoices?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
  const totalVatAmount = invoices?.reduce((sum, inv) => sum + Number(inv.vatAmount), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Welcome, {user?.companyName}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{invoices?.length || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">€{totalInvoiceAmount.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total VAT</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">€{totalVatAmount.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Create Invoice</h2>
            <InvoiceForm />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Recent Invoices</h2>
            <InvoiceList invoices={invoices || []} />
          </div>
        </div>
      </main>
    </div>
  );
}
