import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Invoice } from "@shared/schema";
import { format } from "date-fns";
import { Download } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { InvoicePDF } from "./invoice-pdf";

interface InvoiceListProps {
  invoices: Invoice[];
}

export function InvoiceList({ invoices }: InvoiceListProps) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>VAT</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>{invoice.clientName}</TableCell>
              <TableCell>€{Number(invoice.amount).toFixed(2)}</TableCell>
              <TableCell>€{Number(invoice.vatAmount).toFixed(2)}</TableCell>
              <TableCell>{format(new Date(invoice.dueDate), "dd/MM/yyyy")}</TableCell>
              <TableCell className="capitalize">{invoice.status}</TableCell>
              <TableCell>
                <PDFDownloadLink
                  document={<InvoicePDF invoice={invoice} />}
                  fileName={`invoice-${invoice.id}.pdf`}
                >
                  {({ loading }) => (
                    <Button variant="ghost" size="icon" disabled={loading}>
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </PDFDownloadLink>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}