import CardFormPage from "@/components/CardFormPage";

export default function EditCardPage({ params }) {
  return <CardFormPage cardId={params?.id} />;
}
