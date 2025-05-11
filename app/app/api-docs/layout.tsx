import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentação da API | To-Do List",
  description: "Documentação da API da aplicação To-Do List para desenvolvedores",
};

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto">
      {children}
    </div>
  );
} 