import { AddSalesForm } from "./AddSalesForm";

export default function NewSalesPage() {
  return (
    <main className="mx-auto max-w-md p-4 pt-6">
      <h1 className="mb-4 text-lg font-semibold">매출 등록</h1>
      <AddSalesForm />
    </main>
  );
}
