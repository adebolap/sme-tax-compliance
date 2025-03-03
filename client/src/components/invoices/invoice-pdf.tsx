import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Invoice } from '@shared/schema';
import { format } from 'date-fns';

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  section: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: 100,
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
  },
});

export function InvoicePDF({ invoice }: { invoice: Invoice }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Invoice #{invoice.id}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Client:</Text>
            <Text style={styles.value}>{invoice.clientName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Amount:</Text>
            <Text style={styles.value}>€{Number(invoice.amount).toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>VAT Rate:</Text>
            <Text style={styles.value}>{Number(invoice.vatRate).toFixed(2)}%</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>VAT Amount:</Text>
            <Text style={styles.value}>€{Number(invoice.vatAmount).toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total:</Text>
            <Text style={styles.value}>€{(Number(invoice.amount) + Number(invoice.vatAmount)).toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Issue Date:</Text>
            <Text style={styles.value}>{format(new Date(invoice.issueDate), 'dd/MM/yyyy')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Due Date:</Text>
            <Text style={styles.value}>{format(new Date(invoice.dueDate), 'dd/MM/yyyy')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{invoice.status}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
